import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const headingVariants = cva('font-display font-semibold', {
  variants: {
    level: {
      h1: 'text-5xl leading-tight tracking-tight md:text-6xl lg:text-7xl',
      h2: 'text-4xl leading-tight tracking-tight md:text-5xl',
      h3: 'text-3xl leading-snug tracking-tight md:text-4xl',
      h4: 'text-2xl leading-snug',
      h5: 'text-xl leading-normal',
      h6: 'text-lg leading-normal',
    },
    color: {
      default: 'text-neutral-900 dark:text-neutral-100',
      primary: 'text-primary-600 dark:text-primary-500',
      secondary: 'text-secondary-600 dark:text-secondary-500',
      muted: 'text-neutral-600 dark:text-neutral-400',
    },
  },
  defaultVariants: {
    level: 'h1',
    color: 'default',
  },
})

export interface HeadingProps
  extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'color'>,
    VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 'h1', color, as, ...props }, ref) => {
    const Comp = (as || level) as any

    return (
      <Comp
        ref={ref}
        className={cn(headingVariants({ level, color, className }))}
        {...props}
      />
    )
  }
)
Heading.displayName = 'Heading'

export { Heading, headingVariants }
