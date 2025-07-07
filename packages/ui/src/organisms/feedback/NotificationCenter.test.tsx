import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../test-utils'
import { NotificationCenter, NotificationTrigger, Notification } from './NotificationCenter'
import { testAccessibility } from '../../test-utils'
import { Bell, User } from 'lucide-react'

// Mock data for testing
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New message',
    message: 'You have received a new message from John Doe',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
  },
  {
    id: '2',
    title: 'Task completed',
    message: 'Your task "Update documentation" has been completed',
    type: 'success',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    actionUrl: '/tasks/123',
    actionLabel: 'View task',
  },
  {
    id: '3',
    title: 'Warning',
    message: 'Your subscription will expire in 3 days',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    id: '4',
    title: 'Error occurred',
    message: 'Failed to sync data. Please try again.',
    type: 'error',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    avatar: 'https://example.com/avatar.jpg',
  },
]

describe('NotificationCenter Component', () => {
  describe('Rendering', () => {
    it('does not render when open is false', () => {
      render(<NotificationCenter notifications={mockNotifications} open={false} />)
      expect(screen.queryByText('Notifications')).not.toBeInTheDocument()
    })

    it('renders when open is true', () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} />)
      expect(screen.getByText('Notifications')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} className="custom-center" />)
      const panel = screen.getByText('Notifications').closest('div')
      expect(panel).toHaveClass('custom-center')
    })

    it('renders backdrop when open', () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} />)
      const backdrop = document.querySelector('.fixed.inset-0')
      expect(backdrop).toBeInTheDocument()
    })
  })

  describe('Header', () => {
    it('renders notification header with title', () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} />)
      expect(screen.getByText('Notifications')).toBeInTheDocument()
    })

    it('shows unread count badge', () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} />)
      // 3 unread notifications from mock data
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('does not show badge when all notifications are read', () => {
      const readNotifications = mockNotifications.map(n => ({ ...n, read: true }))
      render(<NotificationCenter notifications={readNotifications} open={true} />)
      expect(screen.queryByText('3')).not.toBeInTheDocument()
    })

    it('renders close button and handles close', () => {
      const onOpenChange = jest.fn()
      render(<NotificationCenter notifications={mockNotifications} open={true} onOpenChange={onOpenChange} />)
      
      const closeButton = screen.getByRole('button', { name: '' }) // X button has no text
      fireEvent.click(closeButton)
      
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('Filters', () => {
    it('renders filter controls when showFilters is true', () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} showFilters={true} />)
      
      expect(screen.getByDisplayValue('All')).toBeInTheDocument()
      expect(screen.getByDisplayValue('All types')).toBeInTheDocument()
    })

    it('does not render filters when showFilters is false', () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} showFilters={false} />)
      
      expect(screen.queryByDisplayValue('All')).not.toBeInTheDocument()
    })

    it('filters notifications by read status', async () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} />)
      
      const statusFilter = screen.getByDisplayValue('All')
      fireEvent.change(statusFilter, { target: { value: 'unread' } })
      
      // Should show only unread notifications
      expect(screen.getByText('New message')).toBeInTheDocument()
      expect(screen.getByText('Warning')).toBeInTheDocument()
      expect(screen.queryByText('Task completed')).not.toBeInTheDocument()
    })

    it('filters notifications by type', async () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} />)
      
      const typeFilter = screen.getByDisplayValue('All types')
      fireEvent.change(typeFilter, { target: { value: 'success' } })
      
      // Should show only success notifications
      expect(screen.getByText('Task completed')).toBeInTheDocument()
      expect(screen.queryByText('New message')).not.toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('renders mark all read button when there are unread notifications', () => {
      const onMarkAllRead = jest.fn()
      render(
        <NotificationCenter 
          notifications={mockNotifications} 
          open={true} 
          onMarkAllRead={onMarkAllRead}
          showMarkAllRead={true}
        />
      )
      
      expect(screen.getByText('Mark all read')).toBeInTheDocument()
    })

    it('renders clear all button when there are unread notifications', () => {
      const onClearAll = jest.fn()
      render(
        <NotificationCenter 
          notifications={mockNotifications} 
          open={true} 
          onClearAll={onClearAll}
          showClearAll={true}
        />
      )
      
      expect(screen.getByText('Clear all')).toBeInTheDocument()
    })

    it('calls onMarkAllRead when mark all read is clicked', () => {
      const onMarkAllRead = jest.fn()
      render(
        <NotificationCenter 
          notifications={mockNotifications} 
          open={true} 
          onMarkAllRead={onMarkAllRead}
        />
      )
      
      fireEvent.click(screen.getByText('Mark all read'))
      expect(onMarkAllRead).toHaveBeenCalled()
    })

    it('calls onClearAll when clear all is clicked', () => {
      const onClearAll = jest.fn()
      render(
        <NotificationCenter 
          notifications={mockNotifications} 
          open={true} 
          onClearAll={onClearAll}
        />
      )
      
      fireEvent.click(screen.getByText('Clear all'))
      expect(onClearAll).toHaveBeenCalled()
    })

    it('does not show action buttons when all notifications are read', () => {
      const readNotifications = mockNotifications.map(n => ({ ...n, read: true }))
      render(<NotificationCenter notifications={readNotifications} open={true} />)
      
      expect(screen.queryByText('Mark all read')).not.toBeInTheDocument()
      expect(screen.queryByText('Clear all')).not.toBeInTheDocument()
    })
  })

  describe('Notifications List', () => {
    it('renders all notifications', () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} />)
      
      expect(screen.getByText('New message')).toBeInTheDocument()
      expect(screen.getByText('Task completed')).toBeInTheDocument()
      expect(screen.getByText('Warning')).toBeInTheDocument()
      expect(screen.getByText('Error occurred')).toBeInTheDocument()
    })

    it('shows loading state', () => {
      render(<NotificationCenter notifications={[]} open={true} loading={true} />)
      
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('shows empty state when no notifications', () => {
      render(<NotificationCenter notifications={[]} open={true} />)
      
      expect(screen.getByText('No notifications')).toBeInTheDocument()
    })

    it('shows custom empty message', () => {
      render(<NotificationCenter notifications={[]} open={true} emptyMessage="All caught up!" />)
      
      expect(screen.getByText('All caught up!')).toBeInTheDocument()
    })

    it('groups notifications by date when groupByDate is true', () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} groupByDate={true} />)
      
      expect(screen.getByText('Today')).toBeInTheDocument()
      expect(screen.getByText('Yesterday')).toBeInTheDocument()
      expect(screen.getByText('This week')).toBeInTheDocument()
    })

    it('does not group when groupByDate is false', () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} groupByDate={false} />)
      
      expect(screen.queryByText('Today')).not.toBeInTheDocument()
      expect(screen.queryByText('Yesterday')).not.toBeInTheDocument()
    })
  })

  describe('Individual Notifications', () => {
    it('renders notification with avatar', () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} />)
      
      const avatar = screen.getByAltText('')
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })

    it('renders notification with type icon when no avatar', () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} />)
      
      // Should have icons for different notification types
      const icons = document.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('shows unread indicator for unread notifications', () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} />)
      
      // Check for unread dots (there should be 3 for unread notifications)
      const unreadDots = document.querySelectorAll('.bg-primary.rounded-full')
      expect(unreadDots.length).toBeGreaterThan(0)
    })

    it('applies different styles for unread notifications', () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} />)
      
      const newMessageItem = screen.getByText('New message').closest('div')
      expect(newMessageItem).toHaveClass('bg-primary/5')
    })

    it('calls onNotificationClick when notification is clicked', () => {
      const onNotificationClick = jest.fn()
      render(
        <NotificationCenter 
          notifications={mockNotifications} 
          open={true} 
          onNotificationClick={onNotificationClick}
        />
      )
      
      fireEvent.click(screen.getByText('New message'))
      expect(onNotificationClick).toHaveBeenCalledWith(mockNotifications[0])
    })

    it('marks notification as read when clicked if unread', () => {
      const onNotificationRead = jest.fn()
      render(
        <NotificationCenter 
          notifications={mockNotifications} 
          open={true} 
          onNotificationRead={onNotificationRead}
        />
      )
      
      fireEvent.click(screen.getByText('New message'))
      expect(onNotificationRead).toHaveBeenCalledWith('1')
    })

    it('renders action button for notifications with actions', () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} />)
      
      expect(screen.getByText('View task')).toBeInTheDocument()
    })

    it('calls onNotificationAction when action button is clicked', () => {
      const onNotificationAction = jest.fn()
      render(
        <NotificationCenter 
          notifications={mockNotifications} 
          open={true} 
          onNotificationAction={onNotificationAction}
        />
      )
      
      fireEvent.click(screen.getByText('View task'))
      expect(onNotificationAction).toHaveBeenCalledWith(mockNotifications[1])
    })

    it('shows individual mark as read button for unread notifications', () => {
      const onNotificationRead = jest.fn()
      render(
        <NotificationCenter 
          notifications={mockNotifications} 
          open={true} 
          onNotificationRead={onNotificationRead}
        />
      )
      
      const markAsReadButtons = screen.getAllByTitle('Mark as read')
      expect(markAsReadButtons.length).toBeGreaterThan(0)
    })

    it('shows delete button when onDeleteNotification is provided', () => {
      const onDeleteNotification = jest.fn()
      render(
        <NotificationCenter 
          notifications={mockNotifications} 
          open={true} 
          onDeleteNotification={onDeleteNotification}
        />
      )
      
      const deleteButtons = screen.getAllByTitle('Delete')
      expect(deleteButtons.length).toBeGreaterThan(0)
      
      fireEvent.click(deleteButtons[0])
      expect(onDeleteNotification).toHaveBeenCalled()
    })

    it('prevents event propagation on action buttons', () => {
      const onNotificationClick = jest.fn()
      const onNotificationRead = jest.fn()
      
      render(
        <NotificationCenter 
          notifications={mockNotifications} 
          open={true} 
          onNotificationClick={onNotificationClick}
          onNotificationRead={onNotificationRead}
        />
      )
      
      const markAsReadButton = screen.getAllByTitle('Mark as read')[0]
      fireEvent.click(markAsReadButton)
      
      expect(onNotificationRead).toHaveBeenCalled()
      expect(onNotificationClick).not.toHaveBeenCalled()
    })
  })

  describe('Positioning', () => {
    it('applies correct position classes', () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} position="top-left" />)
      
      const panel = screen.getByText('Notifications').closest('div')
      expect(panel).toHaveClass('top-16', 'left-4')
    })

    it('applies bottom-right position', () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} position="bottom-right" />)
      
      const panel = screen.getByText('Notifications').closest('div')
      expect(panel).toHaveClass('bottom-4', 'right-4')
    })
  })

  describe('Backdrop Interaction', () => {
    it('closes when backdrop is clicked', () => {
      const onOpenChange = jest.fn()
      render(<NotificationCenter notifications={mockNotifications} open={true} onOpenChange={onOpenChange} />)
      
      const backdrop = document.querySelector('.fixed.inset-0')
      fireEvent.click(backdrop!)
      
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('Footer', () => {
    it('renders footer when there are notifications', () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} />)
      
      expect(screen.getByText('View all notifications')).toBeInTheDocument()
    })

    it('does not render footer when no notifications', () => {
      render(<NotificationCenter notifications={[]} open={true} />)
      
      expect(screen.queryByText('View all notifications')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      await testAccessibility(
        <NotificationCenter notifications={mockNotifications} open={true} />
      )
    })

    it('provides proper button roles and labels', () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} />)
      
      const markAsReadButtons = screen.getAllByTitle('Mark as read')
      markAsReadButtons.forEach(button => {
        expect(button).toHaveAttribute('title', 'Mark as read')
      })
    })
  })

  describe('Forwarded Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<NotificationCenter notifications={mockNotifications} open={true} ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('Time Formatting', () => {
    it('formats relative time correctly', () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} />)
      
      expect(screen.getByText('5m ago')).toBeInTheDocument()
      expect(screen.getByText('2h ago')).toBeInTheDocument()
      expect(screen.getByText('1d ago')).toBeInTheDocument()
    })
  })

  describe('Scrolling', () => {
    it('applies maxHeight style', () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} maxHeight={300} />)
      
      const scrollContainer = document.querySelector('.overflow-y-auto')
      expect(scrollContainer).toHaveStyle('max-height: 300px')
    })

    it('handles string maxHeight', () => {
      render(<NotificationCenter notifications={mockNotifications} open={true} maxHeight="50vh" />)
      
      const scrollContainer = document.querySelector('.overflow-y-auto')
      expect(scrollContainer).toHaveStyle('max-height: 50vh')
    })
  })
})

