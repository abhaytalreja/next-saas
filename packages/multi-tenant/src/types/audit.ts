export interface AuditLog {
  id: string;
  organization_id: string;
  workspace_id?: string;
  project_id?: string;
  actor_id: string;
  actor_type: 'user' | 'system' | 'api';
  actor_name?: string;
  actor_email?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  resource_name?: string;
  changes?: AuditChanges;
  result: 'success' | 'failure' | 'partial';
  error_message?: string;
  ip_address?: string;
  user_agent?: string;
  location?: AuditLocation;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AuditChanges {
  before?: Record<string, any>;
  after?: Record<string, any>;
  fields_changed?: string[];
}

export interface AuditLocation {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface AuditEvent {
  action: string;
  resource_type: string;
  resource_id?: string;
  resource_name?: string;
  changes?: AuditChanges;
  metadata?: Record<string, any>;
}

// Audit event types
export const AUDIT_EVENTS = {
  // Organization events
  ORGANIZATION_CREATED: 'organization.created',
  ORGANIZATION_UPDATED: 'organization.updated',
  ORGANIZATION_DELETED: 'organization.deleted',
  ORGANIZATION_SETTINGS_UPDATED: 'organization.settings.updated',
  ORGANIZATION_BILLING_UPDATED: 'organization.billing.updated',
  
  // Member events
  MEMBER_INVITED: 'member.invited',
  MEMBER_JOINED: 'member.joined',
  MEMBER_ROLE_UPDATED: 'member.role.updated',
  MEMBER_PERMISSIONS_UPDATED: 'member.permissions.updated',
  MEMBER_SUSPENDED: 'member.suspended',
  MEMBER_REMOVED: 'member.removed',
  
  // Workspace events
  WORKSPACE_CREATED: 'workspace.created',
  WORKSPACE_UPDATED: 'workspace.updated',
  WORKSPACE_ARCHIVED: 'workspace.archived',
  WORKSPACE_RESTORED: 'workspace.restored',
  WORKSPACE_DELETED: 'workspace.deleted',
  
  // Project events
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
  PROJECT_DELETED: 'project.deleted',
  
  // Security events
  LOGIN_SUCCESS: 'auth.login.success',
  LOGIN_FAILED: 'auth.login.failed',
  LOGOUT: 'auth.logout',
  PASSWORD_CHANGED: 'auth.password.changed',
  TWO_FACTOR_ENABLED: 'auth.2fa.enabled',
  TWO_FACTOR_DISABLED: 'auth.2fa.disabled',
  API_KEY_CREATED: 'security.api_key.created',
  API_KEY_REVOKED: 'security.api_key.revoked',
  
  // Data events
  DATA_EXPORTED: 'data.exported',
  DATA_IMPORTED: 'data.imported',
  DATA_DELETED: 'data.deleted',
  
  // Billing events
  SUBSCRIPTION_CREATED: 'billing.subscription.created',
  SUBSCRIPTION_UPDATED: 'billing.subscription.updated',
  SUBSCRIPTION_CANCELLED: 'billing.subscription.cancelled',
  PAYMENT_SUCCESS: 'billing.payment.success',
  PAYMENT_FAILED: 'billing.payment.failed',
} as const;

export type AuditEventType = typeof AUDIT_EVENTS[keyof typeof AUDIT_EVENTS];

export interface AuditLogFilter {
  organization_id?: string;
  workspace_id?: string;
  project_id?: string;
  actor_id?: string;
  action?: string | string[];
  resource_type?: string | string[];
  resource_id?: string;
  result?: 'success' | 'failure' | 'partial';
  date_from?: string;
  date_to?: string;
  ip_address?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogExport {
  format: 'csv' | 'json' | 'pdf';
  filters: AuditLogFilter;
  include_metadata?: boolean;
  include_changes?: boolean;
}

export interface ComplianceReport {
  organization_id: string;
  report_type: 'gdpr' | 'soc2' | 'hipaa' | 'pci' | 'custom';
  period_start: string;
  period_end: string;
  generated_at: string;
  generated_by: string;
  summary: ComplianceSummary;
  details: Record<string, any>;
  recommendations: string[];
}

export interface ComplianceSummary {
  total_events: number;
  security_incidents: number;
  data_breaches: number;
  unauthorized_access_attempts: number;
  compliance_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}