import { Container } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'

const BasicExample = () => {
  return (
    <Container>
      <div className="bg-blue-100 p-8 rounded text-center">
        <h3 className="text-lg font-medium text-gray-900">Basic Container</h3>
        <p className="text-gray-600 mt-2">
          This content is contained within a responsive container with default
          max-width and padding.
        </p>
      </div>
    </Container>
  )
}

const SizesExample = () => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Small Container
        </h4>
        <Container size="sm">
          <div className="bg-blue-100 p-4 rounded text-center text-sm">
            Small container (max-width: 640px)
          </div>
        </Container>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Medium Container
        </h4>
        <Container size="md">
          <div className="bg-green-100 p-4 rounded text-center text-sm">
            Medium container (max-width: 768px)
          </div>
        </Container>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Large Container
        </h4>
        <Container size="lg">
          <div className="bg-yellow-100 p-4 rounded text-center text-sm">
            Large container (max-width: 1024px)
          </div>
        </Container>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Extra Large Container
        </h4>
        <Container size="xl">
          <div className="bg-red-100 p-4 rounded text-center text-sm">
            Extra large container (max-width: 1280px)
          </div>
        </Container>
      </div>
    </div>
  )
}

const FluidExample = () => {
  return (
    <Container size="full">
      <div className="bg-purple-100 p-8 rounded text-center">
        <h3 className="text-lg font-medium text-gray-900">Fluid Container</h3>
        <p className="text-gray-600 mt-2">
          This container takes the full width of its parent with no max-width
          constraint.
        </p>
      </div>
    </Container>
  )
}

const PaddingExample = () => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">No Padding</h4>
        <Container
          padding="none"
          className="border border-dashed border-gray-300"
        >
          <div className="bg-blue-100 p-4 text-center text-sm">
            Container with no internal padding
          </div>
        </Container>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Small Padding
        </h4>
        <Container
          padding="sm"
          className="border border-dashed border-gray-300"
        >
          <div className="bg-green-100 p-4 text-center text-sm">
            Container with small padding
          </div>
        </Container>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Large Padding
        </h4>
        <Container
          padding="lg"
          className="border border-dashed border-gray-300"
        >
          <div className="bg-yellow-100 p-4 text-center text-sm">
            Container with large padding
          </div>
        </Container>
      </div>
    </div>
  )
}

const ResponsiveExample = () => {
  return (
    <Container size="lg" padding="md">
      <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-8 rounded text-center">
        <h3 className="text-lg font-medium text-gray-900">
          Responsive Container
        </h3>
        <p className="text-gray-600 mt-2">
          This container changes size and padding based on screen size:
        </p>
        <ul className="text-sm text-gray-600 mt-4 space-y-1">
          <li>Mobile: Small container with small padding</li>
          <li>Tablet: Large container with medium padding</li>
          <li>Desktop: Extra large container with large padding</li>
        </ul>
      </div>
    </Container>
  )
}

const CenteredExample = () => {
  return (
    <Container center>
      <div className="bg-green-100 p-8 rounded text-center max-w-md">
        <h3 className="text-lg font-medium text-gray-900">Centered Content</h3>
        <p className="text-gray-600 mt-2">
          This container centers its content horizontally and vertically.
        </p>
      </div>
    </Container>
  )
}

const NestedExample = () => {
  return (
    <Container size="xl" className="bg-gray-50 py-8">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-gray-900">Outer Container</h3>
        <p className="text-gray-600">
          Extra large container with nested containers
        </p>
      </div>

      <div className="space-y-6">
        <Container size="lg" className="bg-white rounded-lg shadow-sm">
          <div className="text-center py-6">
            <h4 className="text-lg font-medium text-gray-900">
              Large Nested Container
            </h4>
            <p className="text-gray-600 mt-2">
              This is a large container nested inside an extra large one.
            </p>
          </div>
        </Container>

        <Container size="md" className="bg-white rounded-lg shadow-sm">
          <div className="text-center py-6">
            <h4 className="text-lg font-medium text-gray-900">
              Medium Nested Container
            </h4>
            <p className="text-gray-600 mt-2">
              This is a medium container also nested inside.
            </p>
          </div>
        </Container>
      </div>
    </Container>
  )
}

