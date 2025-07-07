import React, { forwardRef, useState, useRef, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface SearchBoxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  onSearch?: (query: string) => void
  onChange?: (query: string) => void
  onClear?: () => void
  loading?: boolean
  clearable?: boolean
  debounceMs?: number
  size?: 'sm' | 'md' | 'lg'
  suggestions?: string[]
  onSuggestionSelect?: (suggestion: string) => void
}

const sizeClasses = {
  sm: 'h-8 pl-8 pr-8 text-sm',
  md: 'h-10 pl-10 pr-10',
  lg: 'h-12 pl-12 pr-12 text-lg',
}

const iconSizeClasses = {
  sm: 'h-4 w-4 left-2',
  md: 'h-5 w-5 left-3',
  lg: 'h-6 w-6 left-3',
}

export const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(
  ({ 
    onSearch,
    onChange,
    onClear,
    loading = false,
    clearable = true,
    debounceMs = 300,
    size = 'md',
    suggestions = [],
    onSuggestionSelect,
    className,
    value: controlledValue,
    defaultValue,
    ...props 
  }, ref) => {
    const [value, setValue] = useState(controlledValue || defaultValue || '')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
    const debounceRef = useRef<NodeJS.Timeout | null>(null)
    const suggestionsRef = useRef<HTMLUListElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const isControlled = controlledValue !== undefined
    const currentValue = isControlled ? controlledValue : value

    useEffect(() => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        if (onChange) {
          onChange(String(currentValue))
        }
      }, debounceMs)

      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current)
        }
      }
    }, [currentValue, onChange, debounceMs])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      if (!isControlled) {
        setValue(newValue)
      }
      setShowSuggestions(newValue.length > 0 && suggestions.length > 0)
      setSelectedSuggestionIndex(-1)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex])
        } else if (onSearch) {
          onSearch(String(currentValue))
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
      } else if (e.key === 'Escape') {
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }
    }

    const handleSuggestionSelect = (suggestion: string) => {
      if (!isControlled) {
        setValue(suggestion)
      }
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
      if (onSuggestionSelect) {
        onSuggestionSelect(suggestion)
      }
      inputRef.current?.focus()
    }

    const handleClear = () => {
      if (!isControlled) {
        setValue('')
      }
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
      if (onClear) {
        onClear()
      }
      inputRef.current?.focus()
    }

    const filteredSuggestions = suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(String(currentValue).toLowerCase())
    )

    return (
      <div className="relative">
        <div className="relative">
          <Search 
            className={cn(
              'absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none',
              iconSizeClasses[size]
            )}
          />
          <input
            ref={ref || inputRef}
            type="text"
            value={currentValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(String(currentValue).length > 0 && suggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className={cn(
              'flex w-full rounded-md border border-input bg-background text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              sizeClasses[size],
              clearable && currentValue && 'pr-16',
              className
            )}
            {...props}
          />
          {(clearable && currentValue && !loading) && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'absolute top-1/2 -translate-y-1/2 right-2 p-1 hover:bg-muted rounded-sm',
                size === 'sm' ? 'right-1' : 'right-2'
              )}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          {loading && (
            <Loader2 
              className={cn(
                'absolute top-1/2 -translate-y-1/2 right-3 animate-spin text-muted-foreground',
                size === 'sm' ? 'h-3 w-3 right-2' : 'h-4 w-4'
              )}
            />
          )}
        </div>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <ul
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-60 overflow-auto"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <li
                key={suggestion}
                className={cn(
                  'px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground',
                  index === selectedSuggestionIndex && 'bg-accent text-accent-foreground'
                )}
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }
)

SearchBox.displayName = 'SearchBox'