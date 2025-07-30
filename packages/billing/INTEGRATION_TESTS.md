# Stripe Payment Integration Tests

This document describes the comprehensive integration test suite for Stripe payment processing in the NextSaaS billing package.

## Overview

The integration tests validate complete payment workflows, error scenarios, and multi-tenant functionality. Tests are organized into logical groupings that mirror real-world usage patterns.

## Test Structure

### Files

- `checkout-service.integration.test.ts` - Checkout session creation and management
- `subscription-service.integration.test.ts` - Subscription lifecycle management  
- `webhook-handler.integration.test.ts` - Webhook processing and event handling
- `stripe-error-scenarios.integration.test.ts` - Error conditions and edge cases
- `payment-workflow.integration.test.ts` - End-to-end payment workflows

### Test Categories

#### 1. Payment Processing Workflows (`checkout-service.integration.test.ts`)

Tests the complete checkout process:

- **Subscription Checkout Creation**: Creates Stripe Checkout sessions for subscriptions with customers
- **Email-Only Checkout**: Creates checkout sessions using customer email (no existing customer)
- **One-Time Payments**: Creates payment-mode checkout sessions for single transactions
- **Session Retrieval**: Fetches checkout sessions with expanded customer/subscription data
- **Customer Portal Integration**: Creates and manages billing portal sessions
- **Multi-tenant Scenarios**: Tests organization-specific metadata and isolation

**Key Features Tested:**
- Trial period configuration
- Promotional codes
- Automatic tax collection
- Address collection
- Multi-tenant metadata handling

#### 2. Subscription Management (`subscription-service.integration.test.ts`)

Tests subscription lifecycle operations:

- **Subscription Creation**: Creates subscriptions with trials, metadata, and automatic tax
- **Subscription Retrieval**: Fetches subscriptions with proper error handling for missing subscriptions
- **Plan Updates**: Changes subscription plans with prorations
- **Cancellation**: Handles immediate and end-of-period cancellations
- **Reactivation**: Reactivates cancelled subscriptions
- **Customer Management**: Lists all subscriptions for a customer
- **Usage-Based Billing**: Reports and retrieves usage for metered billing
- **Status Checks**: Validates active and trial subscription states

**Key Features Tested:**
- Proration handling
- Trial period management
- Usage reporting and tracking
- Multi-tenant isolation
- Subscription state validation

#### 3. Webhook Processing (`webhook-handler.integration.test.ts`)

Tests comprehensive webhook event handling:

- **Event Construction**: Validates webhook signature verification
- **Event Processing**: Processes all supported webhook event types
- **Organization Extraction**: Extracts organization IDs from various metadata locations
- **Endpoint Management**: Creates, lists, and deletes webhook endpoints
- **Error Recovery**: Handles processing failures and malformed data
- **Concurrent Processing**: Tests multiple webhook events processed simultaneously

**Supported Webhook Events:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.created`
- `customer.updated`
- `customer.deleted`

#### 4. Error Scenarios (`stripe-error-scenarios.integration.test.ts`)

Tests comprehensive error handling:

**Payment Errors:**
- Card declined (various decline codes)
- Insufficient funds
- Expired cards
- Incorrect CVC
- Processing errors

**Subscription Errors:**
- Customer not found
- Price not found
- Subscription already cancelled
- No payment method attached
- Incomplete subscription creation

**Billing Portal Errors:**
- Invalid customer IDs
- Invalid return URLs
- Missing configurations

**Webhook Errors:**
- Invalid signatures
- Malformed payloads
- Processing failures
- Missing endpoints

**Network/API Errors:**
- Timeout errors
- Authentication failures
- Rate limiting
- API unavailability

**Edge Cases:**
- Large payment amounts
- Invalid currencies
- Metadata size limits
- Concurrent modifications
- Trial period limits

#### 5. End-to-End Workflows (`payment-workflow.integration.test.ts`)

Tests complete business scenarios:

**Subscription Onboarding Flow:**
1. Create checkout session with trial
2. Process successful payment
3. Handle subscription created webhook
4. Verify subscription activation

**Trial-to-Paid Conversion:**
1. Subscription transitions from trialing to active
2. First invoice payment processed
3. Organization metadata maintained throughout

**Plan Upgrade/Downgrade:**
1. Upgrade with immediate proration
2. Downgrade scheduled for period end
3. Webhook processing for both scenarios

**Payment Failure Recovery:**
1. Initial payment fails
2. Subscription goes past due
3. Multiple retry attempts
4. Eventual payment success and reactivation
5. Alternative: Final cancellation after grace period

**Customer Portal Workflows:**
1. Create billing portal session
2. Customer self-service actions
3. Webhook processing for portal changes

**Multi-Organization Isolation:**
1. Concurrent billing events for different organizations
2. Proper metadata isolation
3. Cross-organization security validation

## Running Tests

### All Integration Tests
```bash
npm run test:integration
```

### Specific Test Files
```bash
# Checkout workflows
npm test checkout-service.integration.test.ts

