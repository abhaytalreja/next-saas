import { NextRequest } from 'next/server'
import { POST } from './route'
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

// Mock getSupabaseServerClient
jest.mock('@nextsaas/supabase', () => ({
  getSupabaseServerClient: () => mockSupabaseClient
}))

// Mock NextRequest
const createMockRequest = (
  url: string = 'http://localhost:3000/api/admin/users/bulk',
  method: string = 'POST',
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

// Mock console methods
const originalConsoleError = console.error
const originalConsoleLog = console.log
beforeEach(() => {
  console.error = jest.fn()
  console.log = jest.fn()
  jest.clearAllMocks()
})

afterEach(() => {
  console.error = originalConsoleError
  console.log = originalConsoleLog
})

// Temporary admin check function (matches the route implementation)
const mockIsUserSystemAdmin = async (userId: string, supabase: any): Promise<boolean> => {
  const { data: userData, error } = await supabase
    .from('users')
    .select('id, email')
    .eq('id', userId)
    .single()
    
  return !error && !!userData
}

describe('/api/admin/users/bulk', () => {
  describe('POST method', () => {
    describe('authentication and authorization', () => {
      it('should return 401 when session error occurs', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: new Error('Session error')
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/bulk',
          'POST',
          { action: 'suspend', user_ids: ['user-1', 'user-2'] }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Unauthorized')
      })

      it('should return 401 when no session exists', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: null
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/bulk',
          'POST',
          { action: 'suspend', user_ids: ['user-1', 'user-2'] }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Unauthorized')
      })

      it('should return 403 when user is not admin', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'user-123' } } },
          error: null
        })

        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: null,
                error: new Error('User not found')
              }))
            }))
          }))
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/bulk',
          'POST',
          { action: 'suspend', user_ids: ['user-1', 'user-2'] }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.error).toBe('Forbidden')
      })
    })

    describe('input validation', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })

        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { id: 'admin-123', email: 'admin@example.com' },
                error: null
              }))
            }))
          }))
        })
      })

      it('should return 400 when action is missing', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/bulk',
          'POST',
          { user_ids: ['user-1', 'user-2'] }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Action and user_ids array are required')
      })

      it('should return 400 when user_ids is missing', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/bulk',
          'POST',
          { action: 'suspend' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Action and user_ids array are required')
      })

      it('should return 400 when user_ids is not an array', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/bulk',
          'POST',
          { action: 'suspend', user_ids: 'user-1' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Action and user_ids array are required')
      })

      it('should return 400 when trying to perform operations on self', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/bulk',
          'POST',
          { action: 'suspend', user_ids: ['user-1', 'admin-123'] }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Cannot perform bulk operations on your own account')
      })

      it('should return 400 for invalid action', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/bulk',
          'POST',
          { action: 'invalid_action', user_ids: ['user-1', 'user-2'] }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Invalid action')
      })

      it('should return 400 when email action missing required fields', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/bulk',
          'POST',
          { action: 'email', user_ids: ['user-1', 'user-2'] }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Email subject and message are required for email action')
      })
    })

    describe('suspend action', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })

        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { id: 'admin-123', email: 'admin@example.com' },
                error: null
              }))
            }))
          }))
        })
      })

      it('should suspend users successfully', async () => {
        mockSupabaseClient.auth.admin.updateUserById
          .mockResolvedValueOnce({ error: null })
          .mockResolvedValueOnce({ error: null })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/bulk',
          'POST',
          { action: 'suspend', user_ids: ['user-1', 'user-2'] }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.summary.total).toBe(2)
        expect(data.summary.successful).toBe(2)
        expect(data.summary.failed).toBe(0)
        expect(data.results).toHaveLength(2)
        expect(data.results[0]).toMatchObject({
          user_id: 'user-1',
          success: true
        })
        expect(mockSupabaseClient.auth.admin.updateUserById).toHaveBeenCalledWith(
          'user-1',
          { ban_duration: '87600h' }
        )
      })

      it('should handle partial failures in suspend action', async () => {
        mockSupabaseClient.auth.admin.updateUserById
          .mockResolvedValueOnce({ error: null })
          .mockResolvedValueOnce({ error: { message: 'User not found' } })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/bulk',
          'POST',
          { action: 'suspend', user_ids: ['user-1', 'user-2'] }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.summary.successful).toBe(1)
        expect(data.summary.failed).toBe(1)
        expect(data.results).toContainEqual({
          user_id: 'user-1',
          success: true
        })
        expect(data.results).toContainEqual({
          user_id: 'user-2',
          success: false,
          error: 'User not found'
        })
      })

      it('should handle unexpected errors in suspend action', async () => {
        mockSupabaseClient.auth.admin.updateUserById
          .mockResolvedValueOnce({ error: null })
          .mockRejectedValueOnce(new Error('Network error'))

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/bulk',
          'POST',
          { action: 'suspend', user_ids: ['user-1', 'user-2'] }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.summary.successful).toBe(1)
        expect(data.summary.failed).toBe(1)
        expect(data.results).toContainEqual({
          user_id: 'user-2',
          success: false,
          error: 'Unknown error'
        })
      })
    })

    describe('activate action', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })

        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { id: 'admin-123', email: 'admin@example.com' },
                error: null
              }))
            }))
          }))
        })
      })

      it('should activate users successfully', async () => {
        mockSupabaseClient.auth.admin.updateUserById
          .mockResolvedValueOnce({ error: null })
          .mockResolvedValueOnce({ error: null })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/bulk',
          'POST',
          { action: 'activate', user_ids: ['user-1', 'user-2'] }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.summary.successful).toBe(2)
        expect(mockSupabaseClient.auth.admin.updateUserById).toHaveBeenCalledWith(
          'user-1',
          { ban_duration: 'none' }
        )
      })
    })

    describe('delete action', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })

        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users' && mockSupabaseClient.from.mock.calls.length === 1) {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: { id: 'admin-123', email: 'admin@example.com' },
                    error: null
                  }))
                }))
              }))
            }
          }
          return {
            update: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ error: null }))
            }))
          }
        })

        mockSupabaseClient.auth.admin.deleteUser.mockResolvedValue({ error: null })
      })

      it('should delete users successfully', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/bulk',
          'POST',
          { action: 'delete', user_ids: ['user-1', 'user-2'] }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.summary.successful).toBe(2)
        expect(mockSupabaseClient.auth.admin.deleteUser).toHaveBeenCalledTimes(2)
      })

      it('should handle delete errors', async () => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users' && mockSupabaseClient.from.mock.calls.length === 1) {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: { id: 'admin-123', email: 'admin@example.com' },
                    error: null
                  }))
                }))
              }))
            }
          }
          let callCount = 0
          return {
            update: jest.fn(() => ({
              eq: jest.fn(() => {
                callCount++
                if (callCount === 1) {
                  return Promise.resolve({ error: null })
                }
                return Promise.resolve({ error: { message: 'Delete failed' } })
              })
            }))
          }
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/bulk',
          'POST',
          { action: 'delete', user_ids: ['user-1', 'user-2'] }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.summary.successful).toBe(1)
        expect(data.summary.failed).toBe(1)
      })
    })

    describe('export action', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })

        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users' && mockSupabaseClient.from.mock.calls.length === 1) {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: { id: 'admin-123', email: 'admin@example.com' },
                    error: null
                  }))
                }))
              }))
            }
          }
          return {
            select: jest.fn(() => ({
              in: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({
                  data: [
                    {
                      id: 'user-1',
                      email: 'user1@example.com',
                      name: 'User One',
                      created_at: '2023-01-01T00:00:00Z',
                      last_seen_at: '2023-01-02T00:00:00Z',
                      email_verified_at: '2023-01-01T00:00:00Z',
                      memberships: [
                        {
                          organizations: { name: 'Org One' }
                        }
                      ]
                    },
                    {
                      id: 'user-2',
                      email: 'user2@example.com',
                      name: 'User Two',
                      created_at: '2023-01-01T00:00:00Z',
                      last_seen_at: null,
                      email_verified_at: null,
                      memberships: []
                    }
                  ],
                  error: null
                }))
              }))
            }))
          }
        })
      })

      it('should export users successfully', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/bulk',
          'POST',
          { action: 'export', user_ids: ['user-1', 'user-2'] }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.summary.successful).toBe(2)
        expect(data.results).toHaveLength(2)
        expect(data.results[0]).toMatchObject({
          id: 'user-1',
          email: 'user1@example.com',
          name: 'User One',
          email_verified: 'Yes',
          organizations: 'Org One'
        })
        expect(data.results[1]).toMatchObject({
          id: 'user-2',
          email: 'user2@example.com',
          name: 'User Two',
          email_verified: 'No',
          organizations: ''
        })
      })

      it('should handle export errors', async () => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users' && mockSupabaseClient.from.mock.calls.length === 1) {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: { id: 'admin-123', email: 'admin@example.com' },
                    error: null
                  }))
                }))
              }))
            }
          }
          return {
            select: jest.fn(() => ({
              in: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({
                  data: null,
                  error: new Error('Export failed')
                }))
              }))
            }))
          }
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/bulk',
          'POST',
          { action: 'export', user_ids: ['user-1', 'user-2'] }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Failed to export users')
      })
    })

    describe('email action', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })

        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users' && mockSupabaseClient.from.mock.calls.length === 1) {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: { id: 'admin-123', email: 'admin@example.com' },
                    error: null
                  }))
                }))
              }))
            }
          }
          return {
            select: jest.fn(() => ({
              in: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({
                  data: [
                    { id: 'user-1', email: 'user1@example.com', name: 'User One' },
                    { id: 'user-2', email: 'user2@example.com', name: 'User Two' }
                  ],
                  error: null
                }))
              }))
            }))
          }
        })
      })

      it('should send emails successfully', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/bulk',
          'POST',
          {
            action: 'email',
            user_ids: ['user-1', 'user-2'],
            email_subject: 'Test Subject',
            email_message: 'Test Message'
          }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.summary.successful).toBe(2)
        expect(data.summary.failed).toBe(0)
        expect(data.results).toHaveLength(2)
        expect(data.results[0]).toMatchObject({
          user_id: 'user-1',
          success: true,
          email: 'user1@example.com'
        })
      })

      it('should handle email fetch errors', async () => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users' && mockSupabaseClient.from.mock.calls.length === 1) {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: { id: 'admin-123', email: 'admin@example.com' },
                    error: null
                  }))
                }))
              }))
            }
          }
          return {
            select: jest.fn(() => ({
              in: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({
                  data: null,
                  error: new Error('Failed to get emails')
                }))
              }))
            }))
          }
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/bulk',
          'POST',
          {
            action: 'email',
            user_ids: ['user-1', 'user-2'],
            email_subject: 'Test Subject',
            email_message: 'Test Message'
          }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Failed to get user emails')
      })
    })

    describe('error handling', () => {
      it('should handle JSON parsing errors', async () => {
        const request = {
          url: 'http://localhost:3000/api/admin/users/bulk',
          method: 'POST',
          json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
          headers: new Map(),
          ip: '127.0.0.1'
        } as unknown as NextRequest

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Internal server error')
      })

      it('should handle unexpected errors', async () => {
        mockSupabaseClient.auth.getSession.mockRejectedValue(new Error('Unexpected error'))

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/bulk',
          'POST',
          { action: 'suspend', user_ids: ['user-1'] }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Internal server error')
      })
    })

    describe('edge cases', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })

        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: { id: 'admin-123', email: 'admin@example.com' },
                error: null
              }))
            }))
          }))
        })
      })

      it('should handle empty user_ids array', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/bulk',
          'POST',
          { action: 'suspend', user_ids: [] }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.summary.total).toBe(0)
        expect(data.summary.successful).toBe(0)
        expect(data.summary.failed).toBe(0)
      })

      it('should handle null body', async () => {
        const request = {
          url: 'http://localhost:3000/api/admin/users/bulk',
          method: 'POST',
          json: jest.fn().mockResolvedValue(null),
          headers: new Map(),
          ip: '127.0.0.1'
        } as unknown as NextRequest

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Action and user_ids array are required')
      })

      it('should handle whitespace-only email fields', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/users/bulk',
          'POST',
          {
            action: 'email',
            user_ids: ['user-1'],
            email_subject: '   ',
            email_message: '   '
          }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Email subject and message are required for email action')
      })
    })
  })
})