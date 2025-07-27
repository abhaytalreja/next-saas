export interface Subscription {
  id: string;
  contactId: string;
  organizationId: string;
  email: string;
  
  // Subscription details
  status: 'subscribed' | 'unsubscribed' | 'pending' | 'bounced' | 'complained';
  subscriptionDate: Date;
  unsubscriptionDate?: Date;
  
  // Consent tracking
  consentMethod: 'opt_in' | 'double_opt_in' | 'imported' | 'api' | 'form';
  consentSource?: string; // URL, form name, API endpoint
  consentTimestamp: Date;
  consentIpAddress?: string;
  consentUserAgent?: string;
  
  // Subscription preferences
  emailTypes: string[]; // e.g., ['newsletter', 'product_updates', 'marketing']
  frequency: 'daily' | 'weekly' | 'monthly' | 'never';
  
  // GDPR compliance
  gdprConsent?: boolean;
  gdprConsentDate?: Date;
  gdprLawfulBasis?: 'consent' | 'legitimate_interest' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task';
  
  // CAN-SPAM compliance
  canSpamOptOut?: boolean;
  canSpamOptOutDate?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastEmailSent?: Date;
  notes?: string;
}

export interface UnsubscribeToken {
  id: string;
  contactId: string;
  organizationId: string;
  token: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
  usedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface ComplianceSettings {
  organizationId: string;
  
  // General settings
  requireDoubleOptIn: boolean;
  enableUnsubscribeTracking: boolean;
  autoSuppressBounces: boolean;
  autoSuppressComplaints: boolean;
  
  // GDPR settings
  gdprEnabled: boolean;
  gdprDataRetentionDays: number;
  gdprConsentRequired: boolean;
  gdprLawfulBasis: Subscription['gdprLawfulBasis'];
  
  // CAN-SPAM settings
  canSpamEnabled: boolean;
  canSpamPhysicalAddress?: string;
  canSpamOptOutProcessingDays: number;
  
  // Unsubscribe settings
  unsubscribeTokenExpiryHours: number;
  customUnsubscribeUrl?: string;
  unsubscribePageContent?: string;
  
  // Notification settings
  notifyOnUnsubscribe: boolean;
  notifyOnComplaint: boolean;
  notificationEmails: string[];
  
  // Audit settings
  enableAuditLog: boolean;
  auditRetentionDays: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceAuditEvent {
  id: string;
  organizationId: string;
  contactId: string;
  eventType: 'subscription' | 'unsubscription' | 'consent_update' | 'data_export' | 'data_deletion';
  action: string;
  
  // Event details
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  initiatedBy?: string; // User ID or 'system'
  
  // Data changes
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  
  // Legal basis
  legalBasis?: string;
  notes?: string;
  
  // Metadata
  metadata?: Record<string, any>;
}

export class SubscriptionManager {
  private subscriptions: Map<string, Subscription> = new Map();
  private unsubscribeTokens: Map<string, UnsubscribeToken> = new Map();
  private complianceSettings: Map<string, ComplianceSettings> = new Map();
  private auditEvents: ComplianceAuditEvent[] = [];

  /**
   * Subscribe a contact to emails
   */
  async subscribe(subscriptionData: {
    contactId: string;
    organizationId: string;
    email: string;
    consentMethod: Subscription['consentMethod'];
    consentSource?: string;
    emailTypes: string[];
    frequency?: Subscription['frequency'];
    ipAddress?: string;
    userAgent?: string;
    gdprConsent?: boolean;
    gdprLawfulBasis?: Subscription['gdprLawfulBasis'];
  }): Promise<Subscription> {
    const settings = await this.getComplianceSettings(subscriptionData.organizationId);
    
    // Check if double opt-in is required
    if (settings.requireDoubleOptIn && subscriptionData.consentMethod !== 'double_opt_in') {
      throw new Error('Double opt-in is required for this organization');
    }

    // Check GDPR consent
    if (settings.gdprEnabled && settings.gdprConsentRequired && !subscriptionData.gdprConsent) {
      throw new Error('GDPR consent is required');
    }

    const subscription: Subscription = {
      id: this.generateSubscriptionId(),
      contactId: subscriptionData.contactId,
      organizationId: subscriptionData.organizationId,
      email: subscriptionData.email,
      status: 'subscribed',
      subscriptionDate: new Date(),
      consentMethod: subscriptionData.consentMethod,
      consentSource: subscriptionData.consentSource,
      consentTimestamp: new Date(),
      consentIpAddress: subscriptionData.ipAddress,
      consentUserAgent: subscriptionData.userAgent,
      emailTypes: subscriptionData.emailTypes,
      frequency: subscriptionData.frequency || 'weekly',
      gdprConsent: subscriptionData.gdprConsent,
      gdprConsentDate: subscriptionData.gdprConsent ? new Date() : undefined,
      gdprLawfulBasis: subscriptionData.gdprLawfulBasis || settings.gdprLawfulBasis,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.subscriptions.set(subscription.id, subscription);

    // Create audit event
    await this.createAuditEvent({
      organizationId: subscription.organizationId,
      contactId: subscription.contactId,
      eventType: 'subscription',
      action: 'subscribed',
      newData: subscription,
      ipAddress: subscriptionData.ipAddress,
      userAgent: subscriptionData.userAgent,
    });

    return subscription;
  }

  /**
   * Generate an unsubscribe token for a contact
   */
  async generateUnsubscribeToken(
    contactId: string,
    organizationId: string
  ): Promise<UnsubscribeToken> {
    const settings = await this.getComplianceSettings(organizationId);
    
    const token: UnsubscribeToken = {
      id: this.generateTokenId(),
      contactId,
      organizationId,
      token: this.generateSecureToken(),
      expiresAt: new Date(Date.now() + settings.unsubscribeTokenExpiryHours * 60 * 60 * 1000),
      isUsed: false,
      createdAt: new Date(),
    };

    this.unsubscribeTokens.set(token.token, token);
    return token;
  }

  /**
   * Unsubscribe a contact using a token
   */
  async unsubscribeWithToken(
    token: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ success: boolean; message: string; subscription?: Subscription }> {
    const unsubscribeToken = this.unsubscribeTokens.get(token);
    
    if (!unsubscribeToken) {
      return { success: false, message: 'Invalid unsubscribe token' };
    }

    if (unsubscribeToken.isUsed) {
      return { success: false, message: 'Unsubscribe token has already been used' };
    }

    if (unsubscribeToken.expiresAt < new Date()) {
      return { success: false, message: 'Unsubscribe token has expired' };
    }

    // Mark token as used
    unsubscribeToken.isUsed = true;
    unsubscribeToken.usedAt = new Date();
    unsubscribeToken.ipAddress = ipAddress;
    unsubscribeToken.userAgent = userAgent;

    // Find and update subscription
    const subscription = await this.getSubscriptionByContact(
      unsubscribeToken.contactId,
      unsubscribeToken.organizationId
    );

    if (!subscription) {
      return { success: false, message: 'Subscription not found' };
    }

    const updatedSubscription = await this.unsubscribe(
      subscription.id,
      'user_request',
      ipAddress,
      userAgent
    );

    return {
      success: true,
      message: 'Successfully unsubscribed',
      subscription: updatedSubscription,
    };
  }

  /**
   * Unsubscribe a contact
   */
  async unsubscribe(
    subscriptionId: string,
    reason: 'user_request' | 'bounce' | 'complaint' | 'admin',
    ipAddress?: string,
    userAgent?: string
  ): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId);
    
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.status === 'unsubscribed') {
      return subscription; // Already unsubscribed
    }

    const oldData = { ...subscription };

    // Update subscription
    subscription.status = 'unsubscribed';
    subscription.unsubscriptionDate = new Date();
    subscription.updatedAt = new Date();

    // Add CAN-SPAM compliance data
    const settings = await this.getComplianceSettings(subscription.organizationId);
    if (settings.canSpamEnabled) {
      subscription.canSpamOptOut = true;
      subscription.canSpamOptOutDate = new Date();
    }

    this.subscriptions.set(subscriptionId, subscription);

    // Create audit event
    await this.createAuditEvent({
      organizationId: subscription.organizationId,
      contactId: subscription.contactId,
      eventType: 'unsubscription',
      action: `unsubscribed_${reason}`,
      oldData,
      newData: subscription,
      ipAddress,
      userAgent,
    });

    // Send notification if enabled
    if (settings.notifyOnUnsubscribe) {
      await this.sendUnsubscribeNotification(subscription, reason);
    }

    return subscription;
  }

