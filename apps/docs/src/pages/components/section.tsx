import { Section } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'

const BasicExample = () => {
  return (
    <Section>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Basic Section</h2>
      <p className="text-gray-600">
        This is a basic section component that provides consistent spacing and layout structure.
        It automatically handles padding and margin to create proper visual separation between content areas.
      </p>
    </Section>
  )
}

const SizesExample = () => {
  return (
    <div className="space-y-4">
      <Section size="sm" className="bg-blue-50 rounded">
        <h3 className="text-lg font-medium text-gray-900">Small Section</h3>
        <p className="text-gray-600 text-sm mt-2">Compact spacing for dense layouts</p>
      </Section>
      
      <Section size="md" className="bg-green-50 rounded">
        <h3 className="text-lg font-medium text-gray-900">Medium Section</h3>
        <p className="text-gray-600 text-sm mt-2">Default spacing for most content areas</p>
      </Section>
      
      <Section size="lg" className="bg-yellow-50 rounded">
        <h3 className="text-lg font-medium text-gray-900">Large Section</h3>
        <p className="text-gray-600 text-sm mt-2">Generous spacing for hero sections and featured content</p>
      </Section>
      
      <Section size="xl" className="bg-red-50 rounded">
        <h3 className="text-lg font-medium text-gray-900">Extra Large Section</h3>
        <p className="text-gray-600 text-sm mt-2">Maximum spacing for landing pages and showcases</p>
      </Section>
    </div>
  )
}

const VariantsExample = () => {
  return (
    <div className="space-y-4">
      <Section variant="default">
        <h3 className="text-lg font-medium text-gray-900">Default Section</h3>
        <p className="text-gray-600 text-sm mt-2">Standard section with no background styling</p>
      </Section>
      
      <Section variant="contained" className="border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Contained Section</h3>
        <p className="text-gray-600 text-sm mt-2">Section with background and border styling</p>
      </Section>
      
      <Section variant="elevated" className="shadow-md">
        <h3 className="text-lg font-medium text-gray-900">Elevated Section</h3>
        <p className="text-gray-600 text-sm mt-2">Section with shadow and elevated appearance</p>
      </Section>
    </div>
  )
}

const ResponsiveExample = () => {
  return (
    <Section 
      size={{ xs: 'sm', md: 'lg' }}
      padding={{ xs: 'sm', md: 'lg' }}
    >
      <h3 className="text-lg font-medium text-gray-900">Responsive Section</h3>
      <p className="text-gray-600 mt-2">
        This section adapts its size and padding based on screen size:
      </p>
      <ul className="text-sm text-gray-600 mt-4 space-y-1">
        <li>• Mobile: Small size with small padding</li>
        <li>• Desktop: Large size with large padding</li>
      </ul>
    </Section>
  )
}

const HeroExample = () => {
  return (
    <Section size="xl" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Hero Section</h1>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Create stunning hero sections with the Section component. Perfect for landing pages and promotional content.
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
            Get Started
          </button>
          <button className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </Section>
  )
}

const ContentExample = () => {
  return (
    <div className="space-y-0">
      <Section className="bg-gray-50">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Features Overview</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the powerful features that make our product stand out from the competition.
          </p>
        </div>
      </Section>
      
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Fast Performance</h3>
            <p className="text-gray-600 text-sm">Lightning-fast load times and smooth interactions.</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Reliable</h3>
            <p className="text-gray-600 text-sm">99.9% uptime with enterprise-grade infrastructure.</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Secure</h3>
            <p className="text-gray-600 text-sm">Bank-level security with end-to-end encryption.</p>
          </div>
        </div>
      </Section>
      
      <Section className="bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">Join thousands of satisfied customers today.</p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Start Free Trial
          </button>
        </div>
      </Section>
    </div>
  )
}

const examples = [
  {
    title: 'Basic Section',
    code: `<Section>
  <h2 className="text-2xl font-bold text-gray-900 mb-4">Basic Section</h2>
  <p className="text-gray-600">
    This is a basic section component that provides consistent spacing 
    and layout structure. It automatically handles padding and margin 
    to create proper visual separation between content areas.
  </p>
</Section>`,
    component: <BasicExample />,
  },
  {
    title: 'Section Sizes',
    code: `<Section size="sm">
  <h3 className="text-lg font-medium text-gray-900">Small Section</h3>
  <p className="text-gray-600 text-sm mt-2">Compact spacing for dense layouts</p>
</Section>

<Section size="md">
  <h3 className="text-lg font-medium text-gray-900">Medium Section</h3>
  <p className="text-gray-600 text-sm mt-2">Default spacing for most content areas</p>
</Section>

<Section size="lg">
  <h3 className="text-lg font-medium text-gray-900">Large Section</h3>
  <p className="text-gray-600 text-sm mt-2">Generous spacing for hero sections</p>
</Section>`,
    component: <SizesExample />,
  },
  {
    title: 'Section Variants',
    code: `<Section variant="default">
  <h3 className="text-lg font-medium text-gray-900">Default Section</h3>
  <p className="text-gray-600 text-sm mt-2">Standard section with no background styling</p>
</Section>

<Section variant="contained">
  <h3 className="text-lg font-medium text-gray-900">Contained Section</h3>
  <p className="text-gray-600 text-sm mt-2">Section with background and border styling</p>
</Section>

<Section variant="elevated">
  <h3 className="text-lg font-medium text-gray-900">Elevated Section</h3>
  <p className="text-gray-600 text-sm mt-2">Section with shadow and elevated appearance</p>
</Section>`,
    component: <VariantsExample />,
  },
  {
    title: 'Responsive Section',
    code: `<Section 
  size={{ xs: 'sm', md: 'lg' }}
  padding={{ xs: 'sm', md: 'lg' }}
>
  <h3 className="text-lg font-medium text-gray-900">Responsive Section</h3>
  <p className="text-gray-600 mt-2">
    This section adapts its size and padding based on screen size
  </p>
</Section>`,
    component: <ResponsiveExample />,
  },
  {
    title: 'Hero Section',
    code: `<Section size="xl" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
  <div className="text-center">
    <h1 className="text-4xl font-bold mb-4">Hero Section</h1>
    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
      Create stunning hero sections with the Section component. 
      Perfect for landing pages and promotional content.
    </p>
    <div className="flex justify-center gap-4">
      <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium">
        Get Started
      </button>
      <button className="border border-white text-white px-6 py-3 rounded-lg font-medium">
        Learn More
      </button>
    </div>
  </div>
</Section>`,
    component: <HeroExample />,
  },
  {
    title: 'Content Layout',
    code: `<div className="space-y-0">
  <Section className="bg-gray-50">
    <div className="text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Features Overview</h2>
      <p className="text-gray-600 max-w-2xl mx-auto">
        Discover the powerful features that make our product stand out.
      </p>
    </div>
  </Section>
  
  <Section>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Feature cards content -->
    </div>
  </Section>
  
  <Section className="bg-gray-50">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
      <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium">
        Start Free Trial
      </button>
    </div>
  </Section>
</div>`,
    component: <ContentExample />,
  },
]

export default function SectionPage() {
  return (
    <ComponentLayout
      title="Section"
      description="A structural component for organizing page content with consistent spacing, padding, and visual hierarchy between different areas."
      examples={examples}
    />
  )
}