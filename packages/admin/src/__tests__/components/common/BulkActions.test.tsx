import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import '@testing-library/jest-dom'
import { BulkActions, BulkAction, createUserBulkActions } from '../../../components/common/BulkActions'
import { Download, Mail, UserX, UserCheck, Trash2 } from 'lucide-react'

// Mock UI components
jest.mock('@nextsaas/ui', () => ({
  Button: ({ children, onClick, variant, size, disabled, className }: any) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  ),
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  )
}))

// Mock icons
jest.mock('lucide-react', () => ({
  MoreHorizontal: ({ className }: any) => <div data-testid="more-horizontal" className={className} />,
  X: ({ className }: any) => <div data-testid="x-icon" className={className} />,
  Mail: ({ className }: any) => <div data-testid="mail-icon" className={className} />,
  UserX: ({ className }: any) => <div data-testid="user-x-icon" className={className} />,
  UserCheck: ({ className }: any) => <div data-testid="user-check-icon" className={className} />,
  Trash2: ({ className }: any) => <div data-testid="trash-icon" className={className} />,
  Download: ({ className }: any) => <div data-testid="download-icon" className={className} />,
  AlertTriangle: ({ className }: any) => <div data-testid="alert-icon" className={className} />
}))

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: jest.fn()
})

expect.extend(toHaveNoViolations)

