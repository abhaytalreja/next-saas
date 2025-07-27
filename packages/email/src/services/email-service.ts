import { render } from '@react-email/render';
import { EmailProviderFactory, EmailProviderRouter } from '../providers';
import { 
  EmailData, 
  EmailResult, 
  BulkEmailResult,
  EmailTemplateData,
  EmailProviderConfig,
  ProviderRoutingRule,
  EmailQueueItem,
  EmailType,
  EmailPriority
} from '../types';

export interface EmailServiceConfig {
  providers: Record<string, EmailProviderConfig>;
  routing?: ProviderRoutingRule[];
  defaultFrom?: string;
  queueConfig?: {
    enabled: boolean;
    maxRetries: number;
    retryDelay: number; // milliseconds
  };
  templatesConfig?: {
    baseUrl?: string;
    defaultBranding?: any;
  };
}

export class EmailService {
  private router: EmailProviderRouter;
  private config: EmailServiceConfig;
  private templates: Map<string, any> = new Map();

  constructor(config: EmailServiceConfig) {
    this.config = config;
    
    // Create providers
    const providers = EmailProviderFactory.createProviders(config.providers);
    
    // Setup default routing configuration
    const defaultRoutingConfig: ProviderRoutingConfig = {
      defaultProvider: 'resend',
      rules: [],
      failover: {
        enabled: true,
        maxRetries: 3,
        retryDelay: 1000,
        fallbackProviders: ['sendgrid', 'resend'],
        circuitBreaker: {
          enabled: true,
          failureThreshold: 5,
          resetTimeout: 60000,
          monitoringWindow: 300000,
        },
      },
      healthCheckInterval: 60000, // 1 minute
      circuitBreakerConfig: {
        failureThreshold: 5,
        resetTimeout: 60000,
        monitoringWindow: 300000,
      },
      ...config.routing,
    };

    // Initialize router
    this.router = new EmailProviderRouter(providers, defaultRoutingConfig);
    
    // Load default templates
    this.loadDefaultTemplates();
  }

  /**
   * Send a single email
   */
  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    try {
      // Validate email data
      this.validateEmailData(emailData);
      
      // Add default from if not provided
      if (!emailData.from && this.config.defaultFrom) {
        emailData.from = this.config.defaultFrom;
      }

      // Route and send email
      return await this.router.routeEmail(emailData);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(emails: EmailData[]): Promise<BulkEmailResult> {
    try {
      // Validate all emails
      emails.forEach(email => this.validateEmailData(email));
      
      // Add default from if not provided
      emails.forEach(email => {
        if (!email.from && this.config.defaultFrom) {
          email.from = this.config.defaultFrom;
        }
      });

      // Route and send emails
      return await this.router.routeBulkEmails(emails);
    } catch (error) {
      const errorResult: EmailResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };

      return {
        totalEmails: emails.length,
        successful: 0,
        failed: emails.length,
        results: emails.map(() => errorResult),
      };
    }
  }

