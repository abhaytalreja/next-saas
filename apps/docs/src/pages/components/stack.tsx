import { Stack } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'

const BasicExample = () => {
  return (
    <Stack gap={4}>
      <div className="bg-blue-100 p-4 rounded">Item 1</div>
      <div className="bg-green-100 p-4 rounded">Item 2</div>
      <div className="bg-yellow-100 p-4 rounded">Item 3</div>
      <div className="bg-red-100 p-4 rounded">Item 4</div>
    </Stack>
  )
}

const HorizontalExample = () => {
  return (
    <Stack direction="horizontal" gap={4}>
      <div className="bg-blue-100 p-4 rounded">Item 1</div>
      <div className="bg-green-100 p-4 rounded">Item 2</div>
      <div className="bg-yellow-100 p-4 rounded">Item 3</div>
      <div className="bg-red-100 p-4 rounded">Item 4</div>
    </Stack>
  )
}

const GapExample = () => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Small Gap (2)</h4>
        <Stack gap={2}>
          <div className="bg-blue-100 p-4 rounded">Item 1</div>
          <div className="bg-green-100 p-4 rounded">Item 2</div>
          <div className="bg-yellow-100 p-4 rounded">Item 3</div>
        </Stack>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Large Gap (8)</h4>
        <Stack gap={8}>
          <div className="bg-blue-100 p-4 rounded">Item 1</div>
          <div className="bg-green-100 p-4 rounded">Item 2</div>
          <div className="bg-yellow-100 p-4 rounded">Item 3</div>
        </Stack>
      </div>
    </div>
  )
}

const AlignmentExample = () => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Left Aligned (Default)</h4>
        <Stack align="start" className="border border-dashed border-gray-300 p-4">
          <div className="bg-blue-100 p-2 rounded w-20">Short</div>
          <div className="bg-green-100 p-2 rounded w-32">Medium Width</div>
          <div className="bg-yellow-100 p-2 rounded w-48">Much Longer Content</div>
        </Stack>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Center Aligned</h4>
        <Stack align="center" className="border border-dashed border-gray-300 p-4">
          <div className="bg-blue-100 p-2 rounded w-20">Short</div>
          <div className="bg-green-100 p-2 rounded w-32">Medium Width</div>
          <div className="bg-yellow-100 p-2 rounded w-48">Much Longer Content</div>
        </Stack>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Right Aligned</h4>
        <Stack align="end" className="border border-dashed border-gray-300 p-4">
          <div className="bg-blue-100 p-2 rounded w-20">Short</div>
          <div className="bg-green-100 p-2 rounded w-32">Medium Width</div>
          <div className="bg-yellow-100 p-2 rounded w-48">Much Longer Content</div>
        </Stack>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Stretched</h4>
        <Stack align="stretch" className="border border-dashed border-gray-300 p-4">
          <div className="bg-blue-100 p-2 rounded">Stretched Item 1</div>
          <div className="bg-green-100 p-2 rounded">Stretched Item 2</div>
          <div className="bg-yellow-100 p-2 rounded">Stretched Item 3</div>
        </Stack>
      </div>
    </div>
  )
}

const JustifyExample = () => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Space Between</h4>
        <Stack direction="horizontal" justify="between" className="border border-dashed border-gray-300 p-4 h-20">
          <div className="bg-blue-100 p-2 rounded">Start</div>
          <div className="bg-green-100 p-2 rounded">Middle</div>
          <div className="bg-yellow-100 p-2 rounded">End</div>
        </Stack>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Space Around</h4>
        <Stack direction="horizontal" justify="around" className="border border-dashed border-gray-300 p-4 h-20">
          <div className="bg-blue-100 p-2 rounded">Item 1</div>
          <div className="bg-green-100 p-2 rounded">Item 2</div>
          <div className="bg-yellow-100 p-2 rounded">Item 3</div>
        </Stack>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Center Justified</h4>
        <Stack direction="horizontal" justify="center" className="border border-dashed border-gray-300 p-4 h-20">
          <div className="bg-blue-100 p-2 rounded">Item 1</div>
          <div className="bg-green-100 p-2 rounded">Item 2</div>
          <div className="bg-yellow-100 p-2 rounded">Item 3</div>
        </Stack>
      </div>
    </div>
  )
}

const ResponsiveExample = () => {
  return (
    <Stack 
      direction={{ xs: 'vertical', md: 'horizontal' }}
      gap={{ xs: 2, md: 4 }}
      align={{ xs: 'stretch', md: 'center' }}
    >
      <div className="bg-blue-100 p-4 rounded">Responsive Item 1</div>
      <div className="bg-green-100 p-4 rounded">Responsive Item 2</div>
      <div className="bg-yellow-100 p-4 rounded">Responsive Item 3</div>
    </Stack>
  )
}

