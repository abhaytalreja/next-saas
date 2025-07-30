import { test, expect } from '@playwright/test'
import { TestSequence } from '../../modules/orchestration/TestSequence'
import { WebhookModule } from '../../modules/billing/WebhookModule'
import { StripeModule } from '../../modules/billing/StripeModule'
import { AuthModule } from '../../modules/auth/AuthModule'
import { OrganizationModule } from '../../modules/organization/OrganizationModule'

test.describe('Modular Webhook Integration', () => {
  test('should test all webhook events using webhook module', async ({ page }) => {
    const webhookModule = new WebhookModule(page, {
      enableRealWebhooks: false,
      retryAttempts: 2
    })

    await webhookModule.initialize()

    // Run comprehensive webhook test suite
    const results = await webhookModule.runWebhookTestSuite()
    
    // Verify all webhook tests
    expect(results.length).toBeGreaterThan(0)
    
    // Check success rate
    const successRate = webhookModule.getWebhookSuccessRate()
    expect(successRate).toBeGreaterThanOrEqual(80) // 80% minimum success rate
    
    // Check response times
    const avgResponseTime = webhookModule.getAverageResponseTime()
    expect(avgResponseTime).toBeLessThan(5000) // Under 5 seconds
    
    // Log results for debugging
    console.log('Webhook test results:', {
      totalTests: results.length,
      successRate: `${successRate}%`,
      avgResponseTime: `${avgResponseTime}ms`
    })

    await webhookModule.cleanup()
  })

  test('should test individual webhook events', async ({ page }) => {
    const webhookModule = new WebhookModule(page)
    await webhookModule.initialize()

    // Test checkout session completed
    const checkoutResult = await webhookModule.testCheckoutSessionCompleted()
    expect(checkoutResult.success).toBe(true)
    expect(checkoutResult.eventType).toBe('checkout.session.completed')

    // Test invoice payment succeeded
    const invoiceSucceededResult = await webhookModule.testInvoicePaymentSucceeded()
    expect(invoiceSucceededResult.success).toBe(true)
    expect(invoiceSucceededResult.eventType).toBe('invoice.payment_succeeded')

    // Test subscription created
    const subscriptionCreatedResult = await webhookModule.testCustomerSubscriptionCreated()
    expect(subscriptionCreatedResult.success).toBe(true)
    expect(subscriptionCreatedResult.eventType).toBe('customer.subscription.created')

    await webhookModule.cleanup()
  })

  test('should test webhook security and validation', async ({ page }) => {
    const sequence = new TestSequence()
      .step('test-signature-validation', WebhookModule, 'testWebhookSignatureValidation')
      .step('test-idempotency', WebhookModule, 'testWebhookIdempotency')

    const results = await sequence.execute(page)
    
    expect(sequence.isSuccessful()).toBe(true)
    
    // Verify security tests passed
    const signatureResult = results.find(r => r.stepName === 'test-signature-validation')
    const idempotencyResult = results.find(r => r.stepName === 'test-idempotency')
    
    expect(signatureResult?.success).toBe(true)
    expect(idempotencyResult?.success).toBe(true)
  })

  test('should integrate webhooks with payment flows', async ({ page }) => {
    const sequence = new TestSequence()
      .step('setup-auth', AuthModule, 'setupTestUser')
      .step('setup-organization', OrganizationModule, 'setupOrganization')
      .step('create-checkout', StripeModule, async (stripe: StripeModule) => {
        const subscription = { priceId: 'price_starter_monthly' }
        return await stripe.createCheckoutSession(subscription.priceId)
      })
      .step('simulate-webhook', WebhookModule, async (webhook: WebhookModule) => {
        // Simulate checkout completed webhook
        return await webhook.testCheckoutSessionCompleted()
      })
      .step('verify-subscription', StripeModule, async (stripe: StripeModule) => {
        // Verify subscription was created
        const subscription = await stripe.getSubscription()
        expect(subscription).toBeDefined()
        return subscription
      })

    const results = await sequence.execute(page)
    
    expect(sequence.isSuccessful()).toBe(true)
    
    // Verify webhook integration worked
    const webhookResult = results.find(r => r.stepName === 'simulate-webhook')
    const subscriptionResult = results.find(r => r.stepName === 'verify-subscription')
    
    expect(webhookResult?.success).toBe(true)
    expect(subscriptionResult?.success).toBe(true)
  })

  test('should handle webhook failures and retries', async ({ page }) => {
    const webhookModule = new WebhookModule(page, {
      retryAttempts: 3,
      timeoutMs: 5000
    })

    await webhookModule.initialize()

    // Test payment failed webhook (which might have different handling)
    const paymentFailedResult = await webhookModule.testInvoicePaymentFailed()
    expect(paymentFailedResult.success).toBe(true)
    expect(paymentFailedResult.eventType).toBe('invoice.payment_failed')

    // Test subscription deleted webhook
    const subscriptionDeletedResult = await webhookModule.testCustomerSubscriptionDeleted()
    expect(subscriptionDeletedResult.success).toBe(true)
    expect(subscriptionDeletedResult.eventType).toBe('customer.subscription.deleted')

    // Check retry behavior if any retries occurred
    const results = webhookModule.getWebhookResults()
    const retriedResults = results.filter(r => r.retryCount && r.retryCount > 0)
    
    if (retriedResults.length > 0) {
      console.log('Webhook retries occurred:', retriedResults.length)
    }

    await webhookModule.cleanup()
  })

  test('should test webhook performance under load', async ({ page }) => {
    const webhookModule = new WebhookModule(page)
    await webhookModule.initialize()

    const startTime = Date.now()
    
    // Send multiple webhook events concurrently
    const webhookPromises = Array.from({ length: 10 }, (_, i) =>
      webhookModule.testCheckoutSessionCompleted({
        id: `cs_test_${i}`,
        payment_status: 'paid',
        status: 'complete'
      })
    )

    const results = await Promise.all(webhookPromises)
    const endTime = Date.now()
    
    // Verify all webhooks processed successfully
    const successfulWebhooks = results.filter(r => r.success).length
    expect(successfulWebhooks).toBe(10)
    
    // Check performance
    const totalTime = endTime - startTime
    const averageTime = totalTime / 10
    
    expect(averageTime).toBeLessThan(2000) // Under 2 seconds per webhook on average
    
    console.log(`Processed 10 webhooks in ${totalTime}ms (avg: ${averageTime}ms each)`)

    await webhookModule.cleanup()
  })

  test('should validate webhook data persistence', async ({ page }) => {
    const sequence = new TestSequence()
      .step('setup-auth', AuthModule, 'setupTestUser')
      .step('setup-organization', OrganizationModule, 'setupOrganization')
      .step('process-subscription-webhook', WebhookModule, async (webhook: WebhookModule) => {
        // Process a subscription created webhook
        return await webhook.testCustomerSubscriptionCreated()
      })
      .step('verify-data-persistence', StripeModule, async (stripe: StripeModule) => {
        // Verify the webhook data was persisted correctly
        const subscription = await stripe.getSubscription()
        expect(subscription).toBeDefined()
        return subscription
      })
      .step('process-update-webhook', WebhookModule, async (webhook: WebhookModule) => {
        // Process a subscription updated webhook
        return await webhook.testCustomerSubscriptionUpdated()
      })

    const results = await sequence.execute(page)
    
    expect(sequence.isSuccessful()).toBe(true)
    
    // Verify webhook processing maintained data consistency
    const report = sequence.generateReport()
    expect(report.summary.successRate).toBe(100)
  })
})