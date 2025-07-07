import React, { forwardRef, useState, useMemo } from 'react'
import { Bell, X, Check, CheckCheck, Filter, MoreHorizontal, Trash2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: Date
  updatedAt?: Date
  icon?: React.ComponentType<{ className?: string }>
  avatar?: string
  actionUrl?: string
  actionLabel?: string
  metadata?: Record<string, any>
}

export interface NotificationGroup {
  label: string
  notifications: Notification[]
}

export interface NotificationCenterProps extends React.HTMLAttributes<HTMLDivElement> {
  notifications: Notification[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onNotificationRead?: (notificationId: string) => void
  onNotificationClick?: (notification: Notification) => void
  onNotificationAction?: (notification: Notification) => void
  onMarkAllRead?: () => void
  onClearAll?: () => void
  onDeleteNotification?: (notificationId: string) => void
  loading?: boolean
  emptyMessage?: string
  showMarkAllRead?: boolean
  showClearAll?: boolean
  showFilters?: boolean
  maxHeight?: string | number
  groupByDate?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return Check
    case 'warning':
      return Bell
    case 'error':
      return X
    default:
      return Bell
  }
}

const getTypeStyles = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'warning':
      return 'text-amber-600 bg-amber-50 border-amber-200'
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200'
    default:
      return 'text-blue-600 bg-blue-50 border-blue-200'
  }
}

const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  return date.toLocaleDateString()
}

const groupNotificationsByDate = (notifications: Notification[]): NotificationGroup[] => {
  const groups: Record<string, Notification[]> = {}
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  notifications.forEach(notification => {
    const notificationDate = new Date(
      notification.createdAt.getFullYear(),
      notification.createdAt.getMonth(),
      notification.createdAt.getDate()
    )

    let groupKey: string
    if (notificationDate.getTime() === today.getTime()) {
      groupKey = 'Today'
    } else if (notificationDate.getTime() === yesterday.getTime()) {
      groupKey = 'Yesterday'
    } else if (notificationDate >= weekAgo) {
      groupKey = 'This week'
    } else {
      groupKey = 'Earlier'
    }

    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(notification)
  })

  const orderedGroupKeys = ['Today', 'Yesterday', 'This week', 'Earlier']
  return orderedGroupKeys
    .filter(key => groups[key])
    .map(key => ({
      label: key,
      notifications: groups[key].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }))
}

