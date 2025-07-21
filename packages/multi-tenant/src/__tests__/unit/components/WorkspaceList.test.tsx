import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WorkspaceList } from '../../../components/workspace/WorkspaceList'

// Mock dependencies
const mockWorkspaces = [
  {
    id: 'ws-1',
    name: 'Design Team',
    slug: 'design-team',
    description: 'Design and creative work',
    icon: '🎨',
    color: '#3B82F6',
    is_default: false,
    is_archived: false,
    project_count: 5,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ws-2', 
    name: 'Engineering',
    slug: 'engineering',
    description: 'Software development',
    icon: '⚡',
    color: '#10B981',
    is_default: true,
    is_archived: false,
    project_count: 12,
    created_at: '2024-01-02T00:00:00Z'
  }
]

const mockUseWorkspaces = vi.fn()
const mockDeleteWorkspace = vi.fn()
const mockArchiveWorkspace = vi.fn()

vi.mock('../../../hooks/useWorkspaces', () => ({
  useWorkspaces: () => mockUseWorkspaces()
}))

vi.mock('../../../hooks/useWorkspaceActions', () => ({
  useWorkspaceActions: () => ({
    deleteWorkspace: mockDeleteWorkspace,
    archiveWorkspace: mockArchiveWorkspace
  })
}))

