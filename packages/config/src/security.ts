import * as crypto from 'crypto';

/**
 * Security Utilities for Secret Management
 * 
 * This module provides comprehensive security utilities for managing
 * secrets, encryption, validation, and secure operations in the
 * NextSaaS configuration system.
 */

// Security configuration
export interface SecurityConfig {
  saltRounds: number;
  keyLength: number;
  algorithm: string;
  hashAlgorithm: string;
  iterations: number;
}

// Default security configuration
const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  saltRounds: 12,
  keyLength: 64,
  algorithm: 'aes-256-gcm',
  hashAlgorithm: 'sha256',
  iterations: 100000,
};

// Secret validation result
export interface SecretValidationResult {
  valid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  score: number;
  errors: string[];
  suggestions: string[];
}

// Encryption result
export interface EncryptionResult {
  encrypted: string;
  iv: string;
  tag: string;
  salt: string;
}

// Decryption options
export interface DecryptionOptions {
  encrypted: string;
  iv: string;
  tag: string;
  salt: string;
  key: string;
}

/**
 * Generate a cryptographically secure random string
 */
export function generateSecureSecret(length: number = 64, charset?: string): string {
  const defaultCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  const chars = charset || defaultCharset;
  
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    result += chars[randomIndex];
  }
  
  return result;
}

/**
 * Generate a secure API key
 */
export function generateApiKey(prefix: string = 'sk', length: number = 32): string {
  const randomPart = generateSecureSecret(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
  return `${prefix}_${randomPart}`;
}

/**
 * Generate a secure UUID v4
 */
export function generateSecureUUID(): string {
  return crypto.randomUUID();
}

/**
 * Generate a secure hash of a value
 */
export function generateSecureHash(value: string, salt?: string): string {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash(DEFAULT_SECURITY_CONFIG.hashAlgorithm);
  hash.update(value + actualSalt);
  return hash.digest('hex');
}

/**
 * Validate secret strength
 */
export function validateSecretStrength(secret: string): SecretValidationResult {
  const result: SecretValidationResult = {
    valid: false,
    strength: 'weak',
    score: 0,
    errors: [],
    suggestions: [],
  };

  // Length check
  if (secret.length < 8) {
    result.errors.push('Secret must be at least 8 characters long');
  } else if (secret.length < 12) {
    result.suggestions.push('Consider using at least 12 characters for better security');
  }

  // Character variety checks
  const hasLowercase = /[a-z]/.test(secret);
  const hasUppercase = /[A-Z]/.test(secret);
  const hasNumbers = /\d/.test(secret);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(secret);

  let varietyScore = 0;
  if (hasLowercase) varietyScore++;
  if (hasUppercase) varietyScore++;
  if (hasNumbers) varietyScore++;
  if (hasSpecialChars) varietyScore++;

  if (varietyScore < 3) {
    result.errors.push('Secret should contain at least 3 different character types (lowercase, uppercase, numbers, special characters)');
  }

  // Common patterns check
  const commonPatterns = [
    /(.)\1{2,}/, // Repeated characters
    /123456|654321|qwerty|password|admin|secret/i, // Common sequences
    /^(.+)\1+$/, // Repeated patterns
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(secret)) {
      result.errors.push('Secret contains common patterns that are easily guessable');
      break;
    }
  }

  // Calculate score
  let score = 0;
  score += Math.min(secret.length * 2, 50); // Length score (max 50)
  score += varietyScore * 10; // Variety score (max 40)
  score += secret.length > 16 ? 10 : 0; // Bonus for long secrets

  // Penalty for common patterns
  if (result.errors.some(e => e.includes('common patterns'))) {
    score -= 20;
  }

  result.score = Math.max(0, Math.min(100, score));

  // Determine strength
  if (result.score >= 80) {
    result.strength = 'strong';
  } else if (result.score >= 60) {
    result.strength = 'medium';
  } else {
    result.strength = 'weak';
  }

  // Determine validity
  result.valid = result.errors.length === 0 && result.score >= 60;

  // Add suggestions
  if (!hasLowercase) result.suggestions.push('Add lowercase letters');
  if (!hasUppercase) result.suggestions.push('Add uppercase letters');
  if (!hasNumbers) result.suggestions.push('Add numbers');
  if (!hasSpecialChars) result.suggestions.push('Add special characters');
  if (secret.length < 16) result.suggestions.push('Consider using at least 16 characters');

  return result;
}

