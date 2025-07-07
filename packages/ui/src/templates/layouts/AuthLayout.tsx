import { forwardRef } from 'react'
import { ArrowLeft, Shield, Check } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface AuthLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  
  // Layout configuration
  variant?: 'centered' | 'split' | 'minimal'
  
  // Branding
  brand?: {
    name: string
    logo?: string | React.ComponentType<{ className?: string }>
    href?: string
  }
  
  // Content
  title?: string
  subtitle?: string
  backLink?: {
    href: string
    label: string
  }
  
  // Split layout specific
  heroContent?: {
    title: string
    subtitle: string
    features?: string[]
    testimonial?: {
      quote: string
      author: string
      role: string
      avatar?: string
    }
    backgroundImage?: string
    backgroundColor?: string
  }
  
  // Footer
  footer?: {
    links: Array<{
      label: string
      href: string
    }>
    copyright?: string
  }
  
  // SEO
  pageTitle?: string
  pageDescription?: string
}

export const AuthLayout = forwardRef<HTMLDivElement, AuthLayoutProps>(
  ({ 
    children,
    variant = 'centered',
    brand,
    title,
    subtitle,
    backLink,
    heroContent,
    footer,
    pageTitle,
    pageDescription,
    className,
    ...props 
  }, ref) => {
    const renderBrand = () => {
      if (!brand) return null

      const content = (
        <div className="flex items-center gap-2">
          {typeof brand.logo === 'string' ? (
            <img src={brand.logo} alt={brand.name} className="h-8 w-8" />
          ) : brand.logo ? (
            <brand.logo className="h-8 w-8" />
          ) : (
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                {brand.name.charAt(0)}
              </span>
            </div>
          )}
          <span className="text-xl font-bold">{brand.name}</span>
        </div>
      )

      return brand.href ? (
        <a href={brand.href}>{content}</a>
      ) : (
        content
      )
    }

    const renderHeroSection = () => {
      if (!heroContent) return null

      return (
        <div 
          className={cn(
            'relative hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 lg:py-12',
            heroContent.backgroundColor || 'bg-primary'
          )}
          style={{
            backgroundImage: heroContent.backgroundImage ? `url(${heroContent.backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay */}
          {heroContent.backgroundImage && (
            <div className="absolute inset-0 bg-black/40" />
          )}

          <div className="relative z-10 text-white">
            <div className="max-w-md">
              <h1 className="text-4xl font-bold leading-tight mb-6">
                {heroContent.title}
              </h1>
              <p className="text-xl text-white/90 mb-8">
                {heroContent.subtitle}
              </p>

              {heroContent.features && (
                <ul className="space-y-4 mb-8">
                  {heroContent.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-5 w-5 bg-white/20 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-white/90">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              {heroContent.testimonial && (
                <blockquote className="border-l-4 border-white/30 pl-4">
                  <p className="text-white/90 italic mb-3">
                    "{heroContent.testimonial.quote}"
                  </p>
                  <footer className="flex items-center gap-3">
                    {heroContent.testimonial.avatar && (
                      <img
                        src={heroContent.testimonial.avatar}
                        alt={heroContent.testimonial.author}
                        className="h-10 w-10 rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-medium text-white">
                        {heroContent.testimonial.author}
                      </div>
                      <div className="text-sm text-white/70">
                        {heroContent.testimonial.role}
                      </div>
                    </div>
                  </footer>
                </blockquote>
              )}
            </div>
          </div>
        </div>
      )
    }

    const renderAuthForm = () => (
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className={cn(
          'mx-auto w-full',
          variant === 'centered' ? 'max-w-sm' : 'max-w-md'
        )}>
          {/* Header */}
          <div className="text-center mb-8">
            {variant === 'centered' && renderBrand()}
            
            {title && (
              <h1 className={cn(
                'text-2xl font-bold text-foreground',
                variant === 'centered' && brand && 'mt-6'
              )}>
                {title}
              </h1>
            )}
            
            {subtitle && (
              <p className="mt-2 text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>

          {/* Auth form content */}
          <div className="space-y-6">
            {children}
          </div>

          {/* Back link */}
          {backLink && (
            <div className="mt-8">
              <a
                href={backLink.href}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {backLink.label}
              </a>
            </div>
          )}
        </div>
      </div>
    )

    const renderFooter = () => {
      if (!footer) return null

      return (
        <footer className="border-t border-border bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {footer.links && (
                <nav className="flex gap-6">
                  {footer.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              )}
              
              {footer.copyright && (
                <p className="text-sm text-muted-foreground">
                  {footer.copyright}
                </p>
              )}
            </div>
          </div>
        </footer>
      )
    }

    // Set page title
    if (pageTitle && typeof document !== 'undefined') {
      document.title = pageTitle
    }

    // Set meta description
    if (pageDescription && typeof document !== 'undefined') {
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', pageDescription)
    }

    if (variant === 'minimal') {
      return (
        <div 
          ref={ref} 
          className={cn('min-h-screen bg-background', className)} 
          {...props}
        >
          <div className="flex min-h-screen">
            <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
              <div className="mx-auto w-full max-w-sm">
                {brand && (
                  <div className="mb-8 text-center">
                    {renderBrand()}
                  </div>
                )}
                {children}
              </div>
            </div>
          </div>
          {renderFooter()}
        </div>
      )
    }

    if (variant === 'split') {
      return (
        <div 
          ref={ref} 
          className={cn('min-h-screen bg-background', className)} 
          {...props}
        >
          {/* Navigation */}
          {brand && (
            <nav className="absolute top-0 left-0 z-10 w-full">
              <div className="flex justify-between items-center p-6">
                {renderBrand()}
                {backLink && (
                  <a
                    href={backLink.href}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {backLink.label}
                  </a>
                )}
              </div>
            </nav>
          )}

          <div className="flex min-h-screen">
            {/* Hero Section */}
            {renderHeroSection()}

            {/* Auth Form */}
            <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-background">
              <div className="mx-auto w-full max-w-md">
                {title && (
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-foreground">
                      {title}
                    </h1>
                    {subtitle && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {subtitle}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-6">
                  {children}
                </div>
              </div>
            </div>
          </div>

          {renderFooter()}
        </div>
      )
    }

    // Default centered variant
    return (
      <div 
        ref={ref} 
        className={cn('min-h-screen bg-background', className)} 
        {...props}
      >
        {/* Optional top navigation */}
        {backLink && (
          <nav className="p-6">
            <a
              href={backLink.href}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLink.label}
            </a>
          </nav>
        )}

        <div className="flex min-h-screen">
          {renderAuthForm()}
        </div>

        {renderFooter()}
      </div>
    )
  }
)

AuthLayout.displayName = 'AuthLayout'