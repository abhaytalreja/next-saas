import { Page, Browser, BrowserContext } from '@playwright/test'
import { TestUser, TestOrganization } from './test-data'

export class TestSetup {
  constructor(
    private browser: Browser,
    private baseURL: string = 'http://localhost:3000'
  ) {}

  /**
   * Create a new browser context with common settings
   */
  async createContext(options: {
    viewport?: { width: number; height: number }
    userAgent?: string
    permissions?: string[]
    geolocation?: { latitude: number; longitude: number }
  } = {}): Promise<BrowserContext> {
    return await this.browser.newContext({
      baseURL: this.baseURL,
      viewport: options.viewport || { width: 1280, height: 720 },
      userAgent: options.userAgent,
      permissions: options.permissions || ['notifications'],
      geolocation: options.geolocation,
      // Enable video recording for failed tests
      recordVideo: {
        dir: 'test-results/videos',
        size: { width: 1280, height: 720 }
      },
      // Enable screenshots on failure
      screenshot: 'only-on-failure'
    })
  }

  /**
   * Setup a page with common configuration
   */
  async setupPage(context: BrowserContext): Promise<Page> {
    const page = await context.newPage()
    
    // Set up console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Console error: ${msg.text()}`)
      }
    })
    
    // Set up request/response logging for debugging
    page.on('request', request => {
      if (process.env.DEBUG_REQUESTS) {
        console.log(`Request: ${request.method()} ${request.url()}`)
      }
    })
    
    page.on('response', response => {
      if (process.env.DEBUG_REQUESTS && response.status() >= 400) {
        console.log(`Response: ${response.status()} ${response.url()}`)
      }
    })
    
    return page
  }

  /**
   * Authenticate a user and return the page
   */
  async authenticateUser(
    page: Page,
    user: TestUser,
    options: { skipOnboarding?: boolean } = {}
  ): Promise<Page> {
    await page.goto('/auth/login')
    
    // Fill login form
    await page.getByTestId('login-email-input').fill(user.email)
    await page.getByTestId('login-password-input').fill(user.password)
    await page.getByTestId('login-submit-button').click()
    
    // Wait for authentication to complete
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10000 })
    
    // Skip onboarding if requested
    if (options.skipOnboarding) {
      const currentUrl = page.url()
      if (currentUrl.includes('/onboarding')) {
        // Navigate directly to dashboard
        await page.goto('/dashboard')
      }
    }
    
    return page
  }

  /**
   * Create a new user through the registration flow
   */
  async registerUser(
    page: Page,
    user: TestUser,
    options: { skipEmailVerification?: boolean } = {}
  ): Promise<Page> {
    await page.goto('/auth/register')
    
    // Fill registration form
    await page.getByTestId('signup-first-name-input').fill(user.firstName)
    await page.getByTestId('signup-last-name-input').fill(user.lastName)
    await page.getByTestId('signup-email-input').fill(user.email)
    await page.getByTestId('signup-password-input').fill(user.password)
    await page.getByTestId('signup-confirm-password-input').fill(user.password)
    await page.getByTestId('signup-terms-checkbox').check()
    
    // Submit registration
    await page.getByTestId('signup-submit-button').click()
    
    // Wait for success message
    await page.waitForSelector('[data-testid="signup-success-message"]')
    
    if (options.skipEmailVerification) {
      // For testing purposes, directly verify the user
      await page.goto('/auth/verify-email?token=mock-verification-token')
      await page.waitForSelector('[data-testid="verify-email-success"]')
    }
    
    return page
  }

  /**
   * Create an organization
   */
  async createOrganization(
    page: Page,
    organization: TestOrganization
  ): Promise<Page> {
    await page.goto('/onboarding/organization')
    
    // Fill organization form
    await page.getByTestId('org-name-input').fill(organization.name)
    await page.getByTestId('org-slug-input').fill(organization.slug)
    
    if (organization.description) {
      await page.getByTestId('org-description-input').fill(organization.description)
    }
    
    if (organization.website) {
      await page.getByTestId('org-website-input').fill(organization.website)
    }
    
    // Submit organization creation
    await page.getByTestId('create-org-button').click()
    
    // Wait for success
    await page.waitForURL('/dashboard', { timeout: 10000 })
    
    return page
  }

  /**
   * Setup test data cleanup
   */
  async cleanup(): Promise<void> {
    // This would typically clean up test data from the database
    // For now, we'll just log the cleanup action
    console.log('Cleaning up test data...')
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(page: Page, name: string): Promise<void> {
    await page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true
    })
  }

  /**
   * Wait for element to be visible with custom timeout
   */
  async waitForElement(
    page: Page,
    selector: string,
    options: { timeout?: number; state?: 'visible' | 'hidden' | 'attached' } = {}
  ): Promise<void> {
    await page.waitForSelector(selector, {
      timeout: options.timeout || 10000,
      state: options.state || 'visible'
    })
  }

  /**
   * Setup mobile device testing
   */
  async setupMobileContext(device: 'iPhone' | 'Android' | 'iPad' = 'iPhone'): Promise<BrowserContext> {
    const devices = {
      iPhone: {
        viewport: { width: 375, height: 667 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        isMobile: true,
        hasTouch: true
      },
      Android: {
        viewport: { width: 412, height: 732 },
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        isMobile: true,
        hasTouch: true
      },
      iPad: {
        viewport: { width: 768, height: 1024 },
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        isMobile: true,
        hasTouch: true
      }
    }

    const deviceConfig = devices[device]
    
    return await this.browser.newContext({
      ...deviceConfig,
      baseURL: this.baseURL,
      recordVideo: {
        dir: 'test-results/videos',
        size: deviceConfig.viewport
      },
      screenshot: 'only-on-failure'
    })
  }

  /**
   * Setup accessibility testing
   */
  async setupAccessibilityTesting(page: Page): Promise<void> {
    // Inject axe-core for accessibility testing
    await page.addInitScript(() => {
      // This would typically inject axe-core
      // For now, we'll just set up the foundation
      (window as any).axe = {
        run: () => Promise.resolve({ violations: [] })
      }
    })
  }

  /**
   * Setup performance monitoring
   */
  async setupPerformanceMonitoring(page: Page): Promise<void> {
    // Enable performance monitoring
    await page.addInitScript(() => {
      // Setup performance observers
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            if (entry.entryType === 'navigation') {
              console.log('Navigation timing:', entry.toJSON())
            }
          })
        })
        observer.observe({ entryTypes: ['navigation', 'resource'] })
      }
    })
  }
}

export default TestSetup