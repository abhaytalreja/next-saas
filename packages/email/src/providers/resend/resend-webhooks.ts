import { ResendProvider } from './resend-client';
import { EmailEngagementEvent, EmailDeliveryStatus } from '../../types';

export interface ResendWebhookEvent {
  type: 'email.sent' | 'email.delivered' | 'email.delivery_delayed' | 'email.bounced' | 'email.complained';
  created_at: string;
  data: {
    created_at: string;
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    html?: string;
    text?: string;
    reply_to?: string;
    cc?: string[];
    bcc?: string[];
    tags?: Array<{ name: string; value: string }>;
    [key: string]: any;
  };
}

export interface ResendWebhookConfig {
  endpoint: string;
  events: string[];
  secret?: string;
}

export class ResendWebhookHandler {
  private provider: ResendProvider;
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(provider: ResendProvider) {
    this.provider = provider;
    this.setupDefaultHandlers();
  }

  /**
   * Process incoming webhook from Resend
   */
  async processWebhook(
    payload: ResendWebhookEvent,
    signature?: string
  ): Promise<void> {
    try {
      // Validate webhook signature if provided
      if (signature && !this.validateSignature(payload, signature)) {
        throw new Error('Invalid webhook signature');
      }

      // Log the webhook event
      console.log(`Processing Resend webhook: ${payload.type}`, {
        emailId: payload.data.email_id,
        timestamp: payload.created_at,
      });

      // Handle the specific event type
      await this.handleEvent(payload);

      // Trigger registered handlers
      const handlers = this.eventHandlers.get(payload.type) || [];
      await Promise.all(handlers.map(handler => handler(payload)));

    } catch (error) {
      console.error('Error processing Resend webhook:', error);
      throw error;
    }
  }

  /**
   * Register event handler
   */
  onEvent(eventType: string, handler: Function): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  /**
   * Remove event handler
   */
  offEvent(eventType: string, handler: Function): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Validate webhook signature
   */
  private validateSignature(payload: ResendWebhookEvent, signature: string): boolean {
    // Resend webhook signature validation
    // This would implement the actual signature verification logic
    // For now, returning true as placeholder
    return true;
  }

  /**
   * Handle specific webhook events
   */
  private async handleEvent(event: ResendWebhookEvent): Promise<void> {
    switch (event.type) {
      case 'email.sent':
        await this.handleEmailSent(event);
        break;
      case 'email.delivered':
        await this.handleEmailDelivered(event);
        break;
      case 'email.delivery_delayed':
        await this.handleEmailDelayed(event);
        break;
      case 'email.bounced':
        await this.handleEmailBounced(event);
        break;
      case 'email.complained':
        await this.handleEmailComplained(event);
        break;
      default:
        console.warn(`Unknown Resend webhook event: ${event.type}`);
    }
  }

  /**
   * Handle email sent event
   */
  private async handleEmailSent(event: ResendWebhookEvent): Promise<void> {
    const deliveryStatus: EmailDeliveryStatus = {
      messageId: event.data.email_id,
      status: 'sent',
      timestamp: new Date(event.created_at),
      provider: 'resend',
      recipient: event.data.to[0],
      details: {
        from: event.data.from,
        subject: event.data.subject,
        tags: event.data.tags,
      },
    };

    await this.updateDeliveryStatus(deliveryStatus);
  }

  /**
   * Handle email delivered event
   */
  private async handleEmailDelivered(event: ResendWebhookEvent): Promise<void> {
    const deliveryStatus: EmailDeliveryStatus = {
      messageId: event.data.email_id,
      status: 'delivered',
      timestamp: new Date(event.created_at),
      provider: 'resend',
      recipient: event.data.to[0],
      details: {
        from: event.data.from,
        subject: event.data.subject,
      },
    };

    await this.updateDeliveryStatus(deliveryStatus);

    // Track engagement event
    const engagementEvent: EmailEngagementEvent = {
      messageId: event.data.email_id,
      type: 'delivered',
      timestamp: new Date(event.created_at),
      provider: 'resend',
      recipient: event.data.to[0],
      organizationId: this.extractOrganizationId(event),
    };

    await this.trackEngagementEvent(engagementEvent);
  }

  /**
   * Handle email delivery delayed event
   */
  private async handleEmailDelayed(event: ResendWebhookEvent): Promise<void> {
    const deliveryStatus: EmailDeliveryStatus = {
      messageId: event.data.email_id,
      status: 'queued',
      timestamp: new Date(event.created_at),
      provider: 'resend',
      recipient: event.data.to[0],
      reason: 'Delivery delayed',
      details: {
        delay_reason: event.data.delay_reason,
      },
    };

    await this.updateDeliveryStatus(deliveryStatus);
  }

  /**
   * Handle email bounced event
   */
  private async handleEmailBounced(event: ResendWebhookEvent): Promise<void> {
    const deliveryStatus: EmailDeliveryStatus = {
      messageId: event.data.email_id,
      status: 'bounced',
      timestamp: new Date(event.created_at),
      provider: 'resend',
      recipient: event.data.to[0],
      reason: event.data.bounce_reason || 'Unknown bounce reason',
      details: {
        bounce_type: event.data.bounce_type,
        bounce_subtype: event.data.bounce_subtype,
      },
    };

    await this.updateDeliveryStatus(deliveryStatus);

    // Track engagement event
    const engagementEvent: EmailEngagementEvent = {
      messageId: event.data.email_id,
      type: 'bounced',
      timestamp: new Date(event.created_at),
      provider: 'resend',
      recipient: event.data.to[0],
      organizationId: this.extractOrganizationId(event),
      details: {
        bounceType: event.data.bounce_type,
        bounceReason: event.data.bounce_reason,
      },
    };

    await this.trackEngagementEvent(engagementEvent);
  }

