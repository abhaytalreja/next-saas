/**
 * Organization Mode Configuration
 * 
 * This defines how organizations (teams/workspaces) work in your app.
 * Choose the mode that best fits your use case.
 */

export type OrganizationMode = 'none' | 'single' | 'multi';

export interface OrganizationConfig {
  mode: OrganizationMode;
  features: {
    invites: boolean;
    roles: boolean;
    billing: 'user' | 'organization';
    customDomains: boolean;
  };
}

/**
 * Organization Modes:
 * 
 * 1. 'none' - No organizations, user-centric app
 *    - Best for: Personal tools, individual subscriptions
 *    - Examples: Personal todo app, individual learning platform
 *    - Structure: Users own resources directly
 * 
 * 2. 'single' - One organization per user (auto-created)
 *    - Best for: Apps that might add teams later
 *    - Examples: Freelancer tools, small business apps
 *    - Structure: Each user gets a default organization
 * 
 * 3. 'multi' - Multiple organizations per user
 *    - Best for: Team collaboration, B2B SaaS
 *    - Examples: Slack, Notion, Linear
 *    - Structure: Users can create/join multiple organizations
 */

export const organizationModes: Record<OrganizationMode, OrganizationConfig> = {
  none: {
    mode: 'none',
    features: {
      invites: false,
      roles: false,
      billing: 'user',
      customDomains: false,
    },
  },
  single: {
    mode: 'single',
    features: {
      invites: false,
      roles: false,
      billing: 'organization',
      customDomains: false,
    },
  },
  multi: {
    mode: 'multi',
    features: {
      invites: true,
      roles: true,
      billing: 'organization',
      customDomains: true,
    },
  },
};

// Get the current mode from environment or default
export function getOrganizationMode(): OrganizationMode {
  const mode = process.env.NEXT_PUBLIC_ORGANIZATION_MODE as OrganizationMode;
  return mode || 'single'; // Default to single org per user
}

export function getOrganizationConfig(): OrganizationConfig {
  const mode = getOrganizationMode();
  return organizationModes[mode];
}