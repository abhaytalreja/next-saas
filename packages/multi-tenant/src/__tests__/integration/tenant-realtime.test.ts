import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import { TenantRealtimeManager, useTenantRealtime, useWorkspaceRealtime } from '../../lib/realtime/tenant-realtime-manager'
import { renderHook, act, waitFor } from '@testing-library/react'

// Mock Supabase client
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
  unsubscribe: vi.fn().mockImplementation(() => {}),
  track: vi.fn().mockResolvedValue({})
}

const mockSupabase = {
  channel: vi.fn().mockReturnValue(mockChannel)
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase)
}))

// Mock useOrganization hook
const mockOrganization = {
  id: 'org-123',
  name: 'Test Organization'
}

const mockUser = {
  id: 'user-123',
  email: 'test@example.com'
}

const mockPermissions = [
  'organization:view',
  'workspace:view',
  'project:view',
  'organization:manage_members'
]

vi.mock('../../hooks/useOrganization', () => ({
  useOrganization: vi.fn(() => ({
    currentOrganization: mockOrganization,
    userId: mockUser.id,
    userPermissions: mockPermissions
  }))
}))

describe('TenantRealtimeManager', () => {
  let manager: TenantRealtimeManager

  beforeEach(() => {
    vi.clearAllMocks()
    manager = new TenantRealtimeManager({
      organizationId: mockOrganization.id,
      userId: mockUser.id,
      permissions: mockPermissions
    })
  })

  afterEach(() => {
    manager.unsubscribeAll()
  })

  describe('Tenant Context Security', () => {
    it('should enforce organization boundary in subscriptions', () => {
      const handler = vi.fn()
      
      manager.subscribeToOrganization(['UPDATE'], handler)
      
      expect(mockSupabase.channel).toHaveBeenCalledWith(`org:${mockOrganization.id}`)
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          filter: `id=eq.${mockOrganization.id}`
        }),
        expect.any(Function)
      )
    })

    it('should filter workspace events by organization', () => {
      const handler = vi.fn()
      
      manager.subscribeToWorkspaces(['INSERT', 'UPDATE'], handler)
      
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          filter: `organization_id=eq.${mockOrganization.id}`
        }),
        expect.any(Function)
      )
    })

    it('should validate workspace access in payload filtering', () => {
      const handler = vi.fn()
      const subscription = manager.subscribeToWorkspaces(['UPDATE'], handler)
      
      // Get the callback function passed to channel.on
      const onCallback = mockChannel.on.mock.calls.find(
        call => call[0] === 'postgres_changes'
      )[2]
      
      // Test with valid workspace payload
      const validPayload = {
        eventType: 'UPDATE',
        new: { id: 'ws-123', organization_id: mockOrganization.id },
        old: { id: 'ws-123', organization_id: mockOrganization.id }
      }
      
      // Mock hasWorkspaceAccess to return true
      vi.spyOn(manager as any, 'hasWorkspaceAccess').mockReturnValue(true)
      
      onCallback(validPayload)
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        eventType: 'UPDATE'
      }))
    })

    it('should block cross-tenant workspace access', () => {
      const handler = vi.fn()
      manager.subscribeToWorkspaces(['UPDATE'], handler)
      
      const onCallback = mockChannel.on.mock.calls.find(
        call => call[0] === 'postgres_changes'
      )[2]
      
      // Test with invalid workspace payload (different organization)
      const invalidPayload = {
        eventType: 'UPDATE',
        new: { id: 'ws-456', organization_id: 'other-org' },
        old: { id: 'ws-456', organization_id: 'other-org' }
      }
      
      // Mock hasWorkspaceAccess to return false
      vi.spyOn(manager as any, 'hasWorkspaceAccess').mockReturnValue(false)
      
      onCallback(invalidPayload)
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('Permission-Based Subscriptions', () => {
    it('should allow members subscription with correct permissions', () => {
      const handler = vi.fn()
      
      expect(() => {
        manager.subscribeToMembers(['UPDATE'], handler)
      }).not.toThrow()
      
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          table: 'organization_members'
        }),
        expect.any(Function)
      )
    })

    it('should deny audit logs subscription without permission', () => {
      const managerWithoutAuditAccess = new TenantRealtimeManager({
        organizationId: mockOrganization.id,
        userId: mockUser.id,
        permissions: ['organization:view'] // No audit access
      })
      
      const handler = vi.fn()
      
      expect(() => {
        managerWithoutAuditAccess.subscribeToAuditLogs(['INSERT'], handler)
      }).toThrow('Insufficient permissions to subscribe to audit logs')
    })

    it('should allow wildcard permissions', () => {
      const managerWithWildcard = new TenantRealtimeManager({
        organizationId: mockOrganization.id,
        userId: mockUser.id,
        permissions: ['*']
      })
      
      const handler = vi.fn()
      
      expect(() => {
        managerWithWildcard.subscribeToAuditLogs(['INSERT'], handler)
      }).not.toThrow()
    })
  })

  describe('Data Sanitization', () => {
    it('should sanitize sensitive fields from payloads', () => {
      const handler = vi.fn()
      manager.subscribeToOrganization(['UPDATE'], handler)
      
      const onCallback = mockChannel.on.mock.calls.find(
        call => call[0] === 'postgres_changes'
      )[2]
      
      const sensitivePayload = {
        eventType: 'UPDATE',
        new: {
          id: mockOrganization.id,
          name: 'Updated Org',
          stripe_customer_id: 'cus_sensitive',
          api_keys: ['secret-key-123'],
          billing_address: { street: '123 Secret St' }
        }
      }
      
      onCallback(sensitivePayload)
      
      const sanitizedPayload = handler.mock.calls[0][0]
      expect(sanitizedPayload.new.stripe_customer_id).toBeUndefined()
      expect(sanitizedPayload.new.api_keys).toBeUndefined()
      expect(sanitizedPayload.new.billing_address).toBeUndefined()
      expect(sanitizedPayload.new.name).toBe('Updated Org')
    })

    it('should apply extra sanitization for audit logs', () => {
      const handler = vi.fn()
      manager.subscribeToAuditLogs(['INSERT'], handler)
      
      const onCallback = mockChannel.on.mock.calls.find(
        call => call[0] === 'postgres_changes'
      )[2]
      
      const auditPayload = {
        eventType: 'INSERT',
        new: {
          id: 'audit-123',
          action: 'password_change',
          metadata: {
            user_agent: 'Mozilla/5.0',
            password: 'secret123',
            token: 'jwt-token',
            safe_field: 'allowed'
          }
        }
      }
      
      onCallback(auditPayload)
      
      const sanitizedPayload = handler.mock.calls[0][0]
      expect(sanitizedPayload.new.metadata.password).toBeUndefined()
      expect(sanitizedPayload.new.metadata.token).toBeUndefined()
      expect(sanitizedPayload.new.metadata.safe_field).toBe('allowed')
      expect(sanitizedPayload.new.metadata.user_agent).toBe('Mozilla/5.0')
    })
  })

  describe('Subscription Management', () => {
    it('should track multiple subscriptions', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      
      const sub1 = manager.subscribeToOrganization(['UPDATE'], handler1)
      const sub2 = manager.subscribeToWorkspaces(['INSERT'], handler2)
      
      expect(mockSupabase.channel).toHaveBeenCalledTimes(2)
      expect(sub1.channel).toBeDefined()
      expect(sub2.channel).toBeDefined()
    })

    it('should unsubscribe individual subscriptions', () => {
      const handler = vi.fn()
      const subscription = manager.subscribeToOrganization(['UPDATE'], handler)
      
      subscription.unsubscribe()
      
      expect(mockChannel.unsubscribe).toHaveBeenCalledTimes(1)
    })

    it('should unsubscribe all subscriptions', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      
      manager.subscribeToOrganization(['UPDATE'], handler1)
      manager.subscribeToWorkspaces(['INSERT'], handler2)
      
      manager.unsubscribeAll()
      
      expect(mockChannel.unsubscribe).toHaveBeenCalledTimes(2)
    })
  })

  describe('Presence Tracking', () => {
    it('should handle presence subscriptions', async () => {
      const handler = vi.fn()
      
      // Mock successful subscription
      mockChannel.subscribe.mockImplementationOnce((callback) => {
        callback('SUBSCRIBED')
        return mockChannel
      })
      
      const subscription = manager.subscribeToPresence(handler)
      
      expect(mockChannel.on).toHaveBeenCalledWith('presence', { event: 'sync' }, handler)
      expect(mockChannel.on).toHaveBeenCalledWith('presence', { event: 'join' }, handler)
      expect(mockChannel.on).toHaveBeenCalledWith('presence', { event: 'leave' }, handler)
      
      // Should track user presence after subscription
      await waitFor(() => {
        expect(mockChannel.track).toHaveBeenCalledWith({
          user_id: mockUser.id,
          online_at: expect.any(String)
        })
      })
    })
  })
})

