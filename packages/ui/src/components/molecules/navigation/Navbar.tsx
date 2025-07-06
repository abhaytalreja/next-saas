'use client'

import React, { useState } from 'react'
import { cn } from '../../../lib/utils'

// Navbar Root
export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  fixed?: boolean
  transparent?: boolean
  bordered?: boolean
  className?: string
}

export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  (
    {
      children,
      fixed = false,
      transparent = false,
      bordered = true,
      className,
      ...props
    },
    ref
  ) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
      <nav
        ref={ref}
        className={cn(
          'w-full z-40',
          fixed && 'fixed top-0 left-0 right-0',
          transparent ? 'bg-transparent' : 'bg-white dark:bg-gray-900',
          bordered && 'border-b border-gray-200 dark:border-gray-700',
          className
        )}
        {...props}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child as React.ReactElement<any>, {
                  isMobileMenuOpen,
                  setIsMobileMenuOpen,
                })
              }
              return child
            })}
          </div>
        </div>
      </nav>
    )
  }
)

Navbar.displayName = 'Navbar'

// Navbar Brand
export interface NavbarBrandProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  href?: string
  className?: string
}

export const NavbarBrand = React.forwardRef<HTMLDivElement, NavbarBrandProps>(
  ({ children, href, className, ...props }, ref) => {
    const content = <div className="flex items-center">{children}</div>

    return (
      <div ref={ref} className={cn('flex-shrink-0', className)} {...props}>
        {href ? (
          <a href={href} className="flex items-center">
            {content}
          </a>
        ) : (
          content
        )}
      </div>
    )
  }
)

NavbarBrand.displayName = 'NavbarBrand'

// Navbar Content
export interface NavbarContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  justify?: 'start' | 'center' | 'end'
  className?: string
}

export const NavbarContent = React.forwardRef<
  HTMLDivElement,
  NavbarContentProps
>(({ children, justify = 'start', className, ...props }, ref) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  }

  return (
    <div
      ref={ref}
      className={cn(
        'hidden md:flex md:items-center md:space-x-8 flex-1',
        justifyClasses[justify],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

NavbarContent.displayName = 'NavbarContent'

// Navbar Item
export interface NavbarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
  className?: string
}

export const NavbarItem = React.forwardRef<HTMLDivElement, NavbarItemProps>(
  (
    { children, active = false, disabled = false, className, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          disabled && 'opacity-50 pointer-events-none',
          className
        )}
        {...props}
      >
        {React.isValidElement(children) && children.type === 'a' ? (
          React.cloneElement(children as React.ReactElement<any>, {
            className: cn(
              'text-sm font-medium transition-colors',
              active
                ? 'text-gray-900 dark:text-gray-100'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100',
              (children as React.ReactElement<any>).props.className
            ),
          })
        ) : (
          <span
            className={cn(
              'text-sm font-medium transition-colors',
              active
                ? 'text-gray-900 dark:text-gray-100'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
            )}
          >
            {children}
          </span>
        )}
        {active && (
          <div className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-primary-600" />
        )}
      </div>
    )
  }
)

NavbarItem.displayName = 'NavbarItem'

// Navbar Menu Toggle
export interface NavbarMenuToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen?: boolean
  onToggle?: () => void
  isMobileMenuOpen?: boolean
  setIsMobileMenuOpen?: (open: boolean) => void
  className?: string
}

export const NavbarMenuToggle = React.forwardRef<
  HTMLButtonElement,
  NavbarMenuToggleProps
>(
  (
    {
      isOpen,
      onToggle,
      isMobileMenuOpen,
      setIsMobileMenuOpen,
      className,
      ...props
    },
    ref
  ) => {
    const open = isOpen ?? isMobileMenuOpen ?? false
    const toggle = onToggle ?? (() => setIsMobileMenuOpen?.(!open))

    return (
      <button
        ref={ref}
        type="button"
        onClick={toggle}
        className={cn(
          'md:hidden inline-flex items-center justify-center p-2 rounded-md',
          'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
          'dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800',
          'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500',
          className
        )}
        aria-expanded={open}
        aria-label="Toggle navigation menu"
        {...props}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {open ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
    )
  }
)

NavbarMenuToggle.displayName = 'NavbarMenuToggle'

// Navbar Menu (Mobile)
export interface NavbarMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  isOpen?: boolean
  isMobileMenuOpen?: boolean
  className?: string
}

export const NavbarMenu = React.forwardRef<HTMLDivElement, NavbarMenuProps>(
  ({ children, isOpen, isMobileMenuOpen, className, ...props }, ref) => {
    const open = isOpen ?? isMobileMenuOpen ?? false

    if (!open) return null

    return (
      <div
        ref={ref}
        className={cn(
          'md:hidden absolute top-16 left-0 right-0',
          'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700',
          'shadow-lg',
          className
        )}
        {...props}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">{children}</div>
      </div>
    )
  }
)

NavbarMenu.displayName = 'NavbarMenu'

// Navbar Menu Item (Mobile)
export interface NavbarMenuItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  active?: boolean
  className?: string
}

export const NavbarMenuItem = React.forwardRef<
  HTMLDivElement,
  NavbarMenuItemProps
>(({ children, active = false, className, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {React.isValidElement(children) && children.type === 'a' ? (
        React.cloneElement(children as React.ReactElement<any>, {
          className: cn(
            'block px-3 py-2 rounded-md text-base font-medium',
            active
              ? 'text-gray-900 bg-gray-100 dark:text-gray-100 dark:bg-gray-800'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800',
            (children as React.ReactElement<any>).props.className
          ),
        })
      ) : (
        <span
          className={cn(
            'block px-3 py-2 rounded-md text-base font-medium',
            active
              ? 'text-gray-900 bg-gray-100 dark:text-gray-100 dark:bg-gray-800'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800',
            className
          )}
        >
          {children}
        </span>
      )}
    </div>
  )
})

NavbarMenuItem.displayName = 'NavbarMenuItem'

// Navbar Actions (for buttons, dropdowns, etc.)
export interface NavbarActionsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const NavbarActions = React.forwardRef<
  HTMLDivElement,
  NavbarActionsProps
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('hidden md:flex md:items-center md:space-x-4', className)}
      {...props}
    >
      {children}
    </div>
  )
})

NavbarActions.displayName = 'NavbarActions'
