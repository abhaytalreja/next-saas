import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EnhancedProfileForm } from '../EnhancedProfileForm'
import type { ProfileFormData, ProfileCompleteness } from '../../../types/user'

// Mock the UI components
jest.mock('@nextsaas/ui', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Input: ({ value, onChange, ...props }: any) => (
    <input 
      value={value || ''} 
      onChange={(e) => onChange?.(e)} 
      {...props} 
    />
  ),
  Alert: ({ children, type, onClose }: any) => (
    <div data-testid={`alert-${type}`} onClick={onClose}>{children}</div>
  ),
}))

// Mock react-hook-form
const mockUseForm = {
  register: jest.fn((name: string) => ({ name, onChange: jest.fn(), onBlur: jest.fn() })),
  handleSubmit: jest.fn((fn) => (e: any) => {
    e.preventDefault()
    fn({})
  }),
  watch: jest.fn(() => ({})),
  setValue: jest.fn(),
  reset: jest.fn(),
  formState: {
    errors: {},
    isDirty: false,
    isValid: true,
  },
}

jest.mock('react-hook-form', () => ({
  useForm: () => mockUseForm,
}))

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  UserIcon: () => <div data-testid="user-icon" />,
  PhotoIcon: () => <div data-testid="photo-icon" />,
  CheckCircleIcon: () => <div data-testid="check-circle-icon" />,
  ExclamationTriangleIcon: () => <div data-testid="exclamation-triangle-icon" />,
}))

const mockProfileData: ProfileFormData = {
  first_name: 'John',
  last_name: 'Doe',
  display_name: 'johndoe',
  bio: 'Software engineer',
  phone_number: '+1234567890',
  company: 'Acme Corp',
  job_title: 'Developer',
  location: 'San Francisco',
  timezone: 'America/Los_Angeles'
}

const mockCompleteness: ProfileCompleteness = {
  percentage: 80,
  score: 8,
  total_fields: 10,
  completed_fields: 8,
  missing_fields: ['bio', 'phone_number'],
  suggestions: ['Add a bio', 'Add phone number']
}

