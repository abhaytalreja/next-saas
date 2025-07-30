import { BaseModule, ModuleDependency } from '../base/BaseModule'
import { TestSubscription, TestPayment, TestDataManager } from '../base/TestData'
import { AuthModule } from '../auth/AuthModule'
import { OrganizationModule } from '../organization/OrganizationModule'
import { StripeModule } from './StripeModule'

export interface PaymentFlowConfig {
  baseURL?: string
  pricingPath?: string
  billingPath?: string
  enableTrialFlows?: boolean
  enableUpgradeFlows?: boolean
  testAllCardTypes?: boolean
}

export interface PaymentFlowResult {
  success: boolean
  sessionId?: string
  subscriptionId?: string
  error?: string
  timing: {
    started: number
    completed: number
    duration: number
  }
}

export class PaymentFlowModule extends BaseModule {
  private testData: TestDataManager
  private authModule: AuthModule | null = null
  private orgModule: OrganizationModule | null = null
  private stripeModule: StripeModule | null = null
  private flowResults: PaymentFlowResult[] = []

  constructor(page, config: PaymentFlowConfig = {}) {
    super(page, {
      baseURL: 'http://localhost:3010',
      pricingPath: '/pricing',
      billingPath: '/settings/billing',
      enableTrialFlows: true,
      enableUpgradeFlows: true,
      testAllCardTypes: true,
      ...config
    })
    this.testData = TestDataManager.getInstance()
  }

  protected getDependencies(): ModuleDependency[] {
    return [
      { name: 'auth', required: true },
      { name: 'organization', required: true },
      { name: 'stripe', required: true }
    ]
  }

  protected async setup(): Promise<void> {
    this.authModule = this.getDependency<AuthModule>('auth')
    this.orgModule = this.getDependency<OrganizationModule>('organization')
    this.stripeModule = this.getDependency<StripeModule>('stripe')
    this.log('Initializing payment flow module')
  }

  /**
   * Complete basic subscription flow
   */
  async basicSubscriptionFlow(planType: 'starter' | 'pro' | 'enterprise' = 'starter'): Promise<PaymentFlowResult> {
    const startTime = Date.now()
    this.log('Starting basic subscription flow', planType)

    try {
      // Navigate to pricing page
      await this.navigateTo(`${this.config.baseURL}${this.config.pricingPath}`)
      
      // Click subscribe button for the plan
      await this.clickElement(`[data-testid="subscribe-${planType}-button"]`)
      
      // Wait for checkout redirect or process
      const checkoutStarted = await Promise.race([
        this.page.waitForURL(/stripe\.com.*checkout/, { timeout: 10000 }).then(() => 'stripe'),
        this.page.waitForURL(/billing.*checkout/, { timeout: 10000 }).then(() => 'internal'),
        this.waitForElement('[data-testid="checkout-form"]', { timeout: 10000 }).then(() => 'form')
      ])

      let sessionId: string | undefined
      let subscriptionId: string | undefined

      if (checkoutStarted === 'stripe') {
        // Handle Stripe checkout
        const session = this.stripeModule?.getCurrentSession()
        sessionId = session?.id
        await this.stripeModule?.completeCheckout(session!)
      } else {
        // Handle internal checkout form
        await this.fillInternalCheckoutForm()
        await this.clickElement('[data-testid="complete-payment-button"]')
      }

      // Wait for success page
      await this.page.waitForURL(/success=true|billing/, { timeout: 15000 })
      
      // Get subscription details
      const subscription = await this.stripeModule?.getSubscription()
      subscriptionId = subscription?.id

      const endTime = Date.now()
      const result: PaymentFlowResult = {
        success: true,
        sessionId,
        subscriptionId,
        timing: {
          started: startTime,
          completed: endTime,
          duration: endTime - startTime
        }
      }

      this.flowResults.push(result)
      this.log('Basic subscription flow completed successfully', { 
        duration: result.timing.duration,
        plan: planType 
      })
      
      return result
    } catch (error) {
      const endTime = Date.now()
      const result: PaymentFlowResult = {
        success: false,
        error: error.message,
        timing: {
          started: startTime,
          completed: endTime,
          duration: endTime - startTime
        }
      }

      this.flowResults.push(result)
      this.log('Basic subscription flow failed', error.message)
      return result
    }
  }

