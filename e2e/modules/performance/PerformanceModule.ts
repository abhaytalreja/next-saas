import { BaseModule, ModuleDependency } from '../base/BaseModule'

export interface PerformanceConfig {
  loadTestDuration?: number
  concurrentUsers?: number
  targetResponseTime?: number
  memoryThreshold?: number
  cpuThreshold?: number
  enableRealTimeMonitoring?: boolean
}

export interface PerformanceMetrics {
  responseTime: {
    min: number
    max: number
    avg: number
    p95: number
    p99: number
  }
  throughput: {
    requestsPerSecond: number
    totalRequests: number
  }
  errors: {
    count: number
    rate: number
    types: Record<string, number>
  }
  resources: {
    memoryUsage: number
    cpuUsage: number
    networkUsage: number
  }
  timing: {
    startTime: number
    endTime: number
    duration: number
  }
}

export interface LoadTestResult {
  testName: string
  success: boolean
  metrics: PerformanceMetrics
  error?: string
}

export class PerformanceModule extends BaseModule {
  private metrics: PerformanceMetrics[] = []
  private loadTestResults: LoadTestResult[] = []

  constructor(page, config: PerformanceConfig = {}) {
    super(page, {
      loadTestDuration: 30000, // 30 seconds
      concurrentUsers: 10,
      targetResponseTime: 2000, // 2 seconds
      memoryThreshold: 100 * 1024 * 1024, // 100MB
      cpuThreshold: 80, // 80%
      enableRealTimeMonitoring: true,
      ...config
    })
  }

  protected getDependencies(): ModuleDependency[] {
    return [] // Performance module can work independently
  }

  protected async setup(): Promise<void> {
    this.log('Initializing performance module')
    
    if (this.config.enableRealTimeMonitoring) {
      await this.setupPerformanceMonitoring()
    }
  }

