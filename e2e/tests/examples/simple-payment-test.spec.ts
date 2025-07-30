import { test, expect } from '@playwright/test'
import { 
  createPaymentFlowSequence,
  createAuthModule,
  createOrganizationModule,
  createPaymentFlowModule,
  TestSequence
} from '../../modules'

test.describe('Simple Payment Test Examples', () => {
  test('simple payment flow using pre-built sequence', async ({ page }) => {
    // Use pre-built sequence for common payment flow
    const sequence = createPaymentFlowSequence()
    const results = await sequence.execute(page)
    
    expect(sequence.isSuccessful()).toBe(true)
    console.log(`Payment flow completed in ${sequence.getTotalDuration()}ms`)
  })

  test('custom payment flow using individual modules', async ({ page }) => {
    // Create individual modules for custom flow
    const auth = createAuthModule(page)
    const org = createOrganizationModule(page)
    const payment = createPaymentFlowModule(page)

    // Setup dependencies
    org.addDependency('auth', auth)
    payment.addDependency('auth', auth)
    payment.addDependency('organization', org)

    // Initialize modules
    await auth.initialize()
    await org.initialize()
    await payment.initialize()

    // Execute custom flow
    const user = await auth.setupTestUser({ email: 'test@example.com' })
    const organization = await org.setupOrganization({ name: 'Test Company' })
    const result = await payment.basicSubscriptionFlow('starter')

    expect(result.success).toBe(true)
    expect(user.email).toBe('test@example.com')
    expect(organization.name).toBe('Test Company')

    // Cleanup
    await payment.cleanup()
    await org.cleanup()
    await auth.cleanup()
  })

  test('build custom sequence with specific requirements', async ({ page }) => {
    // Build a custom sequence for specific business logic
    const customSequence = new TestSequence({ 
      bailOnError: false,
      maxRetries: 2 
    })
      .step('register-user', 'auth', 'registerUser', { 
        skipEmailVerification: true 
      })
      .step('create-company', 'organization', 'createOrganization', {
        name: 'E2E Test Company',
        industry: 'Technology'
      })
      .optionalStep('setup-team', 'organization', async (org) => {
        // Optional step that won't fail the sequence
        await org.inviteUser('teammate@example.com', 'member')
      })
      .step('subscribe-to-pro', 'payment-flow', 'basicSubscriptionFlow', {
        planType: 'pro'
      })

    const results = await customSequence.execute(page)
    const report = customSequence.generateReport()

    expect(report.summary.successful).toBeGreaterThanOrEqual(3) // Required steps
    console.log('Custom sequence report:', report.summary)
  })

  test('parallel execution example', async ({ page, context }) => {
    // Create multiple payment flows running in parallel
    const flows = [
      createPaymentFlowSequence(),
      createPaymentFlowSequence(),
      createPaymentFlowSequence()
    ]

    const startTime = Date.now()
    
    const results = await Promise.all(
      flows.map(async (flow, index) => {
        const newPage = await context.newPage()
        try {
          await flow.execute(newPage)
          return { flow: index, success: flow.isSuccessful() }
        } finally {
          await newPage.close()
        }
      })
    )

    const endTime = Date.now()

    expect(results.every(r => r.success)).toBe(true)
    console.log(`3 parallel flows completed in ${endTime - startTime}ms`)
  })
})