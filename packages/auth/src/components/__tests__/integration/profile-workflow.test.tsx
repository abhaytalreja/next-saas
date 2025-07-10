import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EnhancedProfileForm } from '../../forms/EnhancedProfileForm'
import { PreferencesForm } from '../../forms/PreferencesForm'
import { ActivityDashboard } from '../../ui/ActivityDashboard'
import { useAuth } from '../../../hooks/useAuth'
import { useUserPreferences } from '../../../hooks/useUserPreferences'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Mock dependencies
jest.mock('../../../hooks/useAuth')
jest.mock('../../../hooks/useUserPreferences')
jest.mock('@supabase/auth-helpers-nextjs')

// Mock UI components
jest.mock('@nextsaas/ui', () => ({
  Button: ({ children, onClick, disabled, loading }: any) => (
    <button onClick={onClick} disabled={disabled || loading}>
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
  Switch: ({ checked, onChange }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
      data-testid="switch"
    />
  ),
}))

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  UserIcon: () => <div data-testid="user-icon" />,
  PhotoIcon: () => <div data-testid="photo-icon" />,
  CheckCircleIcon: () => <div data-testid="check-circle-icon" />,
  ExclamationTriangleIcon: () => <div data-testid="exclamation-triangle-icon" />,
  BellIcon: () => <div data-testid="bell-icon" />,
  EyeIcon: () => <div data-testid="eye-icon" />,
  PaintBrushIcon: () => <div data-testid="paint-brush-icon" />,
  GlobeAltIcon: () => <div data-testid="globe-alt-icon" />,
  ShieldCheckIcon: () => <div data-testid="shield-check-icon" />,
  ComputerDesktopIcon: () => <div data-testid="computer-desktop-icon" />,
  DevicePhoneMobileIcon: () => <div data-testid="device-phone-mobile-icon" />,
  ClockIcon: () => <div data-testid="clock-icon" />,
  MapPinIcon: () => <div data-testid="map-pin-icon" />,
  XCircleIcon: () => <div data-testid="x-circle-icon" />,
  KeyIcon: () => <div data-testid="key-icon" />,
}))

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00Z'
}

const mockProfile = {
  id: 'user-123',
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  display_name: 'johndoe',
  bio: 'Software engineer',
  avatar_url: null,
  phone_number: '+1234567890',
  company: 'Acme Corp',
  job_title: 'Developer',
  location: 'San Francisco',
  timezone: 'America/Los_Angeles',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

const mockPreferences = {
  id: 'pref-123',
  user_id: 'user-123',
  theme: 'dark',
  language: 'en',
  email_notifications_enabled: true,
  notify_security_alerts: true,
  profile_visibility: 'organization',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

const mockActivities = [
  {
    id: 'activity-1',
    user_id: 'user-123',
    action: 'login',
    description: 'User logged in',
    status: 'success',
    ip_address: '192.168.1.1',
    device_type: 'desktop',
    created_at: '2023-01-01T10:00:00Z'
  },
  {
    id: 'activity-2',
    user_id: 'user-123',
    action: 'profile_update',
    description: 'Updated profile information',
    status: 'success',
    ip_address: '192.168.1.1',
    device_type: 'mobile',
    created_at: '2023-01-01T09:00:00Z'
  }
]

const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: mockActivities, error: null })),
        })),
        single: jest.fn(() => Promise.resolve({ data: mockProfile, error: null })),
        is: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: null }))
    })),
    insert: jest.fn(() => Promise.resolve({ error: null }))
  }))
}

