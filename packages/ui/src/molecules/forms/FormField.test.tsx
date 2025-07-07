import React from 'react'
import { render, screen } from '../../test-utils'
import { FormField, FormSection } from './FormField'
import { testAccessibility } from '../../test-utils'

// Mock input component for testing
const MockInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => <input ref={ref} {...props} />
)
MockInput.displayName = 'MockInput'

describe('FormField Component', () => {
  describe('Rendering', () => {
    it('renders correctly with child input', () => {
      render(
        <FormField>
          <MockInput id="test-input" placeholder="Test input" />
        </FormField>
      )
      expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <FormField className="custom-field" data-testid="form-field">
          <MockInput id="test-input" />
        </FormField>
      )
      const formField = screen.getByTestId('form-field')
      expect(formField).toHaveClass('custom-field')
    })

    it('renders without label when not provided', () => {
      render(
        <FormField>
          <MockInput id="test-input" />
        </FormField>
      )
      expect(screen.queryByRole('label')).not.toBeInTheDocument()
    })
  })

  describe('Label Functionality', () => {
    it('renders label when provided', () => {
      render(
        <FormField label="Test Label">
          <MockInput id="test-input" />
        </FormField>
      )
      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('associates label with input using htmlFor', () => {
      render(
        <FormField label="Test Label">
          <MockInput id="test-input" />
        </FormField>
      )
      const label = screen.getByText('Test Label')
      expect(label).toHaveAttribute('for', 'test-input')
    })

    it('shows required indicator when required is true', () => {
      render(
        <FormField label="Required Field" required>
          <MockInput id="test-input" />
        </FormField>
      )
      const label = screen.getByText('Required Field')
      expect(label).toHaveClass("after:content-['*']")
    })

    it('applies disabled styles to label when disabled', () => {
      render(
        <FormField label="Disabled Field" disabled>
          <MockInput id="test-input" />
        </FormField>
      )
      const label = screen.getByText('Disabled Field')
      expect(label).toHaveClass('opacity-70', 'cursor-not-allowed')
    })

    it('generates label id from child input id', () => {
      render(
        <FormField label="Test Label">
          <MockInput id="test-input" />
        </FormField>
      )
      const label = screen.getByText('Test Label')
      expect(label).toHaveAttribute('id', 'test-input-label')
    })
  })

  describe('Description Functionality', () => {
    it('renders description when provided', () => {
      render(
        <FormField description="This is a helpful description">
          <MockInput id="test-input" />
        </FormField>
      )
      expect(screen.getByText('This is a helpful description')).toBeInTheDocument()
    })

    it('applies disabled styles to description when disabled', () => {
      render(
        <FormField description="Disabled description" disabled>
          <MockInput id="test-input" />
        </FormField>
      )
      const description = screen.getByText('Disabled description')
      expect(description).toHaveClass('opacity-70')
    })

    it('generates description id from child input id', () => {
      render(
        <FormField description="Test description">
          <MockInput id="test-input" />
        </FormField>
      )
      const description = screen.getByText('Test description')
      expect(description).toHaveAttribute('id', 'test-input-description')
    })
  })

  describe('Error Functionality', () => {
    it('renders error message when provided', () => {
      render(
        <FormField error="This field is required">
          <MockInput id="test-input" />
        </FormField>
      )
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('error message has role="alert"', () => {
      render(
        <FormField error="Error message">
          <MockInput id="test-input" />
        </FormField>
      )
      const errorElement = screen.getByRole('alert')
      expect(errorElement).toHaveTextContent('Error message')
    })

    it('generates error id from child input id', () => {
      render(
        <FormField error="Error message">
          <MockInput id="test-input" />
        </FormField>
      )
      const error = screen.getByRole('alert')
      expect(error).toHaveAttribute('id', 'test-input-error')
    })

    it('applies destructive text styling to error', () => {
      render(
        <FormField error="Error message">
          <MockInput id="test-input" />
        </FormField>
      )
      const error = screen.getByRole('alert')
      expect(error).toHaveClass('text-destructive')
    })
  })

  describe('Child Enhancement', () => {
    it('enhances child with aria-labelledby when label exists', () => {
      render(
        <FormField label="Test Label">
          <MockInput id="test-input" />
        </FormField>
      )
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-labelledby', 'test-input-label')
    })

    it('enhances child with aria-describedby when description exists', () => {
      render(
        <FormField description="Test description">
          <MockInput id="test-input" />
        </FormField>
      )
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'test-input-description')
    })

    it('enhances child with aria-describedby when error exists', () => {
      render(
        <FormField error="Error message">
          <MockInput id="test-input" />
        </FormField>
      )
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'test-input-error')
    })

    it('combines multiple aria-describedby values', () => {
      render(
        <FormField description="Description" error="Error">
          <MockInput id="test-input" />
        </FormField>
      )
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'test-input-description test-input-error')
    })

    it('sets aria-invalid to true when error exists', () => {
      render(
        <FormField error="Error message">
          <MockInput id="test-input" />
        </FormField>
      )
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('passes disabled prop to child', () => {
      render(
        <FormField disabled>
          <MockInput id="test-input" />
        </FormField>
      )
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    it('preserves existing child props', () => {
      render(
        <FormField>
          <MockInput id="test-input" placeholder="Original placeholder" disabled />
        </FormField>
      )
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('placeholder', 'Original placeholder')
      expect(input).toBeDisabled()
    })
  })

  describe('ID Generation', () => {
    it('uses child id for generating related ids', () => {
      render(
        <FormField label="Label" description="Description" error="Error">
          <MockInput id="custom-id" />
        </FormField>
      )
      
      expect(screen.getByText('Label')).toHaveAttribute('id', 'custom-id-label')
      expect(screen.getByText('Description')).toHaveAttribute('id', 'custom-id-description')
      expect(screen.getByRole('alert')).toHaveAttribute('id', 'custom-id-error')
    })

    it('falls back to child name attribute if no id', () => {
      render(
        <FormField label="Label">
          <MockInput name="field-name" />
        </FormField>
      )
      
      expect(screen.getByText('Label')).toHaveAttribute('id', 'field-name-label')
    })

    it('handles missing id and name gracefully', () => {
      render(
        <FormField label="Label">
          <MockInput />
        </FormField>
      )
      
      const label = screen.getByText('Label')
      expect(label).not.toHaveAttribute('id')
      expect(label).not.toHaveAttribute('htmlFor')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      await testAccessibility(
        <FormField label="Test Label" description="Description">
          <MockInput id="test-input" />
        </FormField>
      )
    })

    it('properly associates all elements', () => {
      render(
        <FormField label="Email" description="Enter your email" error="Invalid email">
          <MockInput id="email" type="email" />
        </FormField>
      )
      
      const input = screen.getByRole('textbox')
      const label = screen.getByText('Email')
      const description = screen.getByText('Enter your email')
      const error = screen.getByRole('alert')
      
      expect(label).toHaveAttribute('for', 'email')
      expect(input).toHaveAttribute('aria-labelledby', 'email-label')
      expect(input).toHaveAttribute('aria-describedby', 'email-description email-error')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(description).toHaveAttribute('id', 'email-description')
      expect(error).toHaveAttribute('id', 'email-error')
    })
  })

  describe('Forwarded Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(
        <FormField ref={ref}>
          <MockInput id="test-input" />
        </FormField>
      )
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })
})

describe('FormSection Component', () => {
  describe('Rendering', () => {
    it('renders correctly with children', () => {
      render(
        <FormSection>
          <div>Form content</div>
        </FormSection>
      )
      expect(screen.getByText('Form content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <FormSection className="custom-section">
          <div>Content</div>
        </FormSection>
      )
      expect(screen.getByText('Content').closest('.custom-section')).toBeInTheDocument()
    })

    it('renders without title and description when not provided', () => {
      render(
        <FormSection>
          <div>Content</div>
        </FormSection>
      )
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })
  })

  describe('Title and Description', () => {
    it('renders title when provided', () => {
      render(
        <FormSection title="Section Title">
          <div>Content</div>
        </FormSection>
      )
      expect(screen.getByText('Section Title')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    })

    it('renders description when provided', () => {
      render(
        <FormSection description="Section description">
          <div>Content</div>
        </FormSection>
      )
      expect(screen.getByText('Section description')).toBeInTheDocument()
    })

    it('renders both title and description', () => {
      render(
        <FormSection title="Title" description="Description">
          <div>Content</div>
        </FormSection>
      )
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('applies correct styling to title', () => {
      render(
        <FormSection title="Section Title">
          <div>Content</div>
        </FormSection>
      )
      const title = screen.getByText('Section Title')
      expect(title).toHaveClass('text-lg', 'font-medium', 'leading-6', 'text-foreground')
    })

    it('applies correct styling to description', () => {
      render(
        <FormSection description="Section description">
          <div>Content</div>
        </FormSection>
      )
      const description = screen.getByText('Section description')
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    })
  })

  describe('Content Layout', () => {
    it('properly spaces multiple children', () => {
      render(
        <FormSection>
          <div>First item</div>
          <div>Second item</div>
          <div>Third item</div>
        </FormSection>
      )
      
      expect(screen.getByText('First item')).toBeInTheDocument()
      expect(screen.getByText('Second item')).toBeInTheDocument()
      expect(screen.getByText('Third item')).toBeInTheDocument()
    })

    it('renders complex children correctly', () => {
      render(
        <FormSection title="User Information">
          <FormField label="Name">
            <MockInput id="name" />
          </FormField>
          <FormField label="Email">
            <MockInput id="email" />
          </FormField>
        </FormSection>
      )
      
      expect(screen.getByText('User Information')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      await testAccessibility(
        <FormSection title="Test Section" description="Test description">
          <div>Content</div>
        </FormSection>
      )
    })

    it('uses proper heading level', () => {
      render(
        <FormSection title="Section Title">
          <div>Content</div>
        </FormSection>
      )
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    })
  })

  describe('Forwarded Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(
        <FormSection ref={ref}>
          <div>Content</div>
        </FormSection>
      )
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })
})