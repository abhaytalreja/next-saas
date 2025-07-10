# E2E Testing Guide

## Overview

This guide covers the comprehensive End-to-End (E2E) testing strategy for NextSaaS, including complete user journeys, mobile experiences, organization workflows, and cross-browser compatibility testing.

## Test Structure

### Test Categories

#### 1. User Journey Tests (`user-journey.spec.ts`)
Complete user lifecycle from registration to advanced features:
- Registration and email verification
- Profile setup and avatar upload
- Activity tracking and security features
- GDPR compliance and data management
- Cross-platform accessibility features
- Performance and error handling

#### 2. Mobile User Journey Tests (`mobile-user-journey.spec.ts`)
Mobile-specific user experiences across devices:
- Touch-optimized interfaces
- Gesture-based interactions
- Mobile camera integration
- Responsive design validation
- Cross-platform mobile consistency
- Offline behavior testing

#### 3. Organization Workflow Tests (`organization-workflow.spec.ts`)
Multi-tenant organization management:
- Organization creation and setup
- Team invitation and role management
- Multi-organization user experience
- Role-based access control
- Activity tracking and audit logs
- Security and compliance features

## Test Environment Setup

### Prerequisites

```bash
# Install Playwright
npm install @playwright/test

# Install browsers
npx playwright install

# Verify installation
npx playwright --version
```

### Environment Configuration

The tests support multiple environments:

- **Local**: `http://localhost:3000` (default)
- **Staging**: Configured via `STAGING_URL` environment variable
- **Production**: Configured via `PRODUCTION_URL` environment variable

### Email Testing with Mailinator

Tests use Mailinator public mailboxes for email verification:

```
Format: next-saas-{purpose}-{timestamp}@mailinator.com
Example: next-saas-journey-user-1635789123@mailinator.com
```

Access emails at: https://www.mailinator.com

## Running Tests

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test types
npm run test:e2e:user        # User journey tests only
npm run test:e2e:mobile      # Mobile-specific tests only
npm run test:e2e:org         # Organization workflow tests only
npm run test:e2e:smoke       # Quick smoke tests

# Development and debugging
npm run test:e2e:headed      # Run with visible browser
npm run test:e2e:debug       # Debug mode with single worker
npm run test:e2e:staging     # Run against staging environment

# View test reports
npm run test:e2e:report      # Open HTML report
```

### Advanced Usage

```bash
# Custom test execution
node scripts/run-e2e-tests.js --type user --env staging --headed --debug

# Cross-browser testing
npm run test:e2e -- --project=chromium --project=firefox --project=webkit

# Mobile device testing
npm run test:e2e:mobile -- --project="Mobile Chrome" --project="Mobile Safari"

# Parallel execution control
npm run test:e2e -- --workers=4