export const NotificationCenter = forwardRef<HTMLDivElement, NotificationCenterProps>(
  ({ 
    notifications,
    open = false,
    onOpenChange,
    onNotificationRead,
    onNotificationClick,
    onNotificationAction,
    onMarkAllRead,
    onClearAll,
    onDeleteNotification,
    loading = false,
    emptyMessage = 'No notifications',
    showMarkAllRead = true,
    showClearAll = true,
    showFilters = true,
    maxHeight = 400,
    groupByDate = true,
    position = 'top-right',
    className,
    ...props 
  }, ref) => {
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
    const [typeFilter, setTypeFilter] = useState<Notification['type'] | 'all'>('all')

    const filteredNotifications = useMemo(() => {
      return notifications.filter(notification => {
        if (filter === 'unread' && notification.read) return false
        if (filter === 'read' && !notification.read) return false
        if (typeFilter !== 'all' && notification.type !== typeFilter) return false
        return true
      })
    }, [notifications, filter, typeFilter])

    const groupedNotifications = useMemo(() => {
      if (groupByDate) {
        return groupNotificationsByDate(filteredNotifications)
      }
      return [{ label: 'All', notifications: filteredNotifications }]
    }, [filteredNotifications, groupByDate])

    const unreadCount = notifications.filter(n => !n.read).length

    const handleNotificationClick = (notification: Notification) => {
      if (!notification.read) {
        onNotificationRead?.(notification.id)
      }
      onNotificationClick?.(notification)
    }

    const positionClasses = {
      'top-right': 'top-16 right-4',
      'top-left': 'top-16 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
    }

    if (!open) return null

    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 z-40"
          onClick={() => onOpenChange?.(false)}
        />
        
        {/* Notification Panel */}
        <div
          ref={ref}
          className={cn(
            'fixed z-50 w-96 bg-popover border border-border rounded-lg shadow-lg',
            positionClasses[position],
            className
          )}
          {...props}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </div>
            
            <button
              onClick={() => onOpenChange?.(false)}
              className="p-1 hover:bg-muted rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="flex items-center gap-2 p-4 border-b border-border">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-xs border border-input rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="text-xs border border-input rounded px-2 py-1"
              >
                <option value="all">All types</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
          )}

          {/* Actions */}
          {(showMarkAllRead || showClearAll) && unreadCount > 0 && (
            <div className="flex items-center gap-2 p-4 border-b border-border">
              {showMarkAllRead && onMarkAllRead && (
                <button
                  onClick={onMarkAllRead}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
              
              {showClearAll && onClearAll && (
                <button
                  onClick={onClearAll}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* Notifications List */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }}
          >
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin h-5 w-5 border-2 border-border border-t-foreground rounded-full" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
              </div>
            ) : (
              groupedNotifications.map((group, groupIndex) => (
                <div key={group.label}>
                  {groupByDate && group.notifications.length > 0 && (
                    <div className="px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border/50">
                      {group.label}
                    </div>
                  )}
                  
                  {group.notifications.map((notification) => {
                    const NotificationIcon = notification.icon || getNotificationIcon(notification.type)
                    
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          'flex gap-3 p-4 border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer',
                          !notification.read && 'bg-primary/5'
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        {/* Icon/Avatar */}
                        <div className="flex-shrink-0">
                          {notification.avatar ? (
                            <img
                              src={notification.avatar}
                              alt=""
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <div className={cn(
                              'h-8 w-8 rounded-full flex items-center justify-center border',
                              getTypeStyles(notification.type)
                            )}>
                              <NotificationIcon className="h-4 w-4" />
                            </div>
                          )}
                          {!notification.read && (
                            <div className="h-2 w-2 bg-primary rounded-full mt-1 mx-auto" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                'text-sm truncate',
                                !notification.read && 'font-medium'
                              )}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatRelativeTime(notification.createdAt)}
                                </span>
                                
                                {notification.actionUrl && notification.actionLabel && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onNotificationAction?.(notification)
                                    }}
                                    className="text-xs text-primary hover:text-primary/80"
                                  >
                                    {notification.actionLabel}
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              {!notification.read && onNotificationRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onNotificationRead(notification.id)
                                  }}
                                  className="p-1 hover:bg-muted rounded"
                                  title="Mark as read"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                              )}
                              
                              {onDeleteNotification && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDeleteNotification(notification.id)
                                  }}
                                  className="p-1 hover:bg-muted rounded"
                                  title="Delete"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                              
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 hover:bg-muted rounded"
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-border text-center">
              <button className="text-xs text-primary hover:text-primary/80">
                View all notifications
              </button>
            </div>
          )}
        </div>
      </>
    )
  }
)

NotificationCenter.displayName = 'NotificationCenter'

// Notification Trigger Component
export interface NotificationTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  count?: number
  showCount?: boolean
  maxCount?: number
}

export const NotificationTrigger = forwardRef<HTMLButtonElement, NotificationTriggerProps>(
  ({ count = 0, showCount = true, maxCount = 99, className, children, ...props }, ref) => {
    const displayCount = count > maxCount ? `${maxCount}+` : count

    return (
      <button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center p-2 rounded-md hover:bg-accent transition-colors',
          className
        )}
        {...props}
      >
        {children || <Bell className="h-5 w-5" />}
        
        {showCount && count > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-xs font-medium text-destructive-foreground min-w-[1.25rem] h-5">
            {displayCount}
          </span>
        )}
      </button>
    )
  }
)

NotificationTrigger.displayName = 'NotificationTrigger'