import { Page, BrowserContext, expect } from '@playwright/test'

export interface ModuleConfig {
  [key: string]: any
}

export interface ModuleDependency {
  name: string
  required: boolean
}

export abstract class BaseModule {
  protected page: Page
  protected context: BrowserContext
  protected config: ModuleConfig
  protected dependencies: Map<string, BaseModule> = new Map()
  protected isInitialized = false

  constructor(
    page: Page, 
    config: ModuleConfig = {},
    context?: BrowserContext
  ) {
    this.page = page
    this.context = context || page.context()
    this.config = config
  }

  /**
   * Define module dependencies
   */
  protected abstract getDependencies(): ModuleDependency[]

  /**
   * Initialize the module
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    await this.setupDependencies()
    await this.setup()
    this.isInitialized = true
  }

  /**
   * Setup module-specific initialization
   */
  protected async setup(): Promise<void> {
    // Override in subclasses
  }

  /**
   * Cleanup module resources
   */
  async cleanup(): Promise<void> {
    await this.teardown()
    this.dependencies.clear()
    this.isInitialized = false
  }

  /**
   * Module-specific cleanup
   */
  protected async teardown(): Promise<void> {
    // Override in subclasses
  }

  /**
   * Add a dependency module
   */
  addDependency(name: string, module: BaseModule): void {
    this.dependencies.set(name, module)
  }

  /**
   * Get a dependency module
   */
  protected getDependency<T extends BaseModule>(name: string): T {
    const dependency = this.dependencies.get(name)
    if (!dependency) {
      throw new Error(`Dependency '${name}' not found`)
    }
    return dependency as T
  }

  /**
   * Check if dependency exists
   */
  protected hasDependency(name: string): boolean {
    return this.dependencies.has(name)
  }

  /**
   * Wait for element with enhanced error handling
   */
  protected async waitForElement(
    selector: string, 
    options: {
      timeout?: number
      state?: 'visible' | 'hidden' | 'attached'
    } = {}
  ): Promise<void> {
    try {
      await this.page.waitForSelector(selector, {
        timeout: options.timeout || 10000,
        state: options.state || 'visible'
      })
    } catch (error) {
      throw new Error(`Element '${selector}' not found: ${error.message}`)
    }
  }

  /**
   * Enhanced click with waiting
   */
  protected async clickElement(
    selector: string,
    options: {
      timeout?: number
      force?: boolean
    } = {}
  ): Promise<void> {
    await this.waitForElement(selector)
    await this.page.click(selector, {
      timeout: options.timeout || 10000,
      force: options.force
    })
  }

  /**
   * Enhanced fill with waiting
   */
  protected async fillElement(
    selector: string, 
    value: string,
    options: {
      timeout?: number
      clear?: boolean
    } = {}
  ): Promise<void> {
    await this.waitForElement(selector)
    
    if (options.clear !== false) {
      await this.page.fill(selector, '')
    }
    
    await this.page.fill(selector, value, {
      timeout: options.timeout || 10000
    })
  }

  /**
   * Take screenshot for debugging
   */
  protected async takeScreenshot(name: string): Promise<void> {
    const timestamp = Date.now()
    await this.page.screenshot({
      path: `test-results/modules/${this.constructor.name}/${name}-${timestamp}.png`,
      fullPage: true
    })
  }

  /**
   * Log module action
   */
  protected log(action: string, details?: any): void {
    console.log(`[${this.constructor.name}] ${action}`, details || '')
  }

  /**
   * Wait for network idle
   */
  protected async waitForNetworkIdle(timeout = 5000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout })
  }

  /**
   * Execute JavaScript in page context
   */
  protected async executeScript<T>(script: string | Function, ...args: any[]): Promise<T> {
    return await this.page.evaluate(script, ...args)
  }

  /**
   * Setup dependencies automatically
   */
  private async setupDependencies(): Promise<void> {
    const deps = this.getDependencies()
    
    for (const dep of deps) {
      if (!this.hasDependency(dep.name) && dep.required) {
        throw new Error(`Required dependency '${dep.name}' not provided`)
      }
      
      const dependency = this.dependencies.get(dep.name)
      if (dependency && !dependency.isInitialized) {
        await dependency.initialize()
      }
    }
  }

  /**
   * Assert element is visible
   */
  protected async assertVisible(selector: string, message?: string): Promise<void> {
    await expect(this.page.locator(selector), message).toBeVisible()
  }

  /**
   * Assert element contains text
   */
  protected async assertText(selector: string, text: string, message?: string): Promise<void> {
    await expect(this.page.locator(selector), message).toContainText(text)
  }

  /**
   * Assert URL matches pattern
   */
  protected async assertURL(pattern: string | RegExp, message?: string): Promise<void> {
    await expect(this.page, message).toHaveURL(pattern)
  }

  /**
   * Get current URL
   */
  protected getCurrentURL(): string {
    return this.page.url()
  }

  /**
   * Navigate to URL
   */
  protected async navigateTo(url: string): Promise<void> {
    await this.page.goto(url)
    await this.waitForNetworkIdle()
  }

  /**
   * Wait for specific amount of time
   */
  protected async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms)
  }

  /**
   * Get element attribute
   */
  protected async getAttribute(selector: string, attribute: string): Promise<string | null> {
    return await this.page.getAttribute(selector, attribute)
  }

  /**
   * Get element text content
   */
  protected async getTextContent(selector: string): Promise<string | null> {
    return await this.page.textContent(selector)
  }

  /**
   * Check if element exists
   */
  protected async elementExists(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { timeout: 1000 })
      return true
    } catch {
      return false
    }
  }

  /**
   * Module health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Basic page responsiveness check
      await this.page.evaluate(() => document.readyState)
      return true
    } catch {
      return false
    }
  }
}