/**
 * Derive a key from a password using PBKDF2
 */
export function deriveKey(password: string, salt: string, iterations?: number, keyLength?: number): Buffer {
  return crypto.pbkdf2Sync(
    password,
    salt,
    iterations || DEFAULT_SECURITY_CONFIG.iterations,
    keyLength || DEFAULT_SECURITY_CONFIG.keyLength,
    DEFAULT_SECURITY_CONFIG.hashAlgorithm
  );
}

/**
 * Encrypt a value using AES-256-GCM
 */
export function encryptValue(value: string, key: string): EncryptionResult {
  const salt = crypto.randomBytes(16);
  const derivedKey = deriveKey(key, salt.toString('hex'));
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(DEFAULT_SECURITY_CONFIG.algorithm, derivedKey, iv);
  const aad = Buffer.from('NextSaaS-Config', 'utf8');
  (cipher as any).setAAD(aad);
  
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = (cipher as any).getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    salt: salt.toString('hex'),
  };
}

/**
 * Decrypt a value using AES-256-GCM
 */
export function decryptValue(options: DecryptionOptions): string {
  const { encrypted, iv, tag, salt, key } = options;
  
  const derivedKey = deriveKey(key, salt);
  
  const decipher = crypto.createDecipheriv(DEFAULT_SECURITY_CONFIG.algorithm, derivedKey, Buffer.from(iv, 'hex'));
  const aad = Buffer.from('NextSaaS-Config', 'utf8');
  (decipher as any).setAAD(aad);
  (decipher as any).setAuthTag(Buffer.from(tag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Secure string comparison to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');
  
  return crypto.timingSafeEqual(bufferA, bufferB);
}

/**
 * Hash a password using bcrypt-like algorithm
 */
export function hashPassword(password: string, saltRounds: number = DEFAULT_SECURITY_CONFIG.saltRounds): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, Math.pow(2, saltRounds), 64, 'sha256');
  return `$pbkdf2$${saltRounds}$${salt}$${hash.toString('hex')}`;
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  try {
    const parts = hash.split('$');
    if (parts.length !== 4 || parts[0] !== '' || parts[1] !== 'pbkdf2') {
      return false;
    }
    
    const saltRounds = parseInt(parts[2], 10);
    const salt = parts[3].substring(0, 32);
    const originalHash = parts[3].substring(32);
    
    const newHash = crypto.pbkdf2Sync(password, salt, Math.pow(2, saltRounds), 64, 'sha256');
    return secureCompare(originalHash, newHash.toString('hex'));
  } catch {
    return false;
  }
}

/**
 * Sanitize environment variables by removing or masking sensitive data
 */
