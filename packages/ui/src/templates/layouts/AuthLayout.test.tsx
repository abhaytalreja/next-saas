import React from 'react'
import { render, screen, fireEvent } from '../../test-utils'
import { AuthLayout } from './AuthLayout'
import { testAccessibility } from '../../test-utils'
import { User } from 'lucide-react'

// Mock data for testing
const mockBrand = {
  name: 'TestApp',
  logo: 'https://example.com/logo.png',
  href: 'https://example.com',
}

const mockBrandWithComponent = {
  name: 'TestApp',
  logo: ({ className }: { className?: string }) => (
    <div className={className} data-testid="logo-component">Logo</div>
  ),
}

const mockHeroContent = {
  title: 'Welcome to TestApp',
  subtitle: 'The best platform for your business',
  features: [
    'Feature 1',
    'Feature 2',
    'Feature 3',
  ],
  testimonial: {
    quote: 'This app changed our business!',
    author: 'John Doe',
    role: 'CEO',
    avatar: 'https://example.com/avatar.jpg',
  },
  backgroundImage: 'https://example.com/bg.jpg',
  backgroundColor: 'bg-blue-600',
}

const mockFooter = {
  links: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Support', href: '/support' },
  ],
  copyright: '© 2024 TestApp. All rights reserved.',
}

const mockBackLink = {
  href: '/dashboard',
  label: 'Back to Dashboard',
}

