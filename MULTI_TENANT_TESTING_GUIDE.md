# 🏢 Multi-Tenant Testing Guide

## Overview

The multi-tenant mode (`NEXT_PUBLIC_ORGANIZATION_MODE=multi`) enables users to create and join multiple organizations, similar to how Slack, Notion, or Linear work.

## Setup

1. **Ensure environment is set to multi mode**:
   ```env
   NEXT_PUBLIC_ORGANIZATION_MODE=multi
   ```
   ✅ Already set in your `.env.local`

2. **Database is already configured**:
   - The same database schema supports all modes
   - No additional SQL needed!

## Testing the Multi-Tenant Flow

### 1. Sign Up and Organization Creation

1. Start the app: `npm run dev`
2. Navigate to `http://localhost:3010/auth/sign-up`
3. Create a new account
4. **In multi mode**: You'll be prompted to create your first organization
   - Enter organization name
   - The system will create a unique slug
   - You'll be the owner of this organization

### 2. Organization Switching

1. After signing in, check the header for the **Organization Switcher**
2. Click on it to see:
   - Current organization
   - List of all your organizations
   - "Create New Organization" option

### 3. Creating Additional Organizations

1. Click "Create New Organization" in the switcher
2. Fill in:
   - Organization name
   - Optional: description, website
3. You can now switch between multiple organizations

### 4. Inviting Team Members

1. Go to `/settings/organization/members`
2. Click "Invite Members"
3. Enter email addresses and assign roles:
   - **Admin**: Can manage organization settings and members
   - **Member**: Regular access to organization resources
4. Send invitations

### 5. Accepting Invitations

To test the invitation flow:

1. **Option A - Same Browser (Quick Test)**:
   - Sign out
   - Check the invitation email or use the invitation link
   - Sign up/sign in with the invited email
   - Accept the invitation

2. **Option B - Different Browser/Incognito**:
   - Open invitation link in incognito/different browser
   - Sign up with invited email
   - You'll automatically join the organization

### 6. Managing Multiple Organizations

As a user with multiple organizations:

1. **Context Switching**:
   - Use the Organization Switcher to change context
   - All data is scoped to the selected organization

2. **Different Roles**:
   - You might be an owner in one org, member in another
   - UI adapts based on your role

3. **Organization Settings**:
   - Each org has independent settings
   - Billing is per-organization
   - Custom domains (if enabled)

## Key Features in Multi Mode

### ✅ Enabled Features
- Organization creation
- Multiple organizations per user
- Organization invitations
- Role-based access (Owner, Admin, Member)
- Organization-level billing
- Member management
- Organization events tracking

### 🔒 Security Features
- Row Level Security ensures data isolation
- Users only see organizations they belong to
- Invitation tokens are secure and expire
- Organization switching updates user context

## Testing Checklist

- [ ] Create first organization during signup
- [ ] Create additional organizations
- [ ] Switch between organizations
- [ ] Invite users with different roles
- [ ] Accept invitation as new user
- [ ] Accept invitation as existing user
- [ ] Remove members (as admin/owner)
- [ ] Update organization settings
- [ ] Check data isolation between orgs

## API Usage Examples

```typescript
// Get current organization
const { organization } = useOrganization();

// List user's organizations
const { organizations } = useOrganizations();

// Switch organization
await switchOrganization(orgId);

// Invite members
await inviteMembers({
  emails: ['user@example.com'],
  role: 'member',
  message: 'Welcome to our team!'
});
```

## Common Scenarios

### B2B SaaS
- Companies sign up and invite their team
- Each company is an organization
- Billing per organization
- Role-based permissions

### Freelancer Platform
- Freelancers join multiple client organizations
- Switch context based on current client
- Separate data per client

### Educational Platform
- Students join multiple course organizations
- Teachers manage their class organizations
- Content scoped per organization

## Troubleshooting

### "Cannot create organization"
- Check if user is authenticated
- Verify database permissions

### "Cannot see other organizations"
- Ensure you're a member of those organizations
- Check Organization Switcher component

### "Invitation not working"
- Check if invitation hasn't expired (7 days)
- Verify email is correct
- Check spam folder

## Next Steps

1. Customize organization features in `/settings/organization`
2. Add organization-specific branding
3. Implement custom roles beyond admin/member
4. Add organization-level feature flags