describe('EnhancedProfileForm', () => {
  const defaultProps = {
    onSave: jest.fn(),
    onSuccess: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders form with all sections', () => {
      render(<EnhancedProfileForm {...defaultProps} />)

      expect(screen.getByText('Basic Information')).toBeInTheDocument()
      expect(screen.getByText('Contact Information')).toBeInTheDocument()
      expect(screen.getByText('Professional Information')).toBeInTheDocument()
      expect(screen.getByText('Location & Preferences')).toBeInTheDocument()
    })

    it('renders avatar upload section', () => {
      render(<EnhancedProfileForm {...defaultProps} />)

      expect(screen.getByText('Profile Picture')).toBeInTheDocument()
      expect(screen.getByText('Upload Photo')).toBeInTheDocument()
    })

    it('shows profile completeness when provided', () => {
      render(
        <EnhancedProfileForm 
          {...defaultProps} 
          completeness={mockCompleteness}
        />
      )

      expect(screen.getByText('Profile Completeness')).toBeInTheDocument()
      expect(screen.getByText('80%')).toBeInTheDocument()
      expect(screen.getByText('8 of 10 fields completed')).toBeInTheDocument()
    })

    it('displays completeness suggestions', () => {
      render(
        <EnhancedProfileForm 
          {...defaultProps} 
          completeness={mockCompleteness}
        />
      )

      expect(screen.getByText('Add a bio')).toBeInTheDocument()
      expect(screen.getByText('Add phone number')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <EnhancedProfileForm 
          {...defaultProps} 
          className="custom-class"
        />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('Initial Data', () => {
    it('populates form with initial profile data', () => {
      render(
        <EnhancedProfileForm 
          {...defaultProps} 
          initialProfile={mockProfileData}
        />
      )

      expect(mockUseForm.reset).toHaveBeenCalledWith(
        expect.objectContaining(mockProfileData)
      )
    })

    it('handles missing initial data gracefully', () => {
      render(<EnhancedProfileForm {...defaultProps} />)

      expect(mockUseForm.reset).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: '',
          last_name: '',
          display_name: '',
        })
      )
    })
  })

  describe('Form Submission', () => {
    it('calls onSave when form is submitted', async () => {
      const mockOnSave = jest.fn().mockResolvedValue({ success: true })
      
      render(
        <EnhancedProfileForm 
          {...defaultProps} 
          onSave={mockOnSave}
        />
      )

      const submitButton = screen.getByText('Save Profile')
      await userEvent.click(submitButton)

      expect(mockOnSave).toHaveBeenCalled()
    })

    it('shows loading state during submission', async () => {
      const mockOnSave = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      render(
        <EnhancedProfileForm 
          {...defaultProps} 
          onSave={mockOnSave}
        />
      )

      const submitButton = screen.getByText('Save Profile')
      await userEvent.click(submitButton)

      expect(submitButton).toBeDisabled()
    })

    it('calls onSuccess after successful submission', async () => {
      const mockOnSave = jest.fn().mockResolvedValue({ success: true })
      const mockOnSuccess = jest.fn()
      
      render(
        <EnhancedProfileForm 
          {...defaultProps} 
          onSave={mockOnSave}
          onSuccess={mockOnSuccess}
        />
      )

      const submitButton = screen.getByText('Save Profile')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })

    it('shows success message after successful submission', async () => {
      const mockOnSave = jest.fn().mockResolvedValue({ success: true })
      
      render(
        <EnhancedProfileForm 
          {...defaultProps} 
          onSave={mockOnSave}
        />
      )

      const submitButton = screen.getByText('Save Profile')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('alert-success')).toBeInTheDocument()
      })
    })

    it('shows error message when submission fails', async () => {
      const mockOnSave = jest.fn().mockResolvedValue({ 
        success: false, 
        error: 'Save failed' 
      })
      
      render(
        <EnhancedProfileForm 
          {...defaultProps} 
          onSave={mockOnSave}
        />
      )

      const submitButton = screen.getByText('Save Profile')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('alert-error')).toBeInTheDocument()
        expect(screen.getByText('Save failed')).toBeInTheDocument()
      })
    })

    it('handles submission exceptions', async () => {
      const mockOnSave = jest.fn().mockRejectedValue(new Error('Network error'))
      
      render(
        <EnhancedProfileForm 
          {...defaultProps} 
          onSave={mockOnSave}
        />
      )

      const submitButton = screen.getByText('Save Profile')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('alert-error')).toBeInTheDocument()
        expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
      })
    })
  })

  describe('Avatar Upload', () => {
    it('shows current avatar when provided', () => {
      render(
        <EnhancedProfileForm 
          {...defaultProps} 
          initialProfile={{
            ...mockProfileData,
            avatar_url: 'https://example.com/avatar.jpg'
          }}
        />
      )

      const avatarImg = screen.getByAltText('Current avatar')
      expect(avatarImg).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })

    it('shows placeholder when no avatar', () => {
      render(<EnhancedProfileForm {...defaultProps} />)

      expect(screen.getByTestId('user-icon')).toBeInTheDocument()
      expect(screen.queryByAltText('Current avatar')).not.toBeInTheDocument()
    })

    it('handles avatar file selection', async () => {
      const mockOnAvatarUpload = jest.fn().mockResolvedValue({ 
        success: true,
        data: { url: 'https://example.com/new-avatar.jpg' }
      })
      
      render(
        <EnhancedProfileForm 
          {...defaultProps} 
          onAvatarUpload={mockOnAvatarUpload}
        />
      )

      const fileInput = screen.getByLabelText(/upload photo/i)
      const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })

      await userEvent.upload(fileInput, file)

      expect(mockOnAvatarUpload).toHaveBeenCalledWith(file)
    })

    it('shows avatar upload progress', async () => {
      const mockOnAvatarUpload = jest.fn(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )
      
      render(
        <EnhancedProfileForm 
          {...defaultProps} 
          onAvatarUpload={mockOnAvatarUpload}
        />
      )

      const fileInput = screen.getByLabelText(/upload photo/i)
      const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })

      await userEvent.upload(fileInput, file)

      expect(screen.getByText('Uploading...')).toBeInTheDocument()
    })

    it('handles avatar upload errors', async () => {
      const mockOnAvatarUpload = jest.fn().mockResolvedValue({ 
        success: false,
        error: 'Upload failed'
      })
      
      render(
        <EnhancedProfileForm 
          {...defaultProps} 
          onAvatarUpload={mockOnAvatarUpload}
        />
      )

      const fileInput = screen.getByLabelText(/upload photo/i)
      const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })

      await userEvent.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByTestId('alert-error')).toBeInTheDocument()
        expect(screen.getByText('Upload failed')).toBeInTheDocument()
      })
    })
  })

  describe('Form Validation', () => {
    it('shows validation errors from form state', () => {
      mockUseForm.formState.errors = {
        first_name: { message: 'First name is required' },
        email: { message: 'Invalid email format' }
      }

      render(<EnhancedProfileForm {...defaultProps} />)

      expect(screen.getByText('First name is required')).toBeInTheDocument()
      expect(screen.getByText('Invalid email format')).toBeInTheDocument()
    })

    it('disables submit button when form is invalid', () => {
      mockUseForm.formState.isValid = false

      render(<EnhancedProfileForm {...defaultProps} />)

      const submitButton = screen.getByText('Save Profile')
      expect(submitButton).toBeDisabled()
    })

    it('enables submit button when form is dirty and valid', () => {
      mockUseForm.formState.isDirty = true
      mockUseForm.formState.isValid = true

      render(<EnhancedProfileForm {...defaultProps} />)

      const submitButton = screen.getByText('Save Profile')
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('has proper form structure', () => {
      render(<EnhancedProfileForm {...defaultProps} />)

      const form = screen.getByRole('form', { name: /profile form/i })
      expect(form).toBeInTheDocument()
    })

    it('associates labels with inputs', () => {
      render(<EnhancedProfileForm {...defaultProps} />)

      expect(screen.getByLabelText('First Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Display Name')).toBeInTheDocument()
    })

    it('has descriptive headings', () => {
      render(<EnhancedProfileForm {...defaultProps} />)

      expect(screen.getByRole('heading', { name: 'Basic Information' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Contact Information' })).toBeInTheDocument()
    })

    it('provides error announcements', async () => {
      const mockOnSave = jest.fn().mockResolvedValue({ 
        success: false, 
        error: 'Save failed' 
      })
      
      render(
        <EnhancedProfileForm 
          {...defaultProps} 
          onSave={mockOnSave}
        />
      )

      const submitButton = screen.getByText('Save Profile')
      await userEvent.click(submitButton)

      await waitFor(() => {
        const errorAlert = screen.getByTestId('alert-error')
        expect(errorAlert).toHaveAttribute('role', 'alert')
      })
    })
  })

  describe('Responsive Design', () => {
    it('renders mobile-friendly layout', () => {
      render(<EnhancedProfileForm {...defaultProps} />)

      // Check for responsive grid classes
      const form = screen.getByRole('form')
      expect(form.querySelector('.grid')).toBeInTheDocument()
      expect(form.querySelector('.sm\\:grid-cols-2')).toBeInTheDocument()
    })
  })

  describe('Alert Dismissal', () => {
    it('allows dismissing error alerts', async () => {
      const mockOnSave = jest.fn().mockResolvedValue({ 
        success: false, 
        error: 'Save failed' 
      })
      
      render(
        <EnhancedProfileForm 
          {...defaultProps} 
          onSave={mockOnSave}
        />
      )

      const submitButton = screen.getByText('Save Profile')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('alert-error')).toBeInTheDocument()
      })

      const errorAlert = screen.getByTestId('alert-error')
      await userEvent.click(errorAlert)

      expect(screen.queryByTestId('alert-error')).not.toBeInTheDocument()
    })

    it('auto-dismisses success alerts', async () => {
      jest.useFakeTimers()
      
      const mockOnSave = jest.fn().mockResolvedValue({ success: true })
      
      render(
        <EnhancedProfileForm 
          {...defaultProps} 
          onSave={mockOnSave}
        />
      )

      const submitButton = screen.getByText('Save Profile')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('alert-success')).toBeInTheDocument()
      })

      // Fast-forward time
      jest.advanceTimersByTime(3000)

      await waitFor(() => {
        expect(screen.queryByTestId('alert-success')).not.toBeInTheDocument()
      })

      jest.useRealTimers()
    })
  })
})