  /**
   * Update subscription preferences
   */
  async updateSubscriptionPreferences(
    subscriptionId: string,
    updates: {
      emailTypes?: string[];
      frequency?: Subscription['frequency'];
      gdprConsent?: boolean;
    },
    ipAddress?: string,
    userAgent?: string
  ): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId);
    
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const oldData = { ...subscription };

    // Update preferences
    if (updates.emailTypes) {
      subscription.emailTypes = updates.emailTypes;
    }
    
    if (updates.frequency) {
      subscription.frequency = updates.frequency;
    }

    if (updates.gdprConsent !== undefined) {
      subscription.gdprConsent = updates.gdprConsent;
      subscription.gdprConsentDate = new Date();
    }

    subscription.updatedAt = new Date();
    this.subscriptions.set(subscriptionId, subscription);

    // Create audit event
    await this.createAuditEvent({
      organizationId: subscription.organizationId,
      contactId: subscription.contactId,
      eventType: 'consent_update',
      action: 'preferences_updated',
      oldData,
      newData: subscription,
      ipAddress,
      userAgent,
    });

    return subscription;
  }

  /**
   * Check if a contact can receive emails
   */
  async canReceiveEmails(
    contactId: string,
    organizationId: string,
    emailType?: string
  ): Promise<{ canReceive: boolean; reason?: string }> {
    const subscription = await this.getSubscriptionByContact(contactId, organizationId);
    
    if (!subscription) {
      return { canReceive: false, reason: 'No subscription found' };
    }

    if (subscription.status !== 'subscribed') {
      return { canReceive: false, reason: `Contact is ${subscription.status}` };
    }

    if (emailType && !subscription.emailTypes.includes(emailType)) {
      return { canReceive: false, reason: `Contact not subscribed to ${emailType}` };
    }

    // Check GDPR consent
    const settings = await this.getComplianceSettings(organizationId);
    if (settings.gdprEnabled && settings.gdprConsentRequired && !subscription.gdprConsent) {
      return { canReceive: false, reason: 'GDPR consent required' };
    }

    return { canReceive: true };
  }

  /**
   * Export contact data for GDPR compliance
   */
  async exportContactData(contactId: string, organizationId: string): Promise<{
    subscription: Subscription | null;
    auditEvents: ComplianceAuditEvent[];
    unsubscribeTokens: UnsubscribeToken[];
  }> {
    const subscription = await this.getSubscriptionByContact(contactId, organizationId);
    
    const auditEvents = this.auditEvents.filter(
      event => event.contactId === contactId && event.organizationId === organizationId
    );

    const unsubscribeTokens = Array.from(this.unsubscribeTokens.values()).filter(
      token => token.contactId === contactId && token.organizationId === organizationId
    );

    // Create audit event for data export
    await this.createAuditEvent({
      organizationId,
      contactId,
      eventType: 'data_export',
      action: 'gdpr_export_requested',
    });

    return {
      subscription,
      auditEvents,
      unsubscribeTokens,
    };
  }

  /**
   * Delete contact data for GDPR compliance
   */
  async deleteContactData(
    contactId: string,
    organizationId: string,
    requestedBy: string
  ): Promise<{ deleted: boolean; items: string[] }> {
    const deletedItems: string[] = [];

    // Delete subscription
    const subscription = await this.getSubscriptionByContact(contactId, organizationId);
    if (subscription) {
      this.subscriptions.delete(subscription.id);
      deletedItems.push('subscription');
    }

    // Delete unsubscribe tokens
    const tokensToDelete = Array.from(this.unsubscribeTokens.entries()).filter(
      ([_, token]) => token.contactId === contactId && token.organizationId === organizationId
    );

    for (const [tokenValue, _] of tokensToDelete) {
      this.unsubscribeTokens.delete(tokenValue);
    }
    
    if (tokensToDelete.length > 0) {
      deletedItems.push(`${tokensToDelete.length} unsubscribe tokens`);
    }

    // Create audit event for data deletion
    await this.createAuditEvent({
      organizationId,
      contactId,
      eventType: 'data_deletion',
      action: 'gdpr_deletion_completed',
      initiatedBy: requestedBy,
      metadata: { deletedItems },
    });

    return {
      deleted: deletedItems.length > 0,
      items: deletedItems,
    };
  }

  /**
   * Get compliance settings
   */
  async getComplianceSettings(organizationId: string): Promise<ComplianceSettings> {
    let settings = this.complianceSettings.get(organizationId);
    
    if (!settings) {
      // Create default settings
      settings = this.createDefaultComplianceSettings(organizationId);
      this.complianceSettings.set(organizationId, settings);
    }

    return settings;
  }

  /**
   * Update compliance settings
   */
  async updateComplianceSettings(
    organizationId: string,
    updates: Partial<ComplianceSettings>
  ): Promise<ComplianceSettings> {
    const existingSettings = await this.getComplianceSettings(organizationId);
    
    const updatedSettings: ComplianceSettings = {
      ...existingSettings,
      ...updates,
      updatedAt: new Date(),
    };

    this.complianceSettings.set(organizationId, updatedSettings);
    return updatedSettings;
  }

  /**
   * Get audit events
   */
  async getAuditEvents(
    organizationId: string,
    contactId?: string,
    limit: number = 100
  ): Promise<ComplianceAuditEvent[]> {
    let events = this.auditEvents.filter(event => event.organizationId === organizationId);
    
    if (contactId) {
      events = events.filter(event => event.contactId === contactId);
    }

    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Private methods
   */

  private async getSubscriptionByContact(
    contactId: string,
    organizationId: string
  ): Promise<Subscription | null> {
    return Array.from(this.subscriptions.values()).find(
      sub => sub.contactId === contactId && sub.organizationId === organizationId
    ) || null;
  }

  private async createAuditEvent(eventData: Omit<ComplianceAuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const event: ComplianceAuditEvent = {
      ...eventData,
      id: this.generateAuditEventId(),
      timestamp: new Date(),
    };

    this.auditEvents.push(event);

    // Clean up old audit events if retention limit is reached
    const settings = await this.getComplianceSettings(eventData.organizationId);
    if (settings.enableAuditLog) {
      const cutoffDate = new Date(Date.now() - settings.auditRetentionDays * 24 * 60 * 60 * 1000);
      this.auditEvents = this.auditEvents.filter(e => e.timestamp >= cutoffDate);
    }
  }

  private async sendUnsubscribeNotification(subscription: Subscription, reason: string): Promise<void> {
    // Implementation would send notification email
    console.log(`Unsubscribe notification: ${subscription.email} (${reason})`);
  }

  private createDefaultComplianceSettings(organizationId: string): ComplianceSettings {
    return {
      organizationId,
      requireDoubleOptIn: false,
      enableUnsubscribeTracking: true,
      autoSuppressBounces: true,
      autoSuppressComplaints: true,
      gdprEnabled: true,
      gdprDataRetentionDays: 1095, // 3 years
      gdprConsentRequired: false,
      gdprLawfulBasis: 'legitimate_interest',
      canSpamEnabled: true,
      canSpamOptOutProcessingDays: 10,
      unsubscribeTokenExpiryHours: 720, // 30 days
      notifyOnUnsubscribe: false,
      notifyOnComplaint: true,
      notificationEmails: [],
      enableAuditLog: true,
      auditRetentionDays: 2555, // 7 years
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTokenId(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSecureToken(): string {
    return `unsubscribe_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  private generateAuditEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}