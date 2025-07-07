# 🧪 Authentication System Testing Guide

## Prerequisites

### 1. Supabase Setup
1. First, run the main database setup (if not already done):
   ```bash
   npm run db:generate  # This creates supabase-setup.sql
   ```
   Then run the generated SQL in Supabase SQL Editor.

2. Run the additional auth tables migration:
   ```sql
   -- Run the contents of: supabase/migrations/002_auth_additions.sql
   ```

2. Enable Email Auth in Supabase Dashboard:
   - Go to Authentication → Providers
   - Enable Email provider
   - Configure email templates (optional)

3. Enable Social Providers (optional):
   - Enable Google, GitHub, Microsoft, Apple as needed
   - Add OAuth credentials for each provider

4. Configure Auth Settings:
   - Set Site URL: `http://localhost:3000`
   - Add Redirect URLs: 
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/verify-email`

### 2. Environment Variables
Ensure these are set in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📋 Manual Testing Checklist

### 1. Email/Password Authentication

#### Sign Up Flow
- [ ] Navigate to `/auth/sign-up`
- [ ] **Test 1**: Try submitting empty form → Should show validation errors
- [ ] **Test 2**: Enter invalid email → Should show email validation error
- [ ] **Test 3**: Enter weak password → Should show password requirements
- [ ] **Test 4**: Enter mismatched passwords → Should show mismatch error
- [ ] **Test 5**: Complete valid signup:
  - Email: `test@example.com`
  - Password: `Test123!@#` (meets all requirements)
  - First Name: `Test`
  - Last Name: `User`
  - Organization: `Test Company`
- [ ] Check email for verification link
- [ ] Verify user and organization created in Supabase

#### Email Verification
- [ ] Click verification link in email OR navigate to `/auth/verify-email?token=YOUR_TOKEN`
- [ ] **Test 1**: Valid token → Should show success and redirect to dashboard
- [ ] **Test 2**: Invalid token → Should show error with options
- [ ] **Test 3**: Expired token → Should show expiry message with resend option
- [ ] **Test 4**: Click "Resend" → Should send new verification email
- [ ] **Test 5**: Try to access `/dashboard` without verification → Should require verification

#### Sign In Flow
- [ ] Navigate to `/auth/sign-in`
- [ ] **Test 1**: Try with wrong credentials → Should show error
- [ ] **Test 2**: Try with unverified email → Should prompt for verification
- [ ] **Test 3**: Sign in with correct credentials → Should redirect to dashboard
- [ ] **Test 4**: Check "Remember me" → Should persist session
- [ ] **Test 5**: Sign out and check if remembered

#### Password Reset
- [ ] Click "Forgot password?" on sign-in page
- [ ] **Test 1**: Enter non-existent email → Should show generic success (security)
- [ ] **Test 2**: Enter valid email → Should receive reset email
- [ ] Click reset link in email
- [ ] **Test 3**: Enter weak password → Should show requirements
- [ ] **Test 4**: Enter strong password → Should update successfully
- [ ] **Test 5**: Try to sign in with old password → Should fail
- [ ] **Test 6**: Sign in with new password → Should succeed

### 2. Social Authentication

#### OAuth Providers
For each enabled provider (Google, GitHub, Microsoft, Apple):
- [ ] Click social login button on sign-in page
- [ ] **Test 1**: Cancel OAuth flow → Should return to sign-in
- [ ] **Test 2**: Complete OAuth flow → Should create account and redirect
- [ ] **Test 3**: Check if organization created for new OAuth users
- [ ] **Test 4**: Sign in again with same provider → Should use existing account

### 3. Protected Routes & Navigation

#### Dashboard Access
- [ ] **Test 1**: Access `/dashboard` without login → Should redirect to sign-in
- [ ] **Test 2**: Sign in and access `/dashboard` → Should show welcome message
- [ ] **Test 3**: Refresh page → Should maintain session
- [ ] **Test 4**: Check responsive menu on mobile → Should show hamburger menu

#### Account Dropdown
- [ ] Click avatar/account button in header
- [ ] **Test 1**: Check user info displayed correctly
- [ ] **Test 2**: Check organization name shown
- [ ] **Test 3**: Click "Profile" → Should navigate to `/settings/profile`
- [ ] **Test 4**: Click "Security" → Should navigate to `/settings/security`
- [ ] **Test 5**: Click "Sign out" → Should logout and redirect

### 4. Profile Management

#### Profile Settings (`/settings/profile`)
- [ ] **Test 1**: Check pre-filled data from signup
- [ ] **Test 2**: Upload avatar image → Should preview
- [ ] **Test 3**: Try large image (>5MB) → Should show error
- [ ] **Test 4**: Update all fields and save → Should show success
- [ ] **Test 5**: Refresh page → Should persist changes
- [ ] **Test 6**: Remove avatar → Should revert to initials

### 5. Security Settings

#### Password Change (`/settings/security`)
- [ ] **Test 1**: Enter wrong current password → Should show error
- [ ] **Test 2**: Enter weak new password → Should show requirements in real-time
- [ ] **Test 3**: Watch password strength indicator → Should update as you type
- [ ] **Test 4**: Enter valid passwords → Should update successfully
- [ ] **Test 5**: Sign out and sign in with new password → Should work