describe('BulkActions', () => {
  const mockActions: BulkAction[] = [
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      action: jest.fn()
    },
    {
      id: 'send-email',
      label: 'Send Email',
      icon: Mail,
      action: jest.fn()
    },
    {
      id: 'activate',
      label: 'Activate',
      icon: UserCheck,
      action: jest.fn()
    },
    {
      id: 'suspend',
      label: 'Suspend',
      icon: UserX,
      variant: 'destructive',
      requiresConfirmation: true,
      action: jest.fn()
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      requiresConfirmation: true,
      confirmationDescription: 'Are you sure you want to delete these items permanently?',
      action: jest.fn()
    }
  ]

  const defaultProps = {
    selectedIds: ['1', '2', '3'],
    onClearSelection: jest.fn(),
    actions: mockActions
  }

  beforeEach(() => {
    jest.clearAllMocks()
    console.error = jest.fn() // Suppress console.error in tests
    ;(window.confirm as jest.Mock).mockReturnValue(true)
  })

  describe('rendering', () => {
    it('should render nothing when no items are selected', () => {
      const { container } = render(
        <BulkActions {...defaultProps} selectedIds={[]} />
      )
      
      expect(container.firstChild).toBeNull()
    })

    it('should render bulk actions bar when items are selected', () => {
      render(<BulkActions {...defaultProps} />)
      
      expect(screen.getByTestId('badge')).toBeInTheDocument()
      expect(screen.getByText('3 selected')).toBeInTheDocument()
      expect(screen.getByText('items selected')).toBeInTheDocument()
    })

    it('should render singular form for single item', () => {
      render(<BulkActions {...defaultProps} selectedIds={['1']} />)
      
      expect(screen.getByText('1 selected')).toBeInTheDocument()
      expect(screen.getByText('item selected')).toBeInTheDocument()
    })

    it('should render first 3 actions by default', () => {
      render(<BulkActions {...defaultProps} />)
      
      expect(screen.getByText('Export')).toBeInTheDocument()
      expect(screen.getByText('Send Email')).toBeInTheDocument()
      expect(screen.getByText('Activate')).toBeInTheDocument()
      expect(screen.queryByText('Suspend')).not.toBeInTheDocument()
      expect(screen.queryByText('Delete')).not.toBeInTheDocument()
    })

    it('should render More button when there are more than 3 actions', () => {
      render(<BulkActions {...defaultProps} />)
      
      expect(screen.getByText('More')).toBeInTheDocument()
      expect(screen.getByTestId('more-horizontal')).toBeInTheDocument()
    })

    it('should not render More button when there are 3 or fewer actions', () => {
      const fewActions = mockActions.slice(0, 3)
      render(<BulkActions {...defaultProps} actions={fewActions} />)
      
      expect(screen.queryByText('More')).not.toBeInTheDocument()
    })

    it('should render Clear button', () => {
      render(<BulkActions {...defaultProps} />)
      
      expect(screen.getByText('Clear')).toBeInTheDocument()
      expect(screen.getByTestId('x-icon')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <BulkActions {...defaultProps} className="custom-class" />
      )
      
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('action buttons', () => {
    it('should render action buttons with correct variants', () => {
      render(<BulkActions {...defaultProps} />)
      
      const exportButton = screen.getByText('Export').closest('button')
      const emailButton = screen.getByText('Send Email').closest('button')
      const activateButton = screen.getByText('Activate').closest('button')
      
      expect(exportButton).toHaveAttribute('data-variant', 'default')
      expect(emailButton).toHaveAttribute('data-variant', 'default')
      expect(activateButton).toHaveAttribute('data-variant', 'default')
    })

    it('should render destructive buttons with correct variant', async () => {
      const user = userEvent.setup()
      render(<BulkActions {...defaultProps} />)
      
      // Show all actions
      await user.click(screen.getByText('More'))
      
      const suspendButton = screen.getByText('Suspend').closest('button')
      const deleteButton = screen.getByText('Delete').closest('button')
      
      expect(suspendButton).toHaveAttribute('data-variant', 'destructive')
      expect(deleteButton).toHaveAttribute('data-variant', 'destructive')
    })

    it('should render action icons', () => {
      render(<BulkActions {...defaultProps} />)
      
      expect(screen.getByTestId('download-icon')).toBeInTheDocument()
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument()
      expect(screen.getByTestId('user-check-icon')).toBeInTheDocument()
    })

    it('should disable buttons when isExecuting', async () => {
      const user = userEvent.setup()
      const slowAction = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      const actionsWithSlowAction = [{ ...mockActions[0], action: slowAction }]
      
      render(<BulkActions {...defaultProps} actions={actionsWithSlowAction} />)
      
      const exportButton = screen.getByText('Export').closest('button')!
      await user.click(exportButton)
      
      expect(exportButton).toBeDisabled()
    })

    it('should disable specific actions when marked as disabled', () => {
      const actionsWithDisabled = [
        { ...mockActions[0], disabled: true }
      ]
      
      render(<BulkActions {...defaultProps} actions={actionsWithDisabled} />)
      
      const exportButton = screen.getByText('Export').closest('button')
      expect(exportButton).toBeDisabled()
    })
  })

  describe('action execution', () => {
    it('should call action function when button is clicked', async () => {
      const user = userEvent.setup()
      render(<BulkActions {...defaultProps} />)
      
      await user.click(screen.getByText('Export'))
      
      expect(mockActions[0].action).toHaveBeenCalledWith(['1', '2', '3'])
    })

    it('should not execute disabled actions', async () => {
      const user = userEvent.setup()
      const actionsWithDisabled = [
        { ...mockActions[0], disabled: true }
      ]
      
      render(<BulkActions {...defaultProps} actions={actionsWithDisabled} />)
      
      await user.click(screen.getByText('Export'))
      
      expect(mockActions[0].action).not.toHaveBeenCalled()
    })

    it('should show confirmation for actions requiring confirmation', async () => {
      const user = userEvent.setup()
      render(<BulkActions {...defaultProps} />)
      
      // Show all actions
      await user.click(screen.getByText('More'))
      await user.click(screen.getByText('Suspend'))
      
      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to perform this action on 3 selected items? This action cannot be undone.'
      )
      expect(mockActions[3].action).toHaveBeenCalledWith(['1', '2', '3'])
    })

    it('should use custom confirmation message when provided', async () => {
      const user = userEvent.setup()
      render(<BulkActions {...defaultProps} />)
      
      // Show all actions
      await user.click(screen.getByText('More'))
      await user.click(screen.getByText('Delete'))
      
      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete these items permanently?'
      )
    })

    it('should not execute action when confirmation is cancelled', async () => {
      const user = userEvent.setup()
      ;(window.confirm as jest.Mock).mockReturnValue(false)
      
      render(<BulkActions {...defaultProps} />)
      
      // Show all actions
      await user.click(screen.getByText('More'))
      await user.click(screen.getByText('Suspend'))
      
      expect(window.confirm).toHaveBeenCalled()
      expect(mockActions[3].action).not.toHaveBeenCalled()
    })

    it('should handle async actions', async () => {
      const user = userEvent.setup()
      const asyncAction = jest.fn().mockResolvedValue(undefined)
      const actionsWithAsync = [{ ...mockActions[0], action: asyncAction }]
      
      render(<BulkActions {...defaultProps} actions={actionsWithAsync} />)
      
      await user.click(screen.getByText('Export'))
      
      await waitFor(() => {
        expect(asyncAction).toHaveBeenCalledWith(['1', '2', '3'])
      })
    })

    it('should handle action errors gracefully', async () => {
      const user = userEvent.setup()
      const errorAction = jest.fn().mockRejectedValue(new Error('Action failed'))
      const actionsWithError = [{ ...mockActions[0], action: errorAction }]
      
      render(<BulkActions {...defaultProps} actions={actionsWithError} />)
      
      await user.click(screen.getByText('Export'))
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Bulk action failed:', expect.any(Error))
      })
    })
  })

  describe('show more/less functionality', () => {
    it('should show all actions when More is clicked', async () => {
      const user = userEvent.setup()
      render(<BulkActions {...defaultProps} />)
      
      expect(screen.queryByText('Suspend')).not.toBeInTheDocument()
      
      await user.click(screen.getByText('More'))
      
      expect(screen.getByText('Suspend')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('should show Less button when all actions are shown', async () => {
      const user = userEvent.setup()
      render(<BulkActions {...defaultProps} />)
      
      await user.click(screen.getByText('More'))
      
      expect(screen.getByText('Less')).toBeInTheDocument()
      expect(screen.queryByText('More')).not.toBeInTheDocument()
    })

    it('should hide extra actions when Less is clicked', async () => {
      const user = userEvent.setup()
      render(<BulkActions {...defaultProps} />)
      
      await user.click(screen.getByText('More'))
      expect(screen.getByText('Suspend')).toBeInTheDocument()
      
      await user.click(screen.getByText('Less'))
      expect(screen.queryByText('Suspend')).not.toBeInTheDocument()
    })

    it('should disable More/Less buttons when executing', async () => {
      const user = userEvent.setup()
      const slowAction = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      const actionsWithSlowAction = [{ ...mockActions[0], action: slowAction }, ...mockActions.slice(1)]
      
      render(<BulkActions {...defaultProps} actions={actionsWithSlowAction} />)
      
      const exportButton = screen.getByText('Export').closest('button')!
      await user.click(exportButton)
      
      const moreButton = screen.getByText('More').closest('button')
      expect(moreButton).toBeDisabled()
    })
  })

  describe('clear selection', () => {
    it('should call onClearSelection when Clear is clicked', async () => {
      const user = userEvent.setup()
      const onClearSelection = jest.fn()
      render(<BulkActions {...defaultProps} onClearSelection={onClearSelection} />)
      
      await user.click(screen.getByText('Clear'))
      
      expect(onClearSelection).toHaveBeenCalled()
    })

    it('should disable Clear button when executing', async () => {
      const user = userEvent.setup()
      const slowAction = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      const actionsWithSlowAction = [{ ...mockActions[0], action: slowAction }]
      
      render(<BulkActions {...defaultProps} actions={actionsWithSlowAction} />)
      
      const exportButton = screen.getByText('Export').closest('button')!
      await user.click(exportButton)
      
      const clearButton = screen.getByText('Clear').closest('button')
      expect(clearButton).toBeDisabled()
    })
  })

  describe('selected count display', () => {
    it('should show correct count for different numbers', () => {
      const { rerender } = render(<BulkActions {...defaultProps} selectedIds={['1']} />)
      expect(screen.getByText('1 selected')).toBeInTheDocument()
      
      rerender(<BulkActions {...defaultProps} selectedIds={['1', '2']} />)
      expect(screen.getByText('2 selected')).toBeInTheDocument()
      
      rerender(<BulkActions {...defaultProps} selectedIds={['1', '2', '3', '4', '5']} />)
      expect(screen.getByText('5 selected')).toBeInTheDocument()
    })

    it('should respect maxSelectedDisplay parameter', () => {
      render(<BulkActions {...defaultProps} selectedIds={['1', '2', '3', '4', '5']} maxSelectedDisplay={3} />)
      
      expect(screen.getByText('5 selected')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<BulkActions {...defaultProps} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper button labels', () => {
      render(<BulkActions {...defaultProps} />)
      
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /send email/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /activate/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /more/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<BulkActions {...defaultProps} />)
      
      // Tab through buttons
      await user.tab()
      expect(screen.getByRole('button', { name: /export/i })).toHaveFocus()
      
      await user.tab()
      expect(screen.getByRole('button', { name: /send email/i })).toHaveFocus()
    })
  })

  describe('createUserBulkActions helper', () => {
    const mockHandlers = {
      onExport: jest.fn(),
      onSuspend: jest.fn(),
      onActivate: jest.fn(),
      onDelete: jest.fn(),
      onSendEmail: jest.fn()
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should create correct bulk actions configuration', () => {
      const actions = createUserBulkActions(
        mockHandlers.onExport,
        mockHandlers.onSuspend,
        mockHandlers.onActivate,
        mockHandlers.onDelete,
        mockHandlers.onSendEmail
      )
      
      expect(actions).toHaveLength(5)
      expect(actions[0]).toMatchObject({
        id: 'export',
        label: 'Export',
        icon: Download
      })
      expect(actions[1]).toMatchObject({
        id: 'send-email',
        label: 'Send Email',
        icon: Mail
      })
      expect(actions[2]).toMatchObject({
        id: 'activate',
        label: 'Activate',
        icon: UserCheck
      })
      expect(actions[3]).toMatchObject({
        id: 'suspend',
        label: 'Suspend',
        icon: UserX,
        variant: 'destructive',
        requiresConfirmation: true
      })
      expect(actions[4]).toMatchObject({
        id: 'delete',
        label: 'Delete',
        icon: Trash2,
        variant: 'destructive',
        requiresConfirmation: true
      })
    })

    it('should call correct handlers when actions are executed', async () => {
      const user = userEvent.setup()
      const actions = createUserBulkActions(
        mockHandlers.onExport,
        mockHandlers.onSuspend,
        mockHandlers.onActivate,
        mockHandlers.onDelete,
        mockHandlers.onSendEmail
      )
      
      render(<BulkActions {...defaultProps} actions={actions} />)
      
      // Test export action
      await user.click(screen.getByText('Export'))
      expect(mockHandlers.onExport).toHaveBeenCalledWith(['1', '2', '3'])
      
      // Test send email action
      await user.click(screen.getByText('Send Email'))
      expect(mockHandlers.onSendEmail).toHaveBeenCalledWith(['1', '2', '3'])
      
      // Test activate action
      await user.click(screen.getByText('Activate'))
      expect(mockHandlers.onActivate).toHaveBeenCalledWith(['1', '2', '3'])
    })

    it('should show confirmation for destructive actions', async () => {
      const user = userEvent.setup()
      const actions = createUserBulkActions(
        mockHandlers.onExport,
        mockHandlers.onSuspend,
        mockHandlers.onActivate,
        mockHandlers.onDelete,
        mockHandlers.onSendEmail
      )
      
      render(<BulkActions {...defaultProps} actions={actions} />)
      
      // Show all actions
      await user.click(screen.getByText('More'))
      
      // Test suspend confirmation
      await user.click(screen.getByText('Suspend'))
      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to suspend the selected users? They will lose access to the platform until reactivated.'
      )
      
      // Test delete confirmation
      await user.click(screen.getByText('Delete'))
      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to permanently delete the selected users? This action cannot be undone and will remove all their data.'
      )
    })
  })

  describe('edge cases', () => {
    it('should handle empty actions array', () => {
      render(<BulkActions {...defaultProps} actions={[]} />)
      
      expect(screen.getByText('3 selected')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /export/i })).not.toBeInTheDocument()
    })

    it('should handle actions without icons', () => {
      const actionsWithoutIcons = [
        { id: 'test', label: 'Test Action', action: jest.fn() }
      ]
      
      render(<BulkActions {...defaultProps} actions={actionsWithoutIcons} />)
      
      expect(screen.getByText('Test Action')).toBeInTheDocument()
    })

    it('should handle very large selection counts', () => {
      const largeSelection = Array.from({ length: 1000 }, (_, i) => i.toString())
      
      render(<BulkActions {...defaultProps} selectedIds={largeSelection} />)
      
      expect(screen.getByText('1000 selected')).toBeInTheDocument()
    })

    it('should handle confirmation for single item', async () => {
      const user = userEvent.setup()
      render(<BulkActions {...defaultProps} selectedIds={['1']} />)
      
      // Show all actions
      await user.click(screen.getByText('More'))
      await user.click(screen.getByText('Suspend'))
      
      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to perform this action on 1 selected item? This action cannot be undone.'
      )
    })
  })
})