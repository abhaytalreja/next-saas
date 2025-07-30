import { test, expect } from '@playwright/test'
import { TestSequence } from '../../modules/orchestration/TestSequence'
import { AuthModule } from '../../modules/auth/AuthModule'
import { OrganizationModule } from '../../modules/organization/OrganizationModule'
import { StripeModule } from '../../modules/billing/StripeModule'
import { PaymentFlowModule } from '../../modules/billing/PaymentFlowModule'
import { WebhookModule } from '../../modules/billing/WebhookModule'
import { TestDataManager } from '../../modules/base/TestData'

test.describe('Complete Billing Journey - Modular E2E', () => {
  let testData: TestDataManager

  test.beforeEach(() => {
    testData = TestDataManager.getInstance()
  })

  test.afterEach(async () => {
    await testData.executeCleanup()
  })

  test('should complete full billing lifecycle using modular architecture', async ({ page }) => {
    // Create the most comprehensive test sequence
    const sequence = TestSequence.createBillingTestSequence()
    
    const results = await sequence.execute(page)
    const report = sequence.generateReport()
    
    // Log comprehensive report
    console.log('=== Complete Billing Journey Report ===')
    console.log('Summary:', report.summary)
    console.log('Step Details:', report.steps.map(s => ({
      name: s.stepName,
      success: s.success,
      duration: `${s.duration}ms`
    })))
    
    if (report.failures.length > 0) {
      console.log('Failures:', report.failures)
    }
    
    // Assertions
    expect(sequence.isSuccessful()).toBe(true)
    expect(report.summary.successRate).toBeGreaterThanOrEqual(90) // 90% success rate minimum
    expect(report.summary.totalDuration).toBeLessThan(120000) // Under 2 minutes total
  })

  test('should demonstrate module composition and reusability', async ({ page }) => {
    // Create custom sequence demonstrating module reusability
    const customSequence = new TestSequence({ bailOnError: false })
      // Authentication flow
      .step('user-registration', AuthModule, 'registerUser')
      .step('user-login', AuthModule, 'loginAsUser')
      
      // Organization setup
      .step('create-organization', OrganizationModule, 'createOrganization')
      .step('verify-organization', OrganizationModule, async (org: OrganizationModule) => {
        const currentOrg = org.getCurrentOrganization()
        expect(currentOrg).toBeDefined()
        return currentOrg
      })
      
      // Multi-tenant verification
      .step('verify-isolation', OrganizationModule, 'verifyOrganizationIsolation')
      
      // Payment processing
      .step('setup-stripe', StripeModule, async (stripe: StripeModule) => {
        const healthCheck = await stripe.healthCheck()
        expect(healthCheck).toBe(true)
        return healthCheck
      })
      
      // Complete payment flow
      .step('start-subscription', PaymentFlowModule, 'basicSubscriptionFlow')
      .step('upgrade-plan', PaymentFlowModule, 'subscriptionUpgradeFlow', {
        fromPlan: 'starter',
        toPlan: 'pro'
      })
      
      // Webhook validation
      .step('test-webhooks', WebhookModule, 'runWebhookTestSuite')
      
      // Final verification
      .step('verify-final-state', StripeModule, async (stripe: StripeModule) => {
        const subscription = await stripe.getSubscription()
        expect(subscription).toBeDefined()
        expect(subscription.status).toBe('active')
        return subscription
      })

    const results = await customSequence.execute(page)
    const report = customSequence.generateReport()

    // Verify modular approach worked
    expect(report.summary.totalSteps).toBe(10)
    expect(report.summary.successful).toBeGreaterThanOrEqual(8) // Allow for 2 potential failures
    
    // Verify module interactions
    const authModule = customSequence.getModule<AuthModule>('AuthModule')
    const orgModule = customSequence.getModule<OrganizationModule>('OrganizationModule')
    const stripeModule = customSequence.getModule<StripeModule>('StripeModule')
    
    expect(authModule?.getCurrentUser()).toBeDefined()
    expect(orgModule?.getCurrentOrganization()).toBeDefined()
    expect(stripeModule?.getCurrentSubscription()).toBeDefined()
  })

  test('should handle complex error scenarios with module resilience', async ({ page }) => {
    const errorTestSequence = new TestSequence({ 
      bailOnError: false, // Continue despite errors
      maxRetries: 2 
    })
      .step('setup-auth', AuthModule, 'setupTestUser')
      .step('setup-organization', OrganizationModule, 'setupOrganization')
      
      // Intentionally trigger some error scenarios
      .step('test-invalid-card', StripeModule, async (stripe: StripeModule) => {
        try {
          await stripe.testCardScenario('decline')
          return { tested: 'decline', success: true }
        } catch (error) {
          return { tested: 'decline', success: false, error: error.message }
        }
      })
      
      .optionalStep('test-3ds-flow', StripeModule, async (stripe: StripeModule) => {
        try {
          await stripe.testCardScenario('3ds')
          return { tested: '3ds', success: true }
        } catch (error) {
          return { tested: '3ds', success: false, error: error.message }
        }
      })
      
      // Recovery flow
      .step('successful-payment', PaymentFlowModule, 'basicSubscriptionFlow')
      
      // Test webhook resilience
      .step('test-webhook-failures', WebhookModule, async (webhook: WebhookModule) => {
        const results = await webhook.runWebhookTestSuite()
        const failedWebhooks = results.filter(r => !r.success)
        return {
          totalTests: results.length,
          failures: failedWebhooks.length,
          successRate: webhook.getWebhookSuccessRate()
        }
      })

    const results = await errorTestSequence.execute(page)
    const report = errorTestSequence.generateReport()

    // Verify error handling
    expect(report.summary.totalSteps).toBeGreaterThan(0)
    
    // Should have recovered from errors
    const finalSteps = results.slice(-2) // Last 2 steps
    const recoverySuccessful = finalSteps.every(step => step.success)
    expect(recoverySuccessful).toBe(true)

    console.log('Error resilience test:', {
      totalSteps: report.summary.totalSteps,
      finalSuccessRate: report.summary.successRate,
      recoveredFromErrors: recoverySuccessful
    })
  })

  test('should demonstrate parallel module execution', async ({ page, context }) => {
    // Create multiple independent test flows
    const createIndependentFlow = (flowName: string) => {
      return new TestSequence()
        .step(`${flowName}-auth`, AuthModule, 'setupTestUser')
        .step(`${flowName}-org`, OrganizationModule, 'setupOrganization')
        .step(`${flowName}-payment`, PaymentFlowModule, 'basicSubscriptionFlow')
        .step(`${flowName}-webhook`, WebhookModule, 'testCheckoutSessionCompleted')
    }

    const flows = [
      'flow-1',
      'flow-2', 
      'flow-3'
    ].map(name => createIndependentFlow(name))

    const startTime = Date.now()
    
    // Execute all flows in parallel using separate pages
    const flowResults = await Promise.all(
      flows.map(async (flow, index) => {
        const newPage = await context.newPage()
        try {
          const results = await flow.execute(newPage)
          return {
            flowIndex: index,
            success: flow.isSuccessful(),
            duration: flow.getTotalDuration(),
            steps: results.length
          }
        } finally {
          await newPage.close()
        }
      })
    )

    const endTime = Date.now()
    const totalParallelTime = endTime - startTime

    // Verify parallel execution
    const allSuccessful = flowResults.every(r => r.success)
    expect(allSuccessful).toBe(true)

    const avgSequentialTime = flowResults.reduce((sum, r) => sum + r.duration, 0) / flowResults.length
    
    // Parallel execution should be significantly faster than sequential
    expect(totalParallelTime).toBeLessThan(avgSequentialTime * 2)

    console.log('Parallel execution results:', {
      flows: flowResults.length,
      totalTime: totalParallelTime,
      avgSequentialTime,
      efficiency: `${Math.round((1 - totalParallelTime / (avgSequentialTime * 3)) * 100)}%`
    })
  })

  test('should validate data consistency across modules', async ({ page }) => {
    const consistencySequence = new TestSequence()
      .step('create-user', AuthModule, 'setupTestUser')
      .step('create-org', OrganizationModule, 'setupOrganization')
      .step('create-subscription', PaymentFlowModule, 'basicSubscriptionFlow')
      .step('verify-consistency', StripeModule, async (stripe: StripeModule) => {
        // Get data from different modules and verify consistency
        const authModule = consistencySequence.getModule<AuthModule>('AuthModule')
        const orgModule = consistencySequence.getModule<OrganizationModule>('OrganizationModule')
        
        const user = authModule?.getCurrentUser()
        const org = orgModule?.getCurrentOrganization()
        const subscription = await stripe.getSubscription()

        // Verify data relationships
        expect(user).toBeDefined()
        expect(org).toBeDefined()
        expect(subscription).toBeDefined()
        
        // Verify cross-module data consistency
        expect(subscription.organization_id).toBe(org?.id)
        
        return {
          user: user?.email,
          organization: org?.name,
          subscription: subscription?.id,
          consistent: true
        }
      })

    const results = await consistencySequence.execute(page)
    expect(consistencySequence.isSuccessful()).toBe(true)

    const consistencyResult = results.find(r => r.stepName === 'verify-consistency')
    expect(consistencyResult?.result.consistent).toBe(true)
  })

  test('should generate comprehensive performance metrics', async ({ page }) => {
    const performanceSequence = new TestSequence()
      .step('perf-auth', AuthModule, 'setupTestUser')
      .step('perf-org', OrganizationModule, 'setupOrganization')
      .step('perf-payment', PaymentFlowModule, 'basicSubscriptionFlow')
      .step('perf-webhook', WebhookModule, 'runWebhookTestSuite')

    const results = await performanceSequence.execute(page)
    const report = performanceSequence.generateReport()

    // Generate detailed performance analysis
    const performanceMetrics = {
      totalDuration: report.summary.totalDuration,
      avgStepDuration: report.summary.totalDuration / report.summary.totalSteps,
      stepBreakdown: report.steps.map(step => ({
        name: step.stepName,
        duration: step.duration,
        percentage: Math.round((step.duration / report.summary.totalDuration) * 100)
      })),
      bottlenecks: report.steps
        .filter(step => step.duration > report.summary.totalDuration * 0.3)
        .map(step => step.stepName)
    }

    console.log('Performance Metrics:', performanceMetrics)

    // Performance assertions
    expect(performanceMetrics.totalDuration).toBeLessThan(60000) // Under 1 minute
    expect(performanceMetrics.avgStepDuration).toBeLessThan(15000) // Under 15 seconds per step
    expect(performanceMetrics.bottlenecks.length).toBeLessThanOrEqual(2) // At most 2 bottleneck steps

    // Verify no step took more than 50% of total time
    const maxStepPercentage = Math.max(...performanceMetrics.stepBreakdown.map(s => s.percentage))
    expect(maxStepPercentage).toBeLessThan(50)
  })
})