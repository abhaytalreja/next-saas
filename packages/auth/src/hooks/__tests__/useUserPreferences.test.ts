import { renderHook, act, waitFor } from '@testing-library/react'
import { useUserPreferences } from '../useUserPreferences'
import { useAuth } from '../useAuth'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Mock dependencies
jest.mock('../useAuth')
jest.mock('@supabase/auth-helpers-nextjs')

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00Z'
}

const mockSupabaseClient = {
  from: jest.fn(),
}

const mockPreferences = {
  id: 'pref-123',
  user_id: 'user-123',
  theme: 'dark',
  language: 'en',
  email_notifications_enabled: true,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

describe('useUserPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    ;(useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false
    })
    
    ;(createClientComponentClient as jest.Mock).mockReturnValue(mockSupabaseClient)
    
    // Mock DOM methods
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
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
  })

  describe('loading preferences', () => {
    it('loads existing preferences successfully', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockPreferences,
              error: null
            })
          })
        })
      })
      
      mockSupabaseClient.from.mockReturnValue(mockFrom())

      const { result } = renderHook(() => useUserPreferences())

      expect(result.current.loading).toBe(true)
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.preferences).toEqual(mockPreferences)
      expect(result.current.error).toBeNull()
    })

    it('creates default preferences when none exist', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' } // No rows found
          })
        })
      })

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { ...mockPreferences, theme: 'system' },
            error: null
          })
        })
      })

      mockSupabaseClient.from
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ insert: mockInsert })

      const { result } = renderHook(() => useUserPreferences())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.preferences).toBeDefined()
      expect(result.current.preferences?.theme).toBe('system')
      expect(mockInsert).toHaveBeenCalled()
    })

    it('handles loading errors', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          })
        })
      })
      
      mockSupabaseClient.from.mockReturnValue(mockFrom())

      const { result } = renderHook(() => useUserPreferences())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.preferences).toBeNull()
      expect(result.current.error).toBe('Failed to load preferences')
    })

    it('does not load when user is not authenticated', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: null,
        loading: false
      })

      const { result } = renderHook(() => useUserPreferences())

      expect(result.current.loading).toBe(false)
      expect(result.current.preferences).toBeNull()
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
    })
  })

  describe('updating preferences', () => {
    it('updates preferences successfully', async () => {
      // Setup initial preferences
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPreferences,
            error: null
          })
        })
      })

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockPreferences, theme: 'light' },
              error: null
            })
          })
        })
      })

      mockSupabaseClient.from
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ update: mockUpdate })

      const { result } = renderHook(() => useUserPreferences())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let updateResult: any
      await act(async () => {
        updateResult = await result.current.updatePreferences({ theme: 'light' })
      })

      expect(updateResult.success).toBe(true)
      expect(result.current.preferences?.theme).toBe('light')
      expect(mockUpdate).toHaveBeenCalledWith({ theme: 'light' })
    })

    it('applies theme changes immediately', async () => {
      const mockClassList = {
        toggle: jest.fn()
      }
      
      Object.defineProperty(document, 'documentElement', {
        value: { classList: mockClassList },
        writable: true
      })

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPreferences,
            error: null
          })
        })
      })

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockPreferences, theme: 'dark' },
              error: null
            })
          })
        })
      })

      mockSupabaseClient.from
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ update: mockUpdate })

      const { result } = renderHook(() => useUserPreferences())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.updatePreferences({ theme: 'dark' })
      })

      expect(mockClassList.toggle).toHaveBeenCalledWith('dark', true)
    })

    it('handles update errors', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPreferences,
            error: null
          })
        })
      })

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Update failed' }
            })
          })
        })
      })

      mockSupabaseClient.from
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ update: mockUpdate })

      const { result } = renderHook(() => useUserPreferences())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let updateResult: any
      await act(async () => {
        updateResult = await result.current.updatePreferences({ theme: 'light' })
      })

      expect(updateResult.success).toBe(false)
      expect(updateResult.error).toContain('Update failed')
      expect(result.current.error).toContain('Update failed')
    })

    it('fails when user is not authenticated', async () => {
      const { result } = renderHook(() => useUserPreferences())

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Simulate user logout
      ;(useAuth as jest.Mock).mockReturnValue({
        user: null,
        loading: false
      })

      let updateResult: any
      await act(async () => {
        updateResult = await result.current.updatePreferences({ theme: 'light' })
      })

      expect(updateResult.success).toBe(false)
      expect(updateResult.error).toContain('not authenticated')
    })
  })

  describe('resetting preferences', () => {
    it('resets preferences to defaults successfully', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPreferences,
            error: null
          })
        })
      })

      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      })

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { ...mockPreferences, theme: 'system' },
            error: null
          })
        })
      })

      mockSupabaseClient.from
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ delete: mockDelete })
        .mockReturnValueOnce({ insert: mockInsert })

      const { result } = renderHook(() => useUserPreferences())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let resetResult: any
      await act(async () => {
        resetResult = await result.current.resetPreferences()
      })

      expect(resetResult.success).toBe(true)
      expect(result.current.preferences?.theme).toBe('system')
      expect(mockDelete).toHaveBeenCalled()
      expect(mockInsert).toHaveBeenCalled()
    })

    it('handles reset errors', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPreferences,
            error: null
          })
        })
      })

      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
      })

      mockSupabaseClient.from
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ delete: mockDelete })

      const { result } = renderHook(() => useUserPreferences())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let resetResult: any
      await act(async () => {
        resetResult = await result.current.resetPreferences()
      })

      expect(resetResult.success).toBe(false)
      expect(resetResult.error).toContain('Delete failed')
    })
  })

  describe('theme application', () => {
    it('applies light theme correctly', async () => {
      const mockClassList = {
        toggle: jest.fn()
      }
      
      Object.defineProperty(document, 'documentElement', {
        value: { classList: mockClassList },
        writable: true
      })

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { ...mockPreferences, theme: 'light' },
            error: null
          })
        })
      })

      mockSupabaseClient.from.mockReturnValue({ select: mockSelect })

      renderHook(() => useUserPreferences())

      await waitFor(() => {
        expect(mockClassList.toggle).toHaveBeenCalledWith('dark', false)
      })
    })

    it('applies dark theme correctly', async () => {
      const mockClassList = {
        toggle: jest.fn()
      }
      
      Object.defineProperty(document, 'documentElement', {
        value: { classList: mockClassList },
        writable: true
      })

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { ...mockPreferences, theme: 'dark' },
            error: null
          })
        })
      })

      mockSupabaseClient.from.mockReturnValue({ select: mockSelect })

      renderHook(() => useUserPreferences())

      await waitFor(() => {
        expect(mockClassList.toggle).toHaveBeenCalledWith('dark', true)
      })
    })

    it('applies system theme based on media query', async () => {
      const mockClassList = {
        toggle: jest.fn()
      }
      
      Object.defineProperty(document, 'documentElement', {
        value: { classList: mockClassList },
        writable: true
      })

      // Mock system preference for dark theme
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        })),
      })

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { ...mockPreferences, theme: 'system' },
            error: null
          })
        })
      })

      mockSupabaseClient.from.mockReturnValue({ select: mockSelect })

      renderHook(() => useUserPreferences())

      await waitFor(() => {
        expect(mockClassList.toggle).toHaveBeenCalledWith('dark', true)
      })
    })

    it('listens for system theme changes when using system theme', async () => {
      const mockAddEventListener = jest.fn()
      const mockRemoveEventListener = jest.fn()
      
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(() => ({
          matches: false,
          addEventListener: mockAddEventListener,
          removeEventListener: mockRemoveEventListener,
        })),
      })

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { ...mockPreferences, theme: 'system' },
            error: null
          })
        })
      })

      mockSupabaseClient.from.mockReturnValue({ select: mockSelect })

      const { unmount } = renderHook(() => useUserPreferences())

      await waitFor(() => {
        expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function))
      })

      unmount()

      expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })
  })

  describe('refreshPreferences', () => {
    it('refreshes preferences successfully', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPreferences,
            error: null
          })
        })
      })

      mockSupabaseClient.from.mockReturnValue({ select: mockSelect })

      const { result } = renderHook(() => useUserPreferences())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Clear the mock to track new calls
      mockSelect.mockClear()
      mockSupabaseClient.from.mockClear()
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect })

      await act(async () => {
        await result.current.refreshPreferences()
      })

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_preferences')
      expect(mockSelect).toHaveBeenCalled()
    })
  })
})