#### Session Management
- [ ] View active sessions section
- [ ] **Test 1**: Check current session marked
- [ ] **Test 2**: Sign in from another browser/device
- [ ] **Test 3**: Refresh sessions list → Should show new session
- [ ] **Test 4**: Revoke other session → Should remove from list
- [ ] **Test 5**: Try "Sign out all other sessions" → Should revoke all

### 6. Multi-Tenant Organization

#### Organization Switcher
- [ ] **Test 1**: Check current organization displayed
- [ ] **Test 2**: If multiple orgs, switch between them → Should update context
- [ ] **Test 3**: Click "Create New Organization" → Should navigate to create page

#### Organization Settings (`/settings/organization`)
- [ ] **Test 1**: View current organization details
- [ ] **Test 2**: Update organization name → Should save
- [ ] **Test 3**: Update slug (if allowed) → Should validate uniqueness
- [ ] **Test 4**: Add website and description → Should save

#### Member Management (`/settings/organization/members`)
- [ ] **Test 1**: View members list → Should show all members
- [ ] **Test 2**: Check your role (owner/admin/member)
- [ ] **Test 3**: Click "Invite Members" → Should open modal
- [ ] **Test 4**: Add multiple emails with roles → Should validate emails
- [ ] **Test 5**: Send invitations → Should show success
- [ ] **Test 6**: Change member role (if admin) → Should update
- [ ] **Test 7**: Remove member (if admin) → Should confirm and remove

### 7. Organization Invitations

#### Sending Invitations
- [ ] As admin/owner, invite new members
- [ ] **Test 1**: Invite existing member → Should show error
- [ ] **Test 2**: Add personal message → Should include in email
- [ ] **Test 3**: Set different roles → Should respect permissions

#### Accepting Invitations
- [ ] Access invitation link `/invitation/[token]`
- [ ] **Test 1**: View as logged-out user → Should prompt to sign up
- [ ] **Test 2**: View as logged-in user → Should show accept/decline
- [ ] **Test 3**: Accept invitation → Should join organization
- [ ] **Test 4**: Try expired invitation → Should show expiry message
- [ ] **Test 5**: Try used invitation → Should show already used error

### 8. Accessibility Testing

#### Keyboard Navigation
- [ ] **Test 1**: Tab through all forms → Should have logical order
- [ ] **Test 2**: Use Enter to submit forms → Should work
- [ ] **Test 3**: Use Escape to close modals → Should work
- [ ] **Test 4**: Navigate menus with arrow keys → Should work

#### Screen Reader
- [ ] **Test 1**: All form fields have labels
- [ ] **Test 2**: Error messages are announced
- [ ] **Test 3**: Loading states are announced
- [ ] **Test 4**: Success messages are announced

#### Visual
- [ ] **Test 1**: Check color contrast → Should meet WCAG AA
- [ ] **Test 2**: Zoom to 200% → Should remain usable
- [ ] **Test 3**: Check focus indicators → Should be visible

### 9. Responsive Design

#### Mobile Testing
- [ ] **Test 1**: All pages responsive on mobile
- [ ] **Test 2**: Forms usable on small screens
- [ ] **Test 3**: Navigation menu works on mobile
- [ ] **Test 4**: Modals fit on mobile screens
- [ ] **Test 5**: Tables scroll horizontally if needed

### 10. Error Handling

#### Network Errors
- [ ] **Test 1**: Disable network during form submit → Should show error
- [ ] **Test 2**: Slow network → Should show loading states
- [ ] **Test 3**: API errors → Should show user-friendly messages

#### Validation
- [ ] **Test 1**: Client-side validation works instantly
- [ ] **Test 2**: Server-side validation shows errors
- [ ] **Test 3**: Form state preserved after errors

## 🐛 Common Issues & Solutions

### Issue: Email not received
- Check Supabase email settings
- Check spam folder
- Verify SMTP configuration in Supabase

### Issue: OAuth redirect fails
- Verify redirect URLs in Supabase
- Check OAuth app settings with provider
- Ensure correct environment variables

### Issue: Session expires quickly
- Check Supabase JWT expiry settings
- Verify refresh token logic working
- Check for clock skew issues

### Issue: Organization not created
- Check database triggers
- Verify RLS policies
- Check for constraint violations

## 📊 Testing Checklist Summary

- [ ] Email Authentication (Sign up, Sign in, Verification, Password reset)
- [ ] Social Authentication (All enabled providers)
- [ ] Profile Management (Update info, Avatar upload)
- [ ] Security Settings (Password change, Session management)
- [ ] Organization Management (Settings, Member management)
- [ ] Invitation System (Send, Accept, Decline)
- [ ] Protected Routes (Authorization working)
- [ ] Accessibility (Keyboard, Screen reader, Visual)
- [ ] Responsive Design (Mobile, Tablet, Desktop)
- [ ] Error Handling (Network, Validation, API errors)

## 🚀 Production Checklist

Before deploying to production:

1. [ ] Set production URLs in Supabase
2. [ ] Configure production OAuth apps
3. [ ] Set up email service (SendGrid, etc.)
4. [ ] Enable rate limiting
5. [ ] Configure session timeout
6. [ ] Set up monitoring/logging
7. [ ] Review RLS policies
8. [ ] Test with production data volume
9. [ ] Security audit
10. [ ] Performance testing