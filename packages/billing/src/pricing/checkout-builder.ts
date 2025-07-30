import type { CheckoutSessionConfig } from '../types/stripe'

export class CheckoutBuilder {
  private config: Partial<CheckoutSessionConfig> = {
    mode: 'subscription',
    allow_promotion_codes: true,
    automatic_tax: { enabled: true }
  }

  /**
   * Set the subscription price
   */
  withPrice(priceId: string, quantity: number = 1): this {
    this.config.line_items = [
      {
        price: priceId,
        quantity
      }
    ]
    return this
  }

  /**
   * Set multiple line items
   */
  withLineItems(items: Array<{ priceId: string; quantity?: number }>): this {
    this.config.line_items = items.map(item => ({
      price: item.priceId,
      quantity: item.quantity || 1
    }))
    return this
  }

  /**
   * Set success URL
   */
  withSuccessUrl(url: string): this {
    this.config.success_url = url
    return this
  }

  /**
   * Set cancel URL
   */
  withCancelUrl(url: string): this {
    this.config.cancel_url = url
    return this
  }

  /**
   * Set existing customer
   */
  withCustomer(customerId: string): this {
    this.config.customer = customerId
    return this
  }

  /**
   * Set customer email (for new customers)
   */
  withCustomerEmail(email: string): this {
    this.config.customer_email = email
    return this
  }

  /**
   * Add metadata
   */
  withMetadata(metadata: Record<string, string>): this {
    this.config.metadata = { ...this.config.metadata, ...metadata }
    return this
  }

  /**
   * Set trial period
   */
  withTrialPeriod(days: number): this {
    if (!this.config.subscription_data) {
      this.config.subscription_data = {}
    }
    this.config.subscription_data.trial_period_days = days
    return this
  }

  /**
   * Add subscription metadata
   */
  withSubscriptionMetadata(metadata: Record<string, string>): this {
    if (!this.config.subscription_data) {
      this.config.subscription_data = {}
    }
    this.config.subscription_data.metadata = {
      ...this.config.subscription_data.metadata,
      ...metadata
    }
    return this
  }

  /**
   * Enable/disable promotion codes
   */
  withPromotionCodes(enabled: boolean = true): this {
    this.config.allow_promotion_codes = enabled
    return this
  }

  /**
   * Enable/disable automatic tax
   */
  withAutomaticTax(enabled: boolean = true): this {
    this.config.automatic_tax = { enabled }
    return this
  }

  /**
   * Enable tax ID collection
   */
  withTaxIdCollection(enabled: boolean = true): this {
    this.config.tax_id_collection = { enabled }
    return this
  }

  /**
   * Set checkout mode
   */
  withMode(mode: 'payment' | 'setup' | 'subscription'): this {
    this.config.mode = mode
    return this
  }

  /**
   * Build for subscription checkout
   */
  buildSubscription(): CheckoutSessionConfig {
    if (!this.config.line_items || this.config.line_items.length === 0) {
      throw new Error('At least one line item is required for subscription checkout')
    }

    if (!this.config.success_url) {
      throw new Error('Success URL is required')
    }

    if (!this.config.cancel_url) {
      throw new Error('Cancel URL is required')
    }

    if (!this.config.customer && !this.config.customer_email) {
      throw new Error('Either customer ID or customer email is required')
    }

    return {
      ...this.config,
      mode: 'subscription'
    } as CheckoutSessionConfig
  }

  /**
   * Build for one-time payment
   */
  buildPayment(): CheckoutSessionConfig {
    if (!this.config.line_items || this.config.line_items.length === 0) {
      throw new Error('At least one line item is required for payment checkout')
    }

    if (!this.config.success_url) {
      throw new Error('Success URL is required')
    }

    if (!this.config.cancel_url) {
      throw new Error('Cancel URL is required')
    }

    // Remove subscription-specific fields
    const { subscription_data, ...paymentConfig } = this.config

    return {
      ...paymentConfig,
      mode: 'payment'
    } as CheckoutSessionConfig
  }

  /**
   * Create a pre-configured subscription builder
   */
  static forSubscription(): CheckoutBuilder {
    return new CheckoutBuilder().withMode('subscription')
  }

  /**
   * Create a pre-configured payment builder
   */
  static forPayment(): CheckoutBuilder {
    return new CheckoutBuilder().withMode('payment')
  }

  /**
   * Create a builder with organization defaults
   */
  static forOrganization(
    organizationId: string,
    organizationName?: string,
    customerEmail?: string
  ): CheckoutBuilder {
    const builder = new CheckoutBuilder()
      .withMetadata({
        organization_id: organizationId,
        ...(organizationName && { organization_name: organizationName })
      })
      .withSubscriptionMetadata({
        organization_id: organizationId,
        ...(organizationName && { organization_name: organizationName })
      })

    if (customerEmail) {
      builder.withCustomerEmail(customerEmail)
    }

    return builder
  }

  /**
   * Validate current configuration
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!this.config.line_items || this.config.line_items.length === 0) {
      errors.push('At least one line item is required')
    }

    if (!this.config.success_url) {
      errors.push('Success URL is required')
    }

    if (!this.config.cancel_url) {
      errors.push('Cancel URL is required')
    }

    if (!this.config.customer && !this.config.customer_email) {
      errors.push('Either customer ID or customer email is required')
    }

    // Mode-specific validations
    if (this.config.mode === 'subscription') {
      // Subscription-specific validations
      if (this.config.subscription_data?.trial_period_days && this.config.subscription_data.trial_period_days < 0) {
        errors.push('Trial period days cannot be negative')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Clone the builder
   */
  clone(): CheckoutBuilder {
    const cloned = new CheckoutBuilder()
    cloned.config = JSON.parse(JSON.stringify(this.config))
    return cloned
  }
}