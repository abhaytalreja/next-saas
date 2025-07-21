# @nextsaas/enterprise-auth

Enterprise-grade authentication and security features for NextSaaS, including SAML 2.0 SSO integration and advanced security policies.

## 🚀 Features

- **SAML 2.0 SSO Integration** - Works with Okta, Azure AD, OneLogin, and any SAML 2.0 provider
- **Advanced Security Policies** - IP whitelisting, MFA enforcement, session timeouts, password policies
- **Real-time Threat Detection** - Risk scoring and suspicious activity monitoring
- **Comprehensive Audit Logging** - Security event tracking for compliance
- **Production-Ready Middleware** - Automatic security policy enforcement

## 📦 Installation

This package is included in the NextSaaS workspace. No additional installation required.

```bash
# Package is already configured in the workspace
```

## 🎯 Quick Start

### 1. Import Components

```tsx
import { 
  SSOConfigForm, 
  SecurityPolicyManager,
  useSSO,
  useSecurityPolicies 
} from '@nextsaas/enterprise-auth'
```

### 2. Configure SAML SSO

```tsx
function OrganizationSSO() {
  const { saveConfiguration, testConfiguration } = useSSO()

  const handleSSOSave = async (config) => {
    await saveConfiguration({
      provider_name: 'Okta Production',
      provider_type: 'saml',
      metadata_xml: metadataXml,
      is_active: true,
      attribute_mapping: {
        email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
        first_name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
        last_name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'
      }
    })
  }

  return (
    <SSOConfigForm 
      onSave={handleSSOSave}
      onTest={testConfiguration}
    />
  )
}
```

### 3. Configure Security Policies

```tsx
function OrganizationSecurity() {
  const { policies, savePolicy, deletePolicy } = useSecurityPolicies()

  return (
    <SecurityPolicyManager
      policies={policies}
      onSave={savePolicy}
      onDelete={deletePolicy}
    />
  )
}
```

### 4. Add Security Middleware

```tsx
// middleware.ts
import { withSecurity } from '@nextsaas/enterprise-auth'
import { updateSession } from '@nextsaas/supabase/middleware'

export default withSecurity(updateSession, {
  skipPaths: ['/auth/sign-in', '/auth/sign-up'],
  errorPages: {
    ipBlocked: '/security/ip-blocked',
    mfaRequired: '/security/mfa-required'
  }
})
```

## 🔧 API Reference

### Components

#### SSOConfigForm

Complete SAML configuration form with metadata upload and testing.

```tsx
interface SSOConfigFormProps {
  config?: SSOConfiguration
  onSave: (config: Partial<SSOConfiguration>) => Promise<void>
  onTest?: (config: SSOConfiguration) => Promise<SSOTestResult>
  onDelete?: (configId: string) => Promise<void>
}

<SSOConfigForm 
  config={existingConfig}
  onSave={handleSave}
  onTest={handleTest}
  onDelete={handleDelete}
/>
```

#### SecurityPolicyManager

Comprehensive security policy management interface.

```tsx
interface SecurityPolicyManagerProps {
  policies: SecurityPolicy[]
  onSave: (policy: Partial<SecurityPolicy>) => Promise<void>
  onDelete: (policyId: string) => Promise<void>
  onToggle: (policyId: string, active: boolean) => Promise<void>
}

<SecurityPolicyManager
  policies={policies}
  onSave={handleSave}
  onDelete={handleDelete}
  onToggle={handleToggle}
/>
```

### Hooks

#### useSSO

Manage SSO configurations for the current organization.

```tsx
const {
  configurations,      // SSOConfiguration[]
  isLoading,           // boolean
  error,               // string | null
  saveConfiguration,   // (config) => Promise<SSOConfiguration>
  deleteConfiguration, // (id) => Promise<void>
  testConfiguration,   // (config) => Promise<SSOTestResult>
  getActiveConfiguration, // () => SSOConfiguration | null
  generateLoginUrl     // (config, callback) => string
} = useSSO()
```

#### useSecurityPolicies

Manage security policies for the current organization.

```tsx
const {
  policies,            // SecurityPolicy[]
  events,              // SecurityEvent[]
  isLoading,           // boolean
  error,               // string | null
  savePolicy,          // (policy) => Promise<SecurityPolicy>
  deletePolicy,        // (id) => Promise<void>
  togglePolicy,        // (id, active) => Promise<SecurityPolicy>
  getPoliciesByType,   // (type) => SecurityPolicy[]
  getActivePolicies    // () => SecurityPolicy[]
} = useSecurityPolicies()
```

