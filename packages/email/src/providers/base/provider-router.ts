import { BaseEmailProvider } from './email-provider';
import { 
  EmailData, 
  EmailType, 
  ProviderName,
  ProviderRoutingRule,
  ProviderFailoverConfig,
  EmailProviderStatus,
  EmailResult,
  BulkEmailResult
} from '../../types';

export interface ProviderRoutingConfig {
  defaultProvider: ProviderName;
  rules: ProviderRoutingRule[];
  failover: ProviderFailoverConfig;
  healthCheckInterval: number; // milliseconds
  circuitBreakerConfig: {
    failureThreshold: number;
    resetTimeout: number;
    monitoringWindow: number;
  };
}

export interface ProviderMetrics {
  provider: ProviderName;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  lastFailure?: Date;
  circuitState: 'closed' | 'open' | 'half-open';
}

export class EmailProviderRouter {
  private providers: Map<ProviderName, BaseEmailProvider>;
  private config: ProviderRoutingConfig;
  private metrics: Map<ProviderName, ProviderMetrics>;
  private healthStatuses: Map<ProviderName, EmailProviderStatus>;
  private lastHealthCheck: Date;

  constructor(
    providers: Map<ProviderName, BaseEmailProvider>,
    config: ProviderRoutingConfig
  ) {
    this.providers = providers;
    this.config = config;
    this.metrics = new Map();
    this.healthStatuses = new Map();
    this.lastHealthCheck = new Date();

    // Initialize metrics for all providers
    for (const [name] of providers) {
      this.metrics.set(name, {
        provider: name,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        avgResponseTime: 0,
        circuitState: 'closed',
      });
    }

    // Start health monitoring
    this.startHealthMonitoring();
  }

  /**
   * Route email to the best available provider
   */
  async routeEmail(emailData: EmailData): Promise<EmailResult> {
    const selectedProvider = await this.selectProvider(emailData);
    
    if (!selectedProvider) {
      return {
        success: false,
        error: 'No healthy providers available',
        timestamp: new Date(),
      };
    }

    return this.sendWithProvider(selectedProvider, emailData);
  }

  /**
   * Route bulk emails with load balancing
   */
  async routeBulkEmails(emails: EmailData[]): Promise<BulkEmailResult> {
    const results: EmailResult[] = [];
    const providers = await this.getHealthyProviders();
    
    if (providers.length === 0) {
      return {
        totalEmails: emails.length,
        successful: 0,
        failed: emails.length,
        results: emails.map(() => ({
          success: false,
          error: 'No healthy providers available',
          timestamp: new Date(),
        })),
      };
    }

    // Distribute emails across healthy providers
    const chunkedEmails = this.distributeEmails(emails, providers);
    
    const promises = chunkedEmails.map(async (chunk) => {
      const provider = chunk.provider;
      const emailBatch = chunk.emails;
      
      if (provider.isSupported('bulkSending')) {
        return provider.sendBulkEmails(emailBatch);
      } else {
        // Send individually if bulk sending not supported
        const individualResults = await Promise.all(
          emailBatch.map(email => this.sendWithProvider(provider, email))
        );
        
        return {
          totalEmails: emailBatch.length,
          successful: individualResults.filter(r => r.success).length,
          failed: individualResults.filter(r => !r.success).length,
          results: individualResults,
        };
      }
    });

    const batchResults = await Promise.all(promises);
    
    // Aggregate results
    const totalEmails = emails.length;
    let successful = 0;
    let failed = 0;
    
    for (const batch of batchResults) {
      successful += batch.successful;
      failed += batch.failed;
      results.push(...batch.results);
    }

    return {
      totalEmails,
      successful,
      failed,
      results,
    };
  }

  /**
   * Select the best provider for an email
   */
  async selectProvider(emailData: EmailData): Promise<BaseEmailProvider | null> {
    // Check routing rules first
    const ruleBasedProvider = this.selectProviderByRules(emailData);
    if (ruleBasedProvider && await this.isProviderHealthy(ruleBasedProvider)) {
      return this.providers.get(ruleBasedProvider) || null;
    }

    // Get email type for intelligent routing
    const emailType = this.determineEmailType(emailData);
    
    // Get healthy providers sorted by priority
    const healthyProviders = await this.getHealthyProviders();
    const prioritizedProviders = this.prioritizeProviders(healthyProviders, emailType);

    return prioritizedProviders[0] || null;
  }