const examples = [
  {
    title: 'Basic Container',
    code: `<Container>
  <div className="bg-blue-100 p-8 rounded text-center">
    <h3 className="text-lg font-medium text-gray-900">Basic Container</h3>
    <p className="text-gray-600 mt-2">
      This content is contained within a responsive container 
      with default max-width and padding.
    </p>
  </div>
</Container>`,
    component: <BasicExample />,
  },
  {
    title: 'Container Sizes',
    code: `<Container size="sm">
  <div className="bg-blue-100 p-4 rounded text-center">
    Small container (max-width: 640px)
  </div>
</Container>

<Container size="md">
  <div className="bg-green-100 p-4 rounded text-center">
    Medium container (max-width: 768px)
  </div>
</Container>

<Container size="lg">
  <div className="bg-yellow-100 p-4 rounded text-center">
    Large container (max-width: 1024px)
  </div>
</Container>

<Container size="xl">
  <div className="bg-red-100 p-4 rounded text-center">
    Extra large container (max-width: 1280px)
  </div>
</Container>`,
    component: <SizesExample />,
  },
  {
    title: 'Fluid Container',
    code: `<Container fluid>
  <div className="bg-purple-100 p-8 rounded text-center">
    <h3 className="text-lg font-medium text-gray-900">Fluid Container</h3>
    <p className="text-gray-600 mt-2">
      This container takes the full width of its parent 
      with no max-width constraint.
    </p>
  </div>
</Container>`,
    component: <FluidExample />,
  },
  {
    title: 'Padding Options',
    code: `<Container padding="none">
  <div className="bg-blue-100 p-4 text-center">
    Container with no internal padding
  </div>
</Container>

<Container padding="sm">
  <div className="bg-green-100 p-4 text-center">
    Container with small padding
  </div>
</Container>

<Container padding="lg">
  <div className="bg-yellow-100 p-4 text-center">
    Container with large padding
  </div>
</Container>`,
    component: <PaddingExample />,
  },
  {
    title: 'Responsive Container',
    code: `<Container 
  size={{ xs: 'sm', md: 'lg', xl: 'xl' }}
  padding={{ xs: 'sm', md: 'md', lg: 'lg' }}
>
  <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-8 rounded text-center">
    <h3 className="text-lg font-medium text-gray-900">Responsive Container</h3>
    <p className="text-gray-600 mt-2">
      This container changes size and padding based on screen size
    </p>
  </div>
</Container>`,
    component: <ResponsiveExample />,
  },
  {
    title: 'Centered Container',
    code: `<Container centered>
  <div className="bg-green-100 p-8 rounded text-center max-w-md">
    <h3 className="text-lg font-medium text-gray-900">Centered Content</h3>
    <p className="text-gray-600 mt-2">
      This container centers its content horizontally and vertically.
    </p>
  </div>
</Container>`,
    component: <CenteredExample />,
  },
  {
    title: 'Nested Containers',
    code: `<Container size="xl" className="bg-gray-50 py-8">
  <div className="text-center mb-8">
    <h3 className="text-xl font-bold text-gray-900">Outer Container</h3>
  </div>
  
  <Container size="lg" className="bg-white rounded-lg shadow-sm">
    <div className="text-center py-6">
      <h4 className="text-lg font-medium text-gray-900">Large Nested Container</h4>
    </div>
  </Container>
  
  <Container size="md" className="bg-white rounded-lg shadow-sm">
    <div className="text-center py-6">
      <h4 className="text-lg font-medium text-gray-900">Medium Nested Container</h4>
    </div>
  </Container>
</Container>`,
    component: <NestedExample />,
  },
]

export default function ContainerPage() {
  return (
    <ComponentLayout
      title="Container"
      description="A responsive container component that constrains content width and provides consistent padding across different screen sizes."
      examples={examples}
    />
  )
}
