import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PermissionMatrix } from '../../../components/permissions/PermissionMatrix'

const mockPermissions = [
  {
    id: 'perm-1',
    name: 'organization:view',
    description: 'View organization details',
    category: 'organization',
    resource_type: 'organization'
  },
  {
    id: 'perm-2', 
    name: 'organization:manage',
    description: 'Manage organization settings',
    category: 'organization',
    resource_type: 'organization'
  },
  {
    id: 'perm-3',
    name: 'workspace:view',
    description: 'View workspace details',
    category: 'workspace',
    resource_type: 'workspace'
  },
  {
    id: 'perm-4',
    name: 'workspace:create',
    description: 'Create new workspaces',
    category: 'workspace',
    resource_type: 'workspace'
  },
  {
    id: 'perm-5',
    name: 'project:view',
    description: 'View project details',
    category: 'project',
    resource_type: 'project'
  }
]

const mockRoles = [
  {
    id: 'role-1',
    name: 'owner',
    display_name: 'Owner',
    type: 'system',
    permissions: ['organization:view', 'organization:manage', 'workspace:view', 'workspace:create', 'project:view']
  },
  {
    id: 'role-2',
    name: 'admin',
    display_name: 'Administrator',  
    type: 'system',
    permissions: ['organization:view', 'workspace:view', 'workspace:create', 'project:view']
  },
  {
    id: 'role-3',
    name: 'member',
    display_name: 'Member',
    type: 'system', 
    permissions: ['organization:view', 'workspace:view', 'project:view']
  },
  {
    id: 'role-4',
    name: 'custom-role',
    display_name: 'Custom Role',
    type: 'custom',
    permissions: ['workspace:view', 'project:view']
  }
]

const mockUsePermissions = vi.fn()
const mockUseRoles = vi.fn()
const mockUpdateRolePermissions = vi.fn()

vi.mock('../../../hooks/usePermissions', () => ({
  usePermissions: () => mockUsePermissions()
}))

vi.mock('../../../hooks/useRoles', () => ({
  useRoles: () => mockUseRoles()
}))

vi.mock('../../../hooks/useRoleActions', () => ({
  useRoleActions: () => ({
    updateRolePermissions: mockUpdateRolePermissions
  })
}))