# Subscription management
npm test subscription-service.integration.test.ts

# Webhook processing
npm test webhook-handler.integration.test.ts

# Error scenarios
npm test stripe-error-scenarios.integration.test.ts

# End-to-end workflows
npm test payment-workflow.integration.test.ts
```

### Test Separation
```bash
# Unit tests only
npm run test:unit

# Integration tests only  
npm run test:integration

# All tests
npm test
```

## Test Configuration

### Jest Setup

The integration tests use a separate Jest project configuration with:
- Extended timeout (30 seconds) for complex workflows
- Mocked Stripe client to avoid real API calls
- Comprehensive error scenario testing
- Multi-tenant isolation validation

### Mock Strategy

Integration tests use comprehensive Stripe API mocks that:
- Simulate real Stripe responses and errors
- Test error conditions without hitting rate limits
- Enable deterministic test execution
- Cover edge cases difficult to reproduce with real APIs

## Coverage Requirements

Integration tests maintain the same coverage thresholds as unit tests:
- **Branches**: 80%
- **Functions**: 80% 
- **Lines**: 80%
- **Statements**: 80%

## Best Practices

### Test Organization

1. **Logical Grouping**: Tests are organized by service/workflow
2. **Descriptive Names**: Clear test descriptions that explain the scenario
3. **Setup/Teardown**: Consistent beforeEach/afterEach patterns
4. **Mock Management**: Proper mock setup and cleanup

### Assertion Patterns

1. **Expect Objects**: Use `expect.objectContaining()` for flexible assertions
2. **Call Verification**: Verify service method calls with proper parameters
3. **Error Matching**: Use `toMatchObject()` for error structure validation
4. **State Validation**: Check both immediate and downstream effects

### Multi-Tenant Testing

1. **Organization Isolation**: Every test includes organization metadata
2. **Cross-Tenant Security**: Verify data isolation between organizations
3. **Metadata Consistency**: Ensure organization IDs flow through all processes

## Debugging Tests

### Common Issues

1. **Mock Call Counts**: Use `toHaveBeenNthCalledWith()` for multiple calls to same mock
2. **Async Operations**: Ensure all promises are awaited properly
3. **Event Sequencing**: Webhook events must be processed in correct order
4. **Metadata Extraction**: Verify organization ID extraction from various sources

### Debugging Commands

```bash
# Watch mode for development
npm run test:watch:integration

# Verbose output
npm test -- --verbose

# Specific test pattern
npm test -- --testNamePattern="should handle subscription creation"
```

## Future Enhancements

### Planned Additions

1. **Performance Testing**: Add timing assertions for critical workflows
2. **Load Testing**: Test concurrent webhook processing at scale
3. **Real API Testing**: Optional integration with Stripe test mode
4. **Visual Assertions**: Screenshot testing for checkout flows
5. **Database Integration**: Test database state changes from webhooks

### Extension Points

The test suite is designed for easy extension:
- New webhook event types
- Additional error scenarios  
- More complex multi-tenant workflows
- Integration with other payment providers
- Custom business logic validation

## Security Considerations

Integration tests validate:
- Webhook signature verification
- Organization data isolation
- Sensitive data handling
- API key validation
- Rate limiting behavior

## Contributing

When adding new integration tests:

1. Follow existing naming conventions
2. Include organization metadata in all scenarios
3. Test both success and failure paths
4. Add comprehensive error handling
5. Update this documentation

The integration test suite provides confidence that the Stripe payment system works correctly across all supported scenarios and edge cases.