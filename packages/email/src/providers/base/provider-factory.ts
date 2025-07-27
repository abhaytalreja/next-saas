import { BaseEmailProvider } from './email-provider';
import { ResendProvider } from '../resend/resend-client';
import { SendGridProvider } from '../sendgrid/sendgrid-client';
import { 
  EmailProviderConfig, 
  ProviderName,
  EmailProvider as IEmailProvider
} from '../../types';

export interface ProviderConfigs {
  resend?: EmailProviderConfig;
  sendgrid?: EmailProviderConfig;
  ses?: EmailProviderConfig;
  postmark?: EmailProviderConfig;
  mailgun?: EmailProviderConfig;
}

export class EmailProviderFactory {
  private static providers: Map<ProviderName, typeof BaseEmailProvider> = new Map([
    ['resend', ResendProvider as any],
    ['sendgrid', SendGridProvider as any],
  ]);

  private static instances: Map<string, BaseEmailProvider> = new Map();

  /**
   * Register a new email provider class
   */
  static registerProvider(name: ProviderName, providerClass: typeof BaseEmailProvider): void {
    this.providers.set(name, providerClass);
  }

  /**
   * Create or get existing provider instance
   */
  static createProvider(name: ProviderName, config: EmailProviderConfig): BaseEmailProvider {
    const cacheKey = `${name}-${JSON.stringify(config)}`;
    
    if (this.instances.has(cacheKey)) {
      return this.instances.get(cacheKey)!;
    }

    const ProviderClass = this.providers.get(name);
    if (!ProviderClass) {
      throw new Error(`Email provider '${name}' is not supported`);
    }

    const instance = new ProviderClass(config);
    this.instances.set(cacheKey, instance);
    
    return instance;
  }

  /**
   * Create multiple provider instances from configs
   */
  static createProviders(configs: ProviderConfigs): Map<ProviderName, BaseEmailProvider> {
    const providers = new Map<ProviderName, BaseEmailProvider>();

    for (const [name, config] of Object.entries(configs)) {
      if (config && this.isValidProviderName(name)) {
        try {
          const provider = this.createProvider(name as ProviderName, config);
          providers.set(name as ProviderName, provider);
        } catch (error) {
          console.error(`Failed to create provider ${name}:`, error);
        }
      }
    }

    return providers;
  }

  /**
   * Get available provider names
   */
  static getAvailableProviders(): ProviderName[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if provider is supported
   */
  static isProviderSupported(name: string): boolean {
    return this.providers.has(name as ProviderName);
  }

  /**
   * Validate provider configuration
   */
  static validateConfig(name: ProviderName, config: EmailProviderConfig): boolean {
    if (!config.apiKey) {
      throw new Error(`API key is required for ${name} provider`);
    }

    switch (name) {
      case 'resend':
        return this.validateResendConfig(config);
      case 'sendgrid':
        return this.validateSendGridConfig(config);
      default:
        return true;
    }
  }

  /**
   * Get provider recommendations based on requirements
   */
  static getRecommendedProviders(requirements: {
    emailType?: 'transactional' | 'marketing';
    volume?: number;
    features?: string[];
    budget?: number;
  }): ProviderName[] {
    const recommendations: Array<{ name: ProviderName; score: number }> = [];

    for (const name of this.getAvailableProviders()) {
      let score = 0;

      // Score based on email type
      if (requirements.emailType === 'transactional') {
        if (name === 'resend') score += 10;
        if (name === 'sendgrid') score += 8;
      } else if (requirements.emailType === 'marketing') {
        if (name === 'sendgrid') score += 10;
        if (name === 'resend') score += 6;
      }

      // Score based on volume
      if (requirements.volume) {
        if (requirements.volume > 100000) {
          if (name === 'sendgrid') score += 8;
          if (name === 'resend') score += 6;
        } else {
          if (name === 'resend') score += 8;
          if (name === 'sendgrid') score += 6;
        }
      }

      // Score based on features
      if (requirements.features) {
        if (requirements.features.includes('templates') && name === 'resend') score += 5;
        if (requirements.features.includes('analytics') && name === 'sendgrid') score += 5;
        if (requirements.features.includes('automation') && name === 'sendgrid') score += 5;
      }

      // Score based on budget (cost per email)
      if (requirements.budget) {
        if (name === 'resend' && requirements.budget < 0.0002) score += 5;
        if (name === 'sendgrid' && requirements.budget >= 0.0002) score += 5;
      }

      if (score > 0) {
        recommendations.push({ name, score });
      }
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .map(r => r.name);
  }

  /**
   * Clear provider instances cache
   */
  static clearCache(): void {
    this.instances.clear();
  }

  /**
   * Get provider instance from cache
   */
  static getCachedProvider(name: ProviderName, config: EmailProviderConfig): BaseEmailProvider | null {
    const cacheKey = `${name}-${JSON.stringify(config)}`;
    return this.instances.get(cacheKey) || null;
  }

  private static isValidProviderName(name: string): name is ProviderName {
    return this.providers.has(name as ProviderName);
  }

  private static validateResendConfig(config: EmailProviderConfig): boolean {
    if (!config.apiKey.startsWith('re_')) {
      throw new Error('Invalid Resend API key format');
    }
    return true;
  }

  private static validateSendGridConfig(config: EmailProviderConfig): boolean {
    if (!config.apiKey.startsWith('SG.')) {
      throw new Error('Invalid SendGrid API key format');
    }
    return true;
  }
}

// Helper function to create provider factory with type safety
export function createEmailProviders(configs: ProviderConfigs): Map<ProviderName, BaseEmailProvider> {
  return EmailProviderFactory.createProviders(configs);
}

// Helper function to get recommended provider
export function getRecommendedProvider(
  configs: ProviderConfigs,
  requirements: Parameters<typeof EmailProviderFactory.getRecommendedProviders>[0]
): BaseEmailProvider | null {
  const recommended = EmailProviderFactory.getRecommendedProviders(requirements);
  
  for (const providerName of recommended) {
    const config = configs[providerName];
    if (config) {
      return EmailProviderFactory.createProvider(providerName, config);
    }
  }
  
  return null;
}