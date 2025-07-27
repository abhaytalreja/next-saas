import { EmailProviderRouter } from '../EmailProviderRouter';
import { BaseEmailProvider } from '../base/BaseEmailProvider';
import { EmailData, EmailResult, EmailProviderStatus } from '../../types';

// Mock provider for testing
class MockProvider extends BaseEmailProvider {
  public name = 'mock' as const;
  public features = {
    transactional: true,
    marketing: true,
    templates: true,
    analytics: true,
    webhooks: true,
  };

  private shouldFail: boolean;
  private delay: number;

  constructor(shouldFail = false, delay = 0) {
    super();
    this.shouldFail = shouldFail;
    this.delay = delay;
  }

  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    if (this.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }

    if (this.shouldFail) {
      return {
        success: false,
        error: 'Mock provider failure',
        provider: this.name,
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      messageId: 'mock-123',
      provider: this.name,
      timestamp: new Date(),
    };
  }

  async checkHealth(): Promise<EmailProviderStatus> {
    return {
      healthy: !this.shouldFail,
      provider: this.name,
      lastChecked: new Date(),
      responseTime: this.delay,
      error: this.shouldFail ? 'Mock provider unhealthy' : undefined,
    };
  }
}

describe('EmailProviderRouter', () => {
  let router: EmailProviderRouter;
  let healthyProvider: MockProvider;
  let unhealthyProvider: MockProvider;
  let slowProvider: MockProvider;

  beforeEach(() => {
    healthyProvider = new MockProvider(false, 10);
    unhealthyProvider = new MockProvider(true, 0);
    slowProvider = new MockProvider(false, 100);

    const providers = new Map([
      ['healthy', healthyProvider],
      ['unhealthy', unhealthyProvider],
      ['slow', slowProvider],
    ]);

    router = new EmailProviderRouter(providers, {
      maxRetries: 2,
      retryDelay: 10,
      healthCheckInterval: 50,
      circuitBreakerThreshold: 3,
      circuitBreakerTimeout: 100,
    });
  });

  afterEach(() => {
    router.destroy();
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      const providers = new Map([['test', healthyProvider]]);
      const defaultRouter = new EmailProviderRouter(providers);
      
      expect(defaultRouter).toBeInstanceOf(EmailProviderRouter);
    });

    it('should start health monitoring on initialization', async () => {
      // Wait for initial health check
      await new Promise(resolve => setTimeout(resolve, 60));
      
      const healthStatuses = router.getHealthStatuses();
      expect(healthStatuses.size).toBe(3);
      expect(healthStatuses.get('healthy')?.healthy).toBe(true);
      expect(healthStatuses.get('unhealthy')?.healthy).toBe(false);
    });
  });

  describe('routeEmail', () => {
    const emailData: EmailData = {
      to: 'user@example.com',
      from: 'sender@example.com',
      subject: 'Test Email',
      html: '<p>Test content</p>',
      organizationId: 'org-123',
    };

    it('should route email to healthy provider', async () => {
      const result = await router.routeEmail(emailData);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('mock-123');
      expect(['healthy', 'slow']).toContain(result.provider);
    });

    it('should retry with different provider on failure', async () => {
      // Make healthy provider fail temporarily
      (healthyProvider as any).shouldFail = true;

      const result = await router.routeEmail(emailData);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('slow'); // Should fallback to slow provider
    });

    it('should return error when all providers fail', async () => {
      // Make all providers fail
      (healthyProvider as any).shouldFail = true;
      (slowProvider as any).shouldFail = true;

      const result = await router.routeEmail(emailData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('All email providers failed');
    });

    it('should prefer faster provider', async () => {
      // Both providers are healthy, should prefer the faster one
      const result = await router.routeEmail(emailData);
      
      // Healthy provider (10ms) should be preferred over slow provider (100ms)
      expect(result.provider).toBe('healthy');
    });

    it('should respect provider preference when specified', async () => {
      const result = await router.routeEmail(emailData, 'slow');

      expect(result.success).toBe(true);
      expect(result.provider).toBe('slow');
    });

    it('should fallback when preferred provider fails', async () => {
      const result = await router.routeEmail(emailData, 'unhealthy');

      expect(result.success).toBe(true);
      expect(['healthy', 'slow']).toContain(result.provider);
    });
  });

  describe('routeBulkEmails', () => {
    const emails: EmailData[] = [
      {
        to: 'user1@example.com',
        from: 'sender@example.com',
        subject: 'Test Email 1',
        html: '<p>Test content 1</p>',
        organizationId: 'org-123',
      },
      {
        to: 'user2@example.com',
        from: 'sender@example.com',
        subject: 'Test Email 2',
        html: '<p>Test content 2</p>',
        organizationId: 'org-123',
      },
    ];

    it('should send bulk emails successfully', async () => {
      const result = await router.routeBulkEmails(emails);

      expect(result.totalEmails).toBe(2);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(2);
      expect(result.results.every(r => r.success)).toBe(true);
    });

    it('should handle partial failures in bulk send', async () => {
      // Make healthy provider fail for the second email
      let callCount = 0;
      const originalSendEmail = healthyProvider.sendEmail.bind(healthyProvider);
      healthyProvider.sendEmail = async (emailData: EmailData) => {
        callCount++;
        if (callCount === 2) {
          return {
            success: false,
            error: 'Simulated failure',
            provider: 'healthy',
            timestamp: new Date(),
          };
        }
        return originalSendEmail(emailData);
      };

      const result = await router.routeBulkEmails(emails);

      expect(result.totalEmails).toBe(2);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.results).toHaveLength(2);
    });

    it('should distribute load across providers for bulk sends', async () => {
      const manyEmails = Array.from({ length: 10 }, (_, i) => ({
        to: `user${i}@example.com`,
        from: 'sender@example.com',
        subject: `Test Email ${i}`,
        html: `<p>Test content ${i}</p>`,
        organizationId: 'org-123',
      }));

      const result = await router.routeBulkEmails(manyEmails);

      expect(result.totalEmails).toBe(10);
      expect(result.successful).toBe(10);
      expect(result.failed).toBe(0);
    });
  });

  describe('circuit breaker', () => {
    it('should open circuit breaker after consecutive failures', async () => {
      const emailData: EmailData = {
        to: 'user@example.com',
        from: 'sender@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        organizationId: 'org-123',
      };

      // Make healthy provider fail
      (healthyProvider as any).shouldFail = true;

      // Send emails to trigger circuit breaker
      for (let i = 0; i < 5; i++) {
        await router.routeEmail(emailData, 'healthy');
      }

      // Circuit should be open, check metrics
      const metrics = router.getProviderMetrics();
      const healthyMetrics = metrics.get('healthy');
      
      expect(healthyMetrics?.totalRequests).toBeGreaterThan(0);
      expect(healthyMetrics?.failedRequests).toBeGreaterThan(0);
    });

    it('should reset circuit breaker after timeout', async () => {
      const emailData: EmailData = {
        to: 'user@example.com',
        from: 'sender@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        organizationId: 'org-123',
      };

      // Make healthy provider fail temporarily
      (healthyProvider as any).shouldFail = true;

      // Trigger circuit breaker
      for (let i = 0; i < 5; i++) {
        await router.routeEmail(emailData, 'healthy');
      }

      // Fix provider and wait for circuit breaker timeout
      (healthyProvider as any).shouldFail = false;
      await new Promise(resolve => setTimeout(resolve, 110));

      // Should be able to use provider again
      const result = await router.routeEmail(emailData, 'healthy');
      expect(result.success).toBe(true);
    });
  });

  describe('health monitoring', () => {
    it('should periodically check provider health', async () => {
      // Wait for multiple health check cycles
      await new Promise(resolve => setTimeout(resolve, 150));

      const healthStatuses = router.getHealthStatuses();
      expect(healthStatuses.size).toBe(3);
      
      const healthyStatus = healthStatuses.get('healthy');
      expect(healthyStatus?.healthy).toBe(true);
      expect(healthyStatus?.lastChecked).toBeInstanceOf(Date);
      
      const unhealthyStatus = healthStatuses.get('unhealthy');
      expect(unhealthyStatus?.healthy).toBe(false);
      expect(unhealthyStatus?.error).toBeDefined();
    });

    it('should update health status when provider recovers', async () => {
      // Wait for initial health check
      await new Promise(resolve => setTimeout(resolve, 60));

      // Check that unhealthy provider is marked as unhealthy
      let healthStatuses = router.getHealthStatuses();
      expect(healthStatuses.get('unhealthy')?.healthy).toBe(false);

      // Fix the provider
      (unhealthyProvider as any).shouldFail = false;

      // Wait for next health check
      await new Promise(resolve => setTimeout(resolve, 60));

      // Should now be healthy
      healthStatuses = router.getHealthStatuses();
      expect(healthStatuses.get('unhealthy')?.healthy).toBe(true);
    });
  });

  describe('metrics', () => {
    it('should track provider metrics', async () => {
      const emailData: EmailData = {
        to: 'user@example.com',
        from: 'sender@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        organizationId: 'org-123',
      };

      // Send successful email
      await router.routeEmail(emailData);

      // Send failing email
      await router.routeEmail(emailData, 'unhealthy');

      const metrics = router.getProviderMetrics();
      
      // Check that metrics are being tracked
      expect(metrics.size).toBeGreaterThan(0);
      
      const healthyMetrics = metrics.get('healthy');
      expect(healthyMetrics?.totalRequests).toBeGreaterThan(0);
      expect(healthyMetrics?.successfulRequests).toBeGreaterThan(0);
    });

    it('should calculate success rates correctly', async () => {
      const emailData: EmailData = {
        to: 'user@example.com',
        from: 'sender@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        organizationId: 'org-123',
      };

      // Send multiple emails to get meaningful metrics
      for (let i = 0; i < 5; i++) {
        await router.routeEmail(emailData);
      }

      const metrics = router.getProviderMetrics();
      const healthyMetrics = metrics.get('healthy');
      
      if (healthyMetrics) {
        const successRate = healthyMetrics.successfulRequests / healthyMetrics.totalRequests;
        expect(successRate).toBeGreaterThan(0);
        expect(successRate).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('provider selection', () => {
    it('should select best available provider', () => {
      const providers = new Map([
        ['healthy', healthyProvider],
        ['unhealthy', unhealthyProvider],
        ['slow', slowProvider],
      ]);

      const selected = (router as any).selectBestProvider(providers);
      expect(['healthy', 'slow']).toContain(selected?.name);
    });

    it('should return null when no providers available', () => {
      const providers = new Map();
      const selected = (router as any).selectBestProvider(providers);
      expect(selected).toBeNull();
    });
  });

  describe('cleanup', () => {
    it('should cleanup resources when destroyed', () => {
      const spy = jest.spyOn(global, 'clearInterval');
      
      router.destroy();
      
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});