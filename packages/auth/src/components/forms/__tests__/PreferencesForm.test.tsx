import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PreferencesForm } from '../PreferencesForm'
import type { UserPreferences, UserPreferencesData } from '../../../types/user'

// Mock the UI components
jest.mock('@nextsaas/ui', () => ({
  Button: ({ children, loading, disabled, ...props }: any) => (
    <button disabled={disabled || loading} {...props}>
      {loading ? 'Loading...' : children}
    </button>
  ),
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

jest.mock('@nextsaas/ui', () => ({
  ...jest.requireActual('@nextsaas/ui'),
  Switch: ({ checked, onChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
      data-testid="switch"
      {...props}
    />
  ),
}))

// Mock react-hook-form
const mockFormData: UserPreferencesData = {
  theme: 'system',
  language: 'en',
  date_format: 'MM/dd/yyyy',
  time_format: '12h',
  email_notifications_enabled: true,
  email_frequency: 'immediate',
  email_digest: true,
  notify_security_alerts: true,
  notify_account_updates: true,
  notify_organization_updates: true,
  notify_project_updates: true,
  notify_mentions: true,
  notify_comments: true,
  notify_invitations: true,
  notify_billing_alerts: true,
  notify_feature_announcements: false,
  browser_notifications_enabled: false,
  desktop_notifications_enabled: false,
  mobile_notifications_enabled: false,
  marketing_emails: false,
  product_updates: true,
  newsletters: false,
  surveys: false,
  profile_visibility: 'organization',
  email_visibility: 'organization',
  activity_visibility: 'organization',
  hide_last_seen: false,
  hide_activity_status: false,
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
  timezone_aware: true,
  reduce_motion: false,
  high_contrast: false,
  screen_reader_optimized: false,
  data_retention_period: 365,
  auto_delete_inactive: false,
}

const mockUseForm = {
  register: jest.fn((name: string) => ({ 
    name, 
    onChange: jest.fn(), 
    onBlur: jest.fn(),
    ref: jest.fn()
  })),
  handleSubmit: jest.fn((fn) => (e: any) => {
    e.preventDefault()
    fn(mockFormData)
  }),
  watch: jest.fn(() => mockFormData),
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
  BellIcon: () => <div data-testid="bell-icon" />,
  EyeIcon: () => <div data-testid="eye-icon" />,
  PaintBrushIcon: () => <div data-testid="paint-brush-icon" />,
  GlobeAltIcon: () => <div data-testid="globe-alt-icon" />,
  ShieldCheckIcon: () => <div data-testid="shield-check-icon" />,
  ExclamationTriangleIcon: () => <div data-testid="exclamation-triangle-icon" />,
}))

const mockPreferences: Partial<UserPreferences> = {
  id: 'pref-123',
  user_id: 'user-123',
  theme: 'dark',
  language: 'en',
  email_notifications_enabled: true,
  profile_visibility: 'organization',
}

describe('PreferencesForm', () => {
  const defaultProps = {
    onSave: jest.fn(),
    onSuccess: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders all preference sections', () => {
      render(<PreferencesForm {...defaultProps} />)

      expect(screen.getByText('Theme & Display')).toBeInTheDocument()
      expect(screen.getByText('Notifications')).toBeInTheDocument()
      expect(screen.getByText('Privacy')).toBeInTheDocument()
      expect(screen.getByText('Accessibility')).toBeInTheDocument()
      expect(screen.getByText('Data & Storage')).toBeInTheDocument()
    })

    it('renders navigation sidebar', () => {
      render(<PreferencesForm {...defaultProps} />)

      const themeButton = screen.getByRole('button', { name: /theme & display/i })
      const notificationsButton = screen.getByRole('button', { name: /notifications/i })
      
      expect(themeButton).toBeInTheDocument()
      expect(notificationsButton).toBeInTheDocument()
    })

    it('defaults to theme section', () => {
      render(<PreferencesForm {...defaultProps} />)

      expect(screen.getByText('Theme')).toBeInTheDocument()
      expect(screen.getByText('Language')).toBeInTheDocument()
      expect(screen.getByText('Date Format')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <PreferencesForm {...defaultProps} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('Section Navigation', () => {
    it('switches to notifications section when clicked', async () => {
      render(<PreferencesForm {...defaultProps} />)

      const notificationsButton = screen.getByRole('button', { name: /notifications/i })
      await userEvent.click(notificationsButton)

      expect(screen.getByText('Email Notifications')).toBeInTheDocument()
      expect(screen.getByText('Enable email notifications')).toBeInTheDocument()
    })

    it('switches to privacy section when clicked', async () => {
      render(<PreferencesForm {...defaultProps} />)

      const privacyButton = screen.getByRole('button', { name: /privacy/i })
      await userEvent.click(privacyButton)

      expect(screen.getByText('Profile Visibility')).toBeInTheDocument()
      expect(screen.getByText('Who can see your profile')).toBeInTheDocument()
    })

    it('switches to accessibility section when clicked', async () => {
      render(<PreferencesForm {...defaultProps} />)

      const accessibilityButton = screen.getByRole('button', { name: /accessibility/i })
      await userEvent.click(accessibilityButton)

      expect(screen.getByText('Reduce motion')).toBeInTheDocument()
      expect(screen.getByText('High contrast')).toBeInTheDocument()
    })

    it('switches to data section when clicked', async () => {
      render(<PreferencesForm {...defaultProps} />)

      const dataButton = screen.getByRole('button', { name: /data & storage/i })
      await userEvent.click(dataButton)

      expect(screen.getByText('Data retention period (days)')).toBeInTheDocument()
      expect(screen.getByText('Auto-delete inactive data')).toBeInTheDocument()
    })

    it('highlights active section', async () => {
      render(<PreferencesForm {...defaultProps} />)

      const notificationsButton = screen.getByRole('button', { name: /notifications/i })
      await userEvent.click(notificationsButton)

      expect(notificationsButton).toHaveAttribute('aria-current', 'page')
    })
  })

  describe('Initial Data', () => {
    it('populates form with initial preferences', () => {
      render(
        <PreferencesForm 
          {...defaultProps} 
          initialPreferences={mockPreferences}
        />
      )

      expect(mockUseForm.reset).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: 'system',
          language: 'en',
          ...mockPreferences,
        })
      )
    })

    it('uses default values when no initial preferences', () => {
      render(<PreferencesForm {...defaultProps} />)

      expect(mockUseForm.reset).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: 'system',
          language: 'en',
          email_notifications_enabled: true,
        })
      )
    })
  })

  describe('Theme & Display Section', () => {
    it('renders theme selection options', () => {
      render(<PreferencesForm {...defaultProps} />)

      const themeSelect = screen.getByDisplayValue('System (Auto)')
      expect(themeSelect).toBeInTheDocument()
      
      expect(screen.getByDisplayValue('Light')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Dark')).toBeInTheDocument()
    })

    it('renders language selection options', () => {
      render(<PreferencesForm {...defaultProps} />)

      const languageSelect = screen.getByDisplayValue('English')
      expect(languageSelect).toBeInTheDocument()
    })

    it('renders date and time format options', () => {
      render(<PreferencesForm {...defaultProps} />)

      expect(screen.getByDisplayValue('MM/DD/YYYY (US)')).toBeInTheDocument()
      expect(screen.getByDisplayValue('12 Hour (AM/PM)')).toBeInTheDocument()
    })
  })

  describe('Notifications Section', () => {
    beforeEach(async () => {
      render(<PreferencesForm {...defaultProps} />)
      const notificationsButton = screen.getByRole('button', { name: /notifications/i })
      await userEvent.click(notificationsButton)
    })

    it('renders email notification toggle', () => {
      expect(screen.getByText('Enable email notifications')).toBeInTheDocument()
      expect(screen.getByTestId('switch')).toBeInTheDocument()
    })

    it('renders email frequency options when notifications enabled', () => {
      expect(screen.getByText('Email Frequency')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Immediate')).toBeInTheDocument()
    })

    it('renders notification type options', () => {
      expect(screen.getByText('Security alerts')).toBeInTheDocument()
      expect(screen.getByText('Account updates')).toBeInTheDocument()
      expect(screen.getByText('Organization updates')).toBeInTheDocument()
    })

    it('renders marketing communication options', () => {
      expect(screen.getByText('Marketing Communications')).toBeInTheDocument()
      expect(screen.getByText('Marketing emails')).toBeInTheDocument()
      expect(screen.getByText('Product updates')).toBeInTheDocument()
    })

    it('renders quiet hours configuration', () => {
      expect(screen.getByText('Quiet Hours')).toBeInTheDocument()
      expect(screen.getByText('Enable quiet hours')).toBeInTheDocument()
    })
  })

  describe('Privacy Section', () => {
    beforeEach(async () => {
      render(<PreferencesForm {...defaultProps} />)
      const privacyButton = screen.getByRole('button', { name: /privacy/i })
      await userEvent.click(privacyButton)
    })

    it('renders visibility settings', () => {
      expect(screen.getByText('Who can see your profile')).toBeInTheDocument()
      expect(screen.getByText('Who can see your email')).toBeInTheDocument()
      expect(screen.getByText('Who can see your activity')).toBeInTheDocument()
    })

    it('renders activity privacy toggles', () => {
      expect(screen.getByText('Hide last seen')).toBeInTheDocument()
      expect(screen.getByText('Hide activity status')).toBeInTheDocument()
    })

    it('provides visibility options', () => {
      const profileVisibilitySelect = screen.getByDisplayValue('Organization members only')
      expect(profileVisibilitySelect).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('calls onSave when form is submitted', async () => {
      const mockOnSave = jest.fn().mockResolvedValue({ success: true })
      
      render(
        <PreferencesForm 
          {...defaultProps} 
          onSave={mockOnSave}
        />
      )

      const submitButton = screen.getByText('Save Preferences')
      await userEvent.click(submitButton)

      expect(mockOnSave).toHaveBeenCalledWith(mockFormData)
    })

    it('shows loading state during submission', async () => {
      const mockOnSave = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      render(
        <PreferencesForm 
          {...defaultProps} 
          onSave={mockOnSave}
        />
      )

      const submitButton = screen.getByText('Save Preferences')
      await userEvent.click(submitButton)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('calls onSuccess after successful submission', async () => {
      const mockOnSave = jest.fn().mockResolvedValue({ success: true })
      const mockOnSuccess = jest.fn()
      
      render(
        <PreferencesForm 
          {...defaultProps} 
          onSave={mockOnSave}
          onSuccess={mockOnSuccess}
        />
      )

      const submitButton = screen.getByText('Save Preferences')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })

    it('shows success message after successful submission', async () => {
      const mockOnSave = jest.fn().mockResolvedValue({ success: true })
      
      render(
        <PreferencesForm 
          {...defaultProps} 
          onSave={mockOnSave}
        />
      )

      const submitButton = screen.getByText('Save Preferences')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('alert-success')).toBeInTheDocument()
        expect(screen.getByText('Preferences updated successfully!')).toBeInTheDocument()
      })
    })

    it('shows error message when submission fails', async () => {
      const mockOnSave = jest.fn().mockResolvedValue({ 
        success: false, 
        error: 'Update failed' 
      })
      
      render(
        <PreferencesForm 
          {...defaultProps} 
          onSave={mockOnSave}
        />
      )

      const submitButton = screen.getByText('Save Preferences')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('alert-error')).toBeInTheDocument()
        expect(screen.getByText('Update failed')).toBeInTheDocument()
      })
    })

    it('handles submission exceptions', async () => {
      const mockOnSave = jest.fn().mockRejectedValue(new Error('Network error'))
      
      render(
        <PreferencesForm 
          {...defaultProps} 
          onSave={mockOnSave}
        />
      )

      const submitButton = screen.getByText('Save Preferences')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('alert-error')).toBeInTheDocument()
        expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
      })
    })

    it('disables submit when form is not dirty', () => {
      mockUseForm.formState.isDirty = false
      
      render(<PreferencesForm {...defaultProps} />)

      const submitButton = screen.getByText('Save Preferences')
      expect(submitButton).toBeDisabled()
    })

    it('enables submit when form is dirty', () => {
      mockUseForm.formState.isDirty = true
      
      render(<PreferencesForm {...defaultProps} />)

      const submitButton = screen.getByText('Save Preferences')
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('Switch Interactions', () => {
    it('calls setValue when switch is toggled', async () => {
      render(<PreferencesForm {...defaultProps} />)

      // Go to notifications section
      const notificationsButton = screen.getByRole('button', { name: /notifications/i })
      await userEvent.click(notificationsButton)

      const switches = screen.getAllByTestId('switch')
      const emailNotificationSwitch = switches[0]
      
      await userEvent.click(emailNotificationSwitch)

      expect(mockUseForm.setValue).toHaveBeenCalledWith('email_notifications_enabled', expect.any(Boolean))
    })
  })

  describe('Conditional Fields', () => {
    it('shows email frequency when notifications are enabled', async () => {
      // Mock form data with notifications enabled
      mockUseForm.watch.mockReturnValue({
        ...mockFormData,
        email_notifications_enabled: true
      })

      render(<PreferencesForm {...defaultProps} />)

      const notificationsButton = screen.getByRole('button', { name: /notifications/i })
      await userEvent.click(notificationsButton)

      expect(screen.getByText('Email Frequency')).toBeInTheDocument()
      expect(screen.getByText('Send email digest summary')).toBeInTheDocument()
    })

    it('shows quiet hours times when quiet hours enabled', async () => {
      mockUseForm.watch.mockReturnValue({
        ...mockFormData,
        quiet_hours_enabled: true
      })

      render(<PreferencesForm {...defaultProps} />)

      const notificationsButton = screen.getByRole('button', { name: /notifications/i })
      await userEvent.click(notificationsButton)

      expect(screen.getByText('Start Time')).toBeInTheDocument()
      expect(screen.getByText('End Time')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper navigation structure', () => {
      render(<PreferencesForm {...defaultProps} />)

      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
    })

    it('uses proper ARIA attributes for active section', async () => {
      render(<PreferencesForm {...defaultProps} />)

      const themeButton = screen.getByRole('button', { name: /theme & display/i })
      expect(themeButton).toHaveAttribute('aria-current', 'page')

      const notificationsButton = screen.getByRole('button', { name: /notifications/i })
      await userEvent.click(notificationsButton)

      expect(notificationsButton).toHaveAttribute('aria-current', 'page')
      expect(themeButton).not.toHaveAttribute('aria-current', 'page')
    })

    it('has descriptive section headings', () => {
      render(<PreferencesForm {...defaultProps} />)

      expect(screen.getByRole('heading', { name: 'Theme & Display' })).toBeInTheDocument()
    })

    it('associates form controls with labels', () => {
      render(<PreferencesForm {...defaultProps} />)

      expect(screen.getByLabelText('Theme')).toBeInTheDocument()
      expect(screen.getByLabelText('Language')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('displays form validation errors', () => {
      mockUseForm.formState.errors = {
        data_retention_period: { message: 'Must be between 30 and 2555 days' }
      }

      render(<PreferencesForm {...defaultProps} />)

      const dataButton = screen.getByRole('button', { name: /data & storage/i })
      fireEvent.click(dataButton)

      expect(screen.getByText('Must be between 30 and 2555 days')).toBeInTheDocument()
    })

    it('clears errors when alert is dismissed', async () => {
      const mockOnSave = jest.fn().mockResolvedValue({ 
        success: false, 
        error: 'Update failed' 
      })
      
      render(
        <PreferencesForm 
          {...defaultProps} 
          onSave={mockOnSave}
        />
      )

      const submitButton = screen.getByText('Save Preferences')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('alert-error')).toBeInTheDocument()
      })

      const errorAlert = screen.getByTestId('alert-error')
      await userEvent.click(errorAlert)

      expect(screen.queryByTestId('alert-error')).not.toBeInTheDocument()
    })

    it('auto-dismisses success messages', async () => {
      jest.useFakeTimers()
      
      const mockOnSave = jest.fn().mockResolvedValue({ success: true })
      
      render(
        <PreferencesForm 
          {...defaultProps} 
          onSave={mockOnSave}
        />
      )

      const submitButton = screen.getByText('Save Preferences')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('alert-success')).toBeInTheDocument()
      })

      jest.advanceTimersByTime(3000)

      await waitFor(() => {
        expect(screen.queryByTestId('alert-success')).not.toBeInTheDocument()
      })

      jest.useRealTimers()
    })
  })
})