  /**
   * Send email using a template
   */
  async sendTemplateEmail(
    templateId: string,
    templateData: EmailTemplateData,
    options: {
      to: string | string[];
      from?: string;
      subject?: string;
      replyTo?: string;
      cc?: string[];
      bcc?: string[];
      priority?: EmailPriority;
      scheduledAt?: Date;
      tags?: Record<string, string>;
    }
  ): Promise<EmailResult> {
    try {
      // Get template component
      const TemplateComponent = this.getTemplate(templateId);
      if (!TemplateComponent) {
        throw new Error(`Template '${templateId}' not found`);
      }

      // Render template
      const { html, text, subject } = await this.renderTemplate(
        TemplateComponent,
        templateData
      );

      // Create email data
      const emailData: EmailData = {
        to: options.to,
        from: options.from || this.config.defaultFrom || 'noreply@example.com',
        subject: options.subject || subject || templateData.content.subject || 'Email',
        html,
        text,
        organizationId: templateData.organizationId,
        templateId,
        replyTo: options.replyTo,
        cc: options.cc,
        bcc: options.bcc,
        tags: options.tags,
        unsubscribeUrl: templateData.unsubscribeUrl,
      };

      // Send email
      return await this.sendEmail(emailData);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Template rendering failed',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(
    to: string,
    data: {
      firstName?: string;
      organizationName: string;
      organizationId: string;
      ctaUrl?: string;
      ctaText?: string;
      features?: Array<{ title: string; description: string }>;
      branding?: any;
    }
  ): Promise<EmailResult> {
    const templateData: EmailTemplateData = {
      organizationId: data.organizationId,
      recipient: {
        email: to,
        firstName: data.firstName,
      },
      organization: {
        name: data.organizationName,
        primaryColor: '#007bff',
        ...data.branding,
      },
      content: {
        subject: `Welcome to ${data.organizationName}!`,
        heading: `Welcome${data.firstName ? `, ${data.firstName}` : ''}!`,
        message: `We're excited to have you join ${data.organizationName}.`,
        ctaText: data.ctaText || 'Get Started',
        ctaUrl: data.ctaUrl,
      },
    };

    return this.sendTemplateEmail('welcome', templateData, {
      to,
      subject: `Welcome to ${data.organizationName}!`,
      tags: {
        type: 'welcome',
        organization: data.organizationId,
      },
    });
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(
    to: string,
    data: {
      firstName?: string;
      verificationUrl: string;
      organizationName: string;
      organizationId: string;
      expiresIn?: string;
      branding?: any;
    }
  ): Promise<EmailResult> {
    const templateData: EmailTemplateData = {
      organizationId: data.organizationId,
      recipient: {
        email: to,
        firstName: data.firstName,
      },
      organization: {
        name: data.organizationName,
        primaryColor: '#007bff',
        ...data.branding,
      },
      content: {
        subject: 'Verify your email address',
        heading: 'Verify your email',
        message: `Please verify your email address to complete your registration${data.expiresIn ? ` within ${data.expiresIn}` : ''}.`,
        ctaText: 'Verify Email',
        ctaUrl: data.verificationUrl,
        footer: 'If you did not request this, please ignore this email.',
      },
    };

    return this.sendTemplateEmail('verification', templateData, {
      to,
      subject: 'Verify your email address',
      tags: {
        type: 'verification',
        organization: data.organizationId,
      },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    data: {
      firstName?: string;
      resetUrl: string;
      organizationName: string;
      organizationId: string;
      expiresIn?: string;
      branding?: any;
    }
  ): Promise<EmailResult> {
    const templateData: EmailTemplateData = {
      organizationId: data.organizationId,
      recipient: {
        email: to,
        firstName: data.firstName,
      },
      organization: {
        name: data.organizationName,
        primaryColor: '#007bff',
        ...data.branding,
      },
      content: {
        subject: 'Reset your password',
        heading: 'Password Reset',
        message: `We received a request to reset your password. Click the button below to create a new password${data.expiresIn ? ` within ${data.expiresIn}` : ''}.`,
        ctaText: 'Reset Password',
        ctaUrl: data.resetUrl,
        footer: 'If you did not request this password reset, please ignore this email.',
      },
    };

    return this.sendTemplateEmail('password-reset', templateData, {
      to,
      subject: 'Reset your password',
      tags: {
        type: 'password-reset',
        organization: data.organizationId,
      },
    });
  }

  /**
   * Add email to queue (if queue is enabled)
   */
  async queueEmail(
    emailData: EmailData,
    options: {
      priority?: EmailPriority;
      scheduledAt?: Date;
      maxRetries?: number;
    } = {}
  ): Promise<string> {
    if (!this.config.queueConfig?.enabled) {
      throw new Error('Email queue is not enabled');
    }

    const queueItem: EmailQueueItem = {
      id: this.generateId(),
      organizationId: emailData.organizationId,
      emailData,
      priority: options.priority || 'normal',
      scheduledAt: options.scheduledAt,
      maxRetries: options.maxRetries || this.config.queueConfig.maxRetries || 3,
      currentRetries: 0,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store in queue (implement based on your queue system)
    await this.storeQueueItem(queueItem);
    
    return queueItem.id;
  }

  /**
   * Process email queue
   */
  async processQueue(): Promise<void> {
    if (!this.config.queueConfig?.enabled) {
      return;
    }

    // Get pending queue items
    const pendingItems = await this.getPendingQueueItems();
    
    for (const item of pendingItems) {
      try {
        await this.processQueueItem(item);
      } catch (error) {
        console.error(`Failed to process queue item ${item.id}:`, error);
      }
    }
  }

  /**
   * Get email analytics
   */
  async getAnalytics(organizationId: string, period: { start: Date; end: Date }) {
    // This would integrate with your analytics system
    return {
      organizationId,
      period,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      complained: 0,
    };
  }

  /**
   * Get provider health status
   */
  getProviderHealth() {
    return this.router.getHealthStatuses();
  }

  /**
   * Get provider metrics
   */
  getProviderMetrics() {
    return this.router.getProviderMetrics();
  }

  /**
   * Register a custom template
   */
  registerTemplate(templateId: string, component: any): void {
    this.templates.set(templateId, component);
  }

  /**
   * Validate email data
   */
  private validateEmailData(emailData: EmailData): void {
    if (!emailData.to) {
      throw new Error('Recipient email is required');
    }
    
    if (!emailData.organizationId) {
      throw new Error('Organization ID is required');
    }
    
    if (!emailData.subject) {
      throw new Error('Email subject is required');
    }
    
    if (!emailData.html && !emailData.text) {
      throw new Error('Email content (HTML or text) is required');
    }
  }

  /**
   * Get template component
   */
  private getTemplate(templateId: string): any {
    return this.templates.get(templateId);
  }

  /**
   * Render template to HTML and text
   */
  private async renderTemplate(
    TemplateComponent: any,
    data: EmailTemplateData
  ): Promise<{ html: string; text: string; subject: string }> {
    // Render HTML
    const html = render(TemplateComponent(data));
    
    // Generate text version (simplified)
    const text = this.htmlToText(html);
    
    // Extract subject from content or use default
    const subject = data.content.subject || 'Email';

    return { html, text, subject };
  }

  /**
   * Convert HTML to plain text
   */
  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    // In production, you'd use a library like html-to-text
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Load default templates
   */
  private loadDefaultTemplates(): void {
    // This would load templates from the templates directory
    // For now, we'll register a few default ones
    
    // Import and register default templates
    import('../templates/transactional/welcome/WelcomeEmail').then(module => {
      this.registerTemplate('welcome', module.default);
    });
    
    // Add more default templates as needed
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Store queue item (implement based on your storage system)
   */
  private async storeQueueItem(item: EmailQueueItem): Promise<void> {
    // Implement based on your queue storage (database, Redis, etc.)
    console.log('Storing queue item:', item.id);
  }

  /**
   * Get pending queue items
   */
  private async getPendingQueueItems(): Promise<EmailQueueItem[]> {
    // Implement based on your queue storage
    return [];
  }

  /**
   * Process individual queue item
   */
  private async processQueueItem(item: EmailQueueItem): Promise<void> {
    try {
      // Update status to processing
      item.status = 'processing';
      item.updatedAt = new Date();
      
      // Send email
      const result = await this.sendEmail(item.emailData);
      
      if (result.success) {
        item.status = 'sent';
        item.sentAt = new Date();
      } else {
        item.currentRetries++;
        
        if (item.currentRetries >= item.maxRetries) {
          item.status = 'failed';
        } else {
          item.status = 'pending';
          // Schedule retry with exponential backoff
          item.scheduledAt = new Date(
            Date.now() + Math.pow(2, item.currentRetries) * (this.config.queueConfig?.retryDelay || 1000)
          );
        }
      }
      
      item.updatedAt = new Date();
      
      // Update queue item in storage
      await this.updateQueueItem(item);
    } catch (error) {
      console.error(`Failed to process queue item ${item.id}:`, error);
      
      item.currentRetries++;
      item.status = item.currentRetries >= item.maxRetries ? 'failed' : 'pending';
      item.updatedAt = new Date();
      
      await this.updateQueueItem(item);
    }
  }

  /**
   * Update queue item in storage
   */
  private async updateQueueItem(item: EmailQueueItem): Promise<void> {
    // Implement based on your queue storage
    console.log('Updating queue item:', item.id, item.status);
  }
}