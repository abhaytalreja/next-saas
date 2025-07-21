import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { ContextValidator, withContextValidation, withResourceValidation } from '../../middleware/context-validator'
import type { TenantContext } from '../../middleware/tenant-context'

// Mock Supabase client
const mockSupabase = {
  auth: {
    admin: {
      getUserById: vi.fn()
    }
  },
  from: vi.fn(),
  rpc: vi.fn()
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase)
}))

// Mock data
const mockUserId = 'user-123'
const mockOrganizationId = 'org-123'
const mockWorkspaceId = 'ws-123'
const mockProjectId = 'proj-123'

const mockContext: TenantContext = {
  organizationId: mockOrganizationId,
  userId: mockUserId,
  role: 'admin',
  permissions: ['organization:view', 'workspace:view', 'project:view']
}

describe('ContextValidator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validateTenantContext', () => {
    it('should validate complete tenant context successfully', async () => {
      // Mock successful user lookup
      mockSupabase.auth.admin.getUserById.mockResolvedValueOnce({
        user: {
          id: mockUserId,
          email: 'test@example.com',
          email_confirmed_at: new Date().toISOString(),
          banned_until: null
        }
      })

      // Mock successful organization lookup
      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: mockOrganizationId,
            name: 'Test Org',
            status: 'active',
            deleted_at: null
          }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockFromChain)

      // Mock successful membership lookup
      const mockMembershipChain = {
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
      mockSupabase.from.mockReturnValueOnce(mockMembershipChain)

      // Mock permissions lookup
      mockSupabase.rpc.mockResolvedValueOnce({
        data: ['organization:view', 'workspace:manage'],
        error: null
      })

      // Mock billing lookup
      const mockBillingChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { payment_status: 'active' }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockBillingChain)

      const result = await ContextValidator.validateTenantContext(mockUserId, mockOrganizationId)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.context).toEqual({
        organizationId: mockOrganizationId,
        userId: mockUserId,
        role: 'admin',
        permissions: ['organization:view', 'workspace:manage']
      })
    })

    it('should fail validation for invalid user', async () => {
      mockSupabase.auth.admin.getUserById.mockResolvedValueOnce({
        user: null,
        error: { message: 'User not found' }
      })

      const result = await ContextValidator.validateTenantContext(mockUserId, mockOrganizationId)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid or non-existent user')
    })

    it('should fail validation for banned user', async () => {
      mockSupabase.auth.admin.getUserById.mockResolvedValueOnce({
        user: {
          id: mockUserId,
          email: 'banned@example.com',
          banned_until: new Date(Date.now() + 86400000).toISOString()
        }
      })

      const result = await ContextValidator.validateTenantContext(mockUserId, mockOrganizationId)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('User account is banned')
    })

    it('should warn for unconfirmed email', async () => {
      mockSupabase.auth.admin.getUserById.mockResolvedValueOnce({
        user: {
          id: mockUserId,
          email: 'unconfirmed@example.com',
          email_confirmed_at: null,
          banned_until: null
        }
      })

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: mockOrganizationId,
            name: 'Test Org',
            status: 'active',
            deleted_at: null
          }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockFromChain)

      const mockMembershipChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            role: 'member',
            status: 'active',
            permissions: []
          }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockMembershipChain)

      mockSupabase.rpc.mockResolvedValueOnce({ data: [], error: null })

      const mockBillingChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null })
      }
      mockSupabase.from.mockReturnValueOnce(mockBillingChain)

      const result = await ContextValidator.validateTenantContext(mockUserId, mockOrganizationId)

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('User email is not confirmed')
    })

    it('should fail validation for deleted organization', async () => {
      mockSupabase.auth.admin.getUserById.mockResolvedValueOnce({
        user: {
          id: mockUserId,
          email: 'test@example.com',
          email_confirmed_at: new Date().toISOString(),
          banned_until: null
        }
      })

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: mockOrganizationId,
            name: 'Test Org',
            status: 'active',
            deleted_at: new Date().toISOString()
          }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockFromChain)

      const result = await ContextValidator.validateTenantContext(mockUserId, mockOrganizationId)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Organization has been deleted')
    })

    it('should fail validation for non-member', async () => {
      mockSupabase.auth.admin.getUserById.mockResolvedValueOnce({
        user: {
          id: mockUserId,
          email: 'test@example.com',
          email_confirmed_at: new Date().toISOString(),
          banned_until: null
        }
      })

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: mockOrganizationId,
            name: 'Test Org',
            status: 'active',
            deleted_at: null
          }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockFromChain)

      const mockMembershipChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockMembershipChain)

      const result = await ContextValidator.validateTenantContext(mockUserId, mockOrganizationId)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('User is not a member of this organization')
    })
  })

  describe('validateWorkspaceAccess', () => {
    it('should validate workspace access for admin user', async () => {
      const adminContext = { ...mockContext, role: 'admin' }
      
      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: mockWorkspaceId,
            name: 'Test Workspace',
            is_archived: false,
            deleted_at: null
          }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockFromChain)

      const result = await ContextValidator.validateWorkspaceAccess(adminContext, mockWorkspaceId)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail validation for deleted workspace', async () => {
      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: mockWorkspaceId,
            name: 'Test Workspace',
            is_archived: false,
            deleted_at: new Date().toISOString()
          }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockFromChain)

      const result = await ContextValidator.validateWorkspaceAccess(mockContext, mockWorkspaceId)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Workspace has been deleted')
    })

    it('should warn for archived workspace', async () => {
      const adminContext = { ...mockContext, role: 'admin' }
      
      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: mockWorkspaceId,
            name: 'Test Workspace',
            is_archived: true,
            deleted_at: null
          }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockFromChain)

      const result = await ContextValidator.validateWorkspaceAccess(adminContext, mockWorkspaceId)

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('Workspace is archived')
    })

    it('should validate workspace membership for non-admin user', async () => {
      const memberContext = { ...mockContext, role: 'member' }
      
      const mockWorkspaceChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: mockWorkspaceId,
            name: 'Test Workspace',
            is_archived: false,
            deleted_at: null
          }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockWorkspaceChain)

      const mockMembershipChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { role: 'member' }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockMembershipChain)

      const result = await ContextValidator.validateWorkspaceAccess(memberContext, mockWorkspaceId)

      expect(result.isValid).toBe(true)
    })

    it('should deny access for non-member without admin role', async () => {
      const memberContext = { ...mockContext, role: 'member' }
      
      const mockWorkspaceChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: mockWorkspaceId,
            name: 'Test Workspace',
            is_archived: false,
            deleted_at: null
          }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockWorkspaceChain)

      const mockMembershipChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockMembershipChain)

      const result = await ContextValidator.validateWorkspaceAccess(memberContext, mockWorkspaceId)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('No access to this workspace')
    })
  })

  describe('validateProjectAccess', () => {
    it('should validate project access through workspace', async () => {
      const mockProjectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: mockProjectId,
            name: 'Test Project',
            workspace_id: mockWorkspaceId,
            organization_id: mockOrganizationId
          }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockProjectChain)

      // Mock workspace validation
      const mockWorkspaceChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: mockWorkspaceId,
            name: 'Test Workspace',
            is_archived: false,
            deleted_at: null
          }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockWorkspaceChain)

      const adminContext = { ...mockContext, role: 'admin' }
      const result = await ContextValidator.validateProjectAccess(adminContext, mockProjectId, mockWorkspaceId)

      expect(result.isValid).toBe(true)
    })

    it('should fail validation for project in wrong workspace', async () => {
      const mockProjectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: mockProjectId,
            name: 'Test Project',
            workspace_id: 'different-workspace',
            organization_id: mockOrganizationId
          }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockProjectChain)

      const result = await ContextValidator.validateProjectAccess(mockContext, mockProjectId, mockWorkspaceId)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Project does not belong to specified workspace')
    })

    it('should fail validation for project in different organization', async () => {
      const mockProjectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: mockProjectId,
            name: 'Test Project',
            workspace_id: mockWorkspaceId,
            organization_id: 'different-org'
          }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockProjectChain)

      const result = await ContextValidator.validateProjectAccess(mockContext, mockProjectId)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Project not found or access denied')
    })
  })

  describe('validateApiKeyAccess', () => {
    it('should validate API key successfully', async () => {
      const mockApiKey = 'api-key-123'
      
      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'key-123',
            organization_id: mockOrganizationId,
            workspace_id: null,
            permissions: ['*'],
            expires_at: new Date(Date.now() + 86400000).toISOString(),
            revoked_at: null
          }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockFromChain)

      // Mock update call for last_used_at
      const mockUpdateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      }
      mockSupabase.from.mockReturnValueOnce(mockUpdateChain)

      const result = await ContextValidator.validateApiKeyAccess(mockApiKey, mockOrganizationId)

      expect(result.isValid).toBe(true)
      expect(mockUpdateChain.update).toHaveBeenCalledWith({
        last_used_at: expect.any(String)
      })
    })

    it('should fail validation for revoked API key', async () => {
      const mockApiKey = 'revoked-key'
      
      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'key-revoked',
            organization_id: mockOrganizationId,
            permissions: ['*'],
            expires_at: null,
            revoked_at: new Date().toISOString()
          }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockFromChain)

      const result = await ContextValidator.validateApiKeyAccess(mockApiKey, mockOrganizationId)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('API key has been revoked')
    })

    it('should fail validation for expired API key', async () => {
      const mockApiKey = 'expired-key'
      
      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'key-expired',
            organization_id: mockOrganizationId,
            permissions: ['*'],
            expires_at: new Date(Date.now() - 86400000).toISOString(),
            revoked_at: null
          }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockFromChain)

      const result = await ContextValidator.validateApiKeyAccess(mockApiKey, mockOrganizationId)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('API key has expired')
    })

    it('should validate required permissions', async () => {
      const mockApiKey = 'limited-key'
      
      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'key-limited',
            organization_id: mockOrganizationId,
            permissions: ['workspace:view'],
            expires_at: null,
            revoked_at: null
          }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockFromChain)

      const mockUpdateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      }
      mockSupabase.from.mockReturnValueOnce(mockUpdateChain)

      const result = await ContextValidator.validateApiKeyAccess(
        mockApiKey, 
        mockOrganizationId, 
        ['workspace:view']
      )

      expect(result.isValid).toBe(true)

      // Test with insufficient permissions
      const mockFromChain2 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'key-limited',
            organization_id: mockOrganizationId,
            permissions: ['workspace:view'],
            expires_at: null,
            revoked_at: null
          }
        })
      }
      mockSupabase.from.mockReturnValueOnce(mockFromChain2)

      const result2 = await ContextValidator.validateApiKeyAccess(
        mockApiKey, 
        mockOrganizationId, 
        ['organization:manage']
      )

      expect(result2.isValid).toBe(false)
      expect(result2.errors).toContain('API key lacks required permissions')
    })
  })

  describe('validateRateLimit', () => {
    it('should pass validation when under quota', async () => {
      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      mockSupabase.from.mockReturnValue(mockFromChain)

      mockFromChain.eq.mockResolvedValueOnce({
        data: [{
          resource_type: 'api_calls',
          limit_value: 1000,
          current_value: 500,
          period: 'monthly'
        }]
      })

      const result = await ContextValidator.validateRateLimit(mockContext, 'api_calls', 'create')

      expect(result.isValid).toBe(true)
      expect(result.warnings).toHaveLength(0)
    })

    it('should warn when approaching quota limit', async () => {
      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      mockSupabase.from.mockReturnValue(mockFromChain)

      mockFromChain.eq.mockResolvedValueOnce({
        data: [{
          resource_type: 'api_calls',
          limit_value: 1000,
          current_value: 900,
          period: 'monthly'
        }]
      })

      const result = await ContextValidator.validateRateLimit(mockContext, 'api_calls', 'create')

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('api_calls quota is at 90% capacity')
    })

    it('should fail validation when quota exceeded', async () => {
      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      mockSupabase.from.mockReturnValue(mockFromChain)

      mockFromChain.eq.mockResolvedValueOnce({
        data: [{
          resource_type: 'api_calls',
          limit_value: 1000,
          current_value: 1000,
          period: 'monthly'
        }]
      })

      const result = await ContextValidator.validateRateLimit(mockContext, 'api_calls', 'create')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('api_calls quota exceeded (1000/1000)')
    })
  })
})

