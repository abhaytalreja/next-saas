'use client'

import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
} from 'react'
import { cn } from '../../../lib/utils'

// Context Menu Context
interface ContextMenuContextValue {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  position: { x: number; y: number }
  setPosition: (position: { x: number; y: number }) => void
}

const ContextMenuContext = createContext<ContextMenuContextValue | undefined>(
  undefined
)

const useContextMenu = () => {
  const context = useContext(ContextMenuContext)
  if (!context) {
    throw new Error('ContextMenu components must be used within a ContextMenu')
  }
  return context
}

// Context Menu Root
export interface ContextMenuProps {
  children: React.ReactNode
  onOpenChange?: (open: boolean) => void
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  children,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleSetIsOpen = (open: boolean) => {
    setIsOpen(open)
    onOpenChange?.(open)
  }

  return (
    <ContextMenuContext.Provider
      value={{ isOpen, setIsOpen: handleSetIsOpen, position, setPosition }}
    >
      {children}
    </ContextMenuContext.Provider>
  )
}

// Context Menu Trigger
export interface ContextMenuTriggerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  disabled?: boolean
  asChild?: boolean
}

export const ContextMenuTrigger = React.forwardRef<
  HTMLDivElement,
  ContextMenuTriggerProps
>(({ children, disabled = false, asChild = false, ...props }, ref) => {
  const { setIsOpen, setPosition } = useContextMenu()

  const handleContextMenu = (e: React.MouseEvent) => {
    if (disabled) return

    e.preventDefault()
    setPosition({ x: e.clientX, y: e.clientY })
    setIsOpen(true)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref,
      onContextMenu: handleContextMenu,
      ...props,
    })
  }

  return (
    <div ref={ref} onContextMenu={handleContextMenu} {...props}>
      {children}
    </div>
  )
})

ContextMenuTrigger.displayName = 'ContextMenuTrigger'

// Context Menu Content
export interface ContextMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const ContextMenuContent = React.forwardRef<
  HTMLDivElement,
  ContextMenuContentProps
>(({ children, className, ...props }, ref) => {
  const { isOpen, setIsOpen, position } = useContextMenu()
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    const handleScroll = () => {
      setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      window.addEventListener('scroll', handleScroll, true)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen, setIsOpen])

  useEffect(() => {
    if (isOpen && contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let adjustedX = position.x
      let adjustedY = position.y

      // Adjust horizontal position if menu would go off-screen
      if (position.x + rect.width > viewportWidth) {
        adjustedX = position.x - rect.width
      }

      // Adjust vertical position if menu would go off-screen
      if (position.y + rect.height > viewportHeight) {
        adjustedY = position.y - rect.height
      }

      // Ensure menu doesn't go off the left or top edge
      adjustedX = Math.max(0, adjustedX)
      adjustedY = Math.max(0, adjustedY)

      if (adjustedX !== position.x || adjustedY !== position.y) {
        contentRef.current.style.left = `${adjustedX}px`
        contentRef.current.style.top = `${adjustedY}px`
      }
    }
  }, [isOpen, position])

  if (!isOpen) return null

  return (
    <div
      ref={contentRef}
      role="menu"
      aria-orientation="vertical"
      className={cn(
        'fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md',
        'dark:border-gray-700 dark:bg-gray-900',
        'animate-in fade-in-0 zoom-in-95',
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      {...props}
    >
      {children}
    </div>
  )
})

ContextMenuContent.displayName = 'ContextMenuContent'

// Context Menu Item
export interface ContextMenuItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  disabled?: boolean
  destructive?: boolean
  onSelect?: () => void
  className?: string
}

export const ContextMenuItem = React.forwardRef<
  HTMLDivElement,
  ContextMenuItemProps
>(
  (
    {
      children,
      disabled = false,
      destructive = false,
      onSelect,
      className,
      ...props
    },
    ref
  ) => {
    const { setIsOpen } = useContextMenu()

    const handleClick = () => {
      if (!disabled) {
        onSelect?.()
        setIsOpen(false)
      }
    }

    return (
      <div
        ref={ref}
        role="menuitem"
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
          'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100',
          'focus:bg-gray-100 focus:text-gray-900 dark:focus:bg-gray-800 dark:focus:text-gray-100',
          disabled && 'pointer-events-none opacity-50',
          destructive &&
            'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ContextMenuItem.displayName = 'ContextMenuItem'

// Context Menu Separator
export interface ContextMenuSeparatorProps
  extends React.HTMLAttributes<HTMLHRElement> {
  className?: string
}

export const ContextMenuSeparator = React.forwardRef<
  HTMLHRElement,
  ContextMenuSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <hr
      ref={ref}
      role="separator"
      className={cn('-mx-1 my-1 h-px bg-gray-200 dark:bg-gray-700', className)}
      {...props}
    />
  )
})

