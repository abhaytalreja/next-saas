# Feature Testing Requirements

> **Mandatory testing standards for all new features in the NextSaaS system**

## Overview

Every new feature added to the NextSaaS system **MUST** be fully tested at multiple levels before deployment. This document outlines the **bare minimum** testing requirements that are non-negotiable for any feature contribution.

## 🚫 No Feature Ships Without Tests

**RULE: No feature can be merged or deployed without complete test coverage across all applicable testing levels.**

---

## Testing Levels & Requirements

### 1. 📋 Unit Testing (MANDATORY)

**Scope**: Test individual components, functions, and modules in isolation.

#### Minimum Requirements:

- ✅ **80% code coverage** minimum (branches, functions, lines, statements)
- ✅ All component variants and props tested
- ✅ All function parameters and return values tested
- ✅ Error handling and edge cases covered
- ✅ State management logic validated

#### What Must Be Tested:

**For UI Components:**

```typescript
describe('ComponentName', () => {
  // REQUIRED: Basic rendering
  test('renders correctly with default props', () => {})

  // REQUIRED: All variants
  test.each(['primary', 'secondary', 'destructive'])(
    'renders %s variant',
    () => {}
  )

  // REQUIRED: All states
  test('handles disabled state', () => {})
  test('handles loading state', () => {})
  test('handles error state', () => {})

  // REQUIRED: User interactions
  test('handles click events', () => {})
  test('handles keyboard navigation', () => {})

  // REQUIRED: Accessibility
  test('meets accessibility standards', async () => {
    await testAccessibility(component)
  })

  // REQUIRED: Ref forwarding (if applicable)
  test('forwards ref correctly', () => {})
})
```

**For Business Logic:**

```typescript
describe('FeatureService', () => {
  // REQUIRED: Core functionality
  test('processes data correctly', () => {})

  // REQUIRED: Error scenarios
  test('handles invalid input gracefully', () => {})
  test('throws appropriate errors', () => {})

  // REQUIRED: Edge cases
  test('handles empty data sets', () => {})
  test('handles maximum limits', () => {})
})
```

**For Hooks:**

```typescript
describe('useFeatureHook', () => {
  // REQUIRED: Initial state
  test('initializes with correct default state', () => {})

  // REQUIRED: State updates
  test('updates state correctly on actions', () => {})

  // REQUIRED: Cleanup
  test('cleans up resources on unmount', () => {})
})
```

### 2. 🔗 Integration Testing (MANDATORY)

**Scope**: Test how components work together and interact with external systems.

#### Minimum Requirements:

- ✅ Component composition and data flow tested
- ✅ API integration points validated
- ✅ Database operations verified (with mocks)
- ✅ Authentication flows tested
- ✅ Multi-tenant scenarios covered

#### What Must Be Tested:

**For Feature Workflows:**

```typescript
describe('FeatureWorkflow Integration', () => {
  // REQUIRED: Complete user flows
  test('completes feature workflow successfully', async () => {
    // Test entire user journey from start to finish
  })

  // REQUIRED: API interactions
  test('handles API responses correctly', async () => {
    // Mock API calls and test responses
  })

  // REQUIRED: Error recovery
  test('recovers from API failures gracefully', async () => {
    // Test network errors, 500s, etc.
  })

  // REQUIRED: State persistence
  test('persists state across page refreshes', async () => {
    // Test local storage, session storage, etc.
  })
})
```

**For Multi-tenant Features:**

```typescript
describe('Multi-tenant Integration', () => {
  // REQUIRED: Tenant isolation
  test('isolates data between tenants', async () => {})

  // REQUIRED: Permission checks
  test('enforces tenant-specific permissions', async () => {})

  // REQUIRED: Organization switching
  test('handles organization context changes', async () => {})
})
```

### 3. 🌐 End-to-End Testing (MANDATORY)

**Scope**: Test complete user journeys from browser to database.

#### Minimum Requirements:

- ✅ Critical user paths tested end-to-end
- ✅ Cross-browser compatibility verified
- ✅ Mobile responsiveness validated
- ✅ Performance benchmarks established
- ✅ Visual regression tests implemented

#### What Must Be Tested:

**For User Journeys:**

```typescript
describe('Feature E2E Tests', () => {
  // REQUIRED: Happy path
  test('user can complete feature successfully', async ({ page }) => {
    // Test complete user workflow
    await page.goto('/feature')
    await page.click('[data-testid="start-feature"]')
    await page.fill('[data-testid="input"]', 'test data')
    await page.click('[data-testid="submit"]')
    await expect(page.locator('[data-testid="success"]')).toBeVisible()
  })

  // REQUIRED: Error scenarios
  test('handles validation errors properly', async ({ page }) => {
    // Test form validation, error messages
  })

  // REQUIRED: Navigation flows
  test('navigates between feature screens correctly', async ({ page }) => {
    // Test routing and navigation
  })
})
```

**For Cross-browser Compatibility:**

```typescript
// REQUIRED: Test on all supported browsers
;['chromium', 'firefox', 'webkit'].forEach(browserName => {
  test.describe(`${browserName} browser tests`, () => {
    test('feature works correctly', async ({ page }) => {
      // Test core functionality
    })
  })
})
```

---

## 🎯 Feature-Specific Requirements

### Authentication Features

