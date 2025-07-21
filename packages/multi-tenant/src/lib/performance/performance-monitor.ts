import type { TenantContext } from '../../middleware/tenant-context'

export interface PerformanceMetrics {
  requestDuration: number
  memoryUsage: number
  cpuUsage?: number
  timestamp: number
  endpoint: string
  organizationId: string
  userId?: string
}

export interface CacheMetrics {
  hits: number
  misses: number
  hitRate: number
  evictions: number
  size: number
}

/**
 * Performance monitoring and optimization utilities
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, PerformanceMetrics[]> = new Map()
  private cacheMetrics: Map<string, CacheMetrics> = new Map()
  private readonly maxMetricsPerEndpoint = 1000
  private readonly retentionMs = 24 * 60 * 60 * 1000 // 24 hours

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * Record performance metrics for a request
   */
  recordMetrics(
    endpoint: string,
    context: TenantContext,
    startTime: number,
    endTime: number
  ): void {
    const metrics: PerformanceMetrics = {
      requestDuration: endTime - startTime,
      memoryUsage: process.memoryUsage().heapUsed,
      timestamp: endTime,
      endpoint,
      organizationId: context.organizationId,
      userId: context.userId
    }

    const key = `${context.organizationId}:${endpoint}`
    const existing = this.metrics.get(key) || []
    
    // Add new metric
    existing.push(metrics)
    
    // Keep only recent metrics
    const cutoff = Date.now() - this.retentionMs
    const filtered = existing
      .filter(m => m.timestamp > cutoff)
      .slice(-this.maxMetricsPerEndpoint)
    
    this.metrics.set(key, filtered)
  }

  /**
   * Get performance statistics for an organization/endpoint
   */
  getStats(organizationId: string, endpoint?: string): {
    avg: number
    min: number
    max: number
    count: number
    p95: number
    p99: number
  } {
    const pattern = endpoint ? `${organizationId}:${endpoint}` : `${organizationId}:`
    const allMetrics: PerformanceMetrics[] = []

    for (const [key, metrics] of this.metrics.entries()) {
      if (key.startsWith(pattern)) {
        allMetrics.push(...metrics)
      }
    }

    if (allMetrics.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0, p95: 0, p99: 0 }
    }

    const durations = allMetrics.map(m => m.requestDuration).sort((a, b) => a - b)
    const sum = durations.reduce((a, b) => a + b, 0)
    
    const p95Index = Math.floor(durations.length * 0.95)
    const p99Index = Math.floor(durations.length * 0.99)

    return {
      avg: sum / durations.length,
      min: durations[0],
      max: durations[durations.length - 1],
      count: durations.length,
      p95: durations[p95Index] || 0,
      p99: durations[p99Index] || 0
    }
  }

  /**
   * Update cache metrics
   */
  updateCacheMetrics(cacheKey: string, hit: boolean, eviction = false): void {
    const existing = this.cacheMetrics.get(cacheKey) || {
      hits: 0,
      misses: 0,
      hitRate: 0,
      evictions: 0,
      size: 0
    }

    if (hit) {
      existing.hits++
    } else {
      existing.misses++
    }

    if (eviction) {
      existing.evictions++
    }

    const total = existing.hits + existing.misses
    existing.hitRate = total > 0 ? existing.hits / total : 0

    this.cacheMetrics.set(cacheKey, existing)
  }

  /**
   * Get cache statistics
   */
  getCacheStats(cacheKey?: string): Map<string, CacheMetrics> {
    if (cacheKey) {
      const metrics = this.cacheMetrics.get(cacheKey)
      return metrics ? new Map([[cacheKey, metrics]]) : new Map()
    }
    return new Map(this.cacheMetrics)
  }

  /**
   * Detect slow endpoints
   */
  getSlowEndpoints(organizationId: string, threshold = 1000): string[] {
    const slowEndpoints: string[] = []
    
    for (const [key, metrics] of this.metrics.entries()) {
      if (!key.startsWith(`${organizationId}:`)) continue
      
      const endpoint = key.split(':')[1]
      const recentMetrics = metrics.filter(
        m => m.timestamp > Date.now() - 5 * 60 * 1000 // Last 5 minutes
      )
      
      if (recentMetrics.length === 0) continue
      
      const avgDuration = recentMetrics.reduce((sum, m) => sum + m.requestDuration, 0) / recentMetrics.length
      
      if (avgDuration > threshold) {
        slowEndpoints.push(endpoint)
      }
    }
    
    return slowEndpoints
  }

  /**
   * Clean up old metrics
   */
  cleanup(): void {
    const cutoff = Date.now() - this.retentionMs
    
    for (const [key, metrics] of this.metrics.entries()) {
      const filtered = metrics.filter(m => m.timestamp > cutoff)
      
      if (filtered.length === 0) {
        this.metrics.delete(key)
      } else {
        this.metrics.set(key, filtered)
      }
    }
  }

  /**
   * Generate performance report
   */
  generateReport(organizationId: string): {
    overview: {
      totalRequests: number
      avgResponseTime: number
      slowEndpoints: string[]
    }
    endpoints: Record<string, any>
    cache: Record<string, CacheMetrics>
  } {
    const endpointStats: Record<string, any> = {}
    const cacheStats: Record<string, CacheMetrics> = {}
    let totalRequests = 0
    let totalDuration = 0

    // Collect endpoint statistics
    for (const [key, metrics] of this.metrics.entries()) {
      if (!key.startsWith(`${organizationId}:`)) continue
      
      const endpoint = key.split(':')[1]
      const durations = metrics.map(m => m.requestDuration)
      const sum = durations.reduce((a, b) => a + b, 0)
      
      endpointStats[endpoint] = {
        requests: durations.length,
        avgResponseTime: durations.length > 0 ? sum / durations.length : 0,
        minResponseTime: Math.min(...durations),
        maxResponseTime: Math.max(...durations),
        recentErrors: metrics.filter(
          m => m.timestamp > Date.now() - 60 * 60 * 1000 // Last hour
        ).length
      }
      
      totalRequests += durations.length
      totalDuration += sum
    }

    // Collect cache statistics
    for (const [key, metrics] of this.cacheMetrics.entries()) {
      if (key.includes(organizationId)) {
        cacheStats[key] = metrics
      }
    }

    return {
      overview: {
        totalRequests,
        avgResponseTime: totalRequests > 0 ? totalDuration / totalRequests : 0,
        slowEndpoints: this.getSlowEndpoints(organizationId)
      },
      endpoints: endpointStats,
      cache: cacheStats
    }
  }
}

