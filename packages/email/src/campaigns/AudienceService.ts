import { CampaignAudience, AudienceFilter } from './types';

export interface Contact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  organizationId: string;
  
  // Metadata
  tags: string[];
  customFields: Record<string, any>;
  
  // Engagement data
  subscriptionStatus: 'subscribed' | 'unsubscribed' | 'bounced' | 'complained';
  subscriptionDate?: Date;
  unsubscriptionDate?: Date;
  
  // Activity tracking
  lastOpenedAt?: Date;
  lastClickedAt?: Date;
  totalOpens: number;
  totalClicks: number;
  
  // Dates
  createdAt: Date;
  updatedAt: Date;
}

export class AudienceService {
  private contacts: Map<string, Contact[]> = new Map(); // organizationId -> contacts
  private audiences: Map<string, CampaignAudience> = new Map();

  /**
   * Create a new audience segment
   */
  async createAudience(audienceData: Omit<CampaignAudience, 'id' | 'contactCount' | 'lastUpdated' | 'createdAt'>): Promise<CampaignAudience> {
    const audience: CampaignAudience = {
      ...audienceData,
      id: this.generateAudienceId(),
      contactCount: await this.calculateFilteredContactCount(audienceData.organizationId, audienceData.filters),
      lastUpdated: new Date(),
      createdAt: new Date(),
    };

    this.audiences.set(audience.id, audience);
    return audience;
  }

  /**
   * Update an existing audience segment
   */
  async updateAudience(audienceId: string, updates: Partial<CampaignAudience>): Promise<CampaignAudience> {
    const existingAudience = this.audiences.get(audienceId);
    
    if (!existingAudience) {
      throw new Error(`Audience ${audienceId} not found`);
    }

    const updatedAudience: CampaignAudience = {
      ...existingAudience,
      ...updates,
      lastUpdated: new Date(),
    };

    // Recalculate contact count if filters changed
    if (updates.filters) {
      updatedAudience.contactCount = await this.calculateFilteredContactCount(
        updatedAudience.organizationId,
        updatedAudience.filters
      );
    }

    this.audiences.set(audienceId, updatedAudience);
    return updatedAudience;
  }

  /**
   * Get audience by ID
   */
  async getAudience(audienceId: string): Promise<CampaignAudience | null> {
    return this.audiences.get(audienceId) || null;
  }

  /**
   * List audiences for an organization
   */
  async listAudiences(organizationId: string): Promise<CampaignAudience[]> {
    return Array.from(this.audiences.values()).filter(
      audience => audience.organizationId === organizationId
    );
  }

  /**
   * Delete an audience
   */
  async deleteAudience(audienceId: string): Promise<void> {
    this.audiences.delete(audienceId);
  }

  /**
   * Add a contact to the system
   */
  async addContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    const newContact: Contact = {
      ...contact,
      id: this.generateContactId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const orgContacts = this.contacts.get(contact.organizationId) || [];
    orgContacts.push(newContact);
    this.contacts.set(contact.organizationId, orgContacts);

    return newContact;
  }

  /**
   * Update a contact
   */
  async updateContact(contactId: string, organizationId: string, updates: Partial<Contact>): Promise<Contact> {
    const orgContacts = this.contacts.get(organizationId) || [];
    const contactIndex = orgContacts.findIndex(c => c.id === contactId);

    if (contactIndex === -1) {
      throw new Error(`Contact ${contactId} not found`);
    }

    const updatedContact: Contact = {
      ...orgContacts[contactIndex],
      ...updates,
      updatedAt: new Date(),
    };

    orgContacts[contactIndex] = updatedContact;
    this.contacts.set(organizationId, orgContacts);

    return updatedContact;
  }

  /**
   * Get contacts for specific audience segments
   */
  async getSegmentContacts(
    segmentIds: string[],
    excludeSegmentIds?: string[]
  ): Promise<Contact[]> {
    // Get all contacts from included segments
    const includedContacts = new Set<Contact>();
    
    for (const segmentId of segmentIds) {
      const audience = await this.getAudience(segmentId);
      if (audience) {
        const segmentContacts = await this.getContactsForAudience(audience);
        segmentContacts.forEach(contact => includedContacts.add(contact));
      }
    }

    // Remove contacts from excluded segments
    if (excludeSegmentIds && excludeSegmentIds.length > 0) {
      const excludedContacts = new Set<string>();
      
      for (const excludeSegmentId of excludeSegmentIds) {
        const audience = await this.getAudience(excludeSegmentId);
        if (audience) {
          const segmentContacts = await this.getContactsForAudience(audience);
          segmentContacts.forEach(contact => excludedContacts.add(contact.id));
        }
      }

      return Array.from(includedContacts).filter(contact => !excludedContacts.has(contact.id));
    }

    return Array.from(includedContacts);
  }

