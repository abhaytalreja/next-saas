import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { withTenantContext } from '../../middleware/tenant-context'
import { requirePermission } from '../../middleware/permission-check'
import { withSecurityMonitoring } from '../../middleware/security-monitor'
import { withRateLimit } from '../../middleware/rate-limiter'

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    mockResolvedValue: vi.fn()
  })),
  auth: {
    admin: {
      getUserById: vi.fn(),
      createUser: vi.fn(),
      deleteUser: vi.fn()
    }
  },
  rpc: vi.fn()
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase)
}))

describe('Organization API Integration', () => {
  const mockOwnerContext = {
    organizationId: 'org-123',
    userId: 'user-owner',
    role: 'owner' as const,
    permissions: ['*'] // Owner with all permissions
  }

  const mockMemberContext = {
    organizationId: 'org-123',
    userId: 'user-member', 
    role: 'member' as const,
    permissions: ['organization:view', 'workspace:view']
  }

  const mockOrganization = {
    id: 'org-123',
    name: 'Test Organization',
    slug: 'test-org',
    status: 'active',
    created_at: '2024-01-01T00:00:00.000Z',
    settings: {
      max_workspaces: 10,
      max_members: 50
    }
  }

  const mockMembers = [
    {
      id: 'member-1',
      user_id: 'user-owner',
      organization_id: 'org-123',
      role: 'owner',
      status: 'active',
      invited_at: '2024-01-01T00:00:00.000Z',
      user: {
        email: 'owner@example.com',
        name: 'Organization Owner'
      }
    },
    {
      id: 'member-2',
      user_id: 'user-member',
      organization_id: 'org-123', 
      role: 'member',
      status: 'active',
      invited_at: '2024-01-02T00:00:00.000Z',
      user: {
        email: 'member@example.com',
        name: 'Team Member'
      }
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful auth validation
    mockSupabase.auth.admin.getUserById.mockResolvedValue({
      user: { id: 'user-owner', email: 'owner@example.com' }
    })

    // Mock organization validation
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: mockOrganization
    })
  })

  describe('GET /api/organization/settings', () => {
    const createGetSettingsHandler = () => {
      const handler = vi.fn(async (req, context) => {
        return NextResponse.json({ 
          organization: mockOrganization,
          settings: mockOrganization.settings
        })
      })

      return withTenantContext(
        withSecurityMonitoring()(
          withRateLimit('api/organization')(
            requirePermission('organization:view')(handler)
          )
        )
      )
    }

    it('should fetch organization settings for authorized users', async () => {
      const handler = createGetSettingsHandler()
      const request = new NextRequest('http://localhost/api/organization/settings')

      const response = await handler(request, mockOwnerContext)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.organization.name).toBe('Test Organization')
      expect(body.settings.max_workspaces).toBe(10)
    })

    it('should include security headers', async () => {
      const handler = createGetSettingsHandler()
      const request = new NextRequest('http://localhost/api/organization/settings')

      const response = await handler(request, mockOwnerContext)
      
      expect(response.headers.get('X-Security-Scan')).toBe('enabled')
      expect(response.headers.get('X-RateLimit-Limit')).toBeDefined()
    })

    it('should require organization:view permission', async () => {
      const restrictedContext = {
        ...mockMemberContext,
        permissions: ['workspace:view'] // Missing organization:view
      }

      const handler = createGetSettingsHandler()
      const request = new NextRequest('http://localhost/api/organization/settings')

      const response = await handler(request, restrictedContext)
      expect(response.status).toBe(403)
    })
  })

  describe('PUT /api/organization/settings', () => {
    const createUpdateSettingsHandler = () => {
      const handler = vi.fn(async (req, context) => {
        const body = await req.json()
        const updatedOrg = {
          ...mockOrganization,
          ...body,
          updated_at: new Date().toISOString()
        }
        return NextResponse.json(updatedOrg)
      })

      return withTenantContext(
        withSecurityMonitoring()(
          withRateLimit('api/organization')(
            requirePermission('organization:manage')(handler)
          )
        )
      )
    }

    it('should update organization settings', async () => {
      const handler = createUpdateSettingsHandler()
      const updateData = {
        name: 'Updated Organization',
        settings: {
          max_workspaces: 20,
          max_members: 100
        }
      }

      const request = new NextRequest('http://localhost/api/organization/settings', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'content-type': 'application/json' }
      })

      const response = await handler(request, mockOwnerContext)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.name).toBe('Updated Organization')
      expect(body.settings.max_workspaces).toBe(20)
    })

    it('should require organization:manage permission', async () => {
      const handler = createUpdateSettingsHandler()
      const request = new NextRequest('http://localhost/api/organization/settings', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' })
      })

      const response = await handler(request, mockMemberContext)
      expect(response.status).toBe(403)
    })

    it('should validate settings data', async () => {
      const handler = vi.fn(async (req) => {
        const body = await req.json()
        
        if (body.settings?.max_workspaces < 1) {
          return NextResponse.json(
            { error: 'max_workspaces must be at least 1' },
            { status: 400 }
          )
        }
        
        return NextResponse.json({ success: true })
      })

      const securedHandler = withTenantContext(
        requirePermission('organization:manage')(handler)
      )

      const request = new NextRequest('http://localhost/api/organization/settings', {
        method: 'PUT',
        body: JSON.stringify({
          settings: { max_workspaces: 0 } // Invalid value
        }),
        headers: { 'content-type': 'application/json' }
      })

      const response = await securedHandler(request, mockOwnerContext)
      expect(response.status).toBe(400)
    })

    it('should sanitize organization name input', async () => {
      const handler = createUpdateSettingsHandler()
      const maliciousData = {
        name: '<script>alert("xss")</script>Test Org'
      }

      const request = new NextRequest('http://localhost/api/organization/settings', {
        method: 'PUT',
        body: JSON.stringify(maliciousData),
        headers: { 'content-type': 'application/json' }
      })

      const response = await handler(request, mockOwnerContext)
      
      // Should be blocked by security monitoring
      expect(response.status).toBe(403)
    })
  })

  describe('GET /api/organization/members', () => {
    const createGetMembersHandler = () => {
      const handler = vi.fn(async (req, context) => {
        return NextResponse.json({ 
          members: mockMembers,
          total: mockMembers.length
        })
      })

      return withTenantContext(
        withRateLimit('api/organization')(
          requirePermission('organization:view')(handler)
        )
      )
    }

    it('should fetch organization members', async () => {
      const handler = createGetMembersHandler()
      const request = new NextRequest('http://localhost/api/organization/members')

      const response = await handler(request, mockOwnerContext)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.members).toHaveLength(2)
      expect(body.members[0].user.email).toBe('owner@example.com')
    })

    it('should support pagination', async () => {
      const handler = vi.fn(async (req) => {
        const url = new URL(req.url)
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '10')
        const offset = (page - 1) * limit
        
        const paginatedMembers = mockMembers.slice(offset, offset + limit)
        
        return NextResponse.json({
          members: paginatedMembers,
          pagination: {
            page,
            limit,
            total: mockMembers.length,
            totalPages: Math.ceil(mockMembers.length / limit)
          }
        })
      })

      const securedHandler = withTenantContext(
        requirePermission('organization:view')(handler)
      )

      const request = new NextRequest('http://localhost/api/organization/members?page=1&limit=1')
      const response = await securedHandler(request, mockOwnerContext)

      const body = await response.json()
      expect(body.members).toHaveLength(1)
      expect(body.pagination.page).toBe(1)
      expect(body.pagination.total).toBe(2)
    })

    it('should filter members by role', async () => {
      const handler = vi.fn(async (req) => {
        const url = new URL(req.url)
        const roleFilter = url.searchParams.get('role')
        
        const filteredMembers = roleFilter
          ? mockMembers.filter(m => m.role === roleFilter)
          : mockMembers
        
        return NextResponse.json({ members: filteredMembers })
      })

      const securedHandler = withTenantContext(
        requirePermission('organization:view')(handler)
      )

      const request = new NextRequest('http://localhost/api/organization/members?role=owner')
      const response = await securedHandler(request, mockOwnerContext)

      const body = await response.json()
      expect(body.members).toHaveLength(1)
      expect(body.members[0].role).toBe('owner')
    })
  })

  describe('POST /api/organization/members/invite', () => {
    const createInviteHandler = () => {
      const handler = vi.fn(async (req, context) => {
        const body = await req.json()
        const invitation = {
          id: 'invite-123',
          organization_id: context.organizationId,
          email: body.email,
          role: body.role,
          status: 'pending',
          invited_by: context.userId,
          invited_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
        return NextResponse.json(invitation, { status: 201 })
      })

      return withTenantContext(
        withSecurityMonitoring()(
          withRateLimit('api/organization/invite')(
            requirePermission('organization:invite')(handler)
          )
        )
      )
    }

    it('should invite new members', async () => {
      const handler = createInviteHandler()
      const inviteData = {
        email: 'newmember@example.com',
        role: 'member'
      }

      const request = new NextRequest('http://localhost/api/organization/members/invite', {
        method: 'POST',
        body: JSON.stringify(inviteData),
        headers: { 'content-type': 'application/json' }
      })

      const response = await handler(request, mockOwnerContext)

      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body.email).toBe('newmember@example.com')
      expect(body.role).toBe('member')
      expect(body.status).toBe('pending')
    })

    it('should require organization:invite permission', async () => {
      const restrictedContext = {
        ...mockMemberContext,
        permissions: ['organization:view'] // Missing invite permission
      }

      const handler = createInviteHandler()
      const request = new NextRequest('http://localhost/api/organization/members/invite', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', role: 'member' })
      })

      const response = await handler(request, restrictedContext)
      expect(response.status).toBe(403)
    })

    it('should validate email format', async () => {
      const handler = vi.fn(async (req) => {
        const body = await req.json()
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(body.email)) {
          return NextResponse.json(
            { error: 'Invalid email format' },
            { status: 400 }
          )
        }
        
        return NextResponse.json({ success: true })
      })

      const securedHandler = withTenantContext(
        requirePermission('organization:invite')(handler)
      )

      const request = new NextRequest('http://localhost/api/organization/members/invite', {
        method: 'POST',
        body: JSON.stringify({ 
          email: 'invalid-email', // Invalid format
          role: 'member'
        }),
        headers: { 'content-type': 'application/json' }
      })

      const response = await securedHandler(request, mockOwnerContext)
      expect(response.status).toBe(400)
    })

    it('should prevent duplicate invitations', async () => {
      const handler = vi.fn(async (req) => {
        const body = await req.json()
        
        if (body.email === 'owner@example.com') {
          return NextResponse.json(
            { error: 'User is already a member' },
            { status: 409 }
          )
        }
        
        return NextResponse.json({ success: true })
      })

      const securedHandler = withTenantContext(
        requirePermission('organization:invite')(handler)
      )

      const request = new NextRequest('http://localhost/api/organization/members/invite', {
        method: 'POST',
        body: JSON.stringify({ 
          email: 'owner@example.com', // Already a member
          role: 'member'
        }),
        headers: { 'content-type': 'application/json' }
      })

      const response = await securedHandler(request, mockOwnerContext)
      expect(response.status).toBe(409)
    })

    it('should enforce member limits', async () => {
      const handler = vi.fn(async (req, context) => {
        const currentMemberCount = mockMembers.length
        const maxMembers = mockOrganization.settings.max_members
        
        if (currentMemberCount >= maxMembers) {
          return NextResponse.json(
            { 
              error: 'Member limit reached',
              current: currentMemberCount,
              max: maxMembers
            },
            { status: 409 }
          )
        }
        
        return NextResponse.json({ success: true })
      })

      const securedHandler = withTenantContext(
        requirePermission('organization:invite')(handler)
      )

      // Mock organization at member limit
      const limitedOrg = { ...mockOrganization, settings: { max_members: 2 } }
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: limitedOrg
      })

      const request = new NextRequest('http://localhost/api/organization/members/invite', {
        method: 'POST',
        body: JSON.stringify({ 
          email: 'newmember@example.com',
          role: 'member'
        }),
        headers: { 'content-type': 'application/json' }
      })

      const response = await securedHandler(request, mockOwnerContext)
      expect(response.status).toBe(409)
    })
  })

  describe('DELETE /api/organization/members/:id', () => {
    const createRemoveMemberHandler = () => {
      const handler = vi.fn(async (req, context) => {
        const url = new URL(req.url)
        const memberId = url.pathname.split('/').pop()
        
        return NextResponse.json({ 
          success: true, 
          removedMemberId: memberId,
          removedBy: context.userId
        })
      })

      return withTenantContext(
        withRateLimit('api/organization')(
          requirePermission('organization:manage')(handler)
        )
      )
    }

    it('should remove organization members', async () => {
      const handler = createRemoveMemberHandler()
      const request = new NextRequest('http://localhost/api/organization/members/member-2', {
        method: 'DELETE'
      })

      const response = await handler(request, mockOwnerContext)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.removedMemberId).toBe('member-2')
    })

    it('should require organization:manage permission', async () => {
      const handler = createRemoveMemberHandler()
      const request = new NextRequest('http://localhost/api/organization/members/member-2', {
        method: 'DELETE'
      })

      const response = await handler(request, mockMemberContext)
      expect(response.status).toBe(403)
    })

    it('should prevent removing the last owner', async () => {
      const handler = vi.fn(async (req) => {
        const url = new URL(req.url)
        const memberId = url.pathname.split('/').pop()
        
        // Simulate checking if this is the last owner
        if (memberId === 'member-1') { // Owner member
          return NextResponse.json(
            { error: 'Cannot remove the last owner' },
            { status: 409 }
          )
        }
        
        return NextResponse.json({ success: true })
      })

      const securedHandler = withTenantContext(
        requirePermission('organization:manage')(handler)
      )

      const request = new NextRequest('http://localhost/api/organization/members/member-1', {
        method: 'DELETE'
      })

      const response = await securedHandler(request, mockOwnerContext)
      expect(response.status).toBe(409)
    })

    it('should prevent self-removal', async () => {
      const handler = vi.fn(async (req, context) => {
        const url = new URL(req.url)
        const memberId = url.pathname.split('/').pop()
        
        const memberToRemove = mockMembers.find(m => m.id === memberId)
        
        if (memberToRemove?.user_id === context.userId) {
          return NextResponse.json(
            { error: 'Cannot remove yourself' },
            { status: 409 }
          )
        }
        
        return NextResponse.json({ success: true })
      })

      const securedHandler = withTenantContext(
        requirePermission('organization:manage')(handler)
      )

      const request = new NextRequest('http://localhost/api/organization/members/member-1', {
        method: 'DELETE'
      })

      const response = await securedHandler(request, mockOwnerContext)
      expect(response.status).toBe(409)
    })
  })

  describe('Performance and Scalability', () => {
    it('should handle large member lists efficiently', async () => {
      const largeMemberList = Array.from({ length: 1000 }, (_, i) => ({
        id: `member-${i}`,
        user_id: `user-${i}`,
        organization_id: 'org-123',
        role: i === 0 ? 'owner' : 'member',
        status: 'active'
      }))

      const handler = vi.fn(async (req) => {
        const url = new URL(req.url)
        const limit = parseInt(url.searchParams.get('limit') || '50')
        const page = parseInt(url.searchParams.get('page') || '1')
        const offset = (page - 1) * limit
        
        const paginatedMembers = largeMemberList.slice(offset, offset + limit)
        
        return NextResponse.json({
          members: paginatedMembers,
          pagination: {
            total: largeMemberList.length,
            page,
            limit,
            totalPages: Math.ceil(largeMemberList.length / limit)
          }
        })
      })

      const securedHandler = withTenantContext(
        requirePermission('organization:view')(handler)
      )

      const request = new NextRequest('http://localhost/api/organization/members?limit=50&page=1')
      
      const startTime = performance.now()
      const response = await securedHandler(request, mockOwnerContext)
      const endTime = performance.now()

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.members).toHaveLength(50)
      expect(endTime - startTime).toBeLessThan(100) // Should be fast
    })

    it('should handle concurrent member operations', async () => {
      const handler = vi.fn(async (req, context) => {
        // Simulate database operation
        await new Promise(resolve => setTimeout(resolve, 10))
        
        return NextResponse.json({
          success: true,
          timestamp: Date.now(),
          organizationId: context.organizationId
        })
      })

      const securedHandler = withTenantContext(
        requirePermission('organization:view')(handler)
      )

      const requests = Array.from({ length: 10 }, (_, i) =>
        securedHandler(
          new NextRequest(`http://localhost/api/organization/members?batch=${i}`),
          mockOwnerContext
        )
      )

      const responses = await Promise.all(requests)
      
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })
      expect(handler).toHaveBeenCalledTimes(10)
    })
  })
})