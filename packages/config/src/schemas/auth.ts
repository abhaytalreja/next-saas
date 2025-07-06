import { z } from 'zod'

/**
 * Authentication Configuration Schema
 *
 * Validates authentication settings including:
 * - JWT configuration and secrets
 * - OAuth provider settings
 * - Session management
 * - Password policies
 * - Multi-factor authentication
 * - Security settings
 */

// JWT configuration schema
const jwtConfigSchema = z
  .object({
    secret: z.string().min(32, 'JWT secret must be at least 32 characters'),
    algorithm: z
      .enum(['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512'])
      .default('HS256'),
    expiresIn: z.string().default('24h'),
    issuer: z.string().default('nextsaas'),
    audience: z.string().optional(),
    refreshTokenExpiresIn: z.string().default('7d'),
  })
  .describe('JWT token configuration')

// OAuth provider configuration
const oauthProviderSchema = z
  .object({
    enabled: z.boolean().default(false),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    scope: z.array(z.string()).default([]),
    redirectUri: z.string().url().optional(),
    authorizeUrl: z.string().url().optional(),
    tokenUrl: z.string().url().optional(),
    userInfoUrl: z.string().url().optional(),
  })
  .describe('OAuth provider configuration')

// Password policy configuration
const passwordPolicySchema = z
  .object({
    minLength: z.number().int().min(8).default(8),
    maxLength: z.number().int().max(128).default(128),
    requireUppercase: z.boolean().default(true),
    requireLowercase: z.boolean().default(true),
    requireNumbers: z.boolean().default(true),
    requireSpecialChars: z.boolean().default(true),
    preventCommonPasswords: z.boolean().default(true),
    preventReuse: z.number().int().min(0).default(5),
    maxAttempts: z.number().int().min(1).default(5),
    lockoutDuration: z.number().int().min(60).default(300), // 5 minutes
  })
  .describe('Password policy configuration')

// Session configuration
const sessionConfigSchema = z
  .object({
    provider: z.enum(['memory', 'redis', 'database']).default('memory'),
    secret: z.string().min(32, 'Session secret must be at least 32 characters'),
    maxAge: z.number().int().min(300).default(86400), // 24 hours
    rolling: z.boolean().default(true),
    httpOnly: z.boolean().default(true),
    secure: z.boolean().default(true),
    sameSite: z.enum(['strict', 'lax', 'none']).default('lax'),
    domain: z.string().optional(),
    path: z.string().default('/'),

    // Redis-specific settings
    redis: z
      .object({
        url: z.string().url().optional(),
        host: z.string().default('localhost'),
        port: z.number().int().min(1).max(65535).default(6379),
        password: z.string().optional(),
        db: z.number().int().min(0).default(0),
        keyPrefix: z.string().default('nextsaas:session:'),
      })
      .optional(),
  })
  .describe('Session management configuration')

// Multi-factor authentication configuration
const mfaConfigSchema = z
  .object({
    enabled: z.boolean().default(false),
    required: z.boolean().default(false),
    providers: z
      .object({
        totp: z
          .object({
            enabled: z.boolean().default(true),
            issuer: z.string().default('NextSaaS'),
            algorithm: z.enum(['SHA1', 'SHA256', 'SHA512']).default('SHA1'),
            digits: z.number().int().min(6).max(8).default(6),
            period: z.number().int().min(15).max(300).default(30),
          })
          .default({}),
        sms: z
          .object({
            enabled: z.boolean().default(false),
            provider: z.enum(['twilio', 'aws-sns', 'custom']).optional(),
            twilioAccountSid: z.string().optional(),
            twilioAuthToken: z.string().optional(),
            twilioPhoneNumber: z.string().optional(),
          })
          .default({}),
        email: z
          .object({
            enabled: z.boolean().default(true),
            codeLength: z.number().int().min(4).max(8).default(6),
            codeExpiry: z.number().int().min(60).default(600), // 10 minutes
          })
          .default({}),
      })
      .default({}),
    backupCodes: z
      .object({
        enabled: z.boolean().default(true),
        count: z.number().int().min(5).max(20).default(10),
        length: z.number().int().min(8).max(16).default(12),
      })
      .default({}),
  })
  .describe('Multi-factor authentication configuration')

// Rate limiting configuration
const rateLimitingSchema = z
  .object({
    enabled: z.boolean().default(true),
    login: z
      .object({
        windowMs: z.number().int().min(60000).default(900000), // 15 minutes
        maxAttempts: z.number().int().min(1).default(5),
      })
      .default({}),
    registration: z
      .object({
        windowMs: z.number().int().min(60000).default(3600000), // 1 hour
        maxAttempts: z.number().int().min(1).default(3),
      })
      .default({}),
    passwordReset: z
      .object({
        windowMs: z.number().int().min(60000).default(3600000), // 1 hour
        maxAttempts: z.number().int().min(1).default(3),
      })
      .default({}),
  })
  .describe('Rate limiting configuration for authentication endpoints')

// Security headers configuration
const securityHeadersSchema = z
  .object({
    contentSecurityPolicy: z.boolean().default(true),
    xFrameOptions: z.enum(['DENY', 'SAMEORIGIN', 'ALLOW-FROM']).default('DENY'),
    xContentTypeOptions: z.boolean().default(true),
    referrerPolicy: z
      .enum([
        'no-referrer',
        'no-referrer-when-downgrade',
        'origin',
        'origin-when-cross-origin',
        'same-origin',
        'strict-origin',
        'strict-origin-when-cross-origin',
        'unsafe-url',
      ])
      .default('strict-origin-when-cross-origin'),
    strictTransportSecurity: z
      .object({
        enabled: z.boolean().default(true),
        maxAge: z.number().int().min(0).default(31536000), // 1 year
        includeSubDomains: z.boolean().default(true),
        preload: z.boolean().default(false),
      })
      .default({}),
  })
  .describe('Security headers configuration')

