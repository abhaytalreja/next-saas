# E2E Test Database Setup Guide

This guide covers the comprehensive test database setup system for NextSaaS E2E testing, including data seeding, user management, and test isolation.

## Overview

The E2E test database system provides:
- **Consistent test data** across test runs
- **Realistic user scenarios** with different states and roles
- **Multi-tenant organization testing** with proper relationships
- **Email testing integration** using Mailinator
- **Data cleanup and isolation** between test runs
- **GDPR and security testing** scenarios

## Quick Start

### 1. Environment Setup

Copy the test environment template:
```bash
cp .env.test.example .env.test
```

Configure your test database credentials in `.env.test`:
```bash
# Test Database Configuration
TEST_SUPABASE_URL=your_test_supabase_url_here
TEST_SUPABASE_SERVICE_KEY=your_test_service_key_here
TEST_SUPABASE_ANON_KEY=your_test_anon_key_here
```

### 2. Initial Database Setup

Run the complete E2E database setup:
```bash
npm run test:e2e:setup
```

This will:
- ✅ Check prerequisites and environment
- ✅ Reset and clean the test database
- ✅ Seed all test users and organizations
- ✅ Create relationships and sample data
- ✅ Verify data integrity
- ✅ Generate setup report

### 3. Run E2E Tests

With test data in place, run your E2E tests:
```bash
npm run test:e2e              # All tests
npm run test:e2e:user         # User journey tests
npm run test:e2e:mobile       # Mobile tests
npm run test:e2e:org          # Organization tests
```

### 4. Cleanup After Testing

Clean up dynamic test data:
```bash
npm run test:e2e:cleanup      # Clean dynamic data, preserve core users
npm run test:e2e:reset        # Full database reset
```

## Test Data Structure

### Core Test Users

All test users use `@mailinator.com` emails for email testing:

| Email | Password | Role | Status | Use Case |
|-------|----------|------|--------|----------|
| `next-saas-admin@mailinator.com` | `AdminTest123!` | Platform Admin | Verified, Complete | Admin features, user management |
| `next-saas-org-admin@mailinator.com` | `OrgAdmin123!` | Org Admin | Verified, Complete | Organization management, team features |
| `next-saas-user@mailinator.com` | `UserTest123!` | User | Verified, Complete | Standard user workflows |
| `next-saas-multi@mailinator.com` | `MultiTest123!` | User | Verified, Complete | Multi-organization testing |
| `next-saas-mobile@mailinator.com` | `MobileTest123!` | User | Verified, Complete | Mobile interface testing |
| `next-saas-pending@mailinator.com` | `PendingTest123!` | User | Unverified | Email verification flows |
| `next-saas-incomplete@mailinator.com` | `IncompleteTest123!` | User | Verified, Incomplete | Profile completion flows |
| `next-saas-gdpr@mailinator.com` | `GdprTest123!` | User | Verified, Complete | GDPR compliance testing |

### Test Organizations

| Organization | Domain | Type | Owner | Features |
|--------------|--------|------|-------|----------|
| Acme Corporation | `acme-test.com` | Business | Admin User | Standard business features |
| Tech Startup Inc | `techstartup-test.io` | Startup | Org Admin | Limited trial features |
| Enterprise Corp | `enterprise-test.com` | Enterprise | Admin User | Full enterprise features |
| Consulting Firm LLC | `consulting-test.biz` | Professional | Multi User | Professional services |
| Mobile First Co | `mobile-test.app` | Mobile App | Mobile User | Mobile-optimized features |

### User-Organization Relationships

| User | Organization | Role | Status | Use Case |
|------|--------------|------|--------|----------|
| Admin | Acme Corporation | Owner | Active | Organization ownership testing |
| User | Acme Corporation | Member | Active | Standard member experience |
| Multi | Tech Startup Inc | Admin | Active | Multi-org admin role |
| Multi | Consulting Firm LLC | Member | Active | Multi-org member role |
| Mobile | Mobile First Co | Member | Active | Mobile user experience |

## Database Seeding System

### Seed Files Structure

```
packages/database/seeds/test/
├── 001_test_users.sql           # Core test users with preferences
├── 002_test_organizations.sql   # Test organizations and profiles
├── 003_test_memberships.sql     # User-org relationships and invitations
├── 004_test_auth_data.sql       # Sessions, tokens, auth events
└── 005_test_avatars_data.sql    # Avatars, exports, deletions
```

### TypeScript Seed Manager

The `E2ESeedManager` class provides programmatic seeding:

```typescript
import E2ESeedManager from '@/packages/database/src/tools/seed-e2e'

const seedManager = new E2ESeedManager()

// Setup complete test environment
await seedManager.setupE2EDatabase()

// Or individual operations
await seedManager.seedTestUsers()
await seedManager.seedTestOrganizations()
await seedManager.cleanupDynamicData()
await seedManager.verifyTestData()
```

### Available Commands

```bash
# Database package commands
cd packages/database
npm run db:seed:e2e setup         # Full setup
npm run db:seed:e2e users          # Users only
npm run db:seed:e2e organizations  # Organizations only
npm run db:seed:e2e verify         # Verify integrity
npm run db:seed:e2e cleanup        # Clean dynamic data

# Root package commands
npm run test:e2e:setup    # Complete E2E database setup
npm run test:e2e:cleanup  # Cleanup dynamic test data
npm run test:e2e:reset    # Full reset (calls setup script)
```

## Email Testing with Mailinator

### How It Works

All test users use **Mailinator** public email addresses:
- **Format**: `next-saas-{purpose}@mailinator.com`
- **Access**: Visit https://mailinator.com and enter the email address
- **Retention**: Emails auto-delete after a few hours
- **Public**: Anyone can access these mailboxes (for testing only!)

### Email Testing Patterns

#### Static Test Emails (Pre-configured)
```
next-saas-admin@mailinator.com      # Admin user emails
next-saas-user@mailinator.com       # Regular user emails
next-saas-pending@mailinator.com    # Verification emails
```

#### Dynamic Test Emails (Generated during tests)
```
next-saas-journey-{timestamp}@mailinator.com    # User journey tests
next-saas-invite-{timestamp}@mailinator.com     # Invitation tests
next-saas-temp-{timestamp}@mailinator.com       # Temporary test users
```

### Email Testing Workflows

#### 1. Registration Flow Testing
```typescript
test('User registration and email verification', async ({ page }) => {
  const testEmail = `next-saas-journey-${Date.now()}@mailinator.com`
  
  // 1. Register user
  await page.goto('/auth/sign-up')
  await page.fill('[data-testid="signup-email-input"]', testEmail)
  // ... complete registration
  
  // 2. Check email in Mailinator
  const emailPage = await context.newPage()
  await emailPage.goto(`https://mailinator.com/inbox2.jsp?public_to=${testEmail.split('@')[0]}`)
  
  // 3. Find and click verification link
  // ... email verification logic
})
```

#### 2. Password Reset Testing
```typescript
test('Password reset flow', async ({ page }) => {
  // 1. Request password reset
  await page.goto('/auth/forgot-password')
  await page.fill('[data-testid="forgot-password-email-input"]', 'next-saas-user@mailinator.com')
  await page.click('[data-testid="send-reset-link-button"]')
  
  // 2. Check reset email
  // ... Mailinator email checking logic
})
```

## Data Cleanup and Isolation

### Cleanup Strategy

The system uses a **preserve core, clean dynamic** approach:

#### Preserved Data (Core Test Users)
- ✅ Core test users (`next-saas-*@mailinator.com`)
- ✅ Test organizations
- ✅ User-organization relationships
- ✅ User preferences and profiles

#### Cleaned Data (Dynamic Test Data)
- 🗑️ Users with timestamp suffixes (`next-saas-journey-123@mailinator.com`)
- 🗑️ Dynamic organizations created during tests
- 🗑️ Expired sessions and tokens
- 🗑️ Recent activity logs
- 🗑️ Test file uploads

### Cleanup Commands

```bash
# Clean dynamic data only (recommended)
npm run test:e2e:cleanup

# Full reset (rebuilds everything)
npm run test:e2e:reset

# Dry run (preview what would be cleaned)
node scripts/cleanup-e2e-data.js --dry-run
```

### Test Isolation

Each test run:
1. **Starts with clean core data** (preserved between runs)
2. **Creates dynamic data** with unique identifiers
3. **Cleans up dynamic data** after completion
4. **Preserves core data** for next run

## Advanced Usage

### Custom Test Users

Create temporary test users during test runs:

```typescript
// In your E2E tests
const dynamicEmail = `next-saas-test-${Date.now()}@mailinator.com`

await page.goto('/auth/sign-up')
await page.fill('[data-testid="signup-email-input"]', dynamicEmail)
// ... complete registration

