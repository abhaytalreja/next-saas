/**
 * Secret Management Integration
 * 
 * This module provides integration with external secret management services
 * like AWS Secrets Manager, HashiCorp Vault, Azure Key Vault, and others.
 * It provides a unified interface for retrieving and managing secrets.
 */

// Secret provider configuration
export interface SecretProviderConfig {
  provider: 'aws-secrets-manager' | 'hashicorp-vault' | 'azure-key-vault' | 'google-secret-manager' | 'env' | 'file';
  region?: string;
  endpoint?: string;
  token?: string;
  roleId?: string;
  secretId?: string;
  namespace?: string;
  mountPath?: string;
  filePath?: string;
  credentials?: any;
}

// Secret metadata
export interface SecretMetadata {
  name: string;
  version?: string;
  createdAt?: Date;
  updatedAt?: Date;
  description?: string;
  tags?: Record<string, string>;
}

// Secret value with metadata
export interface Secret {
  name: string;
  value: string;
  metadata: SecretMetadata;
}

// Secret provider interface
export interface SecretProvider {
  name: string;
  getSecret(secretName: string, version?: string): Promise<Secret>;
  listSecrets(): Promise<SecretMetadata[]>;
  createSecret(secret: Secret): Promise<void>;
  updateSecret(secretName: string, value: string): Promise<void>;
  deleteSecret(secretName: string): Promise<void>;
  rotateSecret(secretName: string): Promise<string>;
}

/**
 * Environment Variables Secret Provider
 */
export class EnvSecretProvider implements SecretProvider {
  name = 'env';

  async getSecret(secretName: string): Promise<Secret> {
    const value = process.env[secretName];
    if (!value) {
      throw new Error(`Secret ${secretName} not found in environment variables`);
    }

    return {
      name: secretName,
      value,
      metadata: {
        name: secretName,
        description: 'Environment variable',
      },
    };
  }

  async listSecrets(): Promise<SecretMetadata[]> {
    const secretPattern = /(SECRET|KEY|PASSWORD|TOKEN|PRIVATE)/i;
    return Object.keys(process.env)
      .filter(key => secretPattern.test(key))
      .map(name => ({
        name,
        description: 'Environment variable',
      }));
  }

  async createSecret(): Promise<void> {
    throw new Error('Creating secrets in environment variables is not supported');
  }

  async updateSecret(): Promise<void> {
    throw new Error('Updating secrets in environment variables is not supported');
  }

  async deleteSecret(): Promise<void> {
    throw new Error('Deleting secrets from environment variables is not supported');
  }

  async rotateSecret(): Promise<string> {
    throw new Error('Rotating secrets in environment variables is not supported');
  }
}

/**
 * File-based Secret Provider
 */
export class FileSecretProvider implements SecretProvider {
  name = 'file';
  private filePath: string;

  constructor(config: SecretProviderConfig) {
    this.filePath = config.filePath || './secrets.json';
  }

  private async readSecretsFile(): Promise<Record<string, any>> {
    try {
      const fs = await import('fs');
      const content = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return {};
      }
      throw error;
    }
  }

  private async writeSecretsFile(secrets: Record<string, any>): Promise<void> {
    const fs = await import('fs');
    const path = await import('path');
    
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(this.filePath, JSON.stringify(secrets, null, 2));
  }

  async getSecret(secretName: string): Promise<Secret> {
    const secrets = await this.readSecretsFile();
    const secretData = secrets[secretName];
    
    if (!secretData) {
      throw new Error(`Secret ${secretName} not found in file ${this.filePath}`);
    }

    return {
      name: secretName,
      value: secretData.value || secretData,
      metadata: {
        name: secretName,
        description: secretData.description || 'File-based secret',
        createdAt: secretData.createdAt ? new Date(secretData.createdAt) : undefined,
        updatedAt: secretData.updatedAt ? new Date(secretData.updatedAt) : undefined,
        tags: secretData.tags,
      },
    };
  }

  async listSecrets(): Promise<SecretMetadata[]> {
    const secrets = await this.readSecretsFile();
    return Object.entries(secrets).map(([name, data]: [string, any]) => ({
      name,
      description: data.description || 'File-based secret',
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
      tags: data.tags,
    }));
  }

  async createSecret(secret: Secret): Promise<void> {
    const secrets = await this.readSecretsFile();
    secrets[secret.name] = {
      value: secret.value,
      description: secret.metadata.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: secret.metadata.tags,
    };
    await this.writeSecretsFile(secrets);
  }

  async updateSecret(secretName: string, value: string): Promise<void> {
    const secrets = await this.readSecretsFile();
    if (!secrets[secretName]) {
      throw new Error(`Secret ${secretName} not found`);
    }
    
    secrets[secretName].value = value;
    secrets[secretName].updatedAt = new Date().toISOString();
    await this.writeSecretsFile(secrets);
  }

  async deleteSecret(secretName: string): Promise<void> {
    const secrets = await this.readSecretsFile();
    delete secrets[secretName];
    await this.writeSecretsFile(secrets);
  }

  async rotateSecret(secretName: string): Promise<string> {
    const { generateSecureSecret } = await import('./security');
    const newValue = generateSecureSecret(64);
    await this.updateSecret(secretName, newValue);
    return newValue;
  }
}

