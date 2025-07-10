# User Profile Management System

## Overview

The NextSaaS User Profile Management system provides a comprehensive solution for managing user profiles, organization memberships, and account settings. It includes features for personal information management, avatar uploads, activity tracking, and privacy controls.

## Features

### 🧑‍💼 Personal Profile Management
- **Basic Information**: First name, last name, email, bio, phone, website
- **Regional Settings**: Timezone and language preferences
- **Avatar Management**: Upload, crop, and manage profile pictures with Backblaze B2 storage
- **Mobile Optimization**: Touch-friendly interfaces with responsive design

### 🏢 Organization Profiles
- **Multi-Tenant Support**: Separate profiles for each organization
- **Professional Information**: Job title, department, start date, work status
- **Skills Management**: Add and manage professional skills
- **Privacy Controls**: Control profile visibility (public, organization, private)
- **Team Directory**: Searchable organization member directory

### 📊 Activity Dashboard
- **Login History**: Track recent login sessions and devices
- **Security Events**: Monitor account changes and security activities
- **Account Changes**: Audit trail of profile modifications
- **Session Management**: View and manage active sessions

### 🔒 Privacy & Security
- **GDPR Compliance**: Complete data export and deletion workflows
- **Account Deletion**: Secure account deletion with grace periods
- **Audit Logging**: Comprehensive activity tracking
- **Rate Limiting**: Protection against abuse and brute force attacks

### ♿ Accessibility
- **WCAG 2.1 AA Compliance**: Full accessibility support
- **Screen Reader Support**: Proper ARIA labels and live regions
- **Keyboard Navigation**: Complete keyboard accessibility
- **Touch Optimization**: Mobile-friendly touch targets

## Architecture

### Database Schema

The profile system uses several database tables:

```sql
-- Enhanced user profiles with preferences
users (enhanced with metadata fields)
- user_metadata: JSON with profile information
- preferences: JSON with user preferences

-- User activity tracking
user_activities
- user_id, action, details, ip_address, user_agent, created_at

-- User sessions for device management
user_sessions
- user_id, session_token, device_info, last_active

-- Account deletion requests
account_deletions
- user_id, requested_at, reason, grace_period_ends

-- Organization-specific profiles
organization_profiles
- user_id, organization_id, display_name, title, department
- bio, skills, visibility, start_date, status
```

### Component Structure

```
packages/auth/src/
├── components/
│   ├── forms/
│   │   ├── ProfileForm.tsx           # Main profile form
│   │   └── MobileProfileForm.tsx     # Mobile-optimized form
│   ├── profile/
│   │   ├── AvatarUpload.tsx          # Avatar management
│   │   ├── OrganizationProfileForm.tsx
│   │   └── PreferencesManager.tsx
│   ├── activity/
│   │   └── ActivityDashboard.tsx     # Activity tracking
│   ├── data-export/
│   │   └── DataExportManager.tsx     # GDPR export
│   ├── account-deletion/
│   │   └── AccountDeletionManager.tsx
│   └── ui/
│       ├── TouchOptimizedAvatar.tsx  # Mobile avatar
│       ├── MobileBottomSheet.tsx     # Mobile UI
│       └── LoadingSkeleton.tsx       # Loading states
├── hooks/
│   ├── useMobileDetection.ts         # Device detection
│   ├── useAnnouncements.ts           # Accessibility
│   └── useFocusManagement.ts         # Focus control
└── utils/
    ├── accessibility.ts              # A11y utilities
    └── cache.ts                     # Performance caching
```

## API Endpoints

### Profile Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/avatar` - Upload avatar
- `DELETE /api/profile/avatar` - Remove avatar

### Organization Profiles
- `GET /api/profile/organization/:id` - Get organization profile
- `POST /api/profile/organization/:id` - Create organization profile
- `PUT /api/profile/organization/:id` - Update organization profile

### Activity & Security
- `GET /api/profile/activity` - Get activity history
- `GET /api/profile/sessions` - Get active sessions
- `DELETE /api/profile/sessions/:id` - Revoke session

### Data Management
- `POST /api/profile/export` - Request data export
- `POST /api/profile/delete` - Request account deletion
- `DELETE /api/profile/delete/:token` - Confirm deletion

## Configuration

### Environment Variables

```env
# Backblaze B2 Storage (for avatars)
B2_APPLICATION_KEY_ID=your_key_id
B2_APPLICATION_KEY=your_application_key
B2_BUCKET_NAME=your_bucket_name
B2_BUCKET_ID=your_bucket_id
B2_ENDPOINT=your_endpoint

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_WINDOW_MS=60000

# Account Deletion
ACCOUNT_DELETION_GRACE_PERIOD_DAYS=30
```

### Feature Flags

