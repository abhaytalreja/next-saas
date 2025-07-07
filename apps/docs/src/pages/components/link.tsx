import { Link } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { ExternalLink, ArrowRight, Download, Mail } from 'lucide-react'

const BasicExample = () => {
  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        This is a paragraph with an <Link href="/components">internal link</Link> and an{' '}
        <Link href="https://example.com" external>external link</Link>.
      </p>
      <p className="text-gray-600">
        You can also create <Link href="#section">anchor links</Link> for navigation within the same page.
      </p>
    </div>
  )
}

const VariantsExample = () => {
  return (
    <div className="space-y-4">
      <div>
        <Link variant="default" href="/components">Default Link</Link>
      </div>
      <div>
        <Link variant="primary" href="/components">Primary Link</Link>
      </div>
      <div>
        <Link variant="secondary" href="/components">Secondary Link</Link>
      </div>
      <div>
        <Link variant="subtle" href="/components">Subtle Link</Link>
      </div>
      <div>
        <Link variant="danger" href="/components">Danger Link</Link>
      </div>
    </div>
  )
}

const SizesExample = () => {
  return (
    <div className="space-y-4">
      <div>
        <Link size="xs" href="/components">Extra Small Link</Link>
      </div>
      <div>
        <Link size="sm" href="/components">Small Link</Link>
      </div>
      <div>
        <Link size="md" href="/components">Medium Link</Link>
      </div>
      <div>
        <Link size="lg" href="/components">Large Link</Link>
      </div>
      <div>
        <Link size="xl" href="/components">Extra Large Link</Link>
      </div>
    </div>
  )
}

const WithIconsExample = () => {
  return (
    <div className="space-y-4">
      <div>
        <Link href="https://example.com" external icon={ExternalLink}>
          External Link with Icon
        </Link>
      </div>
      <div>
        <Link href="/next-page" icon={ArrowRight} iconPosition="right">
          Next Page
        </Link>
      </div>
      <div>
        <Link href="/download" icon={Download}>
          Download File
        </Link>
      </div>
      <div>
        <Link href="mailto:hello@example.com" icon={Mail}>
          Send Email
        </Link>
      </div>
    </div>
  )
}

const StatesExample = () => {
  return (
    <div className="space-y-4">
      <div>
        <Link href="/components">Normal Link</Link>
      </div>
      <div>
        <Link href="/components" disabled>Disabled Link</Link>
      </div>
      <div>
        <Link href="/components" loading>Loading Link</Link>
      </div>
      <div>
        <Link href="/current-page" active>Active Link</Link>
      </div>
    </div>
  )
}

const UnderlineExample = () => {
  return (
    <div className="space-y-4">
      <div>
        <Link href="/components" underline="always">Always Underlined</Link>
      </div>
      <div>
        <Link href="/components" underline="hover">Underline on Hover</Link>
      </div>
      <div>
        <Link href="/components" underline="never">Never Underlined</Link>
      </div>
    </div>
  )
}

