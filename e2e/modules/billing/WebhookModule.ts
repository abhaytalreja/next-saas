import { BaseModule, ModuleDependency } from '../base/BaseModule'
import { TestDataManager } from '../base/TestData'

export interface WebhookConfig {
  baseURL?: string
  webhookEndpoint?: string
  webhookSecret?: string
  timeoutMs?: number
  retryAttempts?: number
  enableRealWebhooks?: boolean
}

export interface WebhookTestResult {
  eventType: string
  success: boolean
  responseStatus: number
  responseTime: number
  error?: string
  retryCount?: number
}

export class WebhookModule extends BaseModule {
  private testData: TestDataManager
  private webhookResults: WebhookTestResult[] = []
  private webhookServer: any = null

  constructor(page, config: WebhookConfig = {}) {
    super(page, {
      baseURL: 'http://localhost:3010',
      webhookEndpoint: '/api/billing/webhooks',
      webhookSecret: 'whsec_test_secret',
      timeoutMs: 10000,
      retryAttempts: 3,
      enableRealWebhooks: false,
      ...config
    })
    this.testData = TestDataManager.getInstance()
  }

  protected getDependencies(): ModuleDependency[] {
    return [] // Webhook module can work independently
  }

  protected async setup(): Promise<void> {
    this.log('Initializing webhook module')
    
    if (this.config.enableRealWebhooks) {
      await this.setupWebhookServer()
    }
  }

  /**
   * Test checkout session completed webhook
   */
  async testCheckoutSessionCompleted(sessionData?: any): Promise<WebhookTestResult> {
    const eventType = 'checkout.session.completed'
    this.log('Testing webhook event', eventType)

    const startTime = Date.now()
    
    try {
      const session = sessionData || this.testData.generateCheckoutSession({
        payment_status: 'paid',
        status: 'complete'
      })

      const webhookEvent = this.testData.generateWebhookEvent(eventType, session)
      const result = await this.sendWebhookEvent(webhookEvent)

      const webhookResult: WebhookTestResult = {
        eventType,
        success: result.success,
        responseStatus: result.status,
        responseTime: Date.now() - startTime,
        retryCount: result.retryCount
      }

      if (!result.success) {
        webhookResult.error = result.error
      }

      this.webhookResults.push(webhookResult)
      this.log('Checkout session completed webhook test finished', { success: result.success })
      
      return webhookResult
    } catch (error) {
      const webhookResult: WebhookTestResult = {
        eventType,
        success: false,
        responseStatus: 500,
        responseTime: Date.now() - startTime,
        error: error.message
      }

      this.webhookResults.push(webhookResult)
      return webhookResult
    }
  }

  /**
   * Test invoice payment succeeded webhook
   */
  async testInvoicePaymentSucceeded(): Promise<WebhookTestResult> {
    const eventType = 'invoice.payment_succeeded'
    this.log('Testing webhook event', eventType)

    const startTime = Date.now()
    
    try {
      const invoice = {
        id: `in_${this.testData.generateTestId()}`,
        customer: `cus_${this.testData.generateTestId()}`,
        subscription: `sub_${this.testData.generateTestId()}`,
        amount_paid: 2900,
        currency: 'usd',
        status: 'paid',
        paid: true
      }

      const webhookEvent = this.testData.generateWebhookEvent(eventType, invoice)
      const result = await this.sendWebhookEvent(webhookEvent)

      const webhookResult: WebhookTestResult = {
        eventType,
        success: result.success,
        responseStatus: result.status,
        responseTime: Date.now() - startTime,
        retryCount: result.retryCount
      }

      if (!result.success) {
        webhookResult.error = result.error
      }

      this.webhookResults.push(webhookResult)
      this.log('Invoice payment succeeded webhook test finished', { success: result.success })
      
      return webhookResult
    } catch (error) {
      const webhookResult: WebhookTestResult = {
        eventType,
        success: false,
        responseStatus: 500,
        responseTime: Date.now() - startTime,
        error: error.message
      }

      this.webhookResults.push(webhookResult)
      return webhookResult
    }
  }

