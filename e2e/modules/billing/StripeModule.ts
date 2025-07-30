import { BaseModule, ModuleDependency } from '../base/BaseModule'
import { TestPayment, TestSubscription, TestDataManager } from '../base/TestData'
import { AuthModule } from '../auth/AuthModule'
import { OrganizationModule } from '../organization/OrganizationModule'

export interface StripeConfig {
  baseURL?: string
  billingPath?: string
  checkoutTimeout?: number
  useRealStripe?: boolean
  testMode?: boolean
  webhookEndpoint?: string
}

export interface StripeCheckoutSession {
  id: string
  url: string
  status: string
  payment_status?: string
  customer?: string
  subscription?: string
}

export class StripeModule extends BaseModule {
  private testData: TestDataManager
  private authModule: AuthModule | null = null
  private orgModule: OrganizationModule | null = null
  private currentSession: StripeCheckoutSession | null = null
  private currentSubscription: any = null

  constructor(page, config: StripeConfig = {}) {
    super(page, {
      baseURL: 'http://localhost:3010',
      billingPath: '/settings/billing',
      checkoutTimeout: 30000,
      useRealStripe: false,
      testMode: true,
      webhookEndpoint: '/api/billing/webhooks',
      ...config
    })
    this.testData = TestDataManager.getInstance()
  }

  protected getDependencies(): ModuleDependency[] {
    return [
      { name: 'auth', required: true },
      { name: 'organization', required: true }
    ]
  }

  protected async setup(): Promise<void> {
    this.authModule = this.getDependency<AuthModule>('auth')
    this.orgModule = this.getDependency<OrganizationModule>('organization')
    this.log('Initializing Stripe module')
  }

  /**
   * Create Stripe checkout session
   */
  async createCheckoutSession(
    priceId: string,
    options: {
      successUrl?: string
      cancelUrl?: string
      trialPeriodDays?: number
      allowPromotionCodes?: boolean
      automaticTax?: boolean
    } = {}
  ): Promise<StripeCheckoutSession> {
    const org = this.orgModule?.getCurrentOrganization()
    if (!org) {
      throw new Error('Organization required for checkout')
    }

    this.log('Creating checkout session', { priceId, orgId: org.id })

    const response = await this.page.request.post('/api/billing/checkout', {
      data: {
        organization_id: org.id,
        price_id: priceId,
        success_url: options.successUrl || `${this.config.baseURL}/billing?success=true`,
        cancel_url: options.cancelUrl || `${this.config.baseURL}/billing?cancelled=true`,
        trial_period_days: options.trialPeriodDays,
        allow_promotion_codes: options.allowPromotionCodes ?? true,
        automatic_tax: options.automaticTax ?? true
      }
    })

    if (!response.ok()) {
      throw new Error(`Failed to create checkout session: ${response.status()}`)
    }

    const data = await response.json()
    this.currentSession = {
      id: data.session_id,
      url: data.checkout_url,
      status: 'open'
    }

    this.log('Checkout session created', this.currentSession.id)
    return this.currentSession
  }

  /**
   * Navigate to Stripe checkout
   */
  async navigateToCheckout(session: StripeCheckoutSession): Promise<void> {
    this.log('Navigating to checkout', session.id)
    
    await this.navigateTo(session.url)
    
    if (this.config.useRealStripe) {
      // Wait for real Stripe checkout page
      await this.waitForElement('.stripe-checkout', { timeout: this.config.checkoutTimeout })
    } else {
      // For mock/test environment, verify redirect
      expect(session.url).toMatch(/checkout\.stripe\.com|mock-stripe/)
    }
  }

  /**
   * Complete Stripe checkout with test card
   */
  async completeCheckout(
    session: StripeCheckoutSession,
    cardData?: TestPayment
  ): Promise<void> {
    if (!this.config.useRealStripe) {
      this.log('Simulating checkout completion (mock mode)')
      // For mock mode, simulate success by navigating to success URL
      const successUrl = `${this.config.baseURL}/billing?success=true&session_id=${session.id}`
      await this.navigateTo(successUrl)
      return
    }

    this.log('Completing real Stripe checkout', session.id)
    
    const card = cardData || this.testData.generateTestCard('success')
    
    // Fill Stripe checkout form
    await this.fillStripeCheckoutForm(card)
    
    // Submit payment
    await this.clickElement('[data-testid="submit-payment-button"]')
    
    // Wait for payment processing
    await this.page.waitForURL(/success=true/, { timeout: this.config.checkoutTimeout })
    
    this.log('Checkout completed successfully')
  }

