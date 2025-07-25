import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
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
      data-testid={props['data-testid'] || `signup-${name}-input`}
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

describe('SignupForm Working Tests', () => {
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

    it('renders without organization field when disabled', () => {
      render(<SignupForm includeOrganization={false} />)
      
      expect(screen.queryByTestId('signup-organization-input')).not.toBeInTheDocument()
    })
  })

  describe('Form Interactions', () => {
    it('updates form fields correctly', async () => {
      const user = userEvent.setup()
      render(<SignupForm />)
      
      const firstNameInput = screen.getByTestId('signup-firstname-input')
      const lastNameInput = screen.getByTestId('signup-lastname-input')
      const emailInput = screen.getByTestId('signup-email-input')
      const passwordInput = screen.getByTestId('signup-password-input')
      
      await user.type(firstNameInput, 'John')
      await user.type(lastNameInput, 'Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'StrongPassword123!')
      
      expect(firstNameInput).toHaveValue('John')
      expect(lastNameInput).toHaveValue('Doe')
      expect(emailInput).toHaveValue('john@example.com')
      expect(passwordInput).toHaveValue('StrongPassword123!')
    })

    it('shows password strength feedback', async () => {
      const user = userEvent.setup()
      render(<SignupForm />)
      
      const passwordInput = screen.getByTestId('signup-password-input')
      await user.type(passwordInput, 'strongpass')
      
      expect(getPasswordStrength).toHaveBeenCalledWith('strongpass')
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
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
      
      render(<SignupForm />)
      
      // Fill out form
      await user.type(screen.getByTestId('signup-firstname-input'), 'John')
      await user.type(screen.getByTestId('signup-lastname-input'), 'Doe')
      await user.type(screen.getByTestId('signup-email-input'), 'john@example.com')
      await user.type(screen.getByTestId('signup-password-input'), 'StrongPassword123!')
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'StrongPassword123!',
          firstName: 'John',
          lastName: 'Doe',
          organizationName: ''
        })
      })
    })

    it('handles validation errors', async () => {
      const user = userEvent.setup()
      
      validateFormData.mockReturnValue({
        success: false,
        error: {
          issues: [
            { path: ['email'], message: 'Email is required' }
          ]
        }
      })
      
      render(<SignupForm />)
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      // Should not call signUp due to validation errors
      expect(mockSignUp).not.toHaveBeenCalled()
    })

    it('handles signup errors', async () => {
      const user = userEvent.setup()
      const mockOnError = jest.fn()
      
      mockSignUp.mockResolvedValue({ 
        data: null,
        error: { message: 'Email already exists' } 
      })
      validateFormData.mockReturnValue({
        success: true,
        data: { 
          email: 'test@example.com',
          password: 'password',
          firstName: 'John',
          lastName: 'Doe',
          organizationName: ''
        }
      })
      
      render(<SignupForm onError={mockOnError} />)
      
      // Fill form to ensure validation passes
      await user.type(screen.getByTestId('signup-email-input'), 'test@example.com')
      await user.type(screen.getByTestId('signup-password-input'), 'password')
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Email already exists')
      })
    })

    it('calls onSuccess after successful registration', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = jest.fn()
      
      mockSignUp.mockResolvedValue({ 
        data: { user: { id: 'user-123' } },
        error: null 
      })
      validateFormData.mockReturnValue({ 
        success: true, 
        data: {
          email: 'test@example.com',
          password: 'password',
          firstName: 'John',
          lastName: 'Doe',
          organizationName: ''
        }
      })
      
      render(<SignupForm onSuccess={mockOnSuccess} />)
      
      // Fill form to ensure validation passes
      await user.type(screen.getByTestId('signup-email-input'), 'test@example.com')
      await user.type(screen.getByTestId('signup-password-input'), 'password')
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })

    it('redirects to dashboard by default', async () => {
      const user = userEvent.setup()
      
      mockSignUp.mockResolvedValue({ 
        data: { user: { id: 'user-123' } },
        error: null 
      })
      validateFormData.mockReturnValue({ 
        success: true, 
        data: {
          email: 'test@example.com',
          password: 'password',
          firstName: 'John',
          lastName: 'Doe',
          organizationName: ''
        }
      })
      
      render(<SignupForm />)
      
      // Fill form to ensure validation passes
      await user.type(screen.getByTestId('signup-email-input'), 'test@example.com')
      await user.type(screen.getByTestId('signup-password-input'), 'password')
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })
  })

  describe('Loading States', () => {
    it('handles form submission state', async () => {
      const user = userEvent.setup()
      
      mockSignUp.mockResolvedValue({ 
        data: { user: { id: 'user-123' } },
        error: null 
      })
      validateFormData.mockReturnValue({ 
        success: true, 
        data: {
          email: 'test@example.com',
          password: 'password',
          firstName: 'John',
          lastName: 'Doe',
          organizationName: ''
        }
      })
      
      render(<SignupForm />)
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      
      // Button should be enabled initially
      expect(submitButton).toBeEnabled()
      
      // Fill form to ensure validation passes
      await user.type(screen.getByTestId('signup-email-input'), 'test@example.com')
      await user.type(screen.getByTestId('signup-password-input'), 'password')
      
      await user.click(submitButton)
      
      // Form should handle submission
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalled()
      })
    })
  })
})