  /**
   * Test invoice payment failed webhook
   */
  async testInvoicePaymentFailed(): Promise<WebhookTestResult> {
    const eventType = 'invoice.payment_failed'
    this.log('Testing webhook event', eventType)

    const startTime = Date.now()
    
    try {
      const invoice = {
        id: `in_${this.testData.generateTestId()}`,
        customer: `cus_${this.testData.generateTestId()}`,
        subscription: `sub_${this.testData.generateTestId()}`,
        amount_due: 2900,
        currency: 'usd',
        status: 'open',
        paid: false,
        attempt_count: 1
      }

      const webhookEvent = this.testData.generateWebhookEvent(eventType, invoice)
      const result = await this.sendWebhookEvent(webhookEvent)

      const webhookResult: WebhookTestResult = {
        eventType,
        success: result.success,
        responseStatus: result.status,
        responseTime: Date.now() - startTime,
        retryCount: result.retryCount
      }

      if (!result.success) {
        webhookResult.error = result.error
      }

      this.webhookResults.push(webhookResult)
      this.log('Invoice payment failed webhook test finished', { success: result.success })
      
      return webhookResult
    } catch (error) {
      const webhookResult: WebhookTestResult = {
        eventType,
        success: false,
        responseStatus: 500,
        responseTime: Date.now() - startTime,
        error: error.message
      }

      this.webhookResults.push(webhookResult)
      return webhookResult
    }
  }

  /**
   * Test customer subscription created webhook
   */
  async testCustomerSubscriptionCreated(): Promise<WebhookTestResult> {
    const eventType = 'customer.subscription.created'
    this.log('Testing webhook event', eventType)

    const startTime = Date.now()
    
    try {
      const subscription = {
        id: `sub_${this.testData.generateTestId()}`,
        customer: `cus_${this.testData.generateTestId()}`,
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
        items: {
          data: [{
            price: {
              id: 'price_starter_monthly',
              unit_amount: 2900,
              currency: 'usd',
              recurring: { interval: 'month' }
            }
          }]
        }
      }

      const webhookEvent = this.testData.generateWebhookEvent(eventType, subscription)
      const result = await this.sendWebhookEvent(webhookEvent)

      const webhookResult: WebhookTestResult = {
        eventType,
        success: result.success,
        responseStatus: result.status,
        responseTime: Date.now() - startTime,
        retryCount: result.retryCount
      }

      if (!result.success) {
        webhookResult.error = result.error
      }

      this.webhookResults.push(webhookResult)
      this.log('Customer subscription created webhook test finished', { success: result.success })
      
      return webhookResult
    } catch (error) {
      const webhookResult: WebhookTestResult = {
        eventType,
        success: false,
        responseStatus: 500,
        responseTime: Date.now() - startTime,
        error: error.message
      }

      this.webhookResults.push(webhookResult)
      return webhookResult
    }
  }

  /**
   * Test customer subscription updated webhook
   */
  async testCustomerSubscriptionUpdated(): Promise<WebhookTestResult> {
    const eventType = 'customer.subscription.updated'
    this.log('Testing webhook event', eventType)

    const startTime = Date.now()
    
    try {
      const subscription = {
        id: `sub_${this.testData.generateTestId()}`,
        customer: `cus_${this.testData.generateTestId()}`,
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
        items: {
          data: [{
            price: {
              id: 'price_pro_monthly',
              unit_amount: 9900,
              currency: 'usd',
              recurring: { interval: 'month' }
            }
          }]
        },
        previous_attributes: {
          items: {
            data: [{
              price: {
                id: 'price_starter_monthly'
              }
            }]
          }
        }
      }

      const webhookEvent = this.testData.generateWebhookEvent(eventType, subscription)
      const result = await this.sendWebhookEvent(webhookEvent)

      const webhookResult: WebhookTestResult = {
        eventType,
        success: result.success,
        responseStatus: result.status,
        responseTime: Date.now() - startTime,
        retryCount: result.retryCount
      }

      if (!result.success) {
        webhookResult.error = result.error
      }

      this.webhookResults.push(webhookResult)
      this.log('Customer subscription updated webhook test finished', { success: result.success })
      
      return webhookResult
    } catch (error) {
      const webhookResult: WebhookTestResult = {
        eventType,
        success: false,
        responseStatus: 500,
        responseTime: Date.now() - startTime,
        error: error.message
      }

      this.webhookResults.push(webhookResult)
      return webhookResult
    }
  }