  /**
   * Setup performance monitoring
   */
  private async setupPerformanceMonitoring(): Promise<void> {
    await this.page.addInitScript(() => {
      // Setup performance observers
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            if (entry.entryType === 'navigation') {
              (window as any).performanceData = {
                ...((window as any).performanceData || {}),
                navigation: entry.toJSON()
              }
            } else if (entry.entryType === 'resource') {
              (window as any).performanceData = {
                ...((window as any).performanceData || {}),
                resources: [
                  ...((window as any).performanceData?.resources || []),
                  entry.toJSON()
                ]
              }
            }
          })
        })
        
        observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] })
      }

      // Memory monitoring
      if ('memory' in performance) {
        setInterval(() => {
          (window as any).performanceData = {
            ...((window as any).performanceData || {}),
            memory: (performance as any).memory
          }
        }, 1000)
      }
    })
  }

  /**
   * Measure page load performance
   */
  async measurePageLoad(url: string): Promise<PerformanceMetrics> {
    const startTime = Date.now()
    
    await this.navigateTo(url)
    await this.waitForNetworkIdle()
    
    const endTime = Date.now()
    
    // Get performance data from browser
    const performanceData = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const resources = performance.getEntriesByType('resource')
      
      return {
        navigation: navigation ? {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstByte: navigation.responseStart - navigation.requestStart,
          domInteractive: navigation.domInteractive - navigation.navigationStart,
          totalTime: navigation.loadEventEnd - navigation.navigationStart
        } : null,
        resources: resources.map(r => ({
          name: r.name,
          duration: r.duration,
          size: (r as any).transferSize || 0
        })),
        memory: (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit
        } : null
      }
    })

    const metrics: PerformanceMetrics = {
      responseTime: {
        min: performanceData.navigation?.firstByte || 0,
        max: performanceData.navigation?.totalTime || 0,
        avg: performanceData.navigation?.totalTime || 0,
        p95: performanceData.navigation?.totalTime || 0,
        p99: performanceData.navigation?.totalTime || 0
      },
      throughput: {
        requestsPerSecond: 1 / ((endTime - startTime) / 1000),
        totalRequests: 1 + performanceData.resources.length
      },
      errors: {
        count: 0,
        rate: 0,
        types: {}
      },
      resources: {
        memoryUsage: performanceData.memory?.used || 0,
        cpuUsage: 0, // Would need additional monitoring
        networkUsage: performanceData.resources.reduce((sum, r) => sum + r.size, 0)
      },
      timing: {
        startTime,
        endTime,
        duration: endTime - startTime
      }
    }

    this.metrics.push(metrics)
    return metrics
  }

  /**
   * Run load test on payment flow
   */
  async loadTestPaymentFlow(concurrentUsers?: number): Promise<LoadTestResult> {
    const testName = 'payment-flow-load-test'
    const users = concurrentUsers || this.config.concurrentUsers
    const startTime = Date.now()
    
    this.log(`Starting load test with ${users} concurrent users`)

    try {
      // Create multiple concurrent payment flows
      const userPromises = Array.from({ length: users }, async (_, index) => {
        const startUserTime = Date.now()
        let success = true
        let error: string | undefined

        try {
          // Simulate payment flow steps
          await this.navigateTo('/pricing')
          await this.wait(100 + Math.random() * 500) // Simulate user reading
          
          await this.clickElement('[data-testid="subscribe-starter-button"]')
          await this.waitForNetworkIdle()
          
          await this.wait(200 + Math.random() * 800) // Simulate form filling
          
          const endUserTime = Date.now()
          return {
            userId: index,
            success,
            responseTime: endUserTime - startUserTime,
            error
          }
        } catch (err) {
          success = false
          error = err.message
          return {
            userId: index,
            success,
            responseTime: Date.now() - startUserTime,
            error
          }
        }
      })

      const userResults = await Promise.all(userPromises)
      const endTime = Date.now()
      
      // Calculate metrics
      const responseTimes = userResults.map(r => r.responseTime)
      const successfulUsers = userResults.filter(r => r.success)
      const failedUsers = userResults.filter(r => !r.success)
      
      responseTimes.sort((a, b) => a - b)
      
      const metrics: PerformanceMetrics = {
        responseTime: {
          min: Math.min(...responseTimes),
          max: Math.max(...responseTimes),
          avg: responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length,
          p95: responseTimes[Math.floor(responseTimes.length * 0.95)] || 0,
          p99: responseTimes[Math.floor(responseTimes.length * 0.99)] || 0
        },
        throughput: {
          requestsPerSecond: users / ((endTime - startTime) / 1000),
          totalRequests: users
        },
        errors: {
          count: failedUsers.length,
          rate: (failedUsers.length / users) * 100,
          types: failedUsers.reduce((acc, user) => {
            const errorType = user.error?.split(':')[0] || 'unknown'
            acc[errorType] = (acc[errorType] || 0) + 1
            return acc
          }, {} as Record<string, number>)
        },
        resources: {
          memoryUsage: 0, // Would need monitoring
          cpuUsage: 0,
          networkUsage: 0
        },
        timing: {
          startTime,
          endTime,
          duration: endTime - startTime
        }
      }

      const result: LoadTestResult = {
        testName,
        success: metrics.errors.rate < 10, // Less than 10% error rate
        metrics
      }

      this.loadTestResults.push(result)
      this.log(`Load test completed: ${result.success ? 'PASSED' : 'FAILED'}`)
      
      return result
    } catch (error) {
      const result: LoadTestResult = {
        testName,
        success: false,
        metrics: this.getEmptyMetrics(),
        error: error.message
      }

      this.loadTestResults.push(result)
      return result
    }
  }

  /**
   * Measure API response times
   */
  async measureAPIPerformance(endpoints: string[]): Promise<Record<string, PerformanceMetrics>> {
    const results: Record<string, PerformanceMetrics> = {}
    
    for (const endpoint of endpoints) {
      const measurements: number[] = []
      const testCount = 10 // Test each endpoint 10 times
      
      for (let i = 0; i < testCount; i++) {
        const startTime = Date.now()
        
        try {
          const response = await this.page.request.get(endpoint)
          const endTime = Date.now()
          
          if (response.ok()) {
            measurements.push(endTime - startTime)
          }
        } catch (error) {
          // Record failed requests as max timeout
          measurements.push(this.config.targetResponseTime * 2)
        }
        
        // Small delay between requests
        await this.wait(100)
      }
      
      measurements.sort((a, b) => a - b)
      
      results[endpoint] = {
        responseTime: {
          min: Math.min(...measurements),
          max: Math.max(...measurements),
          avg: measurements.reduce((sum, t) => sum + t, 0) / measurements.length,
          p95: measurements[Math.floor(measurements.length * 0.95)] || 0,
          p99: measurements[Math.floor(measurements.length * 0.99)] || 0
        },
        throughput: {
          requestsPerSecond: testCount / (measurements.reduce((sum, t) => sum + t, 0) / 1000),
          totalRequests: testCount
        },
        errors: {
          count: measurements.filter(t => t >= this.config.targetResponseTime * 2).length,
          rate: (measurements.filter(t => t >= this.config.targetResponseTime * 2).length / testCount) * 100,
          types: {}
        },
        resources: {
          memoryUsage: 0,
          cpuUsage: 0,
          networkUsage: 0
        },
        timing: {
          startTime: Date.now() - measurements.reduce((sum, t) => sum + t, 0),
          endTime: Date.now(),
          duration: measurements.reduce((sum, t) => sum + t, 0)
        }
      }
    }
    
    return results
  }

  /**
   * Monitor memory usage during test
   */
  async monitorMemoryUsage(duration: number = 30000): Promise<number[]> {
    const measurements: number[] = []
    const interval = 1000 // Measure every second
    const iterations = Math.floor(duration / interval)
    
    for (let i = 0; i < iterations; i++) {
      const memory = await this.page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0
      })
      
      measurements.push(memory)
      await this.wait(interval)
    }
    
    return measurements
  }

  /**
   * Test payment flow performance under stress
   */
  async stressTestPaymentFlow(): Promise<LoadTestResult> {
    // Gradually increase load
    const stressLevels = [5, 10, 20, 30]
    let lastSuccessfulLevel = 0
    
    for (const level of stressLevels) {
      this.log(`Testing stress level: ${level} concurrent users`)
      
      const result = await this.loadTestPaymentFlow(level)
      
      if (result.success) {
        lastSuccessfulLevel = level
      } else {
        this.log(`System failed at ${level} concurrent users`)
        break
      }
      
      // Wait between stress levels
      await this.wait(5000)
    }
    
    return {
      testName: 'payment-flow-stress-test',
      success: lastSuccessfulLevel >= 10, // Minimum acceptable level
      metrics: this.getEmptyMetrics(),
      error: lastSuccessfulLevel < 10 ? `System failed below acceptable level (${lastSuccessfulLevel})` : undefined
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    avgResponseTime: number
    maxResponseTime: number
    totalTests: number
    passedTests: number
    failedTests: number
    performanceScore: number
  } {
    if (this.metrics.length === 0) {
      return {
        avgResponseTime: 0,
        maxResponseTime: 0,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        performanceScore: 0
      }
    }

    const avgResponseTime = this.metrics.reduce((sum, m) => sum + m.responseTime.avg, 0) / this.metrics.length
    const maxResponseTime = Math.max(...this.metrics.map(m => m.responseTime.max))
    const totalTests = this.loadTestResults.length
    const passedTests = this.loadTestResults.filter(r => r.success).length
    const failedTests = totalTests - passedTests
    
    // Calculate performance score (0-100)
    const responseTimeScore = Math.max(0, 100 - (avgResponseTime / this.config.targetResponseTime) * 50)
    const reliabilityScore = totalTests > 0 ? (passedTests / totalTests) * 100 : 100
    const performanceScore = (responseTimeScore + reliabilityScore) / 2

    return {
      avgResponseTime,
      maxResponseTime,
      totalTests,
      passedTests,
      failedTests,
      performanceScore
    }
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(): {
    summary: ReturnType<typeof this.getPerformanceSummary>
    metrics: PerformanceMetrics[]
    loadTests: LoadTestResult[]
    recommendations: string[]
  } {
    const summary = this.getPerformanceSummary()
    const recommendations: string[] = []

    // Generate recommendations based on results
    if (summary.avgResponseTime > this.config.targetResponseTime) {
      recommendations.push(`Average response time (${summary.avgResponseTime}ms) exceeds target (${this.config.targetResponseTime}ms)`)
    }

    if (summary.performanceScore < 80) {
      recommendations.push('Overall performance score is below 80%. Consider optimization.')
    }

    if (summary.failedTests > 0) {
      recommendations.push(`${summary.failedTests} performance tests failed. Review error logs.`)
    }

    return {
      summary,
      metrics: this.metrics,
      loadTests: this.loadTestResults,
      recommendations
    }
  }

  /**
   * Get empty metrics template
   */
  private getEmptyMetrics(): PerformanceMetrics {
    return {
      responseTime: { min: 0, max: 0, avg: 0, p95: 0, p99: 0 },
      throughput: { requestsPerSecond: 0, totalRequests: 0 },
      errors: { count: 0, rate: 0, types: {} },
      resources: { memoryUsage: 0, cpuUsage: 0, networkUsage: 0 },
      timing: { startTime: 0, endTime: 0, duration: 0 }
    }
  }

  /**
   * Clear performance data
   */
  clearMetrics(): void {
    this.metrics = []
    this.loadTestResults = []
  }

  protected async teardown(): Promise<void> {
    this.clearMetrics()
  }

  /**
   * Health check for performance module
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Test basic performance measurement capability
      await this.measurePageLoad('/')
      return true
    } catch {
      return false
    }
  }
}