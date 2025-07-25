# Profile Management API Reference

## Overview

This document provides comprehensive API reference for the NextSaaS Profile Management System. All endpoints support organization context and role-based access control.

## ✅ Fully Tested API (July 2025)

**All profile management APIs are thoroughly tested:**
- ✅ **Integration tests**: Complete API workflow validation
- ✅ **Error handling**: Comprehensive error scenario testing
- ✅ **Security testing**: Authentication and authorization validation
- ✅ **Data integrity**: Profile data consistency and GDPR compliance verification

## Authentication

All API endpoints require authentication. Include the Authorization header:

```
Authorization: Bearer <access_token>
```

## Base URLs

```
Development: http://localhost:3000/api
Production: https://your-app.com/api
```

## Profile Endpoints

### Get User Profile

Retrieve the current user's profile information.

**Endpoint:** `GET /api/profile`

**Parameters:**
- `organization_id` (optional): Filter profile by organization context

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "avatar_url": "https://storage.example.com/avatar.jpg",
    "bio": "Software engineer",
    "location": "San Francisco, CA",
    "timezone": "America/Los_Angeles",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z",
    "profile_completeness": 85
  },
  "organization_context": {
    "organization_id": "uuid",
    "role": "member",
    "permissions": ["profile:read", "profile:update"]
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Profile not found
- `500`: Internal server error

---

### Update User Profile

Update the current user's profile information.

**Endpoint:** `PATCH /api/profile`

**Request Body:**
```json
{
  "full_name": "John Smith",
  "bio": "Senior Software Engineer",
  "location": "New York, NY",
  "timezone": "America/New_York"
}
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Smith",
    "bio": "Senior Software Engineer",
    "location": "New York, NY",
    "timezone": "America/New_York",
    "updated_at": "2024-01-15T12:30:00Z",
    "profile_completeness": 90
  }
}
```

**Validation:**
- `full_name`: 2-100 characters
- `bio`: 0-500 characters
- `location`: 0-100 characters
- `timezone`: Valid timezone identifier

---

### Delete User Profile

Delete the current user's profile and schedule account deletion.

**Endpoint:** `DELETE /api/profile`

**Request Body:**
```json
{
  "confirmation": "DELETE",
  "reason": "No longer needed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account deletion scheduled",
  "deletion_date": "2024-02-15T00:00:00Z",
  "grace_period_days": 30
}
```

## Avatar Endpoints

### Upload Avatar

Upload a new profile avatar.

**Endpoint:** `POST /api/profile/avatar`

**Request:** Multipart form data
- `file`: Image file (JPEG, PNG, WebP, max 5MB)

**Response:**
```json
{
  "success": true,
  "avatar": {
    "id": "uuid",
    "public_url": "https://storage.example.com/avatars/user-id/avatar-timestamp.webp",
    "original_filename": "profile.jpg",
    "variants": {
      "small": "https://storage.example.com/avatars/user-id/avatar-timestamp_small.webp",
      "medium": "https://storage.example.com/avatars/user-id/avatar-timestamp_medium.webp",
      "large": "https://storage.example.com/avatars/user-id/avatar-timestamp_large.webp"
    },
    "file_size": 204800,
    "width": 256,
    "height": 256,
    "is_active": false
  }
}
```

**Error Responses:**
- `400`: Invalid file type or size
- `413`: File too large
- `500`: Upload failed

---

### Activate Avatar

Set an avatar as the current active avatar.

**Endpoint:** `PATCH /api/profile/avatar`

**Request Body:**
```json
{
  "avatarId": "uuid",
  "action": "activate"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Avatar activated successfully"
}
```

---

### Delete Avatar

Delete a specific avatar.

**Endpoint:** `DELETE /api/profile/avatar?id={avatarId}`

**Response:**
```json
{
  "success": true,
  "message": "Avatar deleted successfully"
}
```

---

### List User Avatars

Get all avatars for the current user.

**Endpoint:** `GET /api/profile/avatars`

**Response:**
```json
{
  "success": true,
  "avatars": [
    {
      "id": "uuid",
      "public_url": "https://storage.example.com/avatar1.webp",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid",
      "public_url": "https://storage.example.com/avatar2.webp",
      "is_active": false,
      "created_at": "2024-01-05T00:00:00Z"
    }
  ]
}
```

## Activity Endpoints

### Get User Activity

Retrieve user activity logs.

**Endpoint:** `GET /api/profile/activity`

**Parameters:**
- `limit` (optional): Number of records (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `type` (optional): Filter by activity type
- `organization_id` (optional): Filter by organization

**Response:**
```json
{
  "success": true,
  "activity": [
    {
      "id": "uuid",
      "activity_type": "profile",
      "action": "profile_update",
      "description": "Updated profile information",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "organization_id": "uuid",
      "created_at": "2024-01-15T12:00:00Z",
      "details": {
        "fields_updated": ["full_name", "bio"]
      }
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

---

### Log Custom Activity

Log a custom activity event.

**Endpoint:** `POST /api/profile/activity`

**Request Body:**
```json
{
  "activity_type": "custom",
  "action": "feature_used",
  "description": "User used custom feature",
  "details": {
    "feature_name": "advanced_search",
    "parameters": {"query": "test"}
  }
}
```

**Response:**
```json
{
  "success": true,
  "activity_id": "uuid"
}
```

## Preferences Endpoints

### Get User Preferences

Retrieve user preferences.

**Endpoint:** `GET /api/profile/preferences`

**Response:**
```json
{
  "success": true,
  "preferences": {
    "id": "uuid",
    "user_id": "uuid",
    "notifications": {
      "email_enabled": true,
      "push_enabled": false,
      "digest_frequency": "weekly"
    },
    "privacy": {
      "profile_visibility": "public",
      "email_visibility": "private",
      "activity_visibility": "organization"
    },
    "display": {
      "theme": "light",
      "language": "en",
      "timezone": "America/Los_Angeles"
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z"
  }
}
```

---

### Update User Preferences

Update user preferences.

**Endpoint:** `PATCH /api/profile/preferences`

**Request Body:**
```json
{
  "notifications": {
    "email_enabled": false,
    "digest_frequency": "daily"
  },
  "privacy": {
    "profile_visibility": "organization"
  },
  "display": {
    "theme": "dark"
  }
}
```

**Response:**
```json
{
  "success": true,
  "preferences": {
    // Updated preferences object
  }
}
```

## Data Export Endpoints

### Request Data Export

Request a data export for the current user.

**Endpoint:** `POST /api/profile/export`

**Request Body:**
```json
{
  "format": "json",
  "include_activity": true,
  "include_preferences": true,
  "organization_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "export_id": "uuid",
  "status": "processing",
  "estimated_completion": "2024-01-15T13:00:00Z"
}
```

---

### Get Export Status

Check the status of a data export.

**Endpoint:** `GET /api/profile/export/{exportId}`

**Response:**
```json
{
  "success": true,
  "export": {
    "id": "uuid",
    "status": "completed",
    "format": "json",
    "file_size": 1024000,
    "download_url": "https://storage.example.com/exports/export-uuid.json",
    "expires_at": "2024-01-22T12:00:00Z",
    "created_at": "2024-01-15T12:00:00Z",
    "completed_at": "2024-01-15T12:30:00Z"
  }
}
```

**Status Values:**
- `processing`: Export is being generated
- `completed`: Export is ready for download
- `failed`: Export failed
- `expired`: Export has expired

---

### Download Export

Download a completed data export.

**Endpoint:** `GET /api/profile/export/{exportId}/download`

**Response:** File download (JSON, CSV, or ZIP)

## Organization Context Endpoints

### Get Organization Profile Context

Get profile information within an organization context.

**Endpoint:** `GET /api/profile/organization/{organizationId}`

**Response:**
```json
{
  "success": true,
  "context": {
    "organization": {
      "id": "uuid",
      "name": "Acme Corp",
      "slug": "acme-corp"
    },
    "membership": {
      "id": "uuid",
      "role": "admin",
      "permissions": [
        "profile:read",
        "profile:update",
        "members:read"
      ],
      "joined_at": "2024-01-01T00:00:00Z"
    },
    "profile_visibility": {
      "profile": "organization",
      "email": "private",
      "activity": "admin"
    }
  }
}
```

---

### Switch Organization Context

Switch the current organization context.

**Endpoint:** `POST /api/profile/organization/switch`

**Request Body:**
```json
{
  "organization_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "context": {
    "organization_id": "uuid",
    "role": "member",
    "permissions": ["profile:read", "profile:update"]
  }
}
```

## Storage Endpoints

### Upload File

Upload a file to Backblaze B2 storage.

**Endpoint:** `POST /api/storage/upload`

**Request:** Multipart form data
- `file`: File to upload
- `path`: Storage path

**Response:**
```json
{
  "success": true,
  "url": "https://storage.example.com/bucket/path/file.ext",
  "path": "user-id/file-name.ext"
}
```

---

### Delete File

Delete a file from storage.

**Endpoint:** `DELETE /api/storage/delete`

**Request Body:**
```json
{
  "path": "user-id/file-name.ext"
}
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation message"
  }
}
```

### Common Error Codes

- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

API endpoints are rate limited:

- Profile operations: 100 requests per minute
- Avatar uploads: 10 requests per minute
- Data exports: 5 requests per hour

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641024000
```

