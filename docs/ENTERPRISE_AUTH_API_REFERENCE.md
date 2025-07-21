# Enterprise Authentication API Reference

This document provides detailed API specifications for the NextSaaS Enterprise Authentication system.

## Table of Contents

- [Authentication](#authentication)
- [SSO Configuration APIs](#sso-configuration-apis)
- [Security Policy APIs](#security-policy-apis)
- [Security Events APIs](#security-events-apis)
- [Error Responses](#error-responses)
- [Webhooks](#webhooks)

## Authentication

All API endpoints require authentication via JWT tokens obtained through the standard NextSaaS authentication flow.

### Headers

```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
X-Organization-ID: {organization_id}  // Optional, for multi-org contexts
```

### Organization Access

Users must have `admin` or `owner` role in the organization to access enterprise authentication APIs.

## SSO Configuration APIs

### List SSO Configurations

Retrieve all SSO configurations for an organization.

```http
GET /api/organization/{organizationId}/sso
```

**Response:**
```json
{
  "configurations": [
    {
      "id": "uuid",
      "organization_id": "uuid", 
      "provider_type": "saml",
      "provider_name": "Okta Production",
      "metadata": {
        "entity_id": "https://dev-123.oktapreview.com",
        "sso_url": "https://dev-123.oktapreview.com/app/app_name/sso/saml",
        "slo_url": "https://dev-123.oktapreview.com/app/app_name/slo/saml",
        "certificate": "MIICertificateData...",
        "attribute_mapping": {
          "email": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
          "first_name": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
          "last_name": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"
        }
      },
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Create SSO Configuration

Create a new SSO configuration.

```http
POST /api/organization/{organizationId}/sso
Content-Type: application/json
```

**Request Body:**
```json
{
  "provider_name": "Okta Production",
  "provider_type": "saml",
  "metadata_xml": "<EntityDescriptor xmlns=\"urn:oasis:names:tc:SAML:2.0:metadata\" entityID=\"https://dev-123.oktapreview.com\">...</EntityDescriptor>",
  "is_active": true,
  "attribute_mapping": {
    "email": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
    "first_name": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
    "last_name": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
    "display_name": "http://schemas.microsoft.com/identity/claims/displayname",
    "groups": "http://schemas.microsoft.com/ws/2008/06/identity/claims/groups"
  }
}
```

**Validation Rules:**
- `provider_name`: Required, 1-100 characters
- `provider_type`: Must be "saml" (OAuth support coming soon)
- `metadata_xml`: Required, valid SAML metadata XML
- `attribute_mapping.email`: Required attribute mapping

**Response:**
```json
{
  "configuration": {
    "id": "uuid",
    "organization_id": "uuid",
    "provider_type": "saml",
    "provider_name": "Okta Production",
    "metadata": { /* parsed metadata */ },
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### Get SSO Configuration

Retrieve a specific SSO configuration.

```http
GET /api/organization/{organizationId}/sso/{configId}
```

**Response:**
```json
{
  "configuration": {
    "id": "uuid",
    "organization_id": "uuid",
    "provider_type": "saml",
    "provider_name": "Okta Production",
    "metadata": { /* full metadata object */ },
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### Update SSO Configuration

Update an existing SSO configuration.

```http
PUT /api/organization/{organizationId}/sso/{configId}
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "provider_name": "Okta Production Updated",
  "metadata_xml": "<EntityDescriptor>...</EntityDescriptor>",
  "is_active": false,
  "attribute_mapping": {
    "email": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
  }
}
```

**Response:**
```json
{
  "configuration": { /* updated configuration */ }
}
```

### Delete SSO Configuration

Delete an SSO configuration.

```http
DELETE /api/organization/{organizationId}/sso/{configId}
```

**Response:**
```json
{
  "success": true
}
```

### Test SSO Configuration

Test SSO configuration connectivity and validation.

```http
POST /api/organization/{organizationId}/sso/{configId}/test
```

**Response:**
```json
{
  "success": true,
  "message": "Configuration test passed successfully",
  "details": {
    "metadata_valid": true,
    "certificate_valid": true,
    "sso_url_accessible": true,
    "attribute_mapping_complete": true
  },
  "errors": [],
  "metadata": {
    "entity_id": "https://dev-123.oktapreview.com",
    "sso_url": "https://dev-123.oktapreview.com/app/app_name/sso/saml",
    "certificate_fingerprint": "SHA256:abc123..."
  }
}
```

**Failed Test Response:**
```json
{
  "success": false,
  "message": "Configuration test failed - see details",
  "details": {
    "metadata_valid": true,
    "certificate_valid": false,
    "sso_url_accessible": true,
    "attribute_mapping_complete": true
  },
  "errors": [
    "Invalid certificate format",
    "SSO URL not reachable"
  ]
}
```

## Security Policy APIs

### List Security Policies

Retrieve security policies for an organization.

```http
GET /api/organization/{organizationId}/security/policies
```

**Query Parameters:**
- `type`: Filter by policy type (`ip_whitelist`, `mfa_enforcement`, `session_timeout`, `password_policy`)
- `active`: Filter by active status (`true`/`false`)

**Response:**
```json
{
  "policies": [
    {
      "id": "uuid",
      "organization_id": "uuid",
      "name": "Office IP Whitelist",
      "description": "Allow access only from office networks",
      "policy_type": "ip_whitelist",
      "configuration": {
        "allowed_ips": ["192.168.1.0/24", "203.0.113.1"],
        "allowed_countries": ["US", "CA"],
        "block_vpn": true
      },
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Create Security Policy

Create a new security policy.

```http
POST /api/organization/{organizationId}/security/policies
Content-Type: application/json
```

**Request Body Examples:**

**IP Whitelist Policy:**
```json
{
  "name": "Office Network Access",
  "description": "Restrict access to office IP ranges",
  "policy_type": "ip_whitelist",
  "configuration": {
    "allowed_ips": [
      "192.168.1.0/24",
      "203.0.113.1",
      "198.51.100.0/24"
    ],
    "allowed_countries": ["US", "CA"],
    "block_vpn": true
  },
  "is_active": true
}
```

**MFA Enforcement Policy:**
```json
{
  "name": "Require Multi-Factor Authentication",
  "description": "All users must enable MFA",
  "policy_type": "mfa_enforcement",
  "configuration": {
    "require_mfa": true,
    "mfa_methods": ["totp", "webauthn"],
    "mfa_grace_period_hours": 24
  },
  "is_active": true
}
```

**Session Timeout Policy:**
```json
{
  "name": "Session Security Policy",
  "description": "Automatic logout for security",
  "policy_type": "session_timeout",
  "configuration": {
    "idle_timeout_minutes": 30,
    "absolute_timeout_hours": 8,
    "concurrent_sessions_limit": 3
  },
  "is_active": true
}
```

**Password Policy:**
```json
{
  "name": "Strong Password Requirements", 
  "description": "Enforce secure password standards",
  "policy_type": "password_policy",
  "configuration": {
    "min_length": 12,
    "require_uppercase": true,
    "require_lowercase": true,
    "require_numbers": true,
    "require_symbols": true,
    "prevent_reuse_count": 10,
    "max_age_days": 90
  },
  "is_active": true
}
```

**Response:**
```json
{
  "policy": {
    "id": "uuid",
    "organization_id": "uuid",
    "name": "Office Network Access",
    "description": "Restrict access to office IP ranges",
    "policy_type": "ip_whitelist",
    "configuration": { /* configuration object */ },
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### Get Security Policy

Retrieve a specific security policy.

```http
GET /api/organization/{organizationId}/security/policies/{policyId}
```

### Update Security Policy

Update an existing security policy.

```http
PUT /api/organization/{organizationId}/security/policies/{policyId}
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "name": "Updated Policy Name",
  "description": "Updated description",
  "configuration": {
    "allowed_ips": ["192.168.1.0/24"]
  },
  "is_active": false
}
```

### Delete Security Policy

Delete a security policy.

```http
DELETE /api/organization/{organizationId}/security/policies/{policyId}
```

**Response:**
```json
{
  "success": true
}
```

## Security Events APIs

### List Security Events

Retrieve security events for audit and monitoring.

```http
GET /api/organization/{organizationId}/security/events
```

**Query Parameters:**
- `type`: Event type filter (`login_attempt`, `mfa_challenge`, `ip_blocked`, `policy_violation`, `suspicious_activity`)
- `severity`: Severity filter (`low`, `medium`, `high`, `critical`)
- `user_id`: Filter by specific user
- `limit`: Number of events to return (default: 50, max: 500)
- `offset`: Pagination offset (default: 0)
- `start_date`: Filter events after this date (ISO 8601)
- `end_date`: Filter events before this date (ISO 8601)

**Response:**
```json
{
  "events": [
    {
      "id": "uuid",
      "organization_id": "uuid",
      "user_id": "uuid",
      "event_type": "ip_blocked",
      "severity": "medium",
      "description": "IP address 203.0.113.100 blocked by whitelist policy",
      "metadata": {
        "policy_id": "uuid",
        "blocked_ip": "203.0.113.100",
        "user_agent": "Mozilla/5.0..."
      },
      "ip_address": "203.0.113.100",
      "user_agent": "Mozilla/5.0...",
      "location": {
        "country": "US",
        "region": "California",
        "city": "San Francisco"
      },
      "created_at": "2024-01-15T10:30:00Z",
      "profiles": {
        "first_name": "John",
        "last_name": "Doe", 
        "email": "john@example.com"
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

### Create Security Event

Create a manual security event (for testing or custom logging).

```http
POST /api/organization/{organizationId}/security/events
Content-Type: application/json
```

**Request Body:**
```json
{
  "event_type": "manual_event",
  "severity": "medium",
  "description": "Manual security event for testing",
  "metadata": {
    "test_event": true,
    "reason": "Security drill"
  },
  "target_user_id": "uuid"  // Optional, defaults to current user
}
```

**Valid Event Types:**
- `login_attempt`
- `mfa_challenge`
- `ip_blocked`
- `policy_violation`
- `suspicious_activity`
- `manual_event`

**Valid Severities:**
- `low`
- `medium`
- `high`
- `critical`

## Error Responses

### Standard Error Format

```json
{
  "error": "Error message",
  "details": "Additional details (optional)",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

#### Authentication Errors
```json
{
  "error": "Unauthorized",
  "code": "AUTH_REQUIRED"
}
```

#### Authorization Errors
```json
{
  "error": "Forbidden",
  "details": "Admin or owner role required",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

#### Validation Errors
```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "provider_name",
      "message": "Provider name is required"
    }
  ],
  "code": "VALIDATION_FAILED"
}
```

#### SAML Specific Errors
```json
{
  "error": "Invalid SAML metadata",
  "details": "Missing EntityDescriptor element",
  "code": "SAML_METADATA_INVALID"
}
```

#### Security Policy Errors
```json
{
  "error": "Invalid policy configuration",
  "details": [
    "IP whitelist policy requires allowed_ips array",
    "MFA grace period must be between 0 and 168 hours"
  ],
  "code": "POLICY_CONFIG_INVALID"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate active SSO config)
- `500` - Internal Server Error

## Webhooks

### Security Event Webhooks

Configure webhooks to receive real-time security events.

**Webhook URL Configuration:**
```http
POST /api/organization/{organizationId}/webhooks
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/security",
  "events": ["ip_blocked", "suspicious_activity", "policy_violation"],
  "secret": "webhook_secret_for_signature_verification"
}
```

**Webhook Payload:**
```json
{
  "event": "security_event",
  "data": {
    "organization_id": "uuid",
    "event_type": "ip_blocked",
    "severity": "high",
    "description": "Multiple failed login attempts from suspicious IP",
    "metadata": {
      "blocked_ip": "203.0.113.100",
      "attempt_count": 10,
      "time_window": "5 minutes"
    },
    "created_at": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Webhook Signature Verification:**
```javascript
const crypto = require('crypto')

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return `sha256=${expectedSignature}` === signature
}
```

### Rate Limits

- **SSO Configuration APIs**: 100 requests per hour per organization
- **Security Policy APIs**: 200 requests per hour per organization  
- **Security Events APIs**: 1000 requests per hour per organization
- **Webhook APIs**: 50 requests per hour per organization

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312200
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { createClient } from '@nextsaas/api-client'

const client = createClient({
  baseURL: 'https://api.nextsaas.com',
  apiKey: 'your_api_key'
})

// Create SSO configuration
const ssoConfig = await client.sso.create('org-123', {
  provider_name: 'Okta Production',
  provider_type: 'saml',
  metadata_xml: metadataXml,
  is_active: true
})

// Create security policy
const policy = await client.security.policies.create('org-123', {
  name: 'IP Whitelist',
  policy_type: 'ip_whitelist',
  configuration: {
    allowed_ips: ['192.168.1.0/24']
  }
})

// Get security events
const events = await client.security.events.list('org-123', {
  type: 'ip_blocked',
  severity: 'high',
  limit: 50
})
```

### cURL Examples

```bash
# Create SSO configuration
curl -X POST \
  https://api.nextsaas.com/api/organization/org-123/sso \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider_name": "Okta Production",
    "provider_type": "saml",
    "metadata_xml": "...",
    "is_active": true
  }'

# Test SSO configuration
curl -X POST \
  https://api.nextsaas.com/api/organization/org-123/sso/config-456/test \
  -H "Authorization: Bearer $TOKEN"

# Get security events with filters
curl -X GET \
  "https://api.nextsaas.com/api/organization/org-123/security/events?type=ip_blocked&severity=high&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

This API reference provides complete documentation for integrating with the NextSaaS Enterprise Authentication system. For additional support, refer to the main [Enterprise Authentication Guide](./ENTERPRISE_AUTHENTICATION_GUIDE.md).