# @nextsaas/usage-billing

Enterprise-grade usage tracking, billing calculation, and analytics for NextSaaS applications.

## 🚀 Features

- **Real-time Usage Tracking** - Track API calls, storage, bandwidth, and custom metrics
- **Dynamic Pricing Engine** - Tiered, volume, graduated, and per-unit pricing models
- **Usage Analytics** - Comprehensive reporting, forecasting, and cost breakdown
- **Billing Integration** - Stripe integration with subscription and invoice management
- **Usage Limits & Alerts** - Hard/soft limits with real-time notifications
- **Plan Management** - Compare plans, recommendations, and upgrade flows
- **React Components** - Production-ready UI components with hooks

## 📦 Installation

This package is included in the NextSaaS workspace. No additional installation required.

```bash
# Package is already configured in the workspace
```

## 🎯 Quick Start

### 1. Wrap Your App with Provider

```tsx
import { UsageBillingProvider } from '@nextsaas/usage-billing'

function App() {
  return (
    <UsageBillingProvider>
      <YourApp />
    </UsageBillingProvider>
  )
}
```

### 2. Track Usage Events

```tsx
import { useUsageTracking } from '@nextsaas/usage-billing'

function ApiComponent() {
  const { trackUsage } = useUsageTracking()

  const handleApiCall = async () => {
    // Make API call
    const response = await fetch('/api/data')
    
    // Track usage
    await trackUsage({
      event_type: 'api_call',
      event_name: 'fetch_data',
      quantity: 1,
      unit: 'request',
      metadata: {
        endpoint: '/api/data',
        method: 'GET',
        status: response.status
      },
      timestamp: new Date().toISOString()
    })
  }

  return (
    <button onClick={handleApiCall}>
      Fetch Data
    </button>
  )
}
```

### 3. Display Usage Overview

```tsx
import { UsageOverview } from '@nextsaas/usage-billing'

function Dashboard() {
  return (
    <div>
      <h1>Usage Dashboard</h1>
      <UsageOverview 
        showAlerts={true}
        showMetrics={true}
        maxMetrics={6}
      />
    </div>
  )
}
```

## 🔧 API Reference

### Hooks

#### useUsageTracking()

Track and monitor usage across your application.

```tsx
const {
  usage,              // UsageSummary[] - Current usage data
  alerts,             // UsageAlert[] - Active alerts
  limits,             // UsageLimit[] - Configured limits
  usageStats,         // Usage statistics
  isLoading,          // boolean
  error,              // string | null
  trackUsage,         // Track usage event
  acknowledgeAlert,   // Acknowledge alert
  refreshUsage        // Refresh data
} = useUsageTracking()
```

#### useBilling()

Manage subscriptions, invoices, and payment methods.

```tsx
const {
  subscription,        // Current subscription
  currentInvoice,      // Latest invoice
  upcomingInvoice,     // Next invoice preview
  paymentMethods,      // Payment methods
  billingStats,        // Billing statistics
  upgradeSubscription, // Upgrade to new plan
  cancelSubscription,  // Cancel subscription
  addPaymentMethod,    // Add payment method
  retryPayment        // Retry failed payment
} = useBilling()
```

#### useAnalytics(period?)

Get usage analytics and insights.

```tsx
const {
  analytics,          // UsageAnalytics - Full analytics
  analyticsInsights,  // Derived insights
  isLoading,
  error,
  getForecast,        // Get usage forecasts
  exportData,         // Export usage data
  refreshAnalytics    // Refresh analytics
} = useAnalytics({
  start: '2024-01-01T00:00:00Z',
  end: '2024-01-31T23:59:59Z'
})
```

#### usePlans()

Manage billing plans and recommendations.

```tsx
const {
  planConfig,         // PlanConfiguration
  availablePlans,     // Available plans
  currentPlan,        // Current plan
  recommendedPlan,    // Recommended plan
  isCurrentPlan,      // Check if plan is current
  getCostEstimate,    // Get cost estimate
  simulateUsage       // Simulate usage costs
} = usePlans()
```

### Components

#### UsageOverview

Complete usage dashboard with metrics and alerts.

```tsx
<UsageOverview 
  showAlerts={true}
  showMetrics={true}
  maxMetrics={6}
  className="my-4"
/>
```

#### UsageMetricCard

Display individual usage metrics.

```tsx
<UsageMetricCard 
  metric={usageSummary}
  showTrend={true}
  showCost={true}
/>
```

#### UsageAlerts

Display and manage usage alerts.

```tsx
<UsageAlerts 
  alerts={alerts}
  onAcknowledge={acknowledgeAlert}
  maxAlerts={5}
/>
```

### Services

