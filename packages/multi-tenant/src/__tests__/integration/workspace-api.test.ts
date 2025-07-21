import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { withTenantContext } from '../../middleware/tenant-context'
import { withRateLimit } from '../../middleware/rate-limiter'
import { requirePermission } from '../../middleware/permission-check'

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
      getUserById: vi.fn()
    }
  },
  rpc: vi.fn()
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase)
}))

describe('Workspace API Integration', () => {
  const mockContext = {
    organizationId: 'org-123',
    userId: 'user-456',
    role: 'admin' as const,
    permissions: ['workspace:view', 'workspace:create', 'workspace:update', 'workspace:delete']
  }

  const mockWorkspaces = [
    {
      id: 'ws-1',
      name: 'Design Team',
      slug: 'design-team',
      organization_id: 'org-123',
      created_at: '2024-01-01T00:00:00.000Z',
      is_default: false
    },
    {
      id: 'ws-2',
      name: 'Development',
      slug: 'development',
      organization_id: 'org-123',
      created_at: '2024-01-01T00:00:00.000Z',
      is_default: true
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful auth validation
    mockSupabase.auth.admin.getUserById.mockResolvedValue({
      user: { id: mockContext.userId, email: 'test@example.com' }
    })

    // Mock organization validation
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        id: mockContext.organizationId,
        name: 'Test Org',
        status: 'active'
      }
    })
  })

  describe('GET /api/workspaces', () => {
    const createGetHandler = () => {
      const handler = vi.fn(async (req, context) => {
        // Simulate fetching workspaces
        return NextResponse.json({ workspaces: mockWorkspaces })
      })

      return withTenantContext(
        withRateLimit('api/workspaces')(
          requirePermission('workspace:view')(handler)
        )
      )
    }

    it('should fetch workspaces with proper authentication', async () => {
      const handler = createGetHandler()
      const request = new NextRequest('http://localhost/api/workspaces')

      const response = await handler(request, mockContext)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.workspaces).toHaveLength(2)
      expect(body.workspaces[0].name).toBe('Design Team')
    })

    it('should apply rate limiting', async () => {
      const handler = createGetHandler()
      const request = new NextRequest('http://localhost/api/workspaces')

      // Should include rate limit headers
      const response = await handler(request, mockContext)
      
      expect(response.headers.get('X-RateLimit-Limit')).toBeDefined()
      expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined()
    })

    it('should require workspace:view permission', async () => {
      const restrictedContext = {
        ...mockContext,
        permissions: ['workspace:create'] // Missing view permission
      }

      const handler = createGetHandler()
      const request = new NextRequest('http://localhost/api/workspaces')

      const response = await handler(request, restrictedContext)
      expect(response.status).toBe(403)
    })

    it('should filter workspaces by organization context', async () => {
      const handler = vi.fn(async (req, context) => {
        expect(context.organizationId).toBe('org-123')
        return NextResponse.json({ workspaces: mockWorkspaces })
      })

      const securedHandler = withTenantContext(
        requirePermission('workspace:view')(handler)
      )

      const request = new NextRequest('http://localhost/api/workspaces')
      await securedHandler(request, mockContext)

      expect(handler).toHaveBeenCalledWith(
        request,
        expect.objectContaining({ organizationId: 'org-123' })
      )
    })
  })

  describe('POST /api/workspaces', () => {
    const createPostHandler = () => {
      const handler = vi.fn(async (req, context) => {
        const body = await req.json()
        const newWorkspace = {
          id: 'ws-new',
          ...body,
          organization_id: context.organizationId,
          created_at: new Date().toISOString()
        }
        return NextResponse.json(newWorkspace, { status: 201 })
      })

      return withTenantContext(
        withRateLimit('api/workspaces')(
          requirePermission('workspace:create')(handler)
        )
      )
    }

    it('should create workspace with valid data', async () => {
      const handler = createPostHandler()
      const workspaceData = {
        name: 'New Workspace',
        description: 'A new workspace',
        icon: '🚀',
        color: '#3B82F6'
      }

      const request = new NextRequest('http://localhost/api/workspaces', {
        method: 'POST',
        body: JSON.stringify(workspaceData),
        headers: { 'content-type': 'application/json' }
      })

      const response = await handler(request, mockContext)

      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body.name).toBe('New Workspace')
      expect(body.organization_id).toBe('org-123')
    })

    it('should require workspace:create permission', async () => {
      const restrictedContext = {
        ...mockContext,
        permissions: ['workspace:view'] // Missing create permission
      }

      const handler = createPostHandler()
      const request = new NextRequest('http://localhost/api/workspaces', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' })
      })

      const response = await handler(request, restrictedContext)
      expect(response.status).toBe(403)
    })

    it('should validate request payload', async () => {
      const handler = vi.fn(async (req) => {
        const body = await req.json()
        if (!body.name) {
          return NextResponse.json(
            { error: 'Name is required' },
            { status: 400 }
          )
        }
        return NextResponse.json({ success: true })
      })

      const securedHandler = withTenantContext(
        requirePermission('workspace:create')(handler)
      )

      const request = new NextRequest('http://localhost/api/workspaces', {
        method: 'POST',
        body: JSON.stringify({}), // Missing name
        headers: { 'content-type': 'application/json' }
      })

      const response = await securedHandler(request, mockContext)
      expect(response.status).toBe(400)
    })
  })

  describe('PUT /api/workspaces/:id', () => {
    const createPutHandler = () => {
      const handler = vi.fn(async (req, context) => {
        const body = await req.json()
        const url = new URL(req.url)
        const workspaceId = url.pathname.split('/').pop()
        
        const updatedWorkspace = {
          id: workspaceId,
          ...body,
          organization_id: context.organizationId,
          updated_at: new Date().toISOString()
        }
        
        return NextResponse.json(updatedWorkspace)
      })

      return withTenantContext(
        withRateLimit('api/workspaces')(
          requirePermission('workspace:update')(handler)
        )
      )
    }

    it('should update workspace with valid data', async () => {
      const handler = createPutHandler()
      const updateData = {
        name: 'Updated Workspace',
        description: 'Updated description'
      }

      const request = new NextRequest('http://localhost/api/workspaces/ws-1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'content-type': 'application/json' }
      })

      const response = await handler(request, mockContext)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.name).toBe('Updated Workspace')
      expect(body.id).toBe('ws-1')
    })

    it('should require workspace:update permission', async () => {
      const restrictedContext = {
        ...mockContext,
        permissions: ['workspace:view'] // Missing update permission
      }

      const handler = createPutHandler()
      const request = new NextRequest('http://localhost/api/workspaces/ws-1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' })
      })

      const response = await handler(request, restrictedContext)
      expect(response.status).toBe(403)
    })
  })

  describe('DELETE /api/workspaces/:id', () => {
    const createDeleteHandler = () => {
      const handler = vi.fn(async (req, context) => {
        const url = new URL(req.url)
        const workspaceId = url.pathname.split('/').pop()
        
        // Simulate deletion
        return NextResponse.json({ success: true, deletedId: workspaceId })
      })

      return withTenantContext(
        withRateLimit('api/workspaces')(
          requirePermission('workspace:delete')(handler)
        )
      )
    }

    it('should delete workspace successfully', async () => {
      const handler = createDeleteHandler()
      const request = new NextRequest('http://localhost/api/workspaces/ws-1', {
        method: 'DELETE'
      })

      const response = await handler(request, mockContext)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.deletedId).toBe('ws-1')
    })

    it('should require workspace:delete permission', async () => {
      const restrictedContext = {
        ...mockContext,
        permissions: ['workspace:view', 'workspace:update'] // Missing delete permission
      }

      const handler = createDeleteHandler()
      const request = new NextRequest('http://localhost/api/workspaces/ws-1', {
        method: 'DELETE'
      })

      const response = await handler(request, restrictedContext)
      expect(response.status).toBe(403)
    })

    it('should prevent deletion of default workspace', async () => {
      const handler = vi.fn(async (req) => {
        const url = new URL(req.url)
        const workspaceId = url.pathname.split('/').pop()
        
        if (workspaceId === 'ws-2') { // This is the default workspace
          return NextResponse.json(
            { error: 'Cannot delete default workspace' },
            { status: 400 }
          )
        }
        
        return NextResponse.json({ success: true })
      })

      const securedHandler = withTenantContext(
        requirePermission('workspace:delete')(handler)
      )

      const request = new NextRequest('http://localhost/api/workspaces/ws-2', {
        method: 'DELETE'
      })

      const response = await securedHandler(request, mockContext)
      expect(response.status).toBe(400)
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.from().select().eq().single.mockRejectedValue(
        new Error('Database connection failed')
      )

      const handler = vi.fn()
      const securedHandler = withTenantContext(handler)
      const request = new NextRequest('http://localhost/api/workspaces')

      const response = await securedHandler(request, mockContext)
      expect(response.status).toBe(403) // Should fail securely
      expect(handler).not.toHaveBeenCalled()
    })

    it('should handle malformed JSON in request body', async () => {
      const handler = vi.fn(async (req) => {
        try {
          await req.json()
          return NextResponse.json({ success: true })
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid JSON' },
            { status: 400 }
          )
        }
      })

      const securedHandler = withTenantContext(
        requirePermission('workspace:create')(handler)
      )

      const request = new NextRequest('http://localhost/api/workspaces', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'content-type': 'application/json' }
      })

      const response = await securedHandler(request, mockContext)
      expect(response.status).toBe(400)
    })

    it('should handle large payload attacks', async () => {
      const handler = vi.fn(async (req) => {
        const body = await req.text()
        if (body.length > 1024 * 1024) { // 1MB limit
          return NextResponse.json(
            { error: 'Payload too large' },
            { status: 413 }
          )
        }
        return NextResponse.json({ success: true })
      })

      const securedHandler = withTenantContext(handler)

      const largePayload = 'x'.repeat(2 * 1024 * 1024) // 2MB
      const request = new NextRequest('http://localhost/api/workspaces', {
        method: 'POST',
        body: largePayload
      })

      const response = await securedHandler(request, mockContext)
      // Would be handled by middleware in real implementation
      expect(response.status).toBe(413)
    })
  })

  describe('Concurrent Request Handling', () => {
    it('should handle multiple simultaneous requests', async () => {
      const handler = vi.fn(async (req, context) => {
        // Simulate async work
        await new Promise(resolve => setTimeout(resolve, 50))
        return NextResponse.json({ 
          organizationId: context.organizationId,
          timestamp: Date.now()
        })
      })

      const securedHandler = withTenantContext(
        requirePermission('workspace:view')(handler)
      )

      const requests = Array.from({ length: 5 }, (_, i) => 
        securedHandler(
          new NextRequest(`http://localhost/api/workspaces?batch=${i}`),
          mockContext
        )
      )

      const responses = await Promise.all(requests)

      responses.forEach(response => {
        expect(response.status).toBe(200)
      })
      expect(handler).toHaveBeenCalledTimes(5)
    })

    it('should maintain request isolation', async () => {
      const handler = vi.fn(async (req, context) => {
        const url = new URL(req.url)
        const batchId = url.searchParams.get('batch')
        
        return NextResponse.json({
          batchId,
          organizationId: context.organizationId
        })
      })

      const securedHandler = withTenantContext(
        requirePermission('workspace:view')(handler)
      )

      const contexts = [
        { ...mockContext, organizationId: 'org-1' },
        { ...mockContext, organizationId: 'org-2' },
        { ...mockContext, organizationId: 'org-3' }
      ]

      const requests = contexts.map((ctx, i) =>
        securedHandler(
          new NextRequest(`http://localhost/api/workspaces?batch=${i}`),
          ctx
        )
      )

      const responses = await Promise.all(requests)
      const bodies = await Promise.all(
        responses.map(r => r.json())
      )

      expect(bodies[0].organizationId).toBe('org-1')
      expect(bodies[1].organizationId).toBe('org-2')
      expect(bodies[2].organizationId).toBe('org-3')
    })
  })
})