export interface SSOConfiguration {
  id: string
  organization_id: string
  provider_type: 'saml' | 'oauth'
  provider_name: string
  metadata: SAMLMetadata | OAuthMetadata
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SAMLMetadata {
  entity_id: string
  sso_url: string
  slo_url?: string
  certificate: string
  attribute_mapping: AttributeMapping
  signature_algorithm?: 'rsa-sha1' | 'rsa-sha256'
  digest_algorithm?: 'sha1' | 'sha256'
  name_id_format?: string
  allow_create?: boolean
  requested_attributes?: string[]
}

export interface OAuthMetadata {
  client_id: string
  client_secret: string
  authorization_url: string
  token_url: string
  user_info_url: string
  scopes: string[]
  attribute_mapping: AttributeMapping
}

export interface AttributeMapping {
  email: string
  first_name?: string
  last_name?: string
  display_name?: string
  groups?: string
  department?: string
  title?: string
  phone?: string
  avatar_url?: string
}

export interface SAMLAssertion {
  nameId: string
  sessionIndex?: string
  attributes: Record<string, string | string[]>
  conditions?: {
    notBefore?: Date
    notOnOrAfter?: Date
    audienceRestriction?: string[]
  }
  authnContext?: {
    authnContextClassRef?: string
    authnContextDecl?: string
  }
}

export interface SSOTestResult {
  success: boolean
  message: string
  details?: {
    connection_test?: boolean
    metadata_valid?: boolean
    certificate_valid?: boolean
    attribute_mapping?: boolean
    test_login?: boolean
  }
  errors?: string[]
}

export interface SecurityPolicy {
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

export interface SecurityPolicyConfig {
  // IP Whitelist Configuration
  allowed_ips?: string[]
  allowed_countries?: string[]
  block_vpn?: boolean
  
  // MFA Enforcement Configuration
  require_mfa?: boolean
  mfa_methods?: ('totp' | 'sms' | 'email' | 'webauthn')[]
  mfa_grace_period_hours?: number
  
  // Session Timeout Configuration
  idle_timeout_minutes?: number
  absolute_timeout_hours?: number
  concurrent_sessions_limit?: number
  
  // Password Policy Configuration
  min_length?: number
  require_uppercase?: boolean
  require_lowercase?: boolean
  require_numbers?: boolean
  require_symbols?: boolean
  prevent_reuse_count?: number
  max_age_days?: number
}

export interface SecurityEvent {
  id: string
  organization_id: string
  user_id?: string
  event_type: 'login_attempt' | 'mfa_challenge' | 'ip_blocked' | 'policy_violation' | 'suspicious_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  metadata: Record<string, any>
  ip_address?: string
  user_agent?: string
  location?: {
    country?: string
    region?: string
    city?: string
  }
  created_at: string
}

export interface SSOProviderConfig {
  name: string
  type: 'saml' | 'oauth'
  icon?: string
  setup_guide?: string
  required_fields: string[]
  optional_fields: string[]
  default_attribute_mapping: Partial<AttributeMapping>
}

// Common SSO error types
export class SSOError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'SSOError'
  }
}

export class SAMLValidationError extends SSOError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'SAML_VALIDATION_ERROR', details)
    this.name = 'SAMLValidationError'
  }
}

export class SecurityPolicyViolationError extends Error {
  constructor(
    message: string,
    public policyType: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'SecurityPolicyViolationError'
  }
}