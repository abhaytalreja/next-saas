import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { BasicProfileManager } from '../BasicProfileManager'

// Mock Supabase hooks
jest.mock('@supabase/auth-helpers-react')

// Mock child components
jest.mock('../forms/EnhancedProfileForm', () => ({
  EnhancedProfileForm: ({ profile, onUpdate, onRefresh }: any) => (
    <div data-testid="enhanced-profile-form">
      <div data-testid="profile-data">{JSON.stringify(profile)}</div>
      <button onClick={() => onUpdate({ name: 'Updated Name' })} data-testid="update-profile">
        Update Profile
      </button>
      <button onClick={onRefresh} data-testid="refresh-profile">
        Refresh
      </button>
    </div>
  )
}))

jest.mock('../forms/PreferencesForm', () => ({
  PreferencesForm: ({ preferences, onUpdate }: any) => (
    <div data-testid="preferences-form">
      <div data-testid="preferences-data">{JSON.stringify(preferences)}</div>
      <button onClick={() => onUpdate({ theme: 'dark' })} data-testid="update-preferences">
        Update Preferences
      </button>
    </div>
  )
}))

jest.mock('../ui/AvatarUpload', () => ({
  AvatarUpload: ({ userId, currentAvatarUrl, onAvatarUpdate }: any) => (
    <div data-testid="avatar-upload">
      <div data-testid="avatar-url">{currentAvatarUrl}</div>
      <button onClick={() => onAvatarUpdate('new-avatar-url')} data-testid="update-avatar">
        Update Avatar
      </button>
    </div>
  )
}))

jest.mock('../ui/ActivityDashboard', () => ({
  ActivityDashboard: ({ activities, userId, context }: any) => (
    <div data-testid="activity-dashboard" data-user-id={userId} data-context={context}>
      <div data-testid="activities-count">{activities?.length || 0}</div>
    </div>
  )
}))

jest.mock('../ui/DataExportManager', () => ({
  DataExportManager: ({ userId, context }: any) => (
    <div data-testid="data-export-manager" data-user-id={userId} data-context={context}>
      Data Export Manager
    </div>
  )
}))

jest.mock('../ui/AccountDeletionManager', () => ({
  AccountDeletionManager: ({ userId, context }: any) => (
    <div data-testid="account-deletion-manager" data-user-id={userId} data-context={context}>
      Account Deletion Manager
    </div>
  )
}))

// Mock Headless UI Tab
jest.mock('@headlessui/react', () => ({
  Tab: {
    Group: ({ children, selectedIndex, onChange }: any) => (
      <div data-testid="tab-group" data-selected-index={selectedIndex}>
        {React.cloneElement(children, { selectedIndex, onChange })}
      </div>
    ),
    List: ({ children }: any) => (
      <div data-testid="tab-list" role="tablist">
        {children}
      </div>
    ),
    Tab: ({ children, className, ...props }: any) => {
      const isSelected = className({ selected: true }).includes('bg-white')
      return (
        <button 
          role="tab" 
          data-testid="tab"
          className={isSelected ? 'selected' : 'unselected'}
          {...props}
        >
          {typeof children === 'function' ? children({ selected: isSelected }) : children}
        </button>
      )
    },
    Panels: ({ children }: any) => (
      <div data-testid="tab-panels">
        {children}
      </div>
    ),
    Panel: ({ children }: any) => (
      <div data-testid="tab-panel">
        {children}
      </div>
    )
  }
}))

// Mock heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  UserIcon: () => <svg data-testid="user-icon" />,
  ClockIcon: () => <svg data-testid="clock-icon" />,
  ArrowDownTrayIcon: () => <svg data-testid="download-icon" />,
  TrashIcon: () => <svg data-testid="trash-icon" />,
  CogIcon: () => <svg data-testid="cog-icon" />,
  PhotoIcon: () => <svg data-testid="photo-icon" />
}))

// Mock data
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  user_metadata: {},
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z'
}

const mockProfile = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  first_name: 'Test',
  last_name: 'User',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

const mockPreferences = {
  id: 'pref-123',
  user_id: 'user-123',
  theme: 'light',
  language: 'en',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

const mockActivities = [
  {
    id: 'activity-1',
    user_id: 'user-123',
    action: 'profile_update',
    created_at: '2024-01-01T12:00:00Z'
  },
  {
    id: 'activity-2',
    user_id: 'user-123',
    action: 'login',
    created_at: '2024-01-01T11:00:00Z'
  }
]

const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: mockActivities, error: null }))
        }))
      }))
    })),
    upsert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn()
      }))
    }))
  }))
}