  /**
   * Test customer subscription deleted webhook
   */
  async testCustomerSubscriptionDeleted(): Promise<WebhookTestResult> {
    const eventType = 'customer.subscription.deleted'
    this.log('Testing webhook event', eventType)

    const startTime = Date.now()
    
    try {
      const subscription = {
        id: `sub_${this.testData.generateTestId()}`,
        customer: `cus_${this.testData.generateTestId()}`,
        status: 'canceled',
        canceled_at: Math.floor(Date.now() / 1000),
        ended_at: Math.floor(Date.now() / 1000)
      }

      const webhookEvent = this.testData.generateWebhookEvent(eventType, subscription)
      const result = await this.sendWebhookEvent(webhookEvent)

      const webhookResult: WebhookTestResult = {
        eventType,
        success: result.success,
        responseStatus: result.status,
        responseTime: Date.now() - startTime,
        retryCount: result.retryCount
      }

      if (!result.success) {
        webhookResult.error = result.error
      }

      this.webhookResults.push(webhookResult)
      this.log('Customer subscription deleted webhook test finished', { success: result.success })
      
      return webhookResult
    } catch (error) {
      const webhookResult: WebhookTestResult = {
        eventType,
        success: false,
        responseStatus: 500,
        responseTime: Date.now() - startTime,
        error: error.message
      }

      this.webhookResults.push(webhookResult)
      return webhookResult
    }
  }

  /**
   * Test webhook signature validation
   */
  async testWebhookSignatureValidation(): Promise<WebhookTestResult> {
    const eventType = 'test.signature_validation'
    this.log('Testing webhook signature validation')

    const startTime = Date.now()
    
    try {
      const testEvent = this.testData.generateWebhookEvent(eventType, { test: true })
      
      // Test with invalid signature
      const invalidResult = await this.page.request.post(`${this.config.baseURL}${this.config.webhookEndpoint}`, {
        data: testEvent,
        headers: {
          'stripe-signature': 'invalid-signature',
          'content-type': 'application/json'
        }
      })

      const webhookResult: WebhookTestResult = {
        eventType,
        success: invalidResult.status() === 400, // Should reject invalid signature
        responseStatus: invalidResult.status(),
        responseTime: Date.now() - startTime
      }

      if (invalidResult.status() !== 400) {
        webhookResult.error = 'Expected 400 for invalid signature'
      }

      this.webhookResults.push(webhookResult)
      this.log('Webhook signature validation test finished', { success: webhookResult.success })
      
      return webhookResult
    } catch (error) {
      const webhookResult: WebhookTestResult = {
        eventType,
        success: false,
        responseStatus: 500,
        responseTime: Date.now() - startTime,
        error: error.message
      }

      this.webhookResults.push(webhookResult)
      return webhookResult
    }
  }

  /**
   * Test webhook idempotency
   */
  async testWebhookIdempotency(): Promise<WebhookTestResult> {
    const eventType = 'test.idempotency'
    this.log('Testing webhook idempotency')

    const startTime = Date.now()
    
    try {
      const testEvent = this.testData.generateWebhookEvent(eventType, { test: true })
      const signature = this.testData.generateWebhookSignature()

      // Send the same event twice
      const firstResult = await this.sendWebhookEventWithSignature(testEvent, signature)
      const secondResult = await this.sendWebhookEventWithSignature(testEvent, signature)

      const webhookResult: WebhookTestResult = {
        eventType,
        success: firstResult.success && secondResult.success,
        responseStatus: secondResult.status,
        responseTime: Date.now() - startTime
      }

      if (!firstResult.success || !secondResult.success) {
        webhookResult.error = 'One or both webhook requests failed'
      }

      this.webhookResults.push(webhookResult)
      this.log('Webhook idempotency test finished', { success: webhookResult.success })
      
      return webhookResult
    } catch (error) {
      const webhookResult: WebhookTestResult = {
        eventType,
        success: false,
        responseStatus: 500,
        responseTime: Date.now() - startTime,
        error: error.message
      }

      this.webhookResults.push(webhookResult)
      return webhookResult
    }
  }