/**
 * Performance monitoring middleware
 */
export function withPerformanceMonitoring() {
  return function(
    handler: (req: Request, context: TenantContext) => Promise<Response>
  ) {
    return async (req: Request, context: TenantContext) => {
      const monitor = PerformanceMonitor.getInstance()
      const startTime = performance.now()
      
      try {
        const response = await handler(req, context)
        const endTime = performance.now()
        
        // Record performance metrics
        const endpoint = new URL(req.url).pathname
        monitor.recordMetrics(endpoint, context, startTime, endTime)
        
        // Add performance headers
        response.headers.set('X-Response-Time', `${(endTime - startTime).toFixed(2)}ms`)
        
        return response
      } catch (error) {
        const endTime = performance.now()
        const endpoint = new URL(req.url).pathname
        
        // Still record metrics for failed requests
        monitor.recordMetrics(endpoint, context, startTime, endTime)
        
        throw error
      }
    }
  }
}

/**
 * Simple LRU cache with performance monitoring
 */
export class MonitoredCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>()
  private monitor = PerformanceMonitor.getInstance()
  private maxSize: number
  private ttl: number
  private cacheKey: string

  constructor(maxSize = 1000, ttlMs = 5 * 60 * 1000, cacheKey = 'default') {
    this.maxSize = maxSize
    this.ttl = ttlMs
    this.cacheKey = cacheKey
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key)
    const now = Date.now()
    
    if (!entry) {
      this.monitor.updateCacheMetrics(this.cacheKey, false)
      return undefined
    }
    
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      this.monitor.updateCacheMetrics(this.cacheKey, false)
      return undefined
    }
    
    // Move to end (LRU)
    this.cache.delete(key)
    this.cache.set(key, entry)
    
    this.monitor.updateCacheMetrics(this.cacheKey, true)
    return entry.value
  }

  set(key: string, value: T): void {
    const now = Date.now()
    
    // Remove oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
        this.monitor.updateCacheMetrics(this.cacheKey, false, true)
      }
    }
    
    this.cache.set(key, { value, timestamp: now })
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    const now = Date.now()
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    // Clean expired entries first
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key)
      }
    }
    return this.cache.size
  }
}

/**
 * Database query performance optimizer
 */
export class QueryOptimizer {
  private static slowQueries = new Map<string, number>()
  
  /**
   * Record slow query for optimization
   */
  static recordSlowQuery(query: string, duration: number): void {
    const queryHash = this.hashQuery(query)
    const existing = this.slowQueries.get(queryHash) || 0
    this.slowQueries.set(queryHash, Math.max(existing, duration))
  }
  
  /**
   * Get optimization suggestions
   */
  static getOptimizationSuggestions(): string[] {
    const suggestions: string[] = []
    
    for (const [queryHash, duration] of this.slowQueries.entries()) {
      if (duration > 1000) { // > 1 second
        suggestions.push(`Consider optimizing query ${queryHash.slice(0, 8)} (${duration}ms)`)
      }
    }
    
    return suggestions
  }
  
  private static hashQuery(query: string): string {
    // Simple hash function for query identification
    let hash = 0
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }
}

/**
 * Automatic cleanup task (call periodically)
 */
export function runPerformanceCleanup(): void {
  const monitor = PerformanceMonitor.getInstance()
  monitor.cleanup()
}