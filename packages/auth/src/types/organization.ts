// Organization and multi-tenancy types

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  size?: OrganizationSize;
  plan: SubscriptionPlan;
  settings: OrganizationSettings;
  billing: BillingInfo;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type OrganizationSize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';

export interface OrganizationSettings {
  allowMemberInvites: boolean;
  requireEmailVerification: boolean;
  requireTwoFactor: boolean;
  sessionTimeout: number; // minutes
  ipWhitelist: string[];
  ssoEnabled: boolean;
  ssoProvider?: string;
  customDomain?: string;
  brandingEnabled: boolean;
}

export interface BillingInfo {
  customerId?: string;
  subscriptionId?: string;
  plan: SubscriptionPlan;
  status: BillingStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  paymentMethod?: PaymentMethod;
}

export type SubscriptionPlan = 'free' | 'starter' | 'professional' | 'enterprise';
export type BillingStatus = 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface Membership {
  id: string;
  userId: string;
  organizationId: string;
  role: MembershipRole;
  status: MembershipStatus;
  permissions: string[];
  invitedBy?: string;
  invitedAt?: Date;
  joinedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type MembershipRole = 'owner' | 'admin' | 'member' | 'viewer' | 'billing';
export type MembershipStatus = 'active' | 'pending' | 'suspended' | 'removed';

export interface MembershipWithUser extends Membership {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    lastSeenAt?: Date;
  };
}

export interface MembershipWithOrganization extends Membership {
  organization: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
  };
}

export interface OrganizationInvitation {
  id: string;
  email: string;
  organizationId: string;
  role: MembershipRole;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}

export interface CreateOrganizationData {
  name: string;
  slug?: string;
  description?: string;
  industry?: string;
  size?: OrganizationSize;
  website?: string;
}

export interface UpdateOrganizationData {
  name?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  size?: OrganizationSize;
  settings?: Partial<OrganizationSettings>;
}

export interface InviteMemberData {
  email: string;
  role: MembershipRole;
  permissions?: string[];
  message?: string;
}

export interface OrganizationUsage {
  users: number;
  projects: number;
  storage: number; // bytes
  bandwidth: number; // bytes
  apiCalls: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface OrganizationLimits {
  users: number;
  projects: number;
  storage: number; // bytes
  bandwidth: number; // bytes
  apiCalls: number;
}

export interface OrganizationActivity {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Context types
export interface OrganizationContextValue {
  currentOrganization: Organization | null;
  organizations: Organization[];
  memberships: MembershipWithOrganization[];
  currentMembership: Membership | null;
  loading: boolean;
  error: string | null;
  
  // Organization management
  createOrganization: (data: CreateOrganizationData) => Promise<Organization>;
  updateOrganization: (id: string, data: UpdateOrganizationData) => Promise<Organization>;
  deleteOrganization: (id: string) => Promise<void>;
  switchOrganization: (id: string) => Promise<void>;
  
  // Member management
  inviteMember: (data: InviteMemberData) => Promise<OrganizationInvitation>;
  removeMember: (userId: string) => Promise<void>;
  updateMemberRole: (userId: string, role: MembershipRole) => Promise<void>;
  resendInvitation: (invitationId: string) => Promise<void>;
  cancelInvitation: (invitationId: string) => Promise<void>;
  
  // Utilities
  hasPermission: (permission: string) => boolean;
  isOwner: () => boolean;
  isAdmin: () => boolean;
  canInviteMembers: () => boolean;
}