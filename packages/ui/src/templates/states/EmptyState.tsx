import { forwardRef } from 'react'
import { Search, Plus, FileText, Users, Database, Inbox, AlertCircle, Wifi } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'search' | 'create' | 'error' | 'offline' | 'loading'
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  actions?: Array<{
    label: string
    variant?: 'primary' | 'secondary' | 'outline'
    onClick?: () => void
    href?: string
    icon?: React.ComponentType<{ className?: string }>
  }>
  image?: string
  size?: 'sm' | 'md' | 'lg'
  compact?: boolean
}

const getDefaultIcon = (variant: EmptyStateProps['variant']) => {
  switch (variant) {
    case 'search':
      return Search
    case 'create':
      return Plus
    case 'error':
      return AlertCircle
    case 'offline':
      return Wifi
    case 'loading':
      return Database
    default:
      return Inbox
  }
}

const getIconStyles = (variant: EmptyStateProps['variant']) => {
  switch (variant) {
    case 'error':
      return 'text-destructive'
    case 'offline':
      return 'text-warning'
    case 'loading':
      return 'text-muted-foreground animate-pulse'
    default:
      return 'text-muted-foreground'
  }
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ 
    variant = 'default',
    icon: IconProp,
    title,
    description,
    actions = [],
    image,
    size = 'md',
    compact = false,
    className,
    children,
    ...props 
  }, ref) => {
    const Icon = IconProp || getDefaultIcon(variant)

    const sizeStyles = {
      sm: {
        container: compact ? 'py-6' : 'py-8',
        icon: 'h-8 w-8',
        image: 'h-16 w-16',
        title: 'text-lg',
        description: 'text-sm',
        gap: 'space-y-2',
      },
      md: {
        container: compact ? 'py-8' : 'py-12',
        icon: 'h-12 w-12',
        image: 'h-24 w-24',
        title: 'text-xl',
        description: 'text-base',
        gap: 'space-y-3',
      },
      lg: {
        container: compact ? 'py-12' : 'py-16',
        icon: 'h-16 w-16',
        image: 'h-32 w-32',
        title: 'text-2xl',
        description: 'text-lg',
        gap: 'space-y-4',
      },
    }

    const styles = sizeStyles[size]

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          styles.container,
          styles.gap,
          className
        )}
        {...props}
      >
        {/* Image or Icon */}
        {image ? (
          <img
            src={image}
            alt=""
            className={cn('object-contain', styles.image)}
          />
        ) : (
          <div className={cn(
            'rounded-full bg-muted p-3',
            size === 'sm' ? 'p-2' : size === 'lg' ? 'p-4' : 'p-3'
          )}>
            <Icon className={cn(
              styles.icon,
              getIconStyles(variant)
            )} />
          </div>
        )}

        {/* Content */}
        <div className={compact ? 'space-y-1' : 'space-y-2'}>
          <h3 className={cn(
            'font-semibold text-foreground',
            styles.title
          )}>
            {title}
          </h3>
          
          {description && (
            <p className={cn(
              'text-muted-foreground max-w-md',
              styles.description
            )}>
              {description}
            </p>
          )}
        </div>

        {/* Custom children content */}
        {children}

        {/* Actions */}
        {actions.length > 0 && (
          <div className={cn(
            'flex flex-col sm:flex-row items-center gap-3',
            compact && 'gap-2'
          )}>
            {actions.map((action, index) => {
              const ActionIcon = action.icon
              const buttonContent = (
                <>
                  {ActionIcon && <ActionIcon className="h-4 w-4" />}
                  {action.label}
                </>
              )

              const buttonClass = cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                action.variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
                action.variant === 'outline' && 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                (!action.variant || action.variant === 'secondary') && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                compact && 'px-3 py-1.5 text-xs'
              )

              if (action.href) {
                return (
                  <a
                    key={index}
                    href={action.href}
                    className={buttonClass}
                  >
                    {buttonContent}
                  </a>
                )
              }

              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={buttonClass}
                >
                  {buttonContent}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }
)

EmptyState.displayName = 'EmptyState'

// Pre-configured variants for common use cases
export const SearchEmptyState = forwardRef<HTMLDivElement, Omit<EmptyStateProps, 'variant' | 'icon'>>(
  ({ title = "No results found", description = "Try adjusting your search criteria or explore different keywords.", ...props }, ref) => (
    <EmptyState
      ref={ref}
      variant="search"
      title={title}
      description={description}
      {...props}
    />
  )
)

SearchEmptyState.displayName = 'SearchEmptyState'

export const CreateEmptyState = forwardRef<HTMLDivElement, Omit<EmptyStateProps, 'variant' | 'icon'>>(
  (props, ref) => (
    <EmptyState
      ref={ref}
      variant="create"
      {...props}
    />
  )
)

CreateEmptyState.displayName = 'CreateEmptyState'

export const ErrorEmptyState = forwardRef<HTMLDivElement, Omit<EmptyStateProps, 'variant' | 'icon'>>(
  ({ title = "Something went wrong", description = "We encountered an error while loading this content. Please try again.", ...props }, ref) => (
    <EmptyState
      ref={ref}
      variant="error"
      title={title}
      description={description}
      {...props}
    />
  )
)

ErrorEmptyState.displayName = 'ErrorEmptyState'

export const OfflineEmptyState = forwardRef<HTMLDivElement, Omit<EmptyStateProps, 'variant' | 'icon'>>(
  ({ title = "You're offline", description = "Please check your internet connection and try again.", ...props }, ref) => (
    <EmptyState
      ref={ref}
      variant="offline"
      title={title}
      description={description}
      {...props}
    />
  )
)

OfflineEmptyState.displayName = 'OfflineEmptyState'

export const LoadingEmptyState = forwardRef<HTMLDivElement, Omit<EmptyStateProps, 'variant' | 'icon'>>(
  ({ title = "Loading...", description = "Please wait while we fetch your data.", ...props }, ref) => (
    <EmptyState
      ref={ref}
      variant="loading"
      title={title}
      description={description}
      {...props}
    />
  )
)

LoadingEmptyState.displayName = 'LoadingEmptyState'

// Specific domain empty states
export const NoDataEmptyState = forwardRef<HTMLDivElement, Omit<EmptyStateProps, 'variant' | 'icon' | 'title'>>(
  (props, ref) => (
    <EmptyState
      ref={ref}
      icon={Database}
      title="No data available"
      description="There's no data to display at the moment."
      {...props}
    />
  )
)

NoDataEmptyState.displayName = 'NoDataEmptyState'

export const NoUsersEmptyState = forwardRef<HTMLDivElement, Omit<EmptyStateProps, 'variant' | 'icon' | 'title'>>(
  (props, ref) => (
    <EmptyState
      ref={ref}
      icon={Users}
      title="No users found"
      description="Start by inviting team members to collaborate."
      {...props}
    />
  )
)

NoUsersEmptyState.displayName = 'NoUsersEmptyState'

export const NoFilesEmptyState = forwardRef<HTMLDivElement, Omit<EmptyStateProps, 'variant' | 'icon' | 'title'>>(
  (props, ref) => (
    <EmptyState
      ref={ref}
      icon={FileText}
      title="No files uploaded"
      description="Upload your first file to get started."
      {...props}
    />
  )
)

NoFilesEmptyState.displayName = 'NoFilesEmptyState'