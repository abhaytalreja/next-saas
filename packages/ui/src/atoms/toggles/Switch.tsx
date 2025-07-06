import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const switchVariants = cva(
  'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      color: {
        default:
          'data-[state=checked]:bg-primary-600 data-[state=unchecked]:bg-neutral-200',
        success:
          'data-[state=checked]:bg-success-600 data-[state=unchecked]:bg-neutral-200',
        error:
          'data-[state=checked]:bg-error-600 data-[state=unchecked]:bg-neutral-200',
      },
      size: {
        sm: 'h-5 w-9',
        default: 'h-6 w-11',
        lg: 'h-7 w-14',
      },
    },
    defaultVariants: {
      color: 'default',
      size: 'default',
    },
  }
)

const switchThumbVariants = cva(
  'pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
        default:
          'h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
        lg: 'h-6 w-6 data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-0',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'color'>,
    VariantProps<typeof switchVariants> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      className,
      color,
      size,
      checked,
      defaultChecked,
      onCheckedChange,
      ...props
    },
    ref
  ) => {
    const [isChecked, setIsChecked] = React.useState(defaultChecked || false)
    const controlledChecked = checked !== undefined ? checked : isChecked

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked
      if (checked === undefined) {
        setIsChecked(newChecked)
      }
      onCheckedChange?.(newChecked)
      props.onChange?.(e)
    }

    return (
      <label className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="sr-only"
          ref={ref}
          checked={controlledChecked}
          onChange={handleChange}
          {...props}
        />
        <span
          className={cn(switchVariants({ color, size, className }))}
          data-state={controlledChecked ? 'checked' : 'unchecked'}
        >
          <span
            className={cn(switchThumbVariants({ size }))}
            data-state={controlledChecked ? 'checked' : 'unchecked'}
          />
        </span>
      </label>
    )
  }
)
Switch.displayName = 'Switch'

export { Switch, switchVariants }
