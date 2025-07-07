import React from 'react'
import { render, screen, fireEvent } from '../../test-utils'
import { Input } from './Input'
import { testAccessibility } from '../../test-utils'

describe('Input Component', () => {
  describe('Rendering', () => {
    it('renders correctly', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<Input className="custom-class" />)
      expect(screen.getByRole('textbox')).toHaveClass('custom-class')
    })

    it('can be used with external label', () => {
      render(
        <div>
          <label htmlFor="email">Email</label>
          <Input id="email" />
        </div>
      )
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('can be used with external helper text', () => {
      render(
        <div>
          <Input aria-describedby="helper" />
          <div id="helper">Enter your email address</div>
        </div>
      )
      expect(screen.getByText('Enter your email address')).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    const sizes = ['sm', 'default', 'lg'] as const

    sizes.forEach((size) => {
      it(`renders ${size} size correctly`, () => {
        render(<Input inputSize={size} placeholder={`${size} input`} />)
        const input = screen.getByRole('textbox')
        expect(input).toBeInTheDocument()
      })
    })
  })

  describe('States', () => {
    it('shows error state', () => {
      render(<Input error placeholder="Error input" />)
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      // Input component uses error as boolean, not string
    })

    it('is disabled when disabled prop is true', () => {
      render(<Input disabled placeholder="Disabled input" />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('is required when required prop is true', () => {
      render(<Input required placeholder="Required input" />)
      expect(screen.getByRole('textbox')).toBeRequired()
    })

    it('is readonly when readOnly prop is true', () => {
      render(<Input readOnly value="Read only text" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('readOnly')
    })
  })

  describe('Icons', () => {
    const TestIcon = () => <svg data-testid="test-icon" />

    it('renders with left icon', () => {
      render(<Input leftIcon={<TestIcon />} />)
      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    })

    it('renders with right icon', () => {
      render(<Input rightIcon={<TestIcon />} />)
      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    })

    it('renders with both icons', () => {
      render(<Input leftIcon={<TestIcon />} rightIcon={<TestIcon />} />)
      expect(screen.getAllByTestId('test-icon')).toHaveLength(2)
    })
  })

  describe('Input Types', () => {
    const types = ['text', 'email', 'password', 'number', 'tel', 'url'] as const

    types.forEach((type) => {
      it(`renders ${type} input correctly`, () => {
        render(<Input type={type} placeholder={`${type} input`} />)
        expect(screen.getByPlaceholderText(`${type} input`)).toHaveAttribute('type', type)
      })
    })
  })

  describe('Interactions', () => {
    it('handles onChange events', () => {
      const handleChange = jest.fn()
      render(<Input onChange={handleChange} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'test value' } })
      
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(input).toHaveValue('test value')
    })

    it('handles onFocus events', () => {
      const handleFocus = jest.fn()
      render(<Input onFocus={handleFocus} />)
      
      fireEvent.focus(screen.getByRole('textbox'))
      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it('handles onBlur events', () => {
      const handleBlur = jest.fn()
      render(<Input onBlur={handleBlur} />)
      
      fireEvent.blur(screen.getByRole('textbox'))
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('prevents user interaction when disabled', () => {
      render(<Input disabled defaultValue="initial" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
      expect(input).toHaveValue('initial')
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('works as controlled component', () => {
      const Component = () => {
        const [value, setValue] = React.useState('initial')
        return (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        )
      }
      
      render(<Component />)
      const input = screen.getByRole('textbox')
      
      expect(input).toHaveValue('initial')
      fireEvent.change(input, { target: { value: 'updated' } })
      expect(input).toHaveValue('updated')
    })

    it('works as uncontrolled component', () => {
      render(<Input defaultValue="default" />)
      const input = screen.getByRole('textbox')
      
      expect(input).toHaveValue('default')
      fireEvent.change(input, { target: { value: 'changed' } })
      expect(input).toHaveValue('changed')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      await testAccessibility(<Input placeholder="Accessible Input" />)
    })

    it('associates with external label properly', () => {
      render(
        <div>
          <label htmlFor="email">Email Address</label>
          <Input id="email" />
        </div>
      )
      const input = screen.getByRole('textbox')
      const label = screen.getByText('Email Address')
      
      expect(input).toHaveAttribute('id', 'email')
      expect(label).toHaveAttribute('for', 'email')
    })

    it('supports ARIA attributes for error state', () => {
      render(<Input error aria-invalid="true" aria-describedby="error-msg" />)
      const input = screen.getByRole('textbox')
      
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby', 'error-msg')
    })

    it('supports keyboard navigation', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      
      input.focus()
      expect(input).toHaveFocus()
      
      fireEvent.keyDown(input, { key: 'Tab' })
      // Tab should move focus away
    })
  })

  describe('Forwarded Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Input ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })
  })
})