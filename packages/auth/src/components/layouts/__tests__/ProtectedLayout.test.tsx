import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { ProtectedLayout } from '../ProtectedLayout'
import { useAuth, useIsAuthenticated } from '../../../hooks/useAuth'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock auth hooks
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
  useIsAuthenticated: jest.fn(),
}))

// Mock UI components
jest.mock('@nextsaas/ui', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseIsAuthenticated = useIsAuthenticated as jest.MockedFunction<typeof useIsAuthenticated>

// Mock window.location
const mockLocation = {
  pathname: '/dashboard',
  search: '?param=value',
}

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

describe('ProtectedLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock values
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      session: null,
      error: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateProfile: jest.fn(),
      refreshSession: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      signInWithOAuth: jest.fn(),
      signInWithMagicLink: jest.fn(),
      signInWithPhone: jest.fn(),
      resendVerification: jest.fn(),
      verifyEmail: jest.fn(),
    })
    
    mockUseIsAuthenticated.mockReturnValue(false)
  })

  it('should render loading spinner when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      ...mockUseAuth(),
      loading: true,
    })

    render(
      <ProtectedLayout>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedLayout>
    )

    expect(screen.getByTestId('spinner')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('should render children when user is authenticated', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      email_confirmed_at: '2023-01-01T00:00:00Z',
    }

    mockUseAuth.mockReturnValue({
      ...mockUseAuth(),
      user: mockUser,
      loading: false,
    })
    
    mockUseIsAuthenticated.mockReturnValue(true)

    render(
      <ProtectedLayout>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedLayout>
    )

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
  })

  it('should redirect to sign-in when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      ...mockUseAuth(),
      loading: false,
    })
    
    mockUseIsAuthenticated.mockReturnValue(false)

    render(
      <ProtectedLayout>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedLayout>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        '/auth/sign-in?redirect=%2Fdashboard%3Fparam%3Dvalue'
      )
    })
  })

  it('should use custom redirect URL when provided', async () => {
    mockUseAuth.mockReturnValue({
      ...mockUseAuth(),
      loading: false,
    })
    
    mockUseIsAuthenticated.mockReturnValue(false)

    render(
      <ProtectedLayout redirectTo="/custom-login">
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedLayout>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        '/custom-login?redirect=%2Fdashboard%3Fparam%3Dvalue'
      )
    })
  })

  it('should redirect to email verification when required and user email not confirmed', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      email_confirmed_at: null, // Email not confirmed
    }

    mockUseAuth.mockReturnValue({
      ...mockUseAuth(),
      user: mockUser,
      loading: false,
    })
    
    mockUseIsAuthenticated.mockReturnValue(true)

    // Mock environment variable
    const originalEnv = process.env.NEXT_PUBLIC_DISABLE_EMAIL_CONFIRMATION
    process.env.NEXT_PUBLIC_DISABLE_EMAIL_CONFIRMATION = 'false'

    render(
      <ProtectedLayout requireEmailVerification={true}>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedLayout>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/verify-email')
    })

    // Restore environment variable
    process.env.NEXT_PUBLIC_DISABLE_EMAIL_CONFIRMATION = originalEnv
  })

  it('should skip email verification when disabled globally', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      email_confirmed_at: null, // Email not confirmed
    }

    mockUseAuth.mockReturnValue({
      ...mockUseAuth(),
      user: mockUser,
      loading: false,
    })
    
    mockUseIsAuthenticated.mockReturnValue(true)

    // Mock environment variable to disable email confirmation
    const originalEnv = process.env.NEXT_PUBLIC_DISABLE_EMAIL_CONFIRMATION
    process.env.NEXT_PUBLIC_DISABLE_EMAIL_CONFIRMATION = 'true'

    render(
      <ProtectedLayout requireEmailVerification={true}>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedLayout>
    )

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()

    // Restore environment variable
    process.env.NEXT_PUBLIC_DISABLE_EMAIL_CONFIRMATION = originalEnv
  })

  it('should render fallback component when provided and not authenticated', () => {
    const FallbackComponent = () => <div data-testid="fallback">Access Denied</div>

    mockUseAuth.mockReturnValue({
      ...mockUseAuth(),
      loading: false,
    })
    
    mockUseIsAuthenticated.mockReturnValue(false)

    render(
      <ProtectedLayout fallback={FallbackComponent}>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedLayout>
    )

    expect(screen.getByTestId('fallback')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('should handle authentication state changes properly', async () => {
    const { rerender } = render(
      <ProtectedLayout>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedLayout>
    )

    // Initially not authenticated
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()

    // User becomes authenticated
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      email_confirmed_at: '2023-01-01T00:00:00Z',
    }

    mockUseAuth.mockReturnValue({
      ...mockUseAuth(),
      user: mockUser,
      loading: false,
    })
    
    mockUseIsAuthenticated.mockReturnValue(true)

    rerender(
      <ProtectedLayout>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedLayout>
    )

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })
})

// Test the correct route usage
describe('Route Configuration', () => {
  it('should use correct default sign-in route', async () => {
    mockUseAuth.mockReturnValue({
      ...mockUseAuth(),
      loading: false,
    })
    
    mockUseIsAuthenticated.mockReturnValue(false)

    render(
      <ProtectedLayout>
        <div>Content</div>
      </ProtectedLayout>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/auth/sign-in')
      )
    })
  })

  it('should not use incorrect login route', async () => {
    mockUseAuth.mockReturnValue({
      ...mockUseAuth(),
      loading: false,
    })
    
    mockUseIsAuthenticated.mockReturnValue(false)

    render(
      <ProtectedLayout>
        <div>Content</div>
      </ProtectedLayout>
    )

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalledWith(
        expect.stringContaining('/auth/login') // Old incorrect route
      )
    })
  })
})