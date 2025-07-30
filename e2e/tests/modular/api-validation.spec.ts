import { test, expect } from '@playwright/test'
import { TestSequence } from '../../modules/orchestration/TestSequence'
import { WebhookModule } from '../../modules/billing/WebhookModule'
import { StripeModule } from '../../modules/billing/StripeModule'

test.describe('Modular Billing API Validation', () => {
  test('should validate all billing API endpoints using modules', async ({ page }) => {
    const stripeModule = new StripeModule(page)
    const webhookModule = new WebhookModule(page)
    
    await stripeModule.initialize()
    await webhookModule.initialize()

    // Test checkout endpoint - using module approach
    const checkoutResult = await page.request.post('/api/billing/checkout', {
      data: {
        organization_id: 'test-org',
        price_id: 'price_test',
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel'
      }
    })
    
    expect(checkoutResult.status()).not.toBe(404)

    // Test portal endpoint
    const portalResult = await page.request.post('/api/billing/portal', {
      data: {
        customer_id: 'cus_test',
        return_url: 'https://example.com/billing'
      }
    })
    
    expect(portalResult.status()).not.toBe(404)

    // Test webhooks using webhook module
    const webhookResult = await webhookModule.testWebhookSignatureValidation()
    expect(webhookResult.success).toBe(true)

    await stripeModule.cleanup()
    await webhookModule.cleanup()
  })

  test('should handle API errors using modular approach', async ({ page }) => {
    const sequence = new TestSequence({ bailOnError: false })
      .step('test-checkout-validation', StripeModule, async (module: StripeModule) => {
        // Test missing required fields
        const response = await page.request.post('/api/billing/checkout', {
          data: {
            success_url: 'https://example.com/success',
            cancel_url: 'https://example.com/cancel'
          }
        })
        expect(response.status()).toBe(400)
        const data = await response.json()
        expect(data.error).toContain('Missing required fields')
      })
      .step('test-portal-validation', StripeModule, async (module: StripeModule) => {
        // Test missing customer_id
        const response = await page.request.post('/api/billing/portal', {
          data: {
            return_url: 'https://example.com/billing'
          }
        })
        expect(response.status()).toBe(400)
        const data = await response.json()
        expect(data.error).toContain('Missing required fields')
      })
      .step('test-webhook-validation', WebhookModule, async (module: WebhookModule) => {
        // Test missing signature
        const response = await page.request.post('/api/billing/webhooks', {
          data: { test: 'webhook' }
        })
        expect(response.status()).toBe(400)
        const data = await response.json()
        expect(data.error).toContain('Missing stripe-signature header')
      })

    const results = await sequence.execute(page)
    const report = sequence.generateReport()

    expect(report.summary.successful).toBe(3)
    expect(report.summary.failed).toBe(0)
  })

  test('should validate API health using module health checks', async ({ page }) => {
    const stripeModule = new StripeModule(page)
    const webhookModule = new WebhookModule(page)
    
    await stripeModule.initialize()
    await webhookModule.initialize()

    // Check module health
    const stripeHealth = await stripeModule.healthCheck()
    const webhookHealth = await webhookModule.healthCheck()

    expect(stripeHealth).toBe(true)
    expect(webhookHealth).toBe(true)

    await stripeModule.cleanup()
    await webhookModule.cleanup()
  })
})