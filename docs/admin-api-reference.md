# Admin API Reference

This document provides comprehensive documentation for all admin-specific API endpoints in the NextSaaS application.

## Authentication

All admin API endpoints require:
1. **Valid session**: User must be authenticated
2. **System admin privileges**: User must have `is_system_admin` flag set to `true`

### Security Headers
- `Authorization`: Bearer token (handled automatically by Supabase client)
- `User-Agent`: Required for audit logging

### Error Responses

All endpoints return standardized error responses:

```json
{
  "error": "Error message",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Common HTTP Status Codes:**
- `401 Unauthorized`: Invalid or missing session
- `403 Forbidden`: User lacks system admin privileges
- `500 Internal Server Error`: Server-side error occurred

---

## Dashboard API

### GET `/api/admin/dashboard`

Retrieves comprehensive dashboard metrics for the admin interface.

#### Request
- **Method**: GET
- **Authentication**: Required (System Admin)
- **Parameters**: None

#### Response

```json
{
  "data": {
    // User Metrics
    "totalUsers": 15420,
    "activeUsers": 8932,
    "newUsersToday": 127,
    "userGrowthRate": 5.2,
    "userRetentionRate": 85.3,
    
    // Organization Metrics
    "totalOrganizations": 2845,
    "activeOrganizations": 2845,
    "newOrganizationsToday": 23,
    "organizationGrowthRate": 3.8,
    
    // Revenue Metrics (Mock Data)
    "monthlyRecurringRevenue": 125000,
    "totalRevenue": 1500000,
    "averageRevenuePerUser": 89.50,
    "revenueGrowthRate": 12.5,
    "churnRate": 2.1,
    
    // System Metrics (Mock Data)
    "systemUptime": 99.95,
    "apiResponseTime": 145,
    "errorRate": 0.02,
    "activeConnections": 1247,
    
    // Email Metrics (Mock Data)
    "emailsSentToday": 15420,
    "emailDeliveryRate": 99.2,
    "campaignsActive": 8,
    "subscriberCount": 125000,
    
    // Recent Activity
    "recentActivity": [
      {
        "id": "uuid",
        "description": "User signup",
        "timestamp": "2024-01-15T10:25:00Z",
        "type": "users",
        "userId": "user-uuid",
        "metadata": {...}
      }
    ]
  },
  "success": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Data Sources

**Real-time metrics:**
- `totalUsers`: Count from `users` table (non-deleted)
- `activeUsers`: Users with `last_seen_at` within 7 days
- `newUsersToday`: Users created today
- `totalOrganizations`: Count from `organizations` table (non-deleted)
- `newOrganizationsToday`: Organizations created today
- `recentActivity`: Latest 10 entries from `audit_logs` table

**Mock metrics** (integrate with external services):
- Revenue metrics (billing system integration needed)
- System metrics (monitoring system integration needed)
- Email metrics (email service integration needed)

#### Audit Logging
This endpoint logs admin access with the following details:
- Action: `dashboard_viewed`
- Target: `dashboard`
- IP address and User-Agent for security tracking

---

## User Management API

### GET `/api/admin/users`

Retrieves paginated list of users with filtering and search capabilities.

#### Request
- **Method**: GET
- **Authentication**: Required (System Admin)

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number for pagination |
| `limit` | integer | 20 | Number of users per page |
| `search` | string | "" | Search term for name/email |
| `status` | string | "" | Filter by user status |
| `sort` | string | "created_at" | Sort field |
| `order` | string | "desc" | Sort order (asc/desc) |

#### Response

```json
{
  "data": [
    {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "status": "active", // "active" | "pending"
      "is_system_admin": false,
      "organizations": [
        {
          "id": "org-uuid",
          "name": "Acme Corp",
          "role": "owner",
          "joined_at": "2024-01-01T10:00:00Z"
        }
      ],
      "last_seen_at": "2024-01-15T09:45:00Z",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-15T08:30:00Z",
      "email_verified_at": "2024-01-01T10:05:00Z",
      "login_count": 0,
      "last_ip": null
    }
  ],
  "success": true,
  "metadata": {
    "total": 15420,
    "page": 1,
    "limit": 20,
    "totalPages": 771
  }
}
```

#### Search Functionality
- Searches across `name` and `email` fields
- Case-insensitive partial matching using PostgreSQL `ilike`

#### Status Derivation
- `active`: User has verified email (`email_verified_at` is not null)
- `pending`: User has not verified email

### POST `/api/admin/users`

Creates a new user via admin interface.

#### Request
- **Method**: POST
- **Authentication**: Required (System Admin)
- **Content-Type**: application/json

#### Request Body

```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "send_invitation": true
}
```

#### Response

```json
{
  "error": "User invitation system not implemented - use proper invitation flow",
  "status": 501
}
```

**Note**: This endpoint is currently not implemented. User creation should go through the proper invitation system to maintain security and compliance.

---

## Security Considerations

### Rate Limiting
- **Recommendation**: Implement rate limiting for admin endpoints
- **Suggested limits**: 100 requests per minute per admin user

### IP Whitelisting
- Consider implementing IP whitelisting for admin access
- Log all admin actions with IP addresses for security auditing

### Audit Trail
All admin actions are logged via the `log_system_admin_action` RPC function with:
- Admin user ID
- Action performed
- Target resource
- Timestamp
- IP address
- User agent
- Additional metadata

### Data Privacy
- Admin endpoints may expose sensitive user data
- Ensure compliance with GDPR, CCPA, and other privacy regulations
- Implement data masking for sensitive fields when appropriate

---

## Integration Examples

### TypeScript Client

```typescript
import { getSupabaseBrowserClient } from '@nextsaas/supabase'

class AdminAPI {
  private supabase = getSupabaseBrowserClient()

  async getDashboardMetrics() {
    const response = await fetch('/api/admin/dashboard')
    if (!response.ok) throw new Error('Failed to fetch dashboard metrics')
    return response.json()
  }

  async getUsers(params: {
    page?: number
    limit?: number
    search?: string
    status?: string
    sort?: string
    order?: 'asc' | 'desc'
  } = {}) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, String(value))
    })
    
    const response = await fetch(`/api/admin/users?${searchParams}`)
    if (!response.ok) throw new Error('Failed to fetch users')
    return response.json()
  }
}
```

### React Hook Example

```typescript
import { useAdminDashboard, useUserManagement } from '@nextsaas/admin'

function AdminDashboard() {
  const { data: metrics, loading, error } = useAdminDashboard()
  const { users, loading: usersLoading, fetchUsers } = useUserManagement()

  // Component implementation
}
```

---

## Future Enhancements

### Planned Endpoints
- `PUT /api/admin/users/:id` - Update user details
- `DELETE /api/admin/users/:id` - Soft delete user
- `POST /api/admin/users/:id/impersonate` - Admin impersonation
- `GET /api/admin/organizations` - Organization management
- `GET /api/admin/audit-logs` - Security audit trail
- `GET /api/admin/system-health` - System health metrics

### Integration Requirements
- **Billing System**: For accurate revenue metrics
- **Monitoring System**: For real-time system health data
- **Email Service**: For email campaign and delivery metrics
- **Analytics Service**: For advanced user behavior insights

---

For implementation details and usage examples, see the [Admin Package Documentation](../packages/admin/README.md).