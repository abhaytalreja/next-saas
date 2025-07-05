import { useEffect, useState } from 'react';

// Get organization mode from environment
function getOrganizationMode(): 'none' | 'single' | 'multi' {
  const mode = process.env.NEXT_PUBLIC_ORGANIZATION_MODE as 'none' | 'single' | 'multi';
  return mode || 'single';
}

// Simple types for now
interface User {
  id: string;
  email?: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
}

// Mock auth hook for now
function useAuth() {
  return {
    user: null as User | null,
  };
}

/**
 * Hook to handle organization context based on the app's organization mode
 * 
 * - 'none': Returns null, no organization context
 * - 'single': Returns the user's default organization
 * - 'multi': Returns the current active organization
 */
export function useOrganization() {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const mode = getOrganizationMode();

  useEffect(() => {
    if (!user) {
      setOrganization(null);
      setLoading(false);
      return;
    }

    if (mode === 'none') {
      // No organizations in this mode
      setOrganization(null);
      setLoading(false);
      return;
    }

    // For single and multi modes, we need to fetch organization
    // This is a simplified version - in a real app, you'd want to:
    // - For 'single': Always fetch the user's default org
    // - For 'multi': Get from URL/context/localStorage
    
    setLoading(false);
  }, [user, mode]);

  return {
    organization,
    loading,
    mode,
    // Helper to check if organizations are enabled
    hasOrganizations: mode !== 'none',
    // Helper to check if multiple orgs are supported
    supportsMultipleOrgs: mode === 'multi',
  };
}

/**
 * Hook to get the current context ID (user or organization)
 * This abstracts away the difference between user-centric and org-centric apps
 */
export function useContextId(): string | null {
  const { user } = useAuth();
  const { organization, mode } = useOrganization();

  if (mode === 'none') {
    return user?.id || null;
  }

  return organization?.id || null;
}

/**
 * Hook to build resource queries based on organization mode
 */
export function useResourceQuery() {
  const { user } = useAuth();
  const { organization, mode } = useOrganization();

  return {
    // Get the owner field name
    ownerField: mode === 'none' ? 'user_id' : 'organization_id',
    
    // Get the owner ID
    ownerId: mode === 'none' ? user?.id : organization?.id,
    
    // Build a query filter
    buildFilter: () => {
      if (mode === 'none') {
        return { user_id: user?.id };
      }
      return { organization_id: organization?.id };
    },
  };
}