# Custom reporters
npm run test:e2e -- --reporter=json --reporter=html
```

## Test Data Management

### Test Users

The system uses predefined test users with different roles and states:

#### Standard Test Users
- **Admin User**: `next-saas-admin@mailinator.com` / `AdminTest123!`
- **Regular User**: `next-saas-user@mailinator.com` / `UserTest123!`
- **Multi-Org User**: `next-saas-multi@mailinator.com` / `MultiTest123!`
- **Mobile User**: `next-saas-mobile@mailinator.com` / `MobileTest123!`

#### Edge Case Users
- **Pending Verification**: `next-saas-pending@mailinator.com`
- **Incomplete Profile**: `next-saas-incomplete@mailinator.com`
- **Deleted Account**: `next-saas-deleted@mailinator.com`
- **GDPR Request**: `next-saas-gdpr@mailinator.com`

See [test-users.md](./test-users.md) for complete list and usage instructions.

### Test Organizations

- **Acme Corporation**: Standard business organization
- **Tech Startup Inc**: Developer-focused startup
- **Enterprise Corp**: Large enterprise with advanced features
- **Consulting Firm LLC**: Professional services organization

## Test Scenarios

### 1. Complete User Registration Flow

```typescript
test('User Registration and Email Verification Journey', async ({ page, context }) => {
  // 1. Navigate to signup page
  await page.goto('/auth/signup')
  
  // 2. Fill registration form
  await page.fill('[data-testid="email"]', userEmail)
  // ... form completion
  
  // 3. Verify email via Mailinator
  const emailPage = await context.newPage()
  await checkMailinatorEmail(emailPage, userEmail, 'Verify your NextSaaS account')
  
  // 4. Complete verification flow
  const verificationLink = await getVerificationLink(emailPage)
  await page.goto(verificationLink)
  
  // 5. Verify successful registration
  await expect(page).toHaveURL(/\/dashboard/)
})
```

### 2. Mobile Touch Interactions

```typescript
test('Mobile avatar upload with touch interactions', async ({ page }) => {
  // Test touch-optimized avatar management
  await page.tap('[data-testid="mobileAvatarContainer"]')
  await expect(page.locator('[data-testid="mobileAvatarMenu"]')).toBeVisible()
  
  // Test swipe gestures
  await page.mouse.down()
  await page.mouse.move(0, -100) // Swipe up
  await page.mouse.up()
})
```

### 3. Organization Role Management

```typescript
test('Admin managing team roles and permissions', async ({ page }) => {
  // Login as admin
  await loginAsAdmin(page)
  
  // Navigate to member management
  await page.goto('/organizations/members')
  
  // Change user role
  await page.click('[data-testid="changeRole"]')
  await page.selectOption('[data-testid="newRole"]', 'manager')
  await page.click('[data-testid="confirmRoleChange"]')
  
  // Verify role change
  await expect(page.locator('[data-testid="roleChangeSuccess"]')).toBeVisible()
})
```

## Browser and Device Coverage

### Desktop Browsers
- **Chrome**: Latest stable version
- **Firefox**: Latest stable version  
- **Safari**: Latest stable version (WebKit)
- **Edge**: Chromium-based Edge

### Mobile Devices
- **iPhone 12**: Mobile Safari
- **Pixel 5**: Mobile Chrome
- **iPad Pro**: Tablet Safari
- **Galaxy S21**: Mobile Chrome (Samsung Internet simulation)

### Viewport Testing
- **Mobile**: 375x667 (iPhone SE)
- **Tablet**: 768x1024 (iPad)
- **Desktop**: 1920x1080 (Full HD)
- **Large Desktop**: 2560x1440 (QHD)

## Accessibility Testing

### Automated Accessibility Checks

```typescript
test('Accessibility compliance', async ({ page }) => {
  await page.goto('/settings/profile')
  
  // Test keyboard navigation
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  
  // Test screen reader compatibility
  const ariaLabels = await page.locator('[aria-label]').count()
  expect(ariaLabels).toBeGreaterThan(0)
  
  // Test focus management
  await page.click('[data-testid="openModal"]')
  // Focus should be trapped in modal
})
```

### WCAG 2.1 AA Compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast validation
- Focus management
- ARIA labeling and descriptions

## Performance Testing

### Core Web Vitals
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Mobile Performance
- Initial page load: < 3s on 3G
- JavaScript bundle size monitoring
- Image optimization validation
- Offline behavior testing

## Security Testing

### Automated Security Checks

```typescript
test('XSS Protection', async ({ page }) => {
  // Test XSS prevention
  await page.fill('[data-testid="firstName"]', '<script>alert("xss")</script>')
  
  // Script should be escaped, not executed
  page.on('dialog', dialog => {
    throw new Error('XSS vulnerability detected')
  })
})

test('CSRF Protection', async ({ request }) => {
  // Test CSRF token validation
  const response = await request.post('/api/profile', {
    data: { bio: 'test' }
    // Missing CSRF token should be rejected
  })
  expect([403, 401].includes(response.status())).toBeTruthy()
})
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          TEST_BASE_URL: http://localhost:3000
      
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: e2e-report
          path: e2e-report/
```

### Test Reporting

Tests generate multiple report formats:
- **HTML Report**: `e2e-report/index.html` - Interactive test results
- **JSON Report**: `e2e-results.json` - Machine-readable results
- **JUnit Report**: `e2e-results.xml` - CI/CD integration
- **Screenshots**: Captured on test failures
- **Videos**: Recorded for failed tests
- **Traces**: Detailed execution traces for debugging

## Debugging Tests

### Local Debugging

```bash
# Run in debug mode with visible browser
npm run test:e2e:debug

# Run specific test with debugging
npx playwright test user-journey.spec.ts --debug --headed

# Record test execution
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

### Debug Tools
- **Playwright Inspector**: Step through tests interactively
- **Browser DevTools**: Available in headed mode
- **Console Logs**: Captured in test output
- **Screenshots**: Automatic on failures
- **Video Recording**: Full test execution recording

## Best Practices

### Test Organization
- Group related tests in describe blocks
- Use meaningful test descriptions
- Keep tests independent and atomic
- Use proper setup and teardown

### Data Management
- Use unique test data (timestamps)
- Clean up test data after execution
- Avoid dependencies between tests
- Use realistic test scenarios

### Maintenance
- Regular test review and updates
- Remove or update obsolete tests
- Monitor test execution times
- Keep test documentation current

## Troubleshooting

### Common Issues

**Tests timing out**
- Increase timeout values in config
- Check network connectivity
- Verify application is running

**Email verification failing**
- Check Mailinator accessibility
- Verify email generation logic
- Increase email check timeout

**Mobile tests failing**
- Verify device emulation setup
- Check touch target sizes
- Test on actual devices when possible

**Flaky tests**
- Add proper wait conditions
- Use stable selectors
- Avoid hardcoded delays

### Getting Help

1. Check test logs and screenshots
2. Review the troubleshooting section
3. Run tests in debug mode
4. Contact development team for persistent issues

## Continuous Improvement

### Metrics to Monitor
- Test execution time
- Test failure rates
- Coverage gaps
- Performance regressions

### Regular Reviews
- Monthly test suite review
- Quarterly performance analysis
- Update test scenarios for new features
- Retire obsolete test cases

This comprehensive E2E testing strategy ensures robust validation of the complete NextSaaS user experience across all supported browsers, devices, and use cases.