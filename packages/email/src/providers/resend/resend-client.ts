import { Resend } from 'resend';
import { BaseEmailProvider } from '../base/email-provider';
import { 
  EmailData, 
  EmailResult, 
  BulkEmailResult,
  EmailProviderConfig,
  EmailProviderFeatures,
  EmailProviderStatus,
  EmailProviderStats,
  EmailTemplate,
  ProviderName
} from '../../types';

export class ResendProvider extends BaseEmailProvider {
  public readonly name: ProviderName = 'resend';
  public readonly displayName = 'Resend';
  public readonly type = 'transactional' as const;
  public readonly features: EmailProviderFeatures = {
    transactional: true,
    marketing: false,
    templates: true,
    scheduling: false,
    tracking: true,
    analytics: true,
    webhooks: true,
    attachments: true,
    inlineImages: true,
    bulkSending: false,
    listManagement: false,
    automation: false,
    abTesting: false,
    customDomains: true,
    ipWarmup: false,
    reputation: true,
  };

  private client: Resend;
  private rateLimitState: {
    requests: number;
    resetTime: Date;
  } = {
    requests: 0,
    resetTime: new Date(),
  };

  constructor(config: EmailProviderConfig) {
    super(config);
    this.client = new Resend(config.apiKey);
  }

  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    try {
      this.validateEmailData(emailData);
      await this.rateLimitCheck();

      const resendEmail = this.transformEmailData(emailData);
      const startTime = Date.now();

      const { data, error } = await this.client.emails.send(resendEmail);

      if (error || !data) {
        return this.handleProviderError(error || new Error('No data returned'), 'sendEmail');
      }

      const responseTime = Date.now() - startTime;

      return this.createSuccessResult(data.id, {
        responseTime,
        provider: this.name,
        resendId: data.id,
      });
    } catch (error) {
      return this.handleProviderError(error, 'sendEmail');
    }
  }

  async sendBulkEmails(emails: EmailData[]): Promise<BulkEmailResult> {
    // Resend doesn't have native bulk sending, so we send individually
    const results: EmailResult[] = [];
    let successful = 0;
    let failed = 0;

    for (const email of emails) {
      const result = await this.sendEmail(email);
      results.push(result);
      
      if (result.success) {
        successful++;
      } else {
        failed++;
      }

      // Small delay to respect rate limits
      await this.delay(100);
    }

    return {
      totalEmails: emails.length,
      successful,
      failed,
      results,
    };
  }

  async checkHealth(): Promise<EmailProviderStatus> {
    try {
      const startTime = Date.now();
      
      // Send a test email to validate the connection
      const testResult = await this.client.emails.send({
        from: 'health-check@resend.dev',
        to: 'test@resend.dev',
        subject: 'Health Check',
        html: '<p>Health check email</p>',
      });

      const responseTime = Date.now() - startTime;
      const healthy = !testResult.error;

      return {
        healthy,
        lastChecked: new Date(),
        responseTime,
        errorRate: healthy ? 0 : 1,
        withinLimits: this.isWithinRateLimits(),
        issues: testResult.error ? [testResult.error.message] : undefined,
      };
    } catch (error) {
      return {
        healthy: false,
        lastChecked: new Date(),
        responseTime: 0,
        errorRate: 1,
        withinLimits: false,
        issues: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  async getStats(period: { start: Date; end: Date }): Promise<EmailProviderStats> {
    // Resend doesn't provide detailed analytics API yet
    // This would typically fetch from their analytics endpoint
    return {
      sent: 0,
      delivered: 0,
      bounced: 0,
      complained: 0,
      opened: 0,
      clicked: 0,
      unsubscribed: 0,
      costs: 0,
      period,
    };
  }

  validateWebhook(payload: any, signature: string): boolean {
    // Implement Resend webhook validation
    // This would verify the webhook signature using Resend's method
    return true; // Placeholder
  }

  async processWebhook(payload: any): Promise<void> {
    // Process Resend webhook events
    const { type, data } = payload;

    switch (type) {
      case 'email.sent':
        await this.handleEmailSent(data);
        break;
      case 'email.delivered':
        await this.handleEmailDelivered(data);
        break;
      case 'email.bounced':
        await this.handleEmailBounced(data);
        break;
      case 'email.complained':
        await this.handleEmailComplained(data);
        break;
      default:
        console.warn(`Unknown Resend webhook event type: ${type}`);
    }
  }

  public getCostPerEmail(): number {
    return 0.0001; // $0.0001 per email for Resend
  }

  public getReliability(): number {
    return 0.99; // 99% reliability for Resend
  }

  public getMaxDaily(): number {
    return 100000; // Default daily limit for Resend
  }

  private transformEmailData(emailData: EmailData): any {
    const resendEmail: any = {
      from: this.normalizeEmailAddress(emailData.from),
      to: this.transformRecipients(emailData.to),
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      headers: this.buildEmailHeaders(emailData),
    };

    // Add optional fields
    if (emailData.replyTo) {
      resendEmail.reply_to = this.normalizeEmailAddress(emailData.replyTo);
    }

    if (emailData.cc) {
      resendEmail.cc = this.transformRecipients(emailData.cc);
    }

    if (emailData.bcc) {
      resendEmail.bcc = this.transformRecipients(emailData.bcc);
    }

    if (emailData.attachments) {
      resendEmail.attachments = emailData.attachments.map(att => ({
        filename: att.filename,
        content: att.content,
        content_type: att.contentType,
        content_id: att.contentId,
      }));
    }

    if (emailData.tags) {
      resendEmail.tags = Object.entries(emailData.tags).map(([key, value]) => ({
        name: key,
        value: String(value),
      }));
    }

    return resendEmail;
  }

  private transformRecipients(recipients: any): string[] {
    if (Array.isArray(recipients)) {
      return recipients.map(r => this.normalizeEmailAddress(r));
    }
    return [this.normalizeEmailAddress(recipients)];
  }

  private isWithinRateLimits(): boolean {
    const now = new Date();
    
    // Reset rate limit counter if needed
    if (now > this.rateLimitState.resetTime) {
      this.rateLimitState.requests = 0;
      this.rateLimitState.resetTime = new Date(now.getTime() + 60000); // Reset every minute
    }

    // Check if within limits (adjust based on your Resend plan)
    const maxRequestsPerMinute = 10; // Example limit
    return this.rateLimitState.requests < maxRequestsPerMinute;
  }

  protected async rateLimitCheck(): Promise<void> {
    if (!this.isWithinRateLimits()) {
      const waitTime = this.rateLimitState.resetTime.getTime() - Date.now();
      if (waitTime > 0) {
        await this.delay(waitTime);
      }
    }
    
    this.rateLimitState.requests++;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async handleEmailSent(data: any): Promise<void> {
    // Handle email sent event
    console.log('Email sent:', data);
  }

  private async handleEmailDelivered(data: any): Promise<void> {
    // Handle email delivered event
    console.log('Email delivered:', data);
  }

  private async handleEmailBounced(data: any): Promise<void> {
    // Handle email bounced event
    console.log('Email bounced:', data);
  }

  private async handleEmailComplained(data: any): Promise<void> {
    // Handle email complained event
    console.log('Email complained:', data);
  }
}