# Profile Management System Guide

## Overview

The NextSaaS Profile Management System provides a comprehensive, universal solution for managing user profiles across single-user, organization-based, and multi-tenant SaaS applications. The system automatically adapts to your application's organizational structure while maintaining a consistent API and user experience.

## ✅ Test Infrastructure Complete (July 2025)

**Profile management system is fully tested with:**
- ✅ **57 comprehensive tests** covering all profile functionality
- ✅ **ActivityService**: 36/36 tests passing for audit trails and GDPR compliance
- ✅ **AvatarService**: 4/4 tests passing for cloud storage and image processing
- ✅ **useUserPreferences**: 11/11 tests passing for user preference management
- ✅ **Component testing**: Full test coverage for profile forms and interactions
- ✅ **Integration testing**: End-to-end profile workflows validated

## Features

- **Universal Compatibility**: Works across all SaaS types (personal, single-org, multi-org)
- **Adaptive UI**: Automatically adjusts interface based on organization mode
- **Avatar Management**: Integrated with Backblaze B2 cloud storage
- **Activity Tracking**: Comprehensive audit trails with organization context
- **Data Export**: GDPR-compliant data export functionality
- **Account Deletion**: Secure account deletion with 30-day grace period
- **Organization Context**: Smart context switching for multi-tenant applications
- **Permission-Based Access**: Role-based tab visibility and feature access

## Quick Start

### Basic Usage

For most applications, simply use the `UniversalProfile` component:

```tsx
import { UniversalProfile } from '@nextsaas/auth'

export default function ProfilePage() {
  return <UniversalProfile />
}
```

### Page Layout

For a complete page with header and styling:

```tsx
import { ProfilePageLayout } from '@nextsaas/auth'

export default function ProfilePage() {
  return (
    <ProfilePageLayout
      title="Profile Settings"
      description="Manage your account settings"
    />
  )
}
```

### Embedded Profile

For use within existing layouts:

```tsx
import { EmbeddedProfile } from '@nextsaas/auth'

export default function DashboardProfileSection() {
  return (
    <EmbeddedProfile
      showHeader={true}
      title="Profile Settings"
      defaultTab="profile"
    />
  )
}
```

## Organization Modes

### None (Personal SaaS)

For single-user applications without organizations:

```tsx
import { PersonalProfile } from '@nextsaas/auth'

export default function ProfilePage() {
  return <PersonalProfile />
}
```

**Environment Configuration:**
```env
NEXT_PUBLIC_ORGANIZATION_MODE=none
```

**Features Available:**
- Personal profile management
- Avatar upload
- Activity tracking
- Data export
- Account deletion
- Global profile visibility

### Single Organization

For applications with one organization per user:

```tsx
import { SingleOrgProfile } from '@nextsaas/auth'

export default function ProfilePage() {
  return <SingleOrgProfile />
}
```

**Environment Configuration:**
```env
NEXT_PUBLIC_ORGANIZATION_MODE=single
```

**Features Available:**
- Organization-scoped profiles
- Role-based permissions
- Organization member visibility
- Activity tracking within organization
- Organization-specific settings

### Multi-Organization

For multi-tenant applications:

```tsx
import { MultiOrgProfile } from '@nextsaas/auth'

export default function ProfilePage() {
  return (
    <MultiOrgProfile
      showOrganizationSwitcher={true}
    />
  )
}
```

**Environment Configuration:**
```env
NEXT_PUBLIC_ORGANIZATION_MODE=multi
```

**Features Available:**
- Context-specific profiles per organization
- Organization switching
- Cross-organization activity tracking
- Role-based permissions per organization
- Contextual data export

## Profile Components

### Universal Components

#### UniversalProfile
Automatically adapts to any SaaS type based on environment configuration.

```tsx
<UniversalProfile
  defaultTab="profile"
  showOrganizationSwitcher={true}
  className="custom-styles"
/>
```

#### ProfileModeDetector
Detects organization mode and renders appropriate profile manager.

```tsx
import { ProfileModeDetector, useProfileFeatures } from '@nextsaas/auth'

function MyComponent() {
  const features = useProfileFeatures()
  
  return (
    <div>
      {features.hasOrganizations && <OrganizationSwitcher />}
      <ProfileModeDetector defaultTab="activity" />
    </div>
  )
}
```

### Specific Components

#### BasicProfileManager
For personal/non-organization applications:

```tsx
<BasicProfileManager
  defaultTab="preferences"
  className="space-y-6"
/>
```

#### OrganizationAwareProfileManager
For organization-based applications:

```tsx
<OrganizationAwareProfileManager
  showOrganizationSwitcher={true}
  defaultTab="profile"
/>
```

## Available Tabs

### Profile Tab
- Personal information form
- Contact details
- Profile completion tracking

### Avatar Tab
- Avatar upload and management
- Multiple avatar variants (small, medium, large)
- Backblaze B2 storage integration

