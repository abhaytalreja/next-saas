import { NextRequest } from 'next/server'
import { GET } from '../[id]/route'

// Mock the Supabase client
const mockSupabaseClient = {
  from: jest.fn(),
  auth: {
    getUser: jest.fn(),
    admin: {
      getUserById: jest.fn(),
    },
  },
}

// Mock the server client
jest.mock('@nextsaas/supabase/server', () => ({
  getSupabaseServerClient: () => mockSupabaseClient,
}))

// Mock cookies
const mockGet = jest.fn()
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: mockGet,
  }),
}))

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  user_metadata: {
    first_name: 'John',
    last_name: 'Doe',
  },
}

const mockProject = {
  id: 'project-123',
  name: 'Test Project',
  description: 'A test project',
  type: 'web',
  organization_id: 'org-123',
  created_by: 'user-123',
  created_at: '2023-12-01T10:00:00Z',
  updated_at: '2023-12-01T10:00:00Z',
  is_archived: false,
  creator: {
    id: 'user-123',
    first_name: 'John',
    last_name: 'Doe',
    email: 'test@example.com',
    avatar_url: null,
  },
  _count: {
    members: 3,
    items: 5,
  },
}

describe('Project API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock setup
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    mockGet.mockReturnValue({ value: 'mock-session-token' })
  })

  describe('GET /api/projects/[id]', () => {
    it('should return project data for authenticated user with access', async () => {
      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockProject,
              error: null,
            })),
          })),
        })),
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const request = new NextRequest('http://localhost:3000/api/projects/project-123')
      const params = { id: 'project-123' }

      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockProject)

      // Verify database query
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('projects')
      expect(mockQuery.select).toHaveBeenCalledWith(expect.stringContaining('*'))
      expect(mockQuery.select).toHaveBeenCalledWith(expect.stringContaining('creator:users'))
    })

    it('should return 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid JWT' },
      })

      const request = new NextRequest('http://localhost:3000/api/projects/project-123')
      const params = { id: 'project-123' }

      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Authentication required')
    })

    it('should return 404 when project is not found', async () => {
      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: { code: 'PGRST116', message: 'Not found' },
            })),
          })),
        })),
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const request = new NextRequest('http://localhost:3000/api/projects/nonexistent')
      const params = { id: 'nonexistent' }

      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Project not found')
    })

    it('should handle Authorization header authentication', async () => {
      // Mock request with Authorization header
      const request = new NextRequest('http://localhost:3000/api/projects/project-123', {
        headers: {
          'Authorization': 'Bearer mock-jwt-token',
        },
      })

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockProject,
              error: null,
            })),
          })),
        })),
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const params = { id: 'project-123' }

      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockProject)

      // Verify that the user was authenticated
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled()
    })

    it('should handle database errors gracefully', async () => {
      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Database connection failed' },
            })),
          })),
        })),
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const request = new NextRequest('http://localhost:3000/api/projects/project-123')
      const params = { id: 'project-123' }

      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database connection failed')
    })

    it('should include proper project relationships in query', async () => {
      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockProject,
              error: null,
            })),
          })),
        })),
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const request = new NextRequest('http://localhost:3000/api/projects/project-123')
      const params = { id: 'project-123' }

      await GET(request, { params })

      // Verify that the query includes creator relationship
      expect(mockQuery.select).toHaveBeenCalledWith(
        expect.stringContaining('creator:users!created_by')
      )
    })

    it('should respect RLS policies and organization membership', async () => {
      // This test verifies that the query will be filtered by RLS policies
      // The actual filtering happens at the database level
      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: { code: 'PGRST116', message: 'Not found' }, // RLS blocked access
            })),
          })),
        })),
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const request = new NextRequest('http://localhost:3000/api/projects/forbidden-project')
      const params = { id: 'forbidden-project' }

      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404) // RLS makes it appear as not found
      expect(data.success).toBe(false)
    })

    it('should handle concurrent requests properly', async () => {
      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockProject,
              error: null,
            })),
          })),
        })),
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const request1 = new NextRequest('http://localhost:3000/api/projects/project-123')
      const request2 = new NextRequest('http://localhost:3000/api/projects/project-123')
      const params = { id: 'project-123' }

      // Execute requests concurrently
      const [response1, response2] = await Promise.all([
        GET(request1, { params }),
        GET(request2, { params }),
      ])

      const [data1, data2] = await Promise.all([
        response1.json(),
        response2.json(),
      ])

      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
      expect(data1.success).toBe(true)
      expect(data2.success).toBe(true)
    })
  })

  describe('Authentication Integration', () => {
    it('should work with session-based authentication', async () => {
      mockGet.mockReturnValue({ value: 'valid-session-token' })
      
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockProject,
              error: null,
            })),
          })),
        })),
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const request = new NextRequest('http://localhost:3000/api/projects/project-123')
      const params = { id: 'project-123' }

      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should work with token-based authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects/project-123', {
        headers: {
          'Authorization': 'Bearer valid-jwt-token',
        },
      })

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockQuery = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: mockProject,
              error: null,
            })),
          })),
        })),
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      const params = { id: 'project-123' }

      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should handle invalid session tokens', async () => {
      mockGet.mockReturnValue({ value: 'invalid-session-token' })
      
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid JWT' },
      })

      const request = new NextRequest('http://localhost:3000/api/projects/project-123')
      const params = { id: 'project-123' }

      const response = await GET(request, { params })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })
  })
})