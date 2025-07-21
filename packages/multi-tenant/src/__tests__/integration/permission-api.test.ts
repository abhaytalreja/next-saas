import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { withTenantContext } from '../../middleware/tenant-context'
import { requirePermission } from '../../middleware/permission-check'
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
      getUserById: vi.fn()
    }
  },
  rpc: vi.fn()
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase)
}))

describe('Permission API Integration', () => {
  const mockAdminContext = {
    organizationId: 'org-123',
    userId: 'user-admin',
    role: 'admin' as const,
    permissions: ['*'] // Admin with all permissions
  }

  const mockMemberContext = {
    organizationId: 'org-123',
    userId: 'user-member',
    role: 'member' as const,
    permissions: ['organization:view', 'workspace:view']
  }

  const mockPermissions = [
    {
      id: 'perm-1',
      name: 'organization:manage',
      description: 'Manage organization settings',
      category: 'organization'
    },
    {
      id: 'perm-2',
      name: 'workspace:create',
      description: 'Create workspaces',
      category: 'workspace'
    },
    {
      id: 'perm-3',
      name: 'project:delete',
      description: 'Delete projects',
      category: 'project'
    }
  ]

  const mockRoles = [
    {
      id: 'role-1',
      name: 'admin',
      display_name: 'Administrator',
      type: 'system',
      permissions: ['organization:manage', 'workspace:create']
    },
    {
      id: 'role-2',
      name: 'custom-role',
      display_name: 'Custom Role',
      type: 'custom',
      permissions: ['workspace:view']
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful auth validation
    mockSupabase.auth.admin.getUserById.mockResolvedValue({
      user: { id: 'user-admin', email: 'admin@example.com' }
    })

    // Mock organization validation
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        id: 'org-123',
        name: 'Test Org',
        status: 'active'
      }
    })
  })

  describe('GET /api/permissions', () => {
    const createGetPermissionsHandler = () => {
      const handler = vi.fn(async (req, context) => {
        return NextResponse.json({ permissions: mockPermissions })
      })

      return withTenantContext(
        withRateLimit('api/permissions')(
          requirePermission('organization:view')(handler)
        )
      )
    }

    it('should fetch permissions for authorized users', async () => {
      const handler = createGetPermissionsHandler()
      const request = new NextRequest('http://localhost/api/permissions')

      const response = await handler(request, mockAdminContext)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.permissions).toHaveLength(3)
      expect(body.permissions[0].name).toBe('organization:manage')
    })

    it('should block unauthorized users', async () => {
      const restrictedContext = {
        ...mockMemberContext,
        permissions: ['workspace:view'] // Missing organization:view
      }

      const handler = createGetPermissionsHandler()
      const request = new NextRequest('http://localhost/api/permissions')

      const response = await handler(request, restrictedContext)
      expect(response.status).toBe(403)
    })

    it('should filter permissions by category', async () => {
      const handler = vi.fn(async (req) => {
        const url = new URL(req.url)
        const category = url.searchParams.get('category')
        
        const filteredPermissions = category 
          ? mockPermissions.filter(p => p.category === category)
          : mockPermissions
        
        return NextResponse.json({ permissions: filteredPermissions })
      })

      const securedHandler = withTenantContext(
        requirePermission('organization:view')(handler)
      )

      const request = new NextRequest('http://localhost/api/permissions?category=workspace')
      const response = await securedHandler(request, mockAdminContext)

      const body = await response.json()
      expect(body.permissions).toHaveLength(1)
      expect(body.permissions[0].category).toBe('workspace')
    })
  })

  describe('GET /api/roles', () => {
    const createGetRolesHandler = () => {
      const handler = vi.fn(async (req, context) => {
        return NextResponse.json({ roles: mockRoles })
      })

      return withTenantContext(
        withRateLimit('api/roles')(
          requirePermission('organization:view')(handler)
        )
      )
    }

    it('should fetch roles for authorized users', async () => {
      const handler = createGetRolesHandler()
      const request = new NextRequest('http://localhost/api/roles')

      const response = await handler(request, mockAdminContext)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.roles).toHaveLength(2)
      expect(body.roles[0].name).toBe('admin')
    })

    it('should filter roles by type', async () => {
      const handler = vi.fn(async (req) => {
        const url = new URL(req.url)
        const type = url.searchParams.get('type')
        
        const filteredRoles = type 
          ? mockRoles.filter(r => r.type === type)
          : mockRoles
        
        return NextResponse.json({ roles: filteredRoles })
      })

      const securedHandler = withTenantContext(
        requirePermission('organization:view')(handler)
      )

      const request = new NextRequest('http://localhost/api/roles?type=custom')
      const response = await securedHandler(request, mockAdminContext)

      const body = await response.json()
      expect(body.roles).toHaveLength(1)
      expect(body.roles[0].type).toBe('custom')
    })
  })

  describe('POST /api/roles', () => {
    const createPostRoleHandler = () => {
      const handler = vi.fn(async (req, context) => {
        const body = await req.json()
        const newRole = {
          id: 'role-new',
          ...body,
          organization_id: context.organizationId,
          type: 'custom',
          created_at: new Date().toISOString()
        }
        return NextResponse.json(newRole, { status: 201 })
      })

      return withTenantContext(
        withRateLimit('api/roles')(
          requirePermission('organization:manage')(handler)
        )
      )
    }

    it('should create custom role with admin permissions', async () => {
      const handler = createPostRoleHandler()
      const roleData = {
        name: 'editor',
        display_name: 'Editor',
        permissions: ['workspace:create', 'project:view']
      }

      const request = new NextRequest('http://localhost/api/roles', {
        method: 'POST',
        body: JSON.stringify(roleData),
        headers: { 'content-type': 'application/json' }
      })

      const response = await handler(request, mockAdminContext)

      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body.name).toBe('editor')
      expect(body.type).toBe('custom')
      expect(body.permissions).toEqual(['workspace:create', 'project:view'])
    })

    it('should require organization:manage permission', async () => {
      const handler = createPostRoleHandler()
      const request = new NextRequest('http://localhost/api/roles', {
        method: 'POST',
        body: JSON.stringify({ name: 'test-role' })
      })

      const response = await handler(request, mockMemberContext)
      expect(response.status).toBe(403)
    })

    it('should validate role data', async () => {
      const handler = vi.fn(async (req) => {
        const body = await req.json()
        
        if (!body.name || !body.display_name) {
          return NextResponse.json(
            { error: 'Name and display name are required' },
            { status: 400 }
          )
        }
        
        return NextResponse.json({ success: true })
      })

      const securedHandler = withTenantContext(
        requirePermission('organization:manage')(handler)
      )

      const request = new NextRequest('http://localhost/api/roles', {
        method: 'POST',
        body: JSON.stringify({ name: 'test' }), // Missing display_name
        headers: { 'content-type': 'application/json' }
      })

      const response = await securedHandler(request, mockAdminContext)
      expect(response.status).toBe(400)
    })

    it('should prevent duplicate role names', async () => {
      const handler = vi.fn(async (req) => {
        const body = await req.json()
        
        if (body.name === 'admin') {
          return NextResponse.json(
            { error: 'Role name already exists' },
            { status: 409 }
          )
        }
        
        return NextResponse.json({ success: true })
      })

      const securedHandler = withTenantContext(
        requirePermission('organization:manage')(handler)
      )

      const request = new NextRequest('http://localhost/api/roles', {
        method: 'POST',
        body: JSON.stringify({
          name: 'admin',
          display_name: 'Admin'
        }),
        headers: { 'content-type': 'application/json' }
      })

      const response = await securedHandler(request, mockAdminContext)
      expect(response.status).toBe(409)
    })
  })

  describe('PUT /api/roles/:id/permissions', () => {
    const createUpdatePermissionsHandler = () => {
      const handler = vi.fn(async (req, context) => {
        const body = await req.json()
        const url = new URL(req.url)
        const roleId = url.pathname.split('/')[3] // Extract role ID
        
        const updatedRole = {
          id: roleId,
          permissions: body.permissions,
          updated_at: new Date().toISOString()
        }
        
        return NextResponse.json(updatedRole)
      })

      return withTenantContext(
        withRateLimit('api/roles')(
          requirePermission('organization:manage')(handler)
        )
      )
    }

    it('should update role permissions', async () => {
      const handler = createUpdatePermissionsHandler()
      const newPermissions = ['workspace:create', 'workspace:update', 'project:view']

      const request = new NextRequest('http://localhost/api/roles/role-2/permissions', {
        method: 'PUT',
        body: JSON.stringify({ permissions: newPermissions }),
        headers: { 'content-type': 'application/json' }
      })

      const response = await handler(request, mockAdminContext)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.permissions).toEqual(newPermissions)
      expect(body.id).toBe('role-2')
    })

    it('should prevent updating system roles', async () => {
      const handler = vi.fn(async (req) => {
        const url = new URL(req.url)
        const roleId = url.pathname.split('/')[3]
        
        if (roleId === 'role-1') { // System role
          return NextResponse.json(
            { error: 'Cannot modify system roles' },
            { status: 403 }
          )
        }
        
        return NextResponse.json({ success: true })
      })

      const securedHandler = withTenantContext(
        requirePermission('organization:manage')(handler)
      )

      const request = new NextRequest('http://localhost/api/roles/role-1/permissions', {
        method: 'PUT',
        body: JSON.stringify({ permissions: ['workspace:view'] })
      })

      const response = await securedHandler(request, mockAdminContext)
      expect(response.status).toBe(403)
    })

    it('should validate permission names', async () => {
      const handler = vi.fn(async (req) => {
        const body = await req.json()
        
        const invalidPermissions = body.permissions.filter(
          (perm: string) => !mockPermissions.some(p => p.name === perm)
        )
        
        if (invalidPermissions.length > 0) {
          return NextResponse.json(
            { error: `Invalid permissions: ${invalidPermissions.join(', ')}` },
            { status: 400 }
          )
        }
        
        return NextResponse.json({ success: true })
      })

      const securedHandler = withTenantContext(
        requirePermission('organization:manage')(handler)
      )

      const request = new NextRequest('http://localhost/api/roles/role-2/permissions', {
        method: 'PUT',
        body: JSON.stringify({ 
          permissions: ['workspace:create', 'invalid:permission']
        }),
        headers: { 'content-type': 'application/json' }
      })

      const response = await securedHandler(request, mockAdminContext)
      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /api/roles/:id', () => {
    const createDeleteRoleHandler = () => {
      const handler = vi.fn(async (req, context) => {
        const url = new URL(req.url)
        const roleId = url.pathname.split('/')[3]
        
        return NextResponse.json({ success: true, deletedId: roleId })
      })

      return withTenantContext(
        withRateLimit('api/roles')(
          requirePermission('organization:manage')(handler)
        )
      )
    }

    it('should delete custom roles', async () => {
      const handler = createDeleteRoleHandler()
      const request = new NextRequest('http://localhost/api/roles/role-2', {
        method: 'DELETE'
      })

      const response = await handler(request, mockAdminContext)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.deletedId).toBe('role-2')
    })

    it('should prevent deleting system roles', async () => {
      const handler = vi.fn(async (req) => {
        const url = new URL(req.url)
        const roleId = url.pathname.split('/')[3]
        
        if (roleId === 'role-1') {
          return NextResponse.json(
            { error: 'Cannot delete system roles' },
            { status: 403 }
          )
        }
        
        return NextResponse.json({ success: true })
      })

      const securedHandler = withTenantContext(
        requirePermission('organization:manage')(handler)
      )

      const request = new NextRequest('http://localhost/api/roles/role-1', {
        method: 'DELETE'
      })

      const response = await securedHandler(request, mockAdminContext)
      expect(response.status).toBe(403)
    })

    it('should prevent deleting roles with assigned members', async () => {
      const handler = vi.fn(async (req) => {
        const url = new URL(req.url)
        const roleId = url.pathname.split('/')[3]
        
        // Simulate checking for assigned members
        if (roleId === 'role-2') {
          return NextResponse.json(
            { error: 'Cannot delete role with assigned members' },
            { status: 409 }
          )
        }
        
        return NextResponse.json({ success: true })
      })

      const securedHandler = withTenantContext(
        requirePermission('organization:manage')(handler)
      )

      const request = new NextRequest('http://localhost/api/roles/role-2', {
        method: 'DELETE'
      })

      const response = await securedHandler(request, mockAdminContext)
      expect(response.status).toBe(409)
    })
  })

  describe('Permission Inheritance and Validation', () => {
    it('should validate permission hierarchies', async () => {
      const handler = vi.fn(async (req) => {
        const body = await req.json()
        const permissions = body.permissions
        
        // Example: workspace:delete requires workspace:update
        const hasDelete = permissions.includes('workspace:delete')
        const hasUpdate = permissions.includes('workspace:update')
        
        if (hasDelete && !hasUpdate) {
          return NextResponse.json(
            { error: 'workspace:delete requires workspace:update permission' },
            { status: 400 }
          )
        }
        
        return NextResponse.json({ success: true })
      })

      const securedHandler = withTenantContext(
        requirePermission('organization:manage')(handler)
      )

      const request = new NextRequest('http://localhost/api/roles/role-2/permissions', {
        method: 'PUT',
        body: JSON.stringify({ 
          permissions: ['workspace:delete'] // Missing required workspace:update
        }),
        headers: { 'content-type': 'application/json' }
      })

      const response = await securedHandler(request, mockAdminContext)
      expect(response.status).toBe(400)
    })

    it('should handle wildcard permissions', async () => {
      const handler = vi.fn(async (req) => {
        const body = await req.json()
        const permissions = body.permissions
        
        if (permissions.includes('*')) {
          return NextResponse.json({
            message: 'Wildcard permission grants all access',
            effectivePermissions: ['*']
          })
        }
        
        return NextResponse.json({ permissions })
      })

      const securedHandler = withTenantContext(
        requirePermission('organization:manage')(handler)
      )

      const request = new NextRequest('http://localhost/api/roles/role-2/permissions', {
        method: 'PUT',
        body: JSON.stringify({ permissions: ['*'] }),
        headers: { 'content-type': 'application/json' }
      })

      const response = await securedHandler(request, mockAdminContext)
      const body = await response.json()
      expect(body.effectivePermissions).toEqual(['*'])
    })
  })

  describe('Audit Logging', () => {
    it('should log permission changes', async () => {
      mockSupabase.from().insert.mockResolvedValue({ error: null })

      const handler = vi.fn(async (req, context) => {
        const body = await req.json()
        
        // Log the permission change
        await mockSupabase
          .from('audit_logs')
          .insert({
            organization_id: context.organizationId,
            user_id: context.userId,
            action: 'update_role_permissions',
            resource_type: 'role',
            resource_id: 'role-2',
            details: { new_permissions: body.permissions }
          })
        
        return NextResponse.json({ success: true })
      })

      const securedHandler = withTenantContext(
        requirePermission('organization:manage')(handler)
      )

      const request = new NextRequest('http://localhost/api/roles/role-2/permissions', {
        method: 'PUT',
        body: JSON.stringify({ permissions: ['workspace:view'] })
      })

      await securedHandler(request, mockAdminContext)

      expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs')
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'update_role_permissions',
          resource_type: 'role'
        })
      )
    })

    it('should log role creation and deletion', async () => {
      mockSupabase.from().insert.mockResolvedValue({ error: null })

      const handler = vi.fn(async (req, context) => {
        const method = req.method
        const action = method === 'POST' ? 'create_role' : 'delete_role'
        
        await mockSupabase
          .from('audit_logs')
          .insert({
            organization_id: context.organizationId,
            user_id: context.userId,
            action,
            resource_type: 'role'
          })
        
        return NextResponse.json({ success: true })
      })

      const securedHandler = withTenantContext(
        requirePermission('organization:manage')(handler)
      )

      const createRequest = new NextRequest('http://localhost/api/roles', {
        method: 'POST',
        body: JSON.stringify({ name: 'test-role', display_name: 'Test' })
      })

      await securedHandler(createRequest, mockAdminContext)

      expect(mockSupabase.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'create_role'
        })
      )
    })
  })
})