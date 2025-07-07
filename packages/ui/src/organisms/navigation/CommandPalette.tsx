import React, { forwardRef, useState, useRef, useEffect, useMemo } from 'react'
import { Search, ArrowRight, Hash, User, File, Settings, Zap, Clock } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  shortcut?: string[]
  category?: string
  keywords?: string[]
  onSelect?: () => void
  href?: string
  disabled?: boolean
}

export interface CommandGroup {
  id: string
  label: string
  items: CommandItem[]
  priority?: number
}

export interface CommandPaletteProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  items?: CommandItem[]
  groups?: CommandGroup[]
  placeholder?: string
  emptyMessage?: string
  maxResults?: number
  enableKeyboardShortcuts?: boolean
  recentItems?: CommandItem[]
  onRecentItemsChange?: (items: CommandItem[]) => void
  loading?: boolean
  searchValue?: string
  onSearchChange?: (value: string) => void
}

const DEFAULT_GROUPS: CommandGroup[] = [
  {
    id: 'suggestions',
    label: 'Suggestions',
    items: [],
    priority: 1,
  },
  {
    id: 'recent',
    label: 'Recent',
    items: [],
    priority: 2,
  },
  {
    id: 'navigation',
    label: 'Navigation',
    items: [],
    priority: 3,
  },
  {
    id: 'actions',
    label: 'Actions',
    items: [],
    priority: 4,
  },
]

const getCategoryIcon = (category?: string) => {
  switch (category) {
    case 'navigation':
      return Hash
    case 'user':
      return User
    case 'file':
      return File
    case 'settings':
      return Settings
    case 'action':
      return Zap
    case 'recent':
      return Clock
    default:
      return ArrowRight
  }
}