export function sanitizeEnvVars(envVars: Record<string, string>): Record<string, string> {
  const sensitivePatterns = [
    /SECRET/i,
    /KEY/i,
    /PASSWORD/i,
    /TOKEN/i,
    /PRIVATE/i,
    /API_KEY/i,
    /WEBHOOK/i,
    /DSN/i,
  ];
  
  const sanitized: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(envVars)) {
    const isSensitive = sensitivePatterns.some(pattern => pattern.test(key));
    
    if (isSensitive) {
      // Mask sensitive values
      if (value && value.length > 8) {
        sanitized[key] = value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4);
      } else if (value) {
        sanitized[key] = '*'.repeat(value.length);
      } else {
        sanitized[key] = '***MASKED***';
      }
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Generate a secret rotation plan
 */
export interface SecretRotationPlan {
  secretName: string;
  currentValue: string;
  newValue: string;
  rotationDate: Date;
  backupPeriod: number; // days to keep old secret
  steps: string[];
}

export function generateSecretRotationPlan(secretName: string, currentValue: string): SecretRotationPlan {
  const newValue = generateSecureSecret(currentValue.length);
  const rotationDate = new Date();
  
  return {
    secretName,
    currentValue,
    newValue,
    rotationDate,
    backupPeriod: 7, // Keep old secret for 7 days
    steps: [
      '1. Generate new secret value',
      '2. Update configuration with new secret',
      '3. Deploy updated configuration',
      '4. Verify all services are working',
      '5. Remove old secret after backup period',
      '6. Update documentation and team',
    ],
  };
}

/**
 * Validate environment variable security
 */
export interface EnvSecurityResult {
  secure: boolean;
  vulnerabilities: string[];
  recommendations: string[];
  score: number;
}

export function validateEnvSecurity(envVars: Record<string, string>): EnvSecurityResult {
  const result: EnvSecurityResult = {
    secure: true,
    vulnerabilities: [],
    recommendations: [],
    score: 100,
  };

  let score = 100;
  
  // Check for hardcoded secrets
  const secretKeys = Object.keys(envVars).filter(key => 
    /SECRET|KEY|PASSWORD|TOKEN/i.test(key)
  );
  
  for (const key of secretKeys) {
    const value = envVars[key];
    
    if (!value) {
      result.vulnerabilities.push(`${key} is empty`);
      score -= 10;
      continue;
    }
    
    // Check for common weak secrets
    const weakSecrets = [
      'password', 'secret', 'admin', '123456', 'test', 'dev', 'localhost',
      'changeme', 'default', 'example', 'demo', 'temp'
    ];
    
    if (weakSecrets.some(weak => value.toLowerCase().includes(weak))) {
      result.vulnerabilities.push(`${key} contains weak/common values`);
      score -= 15;
    }
    
    // Check secret strength
    const validation = validateSecretStrength(value);
    if (!validation.valid) {
      result.vulnerabilities.push(`${key} is not strong enough (score: ${validation.score})`);
      score -= validation.score < 40 ? 20 : 10;
    }
    
    // Check for development secrets in production
    if (process.env.NODE_ENV === 'production' && 
        (value.includes('dev') || value.includes('test') || value.includes('localhost'))) {
      result.vulnerabilities.push(`${key} appears to contain development values in production`);
      score -= 25;
    }
  }
  
  // Check for missing required secrets
  const requiredSecrets = ['JWT_SECRET', 'SESSION_SECRET'];
  for (const required of requiredSecrets) {
    if (!envVars[required]) {
      result.vulnerabilities.push(`Missing required secret: ${required}`);
      score -= 20;
    }
  }
  
  // Generate recommendations
  if (secretKeys.length === 0) {
    result.recommendations.push('Consider using environment variables for sensitive configuration');
  }
  
  if (score < 80) {
    result.recommendations.push('Review and strengthen weak secrets');
  }
  
  result.recommendations.push('Regularly rotate secrets (every 90 days)');
  result.recommendations.push('Use a secret management system for production');
  result.recommendations.push('Never commit secrets to version control');
  result.recommendations.push('Use different secrets for each environment');
  
  result.score = Math.max(0, score);
  result.secure = result.vulnerabilities.length === 0 && score >= 80;
  
  return result;
}

/**
 * Generate secure configuration template
 */
export function generateSecureConfigTemplate(environment: 'development' | 'staging' | 'production' = 'development'): Record<string, string> {
  const baseConfig = {
    // Strong secrets
    JWT_SECRET: generateSecureSecret(64),
    SESSION_SECRET: generateSecureSecret(64),
    ENCRYPTION_KEY: generateSecureSecret(32),
    
    // API keys
    API_KEY: generateApiKey('sk', 32),
    WEBHOOK_SECRET: generateSecureSecret(48),
    
    // Database (placeholder for production)
    DATABASE_URL: environment === 'development' 
      ? 'postgresql://postgres:password@localhost:5432/app_dev'
      : '# Set your production database URL here',
  };
  
  // Add environment-specific configurations
  if (environment === 'production') {
    return {
      ...baseConfig,
      // Production should use external secret management
      JWT_SECRET: '# Use AWS Secrets Manager, HashiCorp Vault, or similar',
      SESSION_SECRET: '# Use AWS Secrets Manager, HashiCorp Vault, or similar',
      ENCRYPTION_KEY: '# Use AWS Secrets Manager, HashiCorp Vault, or similar',
    };
  }
  
  return baseConfig;
}

/**
 * Security utilities export
 */
export const security = {
  generateSecureSecret,
  generateApiKey,
  generateSecureUUID,
  generateSecureHash,
  validateSecretStrength,
  deriveKey,
  encryptValue,
  decryptValue,
  secureCompare,
  hashPassword,
  verifyPassword,
  sanitizeEnvVars,
  generateSecretRotationPlan,
  validateEnvSecurity,
  generateSecureConfigTemplate,
};

export default security;