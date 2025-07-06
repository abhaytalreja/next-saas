'use client';

import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}

const tagVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-medium transition-all duration-200 whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
        secondary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-2.5 py-1.5 text-sm',
        lg: 'px-3 py-2 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const removeButtonSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4', 
  lg: 'h-5 w-5',
};

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ 
    className, 
    variant, 
    size = 'md', 
    removable = false,
    onRemove,
    icon: Icon,
    children,
    ...props 
  }, ref) => {
    return (
      <span
        className={cn(tagVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {Icon && <Icon className={iconSizes[size]} />}
        {children}
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className={cn(
              'inline-flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors',
              'focus:outline-none focus:ring-1 focus:ring-current',
              size === 'sm' && 'p-0.5',
              size === 'md' && 'p-1',
              size === 'lg' && 'p-1'
            )}
            aria-label="Remove tag"
          >
            <svg 
              className={removeButtonSizes[size]} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Tag.displayName = 'Tag';

// Tag group component
export interface TagGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spacing?: 'tight' | 'normal' | 'loose';
  wrap?: boolean;
  className?: string;
}

export const TagGroup = React.forwardRef<HTMLDivElement, TagGroupProps>(
  ({ className, children, spacing = 'normal', wrap = true, ...props }, ref) => {
    const spacingClasses = {
      tight: 'gap-1',
      normal: 'gap-2',
      loose: 'gap-3',
    };

    return (
      <div
        className={cn(
          'flex items-center',
          spacingClasses[spacing],
          wrap && 'flex-wrap',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TagGroup.displayName = 'TagGroup';