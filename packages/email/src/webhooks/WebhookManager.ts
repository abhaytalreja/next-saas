import { EmailAnalytics } from '../analytics/EmailAnalytics';
import { SubscriptionManager } from '../compliance/SubscriptionManager';

export interface WebhookEvent {
  id: string;
  provider: 'resend' | 'sendgrid';
  eventType: 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed' | 'failed';
  timestamp: Date;
  emailId: string;
  contactId?: string;
  campaignId?: string;
  organizationId: string;
  
  // Event-specific data
  userAgent?: string;
  ipAddress?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  
  // For clicks
  linkUrl?: string;
  linkText?: string;
  
  // For bounces
  bounceType?: 'hard' | 'soft';
  bounceReason?: string;
  
  // For failures
  errorCode?: string;
  errorMessage?: string;
  
  // Provider-specific data
  providerEventId?: string;
  providerMessageId?: string;
  
  // Raw webhook payload
  rawPayload: Record<string, any>;
}

export interface WebhookHandlerConfig {
  verifySignature: boolean;
  secretKey: string;
  allowedIPs?: string[];
  rateLimitPerMinute?: number;
}

export interface WebhookProcessor {
  processEvent(event: WebhookEvent): Promise<void>;
}

export class WebhookManager {
  private analytics: EmailAnalytics;
  private subscriptionManager: SubscriptionManager;
  private processors: Map<string, WebhookProcessor> = new Map();

  constructor(
    analytics: EmailAnalytics,
    subscriptionManager: SubscriptionManager
  ) {
    this.analytics = analytics;
    this.subscriptionManager = subscriptionManager;
  }

  /**
   * Register a custom webhook processor
   */
  registerProcessor(eventType: string, processor: WebhookProcessor): void {
    this.processors.set(eventType, processor);
  }

  /**
   * Process Resend webhook
   */
  async processResendWebhook(
    payload: any,
    signature: string,
    config: WebhookHandlerConfig
  ): Promise<{ success: boolean; message: string; eventsProcessed: number }> {
    try {
      // Verify signature if required
      if (config.verifySignature && !this.verifyResendSignature(payload, signature, config.secretKey)) {
        return { success: false, message: 'Invalid signature', eventsProcessed: 0 };
      }

      let eventsProcessed = 0;

      // Handle single event or batch
      const events = Array.isArray(payload) ? payload : [payload];

      for (const event of events) {
        const webhookEvent = this.parseResendEvent(event);
        if (webhookEvent) {
          await this.processWebhookEvent(webhookEvent);
          eventsProcessed++;
        }
      }

      return {
        success: true,
        message: `Processed ${eventsProcessed} events`,
        eventsProcessed
      };
    } catch (error) {
      console.error('Error processing Resend webhook:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        eventsProcessed: 0
      };
    }
  }

  /**
   * Process SendGrid webhook
   */
  async processSendGridWebhook(
    payload: any,
    signature: string,
    config: WebhookHandlerConfig
  ): Promise<{ success: boolean; message: string; eventsProcessed: number }> {
    try {
      // Verify signature if required
      if (config.verifySignature && !this.verifySendGridSignature(payload, signature, config.secretKey)) {
        return { success: false, message: 'Invalid signature', eventsProcessed: 0 };
      }

      let eventsProcessed = 0;

      // SendGrid sends events as an array
      const events = Array.isArray(payload) ? payload : [payload];

      for (const event of events) {
        const webhookEvent = this.parseSendGridEvent(event);
        if (webhookEvent) {
          await this.processWebhookEvent(webhookEvent);
          eventsProcessed++;
        }
      }

      return {
        success: true,
        message: `Processed ${eventsProcessed} events`,
        eventsProcessed
      };
    } catch (error) {
      console.error('Error processing SendGrid webhook:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        eventsProcessed: 0
      };
    }
  }

  /**
   * Process a webhook event
   */
  private async processWebhookEvent(event: WebhookEvent): Promise<void> {
    // Track the event in analytics
    await this.analytics.trackEvent({
      eventType: event.eventType,
      emailId: event.emailId,
      contactId: event.contactId || 'unknown',
      campaignId: event.campaignId,
      organizationId: event.organizationId,
      userAgent: event.userAgent,
      ipAddress: event.ipAddress,
      location: event.location,
      linkUrl: event.linkUrl,
      linkText: event.linkText,
      bounceType: event.bounceType,
      bounceReason: event.bounceReason,
      errorCode: event.errorCode,
      errorMessage: event.errorMessage,
      providerId: event.provider,
      providerMessageId: event.providerMessageId,
      metadata: {
        webhookEventId: event.id,
        providerEventId: event.providerEventId,
        rawPayload: event.rawPayload
      }
    });

    // Handle subscription-related events
    if (event.contactId) {
      switch (event.eventType) {
        case 'bounced':
          if (event.bounceType === 'hard') {
            await this.subscriptionManager.markContactBounced(event.contactId, event.organizationId);
          }
          break;
          
        case 'complained':
          await this.subscriptionManager.markContactComplained(event.contactId, event.organizationId);
          break;
          
        case 'unsubscribed':
          await this.subscriptionManager.unsubscribe(
            event.contactId, 
            'user_request',
            event.ipAddress,
            event.userAgent
          );
          break;
          
        case 'opened':
        case 'clicked':
          await this.subscriptionManager.updateContactEngagement(
            event.contactId,
            event.organizationId,
            {
              opened: event.eventType === 'opened',
              clicked: event.eventType === 'clicked'
            }
          );
          break;
      }
    }

    // Process with custom processors
    const processor = this.processors.get(event.eventType);
    if (processor) {
      await processor.processEvent(event);
    }
  }

