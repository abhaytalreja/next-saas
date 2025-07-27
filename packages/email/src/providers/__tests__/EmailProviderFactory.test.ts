import { EmailProviderFactory } from '../base/provider-factory';
import { ResendEmailSender } from '../resend/resend-sender';
import { SendGridClient } from '../sendgrid/sendgrid-client';

describe('EmailProviderFactory', () => {
  describe('createProviders', () => {
    it('should create providers with valid configuration', () => {
      const config = {
        resend: { apiKey: 'resend-key' },
        sendgrid: { apiKey: 'sendgrid-key' },
      };

      const providers = EmailProviderFactory.createProviders(config);

      expect(providers.size).toBe(2);
      expect(providers.has('resend')).toBe(true);
      expect(providers.has('sendgrid')).toBe(true);
      expect(providers.get('resend')).toBeInstanceOf(ResendEmailSender);
      expect(providers.get('sendgrid')).toBeInstanceOf(SendGridClient);
    });

    it('should create only Resend provider when SendGrid not configured', () => {
      const config = {
        resend: { apiKey: 'resend-key' },
      };

      const providers = EmailProviderFactory.createProviders(config);

      expect(providers.size).toBe(1);
      expect(providers.has('resend')).toBe(true);
      expect(providers.has('sendgrid')).toBe(false);
    });

    it('should create only SendGrid provider when Resend not configured', () => {
      const config = {
        sendgrid: { apiKey: 'sendgrid-key' },
      };

      const providers = EmailProviderFactory.createProviders(config);

      expect(providers.size).toBe(1);
      expect(providers.has('sendgrid')).toBe(true);
      expect(providers.has('resend')).toBe(false);
    });

    it('should throw error when no providers configured', () => {
      const config = {};

      expect(() => EmailProviderFactory.createProviders(config))
        .toThrow('At least one email provider must be configured');
    });

    it('should skip providers with missing API keys', () => {
      const config = {
        resend: { apiKey: 'resend-key' },
        sendgrid: {}, // Missing API key
      };

      const providers = EmailProviderFactory.createProviders(config);

      expect(providers.size).toBe(1);
      expect(providers.has('resend')).toBe(true);
      expect(providers.has('sendgrid')).toBe(false);
    });

    it('should handle provider creation errors gracefully', () => {
      // Mock ResendProvider to throw an error
      jest.spyOn(ResendProvider.prototype, 'constructor' as any).mockImplementation(() => {
        throw new Error('Provider initialization failed');
      });

      const config = {
        resend: { apiKey: 'resend-key' },
        sendgrid: { apiKey: 'sendgrid-key' },
      };

      const providers = EmailProviderFactory.createProviders(config);

      // Should still create SendGrid provider
      expect(providers.size).toBe(1);
      expect(providers.has('sendgrid')).toBe(true);
      expect(providers.has('resend')).toBe(false);

      // Restore the mock
      jest.restoreAllMocks();
    });
  });

  describe('createProvider', () => {
    it('should create Resend provider with valid configuration', () => {
      const provider = EmailProviderFactory.createProvider('resend', { apiKey: 'test-key' });
      expect(provider).toBeInstanceOf(ResendProvider);
    });

    it('should create SendGrid provider with valid configuration', () => {
      const provider = EmailProviderFactory.createProvider('sendgrid', { apiKey: 'test-key' });
      expect(provider).toBeInstanceOf(SendGridProvider);
    });

    it('should throw error for unknown provider', () => {
      expect(() => EmailProviderFactory.createProvider('unknown' as any, { apiKey: 'test-key' }))
        .toThrow('Unknown email provider: unknown');
    });

    it('should throw error for missing API key', () => {
      expect(() => EmailProviderFactory.createProvider('resend', {}))
        .toThrow('Resend API key is required');
    });
  });

  describe('getRecommendedProvider', () => {
    it('should recommend Resend for transactional emails', () => {
      const providers = new Map([
        ['resend', new ResendProvider({ apiKey: 'resend-key' })],
        ['sendgrid', new SendGridProvider({ apiKey: 'sendgrid-key' })],
      ]);

      const recommended = EmailProviderFactory.getRecommendedProvider(providers, 'transactional');
      expect(recommended?.name).toBe('resend');
    });

    it('should recommend SendGrid for marketing emails', () => {
      const providers = new Map([
        ['resend', new ResendProvider({ apiKey: 'resend-key' })],
        ['sendgrid', new SendGridProvider({ apiKey: 'sendgrid-key' })],
      ]);

      const recommended = EmailProviderFactory.getRecommendedProvider(providers, 'marketing');
      expect(recommended?.name).toBe('sendgrid');
    });

    it('should return first available provider when type not specified', () => {
      const providers = new Map([
        ['sendgrid', new SendGridProvider({ apiKey: 'sendgrid-key' })],
      ]);

      const recommended = EmailProviderFactory.getRecommendedProvider(providers);
      expect(recommended?.name).toBe('sendgrid');
    });

    it('should return null when no providers available', () => {
      const providers = new Map();
      const recommended = EmailProviderFactory.getRecommendedProvider(providers);
      expect(recommended).toBeNull();
    });

    it('should fallback to any provider when preferred not available', () => {
      const providers = new Map([
        ['sendgrid', new SendGridProvider({ apiKey: 'sendgrid-key' })],
      ]);

      // Request transactional (prefers Resend) but only SendGrid available
      const recommended = EmailProviderFactory.getRecommendedProvider(providers, 'transactional');
      expect(recommended?.name).toBe('sendgrid');
    });
  });

  describe('edge cases', () => {
    it('should handle empty provider configuration', () => {
      const config = {
        resend: null,
        sendgrid: undefined,
      };

      expect(() => EmailProviderFactory.createProviders(config as any))
        .toThrow('At least one email provider must be configured');
    });

    it('should handle malformed provider configuration', () => {
      const config = {
        resend: 'invalid-config',
        sendgrid: { apiKey: 'valid-key' },
      };

      const providers = EmailProviderFactory.createProviders(config as any);
      
      // Should only create SendGrid provider
      expect(providers.size).toBe(1);
      expect(providers.has('sendgrid')).toBe(true);
    });
  });
});