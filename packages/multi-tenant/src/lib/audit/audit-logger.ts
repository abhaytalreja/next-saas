import type { AuditEvent, AuditLog } from '../../types';

export class AuditLogger {
  private supabase: any;
  private queue: AuditEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
    this.startFlushInterval();
  }

  /**
   * Log an audit event
   */
  async log(event: AuditEvent): Promise<void> {
    // Add to queue for batch processing
    this.queue.push(event);

    // Flush immediately for critical events
    if (this.isCriticalEvent(event.action)) {
      await this.flush();
    }
  }

  /**
   * Log a failed action
   */
  async logFailure(
    event: AuditEvent,
    error: Error | string
  ): Promise<void> {
    await this.log({
      ...event,
      result: 'failure',
      error_message: typeof error === 'string' ? error : error.message,
    } as any);
  }

  /**
   * Flush queued events to database
   */
  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      // Get current user and organization context
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return;

      // Get user's current organization from session or context
      const orgId = await this.getCurrentOrganizationId();
      if (!orgId) return;

      // Prepare audit logs
      const logs = events.map(event => ({
        organization_id: orgId,
        actor_id: user.id,
        actor_type: 'user',
        actor_email: user.email,
        action: event.action,
        resource_type: event.resource_type,
        resource_id: event.resource_id,
        resource_name: event.resource_name,
        changes: event.changes,
        result: 'success',
        metadata: event.metadata,
        ip_address: this.getClientIP(),
        user_agent: this.getUserAgent(),
      }));

      // Insert logs
      const { error } = await this.supabase
        .from('audit_logs')
        .insert(logs);

      if (error) {
        console.error('Failed to write audit logs:', error);
        // Re-queue failed events
        this.queue.unshift(...events);
      }
    } catch (error) {
      console.error('Error flushing audit logs:', error);
      // Re-queue failed events
      this.queue.unshift(...events);
    }
  }

  /**
   * Start periodic flush interval
   */
  private startFlushInterval(): void {
    // Flush every 5 seconds
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 5000);
  }

  /**
   * Stop flush interval
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    // Flush any remaining events
    this.flush();
  }

  /**
   * Check if event is critical and should be logged immediately
   */
  private isCriticalEvent(action: string): boolean {
    const criticalEvents = [
      'organization.deleted',
      'member.removed',
      'auth.login.failed',
      'security.breach.detected',
      'billing.payment.failed',
      'data.deleted',
    ];

    return criticalEvents.includes(action);
  }

  /**
   * Get current organization ID from context
   */
  private async getCurrentOrganizationId(): Promise<string | null> {
    // This would typically come from your app's context
    // For now, we'll try to get it from localStorage or session
    if (typeof window !== 'undefined') {
      return localStorage.getItem('last_organization_id');
    }
    return null;
  }

  /**
   * Get client IP address
   */
  private getClientIP(): string | null {
    if (typeof window === 'undefined') return null;
    
    // This would typically come from request headers
    // For client-side, we can't get the real IP
    return null;
  }

  /**
   * Get user agent
   */
  private getUserAgent(): string | null {
    if (typeof window === 'undefined') return null;
    return window.navigator.userAgent;
  }

  /**
   * Query audit logs
   */
  async query(filters: {
    organization_id?: string;
    actor_id?: string;
    action?: string | string[];
    resource_type?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditLog[]> {
    let query = this.supabase
      .from('audit_logs')
      .select('*');

    if (filters.organization_id) {
      query = query.eq('organization_id', filters.organization_id);
    }

    if (filters.actor_id) {
      query = query.eq('actor_id', filters.actor_id);
    }

    if (filters.action) {
      if (Array.isArray(filters.action)) {
        query = query.in('action', filters.action);
      } else {
        query = query.eq('action', filters.action);
      }
    }

    if (filters.resource_type) {
      query = query.eq('resource_type', filters.resource_type);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    query = query
      .order('created_at', { ascending: false })
      .limit(filters.limit || 100);

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 100) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to query audit logs: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Export audit logs
   */
  async export(format: 'csv' | 'json', filters: any): Promise<string> {
    const logs = await this.query(filters);

    switch (format) {
      case 'json':
        return JSON.stringify(logs, null, 2);
      
      case 'csv':
        return this.convertToCSV(logs);
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Convert logs to CSV format
   */
  private convertToCSV(logs: AuditLog[]): string {
    if (logs.length === 0) return '';

    const headers = [
      'Timestamp',
      'Actor',
      'Action',
      'Resource Type',
      'Resource ID',
      'Result',
      'IP Address',
      'User Agent',
    ];

    const rows = logs.map(log => [
      log.created_at,
      log.actor_email || log.actor_id,
      log.action,
      log.resource_type,
      log.resource_id || '',
      log.result,
      log.ip_address || '',
      log.user_agent || '',
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
  }
}