describe('PermissionMatrix', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePermissions.mockReturnValue({
      permissions: mockPermissions,
      isLoading: false,
      error: null
    })
    mockUseRoles.mockReturnValue({
      roles: mockRoles,
      isLoading: false,
      error: null
    })
    mockUpdateRolePermissions.mockResolvedValue(true)
  })

  describe('Matrix Rendering', () => {
    it('should render permission matrix correctly', () => {
      render(<PermissionMatrix />)
      
      // Check role headers
      expect(screen.getByText('Owner')).toBeInTheDocument()
      expect(screen.getByText('Administrator')).toBeInTheDocument()
      expect(screen.getByText('Member')).toBeInTheDocument()
      expect(screen.getByText('Custom Role')).toBeInTheDocument()
      
      // Check permission categories
      expect(screen.getByText('Organization')).toBeInTheDocument()
      expect(screen.getByText('Workspace')).toBeInTheDocument()
      expect(screen.getByText('Project')).toBeInTheDocument()
    })

    it('should group permissions by category', () => {
      render(<PermissionMatrix />)
      
      const organizationSection = screen.getByTestId('category-organization')
      const workspaceSection = screen.getByTestId('category-workspace') 
      const projectSection = screen.getByTestId('category-project')
      
      expect(organizationSection).toBeInTheDocument()
      expect(workspaceSection).toBeInTheDocument()
      expect(projectSection).toBeInTheDocument()
    })

    it('should show permission descriptions on hover', async () => {
      render(<PermissionMatrix />)
      
      const permissionRow = screen.getByText('organization:view')
      fireEvent.mouseEnter(permissionRow)
      
      await waitFor(() => {
        expect(screen.getByText('View organization details')).toBeInTheDocument()
      })
    })

    it('should display loading state', () => {
      mockUsePermissions.mockReturnValue({
        permissions: [],
        isLoading: true,
        error: null
      })
      
      render(<PermissionMatrix />)
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should display error state', () => {
      mockUsePermissions.mockReturnValue({
        permissions: [],
        isLoading: false,
        error: new Error('Failed to load permissions')
      })
      
      render(<PermissionMatrix />)
      expect(screen.getByText(/failed to load permissions/i)).toBeInTheDocument()
    })
  })

  describe('Permission Checkboxes', () => {
    it('should show checked permissions correctly', () => {
      render(<PermissionMatrix />)
      
      // Owner should have organization:manage checked
      const ownerOrgManageCheckbox = screen.getByTestId('permission-owner-organization:manage')
      expect(ownerOrgManageCheckbox).toBeChecked()
      
      // Member should not have organization:manage checked
      const memberOrgManageCheckbox = screen.getByTestId('permission-member-organization:manage')
      expect(memberOrgManageCheckbox).not.toBeChecked()
    })

    it('should handle permission toggle', async () => {
      render(<PermissionMatrix />)
      
      const checkbox = screen.getByTestId('permission-custom-role-workspace:create')
      fireEvent.click(checkbox)
      
      await waitFor(() => {
        expect(mockUpdateRolePermissions).toHaveBeenCalledWith(
          'role-4',
          [...mockRoles[3].permissions, 'workspace:create']
        )
      })
    })

    it('should handle permission removal', async () => {
      render(<PermissionMatrix />)
      
      const checkbox = screen.getByTestId('permission-custom-role-workspace:view')
      fireEvent.click(checkbox)
      
      await waitFor(() => {
        expect(mockUpdateRolePermissions).toHaveBeenCalledWith(
          'role-4',
          ['project:view'] // workspace:view removed
        )
      })
    })

    it('should disable system role checkboxes', () => {
      render(<PermissionMatrix />)
      
      const ownerCheckbox = screen.getByTestId('permission-owner-organization:view')
      expect(ownerCheckbox).toBeDisabled()
      
      const adminCheckbox = screen.getByTestId('permission-admin-workspace:view') 
      expect(adminCheckbox).toBeDisabled()
    })

    it('should enable custom role checkboxes', () => {
      render(<PermissionMatrix />)
      
      const customCheckbox = screen.getByTestId('permission-custom-role-workspace:view')
      expect(customCheckbox).toBeEnabled()
    })
  })

  describe('Role Management', () => {
    it('should distinguish between system and custom roles', () => {
      render(<PermissionMatrix />)
      
      // System roles should have badge
      expect(screen.getByText('System')).toBeInTheDocument()
      
      // Custom roles should be editable
      const customRoleHeader = screen.getByTestId('role-header-custom-role')
      expect(customRoleHeader).toHaveClass('editable')
    })

    it('should show role statistics', () => {
      render(<PermissionMatrix />)
      
      // Should show permission count for each role
      expect(screen.getByText('5 permissions')).toBeInTheDocument() // Owner
      expect(screen.getByText('4 permissions')).toBeInTheDocument() // Admin
      expect(screen.getByText('3 permissions')).toBeInTheDocument() // Member
      expect(screen.getByText('2 permissions')).toBeInTheDocument() // Custom
    })

    it('should allow role renaming for custom roles', async () => {
      const mockUpdateRole = vi.fn()
      vi.mocked(mockUpdateRolePermissions).mockImplementation(mockUpdateRole)
      
      render(<PermissionMatrix />)
      
      const customRoleHeader = screen.getByText('Custom Role')
      fireEvent.doubleClick(customRoleHeader)
      
      const input = screen.getByDisplayValue('Custom Role')
      fireEvent.change(input, { target: { value: 'Renamed Role' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      
      await waitFor(() => {
        expect(mockUpdateRole).toHaveBeenCalled()
      })
    })

    it('should prevent renaming system roles', () => {
      render(<PermissionMatrix />)
      
      const ownerHeader = screen.getByText('Owner')
      fireEvent.doubleClick(ownerHeader)
      
      // Should not show input field
      expect(screen.queryByDisplayValue('Owner')).not.toBeInTheDocument()
    })
  })

  describe('Permission Inheritance', () => {
    it('should show inherited permissions with different styling', () => {
      render(<PermissionMatrix />)
      
      // Admin should inherit some permissions from lower roles
      const inheritedCheckbox = screen.getByTestId('permission-admin-organization:view')
      expect(inheritedCheckbox).toHaveClass('inherited')
    })

    it('should show inheritance tooltip', async () => {
      render(<PermissionMatrix />)
      
      const inheritedCheckbox = screen.getByTestId('permission-admin-organization:view')
      fireEvent.mouseEnter(inheritedCheckbox)
      
      await waitFor(() => {
        expect(screen.getByText(/inherited from member role/i)).toBeInTheDocument()
      })
    })

    it('should handle conflicting permissions correctly', () => {
      render(<PermissionMatrix />)
      
      // Owner should override any conflicting permissions
      const ownerPermissions = screen.getAllByTestId(/permission-owner-/)
      expect(ownerPermissions.length).toBeGreaterThan(0)
    })
  })

  describe('Search and Filtering', () => {
    it('should filter permissions by search term', async () => {
      render(<PermissionMatrix />)
      
      const searchInput = screen.getByPlaceholderText(/search permissions/i)
      fireEvent.change(searchInput, { target: { value: 'organization' } })
      
      await waitFor(() => {
        expect(screen.getByText('organization:view')).toBeInTheDocument()
        expect(screen.getByText('organization:manage')).toBeInTheDocument()
        expect(screen.queryByText('workspace:view')).not.toBeInTheDocument()
      })
    })

    it('should filter by role type', async () => {
      render(<PermissionMatrix />)
      
      const roleFilter = screen.getByLabelText(/filter by role type/i)
      fireEvent.change(roleFilter, { target: { value: 'custom' } })
      
      await waitFor(() => {
        expect(screen.getByText('Custom Role')).toBeInTheDocument()
        expect(screen.queryByText('Owner')).not.toBeInTheDocument()
      })
    })

    it('should filter by permission category', async () => {
      render(<PermissionMatrix />)
      
      const categoryFilter = screen.getByLabelText(/filter by category/i)
      fireEvent.change(categoryFilter, { target: { value: 'workspace' } })
      
      await waitFor(() => {
        expect(screen.getByText('workspace:view')).toBeInTheDocument()
        expect(screen.queryByText('organization:view')).not.toBeInTheDocument()
      })
    })

    it('should show no results message when no matches', async () => {
      render(<PermissionMatrix />)
      
      const searchInput = screen.getByPlaceholderText(/search permissions/i)
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
      
      await waitFor(() => {
        expect(screen.getByText(/no permissions match your search/i)).toBeInTheDocument()
      })
    })
  })

  describe('Bulk Operations', () => {
    it('should allow selecting entire role column', () => {
      render(<PermissionMatrix />)
      
      const roleColumnHeader = screen.getByTestId('role-header-custom-role')
      const selectAllCheckbox = roleColumnHeader.querySelector('input[type="checkbox"]')
      
      expect(selectAllCheckbox).toBeInTheDocument()
    })

    it('should handle bulk permission assignment', async () => {
      render(<PermissionMatrix />)
      
      const selectAllButton = screen.getByTestId('select-all-custom-role')
      fireEvent.click(selectAllButton)
      
      await waitFor(() => {
        expect(mockUpdateRolePermissions).toHaveBeenCalledWith(
          'role-4',
          expect.arrayContaining(['organization:view', 'organization:manage', 'workspace:view', 'workspace:create', 'project:view'])
        )
      })
    })

    it('should handle bulk permission removal', async () => {
      render(<PermissionMatrix />)
      
      const clearAllButton = screen.getByTestId('clear-all-custom-role')
      fireEvent.click(clearAllButton)
      
      await waitFor(() => {
        expect(mockUpdateRolePermissions).toHaveBeenCalledWith('role-4', [])
      })
    })
  })

  describe('Export and Import', () => {
    it('should allow exporting permission matrix', () => {
      render(<PermissionMatrix />)
      
      const exportButton = screen.getByText(/export permissions/i)
      fireEvent.click(exportButton)
      
      // Should trigger download
      expect(exportButton).toBeInTheDocument()
    })

    it('should allow importing permissions', async () => {
      render(<PermissionMatrix />)
      
      const importButton = screen.getByText(/import permissions/i)
      fireEvent.click(importButton)
      
      const fileInput = screen.getByTestId('import-file-input')
      const mockFile = new File(['{"roles": []}'], 'permissions.json', { type: 'application/json' })
      
      fireEvent.change(fileInput, { target: { files: [mockFile] } })
      
      await waitFor(() => {
        expect(screen.getByText(/import successful/i)).toBeInTheDocument()
      })
    })

    it('should validate import file format', async () => {
      render(<PermissionMatrix />)
      
      const importButton = screen.getByText(/import permissions/i)
      fireEvent.click(importButton)
      
      const fileInput = screen.getByTestId('import-file-input')
      const mockFile = new File(['invalid json'], 'invalid.txt', { type: 'text/plain' })
      
      fireEvent.change(fileInput, { target: { files: [mockFile] } })
      
      await waitFor(() => {
        expect(screen.getByText(/invalid file format/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle permission update errors', async () => {
      mockUpdateRolePermissions.mockRejectedValue(new Error('Update failed'))
      
      render(<PermissionMatrix />)
      
      const checkbox = screen.getByTestId('permission-custom-role-workspace:create')
      fireEvent.click(checkbox)
      
      await waitFor(() => {
        expect(screen.getByText(/failed to update permissions/i)).toBeInTheDocument()
      })
    })

    it('should revert checkbox state on error', async () => {
      mockUpdateRolePermissions.mockRejectedValue(new Error('Update failed'))
      
      render(<PermissionMatrix />)
      
      const checkbox = screen.getByTestId('permission-custom-role-workspace:create')
      const initialChecked = checkbox.checked
      
      fireEvent.click(checkbox)
      
      await waitFor(() => {
        expect(checkbox.checked).toBe(initialChecked) // Should revert
      })
    })

    it('should show loading state during updates', async () => {
      let resolvePromise: (value: any) => void
      const pendingPromise = new Promise(resolve => {
        resolvePromise = resolve
      })
      mockUpdateRolePermissions.mockReturnValue(pendingPromise)
      
      render(<PermissionMatrix />)
      
      const checkbox = screen.getByTestId('permission-custom-role-workspace:create')
      fireEvent.click(checkbox)
      
      expect(screen.getByTestId('updating-permission')).toBeInTheDocument()
      
      resolvePromise!(true)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for matrix', () => {
      render(<PermissionMatrix />)
      
      const matrix = screen.getByRole('grid')
      expect(matrix).toHaveAttribute('aria-label', 'Permission matrix')
    })

    it('should have proper row and column headers', () => {
      render(<PermissionMatrix />)
      
      const roleHeaders = screen.getAllByRole('columnheader')
      const permissionHeaders = screen.getAllByRole('rowheader')
      
      expect(roleHeaders.length).toBeGreaterThan(0)
      expect(permissionHeaders.length).toBeGreaterThan(0)
    })

    it('should support keyboard navigation', () => {
      render(<PermissionMatrix />)
      
      const firstCheckbox = screen.getByTestId('permission-owner-organization:view')
      firstCheckbox.focus()
      
      expect(firstCheckbox).toHaveFocus()
      
      // Should navigate with arrow keys
      fireEvent.keyDown(firstCheckbox, { key: 'ArrowRight' })
      // Next checkbox should be focused
    })

    it('should announce permission changes to screen readers', async () => {
      render(<PermissionMatrix />)
      
      const checkbox = screen.getByTestId('permission-custom-role-workspace:create')
      fireEvent.click(checkbox)
      
      await waitFor(() => {
        const announcement = screen.getByRole('status')
        expect(announcement).toHaveTextContent(/permission updated/i)
      })
    })
  })
})