describe('withContextValidation Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should pass through when validation succeeds', async () => {
    const mockHandler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }))
    const wrappedHandler = withContextValidation(mockHandler)
    
    // Mock successful validation
    vi.spyOn(ContextValidator, 'validateTenantContext').mockResolvedValueOnce({
      isValid: true,
      errors: [],
      warnings: [],
      context: mockContext
    })

    const mockRequest = new NextRequest('http://localhost/api/test')
    const result = await wrappedHandler(mockRequest, mockContext)

    expect(mockHandler).toHaveBeenCalledWith(mockRequest, mockContext)
    expect(result.status).toBe(200)
  })

  it('should return 403 when validation fails', async () => {
    const mockHandler = vi.fn()
    const wrappedHandler = withContextValidation(mockHandler)
    
    vi.spyOn(ContextValidator, 'validateTenantContext').mockResolvedValueOnce({
      isValid: false,
      errors: ['Invalid user'],
      warnings: []
    })

    const mockRequest = new NextRequest('http://localhost/api/test')
    const result = await wrappedHandler(mockRequest, mockContext)

    expect(mockHandler).not.toHaveBeenCalled()
    expect(result.status).toBe(403)
    
    const body = await result.json()
    expect(body.error).toBe('Invalid request context')
    expect(body.details).toContain('Invalid user')
  })

  it('should add warning headers when validation has warnings', async () => {
    const mockHandler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }))
    const wrappedHandler = withContextValidation(mockHandler)
    
    vi.spyOn(ContextValidator, 'validateTenantContext').mockResolvedValueOnce({
      isValid: true,
      errors: [],
      warnings: ['User email not confirmed', 'Billing past due'],
      context: mockContext
    })

    const mockRequest = new NextRequest('http://localhost/api/test')
    const result = await wrappedHandler(mockRequest, mockContext)

    expect(result.headers.get('X-Context-Warnings')).toBe(
      'User email not confirmed; Billing past due'
    )
  })
})

