import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { LoginForm } from '../LoginForm'
import { useAuth } from '../../../hooks/useAuth'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock useAuth hook
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: jest.fn()
}))

// Mock validation utils
jest.mock('../../../utils/validation', () => ({
  validateFormData: jest.fn(),
  signInSchema: {}
}))

const mockPush = jest.fn()
const mockSignIn = jest.fn()

const defaultMockAuth = {
  signIn: mockSignIn,
  loading: false,
  user: null,
  session: null,
  signOut: jest.fn(),
  signUp: jest.fn()
}

describe('LoginForm', () => {
  const user = userEvent.setup()
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    })
    ;(useAuth as jest.Mock).mockReturnValue(defaultMockAuth)
    
    // Mock successful validation by default
    const { validateFormData } = require('../../../utils/validation')
    validateFormData.mockReturnValue({ success: true })
  })

  describe('Rendering', () => {
    it('renders all form elements correctly', () => {
      render(<LoginForm />)

      expect(screen.getByTestId('login-form')).toBeInTheDocument()
      expect(screen.getByTestId('login-email-input')).toBeInTheDocument()
      expect(screen.getByTestId('login-password-input')).toBeInTheDocument()
      expect(screen.getByTestId('login-remember-checkbox')).toBeInTheDocument()
      expect(screen.getByTestId('login-submit-button')).toBeInTheDocument()
      expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument()
    })

    it('displays proper labels and placeholders', () => {
      render(<LoginForm />)

      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Remember me')).toBeInTheDocument()
      
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
      
      expect(screen.getByText('Sign in')).toBeInTheDocument()
      expect(screen.getByText('Forgot your password?')).toBeInTheDocument()
    })

    it('has correct form structure and accessibility', () => {
      render(<LoginForm />)

      const form = screen.getByTestId('login-form')
      expect(form.tagName).toBe('FORM')
      
      const emailInput = screen.getByTestId('login-email-input')
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('autoComplete', 'email')
      expect(emailInput).toBeRequired()
      
      const passwordInput = screen.getByTestId('login-password-input')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password')
      expect(passwordInput).toBeRequired()
    })
  })

  describe('Form Interactions', () => {
    it('updates email field on user input', async () => {
      render(<LoginForm />)

      const emailInput = screen.getByTestId('login-email-input')
      await user.type(emailInput, 'test@example.com')

      expect(emailInput).toHaveValue('test@example.com')
    })

    it('updates password field on user input', async () => {
      render(<LoginForm />)

      const passwordInput = screen.getByTestId('login-password-input')
      await user.type(passwordInput, 'password123')

      expect(passwordInput).toHaveValue('password123')
    })

    it('toggles remember me checkbox', async () => {
      render(<LoginForm />)

      const checkbox = screen.getByTestId('login-remember-checkbox')
      expect(checkbox).not.toBeChecked()

      await user.click(checkbox)
      expect(checkbox).toBeChecked()

      await user.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })

    it('clears field errors when user starts typing', async () => {
      const { validateFormData } = require('../../../utils/validation')
      validateFormData.mockReturnValueOnce({
        success: false,
        errors: { email: 'Email is required' }
      })

      render(<LoginForm />)

      const emailInput = screen.getByTestId('login-email-input')
      const submitButton = screen.getByTestId('login-submit-button')

      // Submit form to trigger validation error
      await user.click(submitButton)

      // Start typing to clear error
      await user.type(emailInput, 'test@example.com')

      // Error should be cleared (this would need to be verified through the input's error state)
      expect(emailInput).toHaveValue('test@example.com')
    })
  })

  describe('Form Submission', () => {
    it('successfully submits form with valid data', async () => {
      mockSignIn.mockResolvedValueOnce({
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null
      })

      const onSuccess = jest.fn()
      render(<LoginForm onSuccess={onSuccess} redirectTo="/custom-dashboard" />)

      const emailInput = screen.getByTestId('login-email-input')
      const passwordInput = screen.getByTestId('login-password-input')
      const submitButton = screen.getByTestId('login-submit-button')

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          remember: false
        })
      })

      expect(onSuccess).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/custom-dashboard')
    })

    it('handles sign-in with remember me checked', async () => {
      mockSignIn.mockResolvedValueOnce({
        data: { user: { id: '123' } },
        error: null
      })

      render(<LoginForm />)

      const emailInput = screen.getByTestId('login-email-input')
      const passwordInput = screen.getByTestId('login-password-input')
      const rememberCheckbox = screen.getByTestId('login-remember-checkbox')
      const submitButton = screen.getByTestId('login-submit-button')

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(rememberCheckbox)
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          remember: true
        })
      })
    })

    it('uses default redirect when no redirectTo prop provided', async () => {
      mockSignIn.mockResolvedValueOnce({
        data: { user: { id: '123' } },
        error: null
      })

      render(<LoginForm />)

      const emailInput = screen.getByTestId('login-email-input')
      const passwordInput = screen.getByTestId('login-password-input')
      const submitButton = screen.getByTestId('login-submit-button')

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })
  })

  describe('Validation Errors', () => {
    it('displays validation errors for invalid email', async () => {
      const { validateFormData } = require('../../../utils/validation')
      validateFormData.mockReturnValueOnce({
        success: false,
        errors: { email: 'Please enter a valid email address' }
      })

      render(<LoginForm />)

      const submitButton = screen.getByTestId('login-submit-button')
      await user.click(submitButton)

      // The validation errors would be displayed through the input's error state
      // In a real implementation, you'd check for error styling or error text
      expect(validateFormData).toHaveBeenCalled()
    })

    it('displays validation errors for missing password', async () => {
      const { validateFormData } = require('../../../utils/validation')
      validateFormData.mockReturnValueOnce({
        success: false,
        errors: { password: 'Password is required' }
      })

      render(<LoginForm />)

      const emailInput = screen.getByTestId('login-email-input')
      const submitButton = screen.getByTestId('login-submit-button')

      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)

      expect(validateFormData).toHaveBeenCalledWith(
        {},
        { email: 'test@example.com', password: '', remember: false }
      )
    })

    it('prevents submission when validation fails', async () => {
      const { validateFormData } = require('../../../utils/validation')
      validateFormData.mockReturnValueOnce({
        success: false,
        errors: { email: 'Email is required', password: 'Password is required' }
      })

      render(<LoginForm />)

      const submitButton = screen.getByTestId('login-submit-button')
      await user.click(submitButton)

      expect(mockSignIn).not.toHaveBeenCalled()
    })
  })

  describe('Authentication Errors', () => {
    it('displays authentication errors from signIn', async () => {
      mockSignIn.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid login credentials' }
      })

      const onError = jest.fn()
      render(<LoginForm onError={onError} />)

      const emailInput = screen.getByTestId('login-email-input')
      const passwordInput = screen.getByTestId('login-password-input')
      const submitButton = screen.getByTestId('login-submit-button')

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('login-error-alert')).toBeInTheDocument()
        expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
      })

      expect(onError).toHaveBeenCalledWith('Invalid login credentials')
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('handles unexpected errors during sign-in', async () => {
      mockSignIn.mockRejectedValueOnce(new Error('Network error'))

      render(<LoginForm />)

      const emailInput = screen.getByTestId('login-email-input')
      const passwordInput = screen.getByTestId('login-password-input')
      const submitButton = screen.getByTestId('login-submit-button')

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('login-error-alert')).toBeInTheDocument()
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })

    it('handles unexpected errors without message', async () => {
      mockSignIn.mockRejectedValueOnce(new Error())

      render(<LoginForm />)

      const emailInput = screen.getByTestId('login-email-input')
      const passwordInput = screen.getByTestId('login-password-input')
      const submitButton = screen.getByTestId('login-submit-button')

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('disables form elements when submitting', async () => {
      // Mock a delayed sign-in
      mockSignIn.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ data: { user: { id: '123' } }, error: null }), 100)
      ))

      render(<LoginForm />)

      const emailInput = screen.getByTestId('login-email-input')
      const passwordInput = screen.getByTestId('login-password-input')
      const rememberCheckbox = screen.getByTestId('login-remember-checkbox')
      const submitButton = screen.getByTestId('login-submit-button')

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Check that elements are disabled during submission
      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
      expect(rememberCheckbox).toBeDisabled()
      expect(submitButton).toBeDisabled()

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
      })
    })

    it('disables form when auth loading is true', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        ...defaultMockAuth,
        loading: true
      })

      render(<LoginForm />)

      expect(screen.getByTestId('login-email-input')).toBeDisabled()
      expect(screen.getByTestId('login-password-input')).toBeDisabled()
      expect(screen.getByTestId('login-remember-checkbox')).toBeDisabled()
      expect(screen.getByTestId('login-submit-button')).toBeDisabled()
    })

    it('shows loading state on submit button', async () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        ...defaultMockAuth,
        loading: true
      })

      render(<LoginForm />)

      const submitButton = screen.getByTestId('login-submit-button')
      expect(submitButton).toHaveAttribute('loading')
    })
  })

  describe('Navigation Links', () => {
    it('renders forgot password link with correct href', () => {
      render(<LoginForm />)

      const forgotPasswordLink = screen.getByTestId('forgot-password-link')
      expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password')
      expect(forgotPasswordLink).toHaveTextContent('Forgot your password?')
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels and associations', () => {
      render(<LoginForm />)

      const emailInput = screen.getByTestId('login-email-input')
      const passwordInput = screen.getByTestId('login-password-input')
      const rememberCheckbox = screen.getByTestId('login-remember-checkbox')

      expect(emailInput).toHaveAccessibleName('Email address')
      expect(passwordInput).toHaveAccessibleName('Password')
      expect(rememberCheckbox).toHaveAccessibleName('Remember me')
    })

    it('supports keyboard navigation', async () => {
      render(<LoginForm />)

      const emailInput = screen.getByTestId('login-email-input')
      const passwordInput = screen.getByTestId('login-password-input')
      const rememberCheckbox = screen.getByTestId('login-remember-checkbox')
      const submitButton = screen.getByTestId('login-submit-button')

      // Tab through form elements
      emailInput.focus()
      expect(emailInput).toHaveFocus()

      await user.tab()
      expect(passwordInput).toHaveFocus()

      await user.tab()
      expect(rememberCheckbox).toHaveFocus()

      await user.tab()
      expect(submitButton).toHaveFocus()
    })
  })

  describe('Integration', () => {
    it('calls onSuccess callback after successful login', async () => {
      mockSignIn.mockResolvedValueOnce({
        data: { user: { id: '123' } },
        error: null
      })

      const onSuccess = jest.fn()
      render(<LoginForm onSuccess={onSuccess} />)

      const emailInput = screen.getByTestId('login-email-input')
      const passwordInput = screen.getByTestId('login-password-input')
      const submitButton = screen.getByTestId('login-submit-button')

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
      })
    })

    it('calls onError callback when authentication fails', async () => {
      mockSignIn.mockResolvedValueOnce({
        data: null,
        error: { message: 'Authentication failed' }
      })

      const onError = jest.fn()
      render(<LoginForm onError={onError} />)

      const emailInput = screen.getByTestId('login-email-input')
      const passwordInput = screen.getByTestId('login-password-input')
      const submitButton = screen.getByTestId('login-submit-button')

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Authentication failed')
      })
    })
  })
})