- **Unit**: Auth components, validation functions, token handling
- **Integration**: Auth flows with API, session management, redirect logic
- **E2E**: Complete login/signup/logout flows, password reset, social auth

### CRUD Operations

- **Unit**: Form validation, data transformation, error handling
- **Integration**: API calls, optimistic updates, cache invalidation
- **E2E**: Create → Read → Update → Delete workflows

### Dashboard/Analytics Features

- **Unit**: Chart components, data processing, calculations
- **Integration**: Data fetching, real-time updates, filtering
- **E2E**: Dashboard loading, interaction, data drill-down

### Payment/Billing Features

- **Unit**: Price calculations, currency formatting, validation
- **Integration**: Stripe integration, webhook handling, state updates
- **E2E**: Complete payment flow, subscription management

### Multi-tenant Features

- **Unit**: Permission checks, data filtering, tenant context
- **Integration**: RLS policies, organization switching, member management
- **E2E**: Tenant isolation verification, invite flows

---

## 📊 Quality Gates

### Before Code Review:

- [ ] All unit tests pass locally
- [ ] Integration tests pass with mocked dependencies
- [ ] E2E tests pass in development environment
- [ ] Code coverage meets 80% minimum threshold
- [ ] No accessibility violations detected

### Before Merge:

- [ ] All CI/CD tests pass
- [ ] Visual regression tests approved
- [ ] Performance benchmarks within acceptable limits
- [ ] Bundle size increases justified and documented

### Before Deployment:

- [ ] E2E tests pass in staging environment
- [ ] Load testing completed (for critical features)
- [ ] Monitoring and alerting configured
- [ ] Rollback plan documented

---

## 🛠️ Testing Tools & Setup

### Required Test Files Structure:

```
src/
├── components/
│   └── MyFeature/
│       ├── MyFeature.tsx
│       ├── MyFeature.test.tsx        # Unit tests
│       ├── MyFeature.visual.test.ts  # Visual regression
│       └── index.ts
├── hooks/
│   └── useMyFeature/
│       ├── useMyFeature.ts
│       ├── useMyFeature.test.ts      # Unit tests
│       └── index.ts
├── services/
│   └── myFeatureService/
│       ├── myFeatureService.ts
│       ├── myFeatureService.test.ts  # Unit + Integration
│       └── index.ts
└── __tests__/
    ├── integration/
    │   └── MyFeature.integration.test.ts
    └── e2e/
        └── MyFeature.e2e.test.ts
```

### Test Commands:

```bash
# Run all tests for a feature
npm run test -- --testPathPattern=MyFeature

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Coverage for specific feature
npm run test:coverage -- --testPathPattern=MyFeature
```

---

## 📋 Feature Testing Checklist

### Before Starting Development:

- [ ] Identify all test scenarios (happy path, edge cases, errors)
- [ ] Plan test data requirements
- [ ] Determine external dependencies to mock
- [ ] Write test plan for review

### During Development:

- [ ] Write unit tests alongside implementation (TDD approach)
- [ ] Create integration tests for API interactions
- [ ] Implement visual regression tests for UI changes
- [ ] Test accessibility with screen readers and keyboard navigation

### Before Code Review:

- [ ] All tests pass locally
- [ ] Code coverage meets requirements
- [ ] Tests cover all acceptance criteria
- [ ] Error scenarios properly tested
- [ ] Performance implications considered

### During Code Review:

- [ ] Test quality reviewed alongside code quality
- [ ] Test scenarios validated against requirements
- [ ] Edge cases adequately covered
- [ ] Test maintainability assessed

### Before Deployment:

- [ ] E2E tests pass in staging
- [ ] Performance benchmarks established
- [ ] Monitoring configured for new feature
- [ ] Documentation updated

---

## 🚨 Non-Negotiables

### What Will Block Your Feature:

1. **Missing unit tests** → Feature rejected
2. **Coverage below 80%** → Feature rejected
3. **No integration tests for API calls** → Feature rejected
4. **No E2E tests for user flows** → Feature rejected
5. **Accessibility violations** → Feature rejected
6. **Visual regressions** → Feature rejected
7. **Breaking existing tests** → Feature rejected

### Enforcement:

- **CI/CD Pipeline**: Automatically blocks merges without proper tests
- **Code Review**: Reviewers must verify test coverage and quality
- **Deployment Gates**: Staging tests must pass before production release

---

## 📚 Resources & Examples

### Testing Utilities:

- **Unit Testing**: Use `test-utils.tsx` for component testing
- **Mocking**: Use established mock patterns for Supabase, Auth
- **Accessibility**: Use `testAccessibility()` helper function
- **Visual Testing**: Use Playwright screenshot comparison

### Example Test Files:

- `packages/ui/src/atoms/buttons/Button.test.tsx` - Component unit tests
- `packages/auth/src/hooks/useAuth.test.ts` - Hook testing
- `e2e/auth/login.e2e.test.ts` - End-to-end user flows

### Documentation:

- [Testing Guide](./docs/TESTING_GUIDE.md)
- [Authentication Testing](./AUTH_TESTING_GUIDE.md)
- [Multi-tenant Testing](./MULTI_TENANT_TESTING_GUIDE.md)

---

**Remember: Testing is not optional. It's an integral part of feature development that ensures system reliability, maintainability, and user experience quality.**