  /**
   * Trial subscription flow
   */
  async trialSubscriptionFlow(planType: 'starter' | 'pro' = 'pro', trialDays = 14): Promise<PaymentFlowResult> {
    const startTime = Date.now()
    this.log('Starting trial subscription flow', { planType, trialDays })

    try {
      // Navigate to pricing page
      await this.navigateTo(`${this.config.baseURL}${this.config.pricingPath}`)
      
      // Click start trial button
      await this.clickElement(`[data-testid="start-trial-${planType}-button"]`)
      
      // Fill trial signup form
      await this.fillTrialSignupForm()
      
      // Complete trial setup
      await this.clickElement('[data-testid="start-trial-button"]')
      
      // Verify trial is active
      await this.page.waitForURL(/dashboard|billing/, { timeout: 15000 })
      await this.assertText('[data-testid="trial-status"]', 'Trial Active')
      
      // Get subscription details
      const subscription = await this.stripeModule?.getSubscription()
      
      const endTime = Date.now()
      const result: PaymentFlowResult = {
        success: true,
        subscriptionId: subscription?.id,
        timing: {
          started: startTime,
          completed: endTime,
          duration: endTime - startTime
        }
      }

      this.flowResults.push(result)
      this.log('Trial subscription flow completed successfully')
      return result
    } catch (error) {
      const endTime = Date.now()
      const result: PaymentFlowResult = {
        success: false,
        error: error.message,
        timing: {
          started: startTime,
          completed: endTime,
          duration: endTime - startTime
        }
      }

      this.flowResults.push(result)
      return result
    }
  }

  /**
   * Subscription upgrade flow
   */
  async subscriptionUpgradeFlow(fromPlan: string, toPlan: string): Promise<PaymentFlowResult> {
    const startTime = Date.now()
    this.log('Starting subscription upgrade flow', { fromPlan, toPlan })

    try {
      // Navigate to billing settings
      await this.navigateTo(`${this.config.baseURL}${this.config.billingPath}`)
      
      // Click upgrade button
      await this.clickElement('[data-testid="upgrade-subscription-button"]')
      
      // Select new plan
      await this.clickElement(`[data-testid="select-plan-${toPlan}"]`)
      
      // Review upgrade
      await this.waitForElement('[data-testid="upgrade-review"]')
      await this.assertVisible('[data-testid="upgrade-proration"]')
      
      // Confirm upgrade
      await this.clickElement('[data-testid="confirm-upgrade-button"]')
      
      // Wait for upgrade completion
      await this.waitForElement('[data-testid="upgrade-success-message"]')
      
      // Verify new plan is active
      await this.assertText('[data-testid="current-plan"]', toPlan)
      
      const subscription = await this.stripeModule?.getSubscription()
      
      const endTime = Date.now()
      const result: PaymentFlowResult = {
        success: true,
        subscriptionId: subscription?.id,
        timing: {
          started: startTime,
          completed: endTime,
          duration: endTime - startTime
        }
      }

      this.flowResults.push(result)
      this.log('Subscription upgrade completed successfully')
      return result
    } catch (error) {
      const endTime = Date.now()
      const result: PaymentFlowResult = {
        success: false,
        error: error.message,
        timing: {
          started: startTime,
          completed: endTime,
          duration: endTime - startTime
        }
      }

      this.flowResults.push(result)
      return result
    }
  }

