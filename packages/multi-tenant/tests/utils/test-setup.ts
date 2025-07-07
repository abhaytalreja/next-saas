/**
 * Test setup utilities for multi-tenant functional tests
 * Provides database setup, user creation, and test wrappers
 */

import React from 'react'
import { render } from '@testing-library/react'
import { createClient } from '@supabase/supabase-js'
import { OrganizationProvider } from '../../src/providers/OrganizationProvider'
import { TenantProvider } from '../../src/providers/TenantProvider'
import type { Organization, User } from '../../src/types'

// Test database configuration
const TEST_SUPABASE_URL = process.env.TEST_SUPABASE_URL || 'http://localhost:54321'
const TEST_SUPABASE_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY || 'test-key'

// Global test state
let testCounter = 0
let testDatabase: any = null

/**
 * Creates a test database instance with isolated data
 */
export async function createTestDatabase() {
  testCounter++
  const testId = `test_${testCounter}_${Date.now()}`
  
  const supabase = createClient(TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'x-test-id': testId
      }
    }
  })

  // Set up test schema isolation
  await supabase.rpc('create_test_schema', { test_id: testId })
  
  testDatabase = supabase
  return supabase
}

/**
 * Creates a test user with unique email
 */
export async function createTestUser(customData: Partial<User> = {}): Promise<User> {
  const userId = `user_${testCounter}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const email = customData.email || `${userId}@example.com`
  
  const userData = {
    id: userId,
    email,
    name: customData.name || `Test User ${userId}`,
    avatar_url: customData.avatar_url || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...customData
  }

  // Insert into auth.users (mock)
  await testDatabase.from('auth.users').insert({
    id: userId,
    email,
    email_confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })

  // Insert into profiles
  await testDatabase.from('profiles').insert(userData)

  return userData as User
}

/**
 * Creates a test organization
 */
export async function createTestOrganization(
  createdBy: string,
  customData: Partial<Organization> = {}
): Promise<Organization> {
  const orgId = `org_${testCounter}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const slug = customData.slug || `test-org-${orgId}`
  
  const orgData = {
    id: orgId,
    name: customData.name || `Test Organization ${orgId}`,
    slug,
    domain: customData.domain || null,
    logo_url: customData.logo_url || null,
    settings: customData.settings || {},
    subscription_status: customData.subscription_status || 'trial',
    created_by: createdBy,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...customData
  }

  const result = await testDatabase.from('organizations').insert(orgData).select().single()
  return result.data
}

/**
 * Creates a test workspace
 */