const NavigationExample = () => {
  const navigationLinks = [
    { href: '/', label: 'Home' },
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <nav className="bg-gray-50 p-4 rounded-lg">
      <div className="flex flex-wrap gap-6">
        {navigationLinks.map((link) => (
          <Link 
            key={link.href}
            href={link.href}
            variant="secondary"
            underline="hover"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

const InlineExample = () => {
  return (
    <div className="prose max-w-none">
      <p className="text-gray-600 leading-relaxed">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
        incididunt ut <Link href="/docs" variant="primary">labore et dolore</Link> magna 
        aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi 
        ut <Link href="/guide" variant="subtle">aliquip ex ea</Link> commodo consequat.
      </p>
      <p className="text-gray-600 leading-relaxed mt-4">
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 
        eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt 
        in culpa qui <Link href="/more-info" external icon={ExternalLink}>officia deserunt</Link> mollit 
        anim id est laborum.
      </p>
    </div>
  )
}

const examples = [
  {
    title: 'Basic Links',
    code: `<p className="text-gray-600">
  This is a paragraph with an <Link href="/components">internal link</Link> and an{' '}
  <Link href="https://example.com" external>external link</Link>.
</p>
<p className="text-gray-600">
  You can also create <Link href="#section">anchor links</Link> for navigation.
</p>`,
    component: <BasicExample />,
  },
  {
    title: 'Link Variants',
    code: `<div className="space-y-4">
  <Link variant="default" href="/components">Default Link</Link>
  <Link variant="primary" href="/components">Primary Link</Link>
  <Link variant="secondary" href="/components">Secondary Link</Link>
  <Link variant="subtle" href="/components">Subtle Link</Link>
  <Link variant="danger" href="/components">Danger Link</Link>
</div>`,
    component: <VariantsExample />,
  },
  {
    title: 'Link Sizes',
    code: `<div className="space-y-4">
  <Link size="xs" href="/components">Extra Small Link</Link>
  <Link size="sm" href="/components">Small Link</Link>
  <Link size="md" href="/components">Medium Link</Link>
  <Link size="lg" href="/components">Large Link</Link>
  <Link size="xl" href="/components">Extra Large Link</Link>
</div>`,
    component: <SizesExample />,
  },
  {
    title: 'Links with Icons',
    code: `import { ExternalLink, ArrowRight, Download, Mail } from 'lucide-react'

<div className="space-y-4">
  <Link href="https://example.com" external icon={ExternalLink}>
    External Link with Icon
  </Link>
  <Link href="/next-page" icon={ArrowRight} iconPosition="right">
    Next Page
  </Link>
  <Link href="/download" icon={Download}>
    Download File
  </Link>
  <Link href="mailto:hello@example.com" icon={Mail}>
    Send Email
  </Link>
</div>`,
    component: <WithIconsExample />,
  },
  {
    title: 'Link States',
    code: `<div className="space-y-4">
  <Link href="/components">Normal Link</Link>
  <Link href="/components" disabled>Disabled Link</Link>
  <Link href="/components" loading>Loading Link</Link>
  <Link href="/current-page" active>Active Link</Link>
</div>`,
    component: <StatesExample />,
  },
  {
    title: 'Underline Options',
    code: `<div className="space-y-4">
  <Link href="/components" underline="always">Always Underlined</Link>
  <Link href="/components" underline="hover">Underline on Hover</Link>
  <Link href="/components" underline="never">Never Underlined</Link>
</div>`,
    component: <UnderlineExample />,
  },
  {
    title: 'Navigation Links',
    code: `const navigationLinks = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

<nav className="bg-gray-50 p-4 rounded-lg">
  <div className="flex flex-wrap gap-6">
    {navigationLinks.map((link) => (
      <Link 
        key={link.href}
        href={link.href}
        variant="secondary"
        underline="hover"
      >
        {link.label}
      </Link>
    ))}
  </div>
</nav>`,
    component: <NavigationExample />,
  },
  {
    title: 'Inline Text Links',
    code: `<div className="prose max-w-none">
  <p className="text-gray-600 leading-relaxed">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
    incididunt ut <Link href="/docs" variant="primary">labore et dolore</Link> magna 
    aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi 
    ut <Link href="/guide" variant="subtle">aliquip ex ea</Link> commodo consequat.
  </p>
  <p className="text-gray-600 leading-relaxed mt-4">
    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 
    eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt 
    in culpa qui <Link href="/more-info" external icon={ExternalLink}>officia deserunt</Link> mollit 
    anim id est laborum.
  </p>
</div>`,
    component: <InlineExample />,
  },
]

export default function LinkPage() {
  return (
    <ComponentLayout
      title="Link"
      description="A navigation link component with support for internal and external links, icons, variants, and different states for building accessible navigation."
      examples={examples}
    />
  )
}