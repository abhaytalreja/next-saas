import sgMail from '@sendgrid/mail';
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

export class SendGridProvider extends BaseEmailProvider {
  public readonly name: ProviderName = 'sendgrid';
  public readonly displayName = 'SendGrid';
  public readonly type = 'hybrid' as const;
  public readonly features: EmailProviderFeatures = {
    transactional: true,
    marketing: true,
    templates: true,
    scheduling: true,
    tracking: true,
    analytics: true,
    webhooks: true,
    attachments: true,
    inlineImages: true,
    bulkSending: true,
    listManagement: true,
    automation: true,
    abTesting: true,
    customDomains: true,
    ipWarmup: true,
    reputation: true,
  };

  private client = sgMail;
  private rateLimitState: {
    requests: number;
    resetTime: Date;
  } = {
    requests: 0,
    resetTime: new Date(),
  };

  constructor(config: EmailProviderConfig) {
    super(config);
    this.client.setApiKey(config.apiKey);
  }

  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    try {
      this.validateEmailData(emailData);
      await this.rateLimitCheck();

      const sendGridEmail = this.transformEmailData(emailData);
      const startTime = Date.now();

      const [response] = await this.client.send(sendGridEmail);

      const responseTime = Date.now() - startTime;
      const messageId = response.headers['x-message-id'] as string;

      return this.createSuccessResult(messageId, {
        responseTime,
        provider: this.name,
        sendGridId: messageId,
        statusCode: response.statusCode,
      });
    } catch (error: any) {
      return this.handleProviderError(error, 'sendEmail');
    }
  }

  async sendBulkEmails(emails: EmailData[]): Promise<BulkEmailResult> {
    try {
      await this.rateLimitCheck();

      const sendGridEmails = emails.map(email => this.transformEmailData(email));
      const startTime = Date.now();

      const responses = await this.client.send(sendGridEmails);
      const responseTime = Date.now() - startTime;

      const results: EmailResult[] = responses.map((response, index) => {
        const messageId = response.headers['x-message-id'] as string;
        return this.createSuccessResult(messageId, {
          responseTime: responseTime / responses.length,
          provider: this.name,
          sendGridId: messageId,
          statusCode: response.statusCode,
          originalEmail: emails[index],
        });
      });

      return {
        totalEmails: emails.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      };
    } catch (error: any) {
      const results: EmailResult[] = emails.map(() => 
        this.handleProviderError(error, 'sendBulkEmails')
      );

      return {
        totalEmails: emails.length,
        successful: 0,
        failed: emails.length,
        results,
      };
    }
  }

  async createTemplate(template: EmailTemplate): Promise<string> {
    try {
      const sendGridTemplate = {
        name: template.name,
        generation: 'dynamic',
      };

      const response = await fetch('https://api.sendgrid.com/v3/templates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendGridTemplate),
      });

      if (!response.ok) {
        throw new Error(`SendGrid API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Create a version for the template
      await this.createTemplateVersion(result.id, template);
      
      return result.id;
    } catch (error) {
      throw new Error(`Failed to create SendGrid template: ${error}`);
    }
  }

  async updateTemplate(templateId: string, template: EmailTemplate): Promise<void> {
    try {
      // Update template metadata
      const updateData = {
        name: template.name,
      };

      const response = await fetch(`https://api.sendgrid.com/v3/templates/${templateId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`SendGrid API error: ${response.statusText}`);
      }

      // Create new version with updated content
      await this.createTemplateVersion(templateId, template);
    } catch (error) {
      throw new Error(`Failed to update SendGrid template: ${error}`);
    }
  }

  async deleteTemplate(templateId: string): Promise<void> {
    try {
      const response = await fetch(`https://api.sendgrid.com/v3/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`SendGrid API error: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Failed to delete SendGrid template: ${error}`);
    }
  }

  async getTemplate(templateId: string): Promise<EmailTemplate> {
    try {
      const response = await fetch(`https://api.sendgrid.com/v3/templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`SendGrid API error: ${response.statusText}`);
      }

      const template = await response.json();
      
      return {
        id: template.id,
        name: template.name,
        subject: template.versions?.[0]?.subject || '',
        description: '',
        html: template.versions?.[0]?.html_content || '',
        text: template.versions?.[0]?.plain_content || '',
        isActive: template.versions?.[0]?.active === 1,
        version: template.versions?.[0]?.id || 1,
        createdAt: new Date(template.created_at),
        updatedAt: new Date(template.updated_at),
      };
    } catch (error) {
      throw new Error(`Failed to get SendGrid template: ${error}`);
    }
  }

  async listTemplates(): Promise<EmailTemplate[]> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/templates?generations=dynamic', {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`SendGrid API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.templates.map((template: any) => ({
        id: template.id,
        name: template.name,
        subject: template.versions?.[0]?.subject || '',
        description: '',
        html: template.versions?.[0]?.html_content || '',
        text: template.versions?.[0]?.plain_content || '',
        isActive: template.versions?.[0]?.active === 1,
        version: template.versions?.[0]?.id || 1,
        createdAt: new Date(template.created_at),
        updatedAt: new Date(template.updated_at),
      }));
    } catch (error) {
      throw new Error(`Failed to list SendGrid templates: ${error}`);
    }
  }

  async checkHealth(): Promise<EmailProviderStatus> {
    try {
      const startTime = Date.now();
      
      // Test API key by fetching templates
      const response = await fetch('https://api.sendgrid.com/v3/templates?page_size=1', {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      const responseTime = Date.now() - startTime;
      const healthy = response.ok;

      if (!healthy) {
        const errorText = await response.text();
        return {
          healthy: false,
          lastChecked: new Date(),
          responseTime,
          errorRate: 1,
          withinLimits: false,
          issues: [`API error: ${response.status} ${errorText}`],
        };
      }

      return {
        healthy: true,
        lastChecked: new Date(),
        responseTime,
        errorRate: 0,
        withinLimits: this.isWithinRateLimits(),
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
    try {
      const startDate = period.start.toISOString().split('T')[0];
      const endDate = period.end.toISOString().split('T')[0];
      
      const response = await fetch(
        `https://api.sendgrid.com/v3/stats?start_date=${startDate}&end_date=${endDate}&aggregated_by=day`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`SendGrid API error: ${response.statusText}`);
      }

      const stats = await response.json();
      const aggregated = this.aggregateStats(stats);

      return {
        sent: aggregated.requests,
        delivered: aggregated.delivered,
        bounced: aggregated.bounces,
        complained: aggregated.spam_reports,
        opened: aggregated.opens,
        clicked: aggregated.clicks,
        unsubscribed: aggregated.unsubscribes,
        costs: this.calculateCosts(aggregated.requests),
        period,
      };
    } catch (error) {
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
  }

  validateWebhook(payload: any, signature: string): boolean {
    // Implement SendGrid webhook signature validation
    // This would verify the webhook signature using SendGrid's method
    return true; // Placeholder
  }

  async processWebhook(payload: any): Promise<void> {
    // Process SendGrid webhook events
    if (Array.isArray(payload)) {
      for (const event of payload) {
        await this.handleWebhookEvent(event);
      }
    } else {
      await this.handleWebhookEvent(payload);
    }
  }

  public getCostPerEmail(): number {
    return 0.0002; // $0.0002 per email for SendGrid
  }

  public getReliability(): number {
    return 0.985; // 98.5% reliability for SendGrid
  }

  public getMaxDaily(): number {
    return 1000000; // Default daily limit for SendGrid
  }

  private async createTemplateVersion(templateId: string, template: EmailTemplate): Promise<void> {
    const versionData = {
      template_id: templateId,
      active: 1,
      name: `${template.name} v${template.version || 1}`,
      html_content: template.html,
      plain_content: template.text,
      subject: template.subject,
      editor: 'code',
    };

    const response = await fetch(`https://api.sendgrid.com/v3/templates/${templateId}/versions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(versionData),
    });

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.statusText}`);
    }
  }

  private transformEmailData(emailData: EmailData): any {
    const sendGridEmail: any = {
      from: this.normalizeEmailAddress(emailData.from),
      to: this.transformRecipients(emailData.to),
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      headers: this.buildEmailHeaders(emailData),
    };

    // Add optional fields
    if (emailData.replyTo) {
      sendGridEmail.reply_to = this.normalizeEmailAddress(emailData.replyTo);
    }

    if (emailData.cc) {
      sendGridEmail.cc = this.transformRecipients(emailData.cc);
    }

    if (emailData.bcc) {
      sendGridEmail.bcc = this.transformRecipients(emailData.bcc);
    }

    if (emailData.attachments) {
      sendGridEmail.attachments = emailData.attachments.map(att => ({
        filename: att.filename,
        content: Buffer.isBuffer(att.content) ? att.content.toString('base64') : att.content,
        type: att.contentType,
        disposition: 'attachment',
        content_id: att.contentId,
      }));
    }

    if (emailData.tags) {
      sendGridEmail.custom_args = emailData.tags;
    }

    // Add tracking settings
    sendGridEmail.tracking_settings = {
      click_tracking: { enable: true },
      open_tracking: { enable: true },
      subscription_tracking: { enable: true },
    };

    return sendGridEmail;
  }

  private transformRecipients(recipients: any): any {
    if (Array.isArray(recipients)) {
      return recipients.map(r => {
        if (typeof r === 'string') {
          return { email: r };
        }
        return { email: r.email, name: r.name };
      });
    }
    
    if (typeof recipients === 'string') {
      return [{ email: recipients }];
    }
    
    return [{ email: recipients.email, name: recipients.name }];
  }

  private isWithinRateLimits(): boolean {
    const now = new Date();
    
    // Reset rate limit counter if needed
    if (now > this.rateLimitState.resetTime) {
      this.rateLimitState.requests = 0;
      this.rateLimitState.resetTime = new Date(now.getTime() + 60000); // Reset every minute
    }

    // SendGrid rate limits vary by plan, using conservative limit
    const maxRequestsPerMinute = 100;
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

  private aggregateStats(stats: any[]): any {
    return stats.reduce((acc, stat) => {
      const metrics = stat.stats[0]?.metrics || {};
      return {
        requests: (acc.requests || 0) + (metrics.requests || 0),
        delivered: (acc.delivered || 0) + (metrics.delivered || 0),
        bounces: (acc.bounces || 0) + (metrics.bounces || 0),
        spam_reports: (acc.spam_reports || 0) + (metrics.spam_reports || 0),
        opens: (acc.opens || 0) + (metrics.opens || 0),
        clicks: (acc.clicks || 0) + (metrics.clicks || 0),
        unsubscribes: (acc.unsubscribes || 0) + (metrics.unsubscribes || 0),
      };
    }, {});
  }

  private calculateCosts(emailCount: number): number {
    return emailCount * this.getCostPerEmail();
  }

  private async handleWebhookEvent(event: any): Promise<void> {
    const eventType = event.event;
    
    switch (eventType) {
      case 'delivered':
        await this.handleEmailDelivered(event);
        break;
      case 'bounce':
        await this.handleEmailBounced(event);
        break;
      case 'open':
        await this.handleEmailOpened(event);
        break;
      case 'click':
        await this.handleEmailClicked(event);
        break;
      case 'spamreport':
        await this.handleEmailComplained(event);
        break;
      case 'unsubscribe':
        await this.handleEmailUnsubscribed(event);
        break;
      default:
        console.warn(`Unknown SendGrid webhook event: ${eventType}`);
    }
  }

  private async handleEmailDelivered(event: any): Promise<void> {
    console.log('Email delivered:', event);
  }

  private async handleEmailBounced(event: any): Promise<void> {
    console.log('Email bounced:', event);
  }

  private async handleEmailOpened(event: any): Promise<void> {
    console.log('Email opened:', event);
  }

  private async handleEmailClicked(event: any): Promise<void> {
    console.log('Email clicked:', event);
  }

  private async handleEmailComplained(event: any): Promise<void> {
    console.log('Email complained:', event);
  }

  private async handleEmailUnsubscribed(event: any): Promise<void> {
    console.log('Email unsubscribed:', event);
  }
}