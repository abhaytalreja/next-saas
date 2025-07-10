# Test Users for Manual Testing

This document contains predefined test users for manual testing of the NextSaaS application. These users have different roles, permissions, and data states to help test various scenarios.

## Test Email System

For testing email functionality, we use **Mailinator** public mailboxes:
- **Base format**: `next-saas-{purpose}@mailinator.com`
- **Access**: Go to https://mailinator.com and enter the email address
- **Retention**: Emails are deleted after a few hours

## 👥 Test User Accounts

### 1. Admin Users

#### Super Admin
- **Email**: `next-saas-admin@mailinator.com`
- **Password**: `AdminTest123!`
- **Role**: Platform Administrator
- **Organizations**: All (global access)
- **Features**: Full access to all features, user management, billing
- **Profile Status**: Complete profile with avatar
- **Use Cases**: Testing admin features, organization management, billing oversight

#### Organization Admin
- **Email**: `next-saas-org-admin@mailinator.com`
- **Password**: `OrgAdmin123!`
- **Role**: Organization Administrator
- **Organizations**: "Acme Corporation" (Owner)
- **Features**: Team management, organization settings, billing for org
- **Profile Status**: Complete professional profile
- **Use Cases**: Testing organization administration, team invites, settings

### 2. Regular Users

#### Standard User
- **Email**: `next-saas-user@mailinator.com`
- **Password**: `UserTest123!`
- **Role**: Member
- **Organizations**: "Acme Corporation" (Member)
- **Features**: Basic profile, limited settings access
- **Profile Status**: Basic profile, no avatar
- **Use Cases**: Testing standard user experience, profile updates

#### Multi-Org User
- **Email**: `next-saas-multi@mailinator.com`
- **Password**: `MultiTest123!`
- **Role**: Admin in Org A, Member in Org B
- **Organizations**: 
  - "Tech Startup Inc" (Admin)
  - "Consulting Firm LLC" (Member)
- **Features**: Different permissions per organization
- **Profile Status**: Complete profile in both orgs
- **Use Cases**: Testing organization switching, role-based access

#### Mobile User
- **Email**: `next-saas-mobile@mailinator.com`
- **Password**: `MobileTest123!`
- **Role**: Member
- **Organizations**: "Mobile First Co" (Member)
- **Features**: Optimized for mobile testing
- **Profile Status**: Mobile-uploaded avatar, touch-optimized settings
- **Use Cases**: Testing mobile interface, touch interactions

### 3. New/Incomplete Users

#### Pending Verification
- **Email**: `next-saas-pending@mailinator.com`
- **Password**: `PendingTest123!`
- **Status**: Account created, email not verified
- **Organizations**: None
- **Use Cases**: Testing email verification flow, account activation

#### Incomplete Profile
- **Email**: `next-saas-incomplete@mailinator.com`
- **Password**: `IncompleteTest123!`
- **Status**: Verified, but minimal profile data
- **Organizations**: "Startup Co" (Member)
- **Profile Status**: No avatar, missing personal info
- **Use Cases**: Testing profile completion flow, onboarding

#### Invited User (Not Registered)
- **Email**: `next-saas-invited@mailinator.com`
- **Status**: Has pending organization invitation
- **Organizations**: "Enterprise Corp" (Pending Member)
- **Use Cases**: Testing invitation acceptance flow, new user signup

### 4. Edge Case Users

#### Deleted Account User
- **Email**: `next-saas-deleted@mailinator.com`
- **Status**: Account scheduled for deletion (30-day grace period)
- **Use Cases**: Testing account recovery, deletion workflow

#### Locked Account User
- **Email**: `next-saas-locked@mailinator.com`
- **Password**: `LockedTest123!`
- **Status**: Account locked due to security issues
- **Use Cases**: Testing account recovery, security workflows

#### GDPR Request User
- **Email**: `next-saas-gdpr@mailinator.com`
- **Password**: `GdprTest123!`
- **Status**: Has active data export request
- **Use Cases**: Testing GDPR compliance, data export/deletion

## 🏢 Test Organizations

### 1. Acme Corporation
- **Domain**: `acme-corp.com`
- **Type**: Standard Business
- **Members**: 12 users (mix of roles)
- **Features**: All standard features enabled
- **Status**: Active subscription
- **Use Cases**: Standard organization testing

### 2. Tech Startup Inc
- **Domain**: `techstartup.io`
- **Type**: Technology Startup
- **Members**: 5 users
- **Features**: Developer-focused features
- **Status**: Trial period
- **Use Cases**: Testing trial limitations, developer features

### 3. Enterprise Corp
- **Domain**: `enterprise.com`
- **Type**: Large Enterprise
- **Members**: 50+ users
- **Features**: All enterprise features
- **Status**: Enterprise subscription
- **Use Cases**: Testing enterprise features, large team management

### 4. Consulting Firm LLC
- **Domain**: `consulting.biz`
- **Type**: Professional Services
- **Members**: 8 users
- **Features**: Client management features
- **Status**: Active subscription
- **Use Cases**: Testing professional service workflows

## 📧 Email Testing Scenarios

### Welcome Email Flow
1. Register with `next-saas-welcome-{timestamp}@mailinator.com`
2. Check mailbox for welcome email
3. Verify email verification link works
4. Test welcome sequence completion

