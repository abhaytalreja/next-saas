import { NextRequest } from 'next/server'
import { GET, PATCH, DELETE } from './route'
import '@testing-library/jest-dom'

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn()
  },
  from: jest.fn(),
  rpc: jest.fn()
}

// Mock isUserSystemAdmin
jest.mock('@nextsaas/auth/middleware/admin-middleware', () => ({
  isUserSystemAdmin: jest.fn()
}))

// Mock getSupabaseServerClient
jest.mock('@nextsaas/supabase', () => ({
  getSupabaseServerClient: () => mockSupabaseClient
}))

import { isUserSystemAdmin } from '@nextsaas/auth/middleware/admin-middleware'

// Mock NextRequest
const createMockRequest = (
  url: string = 'http://localhost:3000/api/admin/organizations/org-123',
  method: string = 'GET',
  body?: any,
  headers?: Record<string, string>
): NextRequest => {
  const request = {
    url,
    method,
    json: jest.fn().mockResolvedValue(body || {}),
    headers: new Map(Object.entries(headers || {})),
    ip: '127.0.0.1'
  } as unknown as NextRequest
  
  return request
}

const mockRouteParams = { params: { id: 'org-123' } }

// Mock console methods
const originalConsoleError = console.error
beforeEach(() => {
  console.error = jest.fn()
  jest.clearAllMocks()
})

afterEach(() => {
  console.error = originalConsoleError
})