#### UsageTrackingService

Core service for tracking usage events.

```tsx
import { UsageTrackingService } from '@nextsaas/usage-billing'

const tracker = new UsageTrackingService()

// Track usage
await tracker.track({
  organization_id: 'org-123',
  event_type: 'api_call',
  event_name: 'user_query',
  quantity: 1,
  unit: 'request',
  timestamp: new Date().toISOString()
})

// Get usage summary
const usage = await tracker.getUsage('org-123', 'api_call')
```

#### BillingCalculationService

Calculate costs based on usage and pricing plans.

```tsx
import { BillingCalculationService } from '@nextsaas/usage-billing'

const calculator = new BillingCalculationService()

// Calculate usage cost
const cost = await calculator.calculateUsageCost(
  usageSummaries,
  billingPlan,
  { start: '2024-01-01', end: '2024-01-31' }
)

// Generate invoice
const invoice = await calculator.generateInvoice(
  'org-123',
  'sub-456',
  { start: '2024-01-01', end: '2024-01-31' }
)
```

#### StripeService

Manage Stripe subscriptions and payments.

```tsx
import { StripeService } from '@nextsaas/usage-billing'

const stripe = new StripeService()

// Create subscription
const subscription = await stripe.createSubscription(
  'org-123',
  'plan-456',
  'pm_card_visa'
)

// Report usage to Stripe
await stripe.reportUsage('sub-123', [
  {
    subscription_item_id: 'si_123',
    quantity: 100,
    timestamp: Math.floor(Date.now() / 1000)
  }
])
```

## 💰 Pricing Models

### Per-Unit Pricing

Simple per-unit pricing with optional free tier.

```json
{
  "pricing_model": "per_unit",
  "unit_price": 0.01,
  "free_tier": 1000
}
```

### Tiered Pricing

Different rates for different usage tiers.

```json
{
  "pricing_model": "tiered",
  "tiers": [
    { "from": 0, "to": 1000, "unit_price": 0 },
    { "from": 1000, "to": 10000, "unit_price": 0.01 },
    { "from": 10000, "unit_price": 0.005 }
  ]
}
```

### Volume Pricing

All usage charged at the rate of the highest tier reached.

```json
{
  "pricing_model": "volume",
  "tiers": [
    { "from": 0, "unit_price": 0.01 },
    { "from": 1000, "unit_price": 0.008 },
    { "from": 10000, "unit_price": 0.005 }
  ]
}
```

### Graduated Pricing

Cumulative pricing across tiers.

```json
{
  "pricing_model": "graduated",
  "tiers": [
    { "from": 0, "to": 1000, "unit_price": 0, "flat_fee": 0 },
    { "from": 1000, "to": 10000, "unit_price": 0.01, "flat_fee": 10 },
    { "from": 10000, "unit_price": 0.005, "flat_fee": 100 }
  ]
}
```

## 📊 Usage Tracking

### Automatic Tracking

Use middleware or service wrappers for automatic tracking.

```tsx
// API Route with tracking
import { UsageTrackingService } from '@nextsaas/usage-billing'

export async function GET(request: Request) {
  const tracker = new UsageTrackingService()
  
  try {
    // Process request
    const result = await processRequest(request)
    
    // Track successful usage
    await tracker.track({
      organization_id: getOrgId(request),
      event_type: 'api_call',
      event_name: 'data_query',
      quantity: 1,
      unit: 'request',
      metadata: {
        endpoint: '/api/data',
        success: true
      },
      timestamp: new Date().toISOString()
    })
    
    return Response.json(result)
  } catch (error) {
    // Track failed usage
    await tracker.track({
      organization_id: getOrgId(request),
      event_type: 'api_call',
      event_name: 'data_query_failed',
      quantity: 1,
      unit: 'request',
      metadata: {
        endpoint: '/api/data',
        success: false,
        error: error.message
      },
      timestamp: new Date().toISOString()
    })
    
    throw error
  }
}
```

### Manual Tracking

Track usage manually in your application code.

```tsx
import { useMetricTracking } from '@nextsaas/usage-billing'

function FileUpload() {
  const { track } = useMetricTracking('storage_usage')
  
  const handleUpload = async (file: File) => {
    // Upload file
    await uploadFile(file)
    
    // Track storage usage
    await track(file.size, {
      filename: file.name,
      type: file.type,
      upload_time: new Date().toISOString()
    })
  }
  
  return <input type="file" onChange={handleUpload} />
}
```

## 🚨 Usage Limits & Alerts

### Setting Up Limits

