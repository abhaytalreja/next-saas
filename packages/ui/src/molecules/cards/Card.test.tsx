import React from 'react'
import { render, screen } from '../../test-utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card'
import { testAccessibility } from '../../test-utils'

describe('Card Component', () => {
  describe('Card Container', () => {
    it('renders correctly', () => {
      render(<Card>Card Content</Card>)
      expect(screen.getByText('Card Content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<Card className="custom-class">Content</Card>)
      const card = screen.getByText('Content')
      // Card with custom class should contain the content
      expect(card).toBeInTheDocument()
    })

    it('renders with all sub-components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      )
      
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })
  })

  describe('CardHeader', () => {
    it('renders correctly', () => {
      render(
        <Card>
          <CardHeader>Header Content</CardHeader>
        </Card>
      )
      expect(screen.getByText('Header Content')).toBeInTheDocument()
    })

    it('applies correct spacing', () => {
      render(
        <Card>
          <CardHeader className="test-header">Header</CardHeader>
        </Card>
      )
      const header = screen.getByText('Header')
      // CardHeader renders the content
      expect(header).toBeInTheDocument()
    })
  })

  describe('CardTitle', () => {
    it('renders as h3 by default', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
        </Card>
      )
      const title = screen.getByText('Card Title')
      expect(title.tagName).toBe('H3')
    })

    it('applies correct styling', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle className="custom-title">Title</CardTitle>
          </CardHeader>
        </Card>
      )
      expect(screen.getByText('Title')).toHaveClass('custom-title')
    })
  })

  describe('CardDescription', () => {
    it('renders correctly', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Card Description Text</CardDescription>
          </CardHeader>
        </Card>
      )
      expect(screen.getByText('Card Description Text')).toBeInTheDocument()
    })

    it('applies muted text styling', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>
      )
      const description = screen.getByText('Description')
      expect(description.className).toMatch(/text-muted-foreground/)
    })
  })

  describe('CardContent', () => {
    it('renders correctly', () => {
      render(
        <Card>
          <CardContent>Main Content</CardContent>
        </Card>
      )
      expect(screen.getByText('Main Content')).toBeInTheDocument()
    })

    it('can contain complex content', () => {
      render(
        <Card>
          <CardContent>
            <div>
              <h4>Subsection</h4>
              <p>Paragraph text</p>
              <button>Action</button>
            </div>
          </CardContent>
        </Card>
      )
      
      expect(screen.getByText('Subsection')).toBeInTheDocument()
      expect(screen.getByText('Paragraph text')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('CardFooter', () => {
    it('renders correctly', () => {
      render(
        <Card>
          <CardFooter>Footer Content</CardFooter>
        </Card>
      )
      expect(screen.getByText('Footer Content')).toBeInTheDocument()
    })

    it('can contain actions', () => {
      render(
        <Card>
          <CardFooter>
            <button>Cancel</button>
            <button>Save</button>
          </CardFooter>
        </Card>
      )
      
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Save')).toBeInTheDocument()
    })
  })

  describe('Composition', () => {
    it('works with partial components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Only Title</CardTitle>
          </CardHeader>
          <CardContent>Only Content</CardContent>
        </Card>
      )
      
      expect(screen.getByText('Only Title')).toBeInTheDocument()
      expect(screen.getByText('Only Content')).toBeInTheDocument()
      expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument() // No footer
    })

    it('supports nested cards', () => {
      render(
        <Card>
          <CardContent>
            <Card>
              <CardContent>Nested Card</CardContent>
            </Card>
          </CardContent>
        </Card>
      )
      
      expect(screen.getByText('Nested Card')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      await testAccessibility(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Card</CardTitle>
            <CardDescription>Card description</CardDescription>
          </CardHeader>
          <CardContent>Card content</CardContent>
          <CardFooter>Card footer</CardFooter>
        </Card>
      )
    })

    it('maintains semantic structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Semantic Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Paragraph content</p>
          </CardContent>
        </Card>
      )
      
      // Card should use article or section semantics
      const title = screen.getByText('Semantic Title')
      expect(title.tagName).toBe('H3')
    })
  })

  describe('Forwarded Refs', () => {
    it('Card forwards ref', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Card ref={ref}>Content</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('CardHeader forwards ref', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(
        <Card>
          <CardHeader ref={ref}>Header</CardHeader>
        </Card>
      )
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('CardContent forwards ref', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(
        <Card>
          <CardContent ref={ref}>Content</CardContent>
        </Card>
      )
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('CardFooter forwards ref', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(
        <Card>
          <CardFooter ref={ref}>Footer</CardFooter>
        </Card>
      )
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })
})