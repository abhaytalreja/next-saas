// Base modules
export { BaseModule } from './base/BaseModule'
export { TestDataManager } from './base/TestData'
export type { 
  TestUser, 
  TestOrganization, 
  TestPayment, 
  TestSubscription 
} from './base/TestData'

// Authentication module
export { AuthModule } from './auth/AuthModule'
export type { AuthConfig } from './auth/AuthModule'

// Organization module
export { OrganizationModule } from './organization/OrganizationModule'
export type { OrganizationConfig } from './organization/OrganizationModule'

// Billing modules
export { StripeModule } from './billing/StripeModule'
export { PaymentFlowModule } from './billing/PaymentFlowModule'
export { WebhookModule } from './billing/WebhookModule'
export type { 
  StripeConfig,
  StripeCheckoutSession 
} from './billing/StripeModule'
export type { 
  PaymentFlowConfig,
  PaymentFlowResult 
} from './billing/PaymentFlowModule'
export type { 
  WebhookConfig,
  WebhookTestResult 
} from './billing/WebhookModule'

// Orchestration modules
export { TestSequence } from './orchestration/TestSequence'
export { TestRegistry, registry, getModule, hasModule, listModules } from './orchestration/TestRegistry'
export type { 
  TestStep,
  SequenceResult,
  SequenceOptions 
} from './orchestration/TestSequence'
export type { ModuleRegistration } from './orchestration/TestRegistry'

// Helper functions for common patterns
export const createTestEnvironment = () => {
  const testData = TestDataManager.getInstance()
  return testData.createTestEnvironment()
}

export const createPaymentFlowSequence = () => {
  // Import here to avoid circular dependencies
  const { AuthModule } = require('./auth/AuthModule')
  const { OrganizationModule } = require('./organization/OrganizationModule')
  const { PaymentFlowModule } = require('./billing/PaymentFlowModule')
  const { TestSequence } = require('./orchestration/TestSequence')

  return new TestSequence.TestSequence()
    .step('setup-auth', AuthModule, 'setupTestUser')
    .step('setup-organization', OrganizationModule, 'setupOrganization')
    .step('complete-payment', PaymentFlowModule, 'basicSubscriptionFlow', { planType: 'starter' })
}

export const createBillingTestSequence = () => {
  // Import here to avoid circular dependencies
  const { AuthModule } = require('./auth/AuthModule')
  const { OrganizationModule } = require('./organization/OrganizationModule')
  const { PaymentFlowModule } = require('./billing/PaymentFlowModule')
  const { WebhookModule } = require('./billing/WebhookModule')
  const { TestSequence } = require('./orchestration/TestSequence')

  return new TestSequence.TestSequence()
    .step('setup-auth', AuthModule, 'setupTestUser')
    .step('setup-organization', OrganizationModule, 'setupOrganization')
    .step('test-subscription', PaymentFlowModule, 'basicSubscriptionFlow')
    .step('test-upgrade', PaymentFlowModule, 'subscriptionUpgradeFlow', { fromPlan: 'starter', toPlan: 'pro' })
    .step('test-webhooks', WebhookModule, 'runWebhookTestSuite')
    .optionalStep('test-cancellation', PaymentFlowModule, 'subscriptionCancellationFlow')
}

// Module factory functions
export const createAuthModule = (page, config = {}) => new AuthModule(page, config)
export const createOrganizationModule = (page, config = {}) => new OrganizationModule(page, config)
export const createStripeModule = (page, config = {}) => new StripeModule(page, config)
export const createPaymentFlowModule = (page, config = {}) => new PaymentFlowModule(page, config)
export const createWebhookModule = (page, config = {}) => new WebhookModule(page, config)