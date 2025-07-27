import { CampaignMetrics } from '../campaigns/types';

export interface EmailEvent {
  id: string;
  eventType: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed' | 'complained' | 'failed';
  emailId: string;
  contactId: string;
  campaignId?: string;
  organizationId: string;
  
  // Event-specific data
  timestamp: Date;
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
  
  // Provider data
  providerId?: string;
  providerMessageId?: string;
  
  // Metadata
  metadata?: Record<string, any>;
}

export interface AnalyticsQuery {
  organizationId: string;
  campaignIds?: string[];
  emailIds?: string[];
  contactIds?: string[];
  eventTypes?: EmailEvent['eventType'][];
  dateRange?: {
    start: Date;
    end: Date;
  };
  groupBy?: 'campaign' | 'email' | 'contact' | 'day' | 'hour';
  limit?: number;
  offset?: number;
}

export interface AnalyticsResult {
  totalEvents: number;
  events: EmailEvent[];
  aggregations?: Record<string, number>;
  groupedResults?: Record<string, EmailEvent[]>;
}

export interface CampaignPerformanceMetrics {
  campaignId: string;
  campaignName: string;
  
  // Send metrics
  totalSent: number;
  totalDelivered: number;
  totalBounced: number;
  totalFailed: number;
  
  // Engagement metrics
  totalOpens: number;
  uniqueOpens: number;
  totalClicks: number;
  uniqueClicks: number;
  unsubscribes: number;
  complaints: number;
  
  // Calculated rates
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  clickToOpenRate: number;
  unsubscribeRate: number;
  complaintRate: number;
  
  // Time-based metrics
  averageTimeToOpen?: number; // In minutes
  averageTimeToClick?: number; // In minutes
  
  // Device/location insights
  topDevices: Array<{ device: string; count: number; percentage: number }>;
  topLocations: Array<{ location: string; count: number; percentage: number }>;
  
  // Link performance (for emails with links)
  topLinks?: Array<{ url: string; clicks: number; uniqueClicks: number }>;
}

export class EmailAnalytics {
  private events: EmailEvent[] = [];
  private campaignMetrics: Map<string, CampaignMetrics> = new Map();

  /**
   * Track an email event
   */
  async trackEvent(event: Omit<EmailEvent, 'id' | 'timestamp'>): Promise<EmailEvent> {
    const emailEvent: EmailEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
    };

    this.events.push(emailEvent);
    
    // Update campaign metrics if this is a campaign email
    if (event.campaignId) {
      await this.updateCampaignMetrics(event.campaignId, emailEvent);
    }

