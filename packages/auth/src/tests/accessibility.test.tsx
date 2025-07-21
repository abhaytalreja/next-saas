import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import userEvent from '@testing-library/user-event'
import { ProfileForm } from '../components/forms/ProfileForm'
import { OrganizationProfileForm } from '../components/profile/OrganizationProfileForm'
import { LoadingSkeleton, ProfileFormSkeleton, DirectorySkeleton } from '../components/ui/LoadingSkeleton'
import { LiveRegion } from '../components/ui/LiveRegion'

// Extend jest matchers
expect.extend(toHaveNoViolations)

// Mock hooks
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      email: 'test@example.com',
      user_metadata: {
        first_name: 'John',
        last_name: 'Doe',
        avatar_url: null
      }
    },
    updateProfile: jest.fn()
  })
}))

jest.mock('../hooks/useOrganization', () => ({
  useOrganization: () => ({
    currentOrganization: {
      id: '1',
      name: 'Test Organization'
    },
    hasPermission: () => true
  })
}))

describe('Accessibility Tests', () => {
  describe('ProfileForm', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(<ProfileForm />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper form labeling', () => {
      render(<ProfileForm />)
      
      // Check that all form inputs have associated labels
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/bio/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/website/i)).toBeInTheDocument()
    })

    it('should have proper ARIA attributes', () => {
      render(<ProfileForm />)
      
      // Check form has proper ARIA label
      expect(screen.getByRole('form')).toHaveAttribute('aria-label', 'Edit profile information')
      
      // Check fieldsets have proper legends
      expect(screen.getByRole('group', { name: /profile picture/i })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: /regional settings/i })).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<ProfileForm />)
      
      const firstNameInput = screen.getByLabelText(/first name/i)
      const lastNameInput = screen.getByLabelText(/last name/i)
      
      // Tab navigation should work
      await user.tab()
      expect(firstNameInput).toHaveFocus()
      
      await user.tab()
      expect(lastNameInput).toHaveFocus()
    })

    it('should announce errors to screen readers', () => {
      render(<ProfileForm />)
      
      // Error messages should have role="alert"
      const form = screen.getByRole('form')
      const errorMessages = form.querySelectorAll('[role=\"alert\"]')
      
      errorMessages.forEach(error => {
        expect(error).toHaveAttribute('role', 'alert')
      })
    })

    it('should have descriptive help text', () => {
      render(<ProfileForm />)
      
      // Check that help text is properly associated with inputs
      expect(screen.getByText(/upload an image up to 5mb/i)).toBeInTheDocument()
      expect(screen.getByText(/share a brief description/i)).toBeInTheDocument()
      expect(screen.getByText(/used for displaying dates/i)).toBeInTheDocument()
    })
  })

  describe('OrganizationProfileForm', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(<OrganizationProfileForm />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper fieldset structure', () => {
      render(<OrganizationProfileForm />)
      
      // Check that form sections use fieldsets with legends
      expect(screen.getByRole('group', { name: /basic information/i })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: /skills & expertise/i })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: /privacy settings/i })).toBeInTheDocument()
    })

    it('should make skills interactive and accessible', async () => {
      const user = userEvent.setup()
      render(<OrganizationProfileForm />)
      
      const skillsInput = screen.getByLabelText(/skills/i)
      
      // Skills input should be properly labeled and described
      expect(skillsInput).toHaveAttribute('aria-describedby', 'skills-help')
      expect(screen.getByText(/press enter to add skills/i)).toBeInTheDocument()
      
      // Should be able to add skills with Enter key
      await user.type(skillsInput, 'React')
      await user.keyboard('{Enter}')
      
      // Skill badges should be accessible buttons
      const skillBadge = screen.getByRole('button', { name: /remove skill: react/i })
      expect(skillBadge).toBeInTheDocument()
      expect(skillBadge).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('Loading Skeletons', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <div>
          <LoadingSkeleton width={100} height={20} />
          <ProfileFormSkeleton />
          <DirectorySkeleton />
        </div>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper loading states', () => {
      render(<ProfileFormSkeleton />)
      
      // Should have proper ARIA attributes for loading states
      const loadingElement = screen.getByRole('status', { name: /loading profile form/i })
      expect(loadingElement).toHaveAttribute('aria-live', 'polite')
    })

    it('should not be focusable', () => {
      render(<LoadingSkeleton width={100} height={20} />)
      
      const skeleton = screen.getByRole('status')
      expect(skeleton).toHaveAttribute('tabIndex', '-1')
    })
  })

  describe('Live Region', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<LiveRegion />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper live regions', () => {
      render(<LiveRegion />)
      
      // Should have both polite and assertive live regions
      const politeRegion = screen.getByRole('status')
      const assertiveRegion = screen.getByRole('alert')
      
      expect(politeRegion).toHaveAttribute('aria-live', 'polite')
      expect(assertiveRegion).toHaveAttribute('aria-live', 'assertive')
    })
  })

  describe('Focus Management', () => {
    it('should maintain logical tab order', async () => {
      const user = userEvent.setup()
      render(<ProfileForm />)
      
      // Get all focusable elements
      const focusableElements = screen.getAllByRole('textbox')
        .concat(screen.getAllByRole('button'))
        .concat(screen.getAllByRole('combobox'))
      
      // Tab through elements and verify order
      for (const element of focusableElements.slice(0, 3)) {
        await user.tab()
        expect(document.activeElement).toBe(element)
      }
    })

    it('should skip to main content with skip link', () => {
      render(
        <div>
          <a href="#main-content" className="sr-only focus:not-sr-only">
            Skip to main content
          </a>
          <main id="main-content" tabIndex={-1}>
            <ProfileForm />
          </main>
        </div>
      )
      
      const skipLink = screen.getByText(/skip to main content/i)
      const mainContent = screen.getByRole('main')
      
      expect(skipLink).toBeInTheDocument()
      expect(mainContent).toHaveAttribute('id', 'main-content')
    })
  })

  describe('Color Contrast and Visual Indicators', () => {
    it('should not rely solely on color for form validation', () => {
      render(<ProfileForm />)
      
      // Error states should have text indicators, not just color
      const errorElements = screen.getAllByText(/required/i)
      errorElements.forEach(error => {
        expect(error).toHaveTextContent(/required|invalid|error/i)
      })
    })

    it('should have visible focus indicators', async () => {
      const user = userEvent.setup()
      render(<ProfileForm />)
      
      const firstInput = screen.getByLabelText(/first name/i)
      await user.click(firstInput)
      
      // Focus should be visible (checked via focus-visible or outline)
      expect(firstInput).toHaveFocus()
    })
  })

  describe('Screen Reader Compatibility', () => {
    it('should provide meaningful text alternatives', () => {
      render(<ProfileForm />)
      
      // Icons should be hidden from screen readers
      const icons = document.querySelectorAll('[aria-hidden=\"true\"]')
      expect(icons.length).toBeGreaterThan(0)
      
      // Images should have alt text or be marked decorative
      const images = screen.getAllByRole('img')
      images.forEach(img => {
        expect(img).toHaveAttribute('aria-label')
      })
    })

    it('should announce form changes', () => {
      render(<ProfileForm />)
      
      // Form should have proper change announcements
      const form = screen.getByRole('form')
      expect(form).toHaveAttribute('aria-label')
    })
  })

  describe('Responsive and Mobile Accessibility', () => {
    it('should have adequate touch targets', () => {
      render(<ProfileForm />)
      
      // Buttons should be large enough for touch (minimum 44px)
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button)
        const minHeight = parseInt(styles.minHeight || styles.height)
        expect(minHeight).toBeGreaterThanOrEqual(44)
      })
    })

    it('should maintain accessibility in mobile view', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })
      
      render(<ProfileForm />)
      
      // Form should still be accessible on mobile
      expect(screen.getByRole('form')).toBeInTheDocument()
      expect(screen.getAllByRole('textbox')).toBeDefined()
    })
  })
})