```typescript
// In your configuration
export const profileFeatures = {
  avatarUpload: true,
  organizationProfiles: true,
  activityTracking: true,
  dataExport: true,
  accountDeletion: true,
  mobileOptimization: true
}
```

## Usage Examples

### Basic Profile Form

```tsx
import { ProfileForm } from '@nextsaas/auth'

export function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <ProfileForm 
        onSuccess={() => console.log('Profile updated!')}
        className="space-y-6"
      />
    </div>
  )
}
```

### Mobile Profile Management

```tsx
import { MobileProfileForm } from '@nextsaas/auth'
import { useMobileDetection } from '@nextsaas/auth'

export function MobileSettings() {
  const { isMobileOrTablet } = useMobileDetection()
  
  if (!isMobileOrTablet) {
    return <ProfileForm />
  }
  
  return <MobileProfileForm />
}
```

### Organization Profile

```tsx
import { OrganizationProfileForm } from '@nextsaas/auth'

export function OrgProfile() {
  return (
    <OrganizationProfileForm 
      className="max-w-4xl mx-auto"
    />
  )
}
```

### Activity Dashboard

```tsx
import { ActivityDashboard } from '@nextsaas/auth'

export function SecurityPage() {
  return (
    <div className="space-y-6">
      <h1>Account Activity</h1>
      <ActivityDashboard />
    </div>
  )
}
```

## Testing

### Unit Tests
```bash
# Run profile component tests
npm test -- --testPathPattern=profile

# Run accessibility tests
npm test -- --testPathPattern=accessibility

# Run mobile optimization tests
npm test -- --testPathPattern=mobile
```

### E2E Tests
```bash
# Run complete profile journey tests
npm run test:e2e -- --spec="**/profile-management.spec.ts"

# Run mobile-specific tests
npm run test:e2e -- --spec="**/mobile-profile.spec.ts"
```

## Security Considerations

### Data Protection
- All profile data is encrypted in transit and at rest
- Sensitive operations require re-authentication
- Activity logging tracks all profile changes
- Rate limiting prevents abuse

### Privacy Controls
- Users can control profile visibility
- Data export includes all user data
- Account deletion removes all associated data
- Audit trails maintain compliance records

### Mobile Security
- Touch interactions are secured against accidental actions
- Biometric authentication support (where available)
- Secure avatar upload with file validation
- Session management for mobile devices

## Performance Optimizations

### Caching Strategy
- Profile data cached with TTL
- Avatar images cached with CDN
- Lazy loading for activity history
- Optimistic updates for better UX

### Mobile Performance
- Touch-optimized components
- Gesture recognition for interactions
- Optimized images for mobile
- Progressive loading for slow connections

## Accessibility Features

### Screen Reader Support
- Proper semantic HTML structure
- ARIA labels and descriptions
- Live regions for dynamic content
- Focus management for interactions

### Keyboard Navigation
- Tab order optimization
- Keyboard shortcuts for common actions
- Focus trap for modals
- Skip links for navigation

### Mobile Accessibility
- Adequate touch targets (44px minimum)
- High contrast support
- Motion preferences respect
- Voice input compatibility

## Migration Guide

### From Basic Profile System
1. Run database migrations to add new tables
2. Update environment variables for B2 storage
3. Replace profile components with new versions
4. Test accessibility and mobile features
5. Deploy with feature flags for gradual rollout

### Breaking Changes
- Profile API endpoints have new response formats
- Avatar URLs now use B2 storage format
- Activity tracking requires new permissions
- Mobile components have different props

## Troubleshooting

### Common Issues

**Avatar uploads failing**
- Check B2 credentials and bucket permissions
- Verify file size limits (5MB default)
- Ensure proper CORS configuration

**Mobile interface not loading**
- Check device detection logic
- Verify responsive breakpoints
- Test touch event handlers

**Accessibility violations**
- Run automated accessibility tests
- Check ARIA attributes
- Verify keyboard navigation

### Debug Mode
Enable debug logging in development:

```env
DEBUG_PROFILE_SYSTEM=true
DEBUG_MOBILE_DETECTION=true
DEBUG_ACCESSIBILITY=true
```

## Roadmap

### Planned Features
- [ ] Social media profile linking
- [ ] Profile templates for different industries
- [ ] Advanced privacy controls
- [ ] Profile analytics dashboard
- [ ] Bulk profile management for admins
- [ ] Integration with external identity providers

### Known Limitations
- Avatar uploads limited to 5MB
- Activity history retained for 1 year
- Mobile optimization focused on iOS/Android
- Organization profiles require admin approval

## Support

For issues and questions:
- Check the troubleshooting section above
- Review test cases for usage examples
- File issues in the project repository
- Contact support team for enterprise features