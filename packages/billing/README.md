# @nextsaas/billing

A focused Stripe billing integration package for NextSaaS that leverages Stripe's native features while building only essential custom components for multi-tenant SaaS applications.

## Features

### Core Services
- **Organization ↔ Stripe Customer Mapping**: Automatic customer creation and management
- **Usage Tracking System**: Comprehensive quota enforcement and Stripe usage reporting
- **Feature Gating Components**: Protect premium features based on subscription status
- **Webhook Processing**: Essential webhook handlers to sync subscription status
- **Billing Dashboard**: Simple interface showing current plan and usage with portal access
- **Industry-Specific Pricing**: Configurable pricing pages with Stripe Checkout integration
- **Admin Billing Overview**: Organization subscription status management

### Stripe Native Integration
- **Payment Processing**: Uses Stripe Checkout for all transactions
- **Subscription Management**: Leverages Stripe Customer Portal
- **Invoice Generation**: Stripe handles all invoice generation and delivery
- **Payment Method Management**: Stripe manages payment methods
- **Tax Calculation**: Integrates with Stripe Tax
- **Failed Payment Recovery**: Stripe handles dunning management

## Quick Start

### 1. Installation

```bash
npm install @nextsaas/billing
```

### 2. Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Database Setup

Add the billing database functions to your Supabase project:

```sql
-- Import the billing database functions
-- This will create the increment_usage function needed for usage tracking
```

### 4. Basic Usage

```tsx
import { BillingDashboard, PricingTable, FeatureGate } from '@nextsaas/billing'

// Billing Dashboard
function BillingPage({ organizationId }: { organizationId: string }) {
  return (
    <BillingDashboard 
      organizationId={organizationId}
      showUsage={true}
      showUpgradePrompts={true}
    />
  )
}

// Feature Gating
function PremiumFeature({ organizationId }: { organizationId: string }) {
  return (
    <FeatureGate
      feature="advanced_analytics"
      organizationId={organizationId}
      upgradePrompt={<UpgradePrompt />}
    >
      <AdvancedAnalyticsComponent />
    </FeatureGate>
  )
}

// Pricing Page
function PricingPage() {
  return (
    <PricingTable
      industry="saas"
      billingCycle="monthly"
      highlightTier="professional"
    />
  )
}
```

### 5. Testing Your Integration

Verify your setup with the comprehensive test suite:

```bash
# Run all tests to ensure everything works
npm test

# Run integration tests to verify Stripe connectivity
npm run test:integration

# Test specific payment workflows
npm test -- --testNamePattern="subscription creation"
```

The test suite includes 106 tests covering payment processing, subscription management, webhook handling, and error scenarios. All tests use mocked Stripe APIs for reliable, fast execution without requiring real API keys during development.

## Core Components

### Billing Dashboard

Complete billing interface for organizations:

```tsx
<BillingDashboard 
  organizationId="org-123"
  showUsage={true}
  showUpgradePrompts={true}
/>
```

### Feature Gating

Protect features based on subscription:

```tsx
<FeatureGate
  feature="api_access"
  organizationId="org-123"
  fallback={<div>Upgrade to access API</div>}
>
  <APIDocumentation />
</FeatureGate>
```

### Usage Tracking

Track and enforce usage limits:

```tsx
import { useUsageTracking } from '@nextsaas/billing'

function ApiComponent({ organizationId }: { organizationId: string }) {
  const { enforceQuotaAndTrack } = useUsageTracking(organizationId)

  const handleApiCall = async () => {
    const result = await enforceQuotaAndTrack('api_calls', 1)
    
    if (result.success) {
      // Proceed with API call
      await makeApiCall()
    } else {
      // Show upgrade prompt
      showUpgradeDialog(result.reason)
    }
  }
}
```

### Pricing Tables

Industry-specific pricing displays:

```tsx
<PricingTable
  industry="saas" // or "ecommerce", "realestate"
  billingCycle="monthly"
  highlightTier="professional"
  showAnnualToggle={true}
/>
```

## API Routes

### Webhook Handler

```typescript
// app/api/billing/webhooks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { WebhookHandler } from '@nextsaas/billing/stripe'

const webhookHandler = new WebhookHandler()

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!
  
  const event = webhookHandler.constructEvent(body, signature)
  
  await webhookHandler.processEvent(event, {
    'customer.subscription.created': async (subscription) => {
      // Handle new subscription
    },
    'customer.subscription.updated': async (subscription) => {
      // Handle subscription changes
    }
    // ... other handlers
  })

  return NextResponse.json({ received: true })
}
```

### Checkout Creation

```typescript
// app/api/billing/checkout/route.ts
import { CheckoutService, CustomerService } from '@nextsaas/billing/stripe'

export async function POST(request: NextRequest) {
  const { organization_id, price_id, success_url, cancel_url } = await request.json()
  
  const customerService = new CustomerService()
  const checkoutService = new CheckoutService()
  
  // Ensure Stripe customer exists
  const customer = await customerService.ensureStripeCustomer(
    organization_id,
    organization.email,
    organization.name
  )
  
  // Create checkout session
  const session = await checkoutService.createSubscriptionCheckout(
    price_id,
    customer.id,
    { success_url, cancel_url }
  )
  
  return NextResponse.json({ checkout_url: session.url })
}
```

### Customer Portal

```typescript
// app/api/billing/portal/route.ts
import { CheckoutService } from '@nextsaas/billing/stripe'

export async function POST(request: NextRequest) {
  const { customer_id, return_url } = await request.json()
  
  const checkoutService = new CheckoutService()
  const portalSession = await checkoutService.createPortalSession(
    customer_id,
    return_url
  )
  
  return NextResponse.json({ url: portalSession.url })
}
```

