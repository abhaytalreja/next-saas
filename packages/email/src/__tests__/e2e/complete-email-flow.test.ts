/**
 * End-to-End tests for complete email workflows
 * Tests the entire email system integration from campaign creation to analytics
 */

import { EmailService } from '../../services/email-service';
import { CampaignManager } from '../../campaigns/CampaignManager';
import { EmailAnalytics } from '../../analytics/EmailAnalytics';
import { AudienceService } from '../../campaigns/AudienceService';
import { WebhookManager } from '../../webhooks/WebhookManager';
import { EmailTester } from '../../testing/EmailTester';
import { SubscriptionManager } from '../../compliance/SubscriptionManager';

// Mock external services but test real integration
jest.mock('resend');
jest.mock('@sendgrid/mail');

// Test database interface
class TestDatabase {
  private data: Map<string, any[]> = new Map();
  private lastId = 1;

  async query(sql: string, params: any[] = []): Promise<any[]> {
    // Simple mock implementation for testing
    if (sql.includes('COUNT(*)')) {
      if (sql.includes('audiences')) return [{ count: 100 }];
      if (sql.includes('email_events')) {
        if (sql.includes("eventType = 'sent'")) return [{ count: 1000 }];
        if (sql.includes("eventType = 'delivered'")) return [{ count: 950 }];
        if (sql.includes("eventType = 'opened'")) return [{ count: 400 }];
        if (sql.includes("eventType = 'clicked'")) return [{ count: 150 }];
        return [{ count: 0 }];
      }
    }
    
    if (sql.includes('SELECT email FROM users')) {
      return [
        { email: 'user1@example.com' },
        { email: 'user2@example.com' },
        { email: 'user3@example.com' },
        { email: 'user4@example.com' },
        { email: 'user5@example.com' },
      ];
    }

    return this.data.get('default') || [];
  }

  async insert(table: string, data: any): Promise<any> {
    const id = `${table}-${this.lastId++}`;
    const record = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
    
    if (!this.data.has(table)) {
      this.data.set(table, []);
    }
    this.data.get(table)!.push(record);
    
    return record;
  }

  async update(table: string, id: string, data: any): Promise<any> {
    const records = this.data.get(table) || [];
    const index = records.findIndex(r => r.id === id);
    
    if (index === -1) return null;
    
    records[index] = { ...records[index], ...data, updatedAt: new Date() };
    return records[index];
  }

  async delete(table: string, id: string): Promise<boolean> {
    const records = this.data.get(table) || [];
    const index = records.findIndex(r => r.id === id);
    
    if (index === -1) return false;
    
    records.splice(index, 1);
    return true;
  }
}

