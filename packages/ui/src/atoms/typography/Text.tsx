import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const textVariants = cva('', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
    },
    weight: {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    color: {
      default: 'text-neutral-900 dark:text-neutral-100',
      primary: 'text-primary-600 dark:text-primary-500',
      secondary: 'text-secondary-600 dark:text-secondary-500',
      muted: 'text-neutral-600 dark:text-neutral-400',
      error: 'text-error-600 dark:text-error-500',
      success: 'text-success-600 dark:text-success-500',
      warning: 'text-warning-600 dark:text-warning-500',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
  },
  defaultVariants: {
    size: 'base',
    weight: 'normal',
    color: 'default',
    align: 'left',
  },
})

type TextElement =
  | HTMLParagraphElement
  | HTMLSpanElement
  | HTMLDivElement
  | HTMLLabelElement

export interface TextProps
  extends Omit<React.HTMLAttributes<TextElement>, 'color'>,
    VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'div' | 'label'
}

const Text = React.forwardRef<TextElement, TextProps>(
  ({ className, size, weight, color, align, as = 'p', ...props }, ref) => {
    const Comp = as as any

    return (
      <Comp
        ref={ref}
        className={cn(textVariants({ size, weight, color, align, className }))}
        {...props}
      />
    )
  }
)
Text.displayName = 'Text'

export { Text, textVariants }