describe('BasicProfileManager', () => {
  const mockUseUser = useUser as jest.MockedFunction<typeof useUser>
  const mockUseSupabaseClient = useSupabaseClient as jest.MockedFunction<typeof useSupabaseClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseUser.mockReturnValue(mockUser)
    mockUseSupabaseClient.mockReturnValue(mockSupabaseClient as any)
  })

  describe('Loading State', () => {
    it('shows loading skeleton while loading data', async () => {
      // Make the profile query hang
      mockSupabaseClient.from().select().eq().single.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      render(<BasicProfileManager />)

      expect(screen.getByText('Profile Settings')).not.toBeInTheDocument()
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('shows error message when profile loading fails', async () => {
      mockSupabaseClient.from().select().eq().single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error', code: 'ERROR' }
      })

      render(<BasicProfileManager />)

      await waitFor(() => {
        expect(screen.getByText('Error Loading Profile')).toBeInTheDocument()
        expect(screen.getByText('Failed to load profile data')).toBeInTheDocument()
        expect(screen.getByText('Retry')).toBeInTheDocument()
      })
    })

    it('allows retry when error occurs', async () => {
      // First call fails
      mockSupabaseClient.from().select().eq().single
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'Database error', code: 'ERROR' }
        })
        // Second call succeeds
        .mockResolvedValueOnce({
          data: mockProfile,
          error: null
        })

      render(<BasicProfileManager />)

      await waitFor(() => {
        expect(screen.getByText('Error Loading Profile')).toBeInTheDocument()
      })

      // Click retry button
      const retryButton = screen.getByText('Retry')
      fireEvent.click(retryButton)

      await waitFor(() => {
        expect(screen.getByText('Profile Settings')).toBeInTheDocument()
      })
    })
  })

  describe('Successful Data Loading', () => {
    beforeEach(() => {
      // Mock successful profile loading
      mockSupabaseClient.from().select().eq().single
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: mockPreferences, error: null })
        .mockResolvedValueOnce({ data: mockActivities, error: null })
    })

    it('renders profile manager with tabs', async () => {
      render(<BasicProfileManager />)

      await waitFor(() => {
        expect(screen.getByText('Profile Settings')).toBeInTheDocument()
        expect(screen.getByText('Manage your personal profile and account settings')).toBeInTheDocument()
      })

      // Check that tabs are rendered
      expect(screen.getByTestId('tab-list')).toBeInTheDocument()
      expect(screen.getAllByTestId('tab')).toHaveLength(6)
    })

    it('renders all tab panels', async () => {
      render(<BasicProfileManager />)

      await waitFor(() => {
        expect(screen.getByTestId('enhanced-profile-form')).toBeInTheDocument()
        expect(screen.getByTestId('avatar-upload')).toBeInTheDocument()
        expect(screen.getByTestId('preferences-form')).toBeInTheDocument()
        expect(screen.getByTestId('activity-dashboard')).toBeInTheDocument()
        expect(screen.getByTestId('data-export-manager')).toBeInTheDocument()
        expect(screen.getByTestId('account-deletion-manager')).toBeInTheDocument()
      })
    })

    it('passes correct props to child components', async () => {
      render(<BasicProfileManager />)

      await waitFor(() => {
        // Check profile form props
        const profileData = screen.getByTestId('profile-data')
        expect(JSON.parse(profileData.textContent || '{}')).toEqual(mockProfile)

        // Check preferences form props
        const preferencesData = screen.getByTestId('preferences-data')
        expect(JSON.parse(preferencesData.textContent || '{}')).toEqual(mockPreferences)

        // Check avatar upload props
        const avatarUrl = screen.getByTestId('avatar-url')
        expect(avatarUrl.textContent).toBe(mockProfile.avatar_url)

        // Check activity dashboard props
        const activityDashboard = screen.getByTestId('activity-dashboard')
        expect(activityDashboard.getAttribute('data-user-id')).toBe(mockUser.id)
        expect(activityDashboard.getAttribute('data-context')).toBe('personal')
        expect(screen.getByTestId('activities-count').textContent).toBe('2')

        // Check data export manager props
        const dataExportManager = screen.getByTestId('data-export-manager')
        expect(dataExportManager.getAttribute('data-user-id')).toBe(mockUser.id)
        expect(dataExportManager.getAttribute('data-context')).toBe('personal')

        // Check account deletion manager props
        const accountDeletionManager = screen.getByTestId('account-deletion-manager')
        expect(accountDeletionManager.getAttribute('data-user-id')).toBe(mockUser.id)
        expect(accountDeletionManager.getAttribute('data-context')).toBe('personal')
      })
    })
  })

  describe('Data Updates', () => {
    beforeEach(() => {
      mockSupabaseClient.from().select().eq().single
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: mockPreferences, error: null })
        .mockResolvedValueOnce({ data: mockActivities, error: null })
    })

    it('updates profile when profile form triggers update', async () => {
      const updatedProfile = { ...mockProfile, name: 'Updated Name' }
      mockSupabaseClient.from().upsert().select().single.mockResolvedValue({
        data: updatedProfile,
        error: null
      })

      render(<BasicProfileManager />)

      await waitFor(() => {
        expect(screen.getByTestId('enhanced-profile-form')).toBeInTheDocument()
      })

      // Trigger profile update
      const updateButton = screen.getByTestId('update-profile')
      fireEvent.click(updateButton)

      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles')
        expect(mockSupabaseClient.from().upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            id: mockUser.id,
            name: 'Updated Name'
          })
        )
      })
    })

    it('updates preferences when preferences form triggers update', async () => {
      const updatedPreferences = { ...mockPreferences, theme: 'dark' }
      mockSupabaseClient.from().upsert().select().single.mockResolvedValue({
        data: updatedPreferences,
        error: null
      })

      render(<BasicProfileManager />)

      await waitFor(() => {
        expect(screen.getByTestId('preferences-form')).toBeInTheDocument()
      })

      // Trigger preferences update
      const updateButton = screen.getByTestId('update-preferences')
      fireEvent.click(updateButton)

      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_preferences')
        expect(mockSupabaseClient.from().upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            user_id: mockUser.id,
            theme: 'dark'
          })
        )
      })
    })

    it('updates avatar URL when avatar upload triggers update', async () => {
      render(<BasicProfileManager />)

      await waitFor(() => {
        expect(screen.getByTestId('avatar-upload')).toBeInTheDocument()
      })

      // Check initial avatar URL
      expect(screen.getByTestId('avatar-url').textContent).toBe(mockProfile.avatar_url)

      // Trigger avatar update
      const updateButton = screen.getByTestId('update-avatar')
      fireEvent.click(updateButton)

      // Check that avatar URL is updated in local state
      await waitFor(() => {
        expect(screen.getByTestId('avatar-url').textContent).toBe('new-avatar-url')
      })
    })
  })

  describe('Props and Configuration', () => {
    beforeEach(() => {
      mockSupabaseClient.from().select().eq().single
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: mockPreferences, error: null })
        .mockResolvedValueOnce({ data: mockActivities, error: null })
    })

    it('applies custom className', async () => {
      render(<BasicProfileManager className="custom-class" />)

      await waitFor(() => {
        expect(document.querySelector('.custom-class')).toBeInTheDocument()
      })
    })

    it('uses default tab when defaultTab is not provided', async () => {
      render(<BasicProfileManager />)

      await waitFor(() => {
        const tabGroup = screen.getByTestId('tab-group')
        expect(tabGroup.getAttribute('data-selected-index')).toBe('0') // First tab (profile)
      })
    })

    it('sets correct default tab when provided', async () => {
      render(<BasicProfileManager defaultTab="preferences" />)

      await waitFor(() => {
        const tabGroup = screen.getByTestId('tab-group')
        expect(tabGroup.getAttribute('data-selected-index')).toBe('2') // Preferences tab index
      })
    })
  })

  describe('Error Handling', () => {
    it('handles missing profile gracefully', async () => {
      mockSupabaseClient.from().select().eq().single
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }) // Not found
        .mockResolvedValueOnce({ data: mockPreferences, error: null })
        .mockResolvedValueOnce({ data: mockActivities, error: null })

      render(<BasicProfileManager />)

      await waitFor(() => {
        expect(screen.getByText('Profile Settings')).toBeInTheDocument()
        // Should still render the form even with null profile
        expect(screen.getByTestId('enhanced-profile-form')).toBeInTheDocument()
      })
    })

    it('handles missing preferences gracefully', async () => {
      mockSupabaseClient.from().select().eq().single
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }) // Not found
        .mockResolvedValueOnce({ data: mockActivities, error: null })

      // Mock console.warn to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      render(<BasicProfileManager />)

      await waitFor(() => {
        expect(screen.getByText('Profile Settings')).toBeInTheDocument()
        expect(screen.getByTestId('preferences-form')).toBeInTheDocument()
      })

      consoleSpy.mockRestore()
    })

    it('handles missing activities gracefully', async () => {
      mockSupabaseClient.from().select().eq().single
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: mockPreferences, error: null })

      // Mock activities query to fail
      mockSupabaseClient.from().select().eq().order().limit.mockResolvedValue({
        data: null,
        error: { message: 'Activities error' }
      })

      // Mock console.warn to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      render(<BasicProfileManager />)

      await waitFor(() => {
        expect(screen.getByText('Profile Settings')).toBeInTheDocument()
        expect(screen.getByTestId('activities-count').textContent).toBe('0')
      })

      consoleSpy.mockRestore()
    })
  })

  describe('No User State', () => {
    it('does not load data when no user is present', () => {
      mockUseUser.mockReturnValue(null)

      render(<BasicProfileManager />)

      // Should not call supabase methods
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
    })

    it('does not render when no user is present', () => {
      mockUseUser.mockReturnValue(null)

      render(<BasicProfileManager />)

      // Should render loading state or nothing
      expect(screen.queryByText('Profile Settings')).not.toBeInTheDocument()
    })
  })
})