describe('Complete Email Flow E2E Tests', () => {
  let emailService: EmailService;
  let campaignManager: CampaignManager;
  let emailAnalytics: EmailAnalytics;
  let audienceService: AudienceService;
  let webhookManager: WebhookManager;
  let emailTester: EmailTester;
  let subscriptionManager: SubscriptionManager;
  let testDatabase: TestDatabase;

  beforeEach(() => {
    // Initialize test database
    testDatabase = new TestDatabase();

    // Initialize all services with real integrations
    emailService = new EmailService({
      providers: {
        resend: { apiKey: 'test-resend-key' },
        sendgrid: { apiKey: 'test-sendgrid-key' },
      },
      defaultFrom: 'noreply@testcorp.com',
    });

    emailAnalytics = new EmailAnalytics(testDatabase as any);
    audienceService = new AudienceService(testDatabase as any);
    subscriptionManager = new SubscriptionManager(testDatabase as any);
    campaignManager = new CampaignManager(emailService, emailAnalytics, audienceService);
    webhookManager = new WebhookManager(emailAnalytics);
    emailTester = new EmailTester(emailService, emailAnalytics);

    // Setup successful provider mocks
    setupProviderMocks();
    
    jest.clearAllMocks();
  });

  function setupProviderMocks() {
    // Mock Resend
    const mockResendClient = {
      emails: {
        send: jest.fn().mockResolvedValue({
          data: { id: 'resend-msg-123' },
          error: null,
        }),
      },
    };
    require('resend').Resend.mockImplementation(() => mockResendClient);

    // Mock SendGrid
    const mockSendGrid = require('@sendgrid/mail');
    mockSendGrid.send.mockResolvedValue([{
      statusCode: 202,
      headers: { 'x-message-id': 'sendgrid-msg-123' },
    }]);
  }

  describe('Complete Marketing Campaign Flow', () => {
    it('should execute a complete marketing campaign from creation to analytics', async () => {
      // Step 1: Create an audience
      const audience = await audienceService.createAudience({
        name: 'Premium Subscribers',
        organizationId: 'org-123',
        description: 'All premium tier subscribers',
        filters: [
          {
            field: 'subscription_tier',
            operator: 'equals',
            value: 'premium',
          },
          {
            field: 'email_verified',
            operator: 'equals',
            value: true,
          },
        ],
      });

      expect(audience.id).toBeDefined();
      expect(audience.name).toBe('Premium Subscribers');
      expect(audience.size).toBe(100);

      // Step 2: Create and test email template
      const templateTest = await emailTester.createTest({
        name: 'Newsletter Template Test',
        templateId: 'newsletter',
        testType: 'spam_check',
        testEmails: ['test@example.com'],
        templateVariables: {
          companyName: 'TestCorp',
          firstName: 'John',
          newsletterContent: 'Monthly updates and product news',
        },
        createdBy: 'user-123',
        organizationId: 'org-123',
      });

      const testResults = await emailTester.runTest(templateTest.id);
      expect(testResults.spamScore).toBeLessThan(50); // Ensure low spam score

      // Step 3: Create marketing campaign
      const campaign = await campaignManager.createCampaign({
        name: 'Monthly Newsletter - January 2024',
        organizationId: 'org-123',
        templateId: 'newsletter',
        subject: 'Your Monthly Update from TestCorp',
        audienceId: audience.id,
        type: 'standard',
        status: 'draft',
        scheduledAt: new Date(Date.now() + 3600000), // 1 hour from now
        templateVariables: {
          companyName: 'TestCorp',
          month: 'January',
          year: '2024',
          newsletterContent: 'Exciting product updates and company news',
        },
        sendingConfig: {
          sendRate: 500, // 500 emails per hour
          batchSize: 50,
        },
        trackingConfig: {
          trackOpens: true,
          trackClicks: true,
          trackUnsubscribes: true,
        },
      });

      expect(campaign.id).toBeDefined();
      expect(campaign.name).toBe('Monthly Newsletter - January 2024');
      expect(campaign.audienceCount).toBe(100);

      // Step 4: Execute the campaign
      const execution = await campaignManager.executeCampaign(campaign.id);

      expect(execution.campaignId).toBe(campaign.id);
      expect(execution.status).toBe('completed');
      expect(execution.totalRecipients).toBe(5); // Based on our mock data
      expect(execution.successfulSends).toBe(5);
      expect(execution.failedSends).toBe(0);

      // Step 5: Simulate webhook events (email delivery, opens, clicks)
      const webhookEvents = [
        // Delivery confirmations
        {
          type: 'email.delivered',
          created_at: new Date().toISOString(),
          data: {
            email_id: 'resend-msg-123',
            to: 'user1@example.com',
            campaign_id: campaign.id,
          },
        },
        // Email opens
        {
          type: 'email.opened',
          created_at: new Date(Date.now() + 300000).toISOString(), // 5 min later
          data: {
            email_id: 'resend-msg-123',
            to: 'user1@example.com',
            user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
            ip: '192.168.1.100',
            campaign_id: campaign.id,
          },
        },
        // Email clicks
        {
          type: 'email.clicked',
          created_at: new Date(Date.now() + 600000).toISOString(), // 10 min later
          data: {
            email_id: 'resend-msg-123',
            to: 'user1@example.com',
            link: {
              url: 'https://testcorp.com/product-updates',
            },
            campaign_id: campaign.id,
          },
        },
      ];

      // Process webhook events
      for (const event of webhookEvents) {
        const result = await webhookManager.processResendWebhook(
          event,
          'webhook-signature',
          { verifySignature: false }
        );
        expect(result.success).toBe(true);
      }

      // Step 6: Retrieve and verify analytics
      const campaignMetrics = await campaignManager.getCampaignMetrics(campaign.id);

      expect(campaignMetrics).toEqual({
        campaignId: campaign.id,
        totalSent: 1000,
        delivered: 950,
        bounced: 50,
        opened: 400,
        clicked: 150,
        unsubscribed: 0,
        complained: 0,
        deliveryRate: 0.95,
        openRate: 0.421,
        clickRate: 0.375,
        unsubscribeRate: 0,
        complaintRate: 0,
        clickThroughRate: 0.158,
        revenue: 0,
        conversionRate: 0,
        lastUpdated: expect.any(Date),
      });

      // Step 7: Verify organization-wide metrics
      const orgMetrics = await emailAnalytics.getOrganizationMetrics('org-123');
      expect(orgMetrics.totalSent).toBeGreaterThan(0);
      expect(orgMetrics.deliveryRate).toBeGreaterThan(0.9);
    });
  });

  describe('A/B Testing Campaign Flow', () => {
    it('should execute complete A/B testing workflow', async () => {
      // Create audience for A/B testing
      const audience = await audienceService.createAudience({
        name: 'A/B Test Audience',
        organizationId: 'org-123',
        description: 'Audience for testing email variations',
        filters: [
          {
            field: 'segment',
            operator: 'equals',
            value: 'active_users',
          },
        ],
      });

      // Create A/B test campaign
      const abCampaign = await campaignManager.createCampaign({
        name: 'Product Launch A/B Test',
        organizationId: 'org-123',
        templateId: 'product-launch',
        subject: 'Introducing Our New Product', // Default subject
        audienceId: audience.id,
        type: 'ab_test',
        status: 'draft',
        scheduledAt: new Date(),
        templateVariables: {
          productName: 'TestProduct Pro',
          launchDate: '2024-02-01',
        },
        sendingConfig: {
          sendRate: 1000,
          batchSize: 100,
        },
        trackingConfig: {
          trackOpens: true,
          trackClicks: true,
          trackUnsubscribes: true,
        },
        abTestConfig: {
          enabled: true,
          variants: [
            {
              name: 'Variant A - Benefit Focused',
              percentage: 50,
              subject: 'Boost Your Productivity with TestProduct Pro',
              templateVariables: {
                headline: 'Increase Your Productivity by 300%',
                ctaText: 'Start Boosting Productivity',
              },
            },
            {
              name: 'Variant B - Feature Focused',
              percentage: 50,
              subject: 'Discover TestProduct Pro\'s Advanced Features',
              templateVariables: {
                headline: 'Advanced Features for Power Users',
                ctaText: 'Explore Advanced Features',
              },
            },
          ],
          winnerCriteria: 'click_rate',
          testDuration: 24,
          winnerPercentage: 80,
        },
      });

      // Execute A/B test campaign
      const execution = await campaignManager.executeCampaign(abCampaign.id);

      expect(execution.status).toBe('completed');
      expect(execution.abTestResults).toBeDefined();
      expect(execution.abTestResults?.variants).toHaveLength(2);

      // Verify variant distribution
      const variantA = execution.abTestResults?.variants.find(v => v.name === 'Variant A - Benefit Focused');
      const variantB = execution.abTestResults?.variants.find(v => v.name === 'Variant B - Feature Focused');

      expect(variantA).toBeDefined();
      expect(variantB).toBeDefined();
      expect(variantA?.recipientCount + variantB?.recipientCount).toBe(execution.totalRecipients);

      // Simulate different engagement rates for variants
      const variantAWebhookEvents = [
        {
          type: 'email.opened',
          created_at: new Date().toISOString(),
          data: {
            email_id: 'variant-a-msg-1',
            to: 'user1@example.com',
            campaign_id: abCampaign.id,
            variant: 'A',
          },
        },
        {
          type: 'email.clicked',
          created_at: new Date().toISOString(),
          data: {
            email_id: 'variant-a-msg-1',
            to: 'user1@example.com',
            link: { url: 'https://testcorp.com/signup' },
            campaign_id: abCampaign.id,
            variant: 'A',
          },
        },
      ];

      const variantBWebhookEvents = [
        {
          type: 'email.opened',
          created_at: new Date().toISOString(),
          data: {
            email_id: 'variant-b-msg-1',
            to: 'user2@example.com',
            campaign_id: abCampaign.id,
            variant: 'B',
          },
        },
        // No click for variant B to simulate lower click rate
      ];

      // Process webhook events for both variants
      for (const event of [...variantAWebhookEvents, ...variantBWebhookEvents]) {
        await webhookManager.processResendWebhook(
          event,
          'signature',
          { verifySignature: false }
        );
      }

      // Verify A/B test results show different performance
      const finalMetrics = await campaignManager.getCampaignMetrics(abCampaign.id);
      expect(finalMetrics.clickRate).toBeGreaterThan(0);
    });
  });

  describe('Transactional Email Flow', () => {
    it('should handle transactional emails with real-time processing', async () => {
      // Test welcome email flow
      const welcomeEmailData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        organizationName: 'TestCorp',
        organizationId: 'org-123',
        verificationUrl: 'https://testcorp.com/verify?token=abc123',
        ctaUrl: 'https://testcorp.com/dashboard',
        ctaText: 'Get Started',
      };

      // Send welcome email
      const welcomeResult = await emailService.sendWelcomeEmail(
        welcomeEmailData.email,
        welcomeEmailData
      );

      expect(welcomeResult.success).toBe(true);
      expect(welcomeResult.messageId).toBeDefined();
      expect(welcomeResult.provider).toBeDefined();

      // Send verification email
      const verificationResult = await emailService.sendVerificationEmail(
        welcomeEmailData.email,
        {
          firstName: welcomeEmailData.firstName,
          verificationUrl: welcomeEmailData.verificationUrl,
          organizationName: welcomeEmailData.organizationName,
          organizationId: welcomeEmailData.organizationId,
          expiresIn: '24 hours',
        }
      );

      expect(verificationResult.success).toBe(true);

      // Test password reset flow
      const passwordResetResult = await emailService.sendPasswordResetEmail(
        welcomeEmailData.email,
        {
          firstName: welcomeEmailData.firstName,
          resetUrl: 'https://testcorp.com/reset?token=xyz789',
          organizationName: welcomeEmailData.organizationName,
          organizationId: welcomeEmailData.organizationId,
          expiresIn: '1 hour',
        }
      );

      expect(passwordResetResult.success).toBe(true);

      // Verify all emails were tracked
      const orgMetrics = await emailAnalytics.getOrganizationMetrics('org-123');
      expect(orgMetrics.totalSent).toBeGreaterThan(0);
    });
  });

  describe('Email Testing and Quality Assurance Flow', () => {
    it('should run comprehensive email testing before campaign launch', async () => {
      // Create test suite for campaign template
      const tests = [
        {
          name: 'Spam Score Validation',
          type: 'spam_check' as const,
          templateId: 'newsletter',
          variables: {
            companyName: 'TestCorp',
            content: 'Our latest product updates and news',
          },
        },
        {
          name: 'Link Validation Test',
          type: 'link_validation' as const,
          templateId: 'newsletter',
          variables: {
            ctaUrl: 'https://testcorp.com/products',
            unsubscribeUrl: 'https://testcorp.com/unsubscribe',
          },
        },
        {
          name: 'Cross-Client Rendering',
          type: 'preview' as const,
          templateId: 'newsletter',
          variables: {
            companyName: 'TestCorp',
            firstName: 'Test User',
          },
        },
        {
          name: 'Deliverability Check',
          type: 'deliverability' as const,
          templateId: 'newsletter',
          variables: {},
        },
      ];

      const testResults = [];

      for (const testConfig of tests) {
        const test = await emailTester.createTest({
          name: testConfig.name,
          templateId: testConfig.templateId,
          testType: testConfig.type,
          testEmails: ['test@example.com'],
          templateVariables: testConfig.variables,
          createdBy: 'qa-team',
          organizationId: 'org-123',
        });

        const result = await emailTester.runTest(test.id);
        testResults.push({ test: testConfig, result });
      }

      // Verify all tests completed successfully
      testResults.forEach(({ test, result }) => {
        switch (test.type) {
          case 'spam_check':
            expect(result.spamScore).toBeDefined();
            expect(result.spamScore).toBeLessThan(70); // Acceptable spam score
            break;
          case 'link_validation':
            expect(result.links).toBeDefined();
            expect(result.links?.every(link => link.status === 'valid')).toBe(true);
            break;
          case 'preview':
            expect(result.htmlPreview).toBeDefined();
            expect(result.issues?.filter(i => i.type === 'error')).toHaveLength(0);
            break;
          case 'deliverability':
            expect(result.deliverabilityScore).toBeGreaterThan(75);
            expect(result.authenticationResults).toBeDefined();
            break;
        }
      });

      // Test cross-client compatibility
      const crossClientResults = await emailTester.testAcrossClients(
        'newsletter',
        { companyName: 'TestCorp', firstName: 'Test User' }
      );

      expect(crossClientResults.length).toBe(12); // 3 devices × 4 clients
      expect(crossClientResults.every(r => r.preview.length > 0 || r.issues.length > 0)).toBe(true);
    });
  });

  describe('Subscription and Compliance Flow', () => {
    it('should handle subscription management and compliance', async () => {
      const subscriberEmail = 'compliance.test@example.com';
      const organizationId = 'org-123';

      // Subscribe user
      const subscription = await subscriptionManager.subscribe({
        email: subscriberEmail,
        organizationId,
        listIds: ['newsletter', 'product-updates'],
        source: 'website-signup',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        doubleOptIn: true,
      });

      expect(subscription.email).toBe(subscriberEmail);
      expect(subscription.status).toBe('pending'); // Awaiting double opt-in
      expect(subscription.consentTimestamp).toBeInstanceOf(Date);

      // Confirm subscription (simulate email verification click)
      const confirmed = await subscriptionManager.confirmSubscription(
        subscription.confirmationToken
      );

      expect(confirmed.status).toBe('active');

      // Send campaign to confirmed subscribers only
      const audience = await audienceService.createAudience({
        name: 'Confirmed Subscribers',
        organizationId,
        description: 'Users who confirmed their subscription',
        filters: [
          {
            field: 'subscription_status',
            operator: 'equals',
            value: 'active',
          },
        ],
      });

      // Create and send campaign
      const campaign = await campaignManager.createCampaign({
        name: 'Compliance Test Campaign',
        organizationId,
        templateId: 'newsletter',
        subject: 'Your Requested Newsletter',
        audienceId: audience.id,
        type: 'standard',
        status: 'draft',
        scheduledAt: new Date(),
        templateVariables: { companyName: 'TestCorp' },
        sendingConfig: { sendRate: 100, batchSize: 10 },
        trackingConfig: { trackOpens: true, trackClicks: true, trackUnsubscribes: true },
      });

      await campaignManager.executeCampaign(campaign.id);

      // Simulate unsubscribe request
      const unsubscribeResult = await subscriptionManager.unsubscribe({
        email: subscriberEmail,
        organizationId,
        reason: 'user_request',
        campaignId: campaign.id,
      });

      expect(unsubscribeResult.success).toBe(true);

      // Verify user is unsubscribed
      const subscription_status = await subscriptionManager.getSubscriptionStatus(
        subscriberEmail,
        organizationId
      );

      expect(subscription_status.status).toBe('unsubscribed');
      expect(subscription_status.unsubscribeReason).toBe('user_request');

      // Test GDPR data export
      const gdprExport = await subscriptionManager.exportUserData(
        subscriberEmail,
        organizationId
      );

      expect(gdprExport.email).toBe(subscriberEmail);
      expect(gdprExport.subscriptionHistory).toBeDefined();
      expect(gdprExport.emailHistory).toBeDefined();
      expect(gdprExport.consentRecords).toBeDefined();

      // Test data deletion (right to be forgotten)
      const deletionResult = await subscriptionManager.deleteUserData(
        subscriberEmail,
        organizationId
      );

      expect(deletionResult.success).toBe(true);
      expect(deletionResult.deletedRecords).toBeGreaterThan(0);
    });
  });

  describe('Provider Failover and Reliability Flow', () => {
    it('should handle provider failures with automatic failover', async () => {
      // Simulate Resend failure
      const mockResendClient = {
        emails: {
          send: jest.fn().mockRejectedValue(new Error('Resend API unavailable')),
        },
      };
      require('resend').Resend.mockImplementation(() => mockResendClient);

      // Ensure SendGrid is working
      const mockSendGrid = require('@sendgrid/mail');
      mockSendGrid.send.mockResolvedValue([{
        statusCode: 202,
        headers: { 'x-message-id': 'sendgrid-failover-123' },
      }]);

      // Send email that should failover to SendGrid
      const emailData = {
        to: 'failover.test@example.com',
        from: 'noreply@testcorp.com',
        subject: 'Failover Test Email',
        html: '<p>Testing provider failover</p>',
        organizationId: 'org-123',
      };

      const result = await emailService.sendEmail(emailData);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('sendgrid');
      expect(result.messageId).toBe('sendgrid-failover-123');

      // Verify both providers were attempted
      expect(mockResendClient.emails.send).toHaveBeenCalled();
      expect(mockSendGrid.send).toHaveBeenCalled();

      // Check provider health status
      const healthStatuses = emailService.getProviderHealth();
      expect(healthStatuses.size).toBe(2);
    });
  });

  describe('Performance and Scale Testing', () => {
    it('should handle bulk email sending with rate limiting', async () => {
      const bulkEmails = Array.from({ length: 100 }, (_, i) => ({
        to: `bulk.user${i}@example.com`,
        from: 'noreply@testcorp.com',
        subject: `Bulk Email ${i + 1}`,
        html: `<p>This is bulk email number ${i + 1}</p>`,
        organizationId: 'org-123',
      }));

      const startTime = Date.now();
      const result = await emailService.sendBulkEmails(bulkEmails);
      const endTime = Date.now();

      expect(result.totalEmails).toBe(100);
      expect(result.successful).toBe(100);
      expect(result.failed).toBe(0);

      // Verify it took some time due to rate limiting
      const duration = endTime - startTime;
      expect(duration).toBeGreaterThan(0);

      // Verify provider metrics
      const metrics = emailService.getProviderMetrics();
      expect(metrics.size).toBeGreaterThan(0);
    });
  });
});

/**
 * Helper function to setup test environment
 */
function setupTestEnvironment() {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.RESEND_API_KEY = 'test-resend-key';
  process.env.SENDGRID_API_KEY = 'test-sendgrid-key';
}

// Setup test environment before running tests
beforeAll(() => {
  setupTestEnvironment();
});

// Cleanup after tests
afterAll(() => {
  jest.clearAllMocks();
  jest.resetModules();
});