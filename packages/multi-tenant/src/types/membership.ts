export type MembershipRole = 'owner' | 'admin' | 'member' | 'viewer' | 'guest';
export type MembershipStatus = 'active' | 'pending' | 'suspended' | 'removed';

export interface Membership {
  id: string;
  user_id: string;
  organization_id: string;
  role: MembershipRole;
  status: MembershipStatus;
  permissions: string[];
  custom_permissions?: string[];
  joined_at: string;
  invited_by?: string;
  last_active_at?: string;
  suspended_at?: string;
  suspended_reason?: string;
  removed_at?: string;
  removed_by?: string;
  removed_reason?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MembershipWithUser extends Membership {
  user: {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
    last_seen_at?: string;
  };
}

export interface MembershipWithOrganization extends Membership {
  organization: {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
  };
}

export interface OrganizationInvitation {
  id: string;
  organization_id: string;
  email: string;
  role: MembershipRole;
  permissions?: string[];
  token: string;
  invited_by: string;
  invited_by_name?: string;
  message?: string;
  expires_at: string;
  accepted_at?: string;
  accepted_by?: string;
  declined_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface InviteMemberData {
  email: string;
  role: MembershipRole;
  permissions?: string[];
  message?: string;
  send_email?: boolean;
}

export interface BulkInviteData {
  invitations: Array<{
    email: string;
    role: MembershipRole;
    permissions?: string[];
  }>;
  message?: string;
  send_emails?: boolean;
}

export interface UpdateMemberData {
  role?: MembershipRole;
  permissions?: string[];
  custom_permissions?: string[];
  status?: MembershipStatus;
  metadata?: Record<string, any>;
}

export interface MemberActivity {
  id: string;
  user_id: string;
  organization_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}