#### useSecurityValidation

Validate requests against security policies.

```tsx
const {
  validateIPAccess,        // (ip, userAgent) => Promise<ValidationResult>
  validateMFARequirement,  // (userId, hasMFA) => Promise<MFAResult>
  validateSessionTimeout, // (start, lastActivity) => Promise<SessionResult>
  validatePassword,       // (password, previous) => Promise<PasswordResult>
  checkSecurityCompliance // (context) => Promise<ComplianceResult>
} = useSecurityValidation()
```

### Types

#### SSOConfiguration

```tsx
interface SSOConfiguration {
  id: string
  organization_id: string
  provider_type: 'saml' | 'oauth'
  provider_name: string
  metadata: SAMLMetadata | OAuthMetadata
  is_active: boolean
  created_at: string
  updated_at: string
}
```

#### SAMLMetadata

```tsx
interface SAMLMetadata {
  entity_id: string
  sso_url: string
  slo_url?: string
  certificate: string
  attribute_mapping: AttributeMapping
  signature_algorithm?: 'rsa-sha1' | 'rsa-sha256'
  digest_algorithm?: 'sha1' | 'sha256'
  name_id_format?: string
}
```

#### SecurityPolicy

```tsx
interface SecurityPolicy {
  id: string
  organization_id: string
  name: string
  description?: string
  policy_type: 'ip_whitelist' | 'mfa_enforcement' | 'session_timeout' | 'password_policy'
  configuration: SecurityPolicyConfig
  is_active: boolean
  created_at: string
  updated_at: string
}
```

#### SecurityPolicyConfig

```tsx
interface SecurityPolicyConfig {
  // IP Whitelist
  allowed_ips?: string[]
  allowed_countries?: string[]
  block_vpn?: boolean
  
  // MFA Enforcement  
  require_mfa?: boolean
  mfa_methods?: ('totp' | 'sms' | 'email' | 'webauthn')[]
  mfa_grace_period_hours?: number
  
  // Session Timeout
  idle_timeout_minutes?: number
  absolute_timeout_hours?: number
  concurrent_sessions_limit?: number
  
  // Password Policy
  min_length?: number
  require_uppercase?: boolean
  require_lowercase?: boolean
  require_numbers?: boolean
  require_symbols?: boolean
  prevent_reuse_count?: number
  max_age_days?: number
}
```

## 🛡️ Security Policies

### IP Whitelisting

```tsx
const ipWhitelistPolicy = {
  name: 'Office Network Access',
  policy_type: 'ip_whitelist',
  configuration: {
    allowed_ips: [
      '192.168.1.0/24',     // Office network
      '203.0.113.1'         // VPN endpoint
    ],
    allowed_countries: ['US', 'CA'],
    block_vpn: true
  }
}
```

### MFA Enforcement

```tsx
const mfaPolicy = {
  name: 'Require MFA',
  policy_type: 'mfa_enforcement', 
  configuration: {
    require_mfa: true,
    mfa_methods: ['totp', 'webauthn'],
    mfa_grace_period_hours: 24
  }
}
```

### Session Timeout

```tsx
const sessionPolicy = {
  name: 'Session Security',
  policy_type: 'session_timeout',
  configuration: {
    idle_timeout_minutes: 30,
    absolute_timeout_hours: 8,
    concurrent_sessions_limit: 3
  }
}
```

### Password Policy

```tsx
const passwordPolicy = {
  name: 'Strong Passwords',
  policy_type: 'password_policy',
  configuration: {
    min_length: 12,
    require_uppercase: true,
    require_lowercase: true,
    require_numbers: true,
    require_symbols: true,
    prevent_reuse_count: 10,
    max_age_days: 90
  }
}
```

## 🔌 Middleware Integration

### Basic Setup

```tsx
// middleware.ts
import { withSecurity } from '@nextsaas/enterprise-auth'
import { updateSession } from '@nextsaas/supabase/middleware'

export default withSecurity(updateSession, {
  skipPaths: ['/auth/*', '/api/webhooks/*'],
  errorPages: {
    ipBlocked: '/security/ip-blocked',
    mfaRequired: '/security/mfa-required',
    sessionExpired: '/auth/sign-in?reason=expired'
  },
  debug: process.env.NODE_ENV === 'development'
})
```