export async function createTestWorkspace(
  organizationId: string,
  createdBy: string,
  customData: any = {}
) {
  const workspaceId = `ws_${testCounter}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const workspaceData = {
    id: workspaceId,
    organization_id: organizationId,
    name: customData.name || `Test Workspace ${workspaceId}`,
    slug: customData.slug || `test-workspace-${workspaceId}`,
    description: customData.description || null,
    is_default: customData.is_default || false,
    created_by: createdBy,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...customData
  }

  const result = await testDatabase.from('workspaces').insert(workspaceData).select().single()
  return result.data
}

/**
 * Adds a user to an organization with specified role
 */
export async function addUserToOrganization(
  userId: string,
  organizationId: string,
  role: 'owner' | 'admin' | 'member' = 'member'
) {
  return await testDatabase.from('organization_members').insert({
    organization_id: organizationId,
    user_id: userId,
    role,
    joined_at: new Date().toISOString()
  })
}

/**
 * Adds a user to a workspace with specified role
 */
export async function addUserToWorkspace(
  userId: string,
  workspaceId: string,
  role: 'admin' | 'member' | 'viewer' = 'member'
) {
  return await testDatabase.from('workspace_members').insert({
    workspace_id: workspaceId,
    user_id: userId,
    role,
    joined_at: new Date().toISOString()
  })
}

/**
 * Creates a complete test hierarchy (org -> workspace -> user membership)
 */
export async function createTestHierarchy(
  ownerUser: User,
  memberUsers: User[] = []
) {
  const org = await createTestOrganization(ownerUser.id)
  await addUserToOrganization(ownerUser.id, org.id, 'owner')

  const workspace = await createTestWorkspace(org.id, ownerUser.id, {
    name: 'Default Workspace',
    is_default: true
  })
  await addUserToWorkspace(ownerUser.id, workspace.id, 'admin')

  // Add member users
  for (const memberUser of memberUsers) {
    await addUserToOrganization(memberUser.id, org.id, 'member')
    await addUserToWorkspace(memberUser.id, workspace.id, 'member')
  }

  return { org, workspace }
}

/**
 * Clean up test data after tests
 */
export async function cleanupTestData(database: any) {
  if (!database) return

  try {
    // Clean up in dependency order
    await database.from('workspace_members').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await database.from('organization_members').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await database.from('organization_invitations').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await database.from('member_permissions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await database.from('custom_roles').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await database.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await database.from('workspaces').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await database.from('organizations').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await database.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await database.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await database.from('auth.users').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  } catch (error) {
    console.warn('Cleanup error:', error)
  }
}

/**
 * Test wrapper component that provides necessary contexts
 */
interface TestWrapperProps {
  children: React.ReactNode
  user: User
  initialOrganization?: Organization
  initialWorkspace?: any
  organizationMode?: 'none' | 'single' | 'multi'
}

export function TestWrapper({
  children,
  user,
  initialOrganization,
  initialWorkspace,
  organizationMode = 'multi'
}: TestWrapperProps) {
  // Mock authentication context
  const mockAuthContext = {
    user,
    session: {
      user,
      access_token: 'test-token'
    },
    isLoading: false,
    error: null
  }

  return (
    <MockAuthProvider value={mockAuthContext}>
      <TenantProvider organizationMode={organizationMode}>
        <OrganizationProvider initialData={{
          currentOrganization: initialOrganization || null,
          organizations: initialOrganization ? [initialOrganization] : [],
          memberships: []
        }}>
          {children}
        </OrganizationProvider>
      </TenantProvider>
    </MockAuthProvider>
  )
}

/**
 * Mock authentication provider for testing
 */
const MockAuthContext = React.createContext<any>(null)

function MockAuthProvider({ children, value }: { children: React.ReactNode, value: any }) {
  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  )
}

/**
 * Helper to wait for async database operations
 */
export async function waitForDatabase(
  operation: () => Promise<any>,
  maxAttempts = 10,
  delay = 100
): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const result = await operation()
      if (result && result.data && result.data.length > 0) {
        return result
      }
    } catch (error) {
      // Continue trying
    }
    
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  
  throw new Error('Database operation timed out')
}

/**
 * Helper to mock RLS context for testing
 */
export async function mockRLSContext(database: any, userId: string, organizationId?: string) {
  return database.rpc('set_test_context', {
    user_id: userId,
    organization_id: organizationId
  })
}

/**
 * Helper to create test invitation
 */
export async function createTestInvitation(
  organizationId: string,
  email: string,
  role: string,
  invitedBy: string
) {
  const token = `test_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  return await testDatabase.from('organization_invitations').insert({
    organization_id: organizationId,
    email,
    role,
    token,
    invited_by: invitedBy,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  }).select().single()
}

/**
 * Helper to simulate user interaction delays
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Helper to get current timestamp
 */
export const now = () => new Date().toISOString()

/**
 * Helper to create test audit log entry
 */
export async function createTestAuditLog(
  organizationId: string,
  actorId: string,
  action: string,
  resourceType: string,
  changes: any = {}
) {
  return await testDatabase.from('audit_logs').insert({
    organization_id: organizationId,
    actor_id: actorId,
    action,
    resource_type: resourceType,
    changes,
    result: 'success',
    created_at: now()
  })
}

/**
 * Helper to verify data isolation between organizations
 */
export async function verifyDataIsolation(
  database: any,
  userId: string,
  ownOrgId: string,
  otherOrgId: string
) {
  const checks = []

  // Check organizations table
  const orgsAccess = await database
    .from('organizations')
    .select('id')
    .as({ user_id: userId })

  const accessibleOrgIds = orgsAccess.data.map((org: any) => org.id)
  checks.push({
    table: 'organizations',
    hasOwnOrg: accessibleOrgIds.includes(ownOrgId),
    hasOtherOrg: accessibleOrgIds.includes(otherOrgId)
  })

  // Check workspaces table
  const workspacesAccess = await database
    .from('workspaces')
    .select('organization_id')
    .as({ user_id: userId })

  const accessibleWorkspaceOrgIds = workspacesAccess.data.map((ws: any) => ws.organization_id)
  checks.push({
    table: 'workspaces',
    hasOwnOrg: accessibleWorkspaceOrgIds.includes(ownOrgId),
    hasOtherOrg: accessibleWorkspaceOrgIds.includes(otherOrgId)
  })

  return checks
}

/**
 * Performance testing helper
 */
export async function measureQueryPerformance(
  operation: () => Promise<any>,
  description: string
) {
  const start = performance.now()
  const result = await operation()
  const duration = performance.now() - start

  console.log(`Query Performance [${description}]: ${duration.toFixed(2)}ms`)
  
  return { result, duration }
}