// Supabase configuration schema
const supabaseConfigSchema = z
  .object({
    url: z.string().url('Supabase URL must be a valid URL'),
    anonKey: z.string().min(1, 'Supabase anonymous key is required'),
    serviceRoleKey: z.string().min(1, 'Supabase service role key is required'),
  })
  .describe('Supabase authentication configuration')

// Main authentication configuration schema
export const authConfigSchema = z
  .object({
    // Supabase configuration
    supabase: supabaseConfigSchema,

    // JWT configuration
    jwt: jwtConfigSchema,

    // Session configuration
    session: sessionConfigSchema,

    // OAuth providers
    providers: z
      .object({
        google: oauthProviderSchema.default({}),
        github: oauthProviderSchema.default({}),
        discord: oauthProviderSchema.default({}),
        microsoft: oauthProviderSchema.default({}),
        facebook: oauthProviderSchema.default({}),
        twitter: oauthProviderSchema.default({}),
        linkedin: oauthProviderSchema.default({}),
      })
      .default({}),

    // Password policy
    passwordPolicy: passwordPolicySchema.default({}),

    // Multi-factor authentication
    mfa: mfaConfigSchema.default({}),

    // Rate limiting
    rateLimit: rateLimitingSchema.default({}),

    // Security headers
    security: securityHeadersSchema.default({}),

    // Email verification
    emailVerification: z
      .object({
        enabled: z.boolean().default(true),
        required: z.boolean().default(true),
        tokenExpiry: z.number().int().min(300).default(86400), // 24 hours
        resendCooldown: z.number().int().min(60).default(300), // 5 minutes
      })
      .default({}),

    // Password reset
    passwordReset: z
      .object({
        enabled: z.boolean().default(true),
        tokenExpiry: z.number().int().min(300).default(3600), // 1 hour
        resendCooldown: z.number().int().min(60).default(300), // 5 minutes
      })
      .default({}),

    // Account settings
    account: z
      .object({
        allowRegistration: z.boolean().default(true),
        allowSocialLogin: z.boolean().default(true),
        allowPasswordLogin: z.boolean().default(true),
        allowAnonymousAccess: z.boolean().default(false),
        defaultRole: z.string().default('user'),
        autoActivateAccounts: z.boolean().default(false),
      })
      .default({}),

    // CORS settings
    cors: z
      .object({
        enabled: z.boolean().default(true),
        origin: z
          .union([z.string(), z.array(z.string()), z.boolean()])
          .default([
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
          ]),
        credentials: z.boolean().default(true),
        optionsSuccessStatus: z.number().int().default(204),
      })
      .default({}),
  })
  .describe('Authentication configuration settings')

// Export types
export type AuthConfig = z.infer<typeof authConfigSchema>
export type JwtConfig = z.infer<typeof jwtConfigSchema>
export type SessionConfig = z.infer<typeof sessionConfigSchema>
export type PasswordPolicy = z.infer<typeof passwordPolicySchema>

// Environment-specific authentication configurations
export const developmentAuthDefaults: Partial<AuthConfig> = {
  jwt: {
    secret: 'dev-jwt-secret-change-in-production-minimum-32-chars',
    expiresIn: '24h',
    algorithm: 'HS256',
  },
  session: {
    provider: 'memory',
    secret: 'dev-session-secret-change-in-production-minimum-32-chars',
    secure: false,
    maxAge: 86400,
  },
  passwordPolicy: {
    minLength: 6,
    requireUppercase: false,
    requireNumbers: false,
    requireSpecialChars: false,
    maxAttempts: 10,
  },
  account: {
    autoActivateAccounts: true,
    allowAnonymousAccess: true,
  },
  emailVerification: {
    required: false,
  },
  security: {
    strictTransportSecurity: {
      enabled: false,
    },
  },
}

export const productionAuthDefaults: Partial<AuthConfig> = {
  session: {
    provider: 'redis',
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  },
  passwordPolicy: {
    minLength: 12,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommonPasswords: true,
    maxAttempts: 3,
    lockoutDuration: 900, // 15 minutes
  },
  mfa: {
    enabled: true,
    required: false,
  },
  rateLimit: {
    enabled: true,
    login: {
      maxAttempts: 3,
      windowMs: 900000, // 15 minutes
    },
  },
  account: {
    autoActivateAccounts: false,
    allowAnonymousAccess: false,
  },
  emailVerification: {
    required: true,
  },
  security: {
    contentSecurityPolicy: true,
    strictTransportSecurity: {
      enabled: true,
      includeSubDomains: true,
      preload: true,
    },
  },
}

export const testAuthDefaults: Partial<AuthConfig> = {
  jwt: {
    secret: 'test-jwt-secret-for-testing-only-32-chars',
    expiresIn: '1h',
  },
  session: {
    provider: 'memory',
    secret: 'test-session-secret-for-testing-only-32-chars',
    secure: false,
    maxAge: 3600,
  },
  passwordPolicy: {
    minLength: 4,
    requireUppercase: false,
    requireNumbers: false,
    requireSpecialChars: false,
    maxAttempts: 100,
  },
  rateLimit: {
    enabled: false,
  },
  emailVerification: {
    enabled: false,
    required: false,
  },
  account: {
    autoActivateAccounts: true,
    allowAnonymousAccess: true,
  },
}
