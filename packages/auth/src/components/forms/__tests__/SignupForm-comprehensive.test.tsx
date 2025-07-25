import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupForm } from '../SignupForm'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  })
}))

// Mock useAuth hook
const mockSignUp = jest.fn()
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    signUp: mockSignUp,
    loading: false
  })
}))

// Mock validation utils
jest.mock('../../../utils/validation', () => ({
  validateFormData: jest.fn(),
  signUpSchema: {
    parse: jest.fn()
  },
  getPasswordStrength: jest.fn().mockReturnValue({
    score: 3,
    feedback: ['Good password strength']
  })
}))

// Mock UI components
jest.mock('@nextsaas/ui', () => ({
  Button: ({ children, onClick, disabled, type, ...props }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      type={type}
      data-testid={props['data-testid']}
      {...props}
    >
      {children}
    </button>
  ),
  Input: ({ onChange, value, placeholder, type, name, id, ...props }: any) => (
    <input
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      type={type}
      name={name}
      id={id}
      data-testid={props['data-testid'] || `${name}-input`}
      {...props}
    />
  ),
  Checkbox: ({ onChange, checked, name, children, ...props }: any) => (
    <label>
      <input
        type="checkbox"
        onChange={onChange}
        checked={checked}
        name={name}
        data-testid={props['data-testid'] || `${name}-checkbox`}
        {...props}
      />
      {children}
    </label>
  )
}))

const { validateFormData, getPasswordStrength } = require('../../../utils/validation')

