import { EmailAnalytics } from '../EmailAnalytics';
import { CampaignMetrics } from '../../types';

// Mock database interface
const mockDatabase = {
  query: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('EmailAnalytics', () => {
  let emailAnalytics: EmailAnalytics;

  beforeEach(() => {
    emailAnalytics = new EmailAnalytics(mockDatabase as any);
    jest.clearAllMocks();
  });

  describe('trackEmailSent', () => {
    it('should track email sent event', async () => {
      const eventData = {
        messageId: 'msg-123',
        campaignId: 'campaign-123',
        organizationId: 'org-123',
        provider: 'resend',
        recipient: 'user@example.com',
        timestamp: new Date(),
      };

      mockDatabase.insert.mockResolvedValue({ id: 'event-123' });

      await emailAnalytics.trackEmailSent(eventData);

      expect(mockDatabase.insert).toHaveBeenCalledWith(
        'email_events',
        expect.objectContaining({
          messageId: 'msg-123',
          eventType: 'sent',
          campaignId: 'campaign-123',
          organizationId: 'org-123',
          provider: 'resend',
          recipient: 'user@example.com',
        })
      );
    });

    it('should handle tracking errors gracefully', async () => {
      const eventData = {
        messageId: 'msg-123',
        campaignId: 'campaign-123',
        organizationId: 'org-123',
        provider: 'resend',
        recipient: 'user@example.com',
        timestamp: new Date(),
      };

      mockDatabase.insert.mockRejectedValue(new Error('Database error'));

      // Should not throw error
      await expect(emailAnalytics.trackEmailSent(eventData)).resolves.not.toThrow();
    });
  });

  describe('trackEmailDelivered', () => {
    it('should track email delivered event', async () => {
      const eventData = {
        messageId: 'msg-123',
        campaignId: 'campaign-123',
        organizationId: 'org-123',
        provider: 'resend',
        recipient: 'user@example.com',
        timestamp: new Date(),
      };

      mockDatabase.insert.mockResolvedValue({ id: 'event-124' });

      await emailAnalytics.trackEmailDelivered(eventData);

      expect(mockDatabase.insert).toHaveBeenCalledWith(
        'email_events',
        expect.objectContaining({
          messageId: 'msg-123',
          eventType: 'delivered',
          timestamp: eventData.timestamp,
        })
      );
    });
  });

  describe('trackEmailOpened', () => {
    it('should track email opened event with metadata', async () => {
      const eventData = {
        messageId: 'msg-123',
        campaignId: 'campaign-123',
        organizationId: 'org-123',
        provider: 'resend',
        recipient: 'user@example.com',
        timestamp: new Date(),
        metadata: {
          userAgent: 'Mozilla/5.0...',
          ipAddress: '192.168.1.1',
          location: 'New York, US',
        },
      };

      mockDatabase.insert.mockResolvedValue({ id: 'event-125' });

      await emailAnalytics.trackEmailOpened(eventData);

      expect(mockDatabase.insert).toHaveBeenCalledWith(
        'email_events',
        expect.objectContaining({
          eventType: 'opened',
          metadata: eventData.metadata,
        })
      );
    });

    it('should handle multiple opens for same message', async () => {
      const eventData = {
        messageId: 'msg-123',
        campaignId: 'campaign-123',
        organizationId: 'org-123',
        provider: 'resend',
        recipient: 'user@example.com',
        timestamp: new Date(),
      };

      // Track first open
      await emailAnalytics.trackEmailOpened(eventData);

      // Track second open (should be recorded but marked as duplicate)
      await emailAnalytics.trackEmailOpened({
        ...eventData,
        timestamp: new Date(Date.now() + 1000),
      });

      expect(mockDatabase.insert).toHaveBeenCalledTimes(2);
    });
  });

  describe('trackEmailClicked', () => {
    it('should track email clicked event with URL', async () => {
      const eventData = {
        messageId: 'msg-123',
        campaignId: 'campaign-123',
        organizationId: 'org-123',
        provider: 'resend',
        recipient: 'user@example.com',
        timestamp: new Date(),
        metadata: {
          clickedUrl: 'https://example.com/product',
          linkIndex: 0,
        },
      };

      mockDatabase.insert.mockResolvedValue({ id: 'event-126' });

      await emailAnalytics.trackEmailClicked(eventData);

      expect(mockDatabase.insert).toHaveBeenCalledWith(
        'email_events',
        expect.objectContaining({
          eventType: 'clicked',
          metadata: expect.objectContaining({
            clickedUrl: 'https://example.com/product',
            linkIndex: 0,
          }),
        })
      );
    });
  });

  describe('trackEmailBounced', () => {
    it('should track email bounced event with bounce reason', async () => {
      const eventData = {
        messageId: 'msg-123',
        campaignId: 'campaign-123',
        organizationId: 'org-123',
        provider: 'resend',
        recipient: 'invalid@example.com',
        timestamp: new Date(),
        metadata: {
          bounceType: 'permanent',
          bounceReason: 'User unknown',
          diagnosticCode: '550 5.1.1 User unknown',
        },
      };

      mockDatabase.insert.mockResolvedValue({ id: 'event-127' });

      await emailAnalytics.trackEmailBounced(eventData);

      expect(mockDatabase.insert).toHaveBeenCalledWith(
        'email_events',
        expect.objectContaining({
          eventType: 'bounced',
          metadata: expect.objectContaining({
            bounceType: 'permanent',
            bounceReason: 'User unknown',
          }),
        })
      );
    });
  });

  describe('trackEmailUnsubscribed', () => {
    it('should track unsubscribe event', async () => {
      const eventData = {
        messageId: 'msg-123',
        campaignId: 'campaign-123',
        organizationId: 'org-123',
        provider: 'resend',
        recipient: 'user@example.com',
        timestamp: new Date(),
        metadata: {
          unsubscribeMethod: 'link',
          listId: 'list-123',
        },
      };

      mockDatabase.insert.mockResolvedValue({ id: 'event-128' });

      await emailAnalytics.trackEmailUnsubscribed(eventData);

      expect(mockDatabase.insert).toHaveBeenCalledWith(
        'email_events',
        expect.objectContaining({
          eventType: 'unsubscribed',
          metadata: expect.objectContaining({
            unsubscribeMethod: 'link',
          }),
        })
      );
    });
  });

  describe('getCampaignMetrics', () => {
    beforeEach(() => {
      // Mock query results for campaign metrics
      mockDatabase.query.mockImplementation((query: string) => {
        if (query.includes('COUNT(*)')) {
          if (query.includes("eventType = 'sent'")) return Promise.resolve([{ count: 1000 }]);
          if (query.includes("eventType = 'delivered'")) return Promise.resolve([{ count: 950 }]);
          if (query.includes("eventType = 'bounced'")) return Promise.resolve([{ count: 50 }]);
          if (query.includes("eventType = 'opened'")) return Promise.resolve([{ count: 400 }]);
          if (query.includes("eventType = 'clicked'")) return Promise.resolve([{ count: 150 }]);
          if (query.includes("eventType = 'unsubscribed'")) return Promise.resolve([{ count: 20 }]);
          if (query.includes("eventType = 'complained'")) return Promise.resolve([{ count: 5 }]);
        }
        if (query.includes('SUM(revenue)')) {
          return Promise.resolve([{ revenue: 2500 }]);
        }
        return Promise.resolve([]);
      });
    });

    it('should calculate comprehensive campaign metrics', async () => {
      const metrics = await emailAnalytics.getCampaignMetrics('campaign-123');

      expect(metrics).toEqual({
        campaignId: 'campaign-123',
        totalSent: 1000,
        delivered: 950,
        bounced: 50,
        opened: 400,
        clicked: 150,
        unsubscribed: 20,
        complained: 5,
        deliveryRate: 0.95,
        openRate: 0.421, // 400/950 (delivered)
        clickRate: 0.375, // 150/400 (opened)
        unsubscribeRate: 0.021, // 20/950 (delivered)
        complaintRate: 0.005, // 5/950 (delivered)
        clickThroughRate: 0.158, // 150/950 (delivered)
        revenue: 2500,
        conversionRate: 0.1, // 100/1000 (assuming 100 conversions)
        lastUpdated: expect.any(Date),
      });
    });

    it('should handle campaigns with no events', async () => {
      mockDatabase.query.mockResolvedValue([{ count: 0 }]);

      const metrics = await emailAnalytics.getCampaignMetrics('empty-campaign');

      expect(metrics).toEqual({
        campaignId: 'empty-campaign',
        totalSent: 0,
        delivered: 0,
        bounced: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        complained: 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        unsubscribeRate: 0,
        complaintRate: 0,
        clickThroughRate: 0,
        revenue: 0,
        conversionRate: 0,
        lastUpdated: expect.any(Date),
      });
    });

    it('should return null for non-existent campaign', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const metrics = await emailAnalytics.getCampaignMetrics('non-existent');

      expect(metrics).toBeNull();
    });
  });

  describe('getOrganizationMetrics', () => {
    it('should aggregate metrics across all campaigns for organization', async () => {
      mockDatabase.query.mockImplementation((query: string) => {
        if (query.includes('organizationId')) {
          return Promise.resolve([{
            totalSent: 5000,
            delivered: 4750,
            bounced: 250,
            opened: 2000,
            clicked: 750,
            unsubscribed: 100,
            complained: 25,
            revenue: 12500,
          }]);
        }
        return Promise.resolve([]);
      });

      const metrics = await emailAnalytics.getOrganizationMetrics('org-123');

      expect(metrics.totalSent).toBe(5000);
      expect(metrics.deliveryRate).toBeCloseTo(0.95);
      expect(metrics.openRate).toBeCloseTo(0.421);
      expect(metrics.revenue).toBe(12500);
    });

    it('should handle date range filters', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      await emailAnalytics.getOrganizationMetrics('org-123', { startDate, endDate });

      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('timestamp >= ? AND timestamp <= ?'),
        expect.arrayContaining(['org-123', startDate, endDate])
      );
    });
  });

  describe('getProviderMetrics', () => {
    it('should return metrics grouped by provider', async () => {
      mockDatabase.query.mockResolvedValue([
        {
          provider: 'resend',
          totalSent: 3000,
          delivered: 2850,
          bounced: 150,
          avgResponseTime: 250,
        },
        {
          provider: 'sendgrid',
          totalSent: 2000,
          delivered: 1900,
          bounced: 100,
          avgResponseTime: 180,
        },
      ]);

      const metrics = await emailAnalytics.getProviderMetrics('org-123');

      expect(metrics).toHaveLength(2);
      expect(metrics[0].provider).toBe('resend');
      expect(metrics[0].deliveryRate).toBeCloseTo(0.95);
      expect(metrics[1].provider).toBe('sendgrid');
      expect(metrics[1].deliveryRate).toBeCloseTo(0.95);
    });
  });

  describe('getEmailEngagementTimeline', () => {
    it('should return engagement timeline for campaign', async () => {
      mockDatabase.query.mockResolvedValue([
        {
          date: '2024-01-01',
          sent: 100,
          delivered: 95,
          opened: 40,
          clicked: 15,
        },
        {
          date: '2024-01-02',
          sent: 120,
          delivered: 114,
          opened: 48,
          clicked: 18,
        },
      ]);

      const timeline = await emailAnalytics.getEmailEngagementTimeline(
        'campaign-123',
        new Date('2024-01-01'),
        new Date('2024-01-02')
      );

      expect(timeline).toHaveLength(2);
      expect(timeline[0].date).toBe('2024-01-01');
      expect(timeline[0].openRate).toBeCloseTo(0.421);
      expect(timeline[1].date).toBe('2024-01-02');
      expect(timeline[1].openRate).toBeCloseTo(0.421);
    });

    it('should handle empty timeline data', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const timeline = await emailAnalytics.getEmailEngagementTimeline(
        'campaign-123',
        new Date('2024-01-01'),
        new Date('2024-01-02')
      );

      expect(timeline).toEqual([]);
    });
  });

  describe('getTopPerformingCampaigns', () => {
    it('should return campaigns ranked by performance metric', async () => {
      mockDatabase.query.mockResolvedValue([
        {
          campaignId: 'campaign-1',
          campaignName: 'Newsletter 1',
          openRate: 0.45,
          clickRate: 0.12,
          totalSent: 1000,
        },
        {
          campaignId: 'campaign-2',
          campaignName: 'Newsletter 2',
          openRate: 0.38,
          clickRate: 0.09,
          totalSent: 800,
        },
      ]);

      const topCampaigns = await emailAnalytics.getTopPerformingCampaigns(
        'org-123',
        'open_rate',
        5
      );

      expect(topCampaigns).toHaveLength(2);
      expect(topCampaigns[0].campaignName).toBe('Newsletter 1');
      expect(topCampaigns[0].openRate).toBe(0.45);
    });

    it('should limit results to specified count', async () => {
      mockDatabase.query.mockResolvedValue(
        Array.from({ length: 10 }, (_, i) => ({
          campaignId: `campaign-${i}`,
          campaignName: `Campaign ${i}`,
          openRate: 0.4 - i * 0.01,
        }))
      );

      const topCampaigns = await emailAnalytics.getTopPerformingCampaigns(
        'org-123',
        'open_rate',
        3
      );

      expect(topCampaigns).toHaveLength(3);
    });
  });

  describe('calculateMetrics', () => {
    it('should calculate rates correctly', () => {
      const metrics = {
        totalSent: 1000,
        delivered: 950,
        opened: 400,
        clicked: 150,
        bounced: 50,
        unsubscribed: 20,
        complained: 5,
      };

      const calculatedMetrics = (emailAnalytics as any).calculateMetrics(metrics);

      expect(calculatedMetrics.deliveryRate).toBeCloseTo(0.95);
      expect(calculatedMetrics.openRate).toBeCloseTo(0.421);
      expect(calculatedMetrics.clickRate).toBeCloseTo(0.375);
      expect(calculatedMetrics.unsubscribeRate).toBeCloseTo(0.021);
      expect(calculatedMetrics.complaintRate).toBeCloseTo(0.005);
      expect(calculatedMetrics.clickThroughRate).toBeCloseTo(0.158);
    });

    it('should handle zero denominators', () => {
      const metrics = {
        totalSent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
        complained: 0,
      };

      const calculatedMetrics = (emailAnalytics as any).calculateMetrics(metrics);

      expect(calculatedMetrics.deliveryRate).toBe(0);
      expect(calculatedMetrics.openRate).toBe(0);
      expect(calculatedMetrics.clickRate).toBe(0);
    });
  });

  describe('exportMetrics', () => {
    it('should export metrics in CSV format', async () => {
      mockDatabase.query.mockResolvedValue([
        {
          campaignId: 'campaign-1',
          campaignName: 'Newsletter 1',
          totalSent: 1000,
          delivered: 950,
          opened: 400,
          clicked: 150,
          revenue: 2500,
        },
      ]);

      const csvData = await emailAnalytics.exportMetrics('org-123', 'csv');

      expect(csvData).toContain('campaignId,campaignName,totalSent');
      expect(csvData).toContain('campaign-1,Newsletter 1,1000');
    });

    it('should export metrics in JSON format', async () => {
      mockDatabase.query.mockResolvedValue([
        {
          campaignId: 'campaign-1',
          campaignName: 'Newsletter 1',
          totalSent: 1000,
        },
      ]);

      const jsonData = await emailAnalytics.exportMetrics('org-123', 'json');
      const parsed = JSON.parse(jsonData);

      expect(parsed).toHaveLength(1);
      expect(parsed[0].campaignId).toBe('campaign-1');
    });
  });
});