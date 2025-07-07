/**
 * Comprehensive data isolation tests
 * Tests Row Level Security policies and multi-tenant data separation
 */

import { describe, it, expect, beforeEach, afterEach } from 'jest'
import { 
  createTestDatabase, 
  createTestUser, 
  createTestOrganization,
  createTestWorkspace,
  addUserToOrganization,
  addUserToWorkspace,
  cleanupTestData,
  mockRLSContext,
  verifyDataIsolation,
  measureQueryPerformance
} from '../utils/test-setup'
import type { User, Organization, Workspace } from '../../src/types'

describe('Data Isolation and Security Tests', () => {
  let testDb: any
  let org1: Organization
  let org2: Organization
  let user1: User
  let user2: User
  let user3: User // Cross-org user
  let workspace1: any
  let workspace2: any

  beforeEach(async () => {
    testDb = await createTestDatabase()
    
    // Create test users
    user1 = await createTestUser()
    user2 = await createTestUser()
    user3 = await createTestUser()

    // Create separate organizations
    org1 = await createTestOrganization(user1.id, {
      name: 'Organization Alpha',
      slug: 'org-alpha'
    })
    
    org2 = await createTestOrganization(user2.id, {
      name: 'Organization Beta',
      slug: 'org-beta'
    })

    // Set up organization memberships
    await addUserToOrganization(user1.id, org1.id, 'owner')
    await addUserToOrganization(user2.id, org2.id, 'owner')
    await addUserToOrganization(user3.id, org1.id, 'member') // Cross-org member

    // Create workspaces
    workspace1 = await createTestWorkspace(org1.id, user1.id, {
      name: 'Alpha Workspace',
      slug: 'alpha-ws'
    })
    
    workspace2 = await createTestWorkspace(org2.id, user2.id, {
      name: 'Beta Workspace',
      slug: 'beta-ws'
    })

    await addUserToWorkspace(user1.id, workspace1.id, 'admin')
    await addUserToWorkspace(user2.id, workspace2.id, 'admin')
    await addUserToWorkspace(user3.id, workspace1.id, 'member')
  })

  afterEach(async () => {
    await cleanupTestData(testDb)
  })

  describe('Organization Data Isolation', () => {
    it('should prevent users from accessing other organizations data', async () => {
      // Set RLS context for user1
      await mockRLSContext(testDb, user1.id, org1.id)

      const orgsAccess = await testDb
        .from('organizations')
        .select('*')

      // user1 should only see org1
      expect(orgsAccess.data).toHaveLength(1)
      expect(orgsAccess.data[0].id).toBe(org1.id)
      
      // Verify user1 cannot see org2
      const org2Access = await testDb
        .from('organizations')
        .select('*')
        .eq('id', org2.id)

      expect(org2Access.data).toHaveLength(0)
    })

    it('should allow users to see only their organization memberships', async () => {
      await mockRLSContext(testDb, user1.id, org1.id)

      const memberships = await testDb
        .from('organization_members')
        .select('*')

      // Should only see memberships for org1
      const orgIds = [...new Set(memberships.data.map((m: any) => m.organization_id))]
      expect(orgIds).toEqual([org1.id])
      expect(orgIds).not.toContain(org2.id)
    })

    it('should enforce RLS on organization settings updates', async () => {
      await mockRLSContext(testDb, user1.id, org1.id)

      // user1 should not be able to update org2
      const updateResult = await testDb
        .from('organizations')
        .update({ name: 'Hacked Organization' })
        .eq('id', org2.id)

      expect(updateResult.error).toBeTruthy()
      
      // Verify org2 name unchanged
      const org2Check = await testDb
        .from('organizations')
        .select('name')
        .eq('id', org2.id)
        .as({ user_id: user2.id }) // Query as org2 owner

      expect(org2Check.data[0].name).toBe('Organization Beta')
    })

    it('should prevent deletion of organizations by non-owners', async () => {
      await mockRLSContext(testDb, user3.id, org1.id) // user3 is member, not owner

      const deleteResult = await testDb
        .from('organizations')
        .delete()
        .eq('id', org1.id)

      expect(deleteResult.error).toBeTruthy()
      
      // Verify organization still exists
      const orgCheck = await testDb
        .from('organizations')
        .select('*')
        .eq('id', org1.id)
        .as({ user_id: user1.id })

      expect(orgCheck.data).toHaveLength(1)
    })
  })

  describe('Workspace Data Isolation', () => {
    it('should isolate workspace data by organization', async () => {
      await mockRLSContext(testDb, user1.id, org1.id)

      const workspaces = await testDb
        .from('workspaces')
        .select('*')

      // Should only see workspaces from org1
      expect(workspaces.data).toHaveLength(1)
      expect(workspaces.data[0].organization_id).toBe(org1.id)
      expect(workspaces.data[0].id).toBe(workspace1.id)
    })

    it('should prevent cross-organization workspace access', async () => {
      await mockRLSContext(testDb, user1.id, org1.id)

      // Try to access workspace from org2
      const workspace2Access = await testDb
        .from('workspaces')
        .select('*')
        .eq('id', workspace2.id)

      expect(workspace2Access.data).toHaveLength(0)
    })

    it('should enforce workspace member access controls', async () => {
      await mockRLSContext(testDb, user1.id, org1.id)

      const workspaceMembers = await testDb
        .from('workspace_members')
        .select('*')

      // Should only see members from accessible workspaces
      const workspaceIds = [...new Set(workspaceMembers.data.map((m: any) => m.workspace_id))]
      expect(workspaceIds).toEqual([workspace1.id])
      expect(workspaceIds).not.toContain(workspace2.id)
    })

    it('should prevent adding members to inaccessible workspaces', async () => {
      await mockRLSContext(testDb, user1.id, org1.id)

      // Try to add user1 to workspace2 (from different org)
      const addResult = await testDb
        .from('workspace_members')
        .insert({
          workspace_id: workspace2.id,
          user_id: user1.id,
          role: 'member'
        })

      expect(addResult.error).toBeTruthy()
    })
  })

  describe('Project Data Isolation', () => {
    let project1: any
    let project2: any

    beforeEach(async () => {
      // Create projects in different organizations
      const proj1Data = await testDb.from('projects').insert({
        name: 'Alpha Project',
        organization_id: org1.id,
        workspace_id: workspace1.id,
        created_by: user1.id
      }).select().single()

      const proj2Data = await testDb.from('projects').insert({
        name: 'Beta Project',
        organization_id: org2.id,
        workspace_id: workspace2.id,
        created_by: user2.id
      }).select().single()

      project1 = proj1Data.data
      project2 = proj2Data.data
    })

    it('should isolate project data by organization', async () => {
      await mockRLSContext(testDb, user1.id, org1.id)

      const projects = await testDb
        .from('projects')
        .select('*')

      // Should only see projects from org1
      expect(projects.data).toHaveLength(1)
      expect(projects.data[0].organization_id).toBe(org1.id)
      expect(projects.data[0].id).toBe(project1.id)
    })

    it('should prevent project access across organizations', async () => {
      await mockRLSContext(testDb, user1.id, org1.id)

      const project2Access = await testDb
        .from('projects')
        .select('*')
        .eq('id', project2.id)

      expect(project2Access.data).toHaveLength(0)
    })

    it('should allow workspace-level project access control', async () => {
      await mockRLSContext(testDb, user3.id, org1.id) // user3 is member of org1 and workspace1

      const projects = await testDb
        .from('projects')
        .select('*')

      // user3 should see project1 (same org and workspace)
      expect(projects.data).toHaveLength(1)
      expect(projects.data[0].id).toBe(project1.id)
    })
  })

  describe('Audit Log Data Isolation', () => {
    beforeEach(async () => {
      // Create audit logs for both organizations
      await testDb.from('audit_logs').insert([
        {
          organization_id: org1.id,
          actor_id: user1.id,
          action: 'project_created',
          resource_type: 'project',
          resource_id: 'proj1'
        },
        {
          organization_id: org2.id,
          actor_id: user2.id,
          action: 'project_created',
          resource_type: 'project',
          resource_id: 'proj2'
        }
      ])
    })

    it('should isolate audit logs by organization', async () => {
      await mockRLSContext(testDb, user1.id, org1.id)

      const auditLogs = await testDb
        .from('audit_logs')
        .select('*')

      // Should only see logs from org1
      expect(auditLogs.data).toHaveLength(1)
      expect(auditLogs.data[0].organization_id).toBe(org1.id)
    })

    it('should prevent cross-organization audit log access', async () => {
      await mockRLSContext(testDb, user1.id, org1.id)

      const org2Logs = await testDb
        .from('audit_logs')
        .select('*')
        .eq('organization_id', org2.id)

      expect(org2Logs.data).toHaveLength(0)
    })
  })

  describe('Billing and Usage Data Isolation', () => {
    beforeEach(async () => {
      // Create billing data for both organizations
      await testDb.from('organization_billing').insert([
        {
          organization_id: org1.id,
          stripe_customer_id: 'cus_alpha',
          billing_email: 'billing@alpha.com'
        },
        {
          organization_id: org2.id,
          stripe_customer_id: 'cus_beta',
          billing_email: 'billing@beta.com'
        }
      ])

      await testDb.from('usage_quotas').insert([
        {
          organization_id: org1.id,
          resource_type: 'projects',
          limit_value: 100,
          current_value: 10
        },
        {
          organization_id: org2.id,
          resource_type: 'projects',
          limit_value: 50,
          current_value: 5
        }
      ])
    })

    it('should isolate billing data by organization', async () => {
      await mockRLSContext(testDb, user1.id, org1.id)

      const billing = await testDb
        .from('organization_billing')
        .select('*')

      expect(billing.data).toHaveLength(1)
      expect(billing.data[0].organization_id).toBe(org1.id)
      expect(billing.data[0].stripe_customer_id).toBe('cus_alpha')
    })

    it('should isolate usage quota data by organization', async () => {
      await mockRLSContext(testDb, user1.id, org1.id)

      const quotas = await testDb
        .from('usage_quotas')
        .select('*')

      expect(quotas.data).toHaveLength(1)
      expect(quotas.data[0].organization_id).toBe(org1.id)
      expect(quotas.data[0].limit_value).toBe(100)
    })

    it('should prevent billing data access across organizations', async () => {
      await mockRLSContext(testDb, user1.id, org1.id)

      const org2Billing = await testDb
        .from('organization_billing')
        .select('*')
        .eq('organization_id', org2.id)

      expect(org2Billing.data).toHaveLength(0)
    })
  })

  describe('Custom Roles and Permissions Isolation', () => {
    beforeEach(async () => {
      // Create custom roles for both organizations
      await testDb.from('custom_roles').insert([
        {
          organization_id: org1.id,
          name: 'alpha_manager',
          display_name: 'Alpha Manager',
          level: 'organization',
          permissions: ['project:create', 'project:manage'],
          created_by: user1.id
        },
        {
          organization_id: org2.id,
          name: 'beta_manager',
          display_name: 'Beta Manager',
          level: 'organization',
          permissions: ['project:view', 'project:update'],
          created_by: user2.id
        }
      ])
    })

    it('should isolate custom roles by organization', async () => {
      await mockRLSContext(testDb, user1.id, org1.id)

      const roles = await testDb
        .from('custom_roles')
        .select('*')

      expect(roles.data).toHaveLength(1)
      expect(roles.data[0].organization_id).toBe(org1.id)
      expect(roles.data[0].name).toBe('alpha_manager')
    })

    it('should prevent access to roles from other organizations', async () => {
      await mockRLSContext(testDb, user1.id, org1.id)

      const betaRoles = await testDb
        .from('custom_roles')
        .select('*')
        .eq('organization_id', org2.id)

      expect(betaRoles.data).toHaveLength(0)
    })

    it('should isolate member permissions by organization membership', async () => {
      // Grant permissions to user3 in org1
      const membershipData = await testDb.from('organization_members')
        .select('id')
        .eq('user_id', user3.id)
        .eq('organization_id', org1.id)
        .single()

      await testDb.from('member_permissions').insert({
        membership_id: membershipData.data.id,
        permission: 'project:delete',
        granted: true,
        granted_by: user1.id
      })

      await mockRLSContext(testDb, user3.id, org1.id)

      const permissions = await testDb
        .from('member_permissions')
        .select('*')

      expect(permissions.data).toHaveLength(1)
      expect(permissions.data[0].permission).toBe('project:delete')
    })
  })

  describe('API Keys and Security Isolation', () => {
    beforeEach(async () => {
      // Create API keys for both organizations
      await testDb.from('api_keys').insert([
        {
          organization_id: org1.id,
          name: 'Alpha API Key',
          key_hash: 'hash_alpha_123',
          key_prefix: 'ak_alpha',
          permissions: ['projects:read', 'projects:write'],
          created_by: user1.id
        },
        {
          organization_id: org2.id,
          name: 'Beta API Key',
          key_hash: 'hash_beta_456',
          key_prefix: 'ak_beta',
          permissions: ['projects:read'],
          created_by: user2.id
        }
      ])
    })

    it('should isolate API keys by organization', async () => {
      await mockRLSContext(testDb, user1.id, org1.id)

      const apiKeys = await testDb
        .from('api_keys')
        .select('*')

      expect(apiKeys.data).toHaveLength(1)
      expect(apiKeys.data[0].organization_id).toBe(org1.id)
      expect(apiKeys.data[0].key_prefix).toBe('ak_alpha')
    })

    it('should prevent API key access across organizations', async () => {
      await mockRLSContext(testDb, user1.id, org1.id)

      const betaKeys = await testDb
        .from('api_keys')
        .select('*')
        .eq('organization_id', org2.id)

      expect(betaKeys.data).toHaveLength(0)
    })
  })

  describe('Performance and Scale Testing', () => {
    it('should maintain performance with RLS policies under load', async () => {
      // Create multiple organizations and projects for performance testing
      const orgs = []
      const projects = []

      for (let i = 0; i < 10; i++) {
        const user = await createTestUser()
        const org = await createTestOrganization(user.id, {
          name: `Performance Org ${i}`,
          slug: `perf-org-${i}`
        })
        await addUserToOrganization(user.id, org.id, 'owner')
        orgs.push({ org, user })

        // Create projects for each org
        for (let j = 0; j < 5; j++) {
          const projectData = await testDb.from('projects').insert({
            name: `Project ${i}-${j}`,
            organization_id: org.id,
            created_by: user.id
          }).select().single()
          projects.push(projectData.data)
        }
      }

      // Test query performance with RLS
      const { duration } = await measureQueryPerformance(async () => {
        await mockRLSContext(testDb, orgs[0].user.id, orgs[0].org.id)
        
        return await testDb
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)
      }, 'RLS filtered project query with 50 total projects')

      // Should complete within reasonable time (< 100ms for this test size)
      expect(duration).toBeLessThan(100)
    })

    it('should scale permission checks efficiently', async () => {
      const user = await createTestUser()
      const org = await createTestOrganization(user.id)
      await addUserToOrganization(user.id, org.id, 'owner')

      // Create many custom roles and permissions
      const roles = []
      for (let i = 0; i < 20; i++) {
        const roleData = await testDb.from('custom_roles').insert({
          organization_id: org.id,
          name: `role_${i}`,
          display_name: `Role ${i}`,
          level: 'organization',
          permissions: [`custom:permission_${i}`, 'project:view'],
          created_by: user.id
        }).select().single()
        roles.push(roleData.data)
      }

      const { duration } = await measureQueryPerformance(async () => {
        await mockRLSContext(testDb, user.id, org.id)
        
        return await testDb
          .from('custom_roles')
          .select('*')
          .eq('organization_id', org.id)
      }, 'Complex role permission query')

      expect(duration).toBeLessThan(50)
    })
  })

  describe('Data Integrity and Consistency', () => {
    it('should maintain referential integrity with RLS', async () => {
      // Create a project
      const projectData = await testDb.from('projects').insert({
        name: 'Integrity Test Project',
        organization_id: org1.id,
        workspace_id: workspace1.id,
        created_by: user1.id
      }).select().single()

      const project = projectData.data

      // Try to create orphaned data (should fail)
      const orphanResult = await testDb.from('projects').insert({
        name: 'Orphan Project',
        organization_id: 'non-existent-org-id',
        created_by: user1.id
      })

      expect(orphanResult.error).toBeTruthy()

      // Verify original project still exists
      await mockRLSContext(testDb, user1.id, org1.id)
      const projectCheck = await testDb
        .from('projects')
        .select('*')
        .eq('id', project.id)

      expect(projectCheck.data).toHaveLength(1)
    })

    it('should cascade deletions correctly with RLS', async () => {
      // Create workspace with projects
      const wsData = await createTestWorkspace(org1.id, user1.id, {
        name: 'Cascade Test Workspace'
      })

      const projectData = await testDb.from('projects').insert({
        name: 'Cascade Test Project',
        organization_id: org1.id,
        workspace_id: wsData.id,
        created_by: user1.id
      }).select().single()

      // Delete workspace (should cascade to projects)
      await mockRLSContext(testDb, user1.id, org1.id)
      await testDb
        .from('workspaces')
        .delete()
        .eq('id', wsData.id)

      // Verify project was also deleted
      const projectCheck = await testDb
        .from('projects')
        .select('*')
        .eq('id', projectData.data.id)

      expect(projectCheck.data).toHaveLength(0)
    })
  })

  describe('Edge Cases and Attack Scenarios', () => {
    it('should prevent SQL injection through RLS bypass attempts', async () => {
      await mockRLSContext(testDb, user1.id, org1.id)

      // Attempt various injection patterns
      const maliciousQueries = [
        `'; DROP TABLE organizations; --`,
        `' OR 1=1 --`,
        `' UNION SELECT * FROM organizations WHERE id='${org2.id}'`,
        `'; UPDATE organizations SET name='hacked' WHERE id='${org2.id}'; --`
      ]

      for (const malicious of maliciousQueries) {
        const result = await testDb
          .from('organizations')
          .select('*')
          .eq('name', malicious)

        // Should return empty result, not error out or return unauthorized data
        expect(result.data).toHaveLength(0)
      }
    })

    it('should handle concurrent access correctly', async () => {
      const promises = []

      // Simulate concurrent access from different users
      for (let i = 0; i < 5; i++) {
        promises.push(
          (async () => {
            await mockRLSContext(testDb, user1.id, org1.id)
            return await testDb.from('organizations').select('*')
          })()
        )

        promises.push(
          (async () => {
            await mockRLSContext(testDb, user2.id, org2.id)
            return await testDb.from('organizations').select('*')
          })()
        )
      }

      const results = await Promise.all(promises)

      // Verify each user only sees their own organization
      results.forEach((result, index) => {
        const expectedOrgId = index % 2 === 0 ? org1.id : org2.id
        expect(result.data).toHaveLength(1)
        expect(result.data[0].id).toBe(expectedOrgId)
      })
    })

    it('should prevent privilege escalation through membership manipulation', async () => {
      // user3 is a member, try to escalate to admin
      await mockRLSContext(testDb, user3.id, org1.id)

      const escalateResult = await testDb
        .from('organization_members')
        .update({ role: 'admin' })
        .eq('user_id', user3.id)
        .eq('organization_id', org1.id)

      // Should fail - members cannot change their own roles
      expect(escalateResult.error).toBeTruthy()

      // Verify role unchanged
      const memberCheck = await testDb
        .from('organization_members')
        .select('role')
        .eq('user_id', user3.id)
        .eq('organization_id', org1.id)
        .as({ user_id: user1.id }) // Check as admin

      expect(memberCheck.data[0].role).toBe('member')
    })
  })
})