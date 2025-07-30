import { BaseModule, ModuleDependency } from '../base/BaseModule'
import { TestUser, TestDataManager } from '../base/TestData'

export interface AuthConfig {
  baseURL?: string
  loginPath?: string
  registerPath?: string
  skipEmailVerification?: boolean
  autoCreateTestUsers?: boolean
}

export class AuthModule extends BaseModule {
  private testData: TestDataManager
  private currentUser: TestUser | null = null
  private sessionState: any = null

  constructor(page, config: AuthConfig = {}) {
    super(page, {
      baseURL: 'http://localhost:3010',
      loginPath: '/auth/sign-in',
      registerPath: '/auth/sign-up',
      skipEmailVerification: true,
      autoCreateTestUsers: true,
      ...config
    })
    this.testData = TestDataManager.getInstance()
  }

  protected getDependencies(): ModuleDependency[] {
    return [] // Auth module has no dependencies
  }

  protected async setup(): Promise<void> {
    this.log('Initializing authentication module')
    
    // Setup console logging for auth errors
    this.page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('auth')) {
        console.error(`Auth error: ${msg.text()}`)
      }
    })
  }

  /**
   * Register a new user
   */
  async registerUser(userData?: Partial<TestUser>): Promise<TestUser> {
    const user = this.testData.generateUser(userData)
    this.log('Registering user', user.email)

    await this.navigateTo(`${this.config.baseURL}${this.config.registerPath}`)
    
    // Fill registration form
    await this.fillElement('[data-testid="signup-first-name-input"]', user.firstName)
    await this.fillElement('[data-testid="signup-last-name-input"]', user.lastName)
    await this.fillElement('[data-testid="signup-email-input"]', user.email)
    await this.fillElement('[data-testid="signup-password-input"]', user.password)
    await this.fillElement('[data-testid="signup-confirm-password-input"]', user.password)
    
    // Accept terms
    await this.clickElement('[data-testid="signup-terms-checkbox"]')
    
    // Submit registration
    await this.clickElement('[data-testid="signup-submit-button"]')
    
    if (this.config.skipEmailVerification) {
      // Wait for registration success or redirect
      await this.page.waitForURL(/\/(dashboard|onboarding|verify-email)/, { timeout: 15000 })
      
      // If redirected to email verification, skip it
      if (this.getCurrentURL().includes('verify-email')) {
        await this.skipEmailVerification()
      }
    } else {
      // Wait for email verification message
      await this.waitForElement('[data-testid="signup-success-message"]')
    }

    this.currentUser = user
    this.log('User registered successfully', user.email)
    return user
  }

  /**
   * Login with existing user
   */
  async loginUser(email: string, password: string): Promise<void> {
    this.log('Logging in user', email)

    await this.navigateTo(`${this.config.baseURL}${this.config.loginPath}`)
    
    // Fill login form
    await this.fillElement('[data-testid="login-email-input"]', email)
    await this.fillElement('[data-testid="login-password-input"]', password)
    
    // Submit login
    await this.clickElement('[data-testid="login-submit-button"]')
    
    // Wait for successful login
    await this.page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 })
    
    // Set current user
    const user = this.testData.getUser(email)
    if (user) {
      this.currentUser = user
    }

    this.log('User logged in successfully', email)
  }

  /**
   * Login with test user data
   */
  async loginAsUser(user: TestUser): Promise<void> {
    await this.loginUser(user.email, user.password)
  }

  /**
   * Create and login a new user in one step
   */
  async createAndLoginUser(userData?: Partial<TestUser>): Promise<TestUser> {
    const user = await this.registerUser(userData)
    await this.loginAsUser(user)
    return user
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    this.log('Logging out user')
    
    // Look for logout button or menu
    if (await this.elementExists('[data-testid="user-menu-button"]')) {
      await this.clickElement('[data-testid="user-menu-button"]')
      await this.clickElement('[data-testid="logout-button"]')
    } else if (await this.elementExists('[data-testid="logout-button"]')) {
      await this.clickElement('[data-testid="logout-button"]')
    } else {
      // Navigate to logout URL if button not found
      await this.navigateTo(`${this.config.baseURL}/auth/logout`)
    }
    
    // Wait for redirect to login page
    await this.page.waitForURL(/\/auth\/(sign-in|login)/, { timeout: 10000 })
    
    this.currentUser = null
    this.sessionState = null
    this.log('User logged out successfully')
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      // Check for authenticated user indicators
      const indicators = [
        '[data-testid="user-menu"]',
        '[data-testid="user-avatar"]',
        '[data-testid="dashboard-content"]',
        '.user-authenticated'
      ]

      for (const indicator of indicators) {
        if (await this.elementExists(indicator)) {
          return true
        }
      }

      // Check URL patterns
      const url = this.getCurrentURL()
      const authenticatedPaths = ['/dashboard', '/settings', '/billing', '/profile']
      return authenticatedPaths.some(path => url.includes(path))
    } catch {
      return false
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): TestUser | null {
    return this.currentUser
  }

  /**
   * Verify user is on dashboard
   */
  async verifyOnDashboard(): Promise<void> {
    await this.assertURL(/\/dashboard/)
    await this.assertVisible('[data-testid="dashboard-content"]', 'Dashboard content should be visible')
  }

  /**
   * Verify user is logged out
   */
  async verifyLoggedOut(): Promise<void> {
    await this.assertURL(/\/auth\/(sign-in|login)/)
    await this.assertVisible('[data-testid="login-form"]', 'Login form should be visible')
  }

  /**
   * Skip email verification (for testing)
   */
  async skipEmailVerification(): Promise<void> {
    if (this.config.skipEmailVerification) {
      // In a real scenario, this might involve direct database updates
      // or using a test-specific verification endpoint
      this.log('Skipping email verification')
      
      // Simulate email verification completion
      await this.navigateTo(`${this.config.baseURL}/dashboard`)
    }
  }

  /**
   * Reset password flow
   */
  async resetPassword(email: string): Promise<void> {
    this.log('Initiating password reset', email)
    
    await this.navigateTo(`${this.config.baseURL}/auth/forgot-password`)
    await this.fillElement('[data-testid="reset-email-input"]', email)
    await this.clickElement('[data-testid="reset-submit-button"]')
    
    // Wait for success message
    await this.waitForElement('[data-testid="reset-success-message"]')
    this.log('Password reset initiated')
  }

  /**
   * Change password (when authenticated)
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    this.log('Changing password')
    
    await this.navigateTo(`${this.config.baseURL}/settings/security`)
    await this.fillElement('[data-testid="current-password-input"]', currentPassword)
    await this.fillElement('[data-testid="new-password-input"]', newPassword)
    await this.fillElement('[data-testid="confirm-password-input"]', newPassword)
    await this.clickElement('[data-testid="change-password-button"]')
    
    // Wait for success message
    await this.waitForElement('[data-testid="password-changed-message"]')
    
    // Update current user password
    if (this.currentUser) {
      this.currentUser.password = newPassword
    }
    
    this.log('Password changed successfully')
  }

  /**
   * Get user session information
   */
  async getSessionInfo(): Promise<any> {
    return await this.executeScript(() => {
      // This would depend on how sessions are stored in your app
      return {
        user: window.localStorage.getItem('user'),
        session: window.localStorage.getItem('session'),
        tokens: window.localStorage.getItem('tokens')
      }
    })
  }

  /**
   * Clear session storage
   */
  async clearSession(): Promise<void> {
    await this.executeScript(() => {
      window.localStorage.clear()
      window.sessionStorage.clear()
    })
    this.currentUser = null
    this.sessionState = null
  }

  /**
   * Validate user permissions
   */
  async hasPermission(permission: string): Promise<boolean> {
    try {
      const userInfo = await this.getSessionInfo()
      // This would depend on your permission system
      return userInfo?.permissions?.includes(permission) || false
    } catch {
      return false
    }
  }

  /**
   * Wait for authentication to complete
   */
  async waitForAuth(timeout = 10000): Promise<void> {
    let authenticated = false
    const startTime = Date.now()
    
    while (!authenticated && (Date.now() - startTime) < timeout) {
      authenticated = await this.isAuthenticated()
      if (!authenticated) {
        await this.wait(500)
      }
    }
    
    if (!authenticated) {
      throw new Error('Authentication timeout')
    }
  }

  /**
   * Setup test user for other modules
   */
  async setupTestUser(userData?: Partial<TestUser>): Promise<TestUser> {
    // Check if already authenticated
    if (await this.isAuthenticated() && this.currentUser) {
      return this.currentUser
    }
    
    // Create and login new user
    return await this.createAndLoginUser(userData)
  }

  protected async teardown(): Promise<void> {
    if (this.currentUser) {
      try {
        await this.logout()
      } catch (error) {
        this.log('Error during logout', error)
      }
    }
    await this.clearSession()
  }

  /**
   * Health check for auth module
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Check if we can access auth pages
      await this.navigateTo(`${this.config.baseURL}${this.config.loginPath}`)
      await this.waitForElement('[data-testid="login-form"]')
      return true
    } catch {
      return false
    }
  }
}