### Password Reset Flow
1. Use existing test user: `next-saas-user@mailinator.com`
2. Request password reset
3. Check mailbox for reset email
4. Verify reset link and new password flow

### Organization Invitation Flow
1. Admin user invites: `next-saas-invite-test-{timestamp}@mailinator.com`
2. Check mailbox for invitation email
3. Test invitation acceptance flow
4. Verify new user creation and organization access

### Activity Notification Flow
1. Use `next-saas-activity@mailinator.com`
2. Enable security notifications in profile
3. Perform security-related actions (login from new device, etc.)
4. Check mailbox for security notifications

## 🧪 Testing Scenarios

### 1. Complete User Journey
**Scenario**: New user signup to full profile completion

**Steps**:
1. Register new account with `next-saas-journey-{timestamp}@mailinator.com`
2. Verify email via Mailinator
3. Complete onboarding flow
4. Join organization via invitation
5. Complete profile setup
6. Upload avatar
7. Configure preferences
8. Test mobile interface

**Expected**: Smooth flow with proper notifications and guidance

### 2. Organization Management
**Scenario**: Admin managing team and settings

**User**: `next-saas-org-admin@mailinator.com`

**Steps**:
1. Login as organization admin
2. Send invitation to new user
3. Manage existing user roles
4. Update organization settings
5. View team activity dashboard
6. Test billing and subscription features

**Expected**: Full admin control with proper permissions

### 3. Mobile User Experience
**Scenario**: Complete mobile workflow

**User**: `next-saas-mobile@mailinator.com`

**Steps**:
1. Login on mobile device/browser
2. Navigate mobile-optimized interface
3. Update profile with touch interactions
4. Upload avatar using mobile camera
5. Test bottom sheet interactions
6. Verify touch targets and gestures

**Expected**: Smooth mobile experience with touch optimization

### 4. Security and Privacy
**Scenario**: GDPR compliance and security features

**User**: `next-saas-gdpr@mailinator.com`

**Steps**:
1. Request data export
2. Review activity dashboard
3. Test session management
4. Request account deletion
5. Test deletion grace period
6. Verify data cleanup

**Expected**: Full GDPR compliance with proper data handling

### 5. Multi-Organization Access
**Scenario**: User with multiple organization memberships

**User**: `next-saas-multi@mailinator.com`

**Steps**:
1. Login and verify multiple organizations
2. Switch between organizations
3. Update profiles for each organization
4. Test different role permissions
5. Verify data isolation between orgs

**Expected**: Proper multi-tenant behavior with role-based access

## 🔍 Manual Testing Checklist

### Profile Management
- [ ] Create/update personal profile
- [ ] Upload/change avatar image
- [ ] Configure preferences and settings
- [ ] Test mobile profile interface
- [ ] Verify accessibility features
- [ ] Test keyboard navigation

### Organization Features
- [ ] Create new organization
- [ ] Send team invitations
- [ ] Manage member roles and permissions
- [ ] Update organization profile
- [ ] Test organization directory
- [ ] Verify multi-tenant data isolation

### Security Features
- [ ] Two-factor authentication setup
- [ ] Session management and device tracking
- [ ] Password change and recovery
- [ ] Security notification settings
- [ ] Activity monitoring and audit logs

### Data Privacy
- [ ] Data export functionality
- [ ] Account deletion workflow
- [ ] Privacy setting controls
- [ ] GDPR compliance features
- [ ] Data retention policies

### Mobile Experience
- [ ] Touch-optimized interfaces
- [ ] Responsive design across devices
- [ ] Mobile avatar upload
- [ ] Gesture-based interactions
- [ ] Bottom sheet navigation

### Accessibility
- [ ] Screen reader compatibility
- [ ] Keyboard-only navigation
- [ ] High contrast mode support
- [ ] Focus management
- [ ] ARIA labeling and descriptions

## 📝 Test Data Reset

To reset test data:

1. **Database Reset**: Run the seed script to restore test users
   ```bash
   npm run db:seed:test-users
   ```

2. **Email Cleanup**: Mailinator automatically deletes emails after a few hours

3. **Storage Cleanup**: Clear test avatars from storage
   ```bash
   npm run storage:cleanup:test-data
   ```

4. **Cache Clear**: Reset application caches
   ```bash
   npm run cache:clear
   ```

## 🚨 Important Notes

### Security Considerations
- Test passwords are intentionally weak for testing purposes
- Never use test credentials in production
- Test data should be regularly cleaned up
- Mailinator emails are public - never use for sensitive data

### Email Testing
- Mailinator emails are deleted automatically
- Check emails immediately after triggers
- Use timestamp suffixes for unique test emails
- Multiple people can access the same mailbox

### Mobile Testing
- Test on actual devices when possible
- Use browser dev tools for quick responsive testing
- Verify touch targets meet minimum size requirements
- Test both portrait and landscape orientations

### Accessibility Testing
- Use screen readers (NVDA, JAWS, VoiceOver)
- Test keyboard-only navigation
- Verify color contrast ratios
- Check focus indicators and order

## 📞 Support

If you encounter issues with test users or need additional test scenarios:

1. Check the troubleshooting section in the main documentation
2. Verify test data hasn't been corrupted
3. Reset test environment if needed
4. Contact development team for assistance

Remember: These test users are for development and testing purposes only. Never use them in production environments.