## Webhooks

Configure webhooks to receive notifications about profile events:

### Available Events

- `profile.updated`: Profile information changed
- `avatar.uploaded`: New avatar uploaded
- `avatar.activated`: Avatar set as active
- `preferences.updated`: User preferences changed
- `export.completed`: Data export ready
- `account.deletion_scheduled`: Account deletion scheduled

### Webhook Payload

```json
{
  "event": "profile.updated",
  "data": {
    "user_id": "uuid",
    "organization_id": "uuid",
    "changes": ["full_name", "bio"],
    "timestamp": "2024-01-15T12:00:00Z"
  }
}
```

## SDK Usage

### JavaScript/TypeScript

```typescript
import { ProfileAPI } from '@nextsaas/auth'

const profileAPI = new ProfileAPI({
  baseURL: 'https://your-app.com/api',
  token: 'your-access-token'
})

// Get profile
const profile = await profileAPI.getProfile()

// Update profile
const updatedProfile = await profileAPI.updateProfile({
  full_name: 'New Name'
})

// Upload avatar
const avatar = await profileAPI.uploadAvatar(file)
```

### React Hooks

```typescript
import { useProfile, useAvatar } from '@nextsaas/auth'

function ProfileComponent() {
  const { profile, updateProfile, loading } = useProfile()
  const { uploadAvatar, avatars } = useAvatar()

  const handleUpdate = async (data) => {
    await updateProfile(data)
  }

  return (
    <div>
      {loading ? 'Loading...' : profile.full_name}
    </div>
  )
}
```

## Testing

### Test Data

Use the following test data for development:

```json
{
  "test_user": {
    "id": "00000000-0000-0000-0000-000000000001",
    "email": "test@example.com",
    "full_name": "Test User"
  },
  "test_organization": {
    "id": "00000000-0000-0000-0000-000000000002",
    "name": "Test Organization"
  }
}
```

### Mock Responses

For testing, use the mock server:

```bash
npm run test:mock-server
```

Mock endpoints will be available at `http://localhost:3001/api`

## Changelog

### v1.0.0
- Initial release
- Basic profile management
- Avatar upload functionality
- Activity tracking
- Data export

### v1.1.0
- Organization context support
- Multi-tenant capabilities
- Enhanced permissions system
- Improved error handling

### v1.2.0
- Backblaze B2 storage integration
- Advanced activity tracking
- Profile completeness tracking
- Account deletion with grace period