### Advanced Configuration

```tsx
import { SecurityMiddleware } from '@nextsaas/enterprise-auth'

const security = new SecurityMiddleware({
  skipPaths: ['/auth/*'],
  errorPages: {
    ipBlocked: '/security/access-denied',
    mfaRequired: '/auth/mfa-setup'
  }
})

export default async function middleware(request: NextRequest) {
  return security.handle(request)
}
```

## 🧪 Testing

### Test SSO Configuration

```tsx
import { SAMLHandler } from '@nextsaas/enterprise-auth'

const handler = new SAMLHandler()
const testResult = await handler.testConfiguration(ssoConfig)

console.log(testResult)
// {
//   success: true,
//   message: "Configuration test passed",
//   details: {
//     metadata_valid: true,
//     certificate_valid: true,
//     sso_url_accessible: true
//   }
// }
```

### Test Security Policies

```tsx
import { SecurityPolicyEngine } from '@nextsaas/enterprise-auth'

const engine = new SecurityPolicyEngine()

// Test IP access
const ipResult = await engine.validateIPAccess(
  'org-123',
  '192.168.1.100',
  'Mozilla/5.0...'
)

// Test MFA requirement
const mfaResult = await engine.validateMFARequirement(
  'org-123',
  'user-456',
  false // user doesn't have MFA
)
```

## 📚 Examples

### Complete Security Dashboard

```tsx
import { 
  SSOConfigForm,
  SecurityPolicyManager,
  useSSO,
  useSecurityPolicies 
} from '@nextsaas/enterprise-auth'

export function SecurityDashboard() {
  const { configurations, saveConfiguration } = useSSO()
  const { policies, events, savePolicy } = useSecurityPolicies()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Organization Security</h1>
        <p className="text-gray-600">Configure SSO and security policies</p>
      </div>

      {/* SSO Configuration */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Single Sign-On</h2>
        <SSOConfigForm 
          config={configurations.find(c => c.is_active)}
          onSave={saveConfiguration}
        />
      </section>

      {/* Security Policies */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Security Policies</h2>
        <SecurityPolicyManager
          policies={policies}
          onSave={savePolicy}
        />
      </section>

      {/* Recent Events */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Security Events</h2>
        <SecurityEventsList events={events.slice(0, 10)} />
      </section>
    </div>
  )
}
```

### Custom Security Validation

```tsx
import { useSecurityValidation } from '@nextsaas/enterprise-auth'

export function useCustomAuth() {
  const { checkSecurityCompliance } = useSecurityValidation()

  const authenticateUser = async (user, request) => {
    const compliance = await checkSecurityCompliance({
      userId: user.id,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent'),
      hasMFA: user.mfa_enabled,
      sessionStart: new Date(),
      lastActivity: new Date()
    })

    if (!compliance.compliant) {
      throw new SecurityError(
        `Security policy violation: ${compliance.violations.join(', ')}`,
        compliance.violations
      )
    }

    return user
  }

  return { authenticateUser }
}
```

## 🤝 Contributing

This package follows the NextSaaS contribution guidelines. When making changes:

1. **Follow existing patterns** - Match the coding style and architecture
2. **Add comprehensive tests** - Include unit, integration, and E2E tests
3. **Update documentation** - Keep README and docs in sync
4. **Test security features** - Verify all security scenarios work correctly

## 📄 License

This package is part of NextSaaS and follows the same license terms.

## 🔗 Related Packages

- [`@nextsaas/auth`](../auth/README.md) - Core authentication system
- [`@nextsaas/multi-tenant`](../multi-tenant/README.md) - Multi-tenant organization management
- [`@nextsaas/ui`](../ui/README.md) - UI components and design system
- [`@nextsaas/supabase`](../supabase/README.md) - Supabase integration utilities

## 📞 Support

For enterprise authentication support:

1. Check the [Enterprise Authentication Guide](../../docs/ENTERPRISE_AUTHENTICATION_GUIDE.md)
2. Review the [API Reference](../../docs/ENTERPRISE_AUTH_API_REFERENCE.md)
3. Test configurations using the built-in testing tools
4. Check security event logs for troubleshooting

---

**Enterprise Authentication** unlocks enterprise deals by providing the security and compliance features that enterprise customers require. 🚀