ContextMenuSeparator.displayName = 'ContextMenuSeparator'

// Context Menu Label
export interface ContextMenuLabelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const ContextMenuLabel = React.forwardRef<
  HTMLDivElement,
  ContextMenuLabelProps
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

ContextMenuLabel.displayName = 'ContextMenuLabel'

// Context Menu Group
export interface ContextMenuGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const ContextMenuGroup = React.forwardRef<
  HTMLDivElement,
  ContextMenuGroupProps
>(({ children, className, ...props }, ref) => {
  return (
    <div ref={ref} role="group" className={cn('py-1', className)} {...props}>
      {children}
    </div>
  )
})

ContextMenuGroup.displayName = 'ContextMenuGroup'

// Context Menu Checkbox Item
export interface ContextMenuCheckboxItemProps
  extends Omit<ContextMenuItemProps, 'onSelect'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const ContextMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  ContextMenuCheckboxItemProps
>(
  (
    { children, checked = false, onCheckedChange, className, ...props },
    ref
  ) => {
    const handleSelect = () => {
      onCheckedChange?.(!checked)
    }

    return (
      <ContextMenuItem
        ref={ref}
        role="menuitemcheckbox"
        aria-checked={checked}
        onSelect={handleSelect}
        className={cn('pl-8 relative', className)}
        {...props}
      >
        {checked && (
          <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
        {children}
      </ContextMenuItem>
    )
  }
)

ContextMenuCheckboxItem.displayName = 'ContextMenuCheckboxItem'

// Context Menu Radio Group
export interface ContextMenuRadioGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
}

export const ContextMenuRadioGroup: React.FC<ContextMenuRadioGroupProps> = ({
  children,
  value,
  onValueChange,
  ...props
}) => {
  return (
    <ContextMenuGroup role="radiogroup" {...props}>
      {React.Children.map(children, child => {
        if (
          React.isValidElement(child) &&
          child.type === ContextMenuRadioItem
        ) {
          const childElement =
            child as React.ReactElement<ContextMenuRadioItemProps>
          return React.cloneElement(childElement, {
            checked: childElement.props.value === value,
            onSelect: () => onValueChange?.(childElement.props.value),
          })
        }
        return child
      })}
    </ContextMenuGroup>
  )
}

// Context Menu Radio Item
export interface ContextMenuRadioItemProps extends ContextMenuItemProps {
  value: string
  checked?: boolean
}

export const ContextMenuRadioItem = React.forwardRef<
  HTMLDivElement,
  ContextMenuRadioItemProps
>(({ children, value, checked = false, className, ...props }, ref) => {
  return (
    <ContextMenuItem
      ref={ref}
      role="menuitemradio"
      aria-checked={checked}
      className={cn('pl-8 relative', className)}
      {...props}
    >
      {checked && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-current" />
        </span>
      )}
      {children}
    </ContextMenuItem>
  )
})

ContextMenuRadioItem.displayName = 'ContextMenuRadioItem'

// Context Menu Sub (Submenu)
export interface ContextMenuSubProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

export const ContextMenuSub: React.FC<ContextMenuSubProps> = ({
  children,
  defaultOpen = false,
}) => {
  const parentContext = useContextMenu()
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  return (
    <ContextMenuContext.Provider
      value={{ ...parentContext, isOpen, setIsOpen, position, setPosition }}
    >
      {children}
    </ContextMenuContext.Provider>
  )
}

// Context Menu Sub Trigger
export interface ContextMenuSubTriggerProps
  extends Omit<ContextMenuItemProps, 'onSelect'> {
  children: React.ReactNode
}

export const ContextMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  ContextMenuSubTriggerProps
>(({ children, className, ...props }, ref) => {
  const { setIsOpen, setPosition } = useContextMenu()
  const triggerRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({ x: rect.right, y: rect.top })
      setIsOpen(true)
    }
  }

  return (
    <ContextMenuItem
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      className={cn('pr-8 relative', className)}
      {...props}
    >
      {children}
      <span className="absolute right-2">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </ContextMenuItem>
  )
})

ContextMenuSubTrigger.displayName = 'ContextMenuSubTrigger'

// Context Menu Sub Content
export interface ContextMenuSubContentProps extends ContextMenuContentProps {}

export const ContextMenuSubContent = React.forwardRef<
  HTMLDivElement,
  ContextMenuSubContentProps
>((props, ref) => {
  return <ContextMenuContent ref={ref} {...props} />
})

ContextMenuSubContent.displayName = 'ContextMenuSubContent'
