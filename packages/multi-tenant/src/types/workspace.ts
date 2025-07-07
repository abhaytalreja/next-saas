export interface Workspace {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  settings: WorkspaceSettings;
  is_default: boolean;
  is_archived: boolean;
  metadata: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface WorkspaceSettings {
  visibility: 'public' | 'private' | 'organization';
  allowGuestAccess: boolean;
  defaultProjectType: string;
  projectLimit: number;
  storageLimit: number; // in MB
  apiRateLimit: number; // requests per hour
  features: WorkspaceFeatures;
  integrations: WorkspaceIntegrations;
}

export interface WorkspaceFeatures {
  kanbanBoard: boolean;
  calendar: boolean;
  timeline: boolean;
  forms: boolean;
  automation: boolean;
  reporting: boolean;
  api: boolean;
  webhooks: boolean;
}

export interface WorkspaceIntegrations {
  slack?: {
    enabled: boolean;
    webhookUrl?: string;
    channel?: string;
  };
  github?: {
    enabled: boolean;
    org?: string;
    repo?: string;
  };
  jira?: {
    enabled: boolean;
    projectKey?: string;
  };
}

export interface CreateWorkspaceData {
  organization_id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  settings?: Partial<WorkspaceSettings>;
}

export interface UpdateWorkspaceData {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  settings?: Partial<WorkspaceSettings>;
  is_archived?: boolean;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'viewer';
  permissions: string[];
  joined_at: string;
  last_accessed_at?: string;
}