// User will be automatically cleaned up by cleanup script
```

### Organization Testing

Test multi-tenant scenarios:

```typescript
test('Multi-organization user experience', async ({ page }) => {
  // Login as multi-org user
  await page.goto('/auth/sign-in')
  await page.fill('[data-testid="login-email-input"]', 'next-saas-multi@mailinator.com')
  await page.fill('[data-testid="login-password-input"]', 'MultiTest123!')
  await page.click('[data-testid="login-submit-button"]')
  
  // Switch between organizations
  await page.click('[data-testid="organization-switcher"]')
  // ... test organization switching
})
```

### GDPR Compliance Testing

Test data export and deletion workflows:

```typescript
test('GDPR data export flow', async ({ page }) => {
  // Login as GDPR test user
  await page.goto('/auth/sign-in')
  await page.fill('[data-testid="login-email-input"]', 'next-saas-gdpr@mailinator.com')
  // ... login
  
  // Request data export
  await page.goto('/settings/profile')
  await page.click('[data-testid="export-tab-trigger"]')
  await page.click('[data-testid="request-export-button"]')
  // ... test export workflow
})
```

## Troubleshooting

### Common Issues

#### 1. "Missing Supabase configuration" Error
```bash
# Check environment variables
echo $TEST_SUPABASE_URL
echo $TEST_SUPABASE_SERVICE_KEY

# Verify .env.test file exists and is configured
cat .env.test
```

#### 2. "Test data verification failed" Error
```bash
# Manually verify test data
npm run db:seed:e2e verify

# Reset if needed
npm run test:e2e:reset
```

#### 3. "Database connection failed" Error
```bash
# Check database accessibility
cd packages/database
npm run db:studio  # Opens Prisma Studio

# Verify credentials in your test database
```

#### 4. Email Testing Issues
- **Emails not appearing**: Check Mailinator for the exact email address
- **Verification links not working**: Ensure base URL matches your test environment
- **Timing issues**: Add appropriate waits for email delivery

### Debug Mode

Run setup with debugging:
```bash
# Setup with detailed logging
DEBUG=true npm run test:e2e:setup

# Cleanup with dry run
npm run test:e2e:cleanup --dry-run

# Verify data integrity
npm run db:seed:e2e verify
```

### Manual Database Inspection

```bash
# Open database studio
cd packages/database
npm run db:studio

# Check specific test data
# Look for users with email containing "@mailinator.com"
# Look for organizations with metadata.test_account = true
```

## Security Considerations

### Test Environment Safety

⚠️ **Important Security Notes**:

1. **Never use test credentials in production**
   - All test passwords are intentionally weak
   - Test accounts should never access production data

2. **Mailinator emails are public**
   - Anyone can access Mailinator mailboxes
   - Never use for sensitive information
   - Only use for testing email workflows

3. **Test database isolation**
   - Always use separate test database
   - Never run tests against production database
   - Environment variables should clearly indicate test environment

4. **Data cleanup**
   - Regularly clean up test data
   - Remove any accidentally created production-like data
   - Monitor for data leakage between environments

### Environment Variables

```bash
# ✅ Good: Clearly separated test environment
TEST_SUPABASE_URL=...
TEST_SUPABASE_SERVICE_KEY=...
NODE_ENV=test

# ❌ Bad: Mixed or unclear environment
SUPABASE_URL=...  # Could be production!
NODE_ENV=development  # Unclear if safe for testing
```

## Maintenance

### Regular Tasks

#### Weekly
- [ ] Run `npm run test:e2e:cleanup` to clean accumulated test data
- [ ] Verify core test users are still functional
- [ ] Check Mailinator emails are accessible

#### Monthly
- [ ] Review test user passwords and update if needed
- [ ] Audit test organizations for relevance
- [ ] Update test data to match new application features
- [ ] Review and update documentation

#### As Needed
- [ ] Add new test users for new user types
- [ ] Create new test organizations for new business models
- [ ] Update seed scripts for new database schema changes
- [ ] Expand email testing scenarios

### Updating Test Data

When adding new features that require test data:

1. **Add seed data** to appropriate SQL files in `packages/database/seeds/test/`
2. **Update TypeScript seeding** in `src/tools/seed-e2e.ts`
3. **Document new test scenarios** in this guide
4. **Update cleanup scripts** if needed
5. **Test the full E2E setup** to ensure compatibility

## Integration with CI/CD

The test database setup integrates with CI/CD pipelines:

```yaml
# Example GitHub Actions integration
- name: Setup E2E Test Database
  run: npm run test:e2e:setup
  env:
    TEST_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
    TEST_SUPABASE_SERVICE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_KEY }}

- name: Run E2E Tests
  run: npm run test:e2e

- name: Cleanup Test Data
  if: always()
  run: npm run test:e2e:cleanup
```

This comprehensive test database setup ensures reliable, consistent E2E testing with realistic data scenarios while maintaining proper isolation and security practices.