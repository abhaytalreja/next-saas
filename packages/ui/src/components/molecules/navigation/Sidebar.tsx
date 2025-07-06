'use client'

import React, { createContext, useContext, useState } from 'react'
import { cn } from '../../../lib/utils'

// Sidebar Context
interface SidebarContextValue {
  isOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
  openSidebar: () => void
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined)

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

// Sidebar Provider
export interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const toggleSidebar = () => setIsOpen(prev => !prev)
  const closeSidebar = () => setIsOpen(false)
  const openSidebar = () => setIsOpen(true)

  return (
    <SidebarContext.Provider
      value={{ isOpen, toggleSidebar, closeSidebar, openSidebar }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

// Sidebar Root
export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  side?: 'left' | 'right'
  variant?: 'default' | 'floating' | 'inset'
  collapsible?: boolean
  className?: string
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      children,
      side = 'left',
      variant = 'default',
      collapsible = true,
      className,
      ...props
    },
    ref
  ) => {
    const { isOpen } = useSidebar()

    const variantClasses = {
      default: 'h-full border-r border-gray-200 dark:border-gray-700',
      floating: 'h-[calc(100vh-2rem)] m-4 rounded-lg shadow-lg',
      inset: 'h-full',
    }

    return (
      <aside
        ref={ref}
        className={cn(
          'bg-white dark:bg-gray-900 transition-all duration-300',
          variantClasses[variant],
          isOpen ? 'w-64' : collapsible ? 'w-16' : 'w-64',
          side === 'right' && 'order-last',
          className
        )}
        {...props}
      >
        <div className="flex flex-col h-full">{children}</div>
      </aside>
    )
  }
)

Sidebar.displayName = 'Sidebar'

// Sidebar Header
export interface SidebarHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  SidebarHeaderProps
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'px-4 py-4 border-b border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

SidebarHeader.displayName = 'SidebarHeader'

// Sidebar Content
export interface SidebarContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  SidebarContentProps
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex-1 overflow-y-auto px-3 py-4', className)}
      {...props}
    >
      {children}
    </div>
  )
})

SidebarContent.displayName = 'SidebarContent'

// Sidebar Footer
export interface SidebarFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  SidebarFooterProps
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'px-4 py-4 border-t border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

SidebarFooter.displayName = 'SidebarFooter'

// Sidebar Group
export interface SidebarGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  label?: string
  collapsible?: boolean
  defaultOpen?: boolean
  className?: string
}

export const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(
  (
    {
      children,
      label,
      collapsible = false,
      defaultOpen = true,
      className,
      ...props
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = useState(defaultOpen)
    const { isOpen: sidebarOpen } = useSidebar()

    return (
      <div ref={ref} className={cn('mb-4', className)} {...props}>
        {label && (
          <div
            className={cn(
              'flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400',
              collapsible &&
                'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200'
            )}
            onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
          >
            {sidebarOpen ? (
              <>
                <span>{label}</span>
                {collapsible && (
                  <svg
                    className={cn(
                      'w-4 h-4 transition-transform',
                      isExpanded ? 'rotate-90' : ''
                    )}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </>
            ) : (
              <span className="w-2 h-2 bg-gray-400 rounded-full mx-auto" />
            )}
          </div>
        )}
        {(!collapsible || isExpanded) && (
          <div className="space-y-1">{children}</div>
        )}
      </div>
    )
  }
)

SidebarGroup.displayName = 'SidebarGroup'

// Sidebar Item
export interface SidebarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  icon?: React.ReactNode
  active?: boolean
  disabled?: boolean
  href?: string
  badge?: string | number
  className?: string
}

export const SidebarItem = React.forwardRef<HTMLDivElement, SidebarItemProps>(
  (
    {
      children,
      icon,
      active = false,
      disabled = false,
      href,
      badge,
      className,
      ...props
    },
    ref
  ) => {
    const { isOpen } = useSidebar()

    const content = (
      <>
        {icon && (
          <span className={cn('flex-shrink-0', isOpen ? 'mr-3' : 'mx-auto')}>
            {icon}
          </span>
        )}
        {isOpen && (
          <>
            <span className="flex-1">{children}</span>
            {badge && (
              <span className="ml-auto bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs">
                {badge}
              </span>
            )}
          </>
        )}
      </>
    )

    const baseClasses = cn(
      'flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
      active
        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
      disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
      !isOpen && 'justify-center',
      className
    )

    return (
      <div ref={ref} {...props}>
        {href ? (
          <a href={href} className={baseClasses}>
            {content}
          </a>
        ) : (
          <button className={cn(baseClasses, 'w-full text-left')}>
            {content}
          </button>
        )}
        {!isOpen && badge && (
          <div className="absolute top-0 right-0 w-2 h-2 bg-primary-600 rounded-full" />
        )}
      </div>
    )
  }
)

SidebarItem.displayName = 'SidebarItem'

// Sidebar Toggle Button
export interface SidebarToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

export const SidebarToggle = React.forwardRef<
  HTMLButtonElement,
  SidebarToggleProps
>(({ className, ...props }, ref) => {
  const { toggleSidebar, isOpen } = useSidebar()

  return (
    <button
      ref={ref}
      onClick={toggleSidebar}
      className={cn(
        'p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700',
        'dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-500',
        className
      )}
      aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      {...props}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={
            isOpen
              ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7'
              : 'M13 5l7 7-7 7M5 5l7 7-7 7'
          }
        />
      </svg>
    </button>
  )
})

SidebarToggle.displayName = 'SidebarToggle'

// Sidebar Separator
export interface SidebarSeparatorProps
  extends React.HTMLAttributes<HTMLHRElement> {
  className?: string
}

export const SidebarSeparator = React.forwardRef<
  HTMLHRElement,
  SidebarSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <hr
      ref={ref}
      className={cn('my-3 border-gray-200 dark:border-gray-700', className)}
      {...props}
    />
  )
})

SidebarSeparator.displayName = 'SidebarSeparator'
