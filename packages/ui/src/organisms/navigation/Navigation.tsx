import React, { forwardRef, useState } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface NavigationItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  children?: NavigationItem[]
  badge?: string | number
  disabled?: boolean
  active?: boolean
}

export interface NavigationProps extends React.HTMLAttributes<HTMLElement> {
  brand?: {
    name: string
    logo?: string | React.ComponentType<{ className?: string }>
    href?: string
  }
  items: NavigationItem[]
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'pills' | 'underline'
  size?: 'sm' | 'md' | 'lg'
  collapsible?: boolean
  defaultCollapsed?: boolean
  onItemClick?: (item: NavigationItem) => void
}

const sizeClasses = {
  sm: 'text-sm px-2 py-1',
  md: 'text-sm px-3 py-2',
  lg: 'text-base px-4 py-3',
}

const variantClasses = {
  default: {
    item: 'rounded-md hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground',
    active: 'bg-accent text-accent-foreground',
  },
  pills: {
    item: 'rounded-full hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground',
    active: 'bg-primary text-primary-foreground',
  },
  underline: {
    item: 'rounded-none border-b-2 border-transparent hover:border-accent data-[active=true]:border-primary data-[active=true]:text-primary',
    active: 'border-primary text-primary border-b-2',
  },
}

export const Navigation = forwardRef<HTMLElement, NavigationProps>(
  ({ 
    brand,
    items,
    orientation = 'horizontal',
    variant = 'default',
    size = 'md',
    collapsible = false,
    defaultCollapsed = false,
    onItemClick,
    className,
    ...props 
  }, ref) => {
    const [collapsed, setCollapsed] = useState(defaultCollapsed)
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

    const toggleExpanded = (label: string) => {
      const newExpanded = new Set(expandedItems)
      if (newExpanded.has(label)) {
        newExpanded.delete(label)
      } else {
        newExpanded.add(label)
      }
      setExpandedItems(newExpanded)
    }

    const renderNavigationItem = (item: NavigationItem, level = 0) => {
      const hasChildren = item.children && item.children.length > 0
      const isExpanded = expandedItems.has(item.label)
      const ItemIcon = item.icon
      
      return (
        <li key={item.label} className={level > 0 ? 'ml-4' : ''}>
          <div className="relative">
            {item.href ? (
              <a
                href={item.href}
                onClick={() => onItemClick?.(item)}
                data-active={item.active}
                className={cn(
                  'flex items-center gap-2 transition-colors',
                  sizeClasses[size],
                  variantClasses[variant].item,
                  item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                  item.active && variantClasses[variant].active
                )}
              >
                {ItemIcon && <ItemIcon className="h-4 w-4" />}
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    {item.badge}
                  </span>
                )}
                {hasChildren && (
                  <ChevronDown 
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isExpanded && 'rotate-180'
                    )}
                  />
                )}
              </a>
            ) : (
              <button
                onClick={() => {
                  if (hasChildren) {
                    toggleExpanded(item.label)
                  }
                  onItemClick?.(item)
                }}
                data-active={item.active}
                disabled={item.disabled}
                className={cn(
                  'flex w-full items-center gap-2 transition-colors',
                  sizeClasses[size],
                  variantClasses[variant].item,
                  item.disabled && 'opacity-50 cursor-not-allowed',
                  item.active && variantClasses[variant].active
                )}
              >
                {ItemIcon && <ItemIcon className="h-4 w-4" />}
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    {item.badge}
                  </span>
                )}
                {hasChildren && (
                  <ChevronDown 
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isExpanded && 'rotate-180'
                    )}
                  />
                )}
              </button>
            )}
          </div>
          
          {hasChildren && isExpanded && (
            <ul className="mt-1 space-y-1">
              {item.children!.map(child => renderNavigationItem(child, level + 1))}
            </ul>
          )}
        </li>
      )
    }

    return (
      <nav
        ref={ref}
        className={cn(
          'flex',
          orientation === 'horizontal' ? 'items-center space-x-4' : 'flex-col',
          className
        )}
        {...props}
      >
        {brand && (
          <div className="flex items-center gap-2">
            {typeof brand.logo === 'string' ? (
              <img src={brand.logo} alt={brand.name} className="h-8 w-8" />
            ) : brand.logo ? (
              <brand.logo className="h-8 w-8" />
            ) : null}
            {brand.href ? (
              <a href={brand.href} className="text-lg font-semibold">
                {brand.name}
              </a>
            ) : (
              <span className="text-lg font-semibold">{brand.name}</span>
            )}
          </div>
        )}

        {collapsible && orientation === 'horizontal' && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="lg:hidden flex items-center justify-center p-2 rounded-md hover:bg-accent"
          >
            {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>
        )}

        <ul
          className={cn(
            'flex',
            orientation === 'horizontal' 
              ? 'items-center space-x-1' 
              : 'flex-col space-y-1 w-full',
            collapsible && orientation === 'horizontal' && collapsed && 'hidden lg:flex'
          )}
        >
          {items.map(item => renderNavigationItem(item))}
        </ul>
      </nav>
    )
  }
)

Navigation.displayName = 'Navigation'