  /**
   * Parse Resend webhook event
   */
  private parseResendEvent(payload: any): WebhookEvent | null {
    try {
      const { type, data } = payload;
      
      if (!type || !data) {
        return null;
      }

      // Map Resend event types to our standard types
      const eventTypeMap: Record<string, WebhookEvent['eventType']> = {
        'email.sent': 'delivered',
        'email.delivered': 'delivered',
        'email.delivery_delayed': 'failed',
        'email.complained': 'complained',
        'email.bounced': 'bounced',
        'email.opened': 'opened',
        'email.clicked': 'clicked',
        'email.unsubscribed': 'unsubscribed'
      };

      const eventType = eventTypeMap[type];
      if (!eventType) {
        console.warn(`Unknown Resend event type: ${type}`);
        return null;
      }

      return {
        id: this.generateEventId(),
        provider: 'resend',
        eventType,
        timestamp: new Date(data.created_at || Date.now()),
        emailId: data.email_id || data.id,
        contactId: data.to,
        campaignId: data.tags?.campaignId,
        organizationId: data.tags?.organizationId || 'unknown',
        userAgent: data.user_agent,
        ipAddress: data.ip,
        linkUrl: data.link?.url,
        bounceType: data.bounce?.type === 'Permanent' ? 'hard' : 'soft',
        bounceReason: data.bounce?.message,
        errorCode: data.error?.code,
        errorMessage: data.error?.message,
        providerEventId: payload.id,
        providerMessageId: data.email_id,
        rawPayload: payload
      };
    } catch (error) {
      console.error('Error parsing Resend event:', error);
      return null;
    }
  }

  /**
   * Parse SendGrid webhook event
   */
  private parseSendGridEvent(payload: any): WebhookEvent | null {
    try {
      const { event, email, timestamp } = payload;
      
      if (!event || !email) {
        return null;
      }

      // Map SendGrid event types to our standard types
      const eventTypeMap: Record<string, WebhookEvent['eventType']> = {
        'delivered': 'delivered',
        'open': 'opened',
        'click': 'clicked',
        'bounce': 'bounced',
        'dropped': 'failed',
        'deferred': 'failed',
        'processed': 'delivered',
        'spamreport': 'complained',
        'unsubscribe': 'unsubscribed',
        'group_unsubscribe': 'unsubscribed'
      };

      const eventType = eventTypeMap[event];
      if (!eventType) {
        console.warn(`Unknown SendGrid event type: ${event}`);
        return null;
      }

      return {
        id: this.generateEventId(),
        provider: 'sendgrid',
        eventType,
        timestamp: new Date(timestamp * 1000),
        emailId: payload['sg_message_id'] || payload.sg_event_id,
        contactId: email,
        campaignId: payload.category?.find((cat: string) => cat.startsWith('campaign_'))?.replace('campaign_', ''),
        organizationId: payload.category?.find((cat: string) => cat.startsWith('org_'))?.replace('org_', '') || 'unknown',
        userAgent: payload.useragent,
        ipAddress: payload.ip,
        linkUrl: payload.url,
        bounceType: payload.type === 'bounce' ? 'hard' : 'soft',
        bounceReason: payload.reason,
        errorCode: payload.response,
        errorMessage: payload.reason,
        providerEventId: payload.sg_event_id,
        providerMessageId: payload.sg_message_id,
        rawPayload: payload
      };
    } catch (error) {
      console.error('Error parsing SendGrid event:', error);
      return null;
    }
  }

  /**
   * Verify Resend webhook signature
   */
  private verifyResendSignature(payload: any, signature: string, secret: string): boolean {
    try {
      const crypto = require('crypto');
      const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(body, 'utf8');
      const expectedSignature = hmac.digest('hex');
      
      return signature === expectedSignature;
    } catch (error) {
      console.error('Error verifying Resend signature:', error);
      return false;
    }
  }

  /**
   * Verify SendGrid webhook signature
   */
  private verifySendGridSignature(payload: any, signature: string, secret: string): boolean {
    try {
      const crypto = require('crypto');
      const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
      
      // SendGrid uses different signature format
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('base64');
      
      return signature === expectedSignature;
    } catch (error) {
      console.error('Error verifying SendGrid signature:', error);
      return false;
    }
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStats(organizationId: string, timeframe: '24h' | '7d' | '30d' = '7d'): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByProvider: Record<string, number>;
    processingErrors: number;
    lastProcessedAt?: Date;
  }> {
    // This would typically query a webhook events table
    // For now, return mock data structure
    return {
      totalEvents: 0,
      eventsByType: {},
      eventsByProvider: {},
      processingErrors: 0,
      lastProcessedAt: new Date()
    };
  }

  /**
   * Replay failed webhook events
   */
  async replayFailedEvents(organizationId: string, startDate: Date, endDate: Date): Promise<{
    eventsReplayed: number;
    errors: string[];
  }> {
    // Implementation would query failed events and replay them
    return {
      eventsReplayed: 0,
      errors: []
    };
  }

  private generateEventId(): string {
    return `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}