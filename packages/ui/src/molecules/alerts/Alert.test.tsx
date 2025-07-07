import React from 'react'
import { render, screen, fireEvent } from '../../test-utils'
import { Alert, AlertTitle, AlertDescription } from './Alert'
import { testAccessibility } from '../../test-utils'

describe('Alert Component', () => {
  describe('Rendering', () => {
    it('renders correctly', () => {
      render(<Alert>Test alert content</Alert>)
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Test alert content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<Alert className="custom-class">Alert</Alert>)
      expect(screen.getByRole('alert')).toHaveClass('custom-class')
    })

    it('renders with custom content', () => {
      render(
        <Alert>
          <div data-testid="custom-content">Custom content</div>
        </Alert>
      )
      expect(screen.getByTestId('custom-content')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    const variants = ['default', 'destructive', 'success', 'warning', 'info'] as const

    variants.forEach((variant) => {
      it(`renders ${variant} variant correctly`, () => {
        render(<Alert variant={variant}>{variant} alert</Alert>)
        const alert = screen.getByRole('alert')
        expect(alert).toBeInTheDocument()
        expect(alert).toHaveTextContent(`${variant} alert`)
      })
    })

    it('uses default variant when no variant specified', () => {
      render(<Alert>Default alert</Alert>)
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  describe('Icons', () => {
    it('renders with custom icon', () => {
      const CustomIcon = () => <svg data-testid="custom-icon" />
      render(<Alert icon={<CustomIcon />}>Alert with custom icon</Alert>)
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    })

    it('renders default destructive icon', () => {
      render(<Alert variant="destructive">Destructive alert</Alert>)
      const alert = screen.getByRole('alert')
      const svg = alert.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders default success icon', () => {
      render(<Alert variant="success">Success alert</Alert>)
      const alert = screen.getByRole('alert')
      const svg = alert.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders default warning icon', () => {
      render(<Alert variant="warning">Warning alert</Alert>)
      const alert = screen.getByRole('alert')
      const svg = alert.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders default info icon', () => {
      render(<Alert variant="info">Info alert</Alert>)
      const alert = screen.getByRole('alert')
      const svg = alert.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('does not render icon for default variant', () => {
      render(<Alert variant="default">Default alert</Alert>)
      const alert = screen.getByRole('alert')
      const svg = alert.querySelector('svg')
      expect(svg).toBeNull()
    })
  })

  describe('Close Functionality', () => {
    it('renders close button when onClose is provided', () => {
      const onClose = jest.fn()
      render(<Alert onClose={onClose}>Closable alert</Alert>)
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })

    it('does not render close button when onClose is not provided', () => {
      render(<Alert>Non-closable alert</Alert>)
      expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', () => {
      const onClose = jest.fn()
      render(<Alert onClose={onClose}>Closable alert</Alert>)
      
      fireEvent.click(screen.getByRole('button', { name: 'Close' }))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('close button has proper accessibility attributes', () => {
      const onClose = jest.fn()
      render(<Alert onClose={onClose}>Closable alert</Alert>)
      
      const closeButton = screen.getByRole('button', { name: 'Close' })
      expect(closeButton).toHaveAttribute('aria-label', 'Close')
      expect(closeButton).toHaveAttribute('type', 'button')
    })
  })

  describe('Composition with AlertTitle and AlertDescription', () => {
    it('renders with AlertTitle', () => {
      render(
        <Alert>
          <AlertTitle>Alert Title</AlertTitle>
          Alert content
        </Alert>
      )
      expect(screen.getByText('Alert Title')).toBeInTheDocument()
      expect(screen.getByText('Alert content')).toBeInTheDocument()
    })

    it('renders with AlertDescription', () => {
      render(
        <Alert>
          <AlertDescription>Alert description</AlertDescription>
        </Alert>
      )
      expect(screen.getByText('Alert description')).toBeInTheDocument()
    })

    it('renders with both AlertTitle and AlertDescription', () => {
      render(
        <Alert>
          <AlertTitle>Alert Title</AlertTitle>
          <AlertDescription>Alert description</AlertDescription>
        </Alert>
      )
      expect(screen.getByText('Alert Title')).toBeInTheDocument()
      expect(screen.getByText('Alert description')).toBeInTheDocument()
    })

    it('AlertTitle renders as h5 element', () => {
      render(
        <Alert>
          <AlertTitle data-testid="alert-title">Title</AlertTitle>
        </Alert>
      )
      const title = screen.getByTestId('alert-title')
      expect(title.tagName).toBe('H5')
    })

    it('AlertDescription renders as div element', () => {
      render(
        <Alert>
          <AlertDescription data-testid="alert-description">Description</AlertDescription>
        </Alert>
      )
      const description = screen.getByTestId('alert-description')
      expect(description.tagName).toBe('DIV')
    })
  })

  describe('AlertTitle Component', () => {
    it('renders correctly standalone', () => {
      render(<AlertTitle>Standalone title</AlertTitle>)
      expect(screen.getByText('Standalone title')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<AlertTitle className="custom-title">Title</AlertTitle>)
      expect(screen.getByText('Title')).toHaveClass('custom-title')
    })

    it('forwards additional props', () => {
      render(<AlertTitle data-testid="title-element">Title</AlertTitle>)
      expect(screen.getByTestId('title-element')).toBeInTheDocument()
    })
  })

  describe('AlertDescription Component', () => {
    it('renders correctly standalone', () => {
      render(<AlertDescription>Standalone description</AlertDescription>)
      expect(screen.getByText('Standalone description')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<AlertDescription className="custom-description">Description</AlertDescription>)
      expect(screen.getByText('Description')).toHaveClass('custom-description')
    })

    it('forwards additional props', () => {
      render(<AlertDescription data-testid="description-element">Description</AlertDescription>)
      expect(screen.getByTestId('description-element')).toBeInTheDocument()
    })

    it('renders with paragraph content', () => {
      render(
        <AlertDescription>
          <p>First paragraph</p>
          <p>Second paragraph</p>
        </AlertDescription>
      )
      expect(screen.getByText('First paragraph')).toBeInTheDocument()
      expect(screen.getByText('Second paragraph')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      await testAccessibility(<Alert>Accessible alert</Alert>)
    })

    it('has proper role attribute', () => {
      render(<Alert>Alert content</Alert>)
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('close button is keyboard accessible', () => {
      const onClose = jest.fn()
      render(<Alert onClose={onClose}>Closable alert</Alert>)
      
      const closeButton = screen.getByRole('button', { name: 'Close' })
      closeButton.focus()
      expect(closeButton).toHaveFocus()
      
      fireEvent.keyDown(closeButton, { key: 'Enter' })
      // Note: We can't test actual Enter key activation without more complex setup
    })

    it('supports screen reader navigation', () => {
      render(
        <Alert>
          <AlertTitle>Important Notice</AlertTitle>
          <AlertDescription>This is a test alert description</AlertDescription>
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent('Important Notice')
      expect(alert).toHaveTextContent('This is a test alert description')
    })
  })

  describe('Forwarded Ref', () => {
    it('forwards ref correctly for Alert', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Alert ref={ref}>Alert with ref</Alert>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('forwards ref correctly for AlertTitle', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      render(<AlertTitle ref={ref}>Title with ref</AlertTitle>)
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement)
    })

    it('forwards ref correctly for AlertDescription', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      render(<AlertDescription ref={ref}>Description with ref</AlertDescription>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('Custom Icon Override', () => {
    it('custom icon overrides default variant icon', () => {
      const CustomIcon = () => <svg data-testid="override-icon" />
      render(
        <Alert variant="success" icon={<CustomIcon />}>
          Success alert with custom icon
        </Alert>
      )
      
      expect(screen.getByTestId('override-icon')).toBeInTheDocument()
      // Should not have the default success icon
      const alert = screen.getByRole('alert')
      const svgs = alert.querySelectorAll('svg')
      expect(svgs).toHaveLength(1) // Only the custom icon
    })
  })
})