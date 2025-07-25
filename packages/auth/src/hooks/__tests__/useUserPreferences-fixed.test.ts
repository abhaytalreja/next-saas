import { renderHook, act } from '@testing-library/react'
import { useUserPreferences } from '../useUserPreferences'

// Mock the dependencies
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn()
}))

jest.mock('../useAuth', () => ({
  useAuth: jest.fn()
}))

const mockUser = {
  id: 'user-123',
  email: 'test@example.com'
}

const mockSupabaseClient = {
  from: jest.fn()
}

const { createClientComponentClient } = require('@supabase/auth-helpers-nextjs')
const { useAuth } = require('../useAuth')

describe('useUserPreferences - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    createClientComponentClient.mockReturnValue(mockSupabaseClient)
    useAuth.mockReturnValue({ user: mockUser })
  })

  describe('Loading preferences', () => {
    it('loads existing preferences successfully', async () => {
      const mockPreferences = {
        user_id: 'user-123',
        theme: 'dark',
        language: 'en',
        email_notifications_enabled: true
      }

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockPreferences,
              error: null
            })
          })
        })
      })

      const { result } = renderHook(() => useUserPreferences())

      // Wait for loading to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.preferences).toEqual(mockPreferences)
      expect(result.current.error).toBe(null)
    })

    it('creates default preferences when none exist', async () => {
      // Mock no preferences found
      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' } // No rows found
              })
            })
          })
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  user_id: 'user-123',
                  theme: 'system',
                  language: 'en'
                },
                error: null
              })
            })
          })
        })

      const { result } = renderHook(() => useUserPreferences())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.preferences).toBeDefined()
      expect(result.current.preferences?.theme).toBe('system')
    })

    it('handles loading errors', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error', code: 'ERROR' }
            })
          })
        })
      })

      const { result } = renderHook(() => useUserPreferences())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe('Failed to load preferences')
    })

    it('does not load when user is not authenticated', async () => {
      useAuth.mockReturnValue({ user: null })

      const { result } = renderHook(() => useUserPreferences())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.preferences).toBe(null)
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
    })
  })

  describe('Updating preferences', () => {
    it('updates preferences successfully', async () => {
      // Mock initial load
      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { user_id: 'user-123', theme: 'light' },
                error: null
              })
            })
          })
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { user_id: 'user-123', theme: 'dark' },
                  error: null
                })
              })
            })
          })
        })

      const { result } = renderHook(() => useUserPreferences())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      let updateResult: any
      await act(async () => {
        updateResult = await result.current.updatePreferences({ theme: 'dark' })
      })

      expect(updateResult.success).toBe(true)
      expect(result.current.preferences?.theme).toBe('dark')
    })

    it('handles update errors', async () => {
      // Mock initial load
      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { user_id: 'user-123', theme: 'light' },
                error: null
              })
            })
          })
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Update failed' }
                })
              })
            })
          })
        })

      const { result } = renderHook(() => useUserPreferences())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      let updateResult: any
      await act(async () => {
        updateResult = await result.current.updatePreferences({ theme: 'dark' })
      })

      expect(updateResult.success).toBe(false)
      expect(updateResult.error).toContain('Failed to update preferences')
    })

    it('fails when user is not authenticated', async () => {
      useAuth.mockReturnValue({ user: null })

      const { result } = renderHook(() => useUserPreferences())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      let updateResult: any
      await act(async () => {
        updateResult = await result.current.updatePreferences({ theme: 'dark' })
      })

      expect(updateResult.success).toBe(false)
      expect(updateResult.error).toBe('User not authenticated or preferences not loaded')
    })
  })

  describe('Resetting preferences', () => {
    it('resets preferences to defaults successfully', async () => {
      // Mock initial load
      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { user_id: 'user-123', theme: 'dark' },
                error: null
              })
            })
          })
        })
        .mockReturnValueOnce({
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null })
          })
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { user_id: 'user-123', theme: 'system' },
                error: null
              })
            })
          })
        })

      const { result } = renderHook(() => useUserPreferences())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      let resetResult: any
      await act(async () => {
        resetResult = await result.current.resetPreferences()
      })

      expect(resetResult.success).toBe(true)
      expect(result.current.preferences?.theme).toBe('system')
    })

    it('handles reset errors', async () => {
      // Mock initial load
      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { user_id: 'user-123', theme: 'dark' },
                error: null
              })
            })
          })
        })
        .mockReturnValueOnce({
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockRejectedValue(new Error('Delete failed'))
          })
        })

      const { result } = renderHook(() => useUserPreferences())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      let resetResult: any
      await act(async () => {
        resetResult = await result.current.resetPreferences()
      })

      expect(resetResult.success).toBe(false)
      expect(resetResult.error).toBe('Delete failed')
    })
  })

  describe('Theme application', () => {
    beforeEach(() => {
      // Mock document.documentElement
      Object.defineProperty(document, 'documentElement', {
        value: { 
          classList: { 
            toggle: jest.fn(),
            add: jest.fn(),
            remove: jest.fn()
          } 
        },
        writable: true
      })
    })

    it('applies theme changes immediately', async () => {
      // Mock initial load
      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { user_id: 'user-123', theme: 'light' },
                error: null
              })
            })
          })
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { user_id: 'user-123', theme: 'dark' },
                  error: null
                })
              })
            })
          })
        })

      const { result } = renderHook(() => useUserPreferences())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      await act(async () => {
        await result.current.updatePreferences({ theme: 'dark' })
      })

      // Theme should be applied to document
      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark', true)
    })
  })

  describe('Refresh preferences', () => {
    it('refreshes preferences successfully', async () => {
      const mockPreferences = {
        user_id: 'user-123',
        theme: 'dark',
        language: 'en'
      }

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockPreferences,
              error: null
            })
          })
        })
      })

      const { result } = renderHook(() => useUserPreferences())

      await act(async () => {
        await result.current.refreshPreferences()
      })

      expect(result.current.preferences).toEqual(mockPreferences)
    })
  })
})