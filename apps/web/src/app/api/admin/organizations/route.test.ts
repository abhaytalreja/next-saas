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
  from: jest.fn(),
  rpc: jest.fn()
}

// Mock getSupabaseServerClient
jest.mock('@nextsaas/supabase', () => ({
  getSupabaseServerClient: () => mockSupabaseClient
}))

// Mock NextRequest
const createMockRequest = (
  url: string = 'http://localhost:3000/api/admin/organizations',
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

// Mock console methods
const originalConsoleError = console.error
beforeEach(() => {
  console.error = jest.fn()
  jest.clearAllMocks()
})

afterEach(() => {
  console.error = originalConsoleError
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

describe('/api/admin/organizations', () => {
  describe('GET method', () => {
    describe('authentication and authorization', () => {
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
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })

        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
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
          
          if (table === 'organizations') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => ({
                  or: jest.fn(() => ({
                    range: jest.fn(() => ({
                      order: jest.fn(() => Promise.resolve({
                        data: [
                          {
                            id: 'org-1',
                            name: 'Test Organization 1',
                            slug: 'test-org-1',
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
                                  email: 'john@example.com'
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
                                  email: 'jane@example.com'
                                }
                              }
                            ]
                          },
                          {
                            id: 'org-2',
                            name: 'Test Organization 2',
                            slug: 'test-org-2',
                            created_at: '2023-01-02T00:00:00Z',
                            updated_at: '2023-01-02T00:00:00Z',
                            metadata: {},
                            memberships: [
                              {
                                id: 'membership-3',
                                role: 'owner',
                                user_id: 'user-3',
                                created_at: '2023-01-02T00:00:00Z',
                                users: {
                                  id: 'user-3',
                                  name: 'Bob Wilson',
                                  email: 'bob@example.com'
                                }
                              }
                            ]
                          }
                        ],
                        error: null,
                        count: 2
                      }))
                    }))
                  })),
                  range: jest.fn(() => ({
                    order: jest.fn(() => Promise.resolve({
                      data: [
                        {
                          id: 'org-1',
                          name: 'Test Organization 1',
                          slug: 'test-org-1',
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
                                email: 'john@example.com'
                              }
                            }
                          ]
                        }
                      ],
                      error: null,
                      count: 2
                    }))
                  }))
                }))
              }))
            }
          }
          
          return { select: jest.fn() }
        })
      })

      it('should return organizations list successfully with default pagination', async () => {
        const request = createMockRequest()
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toHaveLength(2)
        expect(data.data[0]).toMatchObject({
          id: 'org-1',
          name: 'Test Organization 1',
          slug: 'test-org-1',
          status: 'active',
          plan: 'pro',
          member_count: 2
        })
        expect(data.data[0].owner).toMatchObject({
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com'
        })
        expect(data.metadata).toMatchObject({
          total: 2,
          page: 1,
          limit: 20,
          totalPages: 1
        })
      })

      it('should handle pagination parameters correctly', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations?page=2&limit=10'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.metadata.page).toBe(2)
        expect(data.metadata.limit).toBe(10)
      })

      it('should handle search parameter', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations?search=test'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
      })

      it('should handle sort and order parameters', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations?sort=name&order=asc'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
      })

      it('should transform organization data correctly', async () => {
        const request = createMockRequest()
        const response = await GET(request)
        const data = await response.json()

        const org = data.data[0]
        expect(org).toHaveProperty('members')
        expect(org.members).toHaveLength(2)
        expect(org.members[0]).toMatchObject({
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'owner'
        })
        expect(org).toHaveProperty('monthly_revenue', 0)
        expect(org).toHaveProperty('storage_used', 0)
        expect(org).toHaveProperty('storage_limit', 100)
      })

      it('should handle organizations without owner', async () => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
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
          
          if (table === 'organizations') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => ({
                  or: jest.fn(() => ({
                    range: jest.fn(() => ({
                      order: jest.fn(() => Promise.resolve({
                        data: [
                          {
                            id: 'org-1',
                            name: 'Orphaned Org',
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
                                  email: 'john@example.com'
                                }
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
                          id: 'org-1',
                          name: 'Orphaned Org',
                          slug: 'orphaned-org',
                          memberships: [
                            {
                              role: 'member',
                              users: { id: 'user-1', name: 'John Doe', email: 'john@example.com' }
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
            }
          }
          
          return { select: jest.fn() }
        })

        const request = createMockRequest()
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data[0].owner).toMatchObject({
          id: '',
          name: '',
          email: ''
        })
      })
    })

    describe('error handling', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })

        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
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
        expect(data.error).toBe('Failed to fetch organizations')
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
    describe('authentication and authorization', () => {
      it('should return 401 when session error occurs', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: new Error('Session error')
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations',
          'POST',
          { name: 'Test Org', slug: 'test-org', owner_email: 'owner@example.com' }
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
          'http://localhost:3000/api/admin/organizations',
          'POST',
          { name: 'Test Org', slug: 'test-org', owner_email: 'owner@example.com' }
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

      it('should return 400 when name is missing', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations',
          'POST',
          { slug: 'test-org', owner_email: 'owner@example.com' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Name, slug, and owner email are required')
      })

      it('should return 400 when slug is missing', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations',
          'POST',
          { name: 'Test Org', owner_email: 'owner@example.com' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Name, slug, and owner email are required')
      })

      it('should return 400 when owner_email is missing', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations',
          'POST',
          { name: 'Test Org', slug: 'test-org' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Name, slug, and owner email are required')
      })

      it('should return 400 when slug already exists', async () => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
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
          
          if (table === 'organizations') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: { id: 'existing-org' },
                    error: null
                  }))
                }))
              }))
            }
          }
          
          return { select: jest.fn() }
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations',
          'POST',
          { name: 'Test Org', slug: 'existing-slug', owner_email: 'owner@example.com' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Organization slug already exists')
      })
    })

    describe('successful organization creation', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
      })

      it('should create organization with existing owner successfully', async () => {
        let callCount = 0
        mockSupabaseClient.from.mockImplementation((table: string) => {
          callCount++
          
          if (table === 'users' && callCount === 1) {
            // Admin check
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
          
          if (table === 'organizations' && callCount === 2) {
            // Slug availability check
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: null,
                    error: new Error('Not found')
                  }))
                }))
              }))
            }
          }
          
          if (table === 'users' && callCount === 3) {
            // Owner lookup
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: { id: 'owner-123', email: 'owner@example.com' },
                    error: null
                  }))
                }))
              }))
            }
          }
          
          if (table === 'organizations' && callCount === 4) {
            // Organization creation
            return {
              insert: jest.fn(() => ({
                select: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: {
                      id: 'new-org-123',
                      name: 'Test Org',
                      slug: 'test-org',
                      metadata: { created_by_admin: 'admin-123' }
                    },
                    error: null
                  }))
                }))
              }))
            }
          }
          
          if (table === 'memberships') {
            // Membership creation
            return {
              insert: jest.fn(() => Promise.resolve({ error: null }))
            }
          }
          
          return { select: jest.fn(), insert: jest.fn() }
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations',
          'POST',
          { name: 'Test Org', slug: 'test-org', owner_email: 'owner@example.com' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBe('Organization created successfully')
        expect(data.data).toMatchObject({
          id: 'new-org-123',
          name: 'Test Org',
          slug: 'test-org'
        })
      })

      it('should create organization with new owner successfully', async () => {
        let callCount = 0
        mockSupabaseClient.from.mockImplementation((table: string) => {
          callCount++
          
          if (table === 'users' && callCount === 1) {
            // Admin check
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
          
          if (table === 'organizations' && callCount === 2) {
            // Slug availability check
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: null,
                    error: new Error('Not found')
                  }))
                }))
              }))
            }
          }
          
          if (table === 'users' && callCount === 3) {
            // Owner lookup (not found)
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: null,
                    error: new Error('User not found')
                  }))
                }))
              }))
            }
          }
          
          if (table === 'organizations' && callCount === 4) {
            // Organization creation
            return {
              insert: jest.fn(() => ({
                select: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: {
                      id: 'new-org-123',
                      name: 'Test Org',
                      slug: 'test-org'
                    },
                    error: null
                  }))
                }))
              }))
            }
          }
          
          if (table === 'memberships') {
            // Membership creation
            return {
              insert: jest.fn(() => Promise.resolve({ error: null }))
            }
          }
          
          return { select: jest.fn(), insert: jest.fn() }
        })

        mockSupabaseClient.auth.admin.createUser.mockResolvedValue({
          data: { user: { id: 'new-owner-123', email: 'newowner@example.com' } },
          error: null
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations',
          'POST',
          { name: 'Test Org', slug: 'test-org', owner_email: 'newowner@example.com' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(mockSupabaseClient.auth.admin.createUser).toHaveBeenCalledWith({
          email: 'newowner@example.com',
          email_confirm: false
        })
      })
    })

    describe('error handling', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
      })

      it('should handle owner user creation errors', async () => {
        let callCount = 0
        mockSupabaseClient.from.mockImplementation((table: string) => {
          callCount++
          
          if (table === 'users' && callCount === 1) {
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
          
          if (table === 'organizations' && callCount === 2) {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: null,
                    error: new Error('Not found')
                  }))
                }))
              }))
            }
          }
          
          if (table === 'users' && callCount === 3) {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: null,
                    error: new Error('User not found')
                  }))
                }))
              }))
            }
          }
          
          return { select: jest.fn() }
        })

        mockSupabaseClient.auth.admin.createUser.mockResolvedValue({
          data: null,
          error: { message: 'Failed to create user' }
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations',
          'POST',
          { name: 'Test Org', slug: 'test-org', owner_email: 'newowner@example.com' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Failed to create owner user')
      })

      it('should handle organization creation errors', async () => {
        let callCount = 0
        mockSupabaseClient.from.mockImplementation((table: string) => {
          callCount++
          
          if (table === 'users' && callCount === 1) {
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
          
          if (table === 'organizations' && callCount === 2) {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: null,
                    error: new Error('Not found')
                  }))
                }))
              }))
            }
          }
          
          if (table === 'users' && callCount === 3) {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: { id: 'owner-123', email: 'owner@example.com' },
                    error: null
                  }))
                }))
              }))
            }
          }
          
          if (table === 'organizations' && callCount === 4) {
            return {
              insert: jest.fn(() => ({
                select: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: null,
                    error: new Error('Failed to create organization')
                  }))
                }))
              }))
            }
          }
          
          return { select: jest.fn(), insert: jest.fn() }
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations',
          'POST',
          { name: 'Test Org', slug: 'test-org', owner_email: 'owner@example.com' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Failed to create organization')
      })

      it('should handle membership creation errors with rollback', async () => {
        let callCount = 0
        mockSupabaseClient.from.mockImplementation((table: string) => {
          callCount++
          
          if (table === 'users' && callCount === 1) {
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
          
          if (table === 'organizations' && callCount === 2) {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: null,
                    error: new Error('Not found')
                  }))
                }))
              }))
            }
          }
          
          if (table === 'users' && callCount === 3) {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: { id: 'owner-123', email: 'owner@example.com' },
                    error: null
                  }))
                }))
              }))
            }
          }
          
          if (table === 'organizations' && callCount === 4) {
            return {
              insert: jest.fn(() => ({
                select: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: { id: 'new-org-123', name: 'Test Org', slug: 'test-org' },
                    error: null
                  }))
                }))
              }))
            }
          }
          
          if (table === 'memberships') {
            return {
              insert: jest.fn(() => Promise.resolve({
                error: new Error('Failed to create membership')
              }))
            }
          }
          
          if (table === 'organizations' && callCount === 6) {
            // Rollback delete
            return {
              delete: jest.fn(() => ({
                eq: jest.fn(() => Promise.resolve({ error: null }))
              }))
            }
          }
          
          return { select: jest.fn(), insert: jest.fn(), delete: jest.fn() }
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations',
          'POST',
          { name: 'Test Org', slug: 'test-org', owner_email: 'owner@example.com' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Failed to create organization membership')
      })

      it('should handle JSON parsing errors', async () => {
        const request = {
          url: 'http://localhost:3000/api/admin/organizations',
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
          'http://localhost:3000/api/admin/organizations',
          'POST',
          { name: 'Test Org', slug: 'test-org', owner_email: 'owner@example.com' }
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

      it('should handle empty string inputs', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations',
          'POST',
          { name: '', slug: '', owner_email: '' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Name, slug, and owner email are required')
      })

      it('should handle whitespace-only inputs', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/organizations',
          'POST',
          { name: '   ', slug: '   ', owner_email: '   ' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Name, slug, and owner email are required')
      })

      it('should handle null body', async () => {
        const request = {
          url: 'http://localhost:3000/api/admin/organizations',
          method: 'POST',
          json: jest.fn().mockResolvedValue(null),
          headers: new Map(),
          ip: '127.0.0.1'
        } as unknown as NextRequest

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Name, slug, and owner email are required')
      })
    })
  })
})