### Preferences Tab
- Notification preferences
- Privacy settings
- Display preferences

### Activity Tab
- Account activity tracking
- Security events
- Organization-specific activity (when applicable)

### Data Export Tab
- GDPR-compliant data export
- Multiple export formats (JSON, CSV)
- Activity data export

### Delete Account Tab
- Secure account deletion
- 30-day grace period
- Data cleanup warnings

### Organization Tab (Multi-org only)
- Organization-specific settings
- Member management
- Role-based configurations

## Organization Context

### Context Switching

In multi-organization mode, users can switch between organization contexts:

```tsx
import { OrganizationContextWidget } from '@nextsaas/auth'

function ProfileHeader() {
  return (
    <OrganizationContextWidget
      compact={false}
      showPermissions={true}
      showDescription={true}
    />
  )
}
```

### Context Provider

Wrap components that need organization context:

```tsx
import { OrganizationContextProvider } from '@nextsaas/auth'

function App() {
  return (
    <OrganizationContextProvider
      options={{
        includeActivity: true,
        includePreferences: true,
        activityLimit: 100
      }}
    >
      <YourComponents />
    </OrganizationContextProvider>
  )
}
```

### Using Context Data

```tsx
import { useOrganizationProfileContext } from '@nextsaas/auth'

function ProfileComponent() {
  const {
    currentOrganization,
    membership,
    profile,
    canViewTab,
    isVisible,
    updateProfile
  } = useOrganizationProfileContext()

  return (
    <div>
      {canViewTab('activity') && <ActivityTab />}
      {isVisible('email') && <EmailField />}
    </div>
  )
}
```

## Permission System

### Role-Based Access

The system supports role-based access control:

- **Owner**: Full access to all features
- **Admin**: Management features, limited organization settings
- **Member**: Standard profile features
- **Viewer**: Read-only access where applicable

### Tab Visibility

Tabs are automatically shown/hidden based on:
- Organization mode
- User role
- Permission settings
- Context restrictions

```tsx
// Example: Custom tab visibility
const canViewTab = (tabId: string): boolean => {
  switch (tabId) {
    case 'organization':
      return membership?.role === 'owner' || membership?.role === 'admin'
    case 'export':
      return membership?.permissions?.includes('data:export')
    default:
      return true
  }
}
```

## Avatar Management

### Backblaze Integration

Avatars are stored in Backblaze B2 cloud storage:

```env
NEXT_PUBLIC_BACKBLAZE_BUCKET_NAME=your-bucket-name
NEXT_PUBLIC_BACKBLAZE_ENDPOINT=https://s3.us-west-000.backblazeb2.com
BACKBLAZE_ACCESS_KEY_ID=your-access-key
BACKBLAZE_SECRET_ACCESS_KEY=your-secret-key
```

### Usage

```tsx
import { AvatarUpload } from '@nextsaas/auth'

function ProfileAvatar() {
  return (
    <AvatarUpload
      userId={user.id}
      currentAvatarUrl={profile?.avatar_url}
      onAvatarUpdate={(url) => {
        // Handle avatar update
        updateProfile({ avatar_url: url })
      }}
    />
  )
}
```

### Avatar Service

Direct service usage:

```tsx
import { avatarService } from '@nextsaas/auth'

// Upload avatar
const result = await avatarService.uploadAvatar(file, userId, {
  maxSize: 5 * 1024 * 1024,
  quality: 0.9,
  outputSize: 256
})

// Activate avatar
await avatarService.activateAvatar(avatarId, userId)

// Delete avatar
await avatarService.deleteAvatar(avatarId, userId)
```

## Activity Tracking

### Automatic Tracking

The system automatically tracks:
- Profile updates
- Avatar changes
- Preference modifications
- Authentication events
- Organization context switches

### Manual Tracking

```tsx
import { createActivityService } from '@nextsaas/auth'

const activityService = createActivityService(supabase)

// Track custom activity
await activityService.trackProfileActivity(
  {
    userId: user.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  },
  {
    action: 'custom_action',
    details: { custom_data: 'value' },
    metadata: { source: 'manual' }
  }
)
```

## Data Export

### Supported Formats

- **JSON**: Complete data export with metadata
- **CSV**: Tabular data for spreadsheet applications
- **Activity Logs**: Detailed activity tracking data

### Usage

```tsx
import { DataExportManager } from '@nextsaas/auth'

function ExportSection() {
  return (
    <DataExportManager
      userId={user.id}
      context="organization" // or "personal"
    />
  )
}
```

### Custom Export

```tsx
import { createDataExportService } from '@nextsaas/auth'

const exportService = createDataExportService(supabase)

// Export user data
const exportData = await exportService.exportUserData(userId, {
  format: 'json',
  includeActivity: true,
  includePreferences: true,
  organizationId: currentOrg?.id
})
```