describe('/api/admin/organizations/[id]', () => {
  describe('GET method', () => {
    describe('authentication and authorization', () => {
      it('should return 401 when session error occurs', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: new Error('Session error')
        })

        const request = createMockRequest()
        const response = await GET(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Unauthorized')
      })

      it('should return 401 when no session exists', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: null
        })

        const request = createMockRequest()
        const response = await GET(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Unauthorized')
      })

      it('should return 403 when user is not admin', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'user-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(false)

        const request = createMockRequest()
        const response = await GET(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.error).toBe('Forbidden')
      })
    })

    describe('successful organization retrieval', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should return organization details successfully', async () => {
        const mockOrganization = {
          id: 'org-123',
          name: 'Test Organization',
          slug: 'test-org',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          metadata: { key: 'value' },
          memberships: [
            {
              id: 'membership-1',
              role: 'owner',
              user_id: 'user-1',
              created_at: '2023-01-01T00:00:00Z',
              users: {
                id: 'user-1',
                name: 'John Doe',
                email: 'john@example.com',
                avatar_url: 'https://example.com/avatar1.jpg'
              }
            },
            {
              id: 'membership-2',
              role: 'member',
              user_id: 'user-2',
              created_at: '2023-01-02T00:00:00Z',
              users: {
                id: 'user-2',
                name: 'Jane Smith',
                email: 'jane@example.com',
                avatar_url: null
              }
            }
          ]
        }

        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              is: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockOrganization,
                  error: null
                }))
              }))
            }))
          }))
        })

        const request = createMockRequest()
        const response = await GET(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toMatchObject({
          id: 'org-123',
          name: 'Test Organization',
          slug: 'test-org',
          status: 'active',
          plan: 'pro',
          member_count: 2
        })
        expect(data.data.owner).toMatchObject({
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com'
        })
        expect(data.data.members).toHaveLength(2)
        expect(data.data.members[0]).toMatchObject({
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'owner'
        })
      })

      it('should return 404 when organization not found', async () => {
        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              is: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: null,
                  error: new Error('Organization not found')
                }))
              }))
            }))
          }))
        })

        const request = createMockRequest()
        const response = await GET(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(404)
        expect(data.error).toBe('Organization not found')
      })

      it('should handle organization without owner', async () => {
        const mockOrganization = {
          id: 'org-123',
          name: 'Orphaned Organization',
          slug: 'orphaned-org',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          metadata: {},
          memberships: [
            {
              id: 'membership-1',
              role: 'member',
              user_id: 'user-1',
              created_at: '2023-01-01T00:00:00Z',
              users: {
                id: 'user-1',
                name: 'John Doe',
                email: 'john@example.com',
                avatar_url: null
              }
            }
          ]
        }

        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              is: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockOrganization,
                  error: null
                }))
              }))
            }))
          }))
        })

        const request = createMockRequest()
        const response = await GET(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.owner).toMatchObject({
          id: '',
          name: '',
          email: ''
        })
      })

      it('should transform organization data correctly', async () => {
        const mockOrganization = {
          id: 'org-123',
          name: 'Test Organization',
          slug: 'test-org',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          metadata: { custom_field: 'value' },
          memberships: []
        }

        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              is: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: mockOrganization,
                  error: null
                }))
              }))
            }))
          }))
        })

        const request = createMockRequest()
        const response = await GET(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data).toHaveProperty('monthly_revenue', 0)
        expect(data.data).toHaveProperty('storage_used', 0)
        expect(data.data).toHaveProperty('storage_limit', 100)
        expect(data.data).toHaveProperty('metadata', { custom_field: 'value' })
        expect(data.data.members).toEqual([])
      })
    })

    describe('error handling', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
      })

      it('should handle database errors', async () => {
        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              is: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: null,
                  error: new Error('Database error')
                }))
              }))
            }))
          }))
        })

        const request = createMockRequest()
        const response = await GET(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(404)
        expect(data.error).toBe('Organization not found')
      })

      it('should handle unexpected errors', async () => {
        mockSupabaseClient.auth.getSession.mockRejectedValue(new Error('Unexpected error'))

        const request = createMockRequest()
        const response = await GET(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Internal server error')
      })
    })
  })

  describe('PATCH method', () => {
    describe('authentication and authorization', () => {
      it('should return 401 when session error occurs', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: new Error('Session error')
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations/org-123',
          'PATCH',
          { name: 'Updated Name' }
        )
        const response = await PATCH(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Unauthorized')
      })

      it('should return 403 when user is not admin', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'user-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(false)

        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations/org-123',
          'PATCH',
          { name: 'Updated Name' }
        )
        const response = await PATCH(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.error).toBe('Forbidden')
      })
    })

    describe('organization suspension', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should suspend organization successfully', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations/org-123',
          'PATCH',
          { suspend: true, reason: 'Terms violation' }
        )
        const response = await PATCH(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBe('Organization suspended successfully')
        expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('log_system_admin_action', {
          admin_id: 'admin-123',
          action_name: 'organization_suspended',
          target_type: 'organization',
          target_id: 'org-123',
          action_details: { reason: 'Terms violation' },
          ip_addr: '127.0.0.1',
          user_agent_str: null
        })
      })
    })

    describe('organization activation', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should activate organization successfully', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations/org-123',
          'PATCH',
          { activate: true }
        )
        const response = await PATCH(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBe('Organization activated successfully')
        expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('log_system_admin_action', {
          admin_id: 'admin-123',
          action_name: 'organization_activated',
          target_type: 'organization',
          target_id: 'org-123',
          action_details: { method: 'admin_panel' },
          ip_addr: '127.0.0.1',
          user_agent_str: null
        })
      })
    })

    describe('regular organization updates', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should update organization name and slug successfully', async () => {
        mockSupabaseClient.from.mockReturnValue({
          update: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null }))
          }))
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations/org-123',
          'PATCH',
          { name: 'Updated Organization Name', slug: 'updated-org-slug' }
        )
        const response = await PATCH(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBe('Organization updated successfully')
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('organizations')
      })

      it('should update only name when slug is not provided', async () => {
        mockSupabaseClient.from.mockReturnValue({
          update: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null }))
          }))
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations/org-123',
          'PATCH',
          { name: 'Updated Organization Name' }
        )
        const response = await PATCH(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(mockSupabaseClient.from().update).toHaveBeenCalledWith({
          name: 'Updated Organization Name'
        })
      })

      it('should handle empty updates gracefully', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations/org-123',
          'PATCH',
          { otherField: 'value' }
        )
        const response = await PATCH(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBe('Organization updated successfully')
      })

      it('should handle database update errors', async () => {
        mockSupabaseClient.from.mockReturnValue({
          update: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({
              error: new Error('Update failed')
            }))
          }))
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations/org-123',
          'PATCH',
          { name: 'Updated Name' }
        )
        const response = await PATCH(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Internal server error')
      })

      it('should log admin action for updates', async () => {
        mockSupabaseClient.from.mockReturnValue({
          update: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null }))
          }))
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations/org-123',
          'PATCH',
          { name: 'Updated Name', slug: 'updated-slug' }
        )
        const response = await PATCH(request, mockRouteParams)

        expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('log_system_admin_action', {
          admin_id: 'admin-123',
          action_name: 'organization_updated',
          target_type: 'organization',
          target_id: 'org-123',
          action_details: {
            updated_fields: ['name', 'slug'],
            changes: { name: 'Updated Name', slug: 'updated-slug' }
          },
          ip_addr: '127.0.0.1',
          user_agent_str: null
        })
      })
    })

    describe('error handling', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
      })

      it('should handle JSON parsing errors', async () => {
        const request = {
          url: 'http://localhost:3000/api/admin/organizations/org-123',
          method: 'PATCH',
          json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
          headers: new Map(),
          ip: '127.0.0.1'
        } as unknown as NextRequest

        const response = await PATCH(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Internal server error')
      })

      it('should handle unexpected errors', async () => {
        mockSupabaseClient.auth.getSession.mockRejectedValue(new Error('Unexpected error'))

        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations/org-123',
          'PATCH',
          { name: 'Updated Name' }
        )
        const response = await PATCH(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Internal server error')
      })
    })
  })

  describe('DELETE method', () => {
    describe('authentication and authorization', () => {
      it('should return 401 when session error occurs', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: new Error('Session error')
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations/org-123',
          'DELETE'
        )
        const response = await DELETE(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Unauthorized')
      })

      it('should return 403 when user is not admin', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'user-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(false)

        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations/org-123',
          'DELETE'
        )
        const response = await DELETE(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.error).toBe('Forbidden')
      })
    })

    describe('organization deletion', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should delete organization successfully', async () => {
        mockSupabaseClient.from.mockReturnValue({
          update: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null }))
          }))
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations/org-123',
          'DELETE'
        )
        const response = await DELETE(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBe('Organization deleted successfully')
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('organizations')
        expect(mockSupabaseClient.from().update).toHaveBeenCalledWith({
          deleted_at: expect.any(String)
        })
      })

      it('should handle soft delete errors', async () => {
        mockSupabaseClient.from.mockReturnValue({
          update: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({
              error: new Error('Delete failed')
            }))
          }))
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations/org-123',
          'DELETE'
        )
        const response = await DELETE(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Internal server error')
      })

      it('should log admin deletion action', async () => {
        mockSupabaseClient.from.mockReturnValue({
          update: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null }))
          }))
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations/org-123',
          'DELETE'
        )
        const response = await DELETE(request, mockRouteParams)

        expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('log_system_admin_action', {
          admin_id: 'admin-123',
          action_name: 'organization_deleted',
          target_type: 'organization',
          target_id: 'org-123',
          action_details: { method: 'admin_panel' },
          ip_addr: '127.0.0.1',
          user_agent_str: null
        })
      })
    })

    describe('error handling', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
      })

      it('should handle unexpected errors', async () => {
        mockSupabaseClient.from.mockImplementation(() => {
          throw new Error('Unexpected error')
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations/org-123',
          'DELETE'
        )
        const response = await DELETE(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Internal server error')
      })
    })
  })

  describe('edge cases and boundaries', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'admin-123' } } },
        error: null
      })
      ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
    })

    it('should handle malformed organization ID parameter', async () => {
      const malformedParams = { params: { id: '' } }
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            is: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: null,
                error: new Error('Invalid ID')
              }))
            }))
          }))
        }))
      })

      const request = createMockRequest()
      const response = await GET(request, malformedParams)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Organization not found')
    })

    it('should handle null body in PATCH request', async () => {
      const request = {
        url: 'http://localhost:3000/api/admin/organizations/org-123',
        method: 'PATCH',
        json: jest.fn().mockResolvedValue(null),
        headers: new Map(),
        ip: '127.0.0.1'
      } as unknown as NextRequest

      const response = await PATCH(request, mockRouteParams)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should handle RPC logging errors gracefully', async () => {
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null }))
        }))
      })
      mockSupabaseClient.rpc.mockRejectedValue(new Error('Logging failed'))

      const request = createMockRequest(
        'http://localhost:3000/api/admin/organizations/org-123',
        'PATCH',
        { name: 'Updated Name' }
      )
      const response = await PATCH(request, mockRouteParams)
      const data = await response.json()

      // Should still succeed even if logging fails
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})