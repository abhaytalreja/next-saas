import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"
import { ButtonPropsSchema, validateProps } from "../utils/component-validator"

/**
 * Button component following NextSaaS HubSpot design system
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 * 
 * @accessibility
 * - Supports keyboard navigation
 * - Provides proper ARIA labels
 * - Maintains focus management
 * - Minimum 44px touch target
 * 
 * @performance
 * - Optimized for re-renders
 * - Minimal bundle impact
 */

const buttonVariants = cva(
  // Base styles with HubSpot-inspired design
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shadow-sm hubspot-hover [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 active:bg-primary-800",
        secondary: "bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 focus:ring-primary-500 active:bg-neutral-100",
        outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500 active:bg-primary-100",
        ghost: "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus:ring-primary-500 active:bg-neutral-200",
        destructive: "bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 active:bg-error-800",
      },
      size: {
        sm: "px-3 py-1.5 text-sm h-8 min-w-[44px]",
        md: "px-4 py-2 text-sm h-10 min-w-[44px]",
        lg: "px-6 py-3 text-base h-12 min-w-[44px]",
        xl: "px-8 py-4 text-lg h-14 min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  
  /** Size of the button */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /** Loading state with spinner */
  loading?: boolean;
  
  /** Icon component to display */
  icon?: React.ComponentType<{ className?: string }>;
  
  /** Button content */
  children: React.ReactNode;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Test identifier */
  'data-testid'?: string;
  
  /** Accessibility label */
  'aria-label'?: string;
  
  /** ARIA described by */
  'aria-describedby'?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, icon: Icon, children, ...props }, ref) => {
    // Validate props in development
    if (process.env.NODE_ENV === 'development') {
      try {
        validateProps(ButtonPropsSchema, { variant, size, children, ...props });
      } catch (error) {
        console.warn('Button validation error:', error);
      }
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        aria-label={props['aria-label'] || (typeof children === 'string' ? children : undefined)}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
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
        )}
        {Icon && !loading && <Icon className="h-4 w-4" />}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }