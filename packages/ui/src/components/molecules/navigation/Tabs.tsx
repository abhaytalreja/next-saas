'use client'

import React, { useState, createContext, useContext } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../../lib/utils'

// Tab Context
interface TabsContextValue {
  activeTab: string
  setActiveTab: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'pills' | 'underline' | 'bordered'
  size?: 'sm' | 'md' | 'lg'
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

const useTabsContext = () => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error(
      'Tabs compound components must be used within a Tabs component'
    )
  }
  return context
}

// Main Tabs component
export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'pills' | 'underline' | 'bordered'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children: React.ReactNode
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  orientation = 'horizontal',
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '')
  const activeTab = value ?? internalValue

  const setActiveTab = (newValue: string) => {
    setInternalValue(newValue)
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider
      value={{ activeTab, setActiveTab, orientation, variant, size }}
    >
      <div
        className={cn(orientation === 'vertical' && 'flex gap-4', className)}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

// TabsList component
const tabsListVariants = cva('inline-flex items-center justify-start', {
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col w-full',
    },
    variant: {
      default: 'h-10 rounded-md bg-gray-100 p-1 dark:bg-gray-800',
      pills: 'gap-2',
      underline: 'border-b border-gray-200 dark:border-gray-700',
      bordered: 'border rounded-lg p-1 border-gray-200 dark:border-gray-700',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'default',
  },
})

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => {
    const { orientation, variant } = useTabsContext()

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={orientation}
        className={cn(tabsListVariants({ orientation, variant }), className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

TabsList.displayName = 'TabsList'

// TabsTrigger component
const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:ring-offset-gray-950 dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-gray-50',
        pills:
          'rounded-md px-3 py-1.5 text-sm font-medium data-[state=active]:bg-primary-600 data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-800',
        underline:
          'border-b-2 border-transparent px-4 py-2 text-sm font-medium hover:text-gray-900 dark:hover:text-gray-100 data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 dark:data-[state=active]:border-primary-400 dark:data-[state=active]:text-primary-400',
        bordered:
          'rounded px-3 py-1.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900',
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
      orientation: {
        horizontal: '',
        vertical: 'w-full justify-start',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      orientation: 'horizontal',
    },
  }
)

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  className?: string
  children: React.ReactNode
}

export const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  TabsTriggerProps
>(({ value, className, children, ...props }, ref) => {
  const { activeTab, setActiveTab, variant, size, orientation } =
    useTabsContext()
  const isActive = activeTab === value

  return (
    <button
      ref={ref}
      role="tab"
      type="button"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      data-state={isActive ? 'active' : 'inactive'}
      onClick={() => setActiveTab(value)}
      className={cn(
        tabsTriggerVariants({ variant, size, orientation }),
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})

TabsTrigger.displayName = 'TabsTrigger'

// TabsContent component
export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  className?: string
  children: React.ReactNode
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, className, children, ...props }, ref) => {
    const { activeTab } = useTabsContext()
    const isActive = activeTab === value

    if (!isActive) return null

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`tabpanel-${value}`}
        aria-labelledby={`tab-${value}`}
        data-state={isActive ? 'active' : 'inactive'}
        className={cn(
          'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:ring-offset-gray-950',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

TabsContent.displayName = 'TabsContent'

// Simple Tabs component for quick use
export interface SimpleTab {
  label: string
  value: string
  content: React.ReactNode
  disabled?: boolean
  icon?: React.ComponentType<{ className?: string }>
}

export interface SimpleTabsProps extends Omit<TabsProps, 'children'> {
  tabs: SimpleTab[]
}

export const SimpleTabs: React.FC<SimpleTabsProps> = ({ tabs, ...props }) => {
  const firstEnabledTab =
    tabs.find(tab => !tab.disabled)?.value || tabs[0]?.value

  return (
    <Tabs defaultValue={firstEnabledTab} {...props}>
      <TabsList>
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
          >
            {tab.icon && <tab.icon className="h-4 w-4 mr-2" />}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