  /**
   * Calculate the size of combined segments
   */
  async calculateSegmentSize(
    segmentIds: string[],
    excludeSegmentIds?: string[]
  ): Promise<number> {
    const contacts = await this.getSegmentContacts(segmentIds, excludeSegmentIds);
    return contacts.length;
  }

  /**
   * Get contacts that match an audience's filters
   */
  async getContactsForAudience(audience: CampaignAudience): Promise<Contact[]> {
    const orgContacts = this.contacts.get(audience.organizationId) || [];
    
    return orgContacts.filter(contact => 
      this.contactMatchesFilters(contact, audience.filters)
    );
  }

  /**
   * Subscribe a contact to emails
   */
  async subscribeContact(contactId: string, organizationId: string): Promise<void> {
    await this.updateContact(contactId, organizationId, {
      subscriptionStatus: 'subscribed',
      subscriptionDate: new Date(),
      unsubscriptionDate: undefined,
    });
  }

  /**
   * Unsubscribe a contact from emails
   */
  async unsubscribeContact(contactId: string, organizationId: string): Promise<void> {
    await this.updateContact(contactId, organizationId, {
      subscriptionStatus: 'unsubscribed',
      unsubscriptionDate: new Date(),
    });
  }

  /**
   * Mark a contact as bounced
   */
  async markContactBounced(contactId: string, organizationId: string): Promise<void> {
    await this.updateContact(contactId, organizationId, {
      subscriptionStatus: 'bounced',
    });
  }

  /**
   * Mark a contact as complained
   */
  async markContactComplained(contactId: string, organizationId: string): Promise<void> {
    await this.updateContact(contactId, organizationId, {
      subscriptionStatus: 'complained',
    });
  }

  /**
   * Update contact engagement metrics
   */
  async updateContactEngagement(
    contactId: string,
    organizationId: string,
    engagement: {
      opened?: boolean;
      clicked?: boolean;
    }
  ): Promise<void> {
    const contact = await this.getContact(contactId, organizationId);
    if (!contact) return;

    const updates: Partial<Contact> = {};

    if (engagement.opened) {
      updates.lastOpenedAt = new Date();
      updates.totalOpens = contact.totalOpens + 1;
    }

    if (engagement.clicked) {
      updates.lastClickedAt = new Date();
      updates.totalClicks = contact.totalClicks + 1;
    }

    await this.updateContact(contactId, organizationId, updates);
  }

  /**
   * Private methods
   */

  private async getContact(contactId: string, organizationId: string): Promise<Contact | null> {
    const orgContacts = this.contacts.get(organizationId) || [];
    return orgContacts.find(c => c.id === contactId) || null;
  }

  private async calculateFilteredContactCount(organizationId: string, filters: AudienceFilter[]): Promise<number> {
    const orgContacts = this.contacts.get(organizationId) || [];
    return orgContacts.filter(contact => this.contactMatchesFilters(contact, filters)).length;
  }

  private contactMatchesFilters(contact: Contact, filters: AudienceFilter[]): boolean {
    return filters.every(filter => this.contactMatchesFilter(contact, filter));
  }

  private contactMatchesFilter(contact: Contact, filter: AudienceFilter): boolean {
    const value = this.getContactFieldValue(contact, filter.field);
    
    switch (filter.operator) {
      case 'equals':
        return value === filter.value;
      
      case 'not_equals':
        return value !== filter.value;
      
      case 'contains':
        return typeof value === 'string' && value.includes(filter.value);
      
      case 'not_contains':
        return typeof value === 'string' && !value.includes(filter.value);
      
      case 'starts_with':
        return typeof value === 'string' && value.startsWith(filter.value);
      
      case 'ends_with':
        return typeof value === 'string' && value.endsWith(filter.value);
      
      case 'greater_than':
        return typeof value === 'number' && value > filter.value;
      
      case 'less_than':
        return typeof value === 'number' && value < filter.value;
      
      case 'in':
        return Array.isArray(filter.value) && filter.value.includes(value);
      
      case 'not_in':
        return Array.isArray(filter.value) && !filter.value.includes(value);
      
      case 'exists':
        return value !== undefined && value !== null;
      
      case 'not_exists':
        return value === undefined || value === null;
      
      default:
        return false;
    }
  }

  private getContactFieldValue(contact: Contact, field: string): any {
    // Handle nested field paths (e.g., 'customFields.company')
    const fieldParts = field.split('.');
    let value: any = contact;
    
    for (const part of fieldParts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  private generateAudienceId(): string {
    return `audience_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateContactId(): string {
    return `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}