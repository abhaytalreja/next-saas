'use client';

import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  'aria-label': string; // Required for accessibility
  className?: string;
}

const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:pointer-events-none shadow-sm hover:shadow-md active:scale-95',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 active:bg-primary-800 dark:bg-primary-500 dark:hover:bg-primary-600',
        secondary: 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 focus:ring-primary-500 active:bg-neutral-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700',
        outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500 active:bg-primary-100 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900',
        ghost: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus:ring-primary-500 active:bg-neutral-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200',
        destructive: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 active:bg-error-800 dark:bg-red-600 dark:hover:bg-red-700',
      },
      size: {
        xs: 'h-6 w-6 p-1',
        sm: 'h-8 w-8 p-1.5',
        md: 'h-10 w-10 p-2',
        lg: 'h-12 w-12 p-2.5',
        xl: 'h-14 w-14 p-3',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

const iconSizes = {
  xs: 'h-4 w-4',
  sm: 'h-5 w-5', 
  md: 'h-6 w-6',
  lg: 'h-7 w-7',
  xl: 'h-8 w-8',
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ 
    className, 
    variant, 
    size = 'md', 
    loading, 
    icon: Icon, 
    disabled,
    children,
    ...props 
  }, ref) => {
    return (
      <button
        className={cn(iconButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || disabled}
        {...props}
      >
        {loading ? (
          <svg 
            className={cn('animate-spin', iconSizes[size])} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <Icon className={iconSizes[size]} />
        )}
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

// Common icon button presets
export const CloseButton = React.forwardRef<HTMLButtonElement, Omit<IconButtonProps, 'icon' | 'aria-label'>>(
  (props, ref) => (
    <IconButton
      ref={ref}
      icon={({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      aria-label="Close"
      variant="ghost"
      {...props}
    />
  )
);

CloseButton.displayName = 'CloseButton';

export const MenuButton = React.forwardRef<HTMLButtonElement, Omit<IconButtonProps, 'icon' | 'aria-label'>>(
  (props, ref) => (
    <IconButton
      ref={ref}
      icon={({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
      aria-label="Menu"
      variant="ghost"
      {...props}
    />
  )
);

MenuButton.displayName = 'MenuButton';