export const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(
  ({ 
    open = false,
    onOpenChange,
    items = [],
    groups: propGroups,
    placeholder = 'Type a command or search...',
    emptyMessage = 'No results found.',
    maxResults = 10,
    enableKeyboardShortcuts = true,
    recentItems = [],
    onRecentItemsChange,
    loading = false,
    searchValue: controlledSearchValue,
    onSearchChange,
    className,
    ...props 
  }, ref) => {
    const [internalSearchValue, setInternalSearchValue] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const itemRefs = useRef<(HTMLElement | null)[]>([])

    const searchValue = controlledSearchValue ?? internalSearchValue
    const isControlled = controlledSearchValue !== undefined

    const handleSearchChange = (value: string) => {
      if (!isControlled) {
        setInternalSearchValue(value)
      }
      onSearchChange?.(value)
      setSelectedIndex(0)
    }

    // Combine items and groups
    const allGroups = useMemo(() => {
      if (propGroups) {
        return propGroups.sort((a, b) => (a.priority || 999) - (b.priority || 999))
      }

      // Auto-categorize items if no groups provided
      const groups = [...DEFAULT_GROUPS]
      
      // Add recent items
      if (recentItems.length > 0) {
        const recentGroup = groups.find(g => g.id === 'recent')
        if (recentGroup) {
          recentGroup.items = recentItems.slice(0, 3)
        }
      }

      // Categorize other items
      items.forEach(item => {
        const category = item.category || 'actions'
        let group = groups.find(g => g.id === category)
        
        if (!group) {
          group = {
            id: category,
            label: category.charAt(0).toUpperCase() + category.slice(1),
            items: [],
            priority: 999,
          }
          groups.push(group)
        }
        
        group.items.push(item)
      })

      return groups.filter(group => group.items.length > 0)
    }, [items, propGroups, recentItems])

    // Filter and search items
    const filteredGroups = useMemo(() => {
      if (!searchValue.trim()) {
        return allGroups
      }

      const query = searchValue.toLowerCase()
      const filtered = allGroups.map(group => ({
        ...group,
        items: group.items
          .filter(item => {
            if (item.disabled) return false
            
            const searchTargets = [
              item.label,
              item.description,
              ...(item.keywords || []),
            ].filter(Boolean).join(' ').toLowerCase()
            
            return searchTargets.includes(query)
          })
          .slice(0, maxResults)
      })).filter(group => group.items.length > 0)

      return filtered
    }, [allGroups, searchValue, maxResults])

    // Flatten items for keyboard navigation
    const flatItems = useMemo(() => {
      return filteredGroups.flatMap(group => group.items)
    }, [filteredGroups])

    // Handle item selection
    const selectItem = (item: CommandItem) => {
      if (item.disabled) return

      // Add to recent items
      if (onRecentItemsChange && !recentItems.find(recent => recent.id === item.id)) {
        const newRecent = [item, ...recentItems.slice(0, 4)]
        onRecentItemsChange(newRecent)
      }

      // Execute action
      if (item.onSelect) {
        item.onSelect()
      } else if (item.href) {
        window.location.href = item.href
      }

      // Close palette
      onOpenChange?.(false)
    }

    // Keyboard navigation
    useEffect(() => {
      if (!open) return

      const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault()
            setSelectedIndex(prev => 
              prev < flatItems.length - 1 ? prev + 1 : prev
            )
            break
          case 'ArrowUp':
            e.preventDefault()
            setSelectedIndex(prev => prev > 0 ? prev - 1 : 0)
            break
          case 'Enter':
            e.preventDefault()
            if (flatItems[selectedIndex]) {
              selectItem(flatItems[selectedIndex])
            }
            break
          case 'Escape':
            e.preventDefault()
            onOpenChange?.(false)
            break
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }, [open, flatItems, selectedIndex, onOpenChange])

    // Scroll selected item into view
    useEffect(() => {
      const selectedElement = itemRefs.current[selectedIndex]
      if (selectedElement && listRef.current) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        })
      }
    }, [selectedIndex])

    // Focus input when opened
    useEffect(() => {
      if (open) {
        setTimeout(() => inputRef.current?.focus(), 0)
        if (!isControlled) {
          setInternalSearchValue('')
        }
        setSelectedIndex(0)
      }
    }, [open, isControlled])

    // Global keyboard shortcut
    useEffect(() => {
      if (!enableKeyboardShortcuts) return

      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault()
          onOpenChange?.(!open)
        }
      }

      document.addEventListener('keydown', handleGlobalKeyDown)
      return () => document.removeEventListener('keydown', handleGlobalKeyDown)
    }, [open, onOpenChange, enableKeyboardShortcuts])

    if (!open) return null

    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => onOpenChange?.(false)}
        />
        
        {/* Command Palette */}
        <div
          ref={ref}
          className={cn(
            'fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg bg-popover border border-border rounded-lg shadow-lg z-50',
            className
          )}
          {...props}
        >
          {/* Search Input */}
          <div className="flex items-center border-b border-border px-3">
            <Search className="h-4 w-4 text-muted-foreground mr-2" />
            <input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1 py-3 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            {enableKeyboardShortcuts && (
              <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                <kbd className="px-1.5 py-0.5 border border-border rounded text-xs">⌘</kbd>
                <kbd className="px-1.5 py-0.5 border border-border rounded text-xs">K</kbd>
              </div>
            )}
          </div>

          {/* Results */}
          <div 
            ref={listRef}
            className="max-h-80 overflow-y-auto py-2"
          >
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-5 w-5 border-2 border-border border-t-foreground rounded-full" />
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              filteredGroups.map((group, groupIndex) => (
                <div key={group.id}>
                  {searchValue && (
                    <div className="px-3 py-1 text-xs font-medium text-muted-foreground">
                      {group.label}
                    </div>
                  )}
                  
                  {group.items.map((item, itemIndex) => {
                    const globalIndex = filteredGroups
                      .slice(0, groupIndex)
                      .reduce((acc, g) => acc + g.items.length, 0) + itemIndex
                    
                    const Icon = item.icon || getCategoryIcon(item.category)
                    const isSelected = globalIndex === selectedIndex
                    
                    return (
                      <button
                        key={item.id}
                        ref={(el) => {
                          itemRefs.current[globalIndex] = el
                        }}
                        onClick={() => selectItem(item)}
                        disabled={item.disabled}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors',
                          isSelected && 'bg-accent text-accent-foreground',
                          item.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {item.label}
                          </div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {item.description}
                            </div>
                          )}
                        </div>
                        
                        {item.shortcut && (
                          <div className="flex items-center gap-1">
                            {item.shortcut.map((key, index) => (
                              <kbd
                                key={index}
                                className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {!loading && flatItems.length > 0 && (
            <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
              Press <kbd className="px-1 bg-muted border border-border rounded">↑↓</kbd> to navigate,{' '}
              <kbd className="px-1 bg-muted border border-border rounded">Enter</kbd> to select,{' '}
              <kbd className="px-1 bg-muted border border-border rounded">Esc</kbd> to close
            </div>
          )}
        </div>
      </>
    )
  }
)

CommandPalette.displayName = 'CommandPalette'