  /**
   * Send email with specific provider and handle failures
   */
  private async sendWithProvider(
    provider: BaseEmailProvider,
    emailData: EmailData
  ): Promise<EmailResult> {
    const startTime = Date.now();
    const metrics = this.metrics.get(provider.name)!;

    try {
      // Check circuit breaker
      if (metrics.circuitState === 'open') {
        if (this.shouldTryCircuitBreaker(metrics)) {
          metrics.circuitState = 'half-open';
        } else {
          throw new Error(`Circuit breaker open for ${provider.name}`);
        }
      }

      metrics.totalRequests++;
      const result = await provider.sendEmail(emailData);
      
      // Update metrics on success
      const responseTime = Date.now() - startTime;
      this.updateProviderMetrics(provider.name, true, responseTime);
      
      if (metrics.circuitState === 'half-open') {
        metrics.circuitState = 'closed';
      }

      return result;
    } catch (error) {
      // Update metrics on failure
      const responseTime = Date.now() - startTime;
      this.updateProviderMetrics(provider.name, false, responseTime);
      
      // Handle circuit breaker
      this.handleProviderFailure(provider.name);
      
      // Try failover if enabled
      if (this.config.failover.enabled) {
        return this.attemptFailover(emailData, provider.name);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: provider.name,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Attempt failover to another provider
   */
  private async attemptFailover(
    emailData: EmailData,
    failedProvider: ProviderName
  ): Promise<EmailResult> {
    const fallbackProviders = this.config.failover.fallbackProviders
      .filter(name => name !== failedProvider)
      .filter(name => this.providers.has(name));

    for (const providerName of fallbackProviders) {
      if (await this.isProviderHealthy(providerName)) {
        const provider = this.providers.get(providerName)!;
        return this.sendWithProvider(provider, emailData);
      }
    }

    return {
      success: false,
      error: 'All fallback providers failed',
      timestamp: new Date(),
    };
  }

  /**
   * Select provider based on routing rules
   */
  private selectProviderByRules(emailData: EmailData): ProviderName | null {
    const applicableRules = this.config.rules
      .filter(rule => rule.enabled)
      .filter(rule => this.evaluateRuleConditions(rule, emailData))
      .sort((a, b) => b.priority - a.priority);

    return applicableRules[0]?.provider || null;
  }

  /**
   * Evaluate if email matches rule conditions
   */
  private evaluateRuleConditions(rule: ProviderRoutingRule, emailData: EmailData): boolean {
    const { conditions } = rule;

    // Check organization ID
    if (rule.organizationId && rule.organizationId !== emailData.organizationId) {
      return false;
    }

    // Check email type
    if (conditions.emailType) {
      const emailType = this.determineEmailType(emailData);
      if (emailType !== conditions.emailType) {
        return false;
      }
    }

    // Check recipient domains
    if (conditions.recipient?.domains) {
      const recipientEmail = this.extractEmailFromData(emailData);
      const domain = recipientEmail.split('@')[1];
      
      if (!conditions.recipient.domains.includes(domain)) {
        return false;
      }
    }

    // Check excluded domains
    if (conditions.recipient?.exclude) {
      const recipientEmail = this.extractEmailFromData(emailData);
      const domain = recipientEmail.split('@')[1];
      
      if (conditions.recipient.exclude.includes(domain)) {
        return false;
      }
    }

    // Check tags
    if (conditions.tags && emailData.tags) {
      const emailTags = Object.keys(emailData.tags);
      const hasMatchingTag = conditions.tags.some(tag => emailTags.includes(tag));
      
      if (!hasMatchingTag) {
        return false;
      }
    }

    // Check time conditions
    if (conditions.time) {
      const now = new Date();
      const timeZone = conditions.time.timezone || 'UTC';
      
      // This is a simplified time check - in production you'd use a proper timezone library
      const currentHour = now.getHours();
      const startHour = parseInt(conditions.time.start.split(':')[0]);
      const endHour = parseInt(conditions.time.end.split(':')[0]);
      
      if (currentHour < startHour || currentHour > endHour) {
        return false;
      }
    }

    return true;
  }

  /**
   * Determine email type from email data
   */
  private determineEmailType(emailData: EmailData): EmailType {
    if (emailData.campaignId) return 'marketing';
    if (emailData.templateId?.includes('notification')) return 'notification';
    if (emailData.templateId?.includes('system')) return 'system';
    return 'transactional';
  }

  /**
   * Extract email address from email data
   */
  private extractEmailFromData(emailData: EmailData): string {
    const to = Array.isArray(emailData.to) ? emailData.to[0] : emailData.to;
    return typeof to === 'string' ? to : to.email;
  }

  /**
   * Get healthy providers
   */
  private async getHealthyProviders(): Promise<BaseEmailProvider[]> {
    const healthy: BaseEmailProvider[] = [];

    for (const [name, provider] of this.providers) {
      if (await this.isProviderHealthy(name)) {
        healthy.push(provider);
      }
    }

    return healthy;
  }

  /**
   * Check if provider is healthy
   */
  private async isProviderHealthy(providerName: ProviderName): Promise<boolean> {
    const metrics = this.metrics.get(providerName);
    if (metrics?.circuitState === 'open') {
      return false;
    }

    const status = this.healthStatuses.get(providerName);
    return status?.healthy !== false;
  }

  /**
   * Prioritize providers based on email type and performance
   */
  private prioritizeProviders(
    providers: BaseEmailProvider[],
    emailType: EmailType
  ): BaseEmailProvider[] {
    return providers.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Score based on email type suitability
      if (emailType === 'transactional') {
        if (a.features.transactional) scoreA += 10;
        if (b.features.transactional) scoreB += 10;
      } else if (emailType === 'marketing') {
        if (a.features.marketing) scoreA += 10;
        if (b.features.marketing) scoreB += 10;
      }

      // Score based on reliability
      scoreA += a.getReliability() * 100;
      scoreB += b.getReliability() * 100;

      // Score based on current performance
      const metricsA = this.metrics.get(a.name);
      const metricsB = this.metrics.get(b.name);
      
      if (metricsA && metricsA.totalRequests > 0) {
        scoreA += (metricsA.successfulRequests / metricsA.totalRequests) * 50;
      }
      
      if (metricsB && metricsB.totalRequests > 0) {
        scoreB += (metricsB.successfulRequests / metricsB.totalRequests) * 50;
      }

      return scoreB - scoreA;
    });
  }

  /**
   * Distribute emails across providers for load balancing
   */
  private distributeEmails(
    emails: EmailData[],
    providers: BaseEmailProvider[]
  ): Array<{ provider: BaseEmailProvider; emails: EmailData[] }> {
    const chunks: Array<{ provider: BaseEmailProvider; emails: EmailData[] }> = [];
    const providerCount = providers.length;
    
    if (providerCount === 0) return chunks;

    const emailsPerProvider = Math.ceil(emails.length / providerCount);
    
    for (let i = 0; i < providerCount; i++) {
      const startIdx = i * emailsPerProvider;
      const endIdx = Math.min(startIdx + emailsPerProvider, emails.length);
      
      if (startIdx < emails.length) {
        chunks.push({
          provider: providers[i],
          emails: emails.slice(startIdx, endIdx),
        });
      }
    }

    return chunks;
  }

  /**
   * Update provider performance metrics
   */
  private updateProviderMetrics(
    providerName: ProviderName,
    success: boolean,
    responseTime: number
  ): void {
    const metrics = this.metrics.get(providerName)!;
    
    if (success) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
      metrics.lastFailure = new Date();
    }

    // Update average response time
    const totalRequests = metrics.successfulRequests + metrics.failedRequests;
    metrics.avgResponseTime = 
      (metrics.avgResponseTime * (totalRequests - 1) + responseTime) / totalRequests;
  }

