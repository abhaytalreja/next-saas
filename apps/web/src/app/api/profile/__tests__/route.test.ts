import { NextRequest } from 'next/server'
import { GET, PATCH } from '../route'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs')
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
  },
  from: jest.fn(),
}

const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
  },
}

const mockProfile = {
  id: 'user-123',
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  display_name: 'johndoe',
  bio: 'Software engineer',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
}

describe('/api/profile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabaseClient)
  })

  describe('GET', () => {
    it('returns profile data for authenticated user', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      })

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      })
      mockSupabaseClient.from.mockReturnValue(mockFrom())

      const request = new NextRequest('http://localhost:3000/api/profile')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.profile).toEqual(mockProfile)
    })

    it('includes preferences when requested', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      })

      const mockPreferences = {
        id: 'pref-123',
        user_id: 'user-123',
        theme: 'dark',
        language: 'en',
      }

      const mockFrom = jest.fn()
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockPreferences,
                error: null,
              }),
            }),
          }),
        })

      mockSupabaseClient.from.mockImplementation(mockFrom)

      const request = new NextRequest('http://localhost:3000/api/profile?include_preferences=true')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.profile).toEqual(mockProfile)
      expect(data.data.preferences).toEqual(mockPreferences)
    })

    it('includes activity when requested', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      })

      const mockActivities = [
        {
          id: 'activity-1',
          user_id: 'user-123',
          action: 'login',
          status: 'success',
          created_at: '2023-01-01T10:00:00Z',
        },
      ]

      const mockFrom = jest.fn()
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: mockActivities,
                  error: null,
                }),
              }),
            }),
          }),
        })

      mockSupabaseClient.from.mockImplementation(mockFrom)

      const request = new NextRequest('http://localhost:3000/api/profile?include_activity=true')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.profile).toEqual(mockProfile)
      expect(data.data.activities).toEqual(mockActivities)
    })

    it('returns 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
      })

      const request = new NextRequest('http://localhost:3000/api/profile')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 500 when profile fetch fails', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      })

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      })
      mockSupabaseClient.from.mockReturnValue(mockFrom())

      const request = new NextRequest('http://localhost:3000/api/profile')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to fetch profile')
    })
  })

  describe('PATCH', () => {
    const updateData = {
      first_name: 'Jane',
      last_name: 'Smith',
      bio: 'Updated bio',
    }

    it('updates profile successfully', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      })

      const updatedProfile = { ...mockProfile, ...updateData }

      const mockFrom = jest.fn()
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: updatedProfile,
                  error: null,
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue({ error: null }),
        })

      mockSupabaseClient.from.mockImplementation(mockFrom)

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.profile).toEqual(updatedProfile)
    })

    it('logs profile changes', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      })

      const updatedProfile = { ...mockProfile, ...updateData }

      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      const mockFrom = jest.fn()
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: updatedProfile,
                  error: null,
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: mockInsert,
        })

      mockSupabaseClient.from.mockImplementation(mockFrom)

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'test-agent',
        },
      })

      await PATCH(request)

      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        action: 'profile_update',
        description: 'Updated profile fields: first_name, last_name, bio',
        status: 'success',
        ip_address: '192.168.1.1',
        user_agent: 'test-agent',
        metadata: { updated_fields: ['first_name', 'last_name', 'bio'] },
      })
    })

    it('returns 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
      })

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 400 for invalid data', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      })

      const invalidData = {
        first_name: '', // Invalid: empty string
        email: 'invalid-email', // Invalid: bad email format
      }

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(invalidData),
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid request data')
      expect(data.errors).toBeDefined()
    })

    it('returns 500 when update fails', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      })

      const mockFrom = jest.fn()
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Update failed' },
                }),
              }),
            }),
          }),
        })

      mockSupabaseClient.from.mockImplementation(mockFrom)

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to update profile')
    })
  })
})