    return emailEvent;
  }

  /**
   * Query events with filtering and aggregation
   */
  async queryEvents(query: AnalyticsQuery): Promise<AnalyticsResult> {
    let filteredEvents = this.events.filter(event => 
      this.eventMatchesQuery(event, query)
    );

    // Apply sorting (most recent first)
    filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    const paginatedEvents = filteredEvents.slice(offset, offset + limit);

    const result: AnalyticsResult = {
      totalEvents: filteredEvents.length,
      events: paginatedEvents,
    };

    // Add aggregations if requested
    if (query.groupBy) {
      result.groupedResults = this.groupEvents(filteredEvents, query.groupBy);
      result.aggregations = this.calculateAggregations(filteredEvents);
    }

    return result;
  }

  /**
   * Get campaign metrics
   */
  async getCampaignMetrics(campaignId: string): Promise<CampaignMetrics> {
    let metrics = this.campaignMetrics.get(campaignId);
    
    if (!metrics) {
      // Calculate metrics from events
      metrics = await this.calculateCampaignMetrics(campaignId);
      this.campaignMetrics.set(campaignId, metrics);
    }

    return metrics;
  }

  /**
   * Get campaign performance with detailed insights
   */
  async getCampaignPerformance(campaignId: string): Promise<CampaignPerformanceMetrics> {
    const events = this.events.filter(event => event.campaignId === campaignId);
    const metrics = await this.getCampaignMetrics(campaignId);

    // Calculate engagement timing
    const openEvents = events.filter(e => e.eventType === 'opened');
    const clickEvents = events.filter(e => e.eventType === 'clicked');
    const sentEvents = events.filter(e => e.eventType === 'sent');

    const averageTimeToOpen = this.calculateAverageTimeToEvent(sentEvents, openEvents);
    const averageTimeToClick = this.calculateAverageTimeToEvent(sentEvents, clickEvents);

    // Analyze devices and locations
    const topDevices = this.analyzeDevices(openEvents);
    const topLocations = this.analyzeLocations(openEvents);

    // Analyze link performance
    const topLinks = this.analyzeLinkPerformance(clickEvents);

    return {
      campaignId,
      campaignName: `Campaign ${campaignId}`, // Would come from campaign data
      ...metrics,
      averageTimeToOpen,
      averageTimeToClick,
      topDevices,
      topLocations,
      topLinks,
    };
  }

  /**
   * Get real-time analytics dashboard data
   */
  async getDashboardMetrics(organizationId: string, timeframe: '24h' | '7d' | '30d' = '7d'): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    trendData: Array<{ date: string; sent: number; opened: number; clicked: number }>;
  }> {
    const cutoffDate = new Date();
    
    switch (timeframe) {
      case '24h':
        cutoffDate.setHours(cutoffDate.getHours() - 24);
        break;
      case '7d':
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(cutoffDate.getDate() - 30);
        break;
    }

    const recentEvents = this.events.filter(event => 
      event.organizationId === organizationId && 
      event.timestamp >= cutoffDate
    );

    const totalSent = recentEvents.filter(e => e.eventType === 'sent').length;
    const totalDelivered = recentEvents.filter(e => e.eventType === 'delivered').length;
    const totalOpened = recentEvents.filter(e => e.eventType === 'opened').length;
    const totalClicked = recentEvents.filter(e => e.eventType === 'clicked').length;

    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
    const clickRate = totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0;

    // Generate trend data
    const trendData = this.generateTrendData(recentEvents, timeframe);

    return {
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      deliveryRate,
      openRate,
      clickRate,
      trendData,
    };
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(
    organizationId: string,
    format: 'csv' | 'json',
    query?: Partial<AnalyticsQuery>
  ): Promise<string> {
    const fullQuery: AnalyticsQuery = {
      organizationId,
      ...query,
      limit: undefined, // Export all data
    };

    const result = await this.queryEvents(fullQuery);

    if (format === 'csv') {
      return this.convertToCSV(result.events);
    } else {
      return JSON.stringify(result, null, 2);
    }
  }

  /**
   * Private methods
   */

  private eventMatchesQuery(event: EmailEvent, query: AnalyticsQuery): boolean {
    // Organization filter
    if (event.organizationId !== query.organizationId) {
      return false;
    }

    // Campaign filter
    if (query.campaignIds && query.campaignIds.length > 0) {
      if (!event.campaignId || !query.campaignIds.includes(event.campaignId)) {
        return false;
      }
    }

    // Email filter
    if (query.emailIds && query.emailIds.length > 0) {
      if (!query.emailIds.includes(event.emailId)) {
        return false;
      }
    }

    // Contact filter
    if (query.contactIds && query.contactIds.length > 0) {
      if (!query.contactIds.includes(event.contactId)) {
        return false;
      }
    }

    // Event type filter
    if (query.eventTypes && query.eventTypes.length > 0) {
      if (!query.eventTypes.includes(event.eventType)) {
        return false;
      }
    }

    // Date range filter
    if (query.dateRange) {
      if (event.timestamp < query.dateRange.start || event.timestamp > query.dateRange.end) {
        return false;
      }
    }

    return true;
  }

  private groupEvents(events: EmailEvent[], groupBy: string): Record<string, EmailEvent[]> {
    const grouped: Record<string, EmailEvent[]> = {};

    for (const event of events) {
      let key: string;

      switch (groupBy) {
        case 'campaign':
          key = event.campaignId || 'no-campaign';
          break;
        case 'email':
          key = event.emailId;
          break;
        case 'contact':
          key = event.contactId;
          break;
        case 'day':
          key = event.timestamp.toISOString().split('T')[0];
          break;
        case 'hour':
          key = event.timestamp.toISOString().split(':')[0] + ':00';
          break;
        default:
          key = 'all';
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(event);
    }

    return grouped;
  }

  private calculateAggregations(events: EmailEvent[]): Record<string, number> {
    const aggregations: Record<string, number> = {};

    // Count by event type
    for (const event of events) {
      const key = `${event.eventType}_count`;
      aggregations[key] = (aggregations[key] || 0) + 1;
    }

    return aggregations;
  }

  private async calculateCampaignMetrics(campaignId: string): Promise<CampaignMetrics> {
    const events = this.events.filter(event => event.campaignId === campaignId);

    const totalSent = events.filter(e => e.eventType === 'sent').length;
    const totalDelivered = events.filter(e => e.eventType === 'delivered').length;
    const totalBounced = events.filter(e => e.eventType === 'bounced').length;
    const totalFailed = events.filter(e => e.eventType === 'failed').length;

    const totalOpens = events.filter(e => e.eventType === 'opened').length;
    const uniqueOpens = new Set(events.filter(e => e.eventType === 'opened').map(e => e.contactId)).size;

    const totalClicks = events.filter(e => e.eventType === 'clicked').length;
    const uniqueClicks = new Set(events.filter(e => e.eventType === 'clicked').map(e => e.contactId)).size;

    const unsubscribes = events.filter(e => e.eventType === 'unsubscribed').length;
    const complaints = events.filter(e => e.eventType === 'complained').length;

    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    const openRate = totalDelivered > 0 ? (uniqueOpens / totalDelivered) * 100 : 0;
    const clickRate = totalDelivered > 0 ? (uniqueClicks / totalDelivered) * 100 : 0;
    const clickToOpenRate = uniqueOpens > 0 ? (uniqueClicks / uniqueOpens) * 100 : 0;
    const unsubscribeRate = totalDelivered > 0 ? (unsubscribes / totalDelivered) * 100 : 0;
    const complaintRate = totalDelivered > 0 ? (complaints / totalDelivered) * 100 : 0;

    const sentEvents = events.filter(e => e.eventType === 'sent');
    const firstSentAt = sentEvents.length > 0 ? new Date(Math.min(...sentEvents.map(e => e.timestamp.getTime()))) : undefined;
    const lastSentAt = sentEvents.length > 0 ? new Date(Math.max(...sentEvents.map(e => e.timestamp.getTime()))) : undefined;

    return {
      campaignId,
      totalSent,
      totalDelivered,
      totalBounced,
      totalFailed,
      totalOpens,
      uniqueOpens,
      totalClicks,
      uniqueClicks,
      unsubscribes,
      complaints,
      deliveryRate,
      openRate,
      clickRate,
      clickToOpenRate,
      unsubscribeRate,
      complaintRate,
      lastUpdated: new Date(),
      firstSentAt,
      lastSentAt,
    };
  }

  private async updateCampaignMetrics(campaignId: string, event: EmailEvent): Promise<void> {
    // This would typically update metrics incrementally for performance
    // For now, we'll recalculate on next request
    this.campaignMetrics.delete(campaignId);
  }

  private calculateAverageTimeToEvent(sentEvents: EmailEvent[], actionEvents: EmailEvent[]): number | undefined {
    const timeDiffs: number[] = [];

    for (const actionEvent of actionEvents) {
      const sentEvent = sentEvents.find(e => e.contactId === actionEvent.contactId);
      if (sentEvent) {
        const timeDiff = actionEvent.timestamp.getTime() - sentEvent.timestamp.getTime();
        timeDiffs.push(timeDiff / (1000 * 60)); // Convert to minutes
      }
    }

    return timeDiffs.length > 0 ? timeDiffs.reduce((a, b) => a + b) / timeDiffs.length : undefined;
  }

  private analyzeDevices(events: EmailEvent[]): Array<{ device: string; count: number; percentage: number }> {
    const deviceCounts: Record<string, number> = {};
    
    for (const event of events) {
      if (event.userAgent) {
        const device = this.extractDeviceFromUserAgent(event.userAgent);
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      }
    }

    const total = Object.values(deviceCounts).reduce((a, b) => a + b, 0);
    
    return Object.entries(deviceCounts)
      .map(([device, count]) => ({
        device,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private analyzeLocations(events: EmailEvent[]): Array<{ location: string; count: number; percentage: number }> {
    const locationCounts: Record<string, number> = {};
    
    for (const event of events) {
      if (event.location?.country) {
        const location = event.location.city 
          ? `${event.location.city}, ${event.location.country}`
          : event.location.country;
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      }
    }

    const total = Object.values(locationCounts).reduce((a, b) => a + b, 0);
    
    return Object.entries(locationCounts)
      .map(([location, count]) => ({
        location,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private analyzeLinkPerformance(clickEvents: EmailEvent[]): Array<{ url: string; clicks: number; uniqueClicks: number }> {
    const linkData: Record<string, { clicks: number; contacts: Set<string> }> = {};
    
    for (const event of clickEvents) {
      if (event.linkUrl) {
        if (!linkData[event.linkUrl]) {
          linkData[event.linkUrl] = { clicks: 0, contacts: new Set() };
        }
        linkData[event.linkUrl].clicks++;
        linkData[event.linkUrl].contacts.add(event.contactId);
      }
    }

    return Object.entries(linkData)
      .map(([url, data]) => ({
        url,
        clicks: data.clicks,
        uniqueClicks: data.contacts.size,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);
  }

  private generateTrendData(events: EmailEvent[], timeframe: string): Array<{ date: string; sent: number; opened: number; clicked: number }> {
    const trendData: Record<string, { sent: number; opened: number; clicked: number }> = {};
    
    for (const event of events) {
      const dateKey = event.timestamp.toISOString().split('T')[0];
      
      if (!trendData[dateKey]) {
        trendData[dateKey] = { sent: 0, opened: 0, clicked: 0 };
      }
      
      switch (event.eventType) {
        case 'sent':
          trendData[dateKey].sent++;
          break;
        case 'opened':
          trendData[dateKey].opened++;
          break;
        case 'clicked':
          trendData[dateKey].clicked++;
          break;
      }
    }

    return Object.entries(trendData)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private extractDeviceFromUserAgent(userAgent: string): string {
    // Simple device detection logic
    if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
      return 'Mobile';
    } else if (userAgent.includes('iPad') || userAgent.includes('Tablet')) {
      return 'Tablet';
    } else {
      return 'Desktop';
    }
  }

  private convertToCSV(events: EmailEvent[]): string {
    const headers = [
      'id', 'eventType', 'emailId', 'contactId', 'campaignId', 'timestamp',
      'userAgent', 'ipAddress', 'linkUrl', 'bounceType', 'errorMessage'
    ];

    const csvRows = [headers.join(',')];
    
    for (const event of events) {
      const row = headers.map(header => {
        const value = event[header as keyof EmailEvent];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value || '';
      });
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}