  /**
   * Fill Stripe checkout form with card details
   */
  private async fillStripeCheckoutForm(card: TestPayment): Promise<void> {
    // Switch to Stripe iframe if necessary
    const stripeFrame = this.page.frameLocator('[name*="stripe"]').first()
    
    // Fill card number
    await stripeFrame.locator('[data-testid="card-number-input"]').fill(card.cardNumber)
    
    // Fill expiry
    await stripeFrame.locator('[data-testid="card-expiry-input"]').fill(`${card.expiryMonth}/${card.expiryYear}`)
    
    // Fill CVC
    await stripeFrame.locator('[data-testid="card-cvc-input"]').fill(card.cvc)
    
    // Fill billing details
    await this.fillElement('[data-testid="billing-name-input"]', card.name)
    await this.fillElement('[data-testid="billing-email-input"]', card.email)
    
    // Fill address if required
    if (await this.elementExists('[data-testid="billing-country-input"]')) {
      await this.fillElement('[data-testid="billing-country-input"]', card.country)
      await this.fillElement('[data-testid="billing-postal-code-input"]', card.postalCode)
    }
  }

  /**
   * Test different card scenarios
   */
  async testCardScenario(scenario: 'success' | 'decline' | '3ds' | 'insufficient_funds'): Promise<void> {
    const subscription = this.testData.generateSubscription()
    const card = this.testData.generateTestCard(scenario)
    
    this.log('Testing card scenario', { scenario, priceId: subscription.priceId })
    
    const session = await this.createCheckoutSession(subscription.priceId)
    await this.navigateToCheckout(session)
    
    if (this.config.useRealStripe) {
      await this.fillStripeCheckoutForm(card)
      await this.clickElement('[data-testid="submit-payment-button"]')
      
      switch (scenario) {
        case 'success':
          await this.page.waitForURL(/success=true/, { timeout: this.config.checkoutTimeout })
          break
        case 'decline':
          await this.waitForElement('[data-testid="card-declined-error"]')
          break
        case '3ds':
          await this.handle3DSecure()
          break
        case 'insufficient_funds':
          await this.waitForElement('[data-testid="insufficient-funds-error"]')
          break
      }
    }
    
    this.log('Card scenario test completed', scenario)
  }

  /**
   * Handle 3D Secure authentication
   */
  private async handle3DSecure(): Promise<void> {
    this.log('Handling 3D Secure authentication')
    
    // Wait for 3DS modal/iframe
    await this.waitForElement('[data-testid="3ds-modal"]', { timeout: 15000 })
    
    // Complete 3DS authentication (this would depend on the test 3DS flow)
    await this.clickElement('[data-testid="3ds-complete-button"]')
    
    // Wait for return to checkout
    await this.page.waitForURL(/success=true/, { timeout: this.config.checkoutTimeout })
  }

  /**
   * Create billing portal session
   */
  async createPortalSession(customerId: string): Promise<{url: string}> {
    this.log('Creating billing portal session', customerId)
    
    const response = await this.page.request.post('/api/billing/portal', {
      data: {
        customer_id: customerId,
        return_url: `${this.config.baseURL}${this.config.billingPath}`
      }
    })

    if (!response.ok()) {
      throw new Error(`Failed to create portal session: ${response.status()}`)
    }

    const data = await response.json()
    this.log('Portal session created')
    return { url: data.url }
  }

  /**
   * Navigate to billing portal
   */
  async navigateToBillingPortal(customerId: string): Promise<void> {
    const portal = await this.createPortalSession(customerId)
    await this.navigateTo(portal.url)
    
    if (this.config.useRealStripe) {
      await this.waitForElement('.stripe-billing-portal')
    }
  }