describe('useTenantRealtime Hook', () => {
  it('should initialize manager with organization context', () => {
    const { result } = renderHook(() => useTenantRealtime())
    
    expect(result.current.isReady).toBe(true)
    expect(result.current.subscribe).toBeDefined()
    expect(result.current.unsubscribeAll).toBeDefined()
  })

  it('should handle subscription through hook', () => {
    const { result } = renderHook(() => useTenantRealtime())
    const handler = vi.fn()
    
    act(() => {
      const subscription = result.current.subscribe('organization', ['UPDATE'], handler)
      expect(subscription).not.toBeNull()
      expect(subscription?.channel).toBeDefined()
    })
  })

  it('should handle subscription errors gracefully', () => {
    const { result } = renderHook(() => useTenantRealtime())
    const handler = vi.fn()
    
    // Mock an error in subscription
    vi.spyOn(TenantRealtimeManager.prototype, 'subscribeToOrganization').mockImplementationOnce(() => {
      throw new Error('Subscription failed')
    })
    
    act(() => {
      const subscription = result.current.subscribe('organization', ['UPDATE'], handler)
      expect(subscription).toBeNull()
    })
  })

  it('should cleanup on unmount', () => {
    const { result, unmount } = renderHook(() => useTenantRealtime())
    const handler = vi.fn()
    
    act(() => {
      result.current.subscribe('organization', ['UPDATE'], handler)
    })
    
    unmount()
    
    // Cleanup should have been called
    expect(mockChannel.unsubscribe).toHaveBeenCalled()
  })
})