## Account Deletion

### Deletion Process

1. User initiates deletion request
2. 30-day grace period begins
3. Account marked as "pending deletion"
4. After grace period, permanent deletion occurs
5. All associated data is cleaned up

### Usage

```tsx
import { AccountDeletionManager } from '@nextsaas/auth'

function DeletionSection() {
  return (
    <AccountDeletionManager
      userId={user.id}
      context="organization" // or "personal"
    />
  )
}
```

### Custom Deletion

```tsx
import { createAccountDeletionService } from '@nextsaas/auth'

const deletionService = createAccountDeletionService(supabase)

// Schedule deletion
await deletionService.scheduleAccountDeletion(userId, {
  reason: 'user_request',
  gracePeriodDays: 30
})

// Cancel scheduled deletion
await deletionService.cancelAccountDeletion(userId)
```

## API Endpoints

### Profile Management

- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update profile
- `DELETE /api/profile` - Delete profile

### Avatar Management

- `POST /api/profile/avatar` - Upload avatar
- `PATCH /api/profile/avatar` - Activate/deactivate avatar
- `DELETE /api/profile/avatar?id={avatarId}` - Delete avatar

### Activity Tracking

- `GET /api/profile/activity` - Get user activity
- `POST /api/profile/activity` - Log custom activity

### Data Export

- `POST /api/profile/export` - Request data export
- `GET /api/profile/export/{exportId}` - Download export

### Storage (Backblaze)

- `POST /api/storage/upload` - Upload file to Backblaze
- `DELETE /api/storage/delete` - Delete file from Backblaze

## Database Schema

### Tables

#### profiles
Core user profile information:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  -- ... other profile fields
);
```

#### user_preferences
User preference settings:
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  -- ... preference fields
);
```

#### user_avatars
Avatar management:
```sql
CREATE TABLE user_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  storage_path TEXT NOT NULL,
  storage_bucket TEXT NOT NULL,
  public_url TEXT,
  is_active BOOLEAN DEFAULT false,
  -- ... other avatar fields
);
```

#### user_activity
Activity tracking:
```sql
CREATE TABLE user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  activity_type TEXT NOT NULL,
  action TEXT NOT NULL,
  -- ... other activity fields
);
```

## Customization

### Custom Styling

```tsx
<UniversalProfile
  className="custom-profile-styles"
  // Custom CSS classes will be applied
/>
```

### Custom Tabs

```tsx
// Add custom logic to show/hide tabs
const customCanViewTab = (tabId: string): boolean => {
  // Your custom logic here
  return defaultCanViewTab(tabId) && customPermissionCheck(tabId)
}
```

### Custom Components

Replace default components with your own:

```tsx
import { BasicProfileManager } from '@nextsaas/auth'

function CustomProfileManager() {
  return (
    <BasicProfileManager
      // Override specific parts as needed
      profileForm={<CustomProfileForm />}
    />
  )
}
```

## Best Practices

### Performance
- Use pagination for activity lists
- Implement lazy loading for avatar variants
- Cache profile data appropriately

### Security
- Validate all profile updates server-side
- Implement rate limiting on avatar uploads
- Use RLS policies for data access

### User Experience
- Provide clear feedback for all actions
- Show loading states during operations
- Implement optimistic updates where appropriate

### Organization Context
- Always check permissions before showing features
- Provide clear context indicators
- Handle organization switching gracefully

## Troubleshooting

### Common Issues

1. **Avatar uploads failing**
   - Check Backblaze configuration
   - Verify API routes are properly configured
   - Check file size and type restrictions

2. **Organization context not working**
   - Ensure `NEXT_PUBLIC_ORGANIZATION_MODE` is set
   - Verify OrganizationProvider is in component tree
   - Check user membership data

3. **Profile data not loading**
   - Verify database tables exist
   - Check RLS policies
   - Ensure user is authenticated

4. **Activity tracking not working**
   - Check activity service configuration
   - Verify database permissions
   - Ensure proper error handling

### Debug Mode

Enable debug logging:

```tsx
// Set in your environment
NEXT_PUBLIC_DEBUG_PROFILE_MANAGEMENT=true
```

This will enable detailed logging for all profile management operations.

## Migration Guide

### From Custom Profile System

1. Install the profile management components
2. Update your database schema
3. Migrate existing profile data
4. Replace existing profile components
5. Test organization context functionality

### Database Migration

Run the included migration:

```sql
-- Run packages/auth/migrations/019_profile_management_tables.sql
```

### Component Migration

Replace existing components:

```tsx
// Before
import { CustomProfileForm } from './custom'

// After
import { UniversalProfile } from '@nextsaas/auth'
```

## Support

For issues and questions:
- Check the troubleshooting section
- Review the API documentation
- Submit issues to the project repository
- Consult the testing documentation for examples