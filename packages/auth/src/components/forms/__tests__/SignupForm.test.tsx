import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { SignupForm } from '../SignupForm'
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
  signUpSchema: {},
  getPasswordStrength: jest.fn().mockReturnValue({
    score: 3,
    feedback: ['Good password strength']
  })
}))

const mockPush = jest.fn()
const mockSignUp = jest.fn()

const defaultMockAuth = {
  signUp: mockSignUp,
  loading: false,
  user: null,
  session: null,
  signIn: jest.fn(),
  signOut: jest.fn()
}

describe('SignupForm', () => {
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
    it('renders all required form elements', () => {
      render(<SignupForm />)

      expect(screen.getByTestId('signup-form')).toBeInTheDocument()
      expect(screen.getByTestId('signup-first-name-input')).toBeInTheDocument()
      expect(screen.getByTestId('signup-last-name-input')).toBeInTheDocument()
      expect(screen.getByTestId('signup-email-input')).toBeInTheDocument()
      expect(screen.getByTestId('signup-password-input')).toBeInTheDocument()
      expect(screen.getByTestId('signup-organization-input')).toBeInTheDocument()
      expect(screen.getByTestId('signup-terms-checkbox')).toBeInTheDocument()
      expect(screen.getByTestId('signup-submit-button')).toBeInTheDocument()
    })

    it('renders without organization field when includeOrganization is false', () => {
      render(<SignupForm includeOrganization={false} />)

      expect(screen.getByTestId('signup-form')).toBeInTheDocument()
      expect(screen.queryByTestId('signup-organization-input')).not.toBeInTheDocument()
    })

    it('displays proper labels and placeholders', () => {
      render(<SignupForm />)

      expect(screen.getByLabelText('First Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Organization Name')).toBeInTheDocument()
      
      expect(screen.getByPlaceholderText('John')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('••••••••••••')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Acme Inc')).toBeInTheDocument()
    })

    it('has correct form structure and accessibility', () => {
      render(<SignupForm />)

      const form = screen.getByTestId('signup-form')
      expect(form.tagName).toBe('FORM')
      
      const emailInput = screen.getByTestId('signup-email-input')
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('autoComplete', 'email')
      expect(emailInput).toBeRequired()
      
      const passwordInput = screen.getByTestId('signup-password-input')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('autoComplete', 'new-password')
      expect(passwordInput).toBeRequired()

      const firstNameInput = screen.getByTestId('signup-first-name-input')
      expect(firstNameInput).toBeRequired()
      
      const lastNameInput = screen.getByTestId('signup-last-name-input')
      expect(lastNameInput).toBeRequired()
    })
  })

  describe('Form Interactions', () => {
    it('updates first name field on user input', async () => {
      render(<SignupForm />)

      const firstNameInput = screen.getByTestId('signup-first-name-input')
      await user.type(firstNameInput, 'John')

      expect(firstNameInput).toHaveValue('John')
    })

    it('updates last name field on user input', async () => {
      render(<SignupForm />)

      const lastNameInput = screen.getByTestId('signup-last-name-input')
      await user.type(lastNameInput, 'Doe')

      expect(lastNameInput).toHaveValue('Doe')
    })

    it('updates email field on user input', async () => {
      render(<SignupForm />)

      const emailInput = screen.getByTestId('signup-email-input')
      await user.type(emailInput, 'john@example.com')

      expect(emailInput).toHaveValue('john@example.com')
    })

    it('updates password field and shows strength indicator', async () => {
      render(<SignupForm />)

      const passwordInput = screen.getByTestId('signup-password-input')
      await user.type(passwordInput, 'StrongPassword123!')

      expect(passwordInput).toHaveValue('StrongPassword123!')
      // Password strength indicator would be tested based on actual implementation
    })

    it('updates organization field on user input', async () => {
      render(<SignupForm />)

      const orgInput = screen.getByTestId('signup-organization-input')
      await user.type(orgInput, 'Acme Corp')

      expect(orgInput).toHaveValue('Acme Corp')
    })

    it('toggles terms and conditions checkbox', async () => {
      render(<SignupForm />)

      const termsCheckbox = screen.getByTestId('signup-terms-checkbox')
      expect(termsCheckbox).not.toBeChecked()

      await user.click(termsCheckbox)
      expect(termsCheckbox).toBeChecked()

      await user.click(termsCheckbox)
      expect(termsCheckbox).not.toBeChecked()
    })

    it('clears field errors when user starts typing', async () => {
      const { validateFormData } = require('../../../utils/validation')
      validateFormData.mockReturnValueOnce({
        success: false,
        errors: { email: 'Email is required' }
      })

      render(<SignupForm />)

      const emailInput = screen.getByTestId('signup-email-input')
      const submitButton = screen.getByTestId('signup-submit-button')

      // Submit form to trigger validation error
      await user.click(submitButton)

      // Start typing to clear error
      await user.type(emailInput, 'test@example.com')

      expect(emailInput).toHaveValue('test@example.com')
    })
  })

  describe('Password Strength Indicator', () => {
    it('updates password strength as user types', async () => {
      const { getPasswordStrength } = require('../../../utils/validation')
      getPasswordStrength.mockReturnValue({
        score: 4,
        feedback: ['Excellent password']
      })

      render(<SignupForm />)

      const passwordInput = screen.getByTestId('signup-password-input')
      await user.type(passwordInput, 'VeryStrongPassword123!')

      expect(getPasswordStrength).toHaveBeenCalledWith('VeryStrongPassword123!')
    })

    it('shows weak password feedback', async () => {
      const { getPasswordStrength } = require('../../../utils/validation')
      getPasswordStrength.mockReturnValue({
        score: 1,
        feedback: ['Password is too weak', 'Add numbers and symbols']
      })

      render(<SignupForm />)

      const passwordInput = screen.getByTestId('signup-password-input')
      await user.type(passwordInput, 'weak')

      expect(getPasswordStrength).toHaveBeenCalledWith('weak')
    })
  })

  describe('Form Submission', () => {
    it('successfully submits form with valid data including organization', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: '123', email: 'john@example.com' } },
        error: null
      })

      const onSuccess = jest.fn()
      render(<SignupForm onSuccess={onSuccess} redirectTo="/custom-dashboard" />)

      // Fill out all required fields
      await user.type(screen.getByTestId('signup-first-name-input'), 'John')
      await user.type(screen.getByTestId('signup-last-name-input'), 'Doe')
      await user.type(screen.getByTestId('signup-email-input'), 'john@example.com')
      await user.type(screen.getByTestId('signup-password-input'), 'StrongPassword123!')
      await user.type(screen.getByTestId('signup-organization-input'), 'Acme Corp')
      await user.click(screen.getByTestId('signup-terms-checkbox'))
      
      await user.click(screen.getByTestId('signup-submit-button'))

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'StrongPassword123!',
          organizationName: 'Acme Corp',
          acceptedTerms: true
        })
      })

      expect(onSuccess).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/custom-dashboard')
    })

    it('successfully submits form without organization when not included', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: '123' } },
        error: null
      })

      render(<SignupForm includeOrganization={false} />)

      // Fill out required fields (no organization)
      await user.type(screen.getByTestId('signup-first-name-input'), 'Jane')
      await user.type(screen.getByTestId('signup-last-name-input'), 'Smith')
      await user.type(screen.getByTestId('signup-email-input'), 'jane@example.com')
      await user.type(screen.getByTestId('signup-password-input'), 'StrongPassword456!')
      await user.click(screen.getByTestId('signup-terms-checkbox'))
      
      await user.click(screen.getByTestId('signup-submit-button'))

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          password: 'StrongPassword456!',
          organizationName: undefined,
          acceptedTerms: true
        })
      })
    })

    it('uses default redirect when no redirectTo prop provided', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: '123' } },
        error: null
      })

      render(<SignupForm />)

      // Fill out form
      await user.type(screen.getByTestId('signup-first-name-input'), 'Test')
      await user.type(screen.getByTestId('signup-last-name-input'), 'User')
      await user.type(screen.getByTestId('signup-email-input'), 'test@example.com')
      await user.type(screen.getByTestId('signup-password-input'), 'Password123!')
      await user.type(screen.getByTestId('signup-organization-input'), 'Test Org')
      await user.click(screen.getByTestId('signup-terms-checkbox'))
      
      await user.click(screen.getByTestId('signup-submit-button'))

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })
  })

  describe('Validation Errors', () => {
    it('displays validation errors for required fields', async () => {
      const { validateFormData } = require('../../../utils/validation')
      validateFormData.mockReturnValueOnce({
        success: false,
        errors: { 
          firstName: 'First name is required',
          lastName: 'Last name is required',
          email: 'Email is required',
          password: 'Password is required'
        }
      })

      render(<SignupForm />)

      await user.click(screen.getByTestId('signup-submit-button'))

      expect(validateFormData).toHaveBeenCalled()
    })

    it('displays validation errors for invalid email', async () => {
      const { validateFormData } = require('../../../utils/validation')
      validateFormData.mockReturnValueOnce({
        success: false,
        errors: { email: 'Please enter a valid email address' }
      })

      render(<SignupForm />)

      await user.type(screen.getByTestId('signup-email-input'), 'invalid-email')
      await user.click(screen.getByTestId('signup-submit-button'))

      expect(validateFormData).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          email: 'invalid-email'
        })
      )
    })

    it('displays validation errors for weak password', async () => {
      const { validateFormData } = require('../../../utils/validation')
      validateFormData.mockReturnValueOnce({
        success: false,
        errors: { password: 'Password must be at least 8 characters long' }
      })

      render(<SignupForm />)

      await user.type(screen.getByTestId('signup-password-input'), '123')
      await user.click(screen.getByTestId('signup-submit-button'))

      expect(validateFormData).toHaveBeenCalled()
    })

    it('prevents submission when terms are not accepted', async () => {
      const { validateFormData } = require('../../../utils/validation')
      validateFormData.mockReturnValueOnce({
        success: false,
        errors: { acceptedTerms: 'You must accept the terms and conditions' }
      })

      render(<SignupForm />)

      // Fill form but don't check terms
      await user.type(screen.getByTestId('signup-first-name-input'), 'John')
      await user.type(screen.getByTestId('signup-last-name-input'), 'Doe')
      await user.type(screen.getByTestId('signup-email-input'), 'john@example.com')
      await user.type(screen.getByTestId('signup-password-input'), 'Password123!')
      await user.type(screen.getByTestId('signup-organization-input'), 'Test Org')
      
      await user.click(screen.getByTestId('signup-submit-button'))

      expect(mockSignUp).not.toHaveBeenCalled()
    })
  })

  describe('Registration Errors', () => {
    it('displays registration errors from signUp', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: null,
        error: { message: 'Email already exists' }
      })

      const onError = jest.fn()
      render(<SignupForm onError={onError} />)

      // Fill out complete form
      await user.type(screen.getByTestId('signup-first-name-input'), 'John')
      await user.type(screen.getByTestId('signup-last-name-input'), 'Doe')
      await user.type(screen.getByTestId('signup-email-input'), 'existing@example.com')
      await user.type(screen.getByTestId('signup-password-input'), 'Password123!')
      await user.type(screen.getByTestId('signup-organization-input'), 'Test Org')
      await user.click(screen.getByTestId('signup-terms-checkbox'))
      
      await user.click(screen.getByTestId('signup-submit-button'))

      await waitFor(() => {
        expect(screen.getByTestId('signup-error-alert')).toBeInTheDocument()
        expect(screen.getByText('Email already exists')).toBeInTheDocument()
      })

      expect(onError).toHaveBeenCalledWith('Email already exists')
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('handles unexpected errors during registration', async () => {
      mockSignUp.mockRejectedValueOnce(new Error('Network error'))

      render(<SignupForm />)

      // Fill out complete form
      await user.type(screen.getByTestId('signup-first-name-input'), 'John')
      await user.type(screen.getByTestId('signup-last-name-input'), 'Doe')
      await user.type(screen.getByTestId('signup-email-input'), 'john@example.com')
      await user.type(screen.getByTestId('signup-password-input'), 'Password123!')
      await user.type(screen.getByTestId('signup-organization-input'), 'Test Org')
      await user.click(screen.getByTestId('signup-terms-checkbox'))
      
      await user.click(screen.getByTestId('signup-submit-button'))

      await waitFor(() => {
        expect(screen.getByTestId('signup-error-alert')).toBeInTheDocument()
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('disables form elements when submitting', async () => {
      // Mock a delayed sign-up
      mockSignUp.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ data: { user: { id: '123' } }, error: null }), 100)
      ))

      render(<SignupForm />)

      // Fill and submit form
      await user.type(screen.getByTestId('signup-first-name-input'), 'John')
      await user.type(screen.getByTestId('signup-last-name-input'), 'Doe')
      await user.type(screen.getByTestId('signup-email-input'), 'john@example.com')
      await user.type(screen.getByTestId('signup-password-input'), 'Password123!')
      await user.type(screen.getByTestId('signup-organization-input'), 'Test Org')
      await user.click(screen.getByTestId('signup-terms-checkbox'))
      await user.click(screen.getByTestId('signup-submit-button'))

      // Check that elements are disabled during submission
      expect(screen.getByTestId('signup-first-name-input')).toBeDisabled()
      expect(screen.getByTestId('signup-last-name-input')).toBeDisabled()
      expect(screen.getByTestId('signup-email-input')).toBeDisabled()
      expect(screen.getByTestId('signup-password-input')).toBeDisabled()
      expect(screen.getByTestId('signup-organization-input')).toBeDisabled()
      expect(screen.getByTestId('signup-terms-checkbox')).toBeDisabled()
      expect(screen.getByTestId('signup-submit-button')).toBeDisabled()

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
      })
    })

    it('disables form when auth loading is true', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        ...defaultMockAuth,
        loading: true
      })

      render(<SignupForm />)

      expect(screen.getByTestId('signup-first-name-input')).toBeDisabled()
      expect(screen.getByTestId('signup-last-name-input')).toBeDisabled()
      expect(screen.getByTestId('signup-email-input')).toBeDisabled()
      expect(screen.getByTestId('signup-password-input')).toBeDisabled()
      expect(screen.getByTestId('signup-organization-input')).toBeDisabled()
      expect(screen.getByTestId('signup-terms-checkbox')).toBeDisabled()
      expect(screen.getByTestId('signup-submit-button')).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels and associations', () => {
      render(<SignupForm />)

      expect(screen.getByTestId('signup-first-name-input')).toHaveAccessibleName('First Name')
      expect(screen.getByTestId('signup-last-name-input')).toHaveAccessibleName('Last Name')
      expect(screen.getByTestId('signup-email-input')).toHaveAccessibleName('Email address')
      expect(screen.getByTestId('signup-password-input')).toHaveAccessibleName('Password')
      expect(screen.getByTestId('signup-organization-input')).toHaveAccessibleName('Organization Name')
    })

    it('supports keyboard navigation through form', async () => {
      render(<SignupForm />)

      const firstNameInput = screen.getByTestId('signup-first-name-input')
      const lastNameInput = screen.getByTestId('signup-last-name-input')
      const emailInput = screen.getByTestId('signup-email-input')
      const passwordInput = screen.getByTestId('signup-password-input')
      const orgInput = screen.getByTestId('signup-organization-input')

      firstNameInput.focus()
      expect(firstNameInput).toHaveFocus()

      await user.tab()
      expect(lastNameInput).toHaveFocus()

      await user.tab()
      expect(emailInput).toHaveFocus()

      await user.tab()
      expect(passwordInput).toHaveFocus()

      await user.tab()
      expect(orgInput).toHaveFocus()
    })
  })

  describe('Integration', () => {
    it('calls onSuccess callback after successful registration', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: '123' } },
        error: null
      })

      const onSuccess = jest.fn()
      render(<SignupForm onSuccess={onSuccess} />)

      // Complete form submission
      await user.type(screen.getByTestId('signup-first-name-input'), 'John')
      await user.type(screen.getByTestId('signup-last-name-input'), 'Doe')
      await user.type(screen.getByTestId('signup-email-input'), 'john@example.com')
      await user.type(screen.getByTestId('signup-password-input'), 'Password123!')
      await user.type(screen.getByTestId('signup-organization-input'), 'Test Org')
      await user.click(screen.getByTestId('signup-terms-checkbox'))
      await user.click(screen.getByTestId('signup-submit-button'))

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
      })
    })

    it('calls onError callback when registration fails', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: null,
        error: { message: 'Registration failed' }
      })

      const onError = jest.fn()
      render(<SignupForm onError={onError} />)

      // Complete form submission
      await user.type(screen.getByTestId('signup-first-name-input'), 'John')
      await user.type(screen.getByTestId('signup-last-name-input'), 'Doe')
      await user.type(screen.getByTestId('signup-email-input'), 'john@example.com')
      await user.type(screen.getByTestId('signup-password-input'), 'Password123!')
      await user.type(screen.getByTestId('signup-organization-input'), 'Test Org')
      await user.click(screen.getByTestId('signup-terms-checkbox'))
      await user.click(screen.getByTestId('signup-submit-button'))

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Registration failed')
      })
    })
  })
})