```tsx
import { useUsageLimits } from '@nextsaas/usage-billing'

function UsageLimitsManager() {
  const { createLimit } = useUsageLimits()
  
  const addAPILimit = async () => {
    await createLimit({
      metric_id: 'api_calls',
      limit_type: 'hard',
      limit_value: 10000,
      reset_period: 'monthly',
      notification_thresholds: [50, 80, 95],
      is_active: true
    })
  }
  
  return (
    <button onClick={addAPILimit}>
      Set API Limit
    </button>
  )
}
```

### Handling Alerts

```tsx
import { useUsageTracking } from '@nextsaas/usage-billing'

function AlertsPanel() {
  const { alerts, acknowledgeAlert } = useUsageTracking()
  
  return (
    <div>
      {alerts.map(alert => (
        <div key={alert.id} className="alert">
          <p>{alert.description}</p>
          <button onClick={() => acknowledgeAlert(alert.id)}>
            Acknowledge
          </button>
        </div>
      ))}
    </div>
  )
}
```

## 📈 Analytics & Forecasting

### Usage Analytics

```tsx
import { useAnalytics } from '@nextsaas/usage-billing'

function AnalyticsDashboard() {
  const { analytics, getForecast } = useAnalytics({
    start: '2024-01-01T00:00:00Z',
    end: '2024-01-31T23:59:59Z'
  })
  
  const loadForecast = async () => {
    const forecast = await getForecast(['api_calls', 'storage'], 30)
    console.log('30-day forecast:', forecast)
  }
  
  if (!analytics) return <div>Loading...</div>
  
  return (
    <div>
      <h2>Usage Analytics</h2>
      <p>Total Cost: ${analytics.cost_breakdown.total_cost}</p>
      <p>Usage Cost: ${analytics.cost_breakdown.usage_based_cost}</p>
      <button onClick={loadForecast}>Load Forecast</button>
    </div>
  )
}
```

### Cost Breakdown

```tsx
import { useCostBreakdown } from '@nextsaas/usage-billing'

function CostAnalysis() {
  const { costBreakdown, costTrends } = useCostBreakdown()
  
  if (!costBreakdown) return <div>Loading...</div>
  
  return (
    <div>
      <h3>Cost Breakdown</h3>
      <p>Base Cost: ${costBreakdown.base_subscription_cost}</p>
      <p>Usage Cost: ${costBreakdown.usage_based_cost}</p>
      <p>Overage Cost: ${costBreakdown.overage_cost}</p>
      
      {costTrends && (
        <div>
          <p>Usage Heavy: {costTrends.isUsageHeavy ? 'Yes' : 'No'}</p>
          <p>Has Overages: {costTrends.hasOverages ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  )
}
```

## 🧪 Testing

### Unit Tests

Test usage tracking and billing calculations.

```typescript
import { UsageTrackingService, BillingCalculationService } from '@nextsaas/usage-billing'

describe('UsageTrackingService', () => {
  it('should track usage events', async () => {
    const tracker = new UsageTrackingService()
    
    await tracker.track({
      organization_id: 'test-org',
      event_type: 'api_call',
      event_name: 'test_call',
      quantity: 1,
      unit: 'request',
      timestamp: new Date().toISOString()
    })
    
    const usage = await tracker.getCurrentUsage('test-org')
    expect(usage).toHaveLength(1)
  })
})
```

### Integration Tests

Test end-to-end usage tracking flows.

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UsageOverview } from '@nextsaas/usage-billing'

describe('UsageOverview', () => {
  it('should display usage metrics', async () => {
    render(<UsageOverview />)
    
    await waitFor(() => {
      expect(screen.getByText('Usage Metrics')).toBeInTheDocument()
    })
  })
})
```

## 🤝 Contributing

This package follows the NextSaaS contribution guidelines:

1. **Follow existing patterns** - Match the coding style and architecture
2. **Add comprehensive tests** - Include unit, integration, and E2E tests
3. **Update documentation** - Keep README and docs in sync
4. **Test billing features** - Verify all usage and billing scenarios

## 📄 License

This package is part of NextSaaS and follows the same license terms.

## 🔗 Related Packages

- [`@nextsaas/auth`](../auth/README.md) - Authentication and user management
- [`@nextsaas/enterprise-auth`](../enterprise-auth/README.md) - Enterprise SSO and security
- [`@nextsaas/ui`](../ui/README.md) - UI components and design system
- [`@nextsaas/database`](../database/README.md) - Database schemas and utilities

## 📞 Support

For usage-billing support:

1. Check this README for common usage patterns
2. Review the TypeScript types for API details
3. Test configurations using the built-in hooks
4. Check usage event logs for troubleshooting

---

**Usage-Based Billing** enables sophisticated pricing models and usage tracking that scales with your business. 🚀