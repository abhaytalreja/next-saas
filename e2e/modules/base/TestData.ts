import { faker } from '@faker-js/faker'

export interface TestUser {
  id?: string
  email: string
  password: string
  firstName: string
  lastName: string
  displayName: string
  bio?: string
}

export interface TestOrganization {
  id?: string
  name: string
  slug: string
  description?: string
  website?: string
  email?: string
}

export interface TestPayment {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvc: string
  name: string
  email: string
  country: string
  postalCode: string
}

export interface TestSubscription {
  priceId: string
  planName: string
  amount: number
  currency: string
  interval: 'month' | 'year'
  trialDays?: number
}

export class TestDataManager {
  private static instance: TestDataManager
  private users: Map<string, TestUser> = new Map()
  private organizations: Map<string, TestOrganization> = new Map()
  private cleanup: Array<() => Promise<void>> = []

  static getInstance(): TestDataManager {
    if (!TestDataManager.instance) {
      TestDataManager.instance = new TestDataManager()
    }
    return TestDataManager.instance
  }

  /**
   * Generate test user data
   */
  generateUser(overrides: Partial<TestUser> = {}): TestUser {
    const user: TestUser = {
      id: faker.string.uuid(),
      email: faker.internet.email().toLowerCase(),
      password: 'Test123!@#',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      displayName: faker.internet.username().toLowerCase(),
      bio: faker.lorem.sentence(),
      ...overrides
    }

    this.users.set(user.email, user)
    return user
  }

  /**
   * Generate test organization data
   */
  generateOrganization(overrides: Partial<TestOrganization> = {}): TestOrganization {
    const companyName = faker.company.name()
    const org: TestOrganization = {
      id: faker.string.uuid(),
      name: companyName,
      slug: faker.helpers.slugify(companyName).toLowerCase(),
      description: faker.company.catchPhrase(),
      website: faker.internet.url(),
      email: faker.internet.email().toLowerCase(),
      ...overrides
    }

    this.organizations.set(org.slug, org)
    return org
  }

  /**
   * Generate Stripe test card data
   */
  generateTestCard(type: 'success' | 'decline' | '3ds' | 'insufficient_funds' = 'success'): TestPayment {
    const cardNumbers = {
      success: '4242424242424242',
      decline: '4000000000000002',
      '3ds': '4000000000003220',
      insufficient_funds: '4000000000009995'
    }

    return {
      cardNumber: cardNumbers[type],
      expiryMonth: '12',
      expiryYear: '2030',
      cvc: '123',
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      country: 'US',
      postalCode: faker.location.zipCode()
    }
  }

  /**
   * Generate subscription test data
   */
  generateSubscription(overrides: Partial<TestSubscription> = {}): TestSubscription {
    const plans = [
      {
        priceId: 'price_starter_monthly',
        planName: 'Starter',
        amount: 2900, // $29.00
        currency: 'usd',
        interval: 'month' as const
      },
      {
        priceId: 'price_pro_monthly',
        planName: 'Pro',
        amount: 9900, // $99.00
        currency: 'usd',
        interval: 'month' as const
      },
      {
        priceId: 'price_enterprise_yearly',
        planName: 'Enterprise',
        amount: 199900, // $1999.00
        currency: 'usd',
        interval: 'year' as const
      }
    ]

    const basePlan = faker.helpers.arrayElement(plans)
    return {
      ...basePlan,
      trialDays: faker.helpers.maybe(() => faker.number.int({ min: 7, max: 30 })),
      ...overrides
    }
  }

  /**
   * Get user by email
   */
  getUser(email: string): TestUser | undefined {
    return this.users.get(email)
  }

  /**
   * Get organization by slug
   */
  getOrganization(slug: string): TestOrganization | undefined {
    return this.organizations.get(slug)
  }

  /**
   * Get all generated users
   */
  getAllUsers(): TestUser[] {
    return Array.from(this.users.values())
  }

  /**
   * Get all generated organizations
   */
  getAllOrganizations(): TestOrganization[] {
    return Array.from(this.organizations.values())
  }

  /**
   * Register cleanup function
   */
  registerCleanup(cleanupFn: () => Promise<void>): void {
    this.cleanup.push(cleanupFn)
  }

  /**
   * Execute all cleanup functions
   */
  async executeCleanup(): Promise<void> {
    for (const cleanupFn of this.cleanup) {
      try {
        await cleanupFn()
      } catch (error) {
        console.error('Cleanup error:', error)
      }
    }
    this.cleanup = []
    this.users.clear()
    this.organizations.clear()
  }

  /**
   * Generate unique test identifier
   */
  generateTestId(prefix = 'test'): string {
    return `${prefix}_${Date.now()}_${faker.string.alphanumeric(6)}`
  }

  /**
   * Generate random API key format
   */
  generateApiKey(prefix = 'sk_test'): string {
    return `${prefix}_${faker.string.alphanumeric(24)}`
  }

  /**
   * Generate webhook signature
   */
  generateWebhookSignature(): string {
    const timestamp = Math.floor(Date.now() / 1000)
    const signature = faker.string.alphanumeric(64)
    return `t=${timestamp},v1=${signature}`
  }

  /**
   * Generate mock webhook event
   */
  generateWebhookEvent(type: string, data: any = {}): any {
    return {
      id: `evt_${faker.string.alphanumeric(24)}`,
      object: 'event',
      api_version: '2023-10-16',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: data
      },
      livemode: false,
      pending_webhooks: 1,
      request: {
        id: `req_${faker.string.alphanumeric(24)}`,
        idempotency_key: null
      },
      type
    }
  }

  /**
   * Generate checkout session data
   */
  generateCheckoutSession(overrides: any = {}): any {
    return {
      id: `cs_${faker.string.alphanumeric(24)}`,
      object: 'checkout.session',
      amount_subtotal: 2900,
      amount_total: 2900,
      currency: 'usd',
      customer: `cus_${faker.string.alphanumeric(14)}`,
      mode: 'subscription',
      payment_status: 'paid',
      status: 'complete',
      subscription: `sub_${faker.string.alphanumeric(14)}`,
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
      url: `https://checkout.stripe.com/c/pay/cs_${faker.string.alphanumeric(24)}`,
      ...overrides
    }
  }

  /**
   * Create test environment data set
   */
  createTestEnvironment(): {
    user: TestUser
    organization: TestOrganization
    subscription: TestSubscription
    card: TestPayment
  } {
    return {
      user: this.generateUser(),
      organization: this.generateOrganization(),
      subscription: this.generateSubscription(),
      card: this.generateTestCard()
    }
  }
}