  /**
   * Handle email complained event
   */
  private async handleEmailComplained(event: ResendWebhookEvent): Promise<void> {
    const deliveryStatus: EmailDeliveryStatus = {
      messageId: event.data.email_id,
      status: 'complained',
      timestamp: new Date(event.created_at),
      provider: 'resend',
      recipient: event.data.to[0],
      reason: 'Spam complaint',
      details: {
        complaint_feedback_type: event.data.complaint_feedback_type,
      },
    };

    await this.updateDeliveryStatus(deliveryStatus);

    // Track engagement event
    const engagementEvent: EmailEngagementEvent = {
      messageId: event.data.email_id,
      type: 'complained',
      timestamp: new Date(event.created_at),
      provider: 'resend',
      recipient: event.data.to[0],
      organizationId: this.extractOrganizationId(event),
    };

    await this.trackEngagementEvent(engagementEvent);
  }

  /**
   * Setup default event handlers
   */
  private setupDefaultHandlers(): void {
    // Log all events
    this.onEvent('*', (event: ResendWebhookEvent) => {
      console.log(`Resend event: ${event.type}`, {
        emailId: event.data.email_id,
        recipient: event.data.to[0],
        timestamp: event.created_at,
      });
    });

    // Handle bounces for list cleanup
    this.onEvent('email.bounced', async (event: ResendWebhookEvent) => {
      if (event.data.bounce_type === 'Permanent') {
        await this.handlePermanentBounce(event.data.to[0], event.data.email_id);
      }
    });

    // Handle complaints for list cleanup
    this.onEvent('email.complained', async (event: ResendWebhookEvent) => {
      await this.handleSpamComplaint(event.data.to[0], event.data.email_id);
    });
  }

  /**
   * Update delivery status in database
   */
  private async updateDeliveryStatus(status: EmailDeliveryStatus): Promise<void> {
    // This would update the delivery status in your database
    console.log('Updating delivery status:', status);
    
    // Example database update (implement based on your database schema)
    /*
    await db.emailDeliveryStatus.upsert({
      where: { messageId: status.messageId },
      update: {
        status: status.status,
        timestamp: status.timestamp,
        reason: status.reason,
        details: status.details,
      },
      create: {
        messageId: status.messageId,
        status: status.status,
        timestamp: status.timestamp,
        provider: status.provider,
        recipient: status.recipient,
        reason: status.reason,
        details: status.details,
      },
    });
    */
  }

  /**
   * Track engagement event
   */
  private async trackEngagementEvent(event: EmailEngagementEvent): Promise<void> {
    // This would save the engagement event to your analytics system
    console.log('Tracking engagement event:', event);
    
    // Example analytics tracking (implement based on your analytics system)
    /*
    await analytics.track({
      event: 'email_engagement',
      properties: {
        messageId: event.messageId,
        type: event.type,
        provider: event.provider,
        recipient: event.recipient,
        organizationId: event.organizationId,
        timestamp: event.timestamp,
        details: event.details,
      },
    });
    */
  }

  /**
   * Handle permanent bounce for list cleanup
   */
  private async handlePermanentBounce(email: string, messageId: string): Promise<void> {
    console.log(`Handling permanent bounce for ${email} (message: ${messageId})`);
    
    // Add to suppression list
    // Remove from active mailing lists
    // Update subscriber status
  }

  /**
   * Handle spam complaint for list cleanup
   */
  private async handleSpamComplaint(email: string, messageId: string): Promise<void> {
    console.log(`Handling spam complaint for ${email} (message: ${messageId})`);
    
    // Add to suppression list
    // Unsubscribe from all lists
    // Update subscriber status
  }

  /**
   * Extract organization ID from webhook event
   */
  private extractOrganizationId(event: ResendWebhookEvent): string {
    // Extract from tags or headers
    const orgTag = event.data.tags?.find(tag => tag.name === 'organization_id');
    return orgTag?.value || 'unknown';
  }

  /**
   * Get webhook statistics
   */
  getWebhookStats(period: { start: Date; end: Date }) {
    return {
      totalEvents: 0,
      eventBreakdown: {
        'email.sent': 0,
        'email.delivered': 0,
        'email.bounced': 0,
        'email.complained': 0,
        'email.delivery_delayed': 0,
      },
      processingTime: {
        avg: 0,
        max: 0,
        min: 0,
      },
      errors: 0,
      period,
    };
  }

  /**
   * Configure webhook endpoint
   */
  async configureWebhook(config: ResendWebhookConfig): Promise<void> {
    // This would configure the webhook endpoint with Resend
    console.log('Configuring Resend webhook:', config);
    
    // Example webhook configuration
    /*
    await resend.webhooks.create({
      endpoint: config.endpoint,
      events: config.events,
      secret: config.secret,
    });
    */
  }

  /**
   * Test webhook endpoint
   */
  async testWebhook(endpoint: string): Promise<boolean> {
    try {
      // Send a test webhook event
      const testEvent: ResendWebhookEvent = {
        type: 'email.sent',
        created_at: new Date().toISOString(),
        data: {
          created_at: new Date().toISOString(),
          email_id: 'test-webhook-' + Date.now(),
          from: 'test@example.com',
          to: ['webhook-test@example.com'],
          subject: 'Webhook Test',
          tags: [{ name: 'test', value: 'webhook' }],
        },
      };

      // In a real implementation, this would make an HTTP request to the endpoint
      console.log('Testing webhook endpoint:', endpoint, testEvent);
      
      return true;
    } catch (error) {
      console.error('Webhook test failed:', error);
      return false;
    }
  }
}