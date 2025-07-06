'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../lib/utils'

const linkVariants = cva(
  'inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300',
        muted:
          'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
        subtle:
          'text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300',
        ghost:
          'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
      underline: {
        always: 'underline',
        hover: 'hover:underline',
        none: 'no-underline',
      },
      external: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      underline: 'hover',
      external: false,
    },
  }
)

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  external?: boolean
  showExternalIcon?: boolean
  disabled?: boolean
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      className,
      variant,
      size,
      underline,
      external = false,
      showExternalIcon = true,
      disabled = false,
      children,
      href,
      target,
      rel,
      ...props
    },
    ref
  ) => {
    const isExternal = external || target === '_blank'
    const externalProps = isExternal
      ? {
          target: '_blank',
          rel: rel || 'noopener noreferrer',
        }
      : {}

    return (
      <a
        className={cn(
          linkVariants({ variant, size, underline, external }),
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        ref={ref}
        href={disabled ? undefined : href}
        {...externalProps}
        {...props}
      >
        {children}
        {isExternal && showExternalIcon && (
          <svg
            className="ml-1 inline-block h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        )}
      </a>
    )
  }
)

Link.displayName = 'Link'

// Breadcrumb Link variant
export interface BreadcrumbLinkProps extends LinkProps {
  current?: boolean
}

export const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  BreadcrumbLinkProps
>(({ current = false, className, ...props }, ref) => {
  if (current) {
    return (
      <span
        className={cn('text-gray-500 dark:text-gray-400', className)}
        aria-current="page"
      >
        {props.children}
      </span>
    )
  }

  return (
    <Link
      ref={ref}
      variant="muted"
      size="sm"
      underline="none"
      className={className}
      {...props}
    />
  )
})

BreadcrumbLink.displayName = 'BreadcrumbLink'

// Nav Link variant
export interface NavLinkProps extends LinkProps {
  active?: boolean
}

export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ active = false, className, variant = 'ghost', ...props }, ref) => {
    return (
      <Link
        ref={ref}
        variant={variant}
        className={cn(
          'px-3 py-2 rounded-md font-medium',
          active &&
            'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
          className
        )}
        aria-current={active ? 'page' : undefined}
        {...props}
      />
    )
  }
)

NavLink.displayName = 'NavLink'

// Footer Link variant
export const FooterLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        variant="muted"
        size="sm"
        underline="hover"
        className={cn(
          'hover:text-gray-900 dark:hover:text-gray-100',
          className
        )}
        {...props}
      />
    )
  }
)

FooterLink.displayName = 'FooterLink'

// Inline Text Link
export const TextLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, ...props }, ref) => {
    return <Link ref={ref} className={cn('inline', className)} {...props} />
  }
)

TextLink.displayName = 'TextLink'

// Button-style Link
export interface ButtonLinkProps extends LinkProps {
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  buttonSize?: 'sm' | 'md' | 'lg'
}

const buttonLinkVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      buttonVariant: {
        primary:
          'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600',
        secondary:
          'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
        outline:
          'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800',
        ghost:
          'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
      },
      buttonSize: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      buttonVariant: 'primary',
      buttonSize: 'md',
    },
  }
)

export const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (
    {
      className,
      buttonVariant,
      buttonSize,
      variant,
      size,
      underline,
      ...props
    },
    ref
  ) => {
    return (
      <a
        ref={ref}
        className={cn(
          buttonLinkVariants({ buttonVariant, buttonSize }),
          className
        )}
        {...props}
      />
    )
  }
)

ButtonLink.displayName = 'ButtonLink'