const NestedExample = () => {
  return (
    <Stack gap={6} className="bg-gray-50 p-6 rounded-lg">
      <div>
        <h3 className="font-medium mb-4">Nested Stack Example</h3>
        <Stack direction="horizontal" gap={4}>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Vertical Stack</h4>
            <Stack gap={2}>
              <div className="bg-blue-100 p-2 rounded text-sm">Item A</div>
              <div className="bg-blue-200 p-2 rounded text-sm">Item B</div>
              <div className="bg-blue-300 p-2 rounded text-sm">Item C</div>
            </Stack>
          </div>
          
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Another Vertical Stack</h4>
            <Stack gap={2}>
              <div className="bg-green-100 p-2 rounded text-sm">Item X</div>
              <div className="bg-green-200 p-2 rounded text-sm">Item Y</div>
              <div className="bg-green-300 p-2 rounded text-sm">Item Z</div>
            </Stack>
          </div>
        </Stack>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Horizontal Stack Below</h4>
        <Stack direction="horizontal" gap={2}>
          <div className="bg-yellow-100 p-2 rounded text-sm">H1</div>
          <div className="bg-yellow-200 p-2 rounded text-sm">H2</div>
          <div className="bg-yellow-300 p-2 rounded text-sm">H3</div>
          <div className="bg-yellow-400 p-2 rounded text-sm">H4</div>
        </Stack>
      </div>
    </Stack>
  )
}

const examples = [
  {
    title: 'Basic Vertical Stack',
    code: `<Stack gap={4}>
  <div className="bg-blue-100 p-4 rounded">Item 1</div>
  <div className="bg-green-100 p-4 rounded">Item 2</div>
  <div className="bg-yellow-100 p-4 rounded">Item 3</div>
  <div className="bg-red-100 p-4 rounded">Item 4</div>
</Stack>`,
    component: <BasicExample />,
  },
  {
    title: 'Horizontal Stack',
    code: `<Stack direction="horizontal" gap={4}>
  <div className="bg-blue-100 p-4 rounded">Item 1</div>
  <div className="bg-green-100 p-4 rounded">Item 2</div>
  <div className="bg-yellow-100 p-4 rounded">Item 3</div>
  <div className="bg-red-100 p-4 rounded">Item 4</div>
</Stack>`,
    component: <HorizontalExample />,
  },
  {
    title: 'Different Gap Sizes',
    code: `<Stack gap={2}>
  <div className="bg-blue-100 p-4 rounded">Small Gap</div>
  <div className="bg-green-100 p-4 rounded">Between Items</div>
</Stack>

<Stack gap={8}>
  <div className="bg-blue-100 p-4 rounded">Large Gap</div>
  <div className="bg-green-100 p-4 rounded">Between Items</div>
</Stack>`,
    component: <GapExample />,
  },
  {
    title: 'Alignment Options',
    code: `<Stack align="start">
  <div className="bg-blue-100 p-2 rounded w-20">Short</div>
  <div className="bg-green-100 p-2 rounded w-48">Much Longer Content</div>
</Stack>

<Stack align="center">
  <div className="bg-blue-100 p-2 rounded w-20">Short</div>
  <div className="bg-green-100 p-2 rounded w-48">Much Longer Content</div>
</Stack>

<Stack align="stretch">
  <div className="bg-blue-100 p-2 rounded">Stretched Item 1</div>
  <div className="bg-green-100 p-2 rounded">Stretched Item 2</div>
</Stack>`,
    component: <AlignmentExample />,
  },
  {
    title: 'Justify Content',
    code: `<Stack direction="horizontal" justify="between" className="h-20">
  <div className="bg-blue-100 p-2 rounded">Start</div>
  <div className="bg-green-100 p-2 rounded">Middle</div>
  <div className="bg-yellow-100 p-2 rounded">End</div>
</Stack>

<Stack direction="horizontal" justify="center" className="h-20">
  <div className="bg-blue-100 p-2 rounded">Item 1</div>
  <div className="bg-green-100 p-2 rounded">Item 2</div>
</Stack>`,
    component: <JustifyExample />,
  },
  {
    title: 'Responsive Stack',
    code: `<Stack 
  direction={{ xs: 'vertical', md: 'horizontal' }}
  gap={{ xs: 2, md: 4 }}
  align={{ xs: 'stretch', md: 'center' }}
>
  <div className="bg-blue-100 p-4 rounded">Responsive Item 1</div>
  <div className="bg-green-100 p-4 rounded">Responsive Item 2</div>
  <div className="bg-yellow-100 p-4 rounded">Responsive Item 3</div>
</Stack>`,
    component: <ResponsiveExample />,
  },
  {
    title: 'Nested Stacks',
    code: `<Stack gap={6}>
  <Stack direction="horizontal" gap={4}>
    <div className="flex-1">
      <Stack gap={2}>
        <div className="bg-blue-100 p-2 rounded">Item A</div>
        <div className="bg-blue-200 p-2 rounded">Item B</div>
      </Stack>
    </div>
    <div className="flex-1">
      <Stack gap={2}>
        <div className="bg-green-100 p-2 rounded">Item X</div>
        <div className="bg-green-200 p-2 rounded">Item Y</div>
      </Stack>
    </div>
  </Stack>
  
  <Stack direction="horizontal" gap={2}>
    <div className="bg-yellow-100 p-2 rounded">H1</div>
    <div className="bg-yellow-200 p-2 rounded">H2</div>
  </Stack>
</Stack>`,
    component: <NestedExample />,
  },
]

export default function StackPage() {
  return (
    <ComponentLayout
      title="Stack"
      description="A flexible layout component for arranging items in vertical or horizontal stacks with consistent spacing, alignment, and responsive behavior."
      examples={examples}
    />
  )
}