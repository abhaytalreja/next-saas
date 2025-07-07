import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Switch } from './Switch'

expect.extend(toHaveNoViolations)

describe('Switch', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Switch data-testid="switch" />)
      const switchElement = screen.getByTestId('switch')
      expect(switchElement).toBeInTheDocument()
    })

    it('renders as checkbox input', () => {
      render(<Switch />)
      const input = screen.getByRole('checkbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'checkbox')
    })

    it('has proper structure with label and span elements', () => {
      render(<Switch data-testid="switch" />)
      const container = screen.getByTestId('switch').parentElement
      expect(container?.tagName).toBe('LABEL')
      
      const spans = container?.querySelectorAll('span')
      expect(spans).toHaveLength(2) // Switch track and thumb
    })
  })

  describe('Sizes', () => {
    it('renders small size', () => {
      render(<Switch size="sm" data-testid="switch" />)
      const switchTrack = screen.getByTestId('switch').parentElement?.querySelector('span')
      expect(switchTrack).toHaveClass('h-5', 'w-9')
    })

    it('renders default size by default', () => {
      render(<Switch data-testid="switch" />)
      const switchTrack = screen.getByTestId('switch').parentElement?.querySelector('span')
      expect(switchTrack).toHaveClass('h-6', 'w-11')
    })

    it('renders large size', () => {
      render(<Switch size="lg" data-testid="switch" />)
      const switchTrack = screen.getByTestId('switch').parentElement?.querySelector('span')
      expect(switchTrack).toHaveClass('h-7', 'w-14')
    })
  })

  describe('Colors', () => {
    it('renders with default color', () => {
      render(<Switch data-testid="switch" />)
      const switchTrack = screen.getByTestId('switch').parentElement?.querySelector('span')
      expect(switchTrack).toHaveClass('data-[state=checked]:bg-primary-600')
    })

    it('renders with success color', () => {
      render(<Switch color="success" data-testid="switch" />)
      const switchTrack = screen.getByTestId('switch').parentElement?.querySelector('span')
      expect(switchTrack).toHaveClass('data-[state=checked]:bg-success-600')
    })

    it('renders with error color', () => {
      render(<Switch color="error" data-testid="switch" />)
      const switchTrack = screen.getByTestId('switch').parentElement?.querySelector('span')
      expect(switchTrack).toHaveClass('data-[state=checked]:bg-error-600')
    })
  })

  describe('States', () => {
    it('renders unchecked by default', () => {
      render(<Switch />)
      const input = screen.getByRole('checkbox')
      expect(input).not.toBeChecked()
    })

    it('renders checked when defaultChecked is true', () => {
      render(<Switch defaultChecked />)
      const input = screen.getByRole('checkbox')
      expect(input).toBeChecked()
    })

    it('renders checked when checked prop is true', () => {
      render(<Switch checked />)
      const input = screen.getByRole('checkbox')
      expect(input).toBeChecked()
    })

    it('renders disabled state', () => {
      render(<Switch disabled />)
      const input = screen.getByRole('checkbox')
      expect(input).toBeDisabled()
    })

    it('applies disabled styling', () => {
      render(<Switch disabled data-testid="switch" />)
      const switchTrack = screen.getByTestId('switch').parentElement?.querySelector('span')
      expect(switchTrack).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })
  })

  describe('Data States', () => {
    it('has correct data-state when unchecked', () => {
      render(<Switch data-testid="switch" />)
      const container = screen.getByTestId('switch').parentElement
      const track = container?.querySelector('span')
      const thumb = track?.querySelector('span')
      
      expect(track).toHaveAttribute('data-state', 'unchecked')
      expect(thumb).toHaveAttribute('data-state', 'unchecked')
    })

    it('has correct data-state when checked', () => {
      render(<Switch checked data-testid="switch" />)
      const container = screen.getByTestId('switch').parentElement
      const track = container?.querySelector('span')
      const thumb = track?.querySelector('span')
      
      expect(track).toHaveAttribute('data-state', 'checked')
      expect(thumb).toHaveAttribute('data-state', 'checked')
    })
  })

  describe('Interaction', () => {
    it('toggles when clicked', async () => {
      const user = userEvent.setup()
      render(<Switch />)
      const input = screen.getByRole('checkbox')
      
      expect(input).not.toBeChecked()
      
      await user.click(input)
      expect(input).toBeChecked()
      
      await user.click(input)
      expect(input).not.toBeChecked()
    })

    it('calls onCheckedChange when toggled', async () => {
      const handleCheckedChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Switch onCheckedChange={handleCheckedChange} />)
      const input = screen.getByRole('checkbox')
      
      await user.click(input)
      expect(handleCheckedChange).toHaveBeenCalledWith(true)
      
      await user.click(input)
      expect(handleCheckedChange).toHaveBeenCalledWith(false)
    })

    it('calls onChange when toggled', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Switch onChange={handleChange} />)
      const input = screen.getByRole('checkbox')
      
      await user.click(input)
      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('does not toggle when disabled', async () => {
      const handleCheckedChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Switch disabled onCheckedChange={handleCheckedChange} />)
      const input = screen.getByRole('checkbox')
      
      await user.click(input)
      expect(handleCheckedChange).not.toHaveBeenCalled()
      expect(input).not.toBeChecked()
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('works as uncontrolled component', async () => {
      const user = userEvent.setup()
      render(<Switch defaultChecked={false} />)
      const input = screen.getByRole('checkbox')
      
      expect(input).not.toBeChecked()
      
      await user.click(input)
      expect(input).toBeChecked()
    })

    it('works as controlled component', async () => {
      const handleCheckedChange = jest.fn()
      const user = userEvent.setup()
      
      const ControlledSwitch = () => {
        const [checked, setChecked] = React.useState(false)
        return (
          <Switch 
            checked={checked} 
            onCheckedChange={(newChecked) => {
              setChecked(newChecked)
              handleCheckedChange(newChecked)
            }} 
          />
        )
      }
      
      render(<ControlledSwitch />)
      const input = screen.getByRole('checkbox')
      
      expect(input).not.toBeChecked()
      
      await user.click(input)
      expect(input).toBeChecked()
      expect(handleCheckedChange).toHaveBeenCalledWith(true)
    })

    it('controlled checked prop overrides internal state', () => {
      render(<Switch checked={true} defaultChecked={false} />)
      const input = screen.getByRole('checkbox')
      expect(input).toBeChecked()
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports keyboard interaction', async () => {
      const user = userEvent.setup()
      render(<Switch />)
      const input = screen.getByRole('checkbox')
      
      input.focus()
      expect(input).toHaveFocus()
      
      await user.keyboard(' ')
      expect(input).toBeChecked()
      
      await user.keyboard(' ')
      expect(input).not.toBeChecked()
    })

  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Switch aria-label="Toggle setting" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper focus styles', () => {
      render(<Switch data-testid="switch" />)
      const switchTrack = screen.getByTestId('switch').parentElement?.querySelector('span')
      expect(switchTrack).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2')
    })

    it('supports aria-label', () => {
      render(<Switch aria-label="Toggle notifications" />)
      const input = screen.getByRole('checkbox')
      expect(input).toHaveAttribute('aria-label', 'Toggle notifications')
    })

    it('supports aria-labelledby', () => {
      render(
        <div>
          <span id="switch-label">Enable feature</span>
          <Switch aria-labelledby="switch-label" />
        </div>
      )
      const input = screen.getByRole('checkbox')
      expect(input).toHaveAttribute('aria-labelledby', 'switch-label')
    })

    it('supports aria-describedby', () => {
      render(
        <div>
          <Switch aria-describedby="switch-description" />
          <span id="switch-description">This will enable the feature</span>
        </div>
      )
      const input = screen.getByRole('checkbox')
      expect(input).toHaveAttribute('aria-describedby', 'switch-description')
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className to switch track', () => {
      render(<Switch className="custom-class" data-testid="switch" />)
      const switchTrack = screen.getByTestId('switch').parentElement?.querySelector('span')
      expect(switchTrack).toHaveClass('custom-class')
    })

    it('applies custom styles', () => {
      render(<Switch style={{ margin: '10px' }} data-testid="switch" />)
      const input = screen.getByTestId('switch')
      expect(input).toHaveStyle('margin: 10px')
    })
  })

  describe('Form Integration', () => {
    it('works with forms', () => {
      render(
        <form>
          <Switch name="notifications" value="enabled" />
        </form>
      )
      const input = screen.getByRole('checkbox')
      expect(input).toHaveAttribute('name', 'notifications')
      expect(input).toHaveAttribute('value', 'enabled')
    })

    it('supports required attribute', () => {
      render(<Switch required />)
      const input = screen.getByRole('checkbox')
      expect(input).toBeRequired()
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid toggling', async () => {
      const handleCheckedChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Switch onCheckedChange={handleCheckedChange} />)
      const input = screen.getByRole('checkbox')
      
      // Rapid clicks
      await user.click(input)
      await user.click(input)
      await user.click(input)
      
      expect(handleCheckedChange).toHaveBeenCalledTimes(3)
      expect(input).toBeChecked() // Should be checked after odd number of clicks
    })

    it('handles undefined onCheckedChange gracefully', async () => {
      const user = userEvent.setup()
      render(<Switch />)
      const input = screen.getByRole('checkbox')
      
      // Should not throw error
      await user.click(input)
      expect(input).toBeChecked()
    })
  })

  describe('Visual States', () => {
    it('thumb translates correctly for different sizes', () => {
      const { rerender } = render(<Switch size="sm" checked data-testid="switch" />)
      let thumb = screen.getByTestId('switch').parentElement?.querySelector('span span')
      expect(thumb).toHaveClass('data-[state=checked]:translate-x-4')
      
      rerender(<Switch size="default" checked data-testid="switch" />)
      thumb = screen.getByTestId('switch').parentElement?.querySelector('span span')
      expect(thumb).toHaveClass('data-[state=checked]:translate-x-5')
      
      rerender(<Switch size="lg" checked data-testid="switch" />)
      thumb = screen.getByTestId('switch').parentElement?.querySelector('span span')
      expect(thumb).toHaveClass('data-[state=checked]:translate-x-7')
    })
  })
})