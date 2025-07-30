import { Page, BrowserContext } from '@playwright/test'
import { BaseModule } from '../base/BaseModule'

export interface TestStep {
  name: string
  moduleClass: new (page: Page, config?: any) => BaseModule
  action: string | ((module: BaseModule) => Promise<any>)
  config?: any
  dependencies?: string[]
  optional?: boolean
  retries?: number
  timeout?: number
}

export interface SequenceResult {
  stepName: string
  success: boolean
  result?: any
  error?: string
  duration: number
  retryCount: number
}

export interface SequenceOptions {
  bailOnError?: boolean
  maxRetries?: number
  stepTimeout?: number
  parallelSteps?: boolean
  cleanup?: boolean
}

export class TestSequence {
  private steps: TestStep[] = []
  private modules: Map<string, BaseModule> = new Map()
  private results: SequenceResult[] = []
  private page: Page | null = null
  private context: BrowserContext | null = null

  constructor(private options: SequenceOptions = {}) {
    this.options = {
      bailOnError: true,
      maxRetries: 3,
      stepTimeout: 30000,
      parallelSteps: false,
      cleanup: true,
      ...options
    }
  }

  /**
   * Add a test step to the sequence
   */
  step(
    name: string,
    moduleClass: new (page: Page, config?: any) => BaseModule,
    action: string | ((module: BaseModule) => Promise<any>),
    config?: any
  ): TestSequence {
    this.steps.push({
      name,
      moduleClass,
      action,
      config,
      optional: false,
      retries: this.options.maxRetries
    })
    return this
  }

  /**
   * Add an optional step that won't fail the sequence
   */
  optionalStep(
    name: string,
    moduleClass: new (page: Page, config?: any) => BaseModule,
    action: string | ((module: BaseModule) => Promise<any>),
    config?: any
  ): TestSequence {
    this.steps.push({
      name,
      moduleClass,
      action,
      config,
      optional: true,
      retries: 1
    })
    return this
  }

  /**
   * Add a step with dependencies
   */
  stepWithDependencies(
    name: string,
    moduleClass: new (page: Page, config?: any) => BaseModule,
    action: string | ((module: BaseModule) => Promise<any>),
    dependencies: string[],
    config?: any
  ): TestSequence {
    this.steps.push({
      name,
      moduleClass,
      action,
      config,
      dependencies,
      optional: false,
      retries: this.options.maxRetries
    })
    return this
  }

  /**
   * Execute the test sequence
   */
  async execute(page: Page, context?: BrowserContext): Promise<SequenceResult[]> {
    this.page = page
    this.context = context || page.context()
    this.results = []

    console.log(`Starting test sequence with ${this.steps.length} steps`)

    try {
      if (this.options.parallelSteps) {
        await this.executeParallel()
      } else {
        await this.executeSequential()
      }
    } finally {
      if (this.options.cleanup) {
        await this.cleanup()
      }
    }

    return this.results
  }

  /**
   * Execute steps sequentially
   */
  private async executeSequential(): Promise<void> {
    for (const step of this.steps) {
      if (this.shouldSkipStep(step)) {
        continue
      }

      const result = await this.executeStep(step)
      this.results.push(result)

      if (!result.success && !step.optional && this.options.bailOnError) {
        console.log(`Sequence failed at step: ${step.name}`)
        break
      }
    }
  }

