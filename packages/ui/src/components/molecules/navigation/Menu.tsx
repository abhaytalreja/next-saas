'use client'

import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
} from 'react'
import { cn } from '../../../lib/utils'

// Menu Context
interface MenuContextValue {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  activeItem?: string
  setActiveItem: (item: string) => void
}

const MenuContext = createContext<MenuContextValue | undefined>(undefined)

const useMenu = () => {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error('Menu components must be used within a Menu')
  }
  return context
}

// Menu Root (Dropdown Menu)
export interface MenuProps {
  children: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Menu: React.FC<MenuProps> = ({
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const [activeItem, setActiveItem] = useState<string>()

  const isOpen =
    controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const setIsOpen = (open: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(open)
    }
    onOpenChange?.(open)
  }

  return (
    <MenuContext.Provider
      value={{ isOpen, setIsOpen, activeItem, setActiveItem }}
    >
      <div className="relative inline-block text-left">{children}</div>
    </MenuContext.Provider>
  )
}

// Menu Trigger
export interface MenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  asChild?: boolean
}

export const MenuTrigger = React.forwardRef<
  HTMLButtonElement,
  MenuTriggerProps
>(({ children, asChild = false, className, ...props }, ref) => {
  const { isOpen, setIsOpen } = useMenu()

  const handleClick = () => {
    setIsOpen(!isOpen)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref,
      onClick: handleClick,
      'aria-expanded': isOpen,
      'aria-haspopup': 'true',
    })
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      aria-expanded={isOpen}
      aria-haspopup="true"
      className={className}
      {...props}
    >
      {children}
    </button>
  )
})

MenuTrigger.displayName = 'MenuTrigger'

// Menu Content
export interface MenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  className?: string
}

export const MenuContent = React.forwardRef<HTMLDivElement, MenuContentProps>(
  ({ children, align = 'start', sideOffset = 4, className, ...props }, ref) => {
    const { isOpen, setIsOpen } = useMenu()
    const contentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          contentRef.current &&
          !contentRef.current.contains(event.target as Node)
        ) {
          const menuRoot =
            contentRef.current.closest('[role="menu"]')?.parentElement
          if (menuRoot && !menuRoot.contains(event.target as Node)) {
            setIsOpen(false)
          }
        }
      }

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsOpen(false)
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }, [isOpen, setIsOpen])

    if (!isOpen) return null

    const alignClasses = {
      start: 'left-0',
      center: 'left-1/2 -translate-x-1/2',
      end: 'right-0',
    }

    return (
      <div
        ref={contentRef}
        role="menu"
        aria-orientation="vertical"
        className={cn(
          'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md',
          'dark:border-gray-700 dark:bg-gray-900',
          'animate-in fade-in-0 zoom-in-95',
          alignClasses[align],
          `mt-${sideOffset}`,
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

MenuContent.displayName = 'MenuContent'

// Menu Item
export interface MenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  disabled?: boolean
  destructive?: boolean
  onSelect?: () => void
  className?: string
}

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
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
    const { setIsOpen } = useMenu()

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

MenuItem.displayName = 'MenuItem'

// Menu Separator
export interface MenuSeparatorProps
  extends React.HTMLAttributes<HTMLHRElement> {
  className?: string
}

export const MenuSeparator = React.forwardRef<
  HTMLHRElement,
  MenuSeparatorProps
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

MenuSeparator.displayName = 'MenuSeparator'

// Menu Label
export interface MenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const MenuLabel = React.forwardRef<HTMLDivElement, MenuLabelProps>(
  ({ children, className, ...props }, ref) => {
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
  }
)

MenuLabel.displayName = 'MenuLabel'

// Menu Group
export interface MenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const MenuGroup = React.forwardRef<HTMLDivElement, MenuGroupProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} role="group" className={cn('py-1', className)} {...props}>
        {children}
      </div>
    )
  }
)

MenuGroup.displayName = 'MenuGroup'

// Menu Checkbox Item
export interface MenuCheckboxItemProps extends Omit<MenuItemProps, 'onSelect'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const MenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  MenuCheckboxItemProps
>(
  (
    { children, checked = false, onCheckedChange, className, ...props },
    ref
  ) => {
    const handleSelect = () => {
      onCheckedChange?.(!checked)
    }

    return (
      <MenuItem
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
      </MenuItem>
    )
  }
)

MenuCheckboxItem.displayName = 'MenuCheckboxItem'

// Menu Radio Group
export interface MenuRadioGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
}

export const MenuRadioGroup: React.FC<MenuRadioGroupProps> = ({
  children,
  value,
  onValueChange,
  ...props
}) => {
  return (
    <MenuGroup role="radiogroup" {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === MenuRadioItem) {
          const childElement = child as React.ReactElement<MenuRadioItemProps>
          return React.cloneElement(childElement, {
            checked: childElement.props.value === value,
            onSelect: () => onValueChange?.(childElement.props.value),
          })
        }
        return child
      })}
    </MenuGroup>
  )
}

// Menu Radio Item
export interface MenuRadioItemProps extends MenuItemProps {
  value: string
  checked?: boolean
}

export const MenuRadioItem = React.forwardRef<
  HTMLDivElement,
  MenuRadioItemProps
>(({ children, value, checked = false, className, ...props }, ref) => {
  return (
    <MenuItem
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
    </MenuItem>
  )
})

MenuRadioItem.displayName = 'MenuRadioItem'

// Menu Sub (Submenu)
export interface MenuSubProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

export const MenuSub: React.FC<MenuSubProps> = ({
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <MenuContext.Provider
      value={{
        isOpen,
        setIsOpen,
        activeItem: undefined,
        setActiveItem: () => {},
      }}
    >
      {children}
    </MenuContext.Provider>
  )
}

// Menu Sub Trigger
export interface MenuSubTriggerProps extends Omit<MenuItemProps, 'onSelect'> {
  children: React.ReactNode
}

export const MenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  MenuSubTriggerProps
>(({ children, className, ...props }, ref) => {
  const { setIsOpen } = useMenu()

  return (
    <MenuItem
      ref={ref}
      onSelect={() => setIsOpen(true)}
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
    </MenuItem>
  )
})

MenuSubTrigger.displayName = 'MenuSubTrigger'

// Menu Sub Content
export interface MenuSubContentProps extends MenuContentProps {
  sideOffset?: number
}

export const MenuSubContent = React.forwardRef<
  HTMLDivElement,
  MenuSubContentProps
>(({ sideOffset = 4, className, ...props }, ref) => {
  return (
    <MenuContent
      ref={ref}
      className={cn('left-full top-0', `ml-${sideOffset}`, className)}
      {...props}
    />
  )
})

MenuSubContent.displayName = 'MenuSubContent'
