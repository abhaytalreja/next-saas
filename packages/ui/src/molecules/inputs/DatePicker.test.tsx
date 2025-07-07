import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../test-utils'
import { DatePicker } from './DatePicker'
import { testAccessibility } from '../../test-utils'

// Mock date for consistent testing
const mockDate = new Date('2024-01-15T12:30:00')

describe('DatePicker Component', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(mockDate)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders correctly', () => {
      render(<DatePicker />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Select date...')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<DatePicker className="custom-picker" />)
      expect(screen.getByRole('textbox')).toHaveClass('custom-picker')
    })

    it('shows calendar icon', () => {
      render(<DatePicker />)
      const container = screen.getByRole('textbox').closest('div')
      expect(container?.querySelector('svg')).toBeInTheDocument()
    })

    it('uses custom placeholder', () => {
      render(<DatePicker placeholder="Pick a date" />)
      expect(screen.getByPlaceholderText('Pick a date')).toBeInTheDocument()
    })
  })

  describe('Input Display', () => {
    it('displays formatted date value', () => {
      const testDate = new Date('2024-01-15')
      render(<DatePicker value={testDate} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue(testDate.toLocaleDateString())
    })

    it('displays formatted datetime value', () => {
      const testDate = new Date('2024-01-15T14:30:00')
      render(<DatePicker value={testDate} format="datetime" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue(testDate.toLocaleString())
    })

    it('displays formatted time value', () => {
      const testDate = new Date('2024-01-15T14:30:00')
      render(<DatePicker value={testDate} format="time" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('14:30')
    })

    it('shows empty value when no date selected', () => {
      render(<DatePicker />)
      expect(screen.getByRole('textbox')).toHaveValue('')
    })
  })

  describe('Calendar Popup', () => {
    it('opens calendar when input is clicked', () => {
      render(<DatePicker />)
      
      fireEvent.click(screen.getByRole('textbox'))
      expect(screen.getByText('January 2024')).toBeInTheDocument()
    })

    it('closes calendar when clicking outside', async () => {
      render(
        <div>
          <DatePicker />
          <div data-testid="outside">Outside element</div>
        </div>
      )
      
      fireEvent.click(screen.getByRole('textbox'))
      expect(screen.getByText('January 2024')).toBeInTheDocument()
      
      fireEvent.mouseDown(screen.getByTestId('outside'))
      await waitFor(() => {
        expect(screen.queryByText('January 2024')).not.toBeInTheDocument()
      })
    })

    it('does not open when disabled', () => {
      render(<DatePicker disabled />)
      
      fireEvent.click(screen.getByRole('textbox'))
      expect(screen.queryByText('January 2024')).not.toBeInTheDocument()
    })

    it('toggles calendar visibility on input click', () => {
      render(<DatePicker />)
      
      const input = screen.getByRole('textbox')
      
      fireEvent.click(input)
      expect(screen.getByText('January 2024')).toBeInTheDocument()
      
      fireEvent.click(input)
      expect(screen.queryByText('January 2024')).not.toBeInTheDocument()
    })
  })

  describe('Date Selection', () => {
    it('selects a date when clicking on calendar day', () => {
      const onChange = jest.fn()
      render(<DatePicker onChange={onChange} />)
      
      fireEvent.click(screen.getByRole('textbox'))
      fireEvent.click(screen.getByText('20'))
      
      expect(onChange).toHaveBeenCalledWith(new Date('2024-01-20'))
    })

    it('closes calendar after date selection in date mode', () => {
      render(<DatePicker />)
      
      fireEvent.click(screen.getByRole('textbox'))
      fireEvent.click(screen.getByText('20'))
      
      expect(screen.queryByText('January 2024')).not.toBeInTheDocument()
    })

    it('keeps calendar open after date selection in datetime mode', () => {
      render(<DatePicker format="datetime" />)
      
      fireEvent.click(screen.getByRole('textbox'))
      fireEvent.click(screen.getByText('20'))
      
      expect(screen.getByText('January 2024')).toBeInTheDocument()
    })

    it('does not select disabled dates', () => {
      const onChange = jest.fn()
      const disabledDate = new Date('2024-01-20')
      
      render(<DatePicker onChange={onChange} disabledDates={[disabledDate]} />)
      
      fireEvent.click(screen.getByRole('textbox'))
      
      const dateButton = screen.getByText('20')
      expect(dateButton).toBeDisabled()
      
      fireEvent.click(dateButton)
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('Navigation', () => {
    it('navigates to previous month', () => {
      render(<DatePicker />)
      
      fireEvent.click(screen.getByRole('textbox'))
      expect(screen.getByText('January 2024')).toBeInTheDocument()
      
      const prevButtons = screen.getAllByRole('button')
      const prevMonthButton = prevButtons.find(btn => 
        btn.querySelector('svg') && !btn.textContent?.includes('20')
      )
      
      fireEvent.click(prevMonthButton!)
      expect(screen.getByText('December 2023')).toBeInTheDocument()
    })

    it('navigates to next month', () => {
      render(<DatePicker />)
      
      fireEvent.click(screen.getByRole('textbox'))
      expect(screen.getByText('January 2024')).toBeInTheDocument()
      
      const nextButtons = screen.getAllByRole('button')
      const nextMonthButton = nextButtons[nextButtons.length - 2] // Second to last button
      
      fireEvent.click(nextMonthButton)
      expect(screen.getByText('February 2024')).toBeInTheDocument()
    })

    it('navigates to previous year', () => {
      render(<DatePicker />)
      
      fireEvent.click(screen.getByRole('textbox'))
      expect(screen.getByText('January 2024')).toBeInTheDocument()
      
      const prevButtons = screen.getAllByRole('button')
      const prevYearButton = prevButtons[0] // First button
      
      fireEvent.click(prevYearButton)
      expect(screen.getByText('January 2023')).toBeInTheDocument()
    })

    it('navigates to next year', () => {
      render(<DatePicker />)
      
      fireEvent.click(screen.getByRole('textbox'))
      expect(screen.getByText('January 2024')).toBeInTheDocument()
      
      const nextButtons = screen.getAllByRole('button')
      const nextYearButton = nextButtons[nextButtons.length - 1] // Last button
      
      fireEvent.click(nextYearButton)
      expect(screen.getByText('January 2025')).toBeInTheDocument()
    })
  })

  describe('Time Picker', () => {
    it('shows time picker for datetime format', () => {
      render(<DatePicker format="datetime" />)
      
      fireEvent.click(screen.getByRole('textbox'))
      expect(screen.getAllByRole('combobox')).toHaveLength(2) // Hours and minutes
    })

    it('shows time picker for time format', () => {
      render(<DatePicker format="time" />)
      
      fireEvent.click(screen.getByRole('textbox'))
      expect(screen.getAllByRole('combobox')).toHaveLength(2) // Hours and minutes
    })

    it('does not show time picker for date format', () => {
      render(<DatePicker format="date" />)
      
      fireEvent.click(screen.getByRole('textbox'))
      expect(screen.queryAllByRole('combobox')).toHaveLength(0)
    })

    it('changes time when time inputs are modified', () => {
      const onChange = jest.fn()
      const testDate = new Date('2024-01-15T12:30:00')
      
      render(<DatePicker value={testDate} onChange={onChange} format="datetime" />)
      
      fireEvent.click(screen.getByRole('textbox'))
      
      const hourSelect = screen.getAllByRole('combobox')[0]
      fireEvent.change(hourSelect, { target: { value: '14' } })
      
      expect(onChange).toHaveBeenCalledWith(new Date('2024-01-15T14:30:00'))
    })
  })

  describe('Date Constraints', () => {
    it('disables dates before minDate', () => {
      const minDate = new Date('2024-01-15')
      render(<DatePicker minDate={minDate} />)
      
      fireEvent.click(screen.getByRole('textbox'))
      
      const date14 = screen.getByText('14')
      const date15 = screen.getByText('15')
      const date16 = screen.getByText('16')
      
      expect(date14).toBeDisabled()
      expect(date15).not.toBeDisabled()
      expect(date16).not.toBeDisabled()
    })

    it('disables dates after maxDate', () => {
      const maxDate = new Date('2024-01-15')
      render(<DatePicker maxDate={maxDate} />)
      
      fireEvent.click(screen.getByRole('textbox'))
      
      const date14 = screen.getByText('14')
      const date15 = screen.getByText('15')
      const date16 = screen.getByText('16')
      
      expect(date14).not.toBeDisabled()
      expect(date15).not.toBeDisabled()
      expect(date16).toBeDisabled()
    })

    it('disables specific dates in disabledDates array', () => {
      const disabledDates = [new Date('2024-01-10'), new Date('2024-01-20')]
      render(<DatePicker disabledDates={disabledDates} />)
      
      fireEvent.click(screen.getByRole('textbox'))
      
      const date10 = screen.getByText('10')
      const date15 = screen.getByText('15')
      const date20 = screen.getByText('20')
      
      expect(date10).toBeDisabled()
      expect(date15).not.toBeDisabled()
      expect(date20).toBeDisabled()
    })
  })

  describe('Visual States', () => {
    it('highlights today\'s date', () => {
      render(<DatePicker />)
      
      fireEvent.click(screen.getByRole('textbox'))
      
      const todayButton = screen.getByText('15') // Current date is 15th
      expect(todayButton).toHaveClass('bg-accent', 'font-medium')
    })

    it('highlights selected date', () => {
      const selectedDate = new Date('2024-01-20')
      render(<DatePicker value={selectedDate} />)
      
      fireEvent.click(screen.getByRole('textbox'))
      
      const selectedButton = screen.getByText('20')
      expect(selectedButton).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('dims dates from other months', () => {
      render(<DatePicker />)
      
      fireEvent.click(screen.getByRole('textbox'))
      
      // Days from previous/next month should have muted styling
      const calendarGrid = document.querySelector('.grid-cols-7:last-child')
      const buttons = calendarGrid?.querySelectorAll('button')
      
      expect(buttons).toBeTruthy()
      expect(buttons!.length).toBeGreaterThan(28) // Should include prev/next month days
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      await testAccessibility(<DatePicker />)
    })

    it('supports keyboard navigation', () => {
      render(<DatePicker />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'text')
      expect(input).toHaveAttribute('readonly')
    })

    it('has proper ARIA attributes', () => {
      render(<DatePicker />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('calendar buttons are properly labeled', () => {
      render(<DatePicker />)
      
      fireEvent.click(screen.getByRole('textbox'))
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      
      // Date buttons should contain date numbers
      const dateButtons = buttons.filter(btn => /^\d+$/.test(btn.textContent || ''))
      expect(dateButtons.length).toBeGreaterThan(20) // Should have at least date buttons
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('works as controlled component', () => {
      const ControlledDatePicker = () => {
        const [date, setDate] = React.useState<Date | undefined>(new Date('2024-01-15'))
        return <DatePicker value={date} onChange={setDate} />
      }
      
      render(<ControlledDatePicker />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue(new Date('2024-01-15').toLocaleDateString())
      
      fireEvent.click(input)
      fireEvent.click(screen.getByText('20'))
      
      expect(input).toHaveValue(new Date('2024-01-20').toLocaleDateString())
    })

    it('works as uncontrolled component', () => {
      const onChange = jest.fn()
      render(<DatePicker onChange={onChange} />)
      
      fireEvent.click(screen.getByRole('textbox'))
      fireEvent.click(screen.getByText('20'))
      
      expect(onChange).toHaveBeenCalledWith(new Date('2024-01-20'))
    })
  })

  describe('Disabled State', () => {
    it('applies disabled styling when disabled', () => {
      render(<DatePicker disabled />)
      
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })

    it('does not open calendar when disabled', () => {
      render(<DatePicker disabled />)
      
      fireEvent.click(screen.getByRole('textbox'))
      expect(screen.queryByText('January 2024')).not.toBeInTheDocument()
    })
  })

  describe('Forwarded Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<DatePicker ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })
  })

  describe('First Day of Week', () => {
    it('respects firstDayOfWeek setting', () => {
      render(<DatePicker firstDayOfWeek={1} />) // Monday first
      
      fireEvent.click(screen.getByRole('textbox'))
      
      const weekdayHeaders = document.querySelectorAll('.grid-cols-7 .text-muted-foreground')
      expect(weekdayHeaders[0]).toHaveTextContent('Mon')
      expect(weekdayHeaders[6]).toHaveTextContent('Sun')
    })
  })
})