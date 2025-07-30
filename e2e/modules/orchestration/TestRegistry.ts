import { Page } from '@playwright/test'
import { BaseModule } from '../base/BaseModule'

export interface ModuleRegistration {
  name: string
  moduleClass: new (page: Page, config?: any) => BaseModule
  defaultConfig?: any
  description?: string
  version?: string
}

export class TestRegistry {
  private static instance: TestRegistry
  private modules: Map<string, ModuleRegistration> = new Map()
  private aliases: Map<string, string> = new Map()

  static getInstance(): TestRegistry {
    if (!TestRegistry.instance) {
      TestRegistry.instance = new TestRegistry()
      TestRegistry.instance.registerCoreModules()
    }
    return TestRegistry.instance
  }

  /**
   * Register a module
   */
  register(registration: ModuleRegistration): void {
    this.modules.set(registration.name, registration)
  }

  /**
   * Register module with alias
   */
  registerWithAlias(registration: ModuleRegistration, alias: string): void {
    this.register(registration)
    this.aliases.set(alias, registration.name)
  }

  /**
   * Get module class by name
   */
  getModuleClass(name: string): (new (page: Page, config?: any) => BaseModule) | undefined {
    const moduleName = this.aliases.get(name) || name
    const registration = this.modules.get(moduleName)
    return registration?.moduleClass
  }

  /**
   * Create module instance
   */
  createModule(name: string, page: Page, config?: any): BaseModule {
    const ModuleClass = this.getModuleClass(name)
    if (!ModuleClass) {
      throw new Error(`Module '${name}' not found in registry`)
    }

    const registration = this.modules.get(this.aliases.get(name) || name)!
    const finalConfig = { ...registration.defaultConfig, ...config }
    
    return new ModuleClass(page, finalConfig)
  }

  /**
   * Check if module exists
   */
  hasModule(name: string): boolean {
    const moduleName = this.aliases.get(name) || name
    return this.modules.has(moduleName)
  }

  /**
   * List all registered modules
   */
  listModules(): ModuleRegistration[] {
    return Array.from(this.modules.values())
  }

  /**
   * Get module info
   */
  getModuleInfo(name: string): ModuleRegistration | undefined {
    const moduleName = this.aliases.get(name) || name
    return this.modules.get(moduleName)
  }

  /**
   * Register core modules
   */
  private registerCoreModules(): void {
    // Import modules dynamically to avoid circular dependencies
    try {
      const { AuthModule } = require('../auth/AuthModule')
      this.register({
        name: 'auth',
        moduleClass: AuthModule,
        description: 'Authentication and user management',
        version: '1.0.0'
      })
      this.registerWithAlias({ name: 'auth', moduleClass: AuthModule }, 'authentication')

      const { OrganizationModule } = require('../organization/OrganizationModule')
      this.register({
        name: 'organization',
        moduleClass: OrganizationModule,
        description: 'Organization and multi-tenant management',
        version: '1.0.0'
      })
      this.registerWithAlias({ name: 'organization', moduleClass: OrganizationModule }, 'org')

      const { StripeModule } = require('../billing/StripeModule')
      this.register({
        name: 'stripe',
        moduleClass: StripeModule,
        description: 'Stripe payment integration',
        version: '1.0.0',
        defaultConfig: { testMode: true }
      })

      const { PaymentFlowModule } = require('../billing/PaymentFlowModule')
      this.register({
        name: 'payment-flow',
        moduleClass: PaymentFlowModule,
        description: 'End-to-end payment flows',
        version: '1.0.0'
      })
      this.registerWithAlias({ name: 'payment-flow', moduleClass: PaymentFlowModule }, 'payment')

      const { WebhookModule } = require('../billing/WebhookModule')
      this.register({
        name: 'webhook',
        moduleClass: WebhookModule,
        description: 'Webhook testing and validation',
        version: '1.0.0'
      })
    } catch (error) {
      console.warn('Failed to register some core modules:', error.message)
    }
  }

  /**
   * Unregister module
   */
  unregister(name: string): boolean {
    const moduleName = this.aliases.get(name) || name
    
    // Remove aliases pointing to this module
    for (const [alias, target] of this.aliases.entries()) {
      if (target === moduleName) {
        this.aliases.delete(alias)
      }
    }
    
    return this.modules.delete(moduleName)
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.modules.clear()
    this.aliases.clear()
  }

  /**
   * Get modules by category
   */
  getModulesByCategory(category: string): ModuleRegistration[] {
    return Array.from(this.modules.values()).filter(reg => 
      reg.name.includes(category) || reg.description?.includes(category)
    )
  }
}

// Singleton instance
export const registry = TestRegistry.getInstance()

// Helper functions for common usage
export function getModule(name: string, page: Page, config?: any): BaseModule {
  return registry.createModule(name, page, config)
}

export function hasModule(name: string): boolean {
  return registry.hasModule(name)
}

export function listModules(): ModuleRegistration[] {
  return registry.listModules()
}