describe('NotificationTrigger Component', () => {
  describe('Rendering', () => {
    it('renders correctly with default bell icon', () => {
      render(<NotificationTrigger />)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(document.querySelector('[data-lucide="bell"]')).toBeInTheDocument()
    })

    it('renders with custom children', () => {
      render(
        <NotificationTrigger>
          <User className="h-5 w-5" />
        </NotificationTrigger>
      )
      
      expect(document.querySelector('[data-lucide="user"]')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<NotificationTrigger className="custom-trigger" />)
      expect(screen.getByRole('button')).toHaveClass('custom-trigger')
    })
  })

  describe('Count Badge', () => {
    it('shows count badge when count > 0', () => {
      render(<NotificationTrigger count={5} />)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('does not show badge when count is 0', () => {
      render(<NotificationTrigger count={0} />)
      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })

    it('shows "99+" when count exceeds maxCount', () => {
      render(<NotificationTrigger count={150} maxCount={99} />)
      expect(screen.getByText('99+')).toBeInTheDocument()
    })

    it('respects custom maxCount', () => {
      render(<NotificationTrigger count={60} maxCount={50} />)
      expect(screen.getByText('50+')).toBeInTheDocument()
    })

    it('does not show count when showCount is false', () => {
      render(<NotificationTrigger count={5} showCount={false} />)
      expect(screen.queryByText('5')).not.toBeInTheDocument()
    })

    it('shows exact count when below maxCount', () => {
      render(<NotificationTrigger count={25} maxCount={99} />)
      expect(screen.getByText('25')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('handles click events', () => {
      const onClick = jest.fn()
      render(<NotificationTrigger onClick={onClick} />)
      
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalled()
    })

    it('supports all button props', () => {
      render(<NotificationTrigger disabled title="Notifications" />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('title', 'Notifications')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      await testAccessibility(<NotificationTrigger count={5} />)
    })

    it('maintains button role', () => {
      render(<NotificationTrigger />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Forwarded Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<NotificationTrigger ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })
  })

  describe('Badge Styling', () => {
    it('applies correct badge classes', () => {
      render(<NotificationTrigger count={5} />)
      
      const badge = screen.getByText('5')
      expect(badge).toHaveClass('bg-destructive', 'text-destructive-foreground')
    })

    it('positions badge correctly', () => {
      render(<NotificationTrigger count={5} />)
      
      const badge = screen.getByText('5')
      expect(badge).toHaveClass('absolute', '-top-1', '-right-1')
    })
  })
})