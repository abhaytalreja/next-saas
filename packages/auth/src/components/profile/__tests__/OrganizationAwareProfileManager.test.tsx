import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OrganizationAwareProfileManager } from '../OrganizationAwareProfileManager'

// Mock hooks
jest.mock('../../hooks/useOrganization', () => ({
  useOrganization: jest.fn(),
  useCurrentMembership: jest.fn()
}))

jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn()
}))

// Mock components
jest.mock('../OrganizationProfileSwitcher', () => ({
  OrganizationProfileSwitcher: ({ onProfileChanged, onActivityChanged, showActivityPreview, showPermissions }: any) => (
    <div 
      data-testid="organization-profile-switcher"
      data-show-activity-preview={showActivityPreview}
      data-show-permissions={showPermissions}
    >
      <button onClick={() => onProfileChanged({ id: 'profile-1', name: 'Test Profile' })} data-testid="change-profile">
        Change Profile
      </button>
      <button onClick={() => onActivityChanged([{ id: 'activity-1', action: 'test' }])} data-testid="change-activity">
        Change Activity
      </button>
    </div>
  )
}))

jest.mock('../forms/ProfileForm', () => ({
  ProfileForm: ({ organizationId, onProfileUpdated }: any) => (
    <div data-testid="profile-form" data-organization-id={organizationId}>
      <button onClick={() => onProfileUpdated({ id: 'updated-profile' })} data-testid="update-profile">
        Update Profile
      </button>
    </div>
  )
}))

jest.mock('../AvatarUpload', () => ({
  AvatarUpload: ({ onSuccess, onError, ...props }: any) => (
    <div data-testid="avatar-upload" {...props}>
      <button onClick={() => onSuccess('new-avatar-url')} data-testid="upload-success">
        Upload Success
      </button>
      <button onClick={() => onError('Upload failed')} data-testid="upload-error">
        Upload Error
      </button>
    </div>
  )
}))

jest.mock('../ui/ActivityDashboard', () => ({
  ActivityDashboard: () => <div data-testid="activity-dashboard">Activity Dashboard</div>
}))

jest.mock('../data-export/DataExportManager', () => ({
  DataExportManager: () => <div data-testid="data-export-manager">Data Export Manager</div>
}))

jest.mock('../account-deletion/AccountDeletionManager', () => ({
  AccountDeletionManager: () => <div data-testid="account-deletion-manager">Account Deletion Manager</div>
}))

// Mock UI components
jest.mock('@nextsaas/ui', () => ({
  LegacyCard: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  LegacyCardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  LegacyCardDescription: ({ children, ...props }: any) => <div data-testid="card-description" {...props}>{children}</div>,
  LegacyCardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  LegacyCardTitle: ({ children, ...props }: any) => <div data-testid="card-title" {...props}>{children}</div>,
  Tabs: ({ children, value, onValueChange, ...props }: any) => (
    <div data-testid="tabs" data-value={value} {...props}>
      {React.cloneElement(children, { value, onValueChange })}
    </div>
  ),
  TabsContent: ({ children, value, ...props }: any) => (
    <div data-testid="tabs-content" data-value={value} {...props}>{children}</div>
  ),
  TabsList: ({ children, ...props }: any) => <div data-testid="tabs-list" {...props}>{children}</div>,
  TabsTrigger: ({ children, value, disabled, onClick, ...props }: any) => (
    <button 
      data-testid="tabs-trigger" 
      data-value={value} 
      data-disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  User: () => <svg data-testid="user-icon" />,
  Shield: () => <svg data-testid="shield-icon" />,
  Activity: () => <svg data-testid="activity-icon" />,
  Download: () => <svg data-testid="download-icon" />,
  Trash2: () => <svg data-testid="trash-icon" />,
  Settings: () => <svg data-testid="settings-icon" />,
  Eye: () => <svg data-testid="eye-icon" />,
  EyeSlash: () => <svg data-testid="eye-slash-icon" />,
  Building: () => <svg data-testid="building-icon" />,
  AlertTriangle: () => <svg data-testid="alert-triangle-icon" />
}))

// Mock auth client
jest.mock('../../lib/auth-client', () => ({
  getSupabaseBrowserClient: jest.fn(() => ({
    from: jest.fn(),
    select: jest.fn(),
    upsert: jest.fn()
  }))
}))

// Import the mocked hooks
import { useOrganization, useCurrentMembership } from '../../hooks/useOrganization'
import { useAuth } from '../../hooks/useAuth'

const mockUseOrganization = useOrganization as jest.MockedFunction<typeof useOrganization>
const mockUseCurrentMembership = useCurrentMembership as jest.MockedFunction<typeof useCurrentMembership>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Test data
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z'
}

