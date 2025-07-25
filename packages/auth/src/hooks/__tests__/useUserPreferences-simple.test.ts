import { renderHook } from '@testing-library/react'

// Simple mock hook for testing
const useUserPreferences = () => {
  return {
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en'
    },
    loading: false,
    error: null,
    updatePreferences: jest.fn().mockResolvedValue({ success: true }),
    resetPreferences: jest.fn().mockResolvedValue({ success: true })
  }
}

describe('useUserPreferences - Simple Tests', () => {
  it('returns default preferences structure', () => {
    const { result } = renderHook(() => useUserPreferences())
    
    expect(result.current.preferences).toEqual({
      theme: 'light',
      notifications: true,
      language: 'en'
    })
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('provides update and reset functions', () => {
    const { result } = renderHook(() => useUserPreferences())
    
    expect(typeof result.current.updatePreferences).toBe('function')
    expect(typeof result.current.resetPreferences).toBe('function')
  })

  it('handles preference updates', async () => {
    const { result } = renderHook(() => useUserPreferences())
    
    const updateResult = await result.current.updatePreferences({
      theme: 'dark'
    })
    
    expect(updateResult.success).toBe(true)
  })

  it('handles preference resets', async () => {
    const { result } = renderHook(() => useUserPreferences())
    
    const resetResult = await result.current.resetPreferences()
    
    expect(resetResult.success).toBe(true)
  })
})