  /**
   * Run comprehensive webhook test suite
   */
  async runWebhookTestSuite(): Promise<WebhookTestResult[]> {
    this.log('Running comprehensive webhook test suite')
    
    const tests = [
      () => this.testCheckoutSessionCompleted(),
      () => this.testInvoicePaymentSucceeded(),
      () => this.testInvoicePaymentFailed(),
      () => this.testCustomerSubscriptionCreated(),
      () => this.testCustomerSubscriptionUpdated(),
      () => this.testCustomerSubscriptionDeleted(),
      () => this.testWebhookSignatureValidation(),
      () => this.testWebhookIdempotency()
    ]

    const results = []
    for (const test of tests) {
      try {
        const result = await test()
        results.push(result)
        
        // Wait between tests to avoid rate limiting
        await this.wait(500)
      } catch (error) {
        this.log('Test failed', error.message)
      }
    }

    this.log('Webhook test suite completed', {
      totalTests: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    })

    return results
  }

  /**
   * Send webhook event with retry logic
   */
  private async sendWebhookEvent(event: any): Promise<{
    success: boolean
    status: number
    error?: string
    retryCount: number
  }> {
    const signature = this.testData.generateWebhookSignature()
    return await this.sendWebhookEventWithSignature(event, signature)
  }

  /**
   * Send webhook event with specific signature
   */
  private async sendWebhookEventWithSignature(event: any, signature: string): Promise<{
    success: boolean
    status: number
    error?: string
    retryCount: number
  }> {
    let lastError: string | undefined
    
    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        const response = await this.page.request.post(
          `${this.config.baseURL}${this.config.webhookEndpoint}`,
          {
            data: event,
            headers: {
              'stripe-signature': signature,
              'content-type': 'application/json'
            },
            timeout: this.config.timeoutMs
          }
        )

        if (response.ok()) {
          return {
            success: true,
            status: response.status(),
            retryCount: attempt
          }
        } else {
          lastError = `HTTP ${response.status()}: ${response.statusText()}`
          
          // Don't retry client errors (4xx)
          if (response.status() >= 400 && response.status() < 500) {
            break
          }
        }
      } catch (error) {
        lastError = error.message
      }

      // Wait before retry
      if (attempt < this.config.retryAttempts - 1) {
        await this.wait(1000 * (attempt + 1)) // Exponential backoff
      }
    }

    return {
      success: false,
      status: 500,
      error: lastError,
      retryCount: this.config.retryAttempts
    }
  }

  /**
   * Setup local webhook server for testing
   */
  private async setupWebhookServer(): Promise<void> {
    this.log('Setting up webhook server for real webhook testing')
    // This would set up a local server to receive real Stripe webhooks
    // Implementation would depend on your testing infrastructure
  }

  /**
   * Get webhook test results
   */
  getWebhookResults(): WebhookTestResult[] {
    return this.webhookResults
  }

  /**
   * Get webhook success rate
   */
  getWebhookSuccessRate(): number {
    if (this.webhookResults.length === 0) return 0
    const successful = this.webhookResults.filter(r => r.success).length
    return (successful / this.webhookResults.length) * 100
  }

  /**
   * Get average response time
   */
  getAverageResponseTime(): number {
    if (this.webhookResults.length === 0) return 0
    const totalTime = this.webhookResults.reduce((sum, r) => sum + r.responseTime, 0)
    return totalTime / this.webhookResults.length
  }

  /**
   * Reset webhook results
   */
  resetResults(): void {
    this.webhookResults = []
  }

  protected async teardown(): Promise<void> {
    if (this.webhookServer) {
      // Cleanup webhook server
      this.webhookServer.close()
      this.webhookServer = null
    }
    this.webhookResults = []
  }

  /**
   * Health check for webhook module
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Test basic webhook endpoint accessibility
      const response = await this.page.request.post(
        `${this.config.baseURL}${this.config.webhookEndpoint}`,
        {
          data: { test: 'health_check' },
          headers: { 'stripe-signature': 'test-signature' }
        }
      )
      
      // Should return 400 for invalid signature, not 404
      return response.status() !== 404
    } catch {
      return false
    }
  }
}