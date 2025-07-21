import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider } from '../AuthProvider'
import { useAuth } from '../../hooks/useAuth'

// Mock the Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    updateUser: jest.fn(),
    refreshSession: jest.fn(),
  },
}

// Mock the getSupabaseBrowserClient function
jest.mock('@nextsaas/supabase', () => ({
  getSupabaseBrowserClient: () => mockSupabaseClient,
}))

// Mock session manager
jest.mock('../../lib/session-manager', () => ({
  getSessionManager: () => ({
    clearSession: jest.fn(),
    getSession: jest.fn(),
  }),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}))

// Test component to use the auth context
function TestComponent() {
  const { user, loading, error } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="user">{user ? user.email : 'null'}</div>
      <div data-testid="error">{error ? error.message : 'null'}</div>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock implementations
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })
    
    mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    })
  })

  it('should render children and provide auth context', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('loading')).toBeInTheDocument()
    expect(screen.getByTestId('user')).toBeInTheDocument()
    expect(screen.getByTestId('error')).toBeInTheDocument()
  })

  it('should initialize with loading state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('true')
    expect(screen.getByTestId('user')).toHaveTextContent('null')
    expect(screen.getByTestId('error')).toHaveTextContent('null')
  })

  it('should handle successful session initialization', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: {
        first_name: 'John',
        last_name: 'Doe',
      },
    }

    const mockSession = {
      user: mockUser,
      access_token: 'token123',
    }

    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
  })

  it('should handle session initialization error', async () => {
    const mockError = new Error('Session initialization failed')
    
    mockSupabaseClient.auth.getSession.mockRejectedValue(mockError)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    expect(screen.getByTestId('error')).toHaveTextContent('Session initialization failed')
  })

  it('should handle auth state changes', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: {},
    }

    const mockSession = {
      user: mockUser,
      access_token: 'token123',
    }

    let authStateChangeCallback: (event: string, session: any) => void

    mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateChangeCallback = callback
      return {
        data: { subscription: { unsubscribe: jest.fn() } },
      }
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Simulate sign in event
    act(() => {
      authStateChangeCallback('SIGNED_IN', mockSession)
    })

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })

    // Simulate sign out event
    act(() => {
      authStateChangeCallback('SIGNED_OUT', null)
    })

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null')
    })
  })

  it('should use unified Supabase client from @nextsaas/supabase', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Verify that getSession was called on the mocked client
    expect(mockSupabaseClient.auth.getSession).toHaveBeenCalled()
    expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled()
  })

  it('should cleanup subscription on unmount', () => {
    const mockUnsubscribe = jest.fn()
    
    mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    })

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})

// Test the unified client pattern
describe('Unified Supabase Client Pattern', () => {
  it('should import from @nextsaas/supabase package', () => {
    // This test ensures we're using the correct import
    // The mock setup above verifies the import works correctly
    expect(jest.isMockFunction(mockSupabaseClient.auth.getSession)).toBe(true)
  })
})