describe('useWorkspaceRealtime Hook', () => {
  const workspaceId = 'ws-123'

  it('should subscribe to workspace-specific changes', () => {
    const { result } = renderHook(() => useWorkspaceRealtime(workspaceId))
    const handler = vi.fn()
    
    act(() => {
      const subscription = result.current.subscribeToWorkspaceChanges(handler)
      expect(subscription).not.toBeNull()
    })
    
    // Should have called subscribe with workspace-specific options
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        table: 'workspaces'
      }),
      expect.any(Function)
    )
  })

  it('should subscribe to workspace project changes', () => {
    const { result } = renderHook(() => useWorkspaceRealtime(workspaceId))
    const handler = vi.fn()
    
    act(() => {
      const subscription = result.current.subscribeToWorkspaceProjects(handler)
      expect(subscription).not.toBeNull()
    })
    
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        table: 'projects'
      }),
      expect.any(Function)
    )
  })
})

describe('Real-time Security Integration', () => {
  let manager: TenantRealtimeManager

  beforeEach(() => {
    manager = new TenantRealtimeManager({
      organizationId: mockOrganization.id,
      userId: mockUser.id,
      permissions: mockPermissions
    })
  })

  it('should enforce project access through workspace validation', () => {
    const handler = vi.fn()
    manager.subscribeToProjects(['UPDATE'], handler, { workspaceId: 'ws-123' })
    
    const onCallback = mockChannel.on.mock.calls.find(
      call => call[0] === 'postgres_changes'
    )[2]
    
    // Mock project access check methods
    vi.spyOn(manager as any, 'hasProjectAccess').mockReturnValue(true)
    
    const projectPayload = {
      eventType: 'UPDATE',
      new: { 
        id: 'proj-123', 
        organization_id: mockOrganization.id,
        workspace_id: 'ws-123'
      }
    }
    
    onCallback(projectPayload)
    expect(handler).toHaveBeenCalled()
    
    // Test with wrong workspace
    const wrongWorkspacePayload = {
      eventType: 'UPDATE',
      new: { 
        id: 'proj-456',
        organization_id: mockOrganization.id,
        workspace_id: 'ws-wrong'
      }
    }
    
    handler.mockClear()
    onCallback(wrongWorkspacePayload)
    expect(handler).not.toHaveBeenCalled()
  })

  it('should validate organization boundary on all events', () => {
    const handler = vi.fn()
    manager.subscribeToProjects(['INSERT'], handler)
    
    const onCallback = mockChannel.on.mock.calls.find(
      call => call[0] === 'postgres_changes'
    )[2]
    
    vi.spyOn(manager as any, 'hasProjectAccess').mockReturnValue(true)
    
    // Valid organization
    const validPayload = {
      eventType: 'INSERT',
      new: { 
        id: 'proj-new',
        organization_id: mockOrganization.id
      }
    }
    
    onCallback(validPayload)
    expect(handler).toHaveBeenCalled()
    
    // Invalid organization
    const invalidPayload = {
      eventType: 'INSERT',
      new: { 
        id: 'proj-evil',
        organization_id: 'evil-org'
      }
    }
    
    handler.mockClear()
    onCallback(invalidPayload)
    expect(handler).not.toHaveBeenCalled()
  })
})