/**
 * AWS Secrets Manager Provider (stub - requires AWS SDK)
 */
export class AWSSecretsManagerProvider implements SecretProvider {
  name = 'aws-secrets-manager';
  private region: string;

  constructor(config: SecretProviderConfig) {
    this.region = config.region || 'us-east-1';
  }

  async getSecret(secretName: string, version?: string): Promise<Secret> {
    // This is a stub implementation
    // In a real implementation, you would use AWS SDK:
    // const client = new SecretsManagerClient({ region: this.region });
    // const response = await client.send(new GetSecretValueCommand({
    //   SecretId: secretName,
    //   VersionId: version
    // }));
    
    throw new Error('AWS Secrets Manager integration requires AWS SDK. Please install @aws-sdk/client-secrets-manager');
  }

  async listSecrets(): Promise<SecretMetadata[]> {
    throw new Error('AWS Secrets Manager integration requires AWS SDK');
  }

  async createSecret(): Promise<void> {
    throw new Error('AWS Secrets Manager integration requires AWS SDK');
  }

  async updateSecret(): Promise<void> {
    throw new Error('AWS Secrets Manager integration requires AWS SDK');
  }

  async deleteSecret(): Promise<void> {
    throw new Error('AWS Secrets Manager integration requires AWS SDK');
  }

  async rotateSecret(): Promise<string> {
    throw new Error('AWS Secrets Manager integration requires AWS SDK');
  }
}

/**
 * HashiCorp Vault Provider (stub - requires vault client)
 */
export class HashiCorpVaultProvider implements SecretProvider {
  name = 'hashicorp-vault';
  private endpoint: string;
  private token: string;
  private mountPath: string;

  constructor(config: SecretProviderConfig) {
    this.endpoint = config.endpoint || 'http://localhost:8200';
    this.token = config.token || '';
    this.mountPath = config.mountPath || 'secret';
  }

  async getSecret(secretName: string): Promise<Secret> {
    // This is a stub implementation
    // In a real implementation, you would use node-vault or similar:
    // const vault = require('node-vault')({
    //   endpoint: this.endpoint,
    //   token: this.token
    // });
    // const response = await vault.read(`${this.mountPath}/data/${secretName}`);
    
    throw new Error('HashiCorp Vault integration requires vault client. Please install node-vault');
  }

  async listSecrets(): Promise<SecretMetadata[]> {
    throw new Error('HashiCorp Vault integration requires vault client');
  }

  async createSecret(): Promise<void> {
    throw new Error('HashiCorp Vault integration requires vault client');
  }

  async updateSecret(): Promise<void> {
    throw new Error('HashiCorp Vault integration requires vault client');
  }

  async deleteSecret(): Promise<void> {
    throw new Error('HashiCorp Vault integration requires vault client');
  }

  async rotateSecret(): Promise<string> {
    throw new Error('HashiCorp Vault integration requires vault client');
  }
}

/**
 * Secret Manager Factory
 */
export function createSecretProvider(config: SecretProviderConfig): SecretProvider {
  switch (config.provider) {
    case 'env':
      return new EnvSecretProvider();
    case 'file':
      return new FileSecretProvider(config);
    case 'aws-secrets-manager':
      return new AWSSecretsManagerProvider(config);
    case 'hashicorp-vault':
      return new HashiCorpVaultProvider(config);
    default:
      throw new Error(`Unknown secret provider: ${config.provider}`);
  }
}

/**
 * Secret Manager with multiple providers and fallback
 */
export class SecretManager {
  private providers: SecretProvider[];
  private cache: Map<string, { secret: Secret; expiry: number }> = new Map();
  private cacheTtl: number;

  constructor(providers: SecretProvider[], cacheTtl: number = 300000) { // 5 minutes default
    this.providers = providers;
    this.cacheTtl = cacheTtl;
  }

