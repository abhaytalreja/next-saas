import { NotificationCenter, NotificationTrigger, Button } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { useState } from 'react'
import { Mail, CheckCircle, AlertTriangle, XCircle, User } from 'lucide-react'

const sampleNotifications = [
  {
    id: '1',
    title: 'Welcome to NextSaaS!',
    message: 'Thanks for joining us. Get started by exploring our features.',
    type: 'info' as const,
    read: false,
    createdAt: new Date('2024-01-16T10:30:00'),
    icon: Mail,
    actionUrl: '/onboarding',
    actionLabel: 'Get Started',
  },
  {
    id: '2',
    title: 'Payment Successful',
    message: 'Your subscription has been renewed for another month.',
    type: 'success' as const,
    read: false,
    createdAt: new Date('2024-01-16T09:15:00'),
    icon: CheckCircle,
  },
  {
    id: '3',
    title: 'Storage Almost Full',
    message: 'You are using 90% of your storage space. Consider upgrading.',
    type: 'warning' as const,
    read: true,
    createdAt: new Date('2024-01-15T14:20:00'),
    icon: AlertTriangle,
    actionUrl: '/upgrade',
    actionLabel: 'Upgrade Now',
  },
  {
    id: '4',
    title: 'New Team Member',
    message: 'Jane Smith has joined your team as a developer.',
    type: 'info' as const,
    read: true,
    createdAt: new Date('2024-01-15T11:00:00'),
    icon: User,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
  },
  {
    id: '5',
    title: 'Failed Login Attempt',
    message: 'Someone attempted to log into your account from an unknown device.',
    type: 'error' as const,
    read: true,
    createdAt: new Date('2024-01-14T18:45:00'),
    icon: XCircle,
    actionUrl: '/security',
    actionLabel: 'Review Security',
  },
]

const BasicExample = () => {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(sampleNotifications)

  const handleMarkRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleDelete = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="flex items-center gap-4">
      <NotificationTrigger
        count={unreadCount}
        onClick={() => setOpen(!open)}
      />
      
      <NotificationCenter
        notifications={notifications}
        open={open}
        onOpenChange={setOpen}
        onNotificationRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        onDeleteNotification={handleDelete}
        onNotificationClick={(notification) => {
          console.log('Notification clicked:', notification)
        }}
        onNotificationAction={(notification) => {
          console.log('Notification action clicked:', notification)
        }}
      />
    </div>
  )
}

const PositionExample = () => {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>('top-right')

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant={position === 'top-right' ? 'default' : 'outline'}
          onClick={() => setPosition('top-right')}
        >
          Top Right
        </Button>
        <Button 
          size="sm" 
          variant={position === 'top-left' ? 'default' : 'outline'}
          onClick={() => setPosition('top-left')}
        >
          Top Left
        </Button>
        <Button 
          size="sm" 
          variant={position === 'bottom-right' ? 'default' : 'outline'}
          onClick={() => setPosition('bottom-right')}
        >
          Bottom Right
        </Button>
        <Button 
          size="sm" 
          variant={position === 'bottom-left' ? 'default' : 'outline'}
          onClick={() => setPosition('bottom-left')}
        >
          Bottom Left
        </Button>
      </div>

      <NotificationTrigger
        count={2}
        onClick={() => setOpen(!open)}
      />
      
      <NotificationCenter
        notifications={sampleNotifications.slice(0, 3)}
        open={open}
        onOpenChange={setOpen}
        position={position}
      />
    </div>
  )
}

const FilteringExample = () => {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-4">
      <NotificationTrigger
        count={5}
        onClick={() => setOpen(!open)}
      />
      
      <NotificationCenter
        notifications={sampleNotifications}
        open={open}
        onOpenChange={setOpen}
        showFilters={true}
        showMarkAllRead={true}
        showClearAll={true}
        onNotificationClick={(notification) => {
          console.log('Clicked:', notification.title)
        }}
      />
    </div>
  )
}

const CompactExample = () => {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-4">
      <NotificationTrigger
        count={3}
        onClick={() => setOpen(!open)}
      />
      
      <NotificationCenter
        notifications={sampleNotifications.slice(0, 3)}
        open={open}
        onOpenChange={setOpen}
        maxHeight={250}
        showFilters={false}
        groupByDate={false}
        emptyMessage="No notifications to show"
      />
    </div>
  )
}

const examples = [
  {
    title: 'Basic Notification Center',
    code: `const [open, setOpen] = useState(false)
const [notifications, setNotifications] = useState(sampleNotifications)

const handleMarkRead = (notificationId) => {
  setNotifications(prev =>
    prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
  )
}

const unreadCount = notifications.filter(n => !n.read).length

<>
  <NotificationTrigger
    count={unreadCount}
    onClick={() => setOpen(!open)}
  />
  
  <NotificationCenter
    notifications={notifications}
    open={open}
    onOpenChange={setOpen}
    onNotificationRead={handleMarkRead}
    onMarkAllRead={() => {/* mark all read */}}
    onDeleteNotification={(id) => {/* delete notification */}}
  />
</>`,
    component: <BasicExample />,
  },
  {
    title: 'Different Positions',
    code: `<NotificationCenter
  notifications={notifications}
  open={open}
  onOpenChange={setOpen}
  position="top-left" // or "top-right", "bottom-left", "bottom-right"
/>`,
    component: <PositionExample />,
  },
  {
    title: 'With Filtering Options',
    code: `<NotificationCenter
  notifications={notifications}
  open={open}
  onOpenChange={setOpen}
  showFilters={true}
  showMarkAllRead={true}
  showClearAll={true}
  onNotificationClick={(notification) => {
    console.log('Clicked:', notification.title)
  }}
/>`,
    component: <FilteringExample />,
  },
  {
    title: 'Compact Version',
    code: `<NotificationCenter
  notifications={notifications}
  open={open}
  onOpenChange={setOpen}
  maxHeight={250}
  showFilters={false}
  groupByDate={false}
  emptyMessage="No notifications to show"
/>`,
    component: <CompactExample />,
  },
]

export default function NotificationCenterPage() {
  return (
    <ComponentLayout
      title="Notification Center"
      description="A comprehensive notification system with filtering, grouping, and action support for managing user notifications."
      examples={examples}
    />
  )
}