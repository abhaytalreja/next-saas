import { NextRequest } from 'next/server'
import { GET, PATCH, DELETE } from './route'
import '@testing-library/jest-dom'

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
    admin: {
      updateUserById: jest.fn(),
      deleteUser: jest.fn()
    }
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
  url: string = 'http://localhost:3000/api/admin/users/user-123',
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

const mockRouteParams = { params: { id: 'user-123' } }

// Mock console methods
const originalConsoleError = console.error
beforeEach(() => {
  console.error = jest.fn()
  jest.clearAllMocks()
})

afterEach(() => {
  console.error = originalConsoleError
})

describe('/api/admin/users/[id]', () => {
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

    describe('successful user retrieval', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should return user details successfully', async () => {
        const mockUser = {
          id: 'user-123',
          email: 'user@example.com',
          name: 'Test User',
          avatar_url: 'https://example.com/avatar.jpg',
          is_system_admin: false,
          last_seen_at: '2023-01-01T00:00:00Z',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          email_verified_at: '2023-01-01T00:00:00Z',
          timezone: 'UTC',
          locale: 'en',
          metadata: { key: 'value' },
          memberships: [
            {
              id: 'membership-1',
              role: 'owner',
              created_at: '2023-01-01T00:00:00Z',
              accepted_at: '2023-01-01T00:00:00Z',
              organization_id: 'org-1',
              organizations: { id: 'org-1', name: 'Test Org', slug: 'test-org' }
            }
          ]
        }

        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  is: jest.fn(() => ({
                    single: jest.fn(() => Promise.resolve({
                      data: mockUser,
                      error: null
                    }))
                  }))
                }))
              }))
            }
          }
          if (table === 'audit_logs') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  order: jest.fn(() => ({
                    limit: jest.fn(() => Promise.resolve({
                      data: [
                        {
                          id: 'log-1',
                          action: 'login',
                          resource_type: 'user',
                          created_at: '2023-01-01T00:00:00Z',
                          details: { ip: '127.0.0.1' }
                        }
                      ],
                      error: null
                    }))
                  }))
                }))
              }))
            }
          }
          if (table === 'user_sessions') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  order: jest.fn(() => ({
                    limit: jest.fn(() => Promise.resolve({
                      data: [
                        {
                          id: 'session-1',
                          ip_address: '127.0.0.1',
                          user_agent: 'Mozilla/5.0',
                          created_at: '2023-01-01T00:00:00Z',
                          expires_at: '2023-01-02T00:00:00Z'
                        }
                      ],
                      error: null
                    }))
                  }))
                }))
              }))
            }
          }
          return { select: jest.fn() }
        })

        const request = createMockRequest()
        const response = await GET(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toMatchObject({
          id: 'user-123',
          email: 'user@example.com',
          name: 'Test User',
          status: 'active',
          is_system_admin: false,
          organizations: [
            {
              id: 'org-1',
              name: 'Test Org',
              slug: 'test-org',
              role: 'owner'
            }
          ]
        })
        expect(data.data).toHaveProperty('recent_activity')
        expect(data.data).toHaveProperty('active_sessions')
      })

      it('should return 404 when user not found', async () => {
        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              is: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: null,
                  error: new Error('User not found')
                }))
              }))
            }))
          }))
        })

        const request = createMockRequest()
        const response = await GET(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(404)
        expect(data.error).toBe('User not found')
      })

      it('should handle pending users correctly', async () => {
        const mockUser = {
          id: 'user-123',
          email: 'user@example.com',
          name: 'Test User',
          email_verified_at: null, // Not verified
          memberships: []
        }

        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  is: jest.fn(() => ({
                    single: jest.fn(() => Promise.resolve({
                      data: mockUser,
                      error: null
                    }))
                  }))
                }))
              }))
            }
          }
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
                }))
              }))
            }))
          }
        })

        const request = createMockRequest()
        const response = await GET(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.status).toBe('pending')
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
        expect(data.error).toBe('User not found')
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
          'http://localhost:3000/api/admin/users/user-123',
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
          'http://localhost:3000/api/admin/users/user-123',
          'PATCH',
          { name: 'Updated Name' }
        )
        const response = await PATCH(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.error).toBe('Forbidden')
      })
    })

    describe('user suspension', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should suspend user successfully', async () => {
        mockSupabaseClient.auth.admin.updateUserById.mockResolvedValue({
          error: null
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/user-123',
          'PATCH',
          { suspend: true, reason: 'Violation of terms' }
        )
        const response = await PATCH(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBe('User suspended successfully')
        expect(mockSupabaseClient.auth.admin.updateUserById).toHaveBeenCalledWith(
          'user-123',
          { ban_duration: '87600h' }
        )
      })

      it('should handle suspension errors', async () => {
        mockSupabaseClient.auth.admin.updateUserById.mockResolvedValue({
          error: new Error('Suspension failed')
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/user-123',
          'PATCH',
          { suspend: true }
        )
        const response = await PATCH(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Failed to suspend user')
      })
    })

    describe('user activation', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should activate user successfully', async () => {
        mockSupabaseClient.auth.admin.updateUserById.mockResolvedValue({
          error: null
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/user-123',
          'PATCH',
          { activate: true }
        )
        const response = await PATCH(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBe('User activated successfully')
        expect(mockSupabaseClient.auth.admin.updateUserById).toHaveBeenCalledWith(
          'user-123',
          { ban_duration: 'none' }
        )
      })

      it('should handle activation errors', async () => {
        mockSupabaseClient.auth.admin.updateUserById.mockResolvedValue({
          error: new Error('Activation failed')
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/user-123',
          'PATCH',
          { activate: true }
        )
        const response = await PATCH(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Failed to activate user')
      })
    })

    describe('regular user updates', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should update user name and email successfully', async () => {
        mockSupabaseClient.auth.admin.updateUserById.mockResolvedValue({
          error: null
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/user-123',
          'PATCH',
          { name: 'Updated Name', email: 'updated@example.com' }
        )
        const response = await PATCH(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBe('User updated successfully')
        expect(mockSupabaseClient.auth.admin.updateUserById).toHaveBeenCalledWith(
          'user-123',
          { name: 'Updated Name', email: 'updated@example.com' }
        )
      })

      it('should update system admin status', async () => {
        mockSupabaseClient.auth.admin.updateUserById.mockResolvedValue({
          error: null
        })
        
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              update: jest.fn(() => ({
                eq: jest.fn(() => Promise.resolve({ error: null }))
              }))
            }
          }
          if (table === 'system_admins') {
            return {
              upsert: jest.fn(() => Promise.resolve({ error: null }))
            }
          }
          return { update: jest.fn(), upsert: jest.fn() }
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/user-123',
          'PATCH',
          { is_system_admin: true }
        )
        const response = await PATCH(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
      })

      it('should revoke system admin status', async () => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              update: jest.fn(() => ({
                eq: jest.fn(() => Promise.resolve({ error: null }))
              }))
            }
          }
          if (table === 'system_admins') {
            return {
              update: jest.fn(() => ({
                eq: jest.fn(() => ({
                  is: jest.fn(() => Promise.resolve({ error: null }))
                }))
              }))
            }
          }
          return { update: jest.fn() }
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/user-123',
          'PATCH',
          { is_system_admin: false }
        )
        const response = await PATCH(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
      })

      it('should handle user update errors', async () => {
        mockSupabaseClient.auth.admin.updateUserById.mockResolvedValue({
          error: new Error('Update failed')
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/user-123',
          'PATCH',
          { name: 'Updated Name' }
        )
        const response = await PATCH(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Failed to update user')
      })

      it('should handle admin status update errors', async () => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              update: jest.fn(() => ({
                eq: jest.fn(() => Promise.resolve({
                  error: new Error('Admin status update failed')
                }))
              }))
            }
          }
          return { update: jest.fn() }
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/user-123',
          'PATCH',
          { is_system_admin: true }
        )
        const response = await PATCH(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Failed to update admin status')
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
          'http://localhost:3000/api/admin/users/user-123',
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
          'http://localhost:3000/api/admin/users/user-123',
          'DELETE'
        )
        const response = await DELETE(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.error).toBe('Forbidden')
      })
    })

    describe('user deletion', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
        mockSupabaseClient.auth.admin.deleteUser.mockResolvedValue({
          error: null
        })
      })

      it('should prevent self-deletion', async () => {
        const selfDeleteParams = { params: { id: 'admin-123' } }
        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/admin-123',
          'DELETE'
        )
        const response = await DELETE(request, selfDeleteParams)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Cannot delete your own account')
      })

      it('should delete user successfully', async () => {
        mockSupabaseClient.from.mockReturnValue({
          update: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null }))
          }))
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/user-123',
          'DELETE'
        )
        const response = await DELETE(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBe('User deleted successfully')
        expect(mockSupabaseClient.auth.admin.deleteUser).toHaveBeenCalledWith('user-123')
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
          'http://localhost:3000/api/admin/users/user-123',
          'DELETE'
        )
        const response = await DELETE(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Failed to delete user')
      })

      it('should handle auth delete errors gracefully', async () => {
        mockSupabaseClient.from.mockReturnValue({
          update: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null }))
          }))
        })
        mockSupabaseClient.auth.admin.deleteUser.mockRejectedValue(
          new Error('Auth delete failed')
        )

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/user-123',
          'DELETE'
        )
        const response = await DELETE(request, mockRouteParams)
        const data = await response.json()

        // Should still succeed as soft delete worked
        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
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
          'http://localhost:3000/api/admin/users/user-123',
          'DELETE'
        )
        const response = await DELETE(request, mockRouteParams)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Internal server error')
      })
    })
  })
})