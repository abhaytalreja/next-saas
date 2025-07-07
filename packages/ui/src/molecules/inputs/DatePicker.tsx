import React, { forwardRef, useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: Date
  onChange?: (date: Date | undefined) => void
  format?: 'date' | 'datetime' | 'time'
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  placeholder?: string
  showWeekNumbers?: boolean
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  locale?: string
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const formatDate = (date: Date | undefined, format: 'date' | 'datetime' | 'time' = 'date'): string => {
  if (!date) return ''
  
  switch (format) {
    case 'date':
      return date.toLocaleDateString()
    case 'datetime':
      return date.toLocaleString()
    case 'time':
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    default:
      return date.toLocaleDateString()
  }
}

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

const isDateDisabled = (date: Date, minDate?: Date, maxDate?: Date, disabledDates?: Date[]): boolean => {
  if (minDate && date < minDate) return true
  if (maxDate && date > maxDate) return true
  if (disabledDates?.some(disabledDate => isSameDay(date, disabledDate))) return true
  return false
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ 
    value,
    onChange,
    format = 'date',
    minDate,
    maxDate,
    disabledDates,
    placeholder,
    showWeekNumbers = false,
    firstDayOfWeek = 0,
    locale = 'en-US',
    className,
    disabled,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [viewDate, setViewDate] = useState(value || new Date())
    const [timeValue, setTimeValue] = useState(
      value ? { 
        hours: value.getHours(), 
        minutes: value.getMinutes() 
      } : { hours: 12, minutes: 0 }
    )
    
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen])

    const handleDateSelect = (selectedDate: Date) => {
      if (isDateDisabled(selectedDate, minDate, maxDate, disabledDates)) {
        return
      }

      let newDate = new Date(selectedDate)
      
      if (format === 'datetime') {
        newDate.setHours(timeValue.hours, timeValue.minutes)
      } else if (format === 'time') {
        const today = new Date()
        newDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), timeValue.hours, timeValue.minutes)
      }

      onChange?.(newDate)
      
      if (format === 'date') {
        setIsOpen(false)
      }
    }

    const handleTimeChange = (hours: number, minutes: number) => {
      setTimeValue({ hours, minutes })
      
      if (value) {
        const newDate = new Date(value)
        newDate.setHours(hours, minutes)
        onChange?.(newDate)
      }
    }

    const navigateMonth = (direction: 'prev' | 'next') => {
      const newDate = new Date(viewDate)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      setViewDate(newDate)
    }

    const navigateYear = (direction: 'prev' | 'next') => {
      const newDate = new Date(viewDate)
      if (direction === 'prev') {
        newDate.setFullYear(newDate.getFullYear() - 1)
      } else {
        newDate.setFullYear(newDate.getFullYear() + 1)
      }
      setViewDate(newDate)
    }

    const getDaysInMonth = (date: Date): Date[] => {
      const year = date.getFullYear()
      const month = date.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const days: Date[] = []

      // Add days from previous month to fill the first week
      const startDay = (firstDay.getDay() - firstDayOfWeek + 7) % 7
      for (let i = startDay - 1; i >= 0; i--) {
        days.push(new Date(year, month, -i))
      }

      // Add days of current month
      for (let day = 1; day <= lastDay.getDate(); day++) {
        days.push(new Date(year, month, day))
      }

      // Add days from next month to fill the last week
      const remainingDays = 42 - days.length // 6 weeks * 7 days
      for (let day = 1; day <= remainingDays; day++) {
        days.push(new Date(year, month + 1, day))
      }

      return days
    }

    const renderCalendar = () => {
      const days = getDaysInMonth(viewDate)
      const today = new Date()

      return (
        <div className="p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => navigateYear('prev')}
                className="p-1 hover:bg-accent rounded"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navigateMonth('prev')}
                className="p-1 hover:bg-accent rounded"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
            
            <div className="font-medium">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </div>
            
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => navigateMonth('next')}
                className="p-1 hover:bg-accent rounded"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navigateYear('next')}
                className="p-1 hover:bg-accent rounded"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day, index) => (
              <div key={day} className="p-2 text-xs font-medium text-muted-foreground text-center">
                {WEEKDAYS[(index + firstDayOfWeek) % 7]}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isCurrentMonth = day.getMonth() === viewDate.getMonth()
              const isToday = isSameDay(day, today)
              const isSelected = value && isSameDay(day, value)
              const isDisabled = isDateDisabled(day, minDate, maxDate, disabledDates)

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  disabled={isDisabled}
                  className={cn(
                    'p-2 text-sm rounded hover:bg-accent transition-colors',
                    !isCurrentMonth && 'text-muted-foreground',
                    isToday && 'bg-accent font-medium',
                    isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
                    isDisabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
                  )}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    const renderTimePicker = () => (
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-1">
            <select
              value={timeValue.hours}
              onChange={(e) => handleTimeChange(Number(e.target.value), timeValue.minutes)}
              className="border border-input rounded px-2 py-1 text-sm"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
            <span className="text-muted-foreground">:</span>
            <select
              value={timeValue.minutes}
              onChange={(e) => handleTimeChange(timeValue.hours, Number(e.target.value))}
              className="border border-input rounded px-2 py-1 text-sm"
            >
              {Array.from({ length: 60 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    )

    return (
      <div ref={containerRef} className="relative">
        <div className="relative">
          <input
            ref={ref || inputRef}
            type="text"
            value={formatDate(value, format)}
            placeholder={placeholder || `Select ${format}...`}
            readOnly
            disabled={disabled}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={cn(
              'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
              className
            )}
            {...props}
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-1 bg-popover border border-border rounded-md shadow-md">
            {format !== 'time' && renderCalendar()}
            {(format === 'datetime' || format === 'time') && renderTimePicker()}
          </div>
        )}
      </div>
    )
  }
)

DatePicker.displayName = 'DatePicker'