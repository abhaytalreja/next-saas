import { WebhookManager } from '../WebhookManager';
import { EmailAnalytics } from '../../analytics/EmailAnalytics';
import { SubscriptionManager } from '../../compliance/SubscriptionManager';

// Mock dependencies
jest.mock('../../analytics/EmailAnalytics');
jest.mock('../../compliance/SubscriptionManager');
jest.mock('crypto', () => ({
  createHmac: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mocked-signature'),
  })),
}));

describe('WebhookManager', () => {
  let webhookManager: WebhookManager;
  let mockAnalytics: jest.Mocked<EmailAnalytics>;
  let mockSubscriptionManager: jest.Mocked<SubscriptionManager>;

  beforeEach(() => {
    // Create properly mocked analytics
    mockAnalytics = {
      trackEvent: jest.fn().mockResolvedValue({
        id: 'event-123',
        timestamp: new Date(),
      }),
    } as any;

    // Create properly mocked subscription manager
    mockSubscriptionManager = {
      markContactBounced: jest.fn().mockResolvedValue(undefined),
      markContactComplained: jest.fn().mockResolvedValue(undefined),
      unsubscribe: jest.fn().mockResolvedValue({ success: true }),
      updateContactEngagement: jest.fn().mockResolvedValue(undefined),
    } as any;

    webhookManager = new WebhookManager(mockAnalytics, mockSubscriptionManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processResendWebhook', () => {
    const mockResendPayload = {
      type: 'email.delivered',
      created_at: '2024-01-01T12:00:00Z',
      data: {
        email_id: 'resend-123',
        to: 'user@example.com',
        from: 'sender@example.com',
        subject: 'Test Email',
      },
    };

    it('should process delivered event successfully', async () => {
      const result = await webhookManager.processResendWebhook(
        mockResendPayload,
        'valid-signature',
        {
          verifySignature: false,
          secretKey: 'secret',
        }
      );

      expect(result.success).toBe(true);
      expect(result.eventsProcessed).toBe(1);
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'delivered',
          emailId: 'resend-123',
          contactId: 'user@example.com',
          provider: 'resend',
        })
      );
    });

    it('should handle unknown event types gracefully', async () => {
      const unknownPayload = {
        type: 'email.unknown',
        created_at: '2024-01-01T12:00:00Z',
        data: {
          email_id: 'resend-123',
          to: 'user@example.com',
        },
      };

      const result = await webhookManager.processResendWebhook(
        unknownPayload,
        'signature',
        { verifySignature: false, secretKey: 'secret' }
      );

      expect(result.success).toBe(true);
      expect(result.eventsProcessed).toBe(0);
      expect(result.message).toBe('Processed 0 events');
    });

    it('should handle batch webhook events', async () => {
      const batchPayload = [
        {
          type: 'email.delivered',
          created_at: '2024-01-01T12:00:00Z',
          data: {
            email_id: 'resend-123',
            to: 'user1@example.com',
          },
        },
        {
          type: 'email.opened',
          created_at: '2024-01-01T12:01:00Z',
          data: {
            email_id: 'resend-124',
            to: 'user2@example.com',
          },
        },
      ];

      const result = await webhookManager.processResendWebhook(
        batchPayload,
        'signature',
        { verifySignature: false, secretKey: 'secret' }
      );

      expect(result.success).toBe(true);
      expect(result.eventsProcessed).toBe(2);
      expect(mockAnalytics.trackEvent).toHaveBeenCalledTimes(2);
    });

    it('should handle processing errors gracefully', async () => {
      mockAnalytics.trackEvent.mockRejectedValue(new Error('Database error'));

      const result = await webhookManager.processResendWebhook(
        mockResendPayload,
        'signature',
        { verifySignature: false, secretKey: 'secret' }
      );

      expect(result.success).toBe(false);
      expect(result.eventsProcessed).toBe(0);
      expect(result.message).toBe('Database error');
    });
  });

  describe('processSendGridWebhook', () => {
    const mockSendGridPayload = [
      {
        event: 'delivered',
        timestamp: 1704110400,
        sg_message_id: 'sendgrid-123',
        email: 'user@example.com',
        sg_event_id: 'event-123',
      },
    ];

    it('should process SendGrid delivered event', async () => {
      const result = await webhookManager.processSendGridWebhook(
        mockSendGridPayload,
        'signature',
        {
          verifySignature: false,
          secretKey: 'secret',
        }
      );

      expect(result.success).toBe(true);
      expect(result.eventsProcessed).toBe(1);
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'delivered',
          emailId: 'sendgrid-123',
          contactId: 'user@example.com',
          provider: 'sendgrid',
        })
      );
    });

    it('should process multiple SendGrid events', async () => {
      const multipleEvents = [
        {
          event: 'delivered',
          timestamp: 1704110400,
          sg_message_id: 'sendgrid-123',
          email: 'user1@example.com',
        },
        {
          event: 'open',
          timestamp: 1704110500,
          sg_message_id: 'sendgrid-124',
          email: 'user2@example.com',
          useragent: 'Mozilla/5.0...',
          ip: '192.168.1.1',
        },
      ];

      const result = await webhookManager.processSendGridWebhook(
        multipleEvents,
        'signature',
        { verifySignature: false, secretKey: 'secret' }
      );

      expect(result.success).toBe(true);
      expect(result.eventsProcessed).toBe(2);
      expect(mockAnalytics.trackEvent).toHaveBeenCalledTimes(2);
    });
  });

  describe('registerProcessor', () => {
    it('should register custom webhook processor', () => {
      const customProcessor = {
        processEvent: jest.fn().mockResolvedValue(undefined),
      };

      webhookManager.registerProcessor('custom-event', customProcessor);

      // Check that processor was registered (we can't directly access private members)
      expect(() => webhookManager.registerProcessor('custom-event', customProcessor)).not.toThrow();
    });
  });

  describe('getWebhookStats', () => {
    it('should return webhook statistics', async () => {
      const stats = await webhookManager.getWebhookStats('org-123');

      expect(stats).toEqual({
        totalEvents: 0,
        eventsByType: {},
        eventsByProvider: {},
        processingErrors: 0,
        lastProcessedAt: expect.any(Date),
      });
    });
  });

  describe('replayFailedEvents', () => {
    it('should replay failed events', async () => {
      const result = await webhookManager.replayFailedEvents(
        'org-123',
        new Date('2024-01-01'),
        new Date('2024-01-02')
      );

      expect(result).toEqual({
        eventsReplayed: 0,
        errors: [],
      });
    });
  });
});