describe('AuthLayout Component', () => {
  beforeEach(() => {
    // Reset document title and meta description
    if (typeof document !== 'undefined') {
      document.title = ''
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.remove()
      }
    }
  })

  describe('Basic Rendering', () => {
    it('renders with minimal props', () => {
      render(
        <AuthLayout>
          <div data-testid="form-content">Login Form</div>
        </AuthLayout>
      )
      
      expect(screen.getByTestId('form-content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <AuthLayout className="custom-auth-layout">
          <div>Content</div>
        </AuthLayout>
      )
      
      const container = screen.getByText('Content').closest('div')?.parentElement?.parentElement
      expect(container).toHaveClass('custom-auth-layout')
    })

    it('renders children content', () => {
      render(
        <AuthLayout>
          <div data-testid="auth-form">
            <input placeholder="Email" />
            <button>Login</button>
          </div>
        </AuthLayout>
      )
      
      expect(screen.getByTestId('auth-form')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
    })
  })

  describe('Centered Variant (Default)', () => {
    it('renders centered layout by default', () => {
      render(
        <AuthLayout title="Sign In" brand={mockBrand}>
          <div>Form content</div>
        </AuthLayout>
      )
      
      expect(screen.getByText('Sign In')).toBeInTheDocument()
      expect(screen.getByText('TestApp')).toBeInTheDocument()
    })

    it('renders brand with string logo', () => {
      render(
        <AuthLayout brand={mockBrand}>
          <div>Content</div>
        </AuthLayout>
      )
      
      const logo = screen.getByAltText('TestApp')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('src', 'https://example.com/logo.png')
    })

    it('renders brand with component logo', () => {
      render(
        <AuthLayout brand={mockBrandWithComponent}>
          <div>Content</div>
        </AuthLayout>
      )
      
      expect(screen.getByTestId('logo-component')).toBeInTheDocument()
    })

    it('renders brand without logo (initials fallback)', () => {
      const brandWithoutLogo = { name: 'TestApp', href: '/home' }
      render(
        <AuthLayout brand={brandWithoutLogo}>
          <div>Content</div>
        </AuthLayout>
      )
      
      expect(screen.getByText('T')).toBeInTheDocument() // First letter
      expect(screen.getByText('TestApp')).toBeInTheDocument()
    })

    it('renders brand as link when href provided', () => {
      render(
        <AuthLayout brand={mockBrand}>
          <div>Content</div>
        </AuthLayout>
      )
      
      const brandLink = screen.getByRole('link')
      expect(brandLink).toHaveAttribute('href', 'https://example.com')
    })

    it('renders brand without link when href not provided', () => {
      const brandWithoutHref = { name: 'TestApp', logo: 'logo.png' }
      render(
        <AuthLayout brand={brandWithoutHref}>
          <div>Content</div>
        </AuthLayout>
      )
      
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
      expect(screen.getByText('TestApp')).toBeInTheDocument()
    })

    it('renders title and subtitle', () => {
      render(
        <AuthLayout 
          title="Welcome Back" 
          subtitle="Sign in to your account"
        >
          <div>Form</div>
        </AuthLayout>
      )
      
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    })

    it('renders back link', () => {
      render(
        <AuthLayout backLink={mockBackLink}>
          <div>Content</div>
        </AuthLayout>
      )
      
      const backLink = screen.getByRole('link', { name: /back to dashboard/i })
      expect(backLink).toHaveAttribute('href', '/dashboard')
      expect(document.querySelector('[data-lucide="arrow-left"]')).toBeInTheDocument()
    })
  })

  describe('Split Variant', () => {
    it('renders split layout correctly', () => {
      render(
        <AuthLayout 
          variant="split" 
          brand={mockBrand}
          title="Create Account"
          heroContent={mockHeroContent}
        >
          <div>Registration form</div>
        </AuthLayout>
      )
      
      expect(screen.getByText('Create Account')).toBeInTheDocument()
      expect(screen.getByText('Welcome to TestApp')).toBeInTheDocument()
      expect(screen.getByText('Registration form')).toBeInTheDocument()
    })

    it('renders hero content with features', () => {
      render(
        <AuthLayout variant="split" heroContent={mockHeroContent}>
          <div>Content</div>
        </AuthLayout>
      )
      
      expect(screen.getByText('Welcome to TestApp')).toBeInTheDocument()
      expect(screen.getByText('The best platform for your business')).toBeInTheDocument()
      expect(screen.getByText('Feature 1')).toBeInTheDocument()
      expect(screen.getByText('Feature 2')).toBeInTheDocument()
      expect(screen.getByText('Feature 3')).toBeInTheDocument()
    })

    it('renders testimonial when provided', () => {
      render(
        <AuthLayout variant="split" heroContent={mockHeroContent}>
          <div>Content</div>
        </AuthLayout>
      )
      
      expect(screen.getByText('This app changed our business!')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('CEO')).toBeInTheDocument()
      
      const avatar = screen.getByAltText('John Doe')
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })

    it('applies background image styles', () => {
      render(
        <AuthLayout variant="split" heroContent={mockHeroContent}>
          <div>Content</div>
        </AuthLayout>
      )
      
      const heroSection = document.querySelector('.lg\\:flex-1')
      expect(heroSection).toHaveStyle({
        'background-image': 'url(https://example.com/bg.jpg)',
      })
    })

    it('applies background color when no image', () => {
      const heroWithoutImage = { ...mockHeroContent }
      delete heroWithoutImage.backgroundImage
      
      render(
        <AuthLayout variant="split" heroContent={heroWithoutImage}>
          <div>Content</div>
        </AuthLayout>
      )
      
      const heroSection = document.querySelector('.lg\\:flex-1')
      expect(heroSection).toHaveClass('bg-blue-600')
    })

    it('renders overlay when background image is present', () => {
      render(
        <AuthLayout variant="split" heroContent={mockHeroContent}>
          <div>Content</div>
        </AuthLayout>
      )
      
      expect(document.querySelector('.bg-black\\/40')).toBeInTheDocument()
    })

    it('renders brand in navigation', () => {
      render(
        <AuthLayout variant="split" brand={mockBrand} heroContent={mockHeroContent}>
          <div>Content</div>
        </AuthLayout>
      )
      
      const brandInNav = screen.getByText('TestApp')
      expect(brandInNav).toBeInTheDocument()
    })

    it('renders back link in navigation', () => {
      render(
        <AuthLayout 
          variant="split" 
          brand={mockBrand}
          backLink={mockBackLink}
          heroContent={mockHeroContent}
        >
          <div>Content</div>
        </AuthLayout>
      )
      
      expect(screen.getByText('Back to Dashboard')).toBeInTheDocument()
    })
  })

  describe('Minimal Variant', () => {
    it('renders minimal layout correctly', () => {
      render(
        <AuthLayout variant="minimal" brand={mockBrand}>
          <div data-testid="minimal-content">Minimal form</div>
        </AuthLayout>
      )
      
      expect(screen.getByText('TestApp')).toBeInTheDocument()
      expect(screen.getByTestId('minimal-content')).toBeInTheDocument()
    })

    it('centers brand in minimal variant', () => {
      render(
        <AuthLayout variant="minimal" brand={mockBrand}>
          <div>Content</div>
        </AuthLayout>
      )
      
      const brandContainer = screen.getByText('TestApp').closest('div')?.parentElement
      expect(brandContainer).toHaveClass('text-center')
    })

    it('renders without brand in minimal variant', () => {
      render(
        <AuthLayout variant="minimal">
          <div data-testid="content">Content without brand</div>
        </AuthLayout>
      )
      
      expect(screen.getByTestId('content')).toBeInTheDocument()
    })
  })

  describe('Footer', () => {
    it('renders footer with links and copyright', () => {
      render(
        <AuthLayout footer={mockFooter}>
          <div>Content</div>
        </AuthLayout>
      )
      
      expect(screen.getByText('Privacy')).toBeInTheDocument()
      expect(screen.getByText('Terms')).toBeInTheDocument()
      expect(screen.getByText('Support')).toBeInTheDocument()
      expect(screen.getByText('© 2024 TestApp. All rights reserved.')).toBeInTheDocument()
      
      const privacyLink = screen.getByRole('link', { name: 'Privacy' })
      expect(privacyLink).toHaveAttribute('href', '/privacy')
    })

    it('renders footer with only links', () => {
      const footerWithoutCopyright = { links: mockFooter.links }
      render(
        <AuthLayout footer={footerWithoutCopyright}>
          <div>Content</div>
        </AuthLayout>
      )
      
      expect(screen.getByText('Privacy')).toBeInTheDocument()
      expect(screen.queryByText('© 2024')).not.toBeInTheDocument()
    })

    it('renders footer with only copyright', () => {
      const footerWithoutLinks = { copyright: mockFooter.copyright }
      render(
        <AuthLayout footer={footerWithoutLinks}>
          <div>Content</div>
        </AuthLayout>
      )
      
      expect(screen.getByText('© 2024 TestApp. All rights reserved.')).toBeInTheDocument()
      expect(screen.queryByText('Privacy')).not.toBeInTheDocument()
    })

    it('does not render footer when not provided', () => {
      render(
        <AuthLayout>
          <div>Content</div>
        </AuthLayout>
      )
      
      expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
      expect(screen.queryByText('Privacy')).not.toBeInTheDocument()
    })
  })

  describe('SEO Features', () => {
    it('sets page title when provided', () => {
      render(
        <AuthLayout pageTitle="Login - TestApp">
          <div>Content</div>
        </AuthLayout>
      )
      
      if (typeof document !== 'undefined') {
        expect(document.title).toBe('Login - TestApp')
      }
    })

    it('sets meta description when provided', () => {
      render(
        <AuthLayout pageDescription="Sign in to access your account">
          <div>Content</div>
        </AuthLayout>
      )
      
      if (typeof document !== 'undefined') {
        const metaDescription = document.querySelector('meta[name="description"]')
        expect(metaDescription).toHaveAttribute('content', 'Sign in to access your account')
      }
    })

    it('creates meta description if it does not exist', () => {
      // Ensure no existing meta description
      const existingMeta = document.querySelector('meta[name="description"]')
      if (existingMeta) {
        existingMeta.remove()
      }
      
      render(
        <AuthLayout pageDescription="New meta description">
          <div>Content</div>
        </AuthLayout>
      )
      
      if (typeof document !== 'undefined') {
        const metaDescription = document.querySelector('meta[name="description"]')
        expect(metaDescription).toHaveAttribute('content', 'New meta description')
      }
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive classes correctly', () => {
      render(
        <AuthLayout variant="centered" brand={mockBrand}>
          <div>Content</div>
        </AuthLayout>
      )
      
      // Check for responsive padding classes
      const formContainer = screen.getByText('TestApp').closest('div')?.parentElement?.parentElement
      expect(formContainer).toHaveClass('px-4', 'sm:px-6', 'lg:px-8')
    })

    it('hides hero section on small screens in split variant', () => {
      render(
        <AuthLayout variant="split" heroContent={mockHeroContent}>
          <div>Content</div>
        </AuthLayout>
      )
      
      const heroSection = document.querySelector('.hidden.lg\\:flex')
      expect(heroSection).toBeInTheDocument()
    })
  })

  describe('Feature Rendering', () => {
    it('renders features with check icons', () => {
      render(
        <AuthLayout variant="split" heroContent={mockHeroContent}>
          <div>Content</div>
        </AuthLayout>
      )
      
      expect(screen.getByText('Feature 1')).toBeInTheDocument()
      
      // Check for check icons
      const checkIcons = document.querySelectorAll('[data-lucide="check"]')
      expect(checkIcons.length).toBe(mockHeroContent.features.length)
    })

    it('does not render features section when features not provided', () => {
      const heroWithoutFeatures = {
        title: 'Title',
        subtitle: 'Subtitle',
      }
      
      render(
        <AuthLayout variant="split" heroContent={heroWithoutFeatures}>
          <div>Content</div>
        </AuthLayout>
      )
      
      expect(screen.queryByText('Feature 1')).not.toBeInTheDocument()
    })
  })

  describe('Content Layout', () => {
    it('applies correct max-width for centered variant', () => {
      render(
        <AuthLayout variant="centered">
          <div data-testid="form-content">Content</div>
        </AuthLayout>
      )
      
      const container = screen.getByTestId('form-content').closest('div')?.parentElement
      expect(container).toHaveClass('max-w-sm')
    })

    it('applies correct max-width for split variant', () => {
      render(
        <AuthLayout variant="split" heroContent={mockHeroContent}>
          <div data-testid="form-content">Content</div>
        </AuthLayout>
      )
      
      const container = screen.getByTestId('form-content').closest('div')?.parentElement
      expect(container).toHaveClass('max-w-md')
    })

    it('applies correct max-width for minimal variant', () => {
      render(
        <AuthLayout variant="minimal">
          <div data-testid="form-content">Content</div>
        </AuthLayout>
      )
      
      const container = screen.getByTestId('form-content').closest('div')?.parentElement
      expect(container).toHaveClass('max-w-sm')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      await testAccessibility(
        <AuthLayout 
          title="Sign In"
          subtitle="Welcome back"
          brand={mockBrand}
          backLink={mockBackLink}
        >
          <form>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" />
            <button type="submit">Sign In</button>
          </form>
        </AuthLayout>
      )
    })

    it('provides proper heading hierarchy', () => {
      render(
        <AuthLayout title="Sign In" variant="split" heroContent={mockHeroContent}>
          <div>Content</div>
        </AuthLayout>
      )
      
      const mainHeading = screen.getByRole('heading', { level: 1, name: 'Welcome to TestApp' })
      expect(mainHeading).toBeInTheDocument()
      
      const authHeading = screen.getByRole('heading', { level: 1, name: 'Sign In' })
      expect(authHeading).toBeInTheDocument()
    })

    it('provides alt text for brand logos', () => {
      render(
        <AuthLayout brand={mockBrand}>
          <div>Content</div>
        </AuthLayout>
      )
      
      const logo = screen.getByAltText('TestApp')
      expect(logo).toBeInTheDocument()
    })

    it('provides alt text for testimonial avatars', () => {
      render(
        <AuthLayout variant="split" heroContent={mockHeroContent}>
          <div>Content</div>
        </AuthLayout>
      )
      
      const avatar = screen.getByAltText('John Doe')
      expect(avatar).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles missing hero content gracefully', () => {
      render(
        <AuthLayout variant="split">
          <div>Content</div>
        </AuthLayout>
      )
      
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('handles empty features array', () => {
      const heroWithEmptyFeatures = {
        ...mockHeroContent,
        features: [],
      }
      
      render(
        <AuthLayout variant="split" heroContent={heroWithEmptyFeatures}>
          <div>Content</div>
        </AuthLayout>
      )
      
      expect(screen.getByText('Welcome to TestApp')).toBeInTheDocument()
    })

    it('handles missing testimonial avatar', () => {
      const heroWithoutAvatar = {
        ...mockHeroContent,
        testimonial: {
          quote: 'Great app!',
          author: 'Jane Doe',
          role: 'CTO',
        },
      }
      
      render(
        <AuthLayout variant="split" heroContent={heroWithoutAvatar}>
          <div>Content</div>
        </AuthLayout>
      )
      
      expect(screen.getByText('Great app!')).toBeInTheDocument()
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
      expect(screen.queryByAltText('Jane Doe')).not.toBeInTheDocument()
    })
  })

  describe('Forwarded Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(
        <AuthLayout ref={ref}>
          <div>Content</div>
        </AuthLayout>
      )
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })
})