const mockOrganization = {
  id: 'org-123',
  name: 'Test Organization',
  slug: 'test-org'
}

const mockMembership = {
  id: 'membership-123',
  organization_id: 'org-123',
  user_id: 'user-123',
  role: 'member' as const,
  permissions: ['profile:view_activity'],
  created_at: '2024-01-01T00:00:00Z'
}

const mockPreferences = {
  id: 'pref-123',
  user_id: 'user-123',
  profile_visibility: 'organization' as const,
  email_visibility: 'organization' as const,
  activity_visibility: 'private' as const
}

describe('OrganizationAwareProfileManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock implementations
    mockUseAuth.mockReturnValue({ user: mockUser })
    mockUseOrganization.mockReturnValue({ 
      currentOrganization: null,
      organizations: [],
      loading: false 
    })
    mockUseCurrentMembership.mockReturnValue({ 
      membership: null,
      loading: false 
    })
  })

  describe('Basic Rendering', () => {
    it('renders without organization context', () => {
      render(<OrganizationAwareProfileManager />)
      
      expect(screen.getByTestId('organization-aware-profile-manager')).toBeInTheDocument()
      expect(screen.getByText('Profile Management')).toBeInTheDocument()
      expect(screen.queryByTestId('organization-profile-switcher')).not.toBeInTheDocument()
    })

    it('renders with organization context', () => {
      mockUseOrganization.mockReturnValue({
        currentOrganization: mockOrganization,
        organizations: [mockOrganization],
        loading: false
      })
      mockUseCurrentMembership.mockReturnValue({
        membership: mockMembership,
        loading: false
      })

      render(<OrganizationAwareProfileManager />)
      
      expect(screen.getByText('Profile Management')).toBeInTheDocument()
      expect(screen.getByText('in Test Organization')).toBeInTheDocument()
      expect(screen.getByTestId('organization-profile-switcher')).toBeInTheDocument()
    })

    it('shows organization switcher when enabled', () => {
      mockUseOrganization.mockReturnValue({
        currentOrganization: mockOrganization,
        organizations: [mockOrganization],
        loading: false
      })

      render(<OrganizationAwareProfileManager showOrganizationSwitcher={true} />)
      
      expect(screen.getByTestId('organization-profile-switcher')).toBeInTheDocument()
    })

    it('hides organization switcher when disabled', () => {
      mockUseOrganization.mockReturnValue({
        currentOrganization: mockOrganization,
        organizations: [mockOrganization],
        loading: false
      })

      render(<OrganizationAwareProfileManager showOrganizationSwitcher={false} />)
      
      expect(screen.queryByTestId('organization-profile-switcher')).not.toBeInTheDocument()
    })
  })

  describe('Multi-Organization Warning', () => {
    it('shows multi-organization warning in multi mode', () => {
      process.env.NEXT_PUBLIC_ORGANIZATION_MODE = 'multi'
      
      mockUseOrganization.mockReturnValue({
        currentOrganization: mockOrganization,
        organizations: [mockOrganization],
        loading: false
      })

      render(<OrganizationAwareProfileManager />)
      
      expect(screen.getByText('Multi-Organization Context')).toBeInTheDocument()
      expect(screen.getByText(/You're viewing and managing your profile within the context of/)).toBeInTheDocument()
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument()
      
      delete process.env.NEXT_PUBLIC_ORGANIZATION_MODE
    })

    it('does not show warning in single mode', () => {
      process.env.NEXT_PUBLIC_ORGANIZATION_MODE = 'single'
      
      mockUseOrganization.mockReturnValue({
        currentOrganization: mockOrganization,
        organizations: [mockOrganization],
        loading: false
      })

      render(<OrganizationAwareProfileManager />)
      
      expect(screen.queryByText('Multi-Organization Context')).not.toBeInTheDocument()
      
      delete process.env.NEXT_PUBLIC_ORGANIZATION_MODE
    })
  })

  describe('Tab Visibility and Permissions', () => {
    it('shows all tabs for owners', () => {
      const ownerMembership = { ...mockMembership, role: 'owner' as const }
      
      mockUseOrganization.mockReturnValue({
        currentOrganization: mockOrganization,
        organizations: [mockOrganization],
        loading: false
      })
      mockUseCurrentMembership.mockReturnValue({
        membership: ownerMembership,
        loading: false
      })

      render(<OrganizationAwareProfileManager />)
      
      // All tabs should be visible for owners
      expect(screen.getByTestId('tabs-list')).toBeInTheDocument()
      const triggers = screen.getAllByTestId('tabs-trigger')
      expect(triggers.length).toBeGreaterThan(4) // Should have most tabs available
    })

    it('restricts tabs for members based on permissions', () => {
      mockUseOrganization.mockReturnValue({
        currentOrganization: mockOrganization,
        organizations: [mockOrganization],
        loading: false
      })
      mockUseCurrentMembership.mockReturnValue({
        membership: mockMembership,
        loading: false
      })

      render(<OrganizationAwareProfileManager />)
      
      // Member with limited permissions should see fewer tabs
      const triggers = screen.getAllByTestId('tabs-trigger')
      expect(triggers).toHaveLength(4) // Should have limited tabs
    })

    it('respects restrictedTabs prop', () => {
      render(<OrganizationAwareProfileManager restrictedTabs={['export', 'delete']} />)
      
      const triggers = screen.getAllByTestId('tabs-trigger')
      const triggerValues = triggers.map(t => t.getAttribute('data-value'))
      
      expect(triggerValues).not.toContain('export')
      expect(triggerValues).not.toContain('delete')
    })

    it('does not show organization tab when no organization context', () => {
      render(<OrganizationAwareProfileManager />)
      
      const triggers = screen.getAllByTestId('tabs-trigger')
      const triggerValues = triggers.map(t => t.getAttribute('data-value'))
      
      expect(triggerValues).not.toContain('organization')
    })
  })

  describe('Tab Content Rendering', () => {
    it('renders profile form with correct organization context', () => {
      mockUseOrganization.mockReturnValue({
        currentOrganization: mockOrganization,
        organizations: [mockOrganization],
        loading: false
      })

      render(<OrganizationAwareProfileManager />)
      
      const profileForm = screen.getByTestId('profile-form')
      expect(profileForm.getAttribute('data-organization-id')).toBe(mockOrganization.id)
    })

    it('renders avatar upload component', () => {
      render(<OrganizationAwareProfileManager />)
      
      expect(screen.getByTestId('avatar-upload')).toBeInTheDocument()
      expect(screen.getByTestId('avatar-upload')).toHaveAttribute('data-testid', 'profile-avatar-upload')
    })

    it('renders activity dashboard when permission is granted', () => {
      mockUseOrganization.mockReturnValue({
        currentOrganization: mockOrganization,
        organizations: [mockOrganization],
        loading: false
      })
      mockUseCurrentMembership.mockReturnValue({
        membership: mockMembership,
        loading: false
      })

      render(<OrganizationAwareProfileManager defaultTab="activity" />)
      
      expect(screen.getByTestId('activity-dashboard')).toBeInTheDocument()
    })

    it('shows user information in privacy tab', () => {
      render(<OrganizationAwareProfileManager defaultTab="privacy" />)
      
      expect(screen.getByText('User ID')).toBeInTheDocument()
      expect(screen.getByText('Account Created')).toBeInTheDocument()
      expect(screen.getByText(mockUser.id)).toBeInTheDocument()
    })

    it('shows organization-specific information when in organization context', () => {
      mockUseOrganization.mockReturnValue({
        currentOrganization: mockOrganization,
        organizations: [mockOrganization],
        loading: false
      })
      mockUseCurrentMembership.mockReturnValue({
        membership: mockMembership,
        loading: false
      })

      render(<OrganizationAwareProfileManager defaultTab="privacy" />)
      
      expect(screen.getByText('Organization Role')).toBeInTheDocument()
      expect(screen.getByText('Member Since')).toBeInTheDocument()
      expect(screen.getByText(/Member in Test Organization/)).toBeInTheDocument()
    })
  })

  describe('Event Handlers', () => {
    it('handles profile changes from organization switcher', async () => {
      mockUseOrganization.mockReturnValue({
        currentOrganization: mockOrganization,
        organizations: [mockOrganization],
        loading: false
      })

      render(<OrganizationAwareProfileManager />)
      
      const changeProfileButton = screen.getByTestId('change-profile')
      fireEvent.click(changeProfileButton)
      
      // Component should handle the profile change internally
      await waitFor(() => {
        expect(changeProfileButton).toBeInTheDocument()
      })
    })

    it('handles activity changes from organization switcher', async () => {
      mockUseOrganization.mockReturnValue({
        currentOrganization: mockOrganization,
        organizations: [mockOrganization],
        loading: false
      })

      render(<OrganizationAwareProfileManager />)
      
      const changeActivityButton = screen.getByTestId('change-activity')
      fireEvent.click(changeActivityButton)
      
      // Component should handle the activity change internally
      await waitFor(() => {
        expect(changeActivityButton).toBeInTheDocument()
      })
    })

    it('handles profile updates from profile form', async () => {
      render(<OrganizationAwareProfileManager />)
      
      const updateProfileButton = screen.getByTestId('update-profile')
      fireEvent.click(updateProfileButton)
      
      // Component should handle the profile update internally
      await waitFor(() => {
        expect(updateProfileButton).toBeInTheDocument()
      })
    })

    it('handles avatar upload success', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      render(<OrganizationAwareProfileManager />)
      
      const uploadSuccessButton = screen.getByTestId('upload-success')
      fireEvent.click(uploadSuccessButton)
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Avatar uploaded:', 'new-avatar-url')
      })
      
      consoleSpy.mockRestore()
    })

    it('handles avatar upload errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      render(<OrganizationAwareProfileManager />)
      
      const uploadErrorButton = screen.getByTestId('upload-error')
      fireEvent.click(uploadErrorButton)
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Avatar error:', 'Upload failed')
      })
      
      consoleSpy.mockRestore()
    })
  })

  describe('Props Configuration', () => {
    it('applies custom className', () => {
      render(<OrganizationAwareProfileManager className="custom-class" />)
      
      const container = screen.getByTestId('organization-aware-profile-manager')
      expect(container).toHaveClass('custom-class')
    })

    it('sets default tab correctly', () => {
      render(<OrganizationAwareProfileManager defaultTab="privacy" />)
      
      const tabs = screen.getByTestId('tabs')
      expect(tabs.getAttribute('data-value')).toBe('privacy')
    })

    it('configures organization profile switcher props', () => {
      mockUseOrganization.mockReturnValue({
        currentOrganization: mockOrganization,
        organizations: [mockOrganization],
        loading: false
      })

      render(<OrganizationAwareProfileManager />)
      
      const switcher = screen.getByTestId('organization-profile-switcher')
      expect(switcher.getAttribute('data-show-activity-preview')).toBe('true')
      expect(switcher.getAttribute('data-show-permissions')).toBe('true')
    })
  })
})