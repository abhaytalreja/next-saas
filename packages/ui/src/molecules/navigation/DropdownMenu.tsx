import React, { 
  forwardRef, 
  createContext, 
  useContext, 
  useState, 
  useRef, 
  useEffect 
} from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '../../lib/utils'

interface DropdownContextType {
  open: boolean
  setOpen: (open: boolean) => void
  closeDropdown: () => void
}

const DropdownContext = createContext<DropdownContextType | null>(null)

const useDropdown = () => {
  const context = useContext(DropdownContext)
  if (!context) {
    throw new Error('Dropdown components must be used within a DropdownMenu')
  }
  return context
}

export interface DropdownMenuProps {
  children: React.ReactNode
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export const DropdownMenu = ({ 
  children, 
  defaultOpen = false, 
  onOpenChange 
}: DropdownMenuProps) => {
  const [open, setOpen] = useState(defaultOpen)

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  const closeDropdown = () => handleOpenChange(false)

  return (
    <DropdownContext.Provider value={{ open, setOpen: handleOpenChange, closeDropdown }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

export interface DropdownTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  children: React.ReactNode | React.ReactElement<any>
}

export const DropdownTrigger = forwardRef<HTMLButtonElement, DropdownTriggerProps>(
  ({ asChild = false, children, className, ...props }, ref) => {
    const { open, setOpen } = useDropdown()

    const handleClick = () => {
      setOpen(!open)
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        onClick: handleClick,
        'aria-expanded': open,
        'aria-haspopup': true,
      })
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        aria-expanded={open}
        aria-haspopup={true}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
    )
  }
)

DropdownTrigger.displayName = 'DropdownTrigger'

export interface DropdownContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'left' | 'right'
  sideOffset?: number
  children: React.ReactNode
}

export const DropdownContent = forwardRef<HTMLDivElement, DropdownContentProps>(
  ({ 
    align = 'start',
    side = 'bottom', 
    sideOffset = 4,
    children, 
    className, 
    ...props 
  }, ref) => {
    const { open, closeDropdown } = useDropdown()
    const contentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
          closeDropdown()
        }
      }

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          closeDropdown()
        }
      }

      if (open) {
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }, [open, closeDropdown])

    if (!open) return null

    const alignmentClasses = {
      start: 'left-0',
      center: 'left-1/2 -translate-x-1/2',
      end: 'right-0',
    }

    const sideClasses = {
      top: `bottom-full mb-${sideOffset}`,
      bottom: `top-full mt-${sideOffset}`,
      left: `right-full mr-${sideOffset}`,
      right: `left-full ml-${sideOffset}`,
    }

    return (
      <div
        ref={ref || contentRef}
        className={cn(
          'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
          alignmentClasses[align],
          sideClasses[side],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

DropdownContent.displayName = 'DropdownContent'

export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  destructive?: boolean
  children: React.ReactNode
}

export const DropdownItem = forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ destructive = false, children, className, onClick, ...props }, ref) => {
    const { closeDropdown } = useDropdown()

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      closeDropdown()
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        className={cn(
          'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50',
          destructive && 'text-destructive focus:text-destructive',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

DropdownItem.displayName = 'DropdownItem'

export interface DropdownCheckboxItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  children: React.ReactNode
}

export const DropdownCheckboxItem = forwardRef<HTMLButtonElement, DropdownCheckboxItemProps>(
  ({ checked = false, onCheckedChange, children, className, onClick, ...props }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      onCheckedChange?.(!checked)
      onClick?.(event)
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        className={cn(
          'relative flex w-full cursor-default select-none items-center rounded-sm pl-8 pr-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {checked && <Check className="h-4 w-4" />}
        </span>
        {children}
      </button>
    )
  }
)

DropdownCheckboxItem.displayName = 'DropdownCheckboxItem'

export interface DropdownSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DropdownSeparator = forwardRef<HTMLDivElement, DropdownSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-muted', className)}
      {...props}
    />
  )
)

DropdownSeparator.displayName = 'DropdownSeparator'

export interface DropdownLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const DropdownLabel = forwardRef<HTMLDivElement, DropdownLabelProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-2 py-1.5 text-sm font-semibold', className)}
      {...props}
    >
      {children}
    </div>
  )
)

DropdownLabel.displayName = 'DropdownLabel'