describe('Profile Management Integration Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    ;(useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false
    })
    
    ;(useUserPreferences as jest.Mock).mockReturnValue({
      preferences: mockPreferences,
      loading: false,
      error: null,
      updatePreferences: jest.fn().mockResolvedValue({ success: true }),
      resetPreferences: jest.fn().mockResolvedValue({ success: true }),
      refreshPreferences: jest.fn()
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
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    })
  })

  describe('Complete Profile Setup Workflow', () => {
    it('guides user through complete profile setup', async () => {
      const mockOnSave = jest.fn().mockResolvedValue({ success: true })
      const mockOnAvatarUpload = jest.fn().mockResolvedValue({
        success: true,
        data: { url: 'https://example.com/avatar.jpg' }
      })

      const { rerender } = render(
        <EnhancedProfileForm
          initialProfile={mockProfile}
          onSave={mockOnSave}
          onAvatarUpload={mockOnAvatarUpload}
          completeness={{
            percentage: 60,
            score: 6,
            total_fields: 10,
            completed_fields: 6,
            missing_fields: ['bio', 'avatar_url', 'phone_number', 'company'],
            suggestions: ['Add a bio', 'Upload profile picture', 'Add phone number']
          }}
        />
      )

      // Verify profile completeness is shown
      expect(screen.getByText('Profile Completeness')).toBeInTheDocument()
      expect(screen.getByText('60%')).toBeInTheDocument()
      expect(screen.getByText('6 of 10 fields completed')).toBeInTheDocument()

      // Verify suggestions are displayed
      expect(screen.getByText('Add a bio')).toBeInTheDocument()
      expect(screen.getByText('Upload profile picture')).toBeInTheDocument()

      // Step 1: Upload avatar
      const fileInput = screen.getByLabelText(/upload photo/i)
      const avatarFile = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })
      
      await userEvent.upload(fileInput, avatarFile)
      expect(mockOnAvatarUpload).toHaveBeenCalledWith(avatarFile)

      // Step 2: Fill in missing fields
      const bioInput = screen.getByLabelText('Bio')
      await userEvent.type(bioInput, 'Updated bio content')

      const phoneInput = screen.getByLabelText('Phone Number')
      await userEvent.type(phoneInput, '+1234567890')

      // Step 3: Save profile
      const saveButton = screen.getByText('Save Profile')
      await userEvent.click(saveButton)

      expect(mockOnSave).toHaveBeenCalledWith({
        first_name: 'John',
        last_name: 'Doe',
        display_name: 'johndoe',
        bio: 'Updated bio content',
        phone_number: '+1234567890',
        company: 'Acme Corp',
        job_title: 'Developer',
        location: 'San Francisco',
        timezone: 'America/Los_Angeles'
      })

      // Step 4: Verify success message
      await waitFor(() => {
        expect(screen.getByTestId('alert-success')).toBeInTheDocument()
      })

      // Step 5: Update profile completeness after save
      rerender(
        <EnhancedProfileForm
          initialProfile={{
            ...mockProfile,
            bio: 'Updated bio content',
            avatar_url: 'https://example.com/avatar.jpg'
          }}
          onSave={mockOnSave}
          onAvatarUpload={mockOnAvatarUpload}
          completeness={{
            percentage: 90,
            score: 9,
            total_fields: 10,
            completed_fields: 9,
            missing_fields: ['company'],
            suggestions: ['Add your company']
          }}
        />
      )

      expect(screen.getByText('90%')).toBeInTheDocument()
      expect(screen.getByText('9 of 10 fields completed')).toBeInTheDocument()
    })

    it('handles profile update errors gracefully', async () => {
      const mockOnSave = jest.fn().mockResolvedValue({
        success: false,
        error: 'Profile update failed'
      })

      render(
        <EnhancedProfileForm
          initialProfile={mockProfile}
          onSave={mockOnSave}
        />
      )

      const saveButton = screen.getByText('Save Profile')
      await userEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByTestId('alert-error')).toBeInTheDocument()
        expect(screen.getByText('Profile update failed')).toBeInTheDocument()
      })

      // User can dismiss error and try again
      const errorAlert = screen.getByTestId('alert-error')
      await userEvent.click(errorAlert)

      expect(screen.queryByTestId('alert-error')).not.toBeInTheDocument()
    })
  })

  describe('Preferences Management Workflow', () => {
    it('manages user preferences across all sections', async () => {
      const mockOnSave = jest.fn().mockResolvedValue({ success: true })
      const mockUpdatePreferences = jest.fn().mockResolvedValue({ success: true })

      ;(useUserPreferences as jest.Mock).mockReturnValue({
        preferences: mockPreferences,
        loading: false,
        error: null,
        updatePreferences: mockUpdatePreferences,
        resetPreferences: jest.fn(),
        refreshPreferences: jest.fn()
      })

      render(
        <PreferencesForm
          initialPreferences={mockPreferences}
          onSave={mockOnSave}
        />
      )

      // Step 1: Navigate through sections and update preferences
      
      // Theme & Display section (default)
      expect(screen.getByText('Theme & Display')).toBeInTheDocument()
      const themeSelect = screen.getByDisplayValue('Dark')
      fireEvent.change(themeSelect, { target: { value: 'light' } })

      // Navigate to Notifications section
      const notificationsTab = screen.getByRole('button', { name: /notifications/i })
      await userEvent.click(notificationsTab)

      expect(screen.getByText('Email Notifications')).toBeInTheDocument()
      const emailToggle = screen.getAllByTestId('switch')[0]
      await userEvent.click(emailToggle)

      // Navigate to Privacy section
      const privacyTab = screen.getByRole('button', { name: /privacy/i })
      await userEvent.click(privacyTab)

      expect(screen.getByText('Profile Visibility')).toBeInTheDocument()
      const visibilitySelect = screen.getByDisplayValue('Organization members only')
      fireEvent.change(visibilitySelect, { target: { value: 'private' } })

      // Step 2: Save preferences
      const saveButton = screen.getByText('Save Preferences')
      await userEvent.click(saveButton)

      expect(mockOnSave).toHaveBeenCalled()

      // Step 3: Verify success
      await waitFor(() => {
        expect(screen.getByTestId('alert-success')).toBeInTheDocument()
        expect(screen.getByText('Preferences updated successfully!')).toBeInTheDocument()
      })
    })

    it('validates preference dependencies and constraints', async () => {
      const mockOnSave = jest.fn().mockResolvedValue({ success: true })

      render(
        <PreferencesForm
          initialPreferences={{
            ...mockPreferences,
            email_notifications_enabled: false
          }}
          onSave={mockOnSave}
        />
      )

      // Navigate to notifications
      const notificationsTab = screen.getByRole('button', { name: /notifications/i })
      await userEvent.click(notificationsTab)

      // When email notifications are disabled, frequency options should be hidden
      expect(screen.queryByText('Email Frequency')).not.toBeInTheDocument()

      // Enable email notifications
      const emailToggle = screen.getAllByTestId('switch')[0]
      await userEvent.click(emailToggle)

      // Now frequency options should appear
      await waitFor(() => {
        expect(screen.getByText('Email Frequency')).toBeInTheDocument()
      })
    })

    it('handles preference validation errors', async () => {
      const mockOnSave = jest.fn().mockResolvedValue({
        success: false,
        error: 'Invalid preference data',
        errors: [
          { path: ['data_retention_period'], message: 'Must be between 30 and 2555 days' }
        ]
      })

      render(
        <PreferencesForm
          initialPreferences={mockPreferences}
          onSave={mockOnSave}
        />
      )

      // Navigate to data section
      const dataTab = screen.getByRole('button', { name: /data & storage/i })
      await userEvent.click(dataTab)

      // Try to save with invalid data
      const saveButton = screen.getByText('Save Preferences')
      await userEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByTestId('alert-error')).toBeInTheDocument()
        expect(screen.getByText('Invalid preference data')).toBeInTheDocument()
      })
    })
  })

  describe('Activity Monitoring Workflow', () => {
    it('displays and filters user activity correctly', async () => {
      render(<ActivityDashboard />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('User logged in')).toBeInTheDocument()
        expect(screen.getByText('Updated profile information')).toBeInTheDocument()
      })

      // Test tab navigation
      const sessionsTab = screen.getByText('Active Sessions')
      await userEvent.click(sessionsTab)

      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_sessions')
      })

      const securityTab = screen.getByText('Security Events')
      await userEvent.click(securityTab)

      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_activity')
      })

      // Test filtering
      const recentTab = screen.getByText('Recent Activity')
      await userEvent.click(recentTab)

      await waitFor(() => {
        const actionFilter = screen.getByDisplayValue('All actions')
        expect(actionFilter).toBeInTheDocument()
        
        fireEvent.change(actionFilter, { target: { value: 'login' } })
        // Should trigger new data fetch with filter
      })
    })

    it('handles activity dashboard errors gracefully', async () => {
      // Mock error response
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ 
                data: null, 
                error: { message: 'Failed to load activities' } 
              }))
            }))
          }))
        }))
      })

      render(<ActivityDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('exclamation-triangle-icon')).toBeInTheDocument()
        expect(screen.getByText('Failed to load data')).toBeInTheDocument()
      })
    })
  })

  describe('Cross-Component State Management', () => {
    it('coordinates state changes across profile components', async () => {
      const mockUpdatePreferences = jest.fn().mockImplementation((data) => {
        // Simulate preference update affecting theme
        if (data.theme) {
          document.documentElement.classList.toggle('dark', data.theme === 'dark')
        }
        return Promise.resolve({ success: true })
      })

      ;(useUserPreferences as jest.Mock).mockReturnValue({
        preferences: mockPreferences,
        loading: false,
        error: null,
        updatePreferences: mockUpdatePreferences,
        resetPreferences: jest.fn(),
        refreshPreferences: jest.fn()
      })

      const { rerender } = render(
        <PreferencesForm
          initialPreferences={mockPreferences}
          onSave={mockUpdatePreferences}
        />
      )

      // Change theme from dark to light
      const themeSelect = screen.getByDisplayValue('Dark')
      fireEvent.change(themeSelect, { target: { value: 'light' } })

      const saveButton = screen.getByText('Save Preferences')
      await userEvent.click(saveButton)

      expect(mockUpdatePreferences).toHaveBeenCalledWith(
        expect.objectContaining({ theme: 'light' })
      )

      // Simulate updated preferences state
      ;(useUserPreferences as jest.Mock).mockReturnValue({
        preferences: { ...mockPreferences, theme: 'light' },
        loading: false,
        error: null,
        updatePreferences: mockUpdatePreferences,
        resetPreferences: jest.fn(),
        refreshPreferences: jest.fn()
      })

      // Re-render with updated state
      rerender(
        <PreferencesForm
          initialPreferences={{ ...mockPreferences, theme: 'light' }}
          onSave={mockUpdatePreferences}
        />
      )

      // Verify theme is now light
      expect(screen.getByDisplayValue('Light')).toBeInTheDocument()
    })

    it('handles concurrent updates correctly', async () => {
      const mockOnSave = jest.fn().mockResolvedValue({ success: true })
      const mockUpdatePreferences = jest.fn().mockResolvedValue({ success: true })

      // Render both profile and preferences forms
      const { container } = render(
        <div>
          <EnhancedProfileForm
            initialProfile={mockProfile}
            onSave={mockOnSave}
          />
          <PreferencesForm
            initialPreferences={mockPreferences}
            onSave={mockUpdatePreferences}
          />
        </div>
      )

      // Try to save both forms simultaneously
      const profileSaveButton = screen.getByText('Save Profile')
      const preferencesSaveButton = screen.getByText('Save Preferences')

      await Promise.all([
        userEvent.click(profileSaveButton),
        userEvent.click(preferencesSaveButton)
      ])

      // Both should complete successfully
      expect(mockOnSave).toHaveBeenCalled()
      expect(mockUpdatePreferences).toHaveBeenCalled()

      await waitFor(() => {
        const successAlerts = screen.getAllByTestId('alert-success')
        expect(successAlerts.length).toBeGreaterThanOrEqual(1)
      })
    })
  })

  describe('Error Recovery and Resilience', () => {
    it('recovers from network errors', async () => {
      const mockOnSave = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ success: true })

      render(
        <EnhancedProfileForm
          initialProfile={mockProfile}
          onSave={mockOnSave}
        />
      )

      // First attempt fails
      const saveButton = screen.getByText('Save Profile')
      await userEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByTestId('alert-error')).toBeInTheDocument()
        expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
      })

      // Dismiss error
      const errorAlert = screen.getByTestId('alert-error')
      await userEvent.click(errorAlert)

      // Second attempt succeeds
      await userEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByTestId('alert-success')).toBeInTheDocument()
      })

      expect(mockOnSave).toHaveBeenCalledTimes(2)
    })

    it('handles partial failures gracefully', async () => {
      const mockOnSave = jest.fn().mockResolvedValue({
        success: false,
        error: 'Some fields could not be updated',
        partialSuccess: true,
        updatedFields: ['first_name', 'last_name'],
        failedFields: ['bio', 'company']
      })

      render(
        <EnhancedProfileForm
          initialProfile={mockProfile}
          onSave={mockOnSave}
        />
      )

      const saveButton = screen.getByText('Save Profile')
      await userEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByTestId('alert-error')).toBeInTheDocument()
        expect(screen.getByText('Some fields could not be updated')).toBeInTheDocument()
      })
    })
  })
})