  async getSecret(secretName: string, version?: string): Promise<Secret> {
    // Check cache first
    const cacheKey = `${secretName}:${version || 'latest'}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.secret;
    }

    // Try each provider in order
    let lastError: Error | null = null;
    
    for (const provider of this.providers) {
      try {
        const secret = await provider.getSecret(secretName, version);
        
        // Cache the result
        this.cache.set(cacheKey, {
          secret,
          expiry: Date.now() + this.cacheTtl,
        });
        
        return secret;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Failed to get secret ${secretName} from ${provider.name}:`, error);
      }
    }

    throw lastError || new Error(`Failed to get secret ${secretName} from all providers`);
  }

  async getSecretValue(secretName: string, version?: string): Promise<string> {
    const secret = await this.getSecret(secretName, version);
    return secret.value;
  }

  async listSecrets(): Promise<SecretMetadata[]> {
    const allSecrets = new Map<string, SecretMetadata>();
    
    for (const provider of this.providers) {
      try {
        const secrets = await provider.listSecrets();
        for (const secret of secrets) {
          allSecrets.set(secret.name, secret);
        }
      } catch (error) {
        console.warn(`Failed to list secrets from ${provider.name}:`, error);
      }
    }
    
    return Array.from(allSecrets.values());
  }

  async createSecret(secret: Secret): Promise<void> {
    const errors: Error[] = [];
    
    for (const provider of this.providers) {
      try {
        await provider.createSecret(secret);
        return; // Success on first provider
      } catch (error) {
        errors.push(error as Error);
      }
    }
    
    throw new Error(`Failed to create secret on all providers: ${errors.map(e => e.message).join(', ')}`);
  }

  async updateSecret(secretName: string, value: string): Promise<void> {
    // Clear cache
    const cacheKeys = Array.from(this.cache.keys()).filter(key => key.startsWith(secretName));
    for (const key of cacheKeys) {
      this.cache.delete(key);
    }

    const errors: Error[] = [];
    
    for (const provider of this.providers) {
      try {
        await provider.updateSecret(secretName, value);
        return; // Success on first provider
      } catch (error) {
        errors.push(error as Error);
      }
    }
    
    throw new Error(`Failed to update secret on all providers: ${errors.map(e => e.message).join(', ')}`);
  }

  async rotateSecret(secretName: string): Promise<string> {
    // Clear cache
    const cacheKeys = Array.from(this.cache.keys()).filter(key => key.startsWith(secretName));
    for (const key of cacheKeys) {
      this.cache.delete(key);
    }

    const errors: Error[] = [];
    
    for (const provider of this.providers) {
      try {
        return await provider.rotateSecret(secretName);
      } catch (error) {
        errors.push(error as Error);
      }
    }
    
    throw new Error(`Failed to rotate secret on all providers: ${errors.map(e => e.message).join(', ')}`);
  }

  clearCache(): void {
    this.cache.clear();
  }

  setCacheTtl(ttl: number): void {
    this.cacheTtl = ttl;
  }
}

/**
 * Configuration-aware secret retrieval
 */
export async function getConfigSecret(secretName: string, fallbackValue?: string): Promise<string> {
  // Try environment variable first
  const envValue = process.env[secretName];
  if (envValue) {
    return envValue;
  }

  // Try file-based secrets if enabled
  if (process.env.SECRETS_FILE) {
    try {
      const fileProvider = new FileSecretProvider({ 
        provider: 'file', 
        filePath: process.env.SECRETS_FILE 
      });
      const secret = await fileProvider.getSecret(secretName);
      return secret.value;
    } catch {
      // Continue to fallback
    }
  }

  // Use fallback value if provided
  if (fallbackValue !== undefined) {
    return fallbackValue;
  }

  throw new Error(`Secret ${secretName} not found and no fallback provided`);
}

/**
 * Batch secret retrieval
 */
export async function getConfigSecrets(secretNames: string[]): Promise<Record<string, string>> {
  const secrets: Record<string, string> = {};
  
  await Promise.allSettled(
    secretNames.map(async (name) => {
      try {
        secrets[name] = await getConfigSecret(name);
      } catch (error) {
        console.warn(`Failed to get secret ${name}:`, error);
      }
    })
  );
  
  return secrets;
}

/**
 * Secret validation for configuration
 */
export async function validateSecrets(requiredSecrets: string[]): Promise<{
  valid: boolean;
  missing: string[];
  errors: string[];
}> {
  const missing: string[] = [];
  const errors: string[] = [];
  
  for (const secretName of requiredSecrets) {
    try {
      await getConfigSecret(secretName);
    } catch (error) {
      missing.push(secretName);
      errors.push(`${secretName}: ${(error as Error).message}`);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
    errors,
  };
}

// Export utilities
export const secretManager = {
  createSecretProvider,
  SecretManager,
  getConfigSecret,
  getConfigSecrets,
  validateSecrets,
};

export default secretManager;