describe('WorkspaceList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseWorkspaces.mockReturnValue({
      workspaces: mockWorkspaces,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    })
  })

  describe('Rendering', () => {
    it('should render workspace list correctly', () => {
      render(<WorkspaceList />)
      
      expect(screen.getByText('Design Team')).toBeInTheDocument()
      expect(screen.getByText('Engineering')).toBeInTheDocument()
      expect(screen.getByText('5 projects')).toBeInTheDocument()
      expect(screen.getByText('12 projects')).toBeInTheDocument()
    })

    it('should show loading state', () => {
      mockUseWorkspaces.mockReturnValue({
        workspaces: [],
        isLoading: true,
        error: null,
        refetch: vi.fn()
      })
      
      render(<WorkspaceList />)
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should show error state', () => {
      mockUseWorkspaces.mockReturnValue({
        workspaces: [],
        isLoading: false,
        error: new Error('Failed to load workspaces'),
        refetch: vi.fn()
      })
      
      render(<WorkspaceList />)
      expect(screen.getByText(/failed to load workspaces/i)).toBeInTheDocument()
    })

    it('should show empty state when no workspaces', () => {
      mockUseWorkspaces.mockReturnValue({
        workspaces: [],
        isLoading: false,
        error: null,
        refetch: vi.fn()
      })
      
      render(<WorkspaceList />)
      expect(screen.getByText(/no workspaces found/i)).toBeInTheDocument()
    })
  })

  describe('Workspace Cards', () => {
    it('should display workspace icons and colors', () => {
      render(<WorkspaceList />)
      
      const designWorkspace = screen.getByText('🎨')
      const engineeringWorkspace = screen.getByText('⚡')
      
      expect(designWorkspace).toBeInTheDocument()
      expect(engineeringWorkspace).toBeInTheDocument()
    })

    it('should show default workspace badge', () => {
      render(<WorkspaceList />)
      
      expect(screen.getByText('Default')).toBeInTheDocument()
    })

    it('should display project count correctly', () => {
      render(<WorkspaceList />)
      
      expect(screen.getByText('5 projects')).toBeInTheDocument()
      expect(screen.getByText('12 projects')).toBeInTheDocument()
    })

    it('should show archived badge for archived workspaces', () => {
      const archivedWorkspaces = [
        { ...mockWorkspaces[0], is_archived: true }
      ]
      
      mockUseWorkspaces.mockReturnValue({
        workspaces: archivedWorkspaces,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      })
      
      render(<WorkspaceList />)
      expect(screen.getByText('Archived')).toBeInTheDocument()
    })
  })

  describe('Search and Filtering', () => {
    it('should filter workspaces by search term', async () => {
      render(<WorkspaceList />)
      
      const searchInput = screen.getByPlaceholderText(/search workspaces/i)
      fireEvent.change(searchInput, { target: { value: 'Design' } })
      
      await waitFor(() => {
        expect(screen.getByText('Design Team')).toBeInTheDocument()
        expect(screen.queryByText('Engineering')).not.toBeInTheDocument()
      })
    })

    it('should show no results when search has no matches', async () => {
      render(<WorkspaceList />)
      
      const searchInput = screen.getByPlaceholderText(/search workspaces/i)
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } })
      
      await waitFor(() => {
        expect(screen.getByText(/no workspaces match your search/i)).toBeInTheDocument()
      })
    })

    it('should filter by archived status', async () => {
      const mixedWorkspaces = [
        ...mockWorkspaces,
        { ...mockWorkspaces[0], id: 'ws-3', name: 'Archived Workspace', is_archived: true }
      ]
      
      mockUseWorkspaces.mockReturnValue({
        workspaces: mixedWorkspaces,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      })
      
      render(<WorkspaceList />)
      
      // Show only archived
      const filterSelect = screen.getByLabelText(/filter by status/i)
      fireEvent.change(filterSelect, { target: { value: 'archived' } })
      
      await waitFor(() => {
        expect(screen.getByText('Archived Workspace')).toBeInTheDocument()
        expect(screen.queryByText('Design Team')).not.toBeInTheDocument()
      })
    })
  })

  describe('Bulk Operations', () => {
    it('should allow selecting multiple workspaces', () => {
      render(<WorkspaceList />)
      
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0]) // First workspace
      fireEvent.click(checkboxes[1]) // Second workspace
      
      expect(screen.getByText('2 selected')).toBeInTheDocument()
    })

    it('should enable bulk actions when workspaces selected', () => {
      render(<WorkspaceList />)
      
      const checkbox = screen.getAllByRole('checkbox')[0]
      fireEvent.click(checkbox)
      
      expect(screen.getByText('Archive Selected')).toBeEnabled()
      expect(screen.getByText('Delete Selected')).toBeEnabled()
    })

    it('should handle bulk archive operation', async () => {
      render(<WorkspaceList />)
      
      const checkbox = screen.getAllByRole('checkbox')[0]
      fireEvent.click(checkbox)
      
      const archiveButton = screen.getByText('Archive Selected')
      fireEvent.click(archiveButton)
      
      await waitFor(() => {
        expect(mockArchiveWorkspace).toHaveBeenCalledWith(['ws-1'])
      })
    })
  })

  describe('Individual Actions', () => {
    it('should show action menu on workspace card', () => {
      render(<WorkspaceList />)
      
      const actionButtons = screen.getAllByTestId('workspace-action-menu')
      expect(actionButtons).toHaveLength(2)
    })

    it('should handle workspace deletion', async () => {
      render(<WorkspaceList />)
      
      const actionButton = screen.getAllByTestId('workspace-action-menu')[0]
      fireEvent.click(actionButton)
      
      const deleteButton = screen.getByText('Delete')
      fireEvent.click(deleteButton)
      
      // Confirm deletion
      const confirmButton = screen.getByText('Delete Workspace')
      fireEvent.click(confirmButton)
      
      await waitFor(() => {
        expect(mockDeleteWorkspace).toHaveBeenCalledWith('ws-1')
      })
    })

    it('should prevent deletion of default workspace', () => {
      render(<WorkspaceList />)
      
      const actionButtons = screen.getAllByTestId('workspace-action-menu')
      // Click on Engineering workspace (default)
      fireEvent.click(actionButtons[1])
      
      expect(screen.queryByText('Delete')).not.toBeInTheDocument()
    })

    it('should handle workspace archiving', async () => {
      render(<WorkspaceList />)
      
      const actionButton = screen.getAllByTestId('workspace-action-menu')[0]
      fireEvent.click(actionButton)
      
      const archiveButton = screen.getByText('Archive')
      fireEvent.click(archiveButton)
      
      await waitFor(() => {
        expect(mockArchiveWorkspace).toHaveBeenCalledWith(['ws-1'])
      })
    })
  })

  describe('Sorting', () => {
    it('should sort workspaces by name', async () => {
      render(<WorkspaceList />)
      
      const sortSelect = screen.getByLabelText(/sort by/i)
      fireEvent.change(sortSelect, { target: { value: 'name' } })
      
      await waitFor(() => {
        const workspaceNames = screen.getAllByTestId('workspace-name')
        expect(workspaceNames[0]).toHaveTextContent('Design Team')
        expect(workspaceNames[1]).toHaveTextContent('Engineering')
      })
    })

    it('should sort workspaces by creation date', async () => {
      render(<WorkspaceList />)
      
      const sortSelect = screen.getByLabelText(/sort by/i)
      fireEvent.change(sortSelect, { target: { value: 'created_at' } })
      
      await waitFor(() => {
        const workspaceNames = screen.getAllByTestId('workspace-name')
        expect(workspaceNames[0]).toHaveTextContent('Design Team') // Older
        expect(workspaceNames[1]).toHaveTextContent('Engineering') // Newer
      })
    })

    it('should sort workspaces by project count', async () => {
      render(<WorkspaceList />)
      
      const sortSelect = screen.getByLabelText(/sort by/i)
      fireEvent.change(sortSelect, { target: { value: 'project_count' } })
      
      await waitFor(() => {
        const workspaceNames = screen.getAllByTestId('workspace-name')
        expect(workspaceNames[0]).toHaveTextContent('Engineering') // More projects
        expect(workspaceNames[1]).toHaveTextContent('Design Team') // Fewer projects
      })
    })
  })

  describe('View Modes', () => {
    it('should switch between grid and list view', () => {
      render(<WorkspaceList />)
      
      // Default grid view
      expect(screen.getByTestId('workspace-grid')).toBeInTheDocument()
      
      // Switch to list view
      const listViewButton = screen.getByTestId('list-view-button')
      fireEvent.click(listViewButton)
      
      expect(screen.getByTestId('workspace-list')).toBeInTheDocument()
      expect(screen.queryByTestId('workspace-grid')).not.toBeInTheDocument()
    })

    it('should maintain view mode preference', () => {
      const { rerender } = render(<WorkspaceList />)
      
      // Switch to list view
      const listViewButton = screen.getByTestId('list-view-button')
      fireEvent.click(listViewButton)
      
      // Rerender component
      rerender(<WorkspaceList />)
      
      // Should maintain list view
      expect(screen.getByTestId('workspace-list')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<WorkspaceList />)
      
      expect(screen.getByLabelText(/workspace list/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/search workspaces/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument()
    })

    it('should support keyboard navigation', () => {
      render(<WorkspaceList />)
      
      const firstWorkspace = screen.getAllByRole('button')[0]
      firstWorkspace.focus()
      
      expect(firstWorkspace).toHaveFocus()
      
      // Tab to next workspace
      fireEvent.keyDown(firstWorkspace, { key: 'Tab' })
      // Keyboard navigation should work
    })

    it('should announce selection changes to screen readers', () => {
      render(<WorkspaceList />)
      
      const checkbox = screen.getAllByRole('checkbox')[0]
      fireEvent.click(checkbox)
      
      expect(screen.getByRole('status')).toHaveTextContent('1 workspace selected')
    })
  })

  describe('Performance', () => {
    it('should virtualize large lists', () => {
      const manyWorkspaces = Array.from({ length: 100 }, (_, i) => ({
        ...mockWorkspaces[0],
        id: `ws-${i}`,
        name: `Workspace ${i}`
      }))
      
      mockUseWorkspaces.mockReturnValue({
        workspaces: manyWorkspaces,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      })
      
      render(<WorkspaceList />)
      
      // Should only render visible items
      const visibleItems = screen.getAllByTestId('workspace-card')
      expect(visibleItems.length).toBeLessThan(100)
    })

    it('should debounce search input', async () => {
      render(<WorkspaceList />)
      
      const searchInput = screen.getByPlaceholderText(/search workspaces/i)
      
      // Type multiple characters quickly
      fireEvent.change(searchInput, { target: { value: 'D' } })
      fireEvent.change(searchInput, { target: { value: 'De' } })
      fireEvent.change(searchInput, { target: { value: 'Des' } })
      
      // Should debounce and only filter after delay
      await waitFor(() => {
        expect(screen.getByText('Design Team')).toBeInTheDocument()
      }, { timeout: 500 })
    })
  })

  describe('Error Handling', () => {
    it('should handle action errors gracefully', async () => {
      mockDeleteWorkspace.mockRejectedValue(new Error('Delete failed'))
      
      render(<WorkspaceList />)
      
      const actionButton = screen.getAllByTestId('workspace-action-menu')[0]
      fireEvent.click(actionButton)
      
      const deleteButton = screen.getByText('Delete')
      fireEvent.click(deleteButton)
      
      const confirmButton = screen.getByText('Delete Workspace')
      fireEvent.click(confirmButton)
      
      await waitFor(() => {
        expect(screen.getByText(/failed to delete workspace/i)).toBeInTheDocument()
      })
    })

    it('should show retry option on fetch errors', () => {
      const mockRefetch = vi.fn()
      
      mockUseWorkspaces.mockReturnValue({
        workspaces: [],
        isLoading: false,
        error: new Error('Network error'),
        refetch: mockRefetch
      })
      
      render(<WorkspaceList />)
      
      const retryButton = screen.getByText('Retry')
      fireEvent.click(retryButton)
      
      expect(mockRefetch).toHaveBeenCalled()
    })
  })
})