  /**
   * Execute steps in parallel (where possible)
   */
  private async executeParallel(): Promise<void> {
    const executed: Set<string> = new Set()
    const executing: Set<string> = new Set()

    while (executed.size < this.steps.length) {
      // Find steps ready to execute
      const readySteps = this.steps.filter(step => 
        !executed.has(step.name) && 
        !executing.has(step.name) &&
        this.areDependenciesMet(step, executed) &&
        !this.shouldSkipStep(step)
      )

      if (readySteps.length === 0) {
        // Check if we're waiting for executing steps
        if (executing.size > 0) {
          await new Promise(resolve => setTimeout(resolve, 100))
          continue
        } else {
          // Deadlock or no more steps
          break
        }
      }

      // Execute ready steps in parallel
      const stepPromises = readySteps.map(async step => {
        executing.add(step.name)
        try {
          const result = await this.executeStep(step)
          this.results.push(result)
          return result
        } finally {
          executing.delete(step.name)
          executed.add(step.name)
        }
      })

      const results = await Promise.allSettled(stepPromises)
      
      // Check for failures
      if (this.options.bailOnError) {
        const failures = results.filter(r => 
          r.status === 'fulfilled' && 
          !r.value.success && 
          !this.steps.find(s => s.name === r.value.stepName)?.optional
        )
        
        if (failures.length > 0) {
          console.log('Parallel execution failed, stopping sequence')
          break
        }
      }
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(step: TestStep): Promise<SequenceResult> {
    const startTime = Date.now()
    let retryCount = 0
    let lastError: string | undefined

    console.log(`Executing step: ${step.name}`)

    for (let attempt = 0; attempt <= (step.retries || 0); attempt++) {
      try {
        const module = await this.getOrCreateModule(step)
        let result: any

        if (typeof step.action === 'string') {
          // Call method by name
          const method = (module as any)[step.action]
          if (typeof method !== 'function') {
            throw new Error(`Method '${step.action}' not found on module`)
          }
          result = await method.call(module)
        } else {
          // Call function
          result = await step.action(module)
        }

        return {
          stepName: step.name,
          success: true,
          result,
          duration: Date.now() - startTime,
          retryCount: attempt
        }
      } catch (error) {
        lastError = error.message
        retryCount = attempt

        if (attempt < (step.retries || 0)) {
          console.log(`Step ${step.name} failed (attempt ${attempt + 1}), retrying...`)
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
        }
      }
    }

    return {
      stepName: step.name,
      success: false,
      error: lastError,
      duration: Date.now() - startTime,
      retryCount
    }
  }

  /**
   * Get or create module instance
   */
  private async getOrCreateModule(step: TestStep): Promise<BaseModule> {
    const moduleName = step.moduleClass.name
    
    if (this.modules.has(moduleName)) {
      return this.modules.get(moduleName)!
    }

    const module = new step.moduleClass(this.page!, step.config)
    
    // Set up dependencies
    if (step.dependencies) {
      for (const depName of step.dependencies) {
        const depModule = this.modules.get(depName)
        if (depModule) {
          module.addDependency(depName.toLowerCase(), depModule)
        }
      }
    }

    await module.initialize()
    this.modules.set(moduleName, module)
    return module
  }

  /**
   * Check if dependencies are met
   */
  private areDependenciesMet(step: TestStep, executed: Set<string>): boolean {
    if (!step.dependencies) return true
    
    return step.dependencies.every(dep => {
      // Check if a step with this dependency has been executed successfully
      const depStep = this.steps.find(s => s.moduleClass.name === dep)
      return depStep ? executed.has(depStep.name) : true
    })
  }

  /**
   * Check if step should be skipped
   */
  private shouldSkipStep(step: TestStep): boolean {
    // Skip if previous required steps failed
    if (this.options.bailOnError) {
      const hasFailures = this.results.some(r => !r.success && !this.isStepOptional(r.stepName))
      return hasFailures
    }
    return false
  }

  /**
   * Check if step is optional
   */
  private isStepOptional(stepName: string): boolean {
    const step = this.steps.find(s => s.name === stepName)
    return step?.optional || false
  }

  /**
   * Get sequence results
   */
  getResults(): SequenceResult[] {
    return this.results
  }

  /**
   * Get success rate
   */
  getSuccessRate(): number {
    if (this.results.length === 0) return 0
    const successful = this.results.filter(r => r.success).length
    return (successful / this.results.length) * 100
  }

  /**
   * Get total execution time
   */
  getTotalDuration(): number {
    return this.results.reduce((sum, r) => sum + r.duration, 0)
  }

  /**
   * Check if sequence completed successfully
   */
  isSuccessful(): boolean {
    const requiredSteps = this.results.filter(r => !this.isStepOptional(r.stepName))
    return requiredSteps.every(r => r.success)
  }

  /**
   * Get failed steps
   */
  getFailedSteps(): SequenceResult[] {
    return this.results.filter(r => !r.success)
  }

  /**
   * Get module by name
   */
  getModule<T extends BaseModule>(moduleName: string): T | undefined {
    return this.modules.get(moduleName) as T
  }

  /**
   * Clean up all modules
   */
  private async cleanup(): Promise<void> {
    console.log('Cleaning up test sequence modules')
    
    for (const [name, module] of this.modules) {
      try {
        await module.cleanup()
      } catch (error) {
        console.error(`Error cleaning up module ${name}:`, error)
      }
    }
    
    this.modules.clear()
  }

  /**
   * Create a new sequence with common setup steps
   */
  static createStandardSequence(options?: SequenceOptions): TestSequence {
    return new TestSequence(options)
  }

  /**
   * Create a payment flow sequence
   */
  static createPaymentFlowSequence(): TestSequence {
    const { AuthModule } = require('../auth/AuthModule')
    const { OrganizationModule } = require('../organization/OrganizationModule')
    const { StripeModule } = require('../billing/StripeModule')
    const { PaymentFlowModule } = require('../billing/PaymentFlowModule')

    return new TestSequence()
      .step('setup-auth', AuthModule, 'setupTestUser')
      .step('setup-organization', OrganizationModule, 'setupOrganization')
      .step('complete-payment', PaymentFlowModule, 'basicSubscriptionFlow', { planType: 'starter' })
  }

  /**
   * Create a comprehensive billing sequence
   */
  static createBillingTestSequence(): TestSequence {
    const { AuthModule } = require('../auth/AuthModule')
    const { OrganizationModule } = require('../organization/OrganizationModule')
    const { StripeModule } = require('../billing/StripeModule')
    const { PaymentFlowModule } = require('../billing/PaymentFlowModule')
    const { WebhookModule } = require('../billing/WebhookModule')

    return new TestSequence()
      .step('setup-auth', AuthModule, 'setupTestUser')
      .step('setup-organization', OrganizationModule, 'setupOrganization')
      .step('test-subscription', PaymentFlowModule, 'basicSubscriptionFlow')
      .step('test-upgrade', PaymentFlowModule, 'subscriptionUpgradeFlow', { fromPlan: 'starter', toPlan: 'pro' })
      .step('test-webhooks', WebhookModule, 'runWebhookTestSuite')
      .optionalStep('test-cancellation', PaymentFlowModule, 'subscriptionCancellationFlow')
  }

  /**
   * Wait for all steps to complete
   */
  async waitForCompletion(): Promise<void> {
    while (this.results.length < this.steps.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  /**
   * Generate execution report
   */
  generateReport(): {
    summary: {
      totalSteps: number
      successful: number
      failed: number
      optional: number
      totalDuration: number
      successRate: number
    }
    steps: SequenceResult[]
    failures: SequenceResult[]
  } {
    const optionalCount = this.results.filter(r => this.isStepOptional(r.stepName)).length
    
    return {
      summary: {
        totalSteps: this.results.length,
        successful: this.results.filter(r => r.success).length,
        failed: this.results.filter(r => !r.success).length,
        optional: optionalCount,
        totalDuration: this.getTotalDuration(),
        successRate: this.getSuccessRate()
      },
      steps: this.results,
      failures: this.getFailedSteps()
    }
  }
}