  /**
   * Payment method update flow
   */
  async updatePaymentMethodFlow(newCard: TestPayment): Promise<PaymentFlowResult> {
    const startTime = Date.now()
    this.log('Starting payment method update flow')

    try {
      // Navigate to billing settings
      await this.navigateTo(`${this.config.baseURL}${this.config.billingPath}`)
      
      // Click update payment method
      await this.clickElement('[data-testid="update-payment-method-button"]')
      
      // Fill new card details
      await this.fillCardForm(newCard)
      
      // Save new payment method
      await this.clickElement('[data-testid="save-payment-method-button"]')
      
      // Wait for success
      await this.waitForElement('[data-testid="payment-method-updated-message"]')
      
      // Verify new card is displayed (last 4 digits)
      const last4 = newCard.cardNumber.slice(-4)
      await this.assertText('[data-testid="current-card-last4"]', last4)
      
      const endTime = Date.now()
      const result: PaymentFlowResult = {
        success: true,
        timing: {
          started: startTime,
          completed: endTime,
          duration: endTime - startTime
        }
      }

      this.flowResults.push(result)
      this.log('Payment method update completed successfully')
      return result
    } catch (error) {
      const endTime = Date.now()
      const result: PaymentFlowResult = {
        success: false,
        error: error.message,
        timing: {
          started: startTime,
          completed: endTime,
          duration: endTime - startTime
        }
      }

      this.flowResults.push(result)
      return result
    }
  }

  /**
   * Failed payment retry flow
   */
  async failedPaymentRetryFlow(): Promise<PaymentFlowResult> {
    const startTime = Date.now()
    this.log('Starting failed payment retry flow')

    try {
      // First create a failed payment scenario
      await this.stripeModule?.testCardScenario('decline')
      
      // Navigate to billing page
      await this.navigateTo(`${this.config.baseURL}${this.config.billingPath}`)
      
      // Should see failed payment notice
      await this.assertVisible('[data-testid="payment-failed-notice"]')
      
      // Click retry payment
      await this.clickElement('[data-testid="retry-payment-button"]')
      
      // Update with working card
      const workingCard = this.testData.generateTestCard('success')
      await this.fillCardForm(workingCard)
      
      // Submit retry
      await this.clickElement('[data-testid="retry-payment-submit-button"]')
      
      // Wait for success
      await this.waitForElement('[data-testid="payment-retry-success-message"]')
      
      // Verify subscription is active again
      await this.assertText('[data-testid="subscription-status"]', 'Active')
      
      const endTime = Date.now()
      const result: PaymentFlowResult = {
        success: true,
        timing: {
          started: startTime,
          completed: endTime,
          duration: endTime - startTime
        }
      }

      this.flowResults.push(result)
      this.log('Failed payment retry completed successfully')
      return result
    } catch (error) {
      const endTime = Date.now()
      const result: PaymentFlowResult = {
        success: false,
        error: error.message,
        timing: {
          started: startTime,
          completed: endTime,
          duration: endTime - startTime
        }
      }

      this.flowResults.push(result)
      return result
    }
  }

  /**
   * Subscription cancellation flow
   */
  async subscriptionCancellationFlow(immediate = false): Promise<PaymentFlowResult> {
    const startTime = Date.now()
    this.log('Starting subscription cancellation flow', { immediate })

    try {
      // Navigate to billing settings
      await this.navigateTo(`${this.config.baseURL}${this.config.billingPath}`)
      
      // Click cancel subscription
      await this.clickElement('[data-testid="cancel-subscription-button"]')
      
      // Handle cancellation modal
      await this.waitForElement('[data-testid="cancellation-modal"]')
      
      if (immediate) {
        await this.clickElement('[data-testid="cancel-immediately-radio"]')
      } else {
        await this.clickElement('[data-testid="cancel-at-period-end-radio"]')
      }
      
      // Provide cancellation reason
      await this.fillElement('[data-testid="cancellation-reason-input"]', 'Testing cancellation flow')
      
      // Confirm cancellation
      await this.clickElement('[data-testid="confirm-cancellation-button"]')
      
      // Wait for cancellation success
      await this.waitForElement('[data-testid="cancellation-success-message"]')
      
      // Verify cancellation status
      const expectedStatus = immediate ? 'Cancelled' : 'Cancelling at period end'
      await this.assertText('[data-testid="subscription-status"]', expectedStatus)
      
      const endTime = Date.now()
      const result: PaymentFlowResult = {
        success: true,
        timing: {
          started: startTime,
          completed: endTime,
          duration: endTime - startTime
        }
      }

      this.flowResults.push(result)
      this.log('Subscription cancellation completed successfully')
      return result
    } catch (error) {
      const endTime = Date.now()
      const result: PaymentFlowResult = {
        success: false,
        error: error.message,
        timing: {
          started: startTime,
          completed: endTime,
          duration: endTime - startTime
        }
      }

      this.flowResults.push(result)
      return result
    }
  }

