'use client'

import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../../lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  variant?: 'default' | 'filled' | 'ghost'
  fullWidth?: boolean
  showCount?: boolean
  maxLength?: number
}

const textareaVariants = cva(
  'block rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border border-gray-300 bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 dark:hover:border-gray-500',
        filled:
          'border border-transparent bg-gray-100 text-gray-900 placeholder-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:hover:bg-gray-700',
        ghost:
          'border border-transparent bg-transparent text-gray-900 placeholder-gray-400 hover:bg-gray-100 dark:text-gray-100 dark:placeholder-gray-500 dark:hover:bg-gray-800',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
      error: {
        true: 'border-red-500 focus:ring-red-500 dark:border-red-500',
        false: '',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      resize: 'vertical',
      error: false,
      fullWidth: false,
    },
  }
)

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      resize = 'vertical',
      variant,
      fullWidth,
      showCount = false,
      maxLength,
      className,
      id,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaId =
      id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    const [internalValue, setInternalValue] = React.useState(defaultValue || '')
    const currentValue = value !== undefined ? value : internalValue
    const currentLength = String(currentValue).length

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value)
      }
      onChange?.(e)
    }

    return (
      <div className={cn(fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          value={currentValue}
          onChange={handleChange}
          maxLength={maxLength}
          className={cn(
            textareaVariants({ variant, resize, error: !!error, fullWidth }),
            'px-4 py-2',
            className
          )}
          {...props}
        />
        <div className="flex justify-between items-start mt-1">
          <div className="flex-1">
            {(error || helperText) && (
              <p
                className={cn(
                  'text-sm',
                  error
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400'
                )}
              >
                {error || helperText}
              </p>
            )}
          </div>
          {showCount && (
            <span
              className={cn(
                'text-sm text-gray-500 dark:text-gray-400 ml-2',
                maxLength &&
                  currentLength > maxLength &&
                  'text-red-600 dark:text-red-400'
              )}
            >
              {currentLength}
              {maxLength ? `/${maxLength}` : ''}
            </span>
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

// Auto-resize Textarea
export interface AutoResizeTextareaProps extends TextareaProps {
  minRows?: number
  maxRows?: number
}

export const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(({ minRows = 3, maxRows = 10, onInput, className, ...props }, ref) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const [textareaHeight, setTextareaHeight] = React.useState('auto')
  const [parentHeight, setParentHeight] = React.useState('auto')

  React.useImperativeHandle(ref, () => textareaRef.current!)

  const onInputChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    setTextareaHeight('auto')
    setParentHeight(`${textareaRef.current!.scrollHeight}px`)
    onInput?.(e)
  }

  React.useEffect(() => {
    if (textareaRef.current) {
      const scrollHeight = textareaRef.current.scrollHeight
      setParentHeight(`${scrollHeight}px`)
    }
  }, [props.value, props.defaultValue])

  React.useEffect(() => {
    setTextareaHeight(`${parentHeight}`)
  }, [parentHeight])

  return (
    <Textarea
      {...props}
      ref={textareaRef}
      resize="none"
      style={{
        height: textareaHeight,
        minHeight: `${minRows * 1.5}em`,
        maxHeight: `${maxRows * 1.5}em`,
      }}
      className={cn('overflow-hidden', className)}
      onInput={onInputChange}
    />
  )
})

AutoResizeTextarea.displayName = 'AutoResizeTextarea'
