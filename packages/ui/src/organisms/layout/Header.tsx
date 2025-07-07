import React, { forwardRef } from 'react'
import { Bell, Search, Settings, User } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface HeaderAction {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick?: () => void
  href?: string
  badge?: string | number
  variant?: 'default' | 'ghost' | 'outline'
}

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  title?: string
  subtitle?: string
  brand?: {
    name: string
    logo?: string | React.ComponentType<{ className?: string }>
    href?: string
  }
  search?: {
    placeholder?: string
    onSearch?: (query: string) => void
    value?: string
  }
  actions?: HeaderAction[]
  user?: {
    name: string
    email?: string
    avatar?: string
    initials?: string
  }
  onUserMenuClick?: () => void
  variant?: 'default' | 'sticky' | 'floating'
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-12 px-4',
  md: 'h-16 px-6',
  lg: 'h-20 px-8',
}

const variantClasses = {
  default: 'bg-background border-b',
  sticky: 'sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b',
  floating: 'mx-4 mt-4 rounded-lg bg-background shadow-sm border',
}

export const Header = forwardRef<HTMLElement, HeaderProps>(
  ({ 
    title,
    subtitle,
    brand,
    search,
    actions = [],
    user,
    onUserMenuClick,
    variant = 'default',
    size = 'md',
    className,
    children,
    ...props 
  }, ref) => {
    const renderBrand = () => {
      if (!brand) return null

      const content = (
        <div className="flex items-center gap-3">
          {typeof brand.logo === 'string' ? (
            <img src={brand.logo} alt={brand.name} className="h-8 w-8" />
          ) : brand.logo ? (
            <brand.logo className="h-8 w-8" />
          ) : null}
          <span className="text-lg font-semibold text-foreground">
            {brand.name}
          </span>
        </div>
      )

      return brand.href ? (
        <a href={brand.href} className="flex-shrink-0">
          {content}
        </a>
      ) : (
        <div className="flex-shrink-0">{content}</div>
      )
    }

    const renderTitleSection = () => {
      if (!title) return null

      return (
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-foreground truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )
    }

    const renderSearch = () => {
      if (!search) return null

      return (
        <div className="relative flex-1 max-w-md mx-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={search.placeholder || 'Search...'}
            value={search.value}
            onChange={(e) => search.onSearch?.(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
      )
    }

    const renderActions = () => {
      if (actions.length === 0) return null

      return (
        <div className="flex items-center gap-2">
          {actions.map((action, index) => {
            const ActionIcon = action.icon
            const content = (
              <div className="relative">
                <button
                  onClick={action.onClick}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                    action.variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
                    action.variant === 'outline' && 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                    (!action.variant || action.variant === 'default') && 'bg-primary text-primary-foreground hover:bg-primary/90'
                  )}
                >
                  {ActionIcon && <ActionIcon className="h-4 w-4" />}
                  <span className="sr-only lg:not-sr-only">{action.label}</span>
                </button>
                {action.badge && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-xs font-medium text-destructive-foreground min-w-[1.25rem] h-5">
                    {action.badge}
                  </span>
                )}
              </div>
            )

            return action.href ? (
              <a key={index} href={action.href}>
                {content}
              </a>
            ) : (
              <div key={index}>{content}</div>
            )
          })}
        </div>
      )
    }

    const renderUser = () => {
      if (!user) return null

      return (
        <button
          onClick={onUserMenuClick}
          className="flex items-center gap-3 rounded-md p-2 hover:bg-accent transition-colors"
        >
          <div className="relative h-8 w-8 rounded-full bg-muted overflow-hidden">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-sm font-medium">
                {user.initials || user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            {user.email && (
              <p className="text-xs text-muted-foreground">{user.email}</p>
            )}
          </div>
        </button>
      )
    }

    return (
      <header
        ref={ref}
        className={cn(
          'flex items-center justify-between',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {renderBrand()}
          {renderTitleSection()}
        </div>

        {renderSearch()}

        <div className="flex items-center gap-4">
          {renderActions()}
          {user && renderUser()}
        </div>

        {children}
      </header>
    )
  }
)

Header.displayName = 'Header'