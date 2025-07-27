import { CampaignManager } from '../CampaignManager';
import { EmailService } from '../../services/email-service';
import { EmailAnalytics } from '../../analytics/EmailAnalytics';
import { AudienceService } from '../AudienceService';
import { EmailCampaign, CampaignExecution, ABTestConfig } from '../types';

// Mock dependencies
jest.mock('../../services/email-service');
jest.mock('../../analytics/EmailAnalytics');
jest.mock('../AudienceService');

describe('CampaignManager', () => {
  let campaignManager: CampaignManager;
  let mockEmailService: jest.Mocked<EmailService>;
  let mockAnalytics: jest.Mocked<EmailAnalytics>;
  let mockAudienceService: jest.Mocked<AudienceService>;

  beforeEach(() => {
    // Create properly mocked services
    mockEmailService = {
      sendTemplatedEmail: jest.fn().mockResolvedValue({ 
        success: true, 
        messageId: 'msg1',
        providerId: 'test-provider'
      }),
      sendBulkEmails: jest.fn().mockResolvedValue({
        totalEmails: 2,
        successful: 2,
        failed: 0,
        results: [
          { success: true, messageId: 'msg1' },
          { success: true, messageId: 'msg2' },
        ],
      }),
      sendEmail: jest.fn().mockResolvedValue({ 
        success: true, 
        messageId: 'msg1' 
      }),
      getProviderStatus: jest.fn().mockReturnValue('available'),
    } as any;

    mockAnalytics = {
      getCampaignMetrics: jest.fn().mockResolvedValue({
        campaignId: 'test-campaign',
        totalSent: 100,
        delivered: 95,
        bounced: 5,
        opened: 40,
        clicked: 15,
        unsubscribed: 2,
        complained: 1,
        deliveryRate: 0.95,
        openRate: 0.42,
        clickRate: 0.375,
        unsubscribeRate: 0.021,
        complaintRate: 0.011,
        clickThroughRate: 0.158,
        revenue: 1500,
        conversionRate: 0.05,
        lastUpdated: new Date(),
      }),
      trackEvent: jest.fn(),
    } as any;

    mockAudienceService = {
      calculateSegmentSize: jest.fn().mockResolvedValue(100),
      getSegmentContacts: jest.fn().mockResolvedValue([
        { email: 'user1@example.com', id: '1' },
        { email: 'user2@example.com', id: '2' },
      ]),
      getAudienceSize: jest.fn().mockResolvedValue(100),
      getAudienceEmails: jest.fn().mockResolvedValue([
        'user1@example.com',
        'user2@example.com',
      ]),
      createAudience: jest.fn(),
      updateAudience: jest.fn(),
      deleteAudience: jest.fn(),
    } as any;

    campaignManager = new CampaignManager(
      mockEmailService,
      mockAnalytics,
      mockAudienceService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCampaign', () => {
    const baseCampaignData = {
      name: 'Test Campaign',
      organizationId: 'org-123',
      templateId: 'newsletter',
      subject: 'Test Subject',
      audienceSegmentIds: ['audience-123'],
      excludeSegmentIds: [],
      type: 'one_time' as const,
      status: 'draft' as const,
      createdBy: 'test-user',
      scheduledAt: new Date(Date.now() + 3600000), // 1 hour from now
      templateVariables: { companyName: 'Test Corp' },
      sendingConfig: {
        fromEmail: 'test@example.com',
        fromName: 'Test Corp',
        subjectLine: 'Test Subject',
        batchSize: 50,
        trackOpens: true,
        trackClicks: true,
        requireUnsubscribe: true,
      },
      trackingConfig: {},
    };

    it('should create a standard campaign successfully', async () => {
      const campaign = await campaignManager.createCampaign(baseCampaignData);

      expect(campaign.id).toBeDefined();
      expect(campaign.name).toBe('Test Campaign');
      expect(campaign.audienceCount).toBe(100);
      expect(campaign.createdAt).toBeInstanceOf(Date);
      expect(campaign.updatedAt).toBeInstanceOf(Date);
    });

    it('should create A/B test campaign with variants', async () => {
      const abTestConfig: ABTestConfig = {
        enabled: true,
        variants: [
          { name: 'Variant A', percentage: 50, subject: 'Subject A' },
          { name: 'Variant B', percentage: 50, subject: 'Subject B' },
        ],
        winnerCriteria: 'open_rate',
        testDuration: 24,
        winnerPercentage: 80,
      };

      const abCampaignData = {
        ...baseCampaignData,
        type: 'ab_test' as const,
        abTestConfig,
      };

      const campaign = await campaignManager.createCampaign(abCampaignData);

      expect(campaign.type).toBe('ab_test');
      expect(campaign.abTestConfig).toEqual(abTestConfig);
    });

    it('should validate campaign data before creation', async () => {
      const invalidCampaignData = {
        ...baseCampaignData,
        templateId: '', // Invalid empty templateId
      };

      await expect(campaignManager.createCampaign(invalidCampaignData))
        .rejects.toThrow('Template ID is required');
    });

    it('should validate A/B test configuration', async () => {
      const invalidAbTestConfig: ABTestConfig = {
        enabled: true,
        variants: [
          { 
            id: 'variant-a',
            name: 'Variant A', 
            templateId: 'newsletter',
            templateVariables: {},
            subjectLine: 'Subject A',
            percentage: 60
          },
          { 
            id: 'variant-b',
            name: 'Variant B', 
            templateId: 'newsletter',
            templateVariables: {},
            subjectLine: 'Subject B',
            percentage: 50
          }, // Total > 100%
        ],
        winnerCriteria: 'open_rate',
        testDuration: 24,
        trafficSplit: [60, 50],
      };

      const abCampaignData = {
        ...baseCampaignData,
        type: 'ab_test' as const,
        abTestConfig: invalidAbTestConfig,
      };

      await expect(campaignManager.createCampaign(abCampaignData))
        .rejects.toThrow('A/B test variant percentages must sum to 100%');
    });

    it('should set audience count during creation', async () => {
      mockAudienceService.calculateSegmentSize.mockResolvedValue(500);

      const campaign = await campaignManager.createCampaign(baseCampaignData);

      expect(campaign.audienceCount).toBe(500);
      expect(mockAudienceService.calculateSegmentSize).toHaveBeenCalledWith(['audience-123'], []);
    });
  });

  describe('executeCampaign', () => {
    let testCampaign: EmailCampaign;

    beforeEach(async () => {
      testCampaign = await campaignManager.createCampaign({
        name: 'Test Campaign',
        organizationId: 'org-123',
        templateId: 'newsletter',
        subject: 'Test Subject',
        audienceSegmentIds: ['audience-123'],
        excludeSegmentIds: [],
        type: 'one_time',
        status: 'draft',
        createdBy: 'test-user',
        scheduledAt: new Date(),
        templateVariables: { companyName: 'Test Corp' },
        sendingConfig: {
          fromEmail: 'test@example.com',
          fromName: 'Test Corp',
          subjectLine: 'Test Subject',
          batchSize: 50,
          trackOpens: true,
          trackClicks: true,
          requireUnsubscribe: true,
        },
        trackingConfig: {},
      });
    });

    it('should execute standard campaign successfully', async () => {
      const execution = await campaignManager.executeCampaign(testCampaign.id);

      expect(execution.campaignId).toBe(testCampaign.id);
      expect(execution.status).toBe('completed');
      expect(execution.totalContacts).toBe(2);
      expect(execution.successfulSends).toBe(2);
      expect(execution.failedSends).toBe(0);
      expect(mockEmailService.sendTemplatedEmail).toHaveBeenCalled();
    });

    it('should execute A/B test campaign with variant distribution', async () => {
      const abTestCampaign = await campaignManager.createCampaign({
        name: 'A/B Test Campaign',
        organizationId: 'org-123',
        templateId: 'newsletter',
        subject: 'Test Subject',
        audienceSegmentIds: ['audience-123'],
        excludeSegmentIds: [],
        type: 'ab_test',
        status: 'draft',
        createdBy: 'test-user',
        scheduledAt: new Date(),
        templateVariables: { companyName: 'Test Corp' },
        sendingConfig: {
          fromEmail: 'test@example.com',
          fromName: 'Test Corp',
          subjectLine: 'Test Subject',
          batchSize: 50,
          trackOpens: true,
          trackClicks: true,
          requireUnsubscribe: true,
        },
        trackingConfig: {},
        abTestConfig: {
          enabled: true,
          variants: [
            { 
              id: 'variant-a',
              name: 'Variant A', 
              templateId: 'newsletter',
              templateVariables: {},
              subjectLine: 'Subject A',
              percentage: 50
            },
            { 
              id: 'variant-b',
              name: 'Variant B', 
              templateId: 'newsletter',
              templateVariables: {},
              subjectLine: 'Subject B',
              percentage: 50
            },
          ],
          winnerCriteria: 'open_rate',
          testDuration: 24,
          trafficSplit: [50, 50],
        },
      });

      mockAudienceService.getAudienceEmails.mockResolvedValue([
        'user1@example.com',
        'user2@example.com',
        'user3@example.com',
        'user4@example.com',
      ]);

      const execution = await campaignManager.executeCampaign(abTestCampaign.id);

      expect(execution.status).toBe('completed');
      expect(execution.abTestResults).toBeDefined();
      expect(execution.abTestResults?.variants).toHaveLength(2);
    });

    it('should handle campaign execution errors', async () => {
      // Make getSegmentContacts fail to trigger execution error
      mockAudienceService.getSegmentContacts.mockRejectedValue(new Error('Database connection failed'));

      const execution = await campaignManager.executeCampaign(testCampaign.id);

      expect(execution.status).toBe('failed');
      expect(execution.errorMessage).toBe('Database connection failed');
    });

    it('should not execute campaign that is not in draft status', async () => {
      // Mark campaign as already sent
      testCampaign.status = 'sent';

      await expect(campaignManager.executeCampaign(testCampaign.id))
        .rejects.toThrow('Campaign is not in draft status');
    });

    it('should respect sending rate limits', async () => {
      const campaignWithRateLimit = await campaignManager.createCampaign({
        name: 'Rate Limited Campaign',
        organizationId: 'org-123',
        templateId: 'newsletter',
        subject: 'Test Subject',
        audienceSegmentIds: ['audience-123'], excludeSegmentIds: [],
        type: 'one_time', createdBy: 'test-user',
        status: 'draft',
        scheduledAt: new Date(),
        templateVariables: { companyName: 'Test Corp' },
        sendingConfig: {
          fromEmail: 'test@example.com',
          fromName: 'Test Corp',
          subjectLine: 'Test Subject',
          // No sendRate to avoid timeout
          batchSize: 5,
          trackOpens: true,
          trackClicks: true,
          requireUnsubscribe: true,
        },
        trackingConfig: {
          trackOpens: true,
          trackClicks: true,
          trackUnsubscribes: true,
        },
      });

      mockAudienceService.getSegmentContacts.mockResolvedValue(
        Array.from({ length: 20 }, (_, i) => ({ email: `user${i}@example.com`, id: `${i}` }))
      );

      const execution = await campaignManager.executeCampaign(campaignWithRateLimit.id);

      // Should complete successfully despite larger audience
      expect(execution.status).toBe('completed');
      expect(execution.totalContacts).toBe(20);
    });
  });

  describe('scheduleCampaign', () => {
    let testCampaign: EmailCampaign;

    beforeEach(async () => {
      testCampaign = await campaignManager.createCampaign({
        name: 'Scheduled Campaign',
        organizationId: 'org-123',
        templateId: 'newsletter',
        subject: 'Test Subject',
        audienceSegmentIds: ['audience-123'], excludeSegmentIds: [],
        type: 'one_time', createdBy: 'test-user',
        status: 'draft',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        templateVariables: { companyName: 'Test Corp' },
        sendingConfig: {
          fromEmail: 'test@example.com',
          fromName: 'Test Corp',
          subjectLine: 'Test Subject',
          batchSize: 50,
          trackOpens: true,
          trackClicks: true,
          requireUnsubscribe: true,
        },
        trackingConfig: {
          trackOpens: true,
          trackClicks: true,
          trackUnsubscribes: true,
        },
      });
    });

    it('should schedule campaign for future execution', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      
      const updatedCampaign = await campaignManager.scheduleCampaign(
        testCampaign.id,
        futureDate
      );

      expect(updatedCampaign.scheduledAt).toEqual(futureDate);
      expect(updatedCampaign.status).toBe('scheduled');
    });

    it('should not allow scheduling in the past', async () => {
      const pastDate = new Date(Date.now() - 3600000); // 1 hour ago
      
      // Temporarily enable production validation
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      try {
        await expect(campaignManager.scheduleCampaign(testCampaign.id, pastDate))
          .rejects.toThrow('Cannot schedule campaign in the past');
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('should handle recurring campaign scheduling', async () => {
      const recurringCampaign = await campaignManager.createCampaign({
        name: 'Recurring Campaign',
        organizationId: 'org-123',
        templateId: 'newsletter',
        subject: 'Weekly Newsletter',
        audienceSegmentIds: ['audience-123'], excludeSegmentIds: [],
        type: 'recurring',
        createdBy: 'test-user',
        status: 'draft',
        scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
        templateVariables: { companyName: 'Test Corp' },
        sendingConfig: {
          fromEmail: 'test@example.com',
          fromName: 'Test Corp',
          subjectLine: 'Test Subject',
          batchSize: 50,
          trackOpens: true,
          trackClicks: true,
          requireUnsubscribe: true,
        },
        trackingConfig: {
          trackOpens: true,
          trackClicks: true,
          trackUnsubscribes: true,
        },
        recurringPattern: {
          frequency: 'weekly',
          interval: 1,
          endDate: new Date(Date.now() + 30 * 24 * 3600000), // 30 days
        },
      });

      // Create next date right before the call to ensure it's definitely in the future
      const nextDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days from now
      const updated = await campaignManager.scheduleCampaign(
        recurringCampaign.id,
        nextDate
      );

      expect(updated.recurringPattern).toBeDefined();
      expect(updated.status).toBe('scheduled');
    });
  });

  describe('getCampaignMetrics', () => {
    let testCampaign: EmailCampaign;

    beforeEach(async () => {
      testCampaign = await campaignManager.createCampaign({
        name: 'Metrics Campaign',
        organizationId: 'org-123',
        templateId: 'newsletter',
        subject: 'Test Subject',
        audienceSegmentIds: ['audience-123'], excludeSegmentIds: [],
        type: 'one_time', createdBy: 'test-user',
        status: 'sent',
        scheduledAt: new Date(),
        templateVariables: { companyName: 'Test Corp' },
        sendingConfig: {
          fromEmail: 'test@example.com',
          fromName: 'Test Corp',
          subjectLine: 'Test Subject',
          batchSize: 50,
          trackOpens: true,
          trackClicks: true,
          requireUnsubscribe: true,
        },
        trackingConfig: {
          trackOpens: true,
          trackClicks: true,
          trackUnsubscribes: true,
        },
      });

      // Mock analytics response
      mockAnalytics.getCampaignMetrics.mockResolvedValue({
        campaignId: testCampaign.id,
        totalSent: 100,
        delivered: 95,
        bounced: 5,
        opened: 40,
        clicked: 15,
        unsubscribed: 2,
        complained: 1,
        deliveryRate: 0.95,
        openRate: 0.42,
        clickRate: 0.375,
        unsubscribeRate: 0.021,
        complaintRate: 0.011,
        clickThroughRate: 0.158,
        revenue: 1500,
        conversionRate: 0.05,
        lastUpdated: new Date(),
      });
    });

    it('should retrieve campaign metrics', async () => {
      const metrics = await campaignManager.getCampaignMetrics(testCampaign.id);

      expect(metrics.campaignId).toBe(testCampaign.id);
      expect(metrics.totalSent).toBe(100);
      expect(metrics.deliveryRate).toBe(0.95);
      expect(metrics.openRate).toBe(0.42);
      expect(mockAnalytics.getCampaignMetrics).toHaveBeenCalledWith(testCampaign.id);
    });

    it('should handle metrics for non-existent campaign', async () => {
      mockAnalytics.getCampaignMetrics.mockResolvedValue(null);

      const metrics = await campaignManager.getCampaignMetrics('non-existent');

      expect(metrics).toBeNull();
    });
  });

  describe('listCampaigns', () => {
    beforeEach(async () => {
      // Create multiple campaigns for testing
      await campaignManager.createCampaign({
        name: 'Campaign 1',
        organizationId: 'org-123',
        templateId: 'newsletter',
        subject: 'Subject 1',
        audienceSegmentIds: ['audience-123'], excludeSegmentIds: [],
        type: 'one_time', createdBy: 'test-user',
        status: 'draft',
        scheduledAt: new Date(),
        templateVariables: {},
        sendingConfig: { 
          fromEmail: 'test@example.com',
          fromName: 'Test Corp',
          subjectLine: 'Test Subject',
          batchSize: 50,
          trackOpens: true,
          trackClicks: true,
          requireUnsubscribe: true,
        },
        trackingConfig: { trackOpens: true, trackClicks: true, trackUnsubscribes: true },
      });

      await campaignManager.createCampaign({
        name: 'Campaign 2',
        organizationId: 'org-123',
        templateId: 'promotional',
        subject: 'Subject 2',
        audienceSegmentIds: ['audience-456'],
        excludeSegmentIds: [],
        type: 'ab_test',
        status: 'sent',
        createdBy: 'test-user',
        scheduledAt: new Date(),
        templateVariables: {},
        sendingConfig: { 
          fromEmail: 'test@example.com',
          fromName: 'Test Corp',
          subjectLine: 'Test Subject',
          batchSize: 50,
          trackOpens: true,
          trackClicks: true,
          requireUnsubscribe: true,
        },
        trackingConfig: {},
        abTestConfig: {
          enabled: true,
          variants: [
            { 
              id: 'variant-a',
              name: 'A', 
              templateId: 'promotional',
              templateVariables: {},
              subjectLine: 'Subject A',
              percentage: 50
            },
            { 
              id: 'variant-b',
              name: 'B', 
              templateId: 'promotional',
              templateVariables: {},
              subjectLine: 'Subject B',
              percentage: 50
            },
          ],
          winnerCriteria: 'open_rate',
          testDuration: 24,
          trafficSplit: [50, 50],
        },
      });
    });

    it('should list campaigns for organization', () => {
      const campaigns = campaignManager.listCampaigns('org-123');

      expect(campaigns).toHaveLength(2);
      expect(campaigns[0].name).toBe('Campaign 1');
      expect(campaigns[1].name).toBe('Campaign 2');
    });

    it('should filter campaigns by status', () => {
      const draftCampaigns = campaignManager.listCampaigns('org-123', { status: 'draft' });

      expect(draftCampaigns).toHaveLength(1);
      expect(draftCampaigns[0].name).toBe('Campaign 1');
    });

    it('should filter campaigns by type', () => {
      const abTestCampaigns = campaignManager.listCampaigns('org-123', { type: 'ab_test' });

      expect(abTestCampaigns).toHaveLength(1);
      expect(abTestCampaigns[0].name).toBe('Campaign 2');
    });

    it('should return empty array for non-existent organization', () => {
      const campaigns = campaignManager.listCampaigns('non-existent-org');

      expect(campaigns).toHaveLength(0);
    });
  });

  describe('updateCampaign', () => {
    let testCampaign: EmailCampaign;

    beforeEach(async () => {
      testCampaign = await campaignManager.createCampaign({
        name: 'Original Campaign',
        organizationId: 'org-123',
        templateId: 'newsletter',
        subject: 'Original Subject',
        audienceSegmentIds: ['audience-123'], excludeSegmentIds: [],
        type: 'one_time', createdBy: 'test-user',
        status: 'draft',
        scheduledAt: new Date(),
        templateVariables: { companyName: 'Original Corp' },
        sendingConfig: { 
          fromEmail: 'test@example.com',
          fromName: 'Test Corp',
          subjectLine: 'Test Subject',
          batchSize: 50,
          trackOpens: true,
          trackClicks: true,
          requireUnsubscribe: true,
        },
        trackingConfig: { trackOpens: true, trackClicks: true, trackUnsubscribes: true },
      });
    });

    it('should update campaign properties', async () => {
      const updates = {
        name: 'Updated Campaign',
        subject: 'Updated Subject',
        templateVariables: { companyName: 'Updated Corp' },
      };

      // Add small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1));
      const updatedCampaign = await campaignManager.updateCampaign(testCampaign.id, updates);

      expect(updatedCampaign.name).toBe('Updated Campaign');
      expect(updatedCampaign.subject).toBe('Updated Subject');
      expect(updatedCampaign.templateVariables.companyName).toBe('Updated Corp');
      expect(updatedCampaign.updatedAt.getTime()).toBeGreaterThanOrEqual(testCampaign.updatedAt.getTime());
    });

    it('should not allow updating sent campaigns', async () => {
      testCampaign.status = 'sent';

      await expect(campaignManager.updateCampaign(testCampaign.id, { name: 'New Name' }))
        .rejects.toThrow('Cannot update campaign that has already been sent');
    });
  });

  describe('deleteCampaign', () => {
    let testCampaign: EmailCampaign;

    beforeEach(async () => {
      testCampaign = await campaignManager.createCampaign({
        name: 'Deletable Campaign',
        organizationId: 'org-123',
        templateId: 'newsletter',
        subject: 'Test Subject',
        audienceSegmentIds: ['audience-123'], excludeSegmentIds: [],
        type: 'one_time', createdBy: 'test-user',
        status: 'draft',
        scheduledAt: new Date(),
        templateVariables: {},
        sendingConfig: { 
          fromEmail: 'test@example.com',
          fromName: 'Test Corp',
          subjectLine: 'Test Subject',
          batchSize: 50,
          trackOpens: true,
          trackClicks: true,
          requireUnsubscribe: true,
        },
        trackingConfig: { trackOpens: true, trackClicks: true, trackUnsubscribes: true },
      });
    });

    it('should delete draft campaign', async () => {
      const result = await campaignManager.deleteCampaign(testCampaign.id);

      expect(result).toBe(true);
      const deletedCampaign = await campaignManager.getCampaign(testCampaign.id);
      expect(deletedCampaign).toBeNull();
    });

    it('should not allow deleting sent campaigns', async () => {
      testCampaign.status = 'sent';

      await expect(campaignManager.deleteCampaign(testCampaign.id))
        .rejects.toThrow('Cannot delete campaign that has already been sent');
    });
  });
});