  /**
   * Handle provider failure and circuit breaker logic
   */
  private handleProviderFailure(providerName: ProviderName): void {
    const metrics = this.metrics.get(providerName)!;
    const config = this.config.circuitBreakerConfig;
    
    const recentFailures = this.getRecentFailures(providerName, config.monitoringWindow);
    
    if (recentFailures >= config.failureThreshold) {
      metrics.circuitState = 'open';
    }
  }

  /**
   * Get recent failure count for circuit breaker
   */
  private getRecentFailures(providerName: ProviderName, windowMs: number): number {
    // This is a simplified implementation
    // In production, you'd track failures with timestamps
    const metrics = this.metrics.get(providerName)!;
    const now = Date.now();
    
    if (metrics.lastFailure && (now - metrics.lastFailure.getTime()) < windowMs) {
      return Math.min(metrics.failedRequests, this.config.circuitBreakerConfig.failureThreshold);
    }
    
    return 0;
  }

  /**
   * Check if circuit breaker should be tried (half-open)
   */
  private shouldTryCircuitBreaker(metrics: ProviderMetrics): boolean {
    if (!metrics.lastFailure) return true;
    
    const timeSinceLastFailure = Date.now() - metrics.lastFailure.getTime();
    return timeSinceLastFailure > this.config.circuitBreakerConfig.resetTimeout;
  }

  /**
   * Start health monitoring for all providers
   */
  private startHealthMonitoring(): void {
    setInterval(async () => {
      for (const [name, provider] of this.providers) {
        try {
          const status = await provider.getHealthStatus();
          this.healthStatuses.set(name, status);
        } catch (error) {
          this.healthStatuses.set(name, {
            healthy: false,
            lastChecked: new Date(),
            responseTime: 0,
            errorRate: 1,
            withinLimits: false,
            issues: [`Health check failed: ${error}`],
          });
        }
      }
      
      this.lastHealthCheck = new Date();
    }, this.config.healthCheckInterval);
  }

  /**
   * Get current provider metrics
   */
  getProviderMetrics(): Map<ProviderName, ProviderMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Get current health statuses
   */
  getHealthStatuses(): Map<ProviderName, EmailProviderStatus> {
    return new Map(this.healthStatuses);
  }

  /**
   * Update routing configuration
   */
  updateConfig(config: Partial<ProviderRoutingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Add new provider to router
   */
  addProvider(name: ProviderName, provider: BaseEmailProvider): void {
    this.providers.set(name, provider);
    this.metrics.set(name, {
      provider: name,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgResponseTime: 0,
      circuitState: 'closed',
    });
  }

  /**
   * Remove provider from router
   */
  removeProvider(name: ProviderName): void {
    this.providers.delete(name);
    this.metrics.delete(name);
    this.healthStatuses.delete(name);
  }
}