import { test, expect } from '@playwright/test'
import { TestSequence } from '../../modules/orchestration/TestSequence'
import { AuthModule } from '../../modules/auth/AuthModule'
import { OrganizationModule } from '../../modules/organization/OrganizationModule'
import { StripeModule } from '../../modules/billing/StripeModule'
import { PaymentFlowModule } from '../../modules/billing/PaymentFlowModule'
import { TestDataManager } from '../../modules/base/TestData'

test.describe('Modular Payment Flows', () => {
  let testData: TestDataManager

  test.beforeEach(() => {
    testData = TestDataManager.getInstance()
  })

  test.afterEach(async () => {
    await testData.executeCleanup()
  })

  test('should complete basic subscription flow using modules', async ({ page }) => {
    const sequence = TestSequence.createPaymentFlowSequence()
    const results = await sequence.execute(page)
    
    expect(sequence.isSuccessful()).toBe(true)
    
    // Verify specific results
    const paymentResult = results.find(r => r.stepName === 'complete-payment')
    expect(paymentResult?.success).toBe(true)
    
    const report = sequence.generateReport()
    console.log('Payment flow report:', report.summary)
  })

  test('should handle trial subscription flow', async ({ page }) => {
    const authModule = new AuthModule(page)
    const orgModule = new OrganizationModule(page)
    const paymentModule = new PaymentFlowModule(page)

    // Setup dependencies
    orgModule.addDependency('auth', authModule)
    paymentModule.addDependency('auth', authModule)
    paymentModule.addDependency('organization', orgModule)

    await authModule.initialize()
    await orgModule.initialize()
    await paymentModule.initialize()

    // Execute trial flow
    const user = await authModule.setupTestUser()
    const org = await orgModule.setupOrganization()
    const result = await paymentModule.trialSubscriptionFlow('pro', 14)

    expect(result.success).toBe(true)
    expect(result.subscriptionId).toBeDefined()

    await paymentModule.cleanup()
    await orgModule.cleanup()
    await authModule.cleanup()
  })

  test('should handle subscription upgrade flow', async ({ page }) => {
    const sequence = new TestSequence()
      .step('setup-auth', AuthModule, 'setupTestUser')
      .step('setup-organization', OrganizationModule, 'setupOrganization')
      .step('create-subscription', PaymentFlowModule, 'basicSubscriptionFlow', { planType: 'starter' })
      .step('upgrade-subscription', PaymentFlowModule, 'subscriptionUpgradeFlow', { 
        fromPlan: 'starter', 
        toPlan: 'pro' 
      })

    const results = await sequence.execute(page)
    
    expect(sequence.isSuccessful()).toBe(true)
    
    // Verify upgrade was successful
    const upgradeResult = results.find(r => r.stepName === 'upgrade-subscription')
    expect(upgradeResult?.success).toBe(true)
  })

  test('should handle payment method updates', async ({ page }) => {
    const authModule = new AuthModule(page)
    const orgModule = new OrganizationModule(page)
    const paymentModule = new PaymentFlowModule(page)

    orgModule.addDependency('auth', authModule)
    paymentModule.addDependency('auth', authModule)
    paymentModule.addDependency('organization', orgModule)

    await authModule.initialize()
    await orgModule.initialize()
    await paymentModule.initialize()

    // First create a subscription
    await authModule.setupTestUser()
    await orgModule.setupOrganization()
    await paymentModule.basicSubscriptionFlow('starter')

    // Then update payment method
    const newCard = testData.generateTestCard('success')
    const result = await paymentModule.updatePaymentMethodFlow(newCard)

    expect(result.success).toBe(true)

    await paymentModule.cleanup()
    await orgModule.cleanup()
    await authModule.cleanup()
  })

  test('should handle failed payment retry', async ({ page }) => {
    const sequence = new TestSequence()
      .step('setup-auth', AuthModule, 'setupTestUser')
      .step('setup-organization', OrganizationModule, 'setupOrganization')
      .step('create-subscription', PaymentFlowModule, 'basicSubscriptionFlow')
      .step('retry-failed-payment', PaymentFlowModule, 'failedPaymentRetryFlow')

    const results = await sequence.execute(page)
    
    expect(sequence.isSuccessful()).toBe(true)
    
    const retryResult = results.find(r => r.stepName === 'retry-failed-payment')
    expect(retryResult?.success).toBe(true)
  })

  test('should complete full payment journey', async ({ page }) => {
    const paymentModule = new PaymentFlowModule(page, {
      enableTrialFlows: true,
      enableUpgradeFlows: true,
      testAllCardTypes: false // Skip for faster execution
    })

    const authModule = new AuthModule(page)
    const orgModule = new OrganizationModule(page)

    orgModule.addDependency('auth', authModule)
    paymentModule.addDependency('auth', authModule)
    paymentModule.addDependency('organization', orgModule)

    await authModule.initialize()
    await orgModule.initialize()
    await paymentModule.initialize()

    // Setup prerequisites
    await authModule.setupTestUser()
    await orgModule.setupOrganization()

    // Run complete journey
    const journeyResults = await paymentModule.completePaymentJourney()
    
    // Verify all steps completed successfully
    const successfulSteps = journeyResults.filter(r => r.success).length
    const totalSteps = journeyResults.length
    
    expect(successfulSteps).toBeGreaterThanOrEqual(totalSteps * 0.8) // 80% success rate minimum
    
    // Check performance metrics
    const averageDuration = paymentModule.getAverageFlowDuration()
    expect(averageDuration).toBeLessThan(15000) // Under 15 seconds per flow

    await paymentModule.cleanup()
    await orgModule.cleanup()
    await authModule.cleanup()
  })

  test('should test concurrent payment flows', async ({ page, context }) => {
    // Create multiple sequences running in parallel
    const sequences = Array.from({ length: 3 }, (_, i) => 
      TestSequence.createPaymentFlowSequence()
    )

    const startTime = Date.now()
    
    // Execute all sequences concurrently
    const allResults = await Promise.all(
      sequences.map(async (sequence, index) => {
        const newPage = await context.newPage()
        try {
          const results = await sequence.execute(newPage)
          return { sequence: index, results, success: sequence.isSuccessful() }
        } finally {
          await newPage.close()
        }
      })
    )

    const endTime = Date.now()
    const totalDuration = endTime - startTime

    // Verify all sequences succeeded
    const successfulSequences = allResults.filter(r => r.success).length
    expect(successfulSequences).toBe(3)

    // Verify concurrent execution was faster than sequential
    expect(totalDuration).toBeLessThan(60000) // Should complete in under 1 minute

    console.log(`Concurrent execution completed in ${totalDuration}ms`)
  })

  test('should handle subscription cancellation', async ({ page }) => {
    const sequence = new TestSequence({ bailOnError: false })
      .step('setup-auth', AuthModule, 'setupTestUser')
      .step('setup-organization', OrganizationModule, 'setupOrganization')
      .step('create-subscription', PaymentFlowModule, 'basicSubscriptionFlow')
      .step('cancel-subscription', PaymentFlowModule, 'subscriptionCancellationFlow', { immediate: false })

    const results = await sequence.execute(page)
    
    expect(sequence.isSuccessful()).toBe(true)
    
    const cancellationResult = results.find(r => r.stepName === 'cancel-subscription')
    expect(cancellationResult?.success).toBe(true)
  })
})