import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { TenantRealtimeManager } from '../../lib/realtime/tenant-realtime-manager'
import { ContextValidator } from '../../middleware/context-validator'

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn(),
  channel: vi.fn(),
  auth: {
    admin: {
      getUserById: vi.fn()
    }
  }
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase)
}))

// Test scenarios for multi-tenant isolation
describe('End-to-End Tenant Isolation', () => {
  // Mock organizations and users
  const orgA = {
    id: 'org-a',
    name: 'Organization A',
    status: 'active'
  }

  const orgB = {
    id: 'org-b', 
    name: 'Organization B',
    status: 'active'
  }

  const userAInOrgA = {
    id: 'user-a-org-a',
    organizationId: orgA.id,
    role: 'admin',
    permissions: ['*']
  }

  const userBInOrgA = {
    id: 'user-b-org-a',
    organizationId: orgA.id,
    role: 'member',
    permissions: ['workspace:view', 'project:view']
  }

  const userCInOrgB = {
    id: 'user-c-org-b',
    organizationId: orgB.id,
    role: 'admin', 
    permissions: ['*']
  }

  const workspacesOrgA = [
    { id: 'ws-a1', name: 'Workspace A1', organization_id: orgA.id },
    { id: 'ws-a2', name: 'Workspace A2', organization_id: orgA.id }
  ]

  const workspacesOrgB = [
    { id: 'ws-b1', name: 'Workspace B1', organization_id: orgB.id }
  ]

  const projectsOrgA = [
    { id: 'proj-a1', name: 'Project A1', organization_id: orgA.id, workspace_id: 'ws-a1' },
    { id: 'proj-a2', name: 'Project A2', organization_id: orgA.id, workspace_id: 'ws-a2' }
  ]

  const projectsOrgB = [
    { id: 'proj-b1', name: 'Project B1', organization_id: orgB.id, workspace_id: 'ws-b1' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Data Access Isolation', () => {
    it('should prevent cross-tenant workspace access via realtime', async () => {
      // Create realtime manager for Org A user
      const managerOrgA = new TenantRealtimeManager({
        organizationId: orgA.id,
        userId: userAInOrgA.id,
        permissions: userAInOrgA.permissions
      })

      const orgAHandler = vi.fn()
      
      // Mock channel for Org A
      const mockChannelA = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
        unsubscribe: vi.fn()
      }
      
      mockSupabase.channel.mockReturnValue(mockChannelA)
      
      // Subscribe to workspace changes
      managerOrgA.subscribeToWorkspaces(['INSERT', 'UPDATE'], orgAHandler)
      
      // Get the callback function from the mock
      const onCallback = mockChannelA.on.mock.calls.find(
        call => call[0] === 'postgres_changes'
      )[2]

      // Mock hasWorkspaceAccess to simulate proper access checking
      vi.spyOn(managerOrgA as any, 'hasWorkspaceAccess').mockImplementation((wsId) => {
        // Only allow access to Org A workspaces
        return workspacesOrgA.some(ws => ws.id === wsId)
      })

      // Test: Org A workspace update should be received
      const orgAWorkspaceUpdate = {
        eventType: 'UPDATE',
        new: workspacesOrgA[0],
        old: { ...workspacesOrgA[0], name: 'Old Name' }
      }
      
      onCallback(orgAWorkspaceUpdate)
      expect(orgAHandler).toHaveBeenCalledWith(expect.objectContaining({
        eventType: 'UPDATE'
      }))

      // Test: Org B workspace update should be blocked
      orgAHandler.mockClear()
      const orgBWorkspaceUpdate = {
        eventType: 'UPDATE', 
        new: workspacesOrgB[0],
        old: { ...workspacesOrgB[0], name: 'Old Name' }
      }

      onCallback(orgBWorkspaceUpdate)
      expect(orgAHandler).not.toHaveBeenCalled()
      
      managerOrgA.unsubscribeAll()
    })

    it('should prevent cross-tenant project access via realtime', async () => {
      // Create realtime manager for Org B user
      const managerOrgB = new TenantRealtimeManager({
        organizationId: orgB.id,
        userId: userCInOrgB.id,
        permissions: userCInOrgB.permissions
      })

      const orgBHandler = vi.fn()
      
      const mockChannelB = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
        unsubscribe: vi.fn()
      }
      
      mockSupabase.channel.mockReturnValue(mockChannelB)
      
      // Subscribe to project changes
      managerOrgB.subscribeToProjects(['INSERT', 'UPDATE', 'DELETE'], orgBHandler)
      
      const onCallback = mockChannelB.on.mock.calls.find(
        call => call[0] === 'postgres_changes'
      )[2]

      // Mock hasProjectAccess
      vi.spyOn(managerOrgB as any, 'hasProjectAccess').mockImplementation((projectData) => {
        return projectData?.organization_id === orgB.id
      })

      // Test: Org B project should be accessible
      const orgBProjectUpdate = {
        eventType: 'UPDATE',
        new: projectsOrgB[0]
      }
      
      onCallback(orgBProjectUpdate)
      expect(orgBHandler).toHaveBeenCalled()

      // Test: Org A project should be blocked
      orgBHandler.mockClear()
      const orgAProjectUpdate = {
        eventType: 'INSERT',
        new: projectsOrgA[0]
      }

      onCallback(orgAProjectUpdate)
      expect(orgBHandler).not.toHaveBeenCalled()
      
      managerOrgB.unsubscribeAll()
    })

    it('should enforce organization boundary in context validation', async () => {
      // Mock valid user in Org A
      mockSupabase.auth.admin.getUserById.mockResolvedValue({
        user: {
          id: userAInOrgA.id,
          email: 'user-a@orga.com',
          email_confirmed_at: new Date().toISOString(),
          banned_until: null
        }
      })

      // Mock organization lookup
      const mockOrgQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn()
      }
      
      // Test: Valid organization access
      mockOrgQuery.single.mockResolvedValueOnce({
        data: orgA
      })
      mockSupabase.from.mockReturnValueOnce(mockOrgQuery)

      // Mock membership lookup
      const mockMembershipQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            role: 'admin',
            status: 'active',
            permissions: []
          }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockMembershipQuery)

      // Mock permissions and billing
      mockSupabase.rpc.mockResolvedValue({ data: ['*'], error: null })
      
      const mockBillingQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { payment_status: 'active' }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockBillingQuery)

      const validResult = await ContextValidator.validateTenantContext(
        userAInOrgA.id, 
        orgA.id
      )

      expect(validResult.isValid).toBe(true)
      expect(validResult.context?.organizationId).toBe(orgA.id)

      // Test: Invalid organization access (user from Org A trying to access Org B)
      mockSupabase.auth.admin.getUserById.mockResolvedValue({
        user: {
          id: userAInOrgA.id,
          email: 'user-a@orga.com',
          email_confirmed_at: new Date().toISOString(),
          banned_until: null
        }
      })

      const mockOrgQuery2 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({
          data: orgB // Valid org
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockOrgQuery2)

      const mockMembershipQuery2 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null, // No membership in Org B
          error: { message: 'Not found' }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockMembershipQuery2)

      const invalidResult = await ContextValidator.validateTenantContext(
        userAInOrgA.id,
        orgB.id // Wrong org
      )

      expect(invalidResult.isValid).toBe(false)
      expect(invalidResult.errors).toContain('User is not a member of this organization')
    })
  })

  describe('Permission-Based Isolation', () => {
    it('should enforce role-based access in realtime subscriptions', async () => {
      // Create manager for limited-permission user
      const managerLimited = new TenantRealtimeManager({
        organizationId: orgA.id,
        userId: userBInOrgA.id,
        permissions: userBInOrgA.permissions // Only view permissions
      })

      // Test: Should allow workspace subscriptions
      const workspaceHandler = vi.fn()
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
        unsubscribe: vi.fn()
      }
      
      mockSupabase.channel.mockReturnValue(mockChannel)
      
      expect(() => {
        managerLimited.subscribeToWorkspaces(['UPDATE'], workspaceHandler)
      }).not.toThrow()

      // Test: Should deny audit log subscriptions
      const auditHandler = vi.fn()
      
      expect(() => {
        managerLimited.subscribeToAuditLogs(['INSERT'], auditHandler)
      }).toThrow('Insufficient permissions to subscribe to audit logs')

      // Test: Should deny member management subscriptions
      const memberHandler = vi.fn()
      
      expect(() => {
        managerLimited.subscribeToMembers(['UPDATE'], memberHandler)
      }).toThrow('Insufficient permissions to subscribe to member changes')
      
      managerLimited.unsubscribeAll()
    })

    it('should validate workspace access based on membership', async () => {
      const memberContext = {
        organizationId: orgA.id,
        userId: userBInOrgA.id,
        role: 'member' as const,
        permissions: userBInOrgA.permissions
      }

      // Mock workspace lookup
      const mockWorkspaceQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: workspacesOrgA[0]
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockWorkspaceQuery)

      // Mock workspace membership (user is a member)
      const mockMembershipQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { role: 'member' }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockMembershipQuery)

      const validAccess = await ContextValidator.validateWorkspaceAccess(
        memberContext,
        workspacesOrgA[0].id
      )

      expect(validAccess.isValid).toBe(true)

      // Test: No membership in workspace
      const mockWorkspaceQuery2 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: workspacesOrgA[1]
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockWorkspaceQuery2)

      const mockMembershipQuery2 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null // No membership
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockMembershipQuery2)

      const invalidAccess = await ContextValidator.validateWorkspaceAccess(
        memberContext,
        workspacesOrgA[1].id
      )

      expect(invalidAccess.isValid).toBe(false)
      expect(invalidAccess.errors).toContain('No access to this workspace')
    })
  })

  describe('Data Sanitization Across Tenants', () => {
    it('should sanitize sensitive data in realtime payloads', async () => {
      const manager = new TenantRealtimeManager({
        organizationId: orgA.id,
        userId: userAInOrgA.id,
        permissions: ['*']
      })

      const handler = vi.fn()
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
        unsubscribe: vi.fn()
      }
      
      mockSupabase.channel.mockReturnValue(mockChannel)
      
      manager.subscribeToOrganization(['UPDATE'], handler)
      
      const onCallback = mockChannel.on.mock.calls.find(
        call => call[0] === 'postgres_changes'
      )[2]

      // Test payload with sensitive data
      const sensitivePayload = {
        eventType: 'UPDATE',
        new: {
          id: orgA.id,
          name: 'Updated Organization A',
          stripe_customer_id: 'cus_sensitive_123',
          api_keys: ['sk_live_sensitive_key'],
          billing_address: {
            street: '123 Private St',
            city: 'Confidential City'
          },
          public_field: 'This is safe'
        }
      }

      onCallback(sensitivePayload)

      const sanitizedPayload = handler.mock.calls[0][0]
      
      // Check that sensitive fields are removed
      expect(sanitizedPayload.new.stripe_customer_id).toBeUndefined()
      expect(sanitizedPayload.new.api_keys).toBeUndefined()
      expect(sanitizedPayload.new.billing_address).toBeUndefined()
      
      // Check that safe fields remain
      expect(sanitizedPayload.new.public_field).toBe('This is safe')
      expect(sanitizedPayload.new.name).toBe('Updated Organization A')
      
      manager.unsubscribeAll()
    })

    it('should apply extra sanitization to audit logs', async () => {
      const manager = new TenantRealtimeManager({
        organizationId: orgA.id,
        userId: userAInOrgA.id,
        permissions: ['organization:view_audit_logs']
      })

      const handler = vi.fn()
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
        unsubscribe: vi.fn()
      }
      
      mockSupabase.channel.mockReturnValue(mockChannel)
      
      manager.subscribeToAuditLogs(['INSERT'], handler)
      
      const onCallback = mockChannel.on.mock.calls.find(
        call => call[0] === 'postgres_changes'
      )[2]

      // Test audit payload with sensitive metadata
      const auditPayload = {
        eventType: 'INSERT',
        new: {
          id: 'audit-123',
          organization_id: orgA.id,
          action: 'user_login',
          metadata: {
            ip_address: '192.168.1.1',
            user_agent: 'Mozilla/5.0',
            password: 'secret123', // Should be removed
            token: 'jwt_token_123', // Should be removed
            key: 'api_key_456', // Should be removed
            login_method: 'email' // Should remain
          }
        }
      }

      onCallback(auditPayload)

      const sanitizedPayload = handler.mock.calls[0][0]
      
      // Check that sensitive metadata is removed
      expect(sanitizedPayload.new.metadata.password).toBeUndefined()
      expect(sanitizedPayload.new.metadata.token).toBeUndefined()
      expect(sanitizedPayload.new.metadata.key).toBeUndefined()
      
      // Check that safe metadata remains
      expect(sanitizedPayload.new.metadata.ip_address).toBe('192.168.1.1')
      expect(sanitizedPayload.new.metadata.login_method).toBe('email')
      
      manager.unsubscribeAll()
    })
  })

  describe('Multi-Tenant Resource Scoping', () => {
    it('should scope workspace-specific subscriptions correctly', async () => {
      const manager = new TenantRealtimeManager({
        organizationId: orgA.id,
        userId: userAInOrgA.id,
        permissions: ['*']
      })

      const handler = vi.fn()
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
        unsubscribe: vi.fn()
      }
      
      mockSupabase.channel.mockReturnValue(mockChannel)
      
      // Subscribe to specific workspace projects
      manager.subscribeToProjects(
        ['INSERT', 'UPDATE'], 
        handler,
        { workspaceId: workspacesOrgA[0].id }
      )
      
      const onCallback = mockChannel.on.mock.calls.find(
        call => call[0] === 'postgres_changes'
      )[2]

      vi.spyOn(manager as any, 'hasProjectAccess').mockReturnValue(true)

      // Test: Project in correct workspace should be received
      const correctWorkspaceProject = {
        eventType: 'INSERT',
        new: {
          id: 'new-proj',
          name: 'New Project',
          organization_id: orgA.id,
          workspace_id: workspacesOrgA[0].id
        }
      }
      
      onCallback(correctWorkspaceProject)
      expect(handler).toHaveBeenCalled()

      // Test: Project in different workspace should be filtered out
      handler.mockClear()
      const differentWorkspaceProject = {
        eventType: 'INSERT',
        new: {
          id: 'other-proj',
          name: 'Other Project',
          organization_id: orgA.id,
          workspace_id: workspacesOrgA[1].id // Different workspace
        }
      }
      
      onCallback(differentWorkspaceProject)
      expect(handler).not.toHaveBeenCalled()
      
      manager.unsubscribeAll()
    })

    it('should enforce project-specific access controls', async () => {
      const projectContext = {
        organizationId: orgA.id,
        userId: userBInOrgA.id,
        role: 'member' as const,
        permissions: ['project:view']
      }

      // Mock project lookup
      const mockProjectQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: projectsOrgA[0]
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockProjectQuery)

      // Mock workspace validation (will be called internally)
      const mockWorkspaceQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: workspacesOrgA[0]
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockWorkspaceQuery)

      // Mock workspace membership for the user
      const mockMembershipQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { role: 'member' }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockMembershipQuery)

      const validAccess = await ContextValidator.validateProjectAccess(
        projectContext,
        projectsOrgA[0].id,
        workspacesOrgA[0].id
      )

      expect(validAccess.isValid).toBe(true)

      // Test: Wrong workspace context
      const mockProjectQuery2 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: projectsOrgA[0] // Project belongs to ws-a1
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockProjectQuery2)

      const wrongWorkspaceAccess = await ContextValidator.validateProjectAccess(
        projectContext,
        projectsOrgA[0].id,
        workspacesOrgA[1].id // Wrong workspace
      )

      expect(wrongWorkspaceAccess.isValid).toBe(false)
      expect(wrongWorkspaceAccess.errors).toContain(
        'Project does not belong to specified workspace'
      )
    })
  })

  describe('Concurrent Multi-Tenant Operations', () => {
    it('should handle concurrent realtime subscriptions from different tenants', async () => {
      // Create managers for different organizations
      const managerOrgA = new TenantRealtimeManager({
        organizationId: orgA.id,
        userId: userAInOrgA.id,
        permissions: ['*']
      })

      const managerOrgB = new TenantRealtimeManager({
        organizationId: orgB.id,
        userId: userCInOrgB.id,
        permissions: ['*']
      })

      const handlerA = vi.fn()
      const handlerB = vi.fn()

      const mockChannelA = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
        unsubscribe: vi.fn()
      }

      const mockChannelB = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
        unsubscribe: vi.fn()
      }

      // Mock different channels for each manager
      mockSupabase.channel
        .mockReturnValueOnce(mockChannelA)
        .mockReturnValueOnce(mockChannelB)

      // Set up subscriptions concurrently
      managerOrgA.subscribeToOrganization(['UPDATE'], handlerA)
      managerOrgB.subscribeToOrganization(['UPDATE'], handlerB)

      // Verify they use different channels
      expect(mockSupabase.channel).toHaveBeenCalledWith(`org:${orgA.id}`)
      expect(mockSupabase.channel).toHaveBeenCalledWith(`org:${orgB.id}`)

      // Test that events are isolated
      const callbackA = mockChannelA.on.mock.calls[0][2]
      const callbackB = mockChannelB.on.mock.calls[0][2]

      const orgAUpdate = {
        eventType: 'UPDATE',
        new: { id: orgA.id, name: 'Updated A' }
      }

      const orgBUpdate = {
        eventType: 'UPDATE',
        new: { id: orgB.id, name: 'Updated B' }
      }

      callbackA(orgAUpdate)
      callbackB(orgBUpdate)

      expect(handlerA).toHaveBeenCalledWith(expect.objectContaining({
        new: expect.objectContaining({ name: 'Updated A' })
      }))

      expect(handlerB).toHaveBeenCalledWith(expect.objectContaining({
        new: expect.objectContaining({ name: 'Updated B' })
      }))

      managerOrgA.unsubscribeAll()
      managerOrgB.unsubscribeAll()
    })

    it('should validate context for concurrent API requests', async () => {
      // Simulate concurrent context validations for different tenants
      const validations = await Promise.all([
        // Valid context for Org A
        (async () => {
          mockSupabase.auth.admin.getUserById.mockResolvedValue({
            user: {
              id: userAInOrgA.id,
              email: 'user-a@orga.com',
              email_confirmed_at: new Date().toISOString(),
              banned_until: null
            }
          })

          const mockQueries = [
            // Org lookup
            {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({ data: orgA })
            },
            // Membership lookup
            {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: { role: 'admin', status: 'active', permissions: [] }
              })
            },
            // Billing lookup
            {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({ data: { payment_status: 'active' } })
            }
          ]

          mockSupabase.from
            .mockReturnValueOnce(mockQueries[0])
            .mockReturnValueOnce(mockQueries[1])
            .mockReturnValueOnce(mockQueries[2])

          mockSupabase.rpc.mockResolvedValue({ data: ['*'], error: null })

          return ContextValidator.validateTenantContext(userAInOrgA.id, orgA.id)
        })(),

        // Valid context for Org B  
        (async () => {
          mockSupabase.auth.admin.getUserById.mockResolvedValue({
            user: {
              id: userCInOrgB.id,
              email: 'user-c@orgb.com',
              email_confirmed_at: new Date().toISOString(),
              banned_until: null
            }
          })

          const mockQueries = [
            {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({ data: orgB })
            },
            {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: { role: 'admin', status: 'active', permissions: [] }
              })
            },
            {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({ data: { payment_status: 'active' } })
            }
          ]

          mockSupabase.from
            .mockReturnValueOnce(mockQueries[0])
            .mockReturnValueOnce(mockQueries[1])
            .mockReturnValueOnce(mockQueries[2])

          mockSupabase.rpc.mockResolvedValue({ data: ['*'], error: null })

          return ContextValidator.validateTenantContext(userCInOrgB.id, orgB.id)
        })()
      ])

      // Both validations should succeed with correct tenant isolation
      expect(validations[0].isValid).toBe(true)
      expect(validations[0].context?.organizationId).toBe(orgA.id)
      
      expect(validations[1].isValid).toBe(true)
      expect(validations[1].context?.organizationId).toBe(orgB.id)
    })
  })
})