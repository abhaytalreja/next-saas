import { NextRequest } from 'next/server'
import { GET, POST } from './route'
import '@testing-library/jest-dom'

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
    admin: {
      createUser: jest.fn()
    }
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        is: jest.fn(() => ({
          or: jest.fn(() => ({
            range: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: [], error: null, count: 0 }))
            }))
          })),
          range: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null, count: 0 }))
          }))
        }))
      }))
    }))
  })),
  rpc: jest.fn()
}

// Mock getSupabaseServerClient
jest.mock('@nextsaas/supabase', () => ({
  getSupabaseServerClient: () => mockSupabaseClient
}))

// Mock NextRequest
const createMockRequest = (
  url: string = 'http://localhost:3000/api/admin/users',
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

// Mock console methods to avoid test output pollution
const originalConsoleError = console.error
beforeEach(() => {
  console.error = jest.fn()
  jest.clearAllMocks()
})

afterEach(() => {
  console.error = originalConsoleError
})

describe('/api/admin/users', () => {
  describe('GET method', () => {
    describe('authentication', () => {
      it('should return 401 when session error occurs', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: new Error('Session error')
        })

        const request = createMockRequest()
        const response = await GET(request)
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
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Unauthorized')
      })

      it('should return 403 when user is not admin', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'user-123' } } },
          error: null
        })

        // Mock admin check to fail
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

        const request = createMockRequest()
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.error).toBe('Forbidden')
      })
    })

    describe('successful requests', () => {
      beforeEach(() => {
        // Mock successful session
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })

        // Mock successful admin check
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: { id: 'admin-123', email: 'admin@example.com' },
                    error: null
                  })),
                  is: jest.fn(() => ({
                    or: jest.fn(() => ({
                      range: jest.fn(() => ({
                        order: jest.fn(() => Promise.resolve({
                          data: [
                            {
                              id: 'user-1',
                              email: 'user1@example.com',
                              name: 'User One',
                              avatar_url: null,
                              is_system_admin: false,
                              last_seen_at: '2023-01-01T00:00:00Z',
                              created_at: '2023-01-01T00:00:00Z',
                              updated_at: '2023-01-01T00:00:00Z',
                              email_verified_at: '2023-01-01T00:00:00Z',
                              memberships: [
                                {
                                  id: 'membership-1',
                                  role: 'owner',
                                  created_at: '2023-01-01T00:00:00Z',
                                  organization_id: 'org-1',
                                  organizations: { id: 'org-1', name: 'Test Org' }
                                }
                              ]
                            }
                          ],
                          error: null,
                          count: 1
                        }))
                      }))
                    })),
                    range: jest.fn(() => ({
                      order: jest.fn(() => Promise.resolve({
                        data: [
                          {
                            id: 'user-1',
                            email: 'user1@example.com',
                            name: 'User One',
                            avatar_url: null,
                            is_system_admin: false,
                            last_seen_at: '2023-01-01T00:00:00Z',
                            created_at: '2023-01-01T00:00:00Z',
                            updated_at: '2023-01-01T00:00:00Z',
                            email_verified_at: '2023-01-01T00:00:00Z',
                            memberships: [
                              {
                                id: 'membership-1',
                                role: 'owner',
                                created_at: '2023-01-01T00:00:00Z',
                                organization_id: 'org-1',
                                organizations: { id: 'org-1', name: 'Test Org' }
                              }
                            ]
                          }
                        ],
                        error: null,
                        count: 1
                      }))
                    }))
                  }))
                }))
              }))
            }
          }
          return { select: jest.fn() }
        })
      })

      it('should return users list successfully with default pagination', async () => {
        const request = createMockRequest()
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toHaveLength(1)
        expect(data.data[0]).toMatchObject({
          id: 'user-1',
          email: 'user1@example.com',
          name: 'User One',
          status: 'active',
          is_system_admin: false
        })
        expect(data.metadata).toMatchObject({
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1
        })
      })

      it('should handle pagination parameters correctly', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/users?page=2&limit=10'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.metadata.page).toBe(2)
        expect(data.metadata.limit).toBe(10)
      })

      it('should handle search parameter', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/users?search=user1'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
      })

      it('should handle sort and order parameters', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/users?sort=email&order=asc'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
      })

      it('should transform user data correctly', async () => {
        const request = createMockRequest()
        const response = await GET(request)
        const data = await response.json()

        const user = data.data[0]
        expect(user).toHaveProperty('organizations')
        expect(user.organizations).toHaveLength(1)
        expect(user.organizations[0]).toMatchObject({
          id: 'org-1',
          name: 'Test Org',
          role: 'owner'
        })
        expect(user).toHaveProperty('login_count', 0)
        expect(user).toHaveProperty('last_ip', null)
      })
    })

    describe('error handling', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })

        // Mock successful admin check
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
              is: jest.fn(() => ({
                or: jest.fn(() => ({
                  range: jest.fn(() => ({
                    order: jest.fn(() => Promise.resolve({
                      data: null,
                      error: new Error('Database error'),
                      count: 0
                    }))
                  }))
                })),
                range: jest.fn(() => ({
                  order: jest.fn(() => Promise.resolve({
                    data: null,
                    error: new Error('Database error'),
                    count: 0
                  }))
                }))
              }))
            }))
          }
        })
      })

      it('should handle database errors gracefully', async () => {
        const request = createMockRequest()
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Failed to fetch users')
      })

      it('should handle unexpected errors', async () => {
        mockSupabaseClient.auth.getSession.mockRejectedValue(new Error('Unexpected error'))

        const request = createMockRequest()
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Internal server error')
      })
    })
  })

  describe('POST method', () => {
    describe('authentication', () => {
      it('should return 401 when session error occurs', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: new Error('Session error')
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users',
          'POST',
          { email: 'test@example.com', name: 'Test User' }
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
          'http://localhost:3000/api/admin/users',
          'POST',
          { email: 'test@example.com', name: 'Test User' }
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

      it('should return 400 when email is missing', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/users',
          'POST',
          { name: 'Test User' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Email is required')
      })

      it('should accept valid input with email only', async () => {
        mockSupabaseClient.auth.admin.createUser.mockResolvedValue({
          data: { user: { id: 'new-user-123', email: 'test@example.com' } },
          error: null
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users',
          'POST',
          { email: 'test@example.com' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toMatchObject({
          id: 'new-user-123',
          email: 'test@example.com'
        })
      })

      it('should handle send_invitation parameter', async () => {
        mockSupabaseClient.auth.admin.createUser.mockResolvedValue({
          data: { user: { id: 'new-user-123', email: 'test@example.com' } },
          error: null
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users',
          'POST',
          { email: 'test@example.com', name: 'Test User', send_invitation: false }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(mockSupabaseClient.auth.admin.createUser).toHaveBeenCalledWith({
          email: 'test@example.com',
          user_metadata: { name: 'Test User' },
          email_confirm: true
        })
      })
    })

    describe('successful user creation', () => {
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

        mockSupabaseClient.auth.admin.createUser.mockResolvedValue({
          data: { user: { id: 'new-user-123', email: 'test@example.com' } },
          error: null
        })
      })

      it('should create user successfully with invitation', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/users',
          'POST',
          { email: 'test@example.com', name: 'Test User', send_invitation: true }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBe('User created and invitation sent')
        expect(mockSupabaseClient.auth.admin.createUser).toHaveBeenCalledWith({
          email: 'test@example.com',
          user_metadata: { name: 'Test User' },
          email_confirm: false
        })
      })

      it('should create user successfully without invitation', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/users',
          'POST',
          { email: 'test@example.com', name: 'Test User', send_invitation: false }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBe('User created successfully')
      })
    })

    describe('error handling', () => {
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

      it('should handle user creation errors', async () => {
        mockSupabaseClient.auth.admin.createUser.mockResolvedValue({
          data: null,
          error: { message: 'Email already registered' }
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users',
          'POST',
          { email: 'existing@example.com', name: 'Test User' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Email already registered')
      })

      it('should handle JSON parsing errors', async () => {
        const request = {
          url: 'http://localhost:3000/api/admin/users',
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

      it('should handle unexpected errors during user creation', async () => {
        mockSupabaseClient.auth.admin.createUser.mockRejectedValue(new Error('Unexpected error'))

        const request = createMockRequest(
          'http://localhost:3000/api/admin/users',
          'POST',
          { email: 'test@example.com', name: 'Test User' }
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

      it('should handle empty email string', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/users',
          'POST',
          { email: '', name: 'Test User' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Email is required')
      })

      it('should handle whitespace-only email', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/users',
          'POST',
          { email: '   ', name: 'Test User' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Email is required')
      })

      it('should handle null body', async () => {
        const request = {
          url: 'http://localhost:3000/api/admin/users',
          method: 'POST',
          json: jest.fn().mockResolvedValue(null),
          headers: new Map(),
          ip: '127.0.0.1'
        } as unknown as NextRequest

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Email is required')
      })
    })
  })
})