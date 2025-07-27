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

export abstract class BaseEmailProvider {
  public abstract readonly name: ProviderName;
  public abstract readonly displayName: string;
  public abstract readonly type: 'transactional' | 'marketing' | 'hybrid';
  public abstract readonly features: EmailProviderFeatures;
  
  protected config: EmailProviderConfig;
  protected lastHealthCheck?: Date;
  protected isHealthy: boolean = true;
  
  constructor(config: EmailProviderConfig) {
    this.config = config;
  }

  // Abstract methods that must be implemented by providers
  abstract sendEmail(emailData: EmailData): Promise<EmailResult>;
  abstract sendBulkEmails(emails: EmailData[]): Promise<BulkEmailResult>;
  abstract checkHealth(): Promise<EmailProviderStatus>;
  abstract getStats(period: { start: Date; end: Date }): Promise<EmailProviderStats>;

  // Optional template methods
  createTemplate?(template: EmailTemplate): Promise<string>;
  updateTemplate?(templateId: string, template: EmailTemplate): Promise<void>;
  deleteTemplate?(templateId: string): Promise<void>;
  getTemplate?(templateId: string): Promise<EmailTemplate>;
  listTemplates?(): Promise<EmailTemplate[]>;

  // Optional webhook methods
  validateWebhook?(payload: any, signature: string): boolean;
  processWebhook?(payload: any): Promise<void>;

  // Utility methods available to all providers
  protected validateEmailData(emailData: EmailData): void {
    if (!emailData.to) {
      throw new Error('Recipient email is required');
    }
    
    if (!emailData.from) {
      throw new Error('Sender email is required');
    }
    
    if (!emailData.subject) {
      throw new Error('Email subject is required');
    }
    
    if (!emailData.html && !emailData.text) {
      throw new Error('Email content (HTML or text) is required');
    }
    
    if (!emailData.organizationId) {
      throw new Error('Organization ID is required');
    }
  }

  protected normalizeEmailAddress(address: string | { email: string; name?: string }): string {
    if (typeof address === 'string') {
      return address;
    }
    
    return address.name ? `${address.name} <${address.email}>` : address.email;
  }

  protected extractEmailFromAddress(address: string | { email: string; name?: string }): string {
    if (typeof address === 'string') {
      const match = address.match(/<([^>]+)>/);
      return match ? match[1] : address;
    }
    
    return address.email;
  }

  protected async rateLimitCheck(): Promise<void> {
    if (!this.config.rateLimits) return;
    
    // Implementation would check against rate limits
    // This is a placeholder for rate limiting logic
    const now = new Date();
    
    // Check per-second limit
    if (this.config.rateLimits.perSecond) {
      // Implementation for per-second rate limiting
    }
    
    // Check per-minute limit
    if (this.config.rateLimits.perMinute) {
      // Implementation for per-minute rate limiting
    }
    
    // Check per-hour limit
    if (this.config.rateLimits.perHour) {
      // Implementation for per-hour rate limiting
    }
    
    // Check per-day limit
    if (this.config.rateLimits.perDay) {
      // Implementation for per-day rate limiting
    }
  }

  protected buildEmailHeaders(emailData: EmailData): Record<string, string> {
    const headers: Record<string, string> = {
      'X-Organization-ID': emailData.organizationId,
      'X-Email-Provider': this.name,
      'X-Sent-At': new Date().toISOString(),
    };

    if (emailData.templateId) {
      headers['X-Template-ID'] = emailData.templateId;
    }

    if (emailData.campaignId) {
      headers['X-Campaign-ID'] = emailData.campaignId;
    }

    if (emailData.trackingId) {
      headers['X-Tracking-ID'] = emailData.trackingId;
    }

    if (emailData.unsubscribeUrl) {
      headers['List-Unsubscribe'] = `<${emailData.unsubscribeUrl}>`;
      headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
    }

    // Merge with custom headers
    if (emailData.headers) {
      Object.assign(headers, emailData.headers);
    }

    return headers;
  }

  protected handleProviderError(error: any, context: string): EmailResult {
    console.error(`${this.name} provider error in ${context}:`, error);
    
    this.isHealthy = false;
    
    return {
      success: false,
      error: error?.message || 'Unknown provider error',
      provider: this.name,
      timestamp: new Date(),
    };
  }

  protected createSuccessResult(messageId: string, metadata?: Record<string, any>): EmailResult {
    return {
      success: true,
      messageId,
      provider: this.name,
      timestamp: new Date(),
      metadata,
    };
  }

  public getConfig(): EmailProviderConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<EmailProviderConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  public isSupported(feature: keyof EmailProviderFeatures): boolean {
    return this.features[feature] === true;
  }

  public getPriority(): number {
    // Default priority calculation based on reliability and features
    let priority = 0;
    
    if (this.features.transactional) priority += 10;
    if (this.features.marketing) priority += 5;
    if (this.features.analytics) priority += 3;
    if (this.features.webhooks) priority += 2;
    if (this.features.templates) priority += 2;
    
    return priority;
  }

  public getMaxDaily(): number {
    return this.config.rateLimits?.perDay || 100000;
  }

  public getCostPerEmail(): number {
    // Default cost - should be overridden by specific providers
    return 0.0001;
  }

  public getReliability(): number {
    // Default reliability score - should be overridden by specific providers
    return this.isHealthy ? 0.99 : 0.5;
  }

  public async getHealthStatus(): Promise<EmailProviderStatus> {
    const now = new Date();
    
    // Only check health if it's been more than 5 minutes since last check
    if (!this.lastHealthCheck || (now.getTime() - this.lastHealthCheck.getTime()) > 300000) {
      const status = await this.checkHealth();
      this.lastHealthCheck = now;
      this.isHealthy = status.healthy;
      return status;
    }
    
    return {
      healthy: this.isHealthy,
      lastChecked: this.lastHealthCheck,
      responseTime: 0,
      errorRate: 0,
      withinLimits: true,
    };
  }
}