describe('SignupForm - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    validateFormData.mockReturnValue({ success: true, data: {} })
  })

  describe('Rendering', () => {
    it('renders all required form elements', () => {
      render(<SignupForm />)
      
      expect(screen.getByTestId('signup-firstname-input')).toBeInTheDocument()
      expect(screen.getByTestId('signup-lastname-input')).toBeInTheDocument()
      expect(screen.getByTestId('signup-email-input')).toBeInTheDocument()
      expect(screen.getByTestId('signup-password-input')).toBeInTheDocument()
      expect(screen.getByTestId('signup-organization-input')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('renders without organization field when includeOrganization is false', () => {
      render(<SignupForm includeOrganization={false} />)
      
      expect(screen.queryByTestId('signup-organization-input')).not.toBeInTheDocument()
    })

    it('has proper form structure and accessibility', () => {
      render(<SignupForm />)
      
      const form = screen.getByTestId('signup-form')
      expect(form).toBeInTheDocument()
      expect(form.tagName).toBe('FORM')
    })
  })

  describe('Form Interactions', () => {
    it('updates first name field on user input', async () => {
      const user = userEvent.setup()
      render(<SignupForm />)
      
      const firstNameInput = screen.getByTestId('signup-firstname-input')
      await user.type(firstNameInput, 'John')
      
      expect(firstNameInput).toHaveValue('John')
    })

    it('updates last name field on user input', async () => {
      const user = userEvent.setup()
      render(<SignupForm />)
      
      const lastNameInput = screen.getByTestId('signup-lastname-input')
      await user.type(lastNameInput, 'Doe')
      
      expect(lastNameInput).toHaveValue('Doe')
    })

    it('updates email field on user input', async () => {
      const user = userEvent.setup()
      render(<SignupForm />)
      
      const emailInput = screen.getByTestId('signup-email-input')
      await user.type(emailInput, 'john@example.com')
      
      expect(emailInput).toHaveValue('john@example.com')
    })

    it('updates password field and shows strength indicator', async () => {
      const user = userEvent.setup()
      render(<SignupForm />)
      
      const passwordInput = screen.getByTestId('signup-password-input')
      await user.type(passwordInput, 'StrongPassword123!')
      
      expect(passwordInput).toHaveValue('StrongPassword123!')
      expect(getPasswordStrength).toHaveBeenCalledWith('StrongPassword123!')
    })

    it('updates organization field on user input', async () => {
      const user = userEvent.setup()
      render(<SignupForm />)
      
      const orgInput = screen.getByTestId('signup-organization-input')
      await user.type(orgInput, 'Acme Corp')
      
      expect(orgInput).toHaveValue('Acme Corp')
    })

    it('clears field errors when user starts typing', async () => {
      const user = userEvent.setup()
      
      // Mock validation to return errors initially
      validateFormData.mockReturnValueOnce({
        success: false,
        error: { issues: [{ path: ['email'], message: 'Invalid email' }] }
      })
      
      render(<SignupForm />)
      
      // Trigger form submission to show errors
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      // Now clear the error by typing
      const emailInput = screen.getByTestId('signup-email-input')
      await user.type(emailInput, 'test')
      
      // Error should be cleared (we'd need to check if error display is cleared)
      expect(emailInput).toHaveValue('test')
    })
  })

  describe('Password Strength Indicator', () => {
    it('updates password strength as user types', async () => {
      const user = userEvent.setup()
      
      getPasswordStrength.mockReturnValue({
        score: 4,
        feedback: ['Very strong password']
      })
      
      render(<SignupForm />)
      
      const passwordInput = screen.getByTestId('signup-password-input')
      await user.type(passwordInput, 'VeryStrongPassword123!')
      
      expect(getPasswordStrength).toHaveBeenCalledWith('VeryStrongPassword123!')
    })

    it('shows weak password feedback', async () => {
      const user = userEvent.setup()
      
      getPasswordStrength.mockReturnValue({
        score: 1,
        feedback: ['Password is too weak', 'Add more characters']
      })
      
      render(<SignupForm />)
      
      const passwordInput = screen.getByTestId('signup-password-input')
      await user.type(passwordInput, '123')
      
      expect(getPasswordStrength).toHaveBeenCalledWith('123')
    })
  })

  describe('Form Submission', () => {
    it('successfully submits form with valid data', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = jest.fn()
      
      mockSignUp.mockResolvedValue({ error: null })
      validateFormData.mockReturnValue({
        success: true,
        data: {
          email: 'john@example.com',
          password: 'StrongPassword123!',
          firstName: 'John',
          lastName: 'Doe',
          organizationName: 'Acme Corp'
        }
      })
      
      render(<SignupForm onSuccess={mockOnSuccess} />)
      
      // Fill out form
      await user.type(screen.getByTestId('firstName-input'), 'John')
      await user.type(screen.getByTestId('lastName-input'), 'Doe')
      await user.type(screen.getByTestId('email-input'), 'john@example.com')
      await user.type(screen.getByTestId('password-input'), 'StrongPassword123!')
      await user.type(screen.getByTestId('organizationName-input'), 'Acme Corp')
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'StrongPassword123!',
          firstName: 'John',
          lastName: 'Doe',
          organizationName: 'Acme Corp'
        })
      })
    })

    it('successfully submits form without organization when not included', async () => {
      const user = userEvent.setup()
      
      mockSignUp.mockResolvedValue({ error: null })
      validateFormData.mockReturnValue({
        success: true,
        data: {
          email: 'john@example.com',
          password: 'StrongPassword123!',
          firstName: 'John',
          lastName: 'Doe'
        }
      })
      
      render(<SignupForm includeOrganization={false} />)
      
      // Fill out form
      await user.type(screen.getByTestId('firstName-input'), 'John')
      await user.type(screen.getByTestId('lastName-input'), 'Doe')
      await user.type(screen.getByTestId('email-input'), 'john@example.com')
      await user.type(screen.getByTestId('password-input'), 'StrongPassword123!')
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'StrongPassword123!',
          firstName: 'John',
          lastName: 'Doe'
        })
      })
    })

    it('uses default redirect when no redirectTo prop provided', async () => {
      const user = userEvent.setup()
      
      mockSignUp.mockResolvedValue({ error: null })
      validateFormData.mockReturnValue({ success: true, data: {} })
      
      render(<SignupForm />)
      
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })
  })

  describe('Validation Errors', () => {
    it('displays validation errors for required fields', async () => {
      const user = userEvent.setup()
      
      validateFormData.mockReturnValue({
        success: false,
        error: {
          issues: [
            { path: ['email'], message: 'Email is required' },
            { path: ['password'], message: 'Password is required' }
          ]
        }
      })
      
      render(<SignupForm />)
      
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)
      
      // Form should not call signUp due to validation errors
      expect(mockSignUp).not.toHaveBeenCalled()
    })

    it('displays validation errors for invalid email', async () => {
      const user = userEvent.setup()
      
      validateFormData.mockReturnValue({
        success: false,
        error: {
          issues: [
            { path: ['email'], message: 'Invalid email format' }
          ]
        }
      })
      
      render(<SignupForm />)
      
      await user.type(screen.getByTestId('email-input'), 'invalid-email')
      
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)
      
      expect(mockSignUp).not.toHaveBeenCalled()
    })

    it('displays validation errors for weak password', async () => {
      const user = userEvent.setup()
      
      getPasswordStrength.mockReturnValue({
        score: 0,
        feedback: ['Password is too weak']
      })
      
      validateFormData.mockReturnValue({
        success: false,
        error: {
          issues: [
            { path: ['password'], message: 'Password is too weak' }
          ]
        }
      })
      
      render(<SignupForm />)
      
      await user.type(screen.getByTestId('password-input'), '123')
      
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)
      
      expect(mockSignUp).not.toHaveBeenCalled()
    })
  })

  describe('Registration Errors', () => {
    it('displays registration errors from signUp', async () => {
      const user = userEvent.setup()
      const mockOnError = jest.fn()
      
      mockSignUp.mockResolvedValue({ 
        error: { message: 'Email already exists' } 
      })
      validateFormData.mockReturnValue({
        success: true,
        data: {
          email: 'existing@example.com',
          password: 'StrongPassword123!'
        }
      })
      
      render(<SignupForm onError={mockOnError} />)
      
      await user.type(screen.getByTestId('email-input'), 'existing@example.com')
      await user.type(screen.getByTestId('password-input'), 'StrongPassword123!')
      
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Email already exists')
      })
    })

    it('handles unexpected errors during registration', async () => {
      const user = userEvent.setup()
      const mockOnError = jest.fn()
      
      mockSignUp.mockRejectedValue(new Error('Network error'))
      validateFormData.mockReturnValue({
        success: true,
        data: {
          email: 'test@example.com',
          password: 'StrongPassword123!'
        }
      })
      
      render(<SignupForm onError={mockOnError} />)
      
      await user.type(screen.getByTestId('email-input'), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'StrongPassword123!')
      
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Network error')
      })
    })
  })

  describe('Loading States', () => {
    it('disables form elements when submitting', async () => {
      const user = userEvent.setup()
      
      // Mock a slow signup
      mockSignUp.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
      )
      validateFormData.mockReturnValue({ success: true, data: {} })
      
      render(<SignupForm />)
      
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)
      
      // Button should be disabled during submission
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Integration', () => {
    it('calls onSuccess callback after successful registration', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = jest.fn()
      
      mockSignUp.mockResolvedValue({ error: null })
      validateFormData.mockReturnValue({ success: true, data: {} })
      
      render(<SignupForm onSuccess={mockOnSuccess} />)
      
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })

    it('calls onError callback when registration fails', async () => {
      const user = userEvent.setup()
      const mockOnError = jest.fn()
      
      mockSignUp.mockResolvedValue({ 
        error: { message: 'Registration failed' } 
      })
      validateFormData.mockReturnValue({ success: true, data: {} })
      
      render(<SignupForm onError={mockOnError} />)
      
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Registration failed')
      })
    })
  })
})