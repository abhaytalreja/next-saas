export * from './organization';
export * from './workspace';
export * from './membership';
export * from './permissions';
export * from './billing';
export * from './audit';

// Context types
export interface TenantContext {
  currentOrganization: Organization | null;
  currentWorkspace: Workspace | null;
  currentMembership: Membership | null;
  userPermissions: string[];
  isLoading: boolean;
  error: Error | null;
}

export interface OrganizationContextValue extends TenantContext {
  organizations: Organization[];
  memberships: MembershipWithOrganization[];
  
  // Organization management
  createOrganization: (data: CreateOrganizationData) => Promise<Organization>;
  updateOrganization: (id: string, data: UpdateOrganizationData) => Promise<Organization>;
  deleteOrganization: (id: string) => Promise<void>;
  switchOrganization: (id: string) => Promise<void>;
  
  // Member management
  inviteMember: (data: InviteMemberData) => Promise<OrganizationInvitation>;
  bulkInviteMembers: (data: BulkInviteData) => Promise<OrganizationInvitation[]>;
  removeMember: (userId: string) => Promise<void>;
  updateMemberRole: (userId: string, role: MembershipRole) => Promise<void>;
  updateMemberPermissions: (userId: string, permissions: string[]) => Promise<void>;
  suspendMember: (userId: string, reason?: string) => Promise<void>;
  reactivateMember: (userId: string) => Promise<void>;
  
  // Invitation management
  resendInvitation: (invitationId: string) => Promise<void>;
  cancelInvitation: (invitationId: string) => Promise<void>;
  acceptInvitation: (token: string) => Promise<void>;
  
  // Permission helpers
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  canAccessWorkspace: (workspaceId: string) => boolean;
  canAccessProject: (projectId: string) => boolean;
  isOwner: () => boolean;
  isAdmin: () => boolean;
  isMember: () => boolean;
  canInviteMembers: () => boolean;
  canManageWorkspaces: () => boolean;
  canManageBilling: () => boolean;
  
  // Utility functions
  refreshOrganizations: () => Promise<void>;
  refreshCurrentOrganization: () => Promise<void>;
  clearOrganizationData: () => void;
}

export interface WorkspaceContextValue {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  workspaceMembers: WorkspaceMember[];
  isLoading: boolean;
  error: Error | null;
  
  // Workspace management
  createWorkspace: (data: CreateWorkspaceData) => Promise<Workspace>;
  updateWorkspace: (id: string, data: UpdateWorkspaceData) => Promise<Workspace>;
  deleteWorkspace: (id: string) => Promise<void>;
  archiveWorkspace: (id: string) => Promise<void>;
  restoreWorkspace: (id: string) => Promise<void>;
  switchWorkspace: (id: string) => Promise<void>;
  
  // Workspace member management
  addWorkspaceMember: (userId: string, role: 'admin' | 'member' | 'viewer') => Promise<void>;
  removeWorkspaceMember: (userId: string) => Promise<void>;
  updateWorkspaceMemberRole: (userId: string, role: 'admin' | 'member' | 'viewer') => Promise<void>;
  
  // Permission helpers
  canEditWorkspace: () => boolean;
  canDeleteWorkspace: () => boolean;
  canManageWorkspaceMembers: () => boolean;
  
  // Utility functions
  refreshWorkspaces: () => Promise<void>;
  refreshCurrentWorkspace: () => Promise<void>;
}

// Re-export from existing types for compatibility
import type { Organization, CreateOrganizationData, UpdateOrganizationData } from './organization';
import type { Workspace, CreateWorkspaceData, UpdateWorkspaceData, WorkspaceMember } from './workspace';
import type { Membership, MembershipWithOrganization, MembershipRole, OrganizationInvitation, InviteMemberData, BulkInviteData } from './membership';