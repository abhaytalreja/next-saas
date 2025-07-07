import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Avatar, AvatarImage, AvatarFallback } from './Avatar'

expect.extend(toHaveNoViolations)

describe('Avatar', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Avatar data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toBeInTheDocument()
    })

    it('renders as div element', () => {
      render(<Avatar data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar.tagName).toBe('DIV')
    })

    it('has proper base classes', () => {
      render(<Avatar data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('relative', 'flex', 'shrink-0', 'overflow-hidden', 'rounded-full')
    })
  })

  describe('Sizes', () => {
    it('renders extra small size', () => {
      render(<Avatar size="xs" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('h-6', 'w-6', 'text-xs')
    })

    it('renders small size', () => {
      render(<Avatar size="sm" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('h-8', 'w-8', 'text-sm')
    })

    it('renders default size by default', () => {
      render(<Avatar data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('h-10', 'w-10')
    })

    it('renders large size', () => {
      render(<Avatar size="lg" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('h-12', 'w-12', 'text-lg')
    })

    it('renders extra large size', () => {
      render(<Avatar size="xl" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('h-16', 'w-16', 'text-xl')
    })

    it('renders 2xl size', () => {
      render(<Avatar size="2xl" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('h-20', 'w-20', 'text-2xl')
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<Avatar className="custom-class" data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('custom-class')
    })

    it('applies custom styles', () => {
      render(
        <Avatar 
          style={{ border: '2px solid red' }} 
          data-testid="avatar" 
        />
      )
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveStyle('border: 2px solid red')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Avatar />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('supports custom ARIA attributes', () => {
      render(
        <Avatar 
          aria-label="User avatar" 
          data-testid="avatar" 
        />
      )
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveAttribute('aria-label', 'User avatar')
    })
  })

  describe('Interactive States', () => {
    it('supports onClick handler', () => {
      const handleClick = jest.fn()
      render(<Avatar onClick={handleClick} data-testid="avatar" />)
      
      const avatar = screen.getByTestId('avatar')
      avatar.click()
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('supports onMouseEnter events', () => {
      const handleMouseEnter = jest.fn()
      render(
        <Avatar 
          onMouseEnter={handleMouseEnter}
          data-testid="avatar" 
        />
      )
      
      const avatar = screen.getByTestId('avatar')
      fireEvent.mouseEnter(avatar)
      
      expect(handleMouseEnter).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    it('handles additional HTML attributes', () => {
      render(
        <Avatar 
          title="User Avatar"
          role="img"
          data-testid="avatar" 
        />
      )
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveAttribute('title', 'User Avatar')
      expect(avatar).toHaveAttribute('role', 'img')
    })
  })
})

describe('AvatarImage', () => {
  describe('Rendering', () => {
    it('renders with src prop', () => {
      render(<AvatarImage src="https://example.com/avatar.jpg" alt="User Avatar" />)
      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('src', 'https://example.com/avatar.jpg')
      expect(image).toHaveAttribute('alt', 'User Avatar')
    })

    it('has proper base classes', () => {
      render(<AvatarImage src="test.jpg" data-testid="avatar-image" />)
      const image = screen.getByTestId('avatar-image')
      expect(image).toHaveClass('aspect-square', 'h-full', 'w-full', 'object-cover')
    })

    it('applies custom className', () => {
      render(<AvatarImage src="test.jpg" className="custom-class" data-testid="avatar-image" />)
      const image = screen.getByTestId('avatar-image')
      expect(image).toHaveClass('custom-class')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <AvatarImage src="test.jpg" alt="Profile picture" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('supports alt text for accessibility', () => {
      render(
        <AvatarImage 
          src="test.jpg" 
          alt="Profile picture of John Doe" 
        />
      )
      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('alt', 'Profile picture of John Doe')
    })
  })

  describe('Image Events', () => {
    it('handles onLoad events', () => {
      const handleLoad = jest.fn()
      render(
        <AvatarImage 
          src="test.jpg" 
          onLoad={handleLoad}
          data-testid="avatar-image"
        />
      )
      
      const image = screen.getByTestId('avatar-image')
      fireEvent.load(image)
      
      expect(handleLoad).toHaveBeenCalledTimes(1)
    })

    it('handles onError events', () => {
      const handleError = jest.fn()
      render(
        <AvatarImage 
          src="invalid-url.jpg" 
          onError={handleError}
          data-testid="avatar-image"
        />
      )
      
      const image = screen.getByTestId('avatar-image')
      fireEvent.error(image)
      
      expect(handleError).toHaveBeenCalledTimes(1)
    })
  })
})

describe('AvatarFallback', () => {
  describe('Rendering', () => {
    it('renders with text content', () => {
      render(<AvatarFallback>JD</AvatarFallback>)
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('has proper base classes', () => {
      render(<AvatarFallback data-testid="avatar-fallback">FB</AvatarFallback>)
      const fallback = screen.getByTestId('avatar-fallback')
      expect(fallback).toHaveClass(
        'flex', 'h-full', 'w-full', 'items-center', 'justify-center',
        'bg-neutral-100', 'font-medium', 'text-neutral-700'
      )
    })

    it('applies custom className', () => {
      render(<AvatarFallback className="custom-class" data-testid="avatar-fallback">FB</AvatarFallback>)
      const fallback = screen.getByTestId('avatar-fallback')
      expect(fallback).toHaveClass('custom-class')
    })
  })

  describe('Content Types', () => {
    it('renders text initials', () => {
      render(<AvatarFallback>AB</AvatarFallback>)
      expect(screen.getByText('AB')).toBeInTheDocument()
    })

    it('renders single character', () => {
      render(<AvatarFallback>X</AvatarFallback>)
      expect(screen.getByText('X')).toBeInTheDocument()
    })

    it('renders React elements', () => {
      render(
        <AvatarFallback>
          <strong>Bold</strong>
        </AvatarFallback>
      )
      expect(screen.getByText('Bold')).toBeInTheDocument()
      expect(screen.getByRole('strong')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<AvatarFallback>JD</AvatarFallback>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('supports ARIA attributes', () => {
      render(
        <AvatarFallback 
          aria-label="User initials" 
          data-testid="avatar-fallback"
        >
          JD
        </AvatarFallback>
      )
      const fallback = screen.getByTestId('avatar-fallback')
      expect(fallback).toHaveAttribute('aria-label', 'User initials')
    })
  })
})

describe('Avatar Composition', () => {
  it('renders Avatar with AvatarImage', () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarImage src="test.jpg" alt="Profile" />
      </Avatar>
    )
    
    const avatar = screen.getByTestId('avatar')
    const image = screen.getByRole('img')
    
    expect(avatar).toBeInTheDocument()
    expect(image).toBeInTheDocument()
    expect(avatar).toContainElement(image)
  })

  it('renders Avatar with AvatarFallback', () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    )
    
    const avatar = screen.getByTestId('avatar')
    const fallback = screen.getByText('JD')
    
    expect(avatar).toBeInTheDocument()
    expect(fallback).toBeInTheDocument()
    expect(avatar).toContainElement(fallback)
  })

  it('renders Avatar with both Image and Fallback', () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarImage src="test.jpg" alt="Profile" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    )
    
    const avatar = screen.getByTestId('avatar')
    const image = screen.getByRole('img')
    const fallback = screen.getByText('JD')
    
    expect(avatar).toBeInTheDocument()
    expect(image).toBeInTheDocument()
    expect(fallback).toBeInTheDocument()
  })
})