## Hooks

### useBillingSubscription

```tsx
const {
  subscription,
  isLoading,
  isActive,
  isTrialing,
  daysUntilExpiry
} = useBillingSubscription(organizationId)
```

### useUsageTracking

```tsx
const {
  metrics,
  trackUsage,
  checkQuota,
  enforceQuotaAndTrack
} = useUsageTracking(organizationId)
```

### useFeatureGate

```tsx
const {
  hasFeature,
  isLoading,
  subscription
} = useFeatureGate('advanced_analytics', organizationId)
```

## Industry Configurations

### SaaS Industry

```typescript
{
  tiers: [
    {
      id: 'starter',
      name: 'Starter',
      price_monthly: 29,
      features: ['5 team members', '10GB storage', 'Basic analytics']
    },
    {
      id: 'professional', 
      name: 'Professional',
      price_monthly: 99,
      popular: true,
      features: ['25 team members', '100GB storage', 'Advanced analytics']
    }
  ]
}
```

### E-commerce Industry

```typescript
{
  tiers: [
    {
      id: 'basic',
      name: 'Basic Store',
      price_monthly: 19,
      features: ['100 products', 'Unlimited orders', 'SSL certificate']
    }
  ]
}
```

## Security Features

- **Multi-tenant Isolation**: Complete organization-level data isolation
- **Webhook Verification**: All webhooks are cryptographically verified
- **RLS Policies**: Row-level security for all billing data
- **Quota Enforcement**: Prevents usage beyond subscription limits
- **Secure Customer Portal**: Stripe-managed billing interface

## Multi-tenant Architecture

The billing system is designed for complete tenant isolation:

- Each organization has its own Stripe customer
- Usage tracking is organization-scoped
- Feature gating respects organization boundaries
- Webhooks include organization context
- Admin interfaces show cross-organization data safely

## Database Schema

Required tables (already included in NextSaaS):

- `plans` - Available subscription plans
- `subscriptions` - Organization subscriptions
- `billing_customers` - Organization ↔ Stripe customer mapping
- `usage_tracking` - Feature usage and limits
- `feature_quotas` - Usage quotas and alerts

## Testing

This package includes a comprehensive test suite with **106 tests** covering both unit testing and integration testing with the Stripe API.

### Test Categories

#### Integration Tests (92 tests)
Comprehensive Stripe API integration testing covering real-world scenarios:

- **Payment Processing (12 tests)**: Checkout sessions, portal management, multi-tenant workflows
- **Subscription Management (17 tests)**: Complete subscription lifecycle, plan changes, usage billing
- **Webhook Processing (23 tests)**: All Stripe webhook events, error handling, concurrent processing
- **Error Scenarios (31 tests)**: Payment failures, API errors, edge cases, network issues
- **End-to-End Workflows (9 tests)**: Complete business scenarios from signup to billing

#### Unit Tests (14 tests)
Core logic and configuration validation:

- **Stripe Client Configuration**: Environment validation, client setup
- **Pricing Service**: Calculations, plan validation, tier conversion

### Running Tests

```bash
# All tests (106 tests)
npm test

# Integration tests only (92 tests)
npm run test:integration

# Unit tests only (14 tests)
npm run test:unit

# With coverage reporting
npm run test:coverage

# Watch mode for development
npm run test:watch
npm run test:watch:integration
npm run test:watch:unit
```

### Test Features

#### Multi-Tenant Testing
Every test includes organization-level isolation validation:
- Organization metadata flow through all operations
- Cross-tenant data isolation verification
- Concurrent multi-organization processing

#### Error Resilience Testing
Comprehensive error scenario coverage:
- **Payment Errors**: Card declined, insufficient funds, expired cards
- **API Errors**: Authentication failures, rate limiting, network timeouts
- **Business Logic Errors**: Invalid customers, missing prices, edge cases
- **Recovery Scenarios**: Failed payment recovery, webhook retry logic

#### Real-World Workflow Testing
End-to-end business scenario validation:
- Complete subscription onboarding flows
- Trial-to-paid conversion processes
- Plan upgrade/downgrade workflows
- Payment failure and recovery scenarios
- Customer self-service portal interactions

### Test Architecture

The test suite uses:
- **Mocked Stripe API**: No real API calls, deterministic test execution
- **Jest Projects**: Separate unit and integration test configurations
- **Comprehensive Mocking**: All Stripe services and responses mocked
- **TypeScript**: Full type safety in test code
- **Multi-tenant Focus**: Organization context in every test scenario

For detailed testing documentation, see [INTEGRATION_TESTS.md](./INTEGRATION_TESTS.md).

### Testing Best Practices

When developing with this package:

1. **Run Tests Before Changes**: Always run `npm test` before making changes
2. **Test Integration Points**: Use `npm run test:integration` to verify Stripe connectivity
3. **Mock Real Scenarios**: The integration tests provide examples of real-world usage patterns
4. **Multi-tenant Validation**: Every feature should include organization-level isolation testing
5. **Error Handling**: Test both success and failure scenarios in your implementations

### Debugging Tests

```bash
# Run tests in watch mode during development
npm run test:watch

# Run specific test files
npm test checkout-service.integration.test.ts

# Run tests with verbose output
npm test -- --verbose

# Debug specific test patterns
npm test -- --testNamePattern="should handle payment failures"
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and add tests
4. Submit a pull request

## License

MIT - see [LICENSE](./LICENSE) file for details.