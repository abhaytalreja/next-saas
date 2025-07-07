import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '../../test-utils'
import { SearchBox } from './SearchBox'
import { testAccessibility } from '../../test-utils'

describe('SearchBox Component', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders correctly', () => {
      render(<SearchBox />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
    })

    it('applies custom className', () => {
      render(<SearchBox className="custom-search" />)
      expect(screen.getByRole('textbox')).toHaveClass('custom-search')
    })

    it('shows search icon', () => {
      render(<SearchBox />)
      const container = screen.getByRole('textbox').closest('div')
      expect(container?.querySelector('svg')).toBeInTheDocument()
    })

    it('supports placeholder text', () => {
      render(<SearchBox placeholder="Search anything..." />)
      expect(screen.getByPlaceholderText('Search anything...')).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const

    sizes.forEach((size) => {
      it(`renders ${size} size correctly`, () => {
        render(<SearchBox size={size} />)
        const input = screen.getByRole('textbox')
        expect(input).toBeInTheDocument()
        
        if (size === 'sm') {
          expect(input).toHaveClass('h-8', 'text-sm')
        } else if (size === 'lg') {
          expect(input).toHaveClass('h-12', 'text-lg')
        } else {
          expect(input).toHaveClass('h-10')
        }
      })
    })
  })

  describe('Input Behavior', () => {
    it('handles text input', () => {
      render(<SearchBox />)
      const input = screen.getByRole('textbox')
      
      fireEvent.change(input, { target: { value: 'test query' } })
      expect(input).toHaveValue('test query')
    })

    it('calls onChange with debounce', async () => {
      const onChange = jest.fn()
      render(<SearchBox onChange={onChange} debounceMs={100} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'test' } })
      
      expect(onChange).not.toHaveBeenCalled()
      
      act(() => {
        jest.advanceTimersByTime(100)
      })
      
      expect(onChange).toHaveBeenCalledWith('test')
    })

    it('calls onSearch on Enter key', () => {
      const onSearch = jest.fn()
      render(<SearchBox onSearch={onSearch} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'search term' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      
      expect(onSearch).toHaveBeenCalledWith('search term')
    })

    it('works as controlled component', () => {
      const ControlledSearch = () => {
        const [value, setValue] = React.useState('initial')
        return (
          <SearchBox
            value={value}
            onChange={setValue}
            onSearch={() => {}}
          />
        )
      }
      
      render(<ControlledSearch />)
      const input = screen.getByRole('textbox')
      
      expect(input).toHaveValue('initial')
      
      fireEvent.change(input, { target: { value: 'updated' } })
      
      act(() => {
        jest.advanceTimersByTime(300)
      })
      
      expect(input).toHaveValue('updated')
    })

    it('works as uncontrolled component', () => {
      const onChange = jest.fn()
      render(<SearchBox defaultValue="default" onChange={onChange} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('default')
      
      fireEvent.change(input, { target: { value: 'changed' } })
      expect(input).toHaveValue('changed')
    })
  })

  describe('Clear Functionality', () => {
    it('shows clear button when clearable and has value', () => {
      render(<SearchBox defaultValue="test" clearable />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('does not show clear button when clearable is false', () => {
      render(<SearchBox defaultValue="test" clearable={false} />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('does not show clear button when no value', () => {
      render(<SearchBox clearable />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('clears input when clear button is clicked', () => {
      const onClear = jest.fn()
      render(<SearchBox defaultValue="test" onClear={onClear} />)
      
      const clearButton = screen.getByRole('button')
      fireEvent.click(clearButton)
      
      expect(screen.getByRole('textbox')).toHaveValue('')
      expect(onClear).toHaveBeenCalled()
    })

    it('focuses input after clearing', () => {
      render(<SearchBox defaultValue="test" />)
      
      const input = screen.getByRole('textbox')
      const clearButton = screen.getByRole('button')
      
      fireEvent.click(clearButton)
      expect(input).toHaveFocus()
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner when loading', () => {
      render(<SearchBox loading />)
      expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('hides clear button when loading', () => {
      render(<SearchBox defaultValue="test" loading clearable />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('adjusts loading icon size based on component size', () => {
      render(<SearchBox loading size="sm" />)
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toHaveClass('h-3', 'w-3')
    })
  })

  describe('Suggestions', () => {
    const mockSuggestions = ['apple', 'banana', 'cherry', 'date']

    it('shows suggestions when input is focused and has value', () => {
      render(<SearchBox suggestions={mockSuggestions} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'a' } })
      fireEvent.focus(input)
      
      expect(screen.getByText('apple')).toBeInTheDocument()
      expect(screen.getByText('banana')).toBeInTheDocument()
    })

    it('filters suggestions based on input value', () => {
      render(<SearchBox suggestions={mockSuggestions} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'ap' } })
      fireEvent.focus(input)
      
      expect(screen.getByText('apple')).toBeInTheDocument()
      expect(screen.queryByText('banana')).not.toBeInTheDocument()
    })

    it('hides suggestions when input loses focus', async () => {
      render(<SearchBox suggestions={mockSuggestions} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'a' } })
      fireEvent.focus(input)
      
      expect(screen.getByText('apple')).toBeInTheDocument()
      
      fireEvent.blur(input)
      
      await waitFor(() => {
        expect(screen.queryByText('apple')).not.toBeInTheDocument()
      }, { timeout: 200 })
    })

    it('selects suggestion on click', () => {
      const onSuggestionSelect = jest.fn()
      render(<SearchBox suggestions={mockSuggestions} onSuggestionSelect={onSuggestionSelect} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'a' } })
      fireEvent.focus(input)
      
      fireEvent.click(screen.getByText('apple'))
      
      expect(input).toHaveValue('apple')
      expect(onSuggestionSelect).toHaveBeenCalledWith('apple')
      expect(screen.queryByText('banana')).not.toBeInTheDocument()
    })

    it('navigates suggestions with arrow keys', () => {
      render(<SearchBox suggestions={mockSuggestions} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'a' } })
      fireEvent.focus(input)
      
      // Arrow down to select first suggestion
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      expect(screen.getByText('apple')).toHaveClass('bg-accent')
      
      // Arrow down to select second suggestion
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      expect(screen.getByText('banana')).toHaveClass('bg-accent')
      expect(screen.getByText('apple')).not.toHaveClass('bg-accent')
      
      // Arrow up to go back to first
      fireEvent.keyDown(input, { key: 'ArrowUp' })
      expect(screen.getByText('apple')).toHaveClass('bg-accent')
    })

    it('selects highlighted suggestion on Enter', () => {
      const onSuggestionSelect = jest.fn()
      render(<SearchBox suggestions={mockSuggestions} onSuggestionSelect={onSuggestionSelect} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'a' } })
      fireEvent.focus(input)
      
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'Enter' })
      
      expect(onSuggestionSelect).toHaveBeenCalledWith('apple')
    })

    it('closes suggestions on Escape key', () => {
      render(<SearchBox suggestions={mockSuggestions} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'a' } })
      fireEvent.focus(input)
      
      expect(screen.getByText('apple')).toBeInTheDocument()
      
      fireEvent.keyDown(input, { key: 'Escape' })
      expect(screen.queryByText('apple')).not.toBeInTheDocument()
    })

    it('does not show suggestions when list is empty', () => {
      render(<SearchBox suggestions={[]} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'test' } })
      fireEvent.focus(input)
      
      expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('prevents default behavior for handled keys', () => {
      const onSearch = jest.fn()
      render(<SearchBox onSearch={onSearch} />)
      
      const input = screen.getByRole('textbox')
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      const preventDefault = jest.fn()
      Object.defineProperty(enterEvent, 'preventDefault', { value: preventDefault })
      
      fireEvent(input, enterEvent)
      expect(preventDefault).toHaveBeenCalled()
    })

    it('handles arrow keys without suggestions gracefully', () => {
      render(<SearchBox />)
      
      const input = screen.getByRole('textbox')
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'ArrowUp' })
      
      // Should not throw errors
      expect(input).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      await testAccessibility(<SearchBox />)
    })

    it('supports ARIA attributes', () => {
      render(<SearchBox aria-label="Search products" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'Search products')
    })

    it('suggestions list has proper ARIA structure', () => {
      render(<SearchBox suggestions={['apple', 'banana']} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'a' } })
      fireEvent.focus(input)
      
      const suggestionsList = screen.getByRole('list')
      expect(suggestionsList).toBeInTheDocument()
      
      const suggestions = screen.getAllByRole('listitem')
      expect(suggestions).toHaveLength(2)
    })

    it('clear button is keyboard accessible', () => {
      render(<SearchBox defaultValue="test" />)
      
      const clearButton = screen.getByRole('button')
      expect(clearButton).toHaveAttribute('type', 'button')
      
      clearButton.focus()
      expect(clearButton).toHaveFocus()
    })
  })

  describe('Debounce Behavior', () => {
    it('debounces onChange calls', () => {
      const onChange = jest.fn()
      render(<SearchBox onChange={onChange} debounceMs={500} />)
      
      const input = screen.getByRole('textbox')
      
      fireEvent.change(input, { target: { value: 'a' } })
      fireEvent.change(input, { target: { value: 'ab' } })
      fireEvent.change(input, { target: { value: 'abc' } })
      
      expect(onChange).not.toHaveBeenCalled()
      
      act(() => {
        jest.advanceTimersByTime(500)
      })
      
      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith('abc')
    })

    it('uses custom debounce time', () => {
      const onChange = jest.fn()
      render(<SearchBox onChange={onChange} debounceMs={100} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'test' } })
      
      act(() => {
        jest.advanceTimersByTime(50)
      })
      expect(onChange).not.toHaveBeenCalled()
      
      act(() => {
        jest.advanceTimersByTime(50)
      })
      expect(onChange).toHaveBeenCalledWith('test')
    })

    it('clears previous timeout on new input', () => {
      const onChange = jest.fn()
      render(<SearchBox onChange={onChange} debounceMs={300} />)
      
      const input = screen.getByRole('textbox')
      
      fireEvent.change(input, { target: { value: 'first' } })
      
      act(() => {
        jest.advanceTimersByTime(200)
      })
      
      fireEvent.change(input, { target: { value: 'second' } })
      
      act(() => {
        jest.advanceTimersByTime(300)
      })
      
      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith('second')
    })
  })

  describe('Forwarded Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<SearchBox ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })
  })

  describe('Disabled State', () => {
    it('applies disabled styling and behavior', () => {
      render(<SearchBox disabled />)
      
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })
  })

  describe('Case Sensitivity', () => {
    it('filters suggestions case-insensitively', () => {
      const suggestions = ['Apple', 'BANANA', 'cherry']
      render(<SearchBox suggestions={suggestions} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'ap' } })
      fireEvent.focus(input)
      
      expect(screen.getByText('Apple')).toBeInTheDocument()
      expect(screen.queryByText('BANANA')).not.toBeInTheDocument()
    })
  })
})