  /**
   * Complete end-to-end payment journey
   */
  async completePaymentJourney(): Promise<PaymentFlowResult[]> {
    this.log('Starting complete payment journey')
    
    const results: PaymentFlowResult[] = []
    
    // 1. Basic subscription
    results.push(await this.basicSubscriptionFlow('starter'))
    
    // 2. Upgrade subscription
    results.push(await this.subscriptionUpgradeFlow('starter', 'pro'))
    
    // 3. Update payment method
    const newCard = this.testData.generateTestCard('success')
    results.push(await this.updatePaymentMethodFlow(newCard))
    
    // 4. Cancel subscription
    results.push(await this.subscriptionCancellationFlow(false))
    
    this.log('Complete payment journey finished', {
      totalSteps: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    })
    
    return results
  }

  /**
   * Test multiple card scenarios
   */
  async testAllCardScenarios(): Promise<PaymentFlowResult[]> {
    if (!this.config.testAllCardTypes) {
      this.log('Card scenario testing disabled')
      return []
    }

    this.log('Testing all card scenarios')
    
    const scenarios: Array<'success' | 'decline' | '3ds' | 'insufficient_funds'> = [
      'success', 'decline', '3ds', 'insufficient_funds'
    ]
    
    const results: PaymentFlowResult[] = []
    
    for (const scenario of scenarios) {
      const startTime = Date.now()
      try {
        await this.stripeModule?.testCardScenario(scenario)
        results.push({
          success: scenario === 'success',
          timing: {
            started: startTime,
            completed: Date.now(),
            duration: Date.now() - startTime
          }
        })
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          timing: {
            started: startTime,
            completed: Date.now(),
            duration: Date.now() - startTime
          }
        })
      }
    }
    
    return results
  }

  /**
   * Fill internal checkout form
   */
  private async fillInternalCheckoutForm(): Promise<void> {
    const card = this.testData.generateTestCard('success')
    await this.fillCardForm(card)
  }

  /**
   * Fill card form
   */
  private async fillCardForm(card: TestPayment): Promise<void> {
    await this.fillElement('[data-testid="card-number-input"]', card.cardNumber)
    await this.fillElement('[data-testid="card-expiry-input"]', `${card.expiryMonth}/${card.expiryYear}`)
    await this.fillElement('[data-testid="card-cvc-input"]', card.cvc)
    await this.fillElement('[data-testid="card-name-input"]', card.name)
  }

  /**
   * Fill trial signup form
   */
  private async fillTrialSignupForm(): Promise<void> {
    // This might include additional business information for trials
    await this.fillElement('[data-testid="company-size-select"]', '10-50')
    await this.fillElement('[data-testid="use-case-input"]', 'Testing and development')
  }

  /**
   * Get flow results
   */
  getFlowResults(): PaymentFlowResult[] {
    return this.flowResults
  }

  /**
   * Get success rate
   */
  getSuccessRate(): number {
    if (this.flowResults.length === 0) return 0
    const successful = this.flowResults.filter(r => r.success).length
    return (successful / this.flowResults.length) * 100
  }

  /**
   * Get average flow duration
   */
  getAverageFlowDuration(): number {
    if (this.flowResults.length === 0) return 0
    const totalDuration = this.flowResults.reduce((sum, r) => sum + r.timing.duration, 0)
    return totalDuration / this.flowResults.length
  }

  /**
   * Reset flow results
   */
  resetResults(): void {
    this.flowResults = []
  }

  protected async teardown(): Promise<void> {
    this.flowResults = []
  }

  /**
   * Health check for payment flow module
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Check if pricing page is accessible
      await this.navigateTo(`${this.config.baseURL}${this.config.pricingPath}`)
      return await this.elementExists('[data-testid^="subscribe-"]')
    } catch {
      return false
    }
  }
}