describe('withResourceValidation Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should validate workspace resource access', async () => {
    const mockHandler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }))
    const getResourceId = (req: NextRequest) => 'ws-123'
    
    const wrappedHandler = withResourceValidation('workspace', getResourceId)(mockHandler)
    
    // Mock successful context validation
    vi.spyOn(ContextValidator, 'validateTenantContext').mockResolvedValueOnce({
      isValid: true,
      errors: [],
      warnings: [],
      context: mockContext
    })
    
    // Mock successful workspace validation
    vi.spyOn(ContextValidator, 'validateWorkspaceAccess').mockResolvedValueOnce({
      isValid: true,
      errors: [],
      warnings: []
    })

    const mockRequest = new NextRequest('http://localhost/api/workspace/ws-123')
    const result = await wrappedHandler(mockRequest, mockContext)

    expect(ContextValidator.validateWorkspaceAccess).toHaveBeenCalledWith(mockContext, 'ws-123')
    expect(mockHandler).toHaveBeenCalled()
    expect(result.status).toBe(200)
  })

  it('should validate project resource access', async () => {
    const mockHandler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }))
    const getResourceId = (req: NextRequest) => 'proj-123'
    
    const wrappedHandler = withResourceValidation('project', getResourceId)(mockHandler)
    
    vi.spyOn(ContextValidator, 'validateTenantContext').mockResolvedValueOnce({
      isValid: true,
      errors: [],
      warnings: [],
      context: mockContext
    })
    
    vi.spyOn(ContextValidator, 'validateProjectAccess').mockResolvedValueOnce({
      isValid: true,
      errors: [],
      warnings: []
    })

    const mockRequest = new NextRequest('http://localhost/api/project/proj-123')
    const result = await wrappedHandler(mockRequest, mockContext)

    expect(ContextValidator.validateProjectAccess).toHaveBeenCalledWith(mockContext, 'proj-123')
    expect(mockHandler).toHaveBeenCalled()
  })

  it('should return 403 for invalid resource access', async () => {
    const mockHandler = vi.fn()
    const getResourceId = (req: NextRequest) => 'ws-invalid'
    
    const wrappedHandler = withResourceValidation('workspace', getResourceId)(mockHandler)
    
    vi.spyOn(ContextValidator, 'validateTenantContext').mockResolvedValueOnce({
      isValid: true,
      errors: [],
      warnings: [],
      context: mockContext
    })
    
    vi.spyOn(ContextValidator, 'validateWorkspaceAccess').mockResolvedValueOnce({
      isValid: false,
      errors: ['Workspace not found'],
      warnings: []
    })

    const mockRequest = new NextRequest('http://localhost/api/workspace/ws-invalid')
    const result = await wrappedHandler(mockRequest, mockContext)

    expect(mockHandler).not.toHaveBeenCalled()
    expect(result.status).toBe(403)
    
    const body = await result.json()
    expect(body.error).toBe('Invalid workspace access')
    expect(body.details).toContain('Workspace not found')
  })
})