  /**
   * Get subscription information
   */
  async getSubscription(organizationId?: string): Promise<any> {
    const orgId = organizationId || this.orgModule?.getCurrentOrganization()?.id
    if (!orgId) {
      throw new Error('Organization ID required')
    }

    this.log('Getting subscription', orgId)
    
    const response = await this.page.request.get(`/api/billing/subscription?organization_id=${orgId}`)
    
    if (!response.ok()) {
      throw new Error(`Failed to get subscription: ${response.status()}`)
    }

    const data = await response.json()
    this.currentSubscription = data.subscription
    return this.currentSubscription
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId: string, newPriceId: string): Promise<any> {
    this.log('Updating subscription', { subscriptionId, newPriceId })
    
    const response = await this.page.request.put('/api/billing/subscription', {
      data: {
        subscription_id: subscriptionId,
        new_price_id: newPriceId,
        proration_behavior: 'always_invoice'
      }
    })

    if (!response.ok()) {
      throw new Error(`Failed to update subscription: ${response.status()}`)
    }

    const data = await response.json()
    this.currentSubscription = data.subscription
    return this.currentSubscription
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true): Promise<void> {
    this.log('Cancelling subscription', { subscriptionId, cancelAtPeriodEnd })
    
    const response = await this.page.request.delete(`/api/billing/subscription/${subscriptionId}`, {
      data: { cancel_at_period_end: cancelAtPeriodEnd }
    })

    if (!response.ok()) {
      throw new Error(`Failed to cancel subscription: ${response.status()}`)
    }

    this.log('Subscription cancelled successfully')
  }

  /**
   * Get invoices
   */
  async getInvoices(customerId: string, limit = 10): Promise<any[]> {
    this.log('Getting invoices', { customerId, limit })
    
    const response = await this.page.request.get(`/api/billing/invoices?customer_id=${customerId}&limit=${limit}`)
    
    if (!response.ok()) {
      throw new Error(`Failed to get invoices: ${response.status()}`)
    }

    const data = await response.json()
    return data.invoices
  }

  /**
   * Simulate webhook event
   */
  async simulateWebhook(eventType: string, eventData: any): Promise<void> {
    this.log('Simulating webhook event', eventType)
    
    const webhookEvent = this.testData.generateWebhookEvent(eventType, eventData)
    const signature = this.testData.generateWebhookSignature()
    
    const response = await this.page.request.post(`${this.config.baseURL}${this.config.webhookEndpoint}`, {
      data: webhookEvent,
      headers: {
        'stripe-signature': signature,
        'content-type': 'application/json'
      }
    })

    if (!response.ok()) {
      throw new Error(`Webhook simulation failed: ${response.status()}`)
    }

    this.log('Webhook event simulated successfully')
  }

  /**
   * Verify subscription status in UI
   */
  async verifySubscriptionStatus(expectedStatus: string): Promise<void> {
    await this.navigateTo(`${this.config.baseURL}${this.config.billingPath}`)
    await this.assertText('[data-testid="subscription-status"]', expectedStatus)
  }

  /**
   * Complete end-to-end subscription flow
   */
  async completeSubscriptionFlow(subscription: TestSubscription): Promise<{
    session: StripeCheckoutSession
    subscriptionData: any
  }> {
    this.log('Starting complete subscription flow', subscription.planName)
    
    // Create checkout session
    const session = await this.createCheckoutSession(subscription.priceId, {
      trialPeriodDays: subscription.trialDays
    })
    
    // Complete checkout
    await this.navigateToCheckout(session)
    await this.completeCheckout(session)
    
    // Wait for webhook processing
    await this.wait(2000)
    
    // Get final subscription data
    const subscriptionData = await this.getSubscription()
    
    this.log('Subscription flow completed successfully')
    return { session, subscriptionData }
  }

  /**
   * Test subscription lifecycle
   */
  async testSubscriptionLifecycle(): Promise<void> {
    const subscription = this.testData.generateSubscription()
    
    // 1. Create subscription
    const { subscriptionData } = await this.completeSubscriptionFlow(subscription)
    
    // 2. Verify active status
    await this.verifySubscriptionStatus('active')
    
    // 3. Update subscription
    const newSubscription = this.testData.generateSubscription({
      priceId: 'price_pro_monthly'
    })
    await this.updateSubscription(subscriptionData.id, newSubscription.priceId)
    
    // 4. Cancel subscription
    await this.cancelSubscription(subscriptionData.id)
    
    // 5. Verify cancelled status
    await this.verifySubscriptionStatus('cancelled')
    
    this.log('Subscription lifecycle test completed')
  }

  /**
   * Get current session
   */
  getCurrentSession(): StripeCheckoutSession | null {
    return this.currentSession
  }

  /**
   * Get current subscription
   */
  getCurrentSubscription(): any {
    return this.currentSubscription
  }

  protected async teardown(): Promise<void> {
    this.currentSession = null
    this.currentSubscription = null
  }

  /**
   * Health check for Stripe module
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Test API endpoints
      const response = await this.page.request.get('/api/billing/health')
      return response.ok()
    } catch {
      return false
    }
  }
}