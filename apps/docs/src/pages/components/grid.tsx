import { Grid } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'

const BasicExample = () => {
  return (
    <Grid cols={3} gap={4}>
      <div className="bg-blue-100 p-4 rounded">Item 1</div>
      <div className="bg-green-100 p-4 rounded">Item 2</div>
      <div className="bg-yellow-100 p-4 rounded">Item 3</div>
      <div className="bg-red-100 p-4 rounded">Item 4</div>
      <div className="bg-purple-100 p-4 rounded">Item 5</div>
      <div className="bg-pink-100 p-4 rounded">Item 6</div>
    </Grid>
  )
}

const ResponsiveExample = () => {
  return (
    <Grid 
      cols={{
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
        xl: 6
      }}
      gap={4}
    >
      <div className="bg-blue-100 p-4 rounded text-center">1</div>
      <div className="bg-green-100 p-4 rounded text-center">2</div>
      <div className="bg-yellow-100 p-4 rounded text-center">3</div>
      <div className="bg-red-100 p-4 rounded text-center">4</div>
      <div className="bg-purple-100 p-4 rounded text-center">5</div>
      <div className="bg-pink-100 p-4 rounded text-center">6</div>
    </Grid>
  )
}

const GapExample = () => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Small Gap (2)</h4>
        <Grid cols={3} gap={2}>
          <div className="bg-blue-100 p-4 rounded">Item 1</div>
          <div className="bg-green-100 p-4 rounded">Item 2</div>
          <div className="bg-yellow-100 p-4 rounded">Item 3</div>
        </Grid>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Large Gap (8)</h4>
        <Grid cols={3} gap={8}>
          <div className="bg-blue-100 p-4 rounded">Item 1</div>
          <div className="bg-green-100 p-4 rounded">Item 2</div>
          <div className="bg-yellow-100 p-4 rounded">Item 3</div>
        </Grid>
      </div>
    </div>
  )
}

const SpanExample = () => {
  return (
    <Grid cols={4} gap={4}>
      <div className="bg-blue-100 p-4 rounded col-span-2">Spans 2 columns</div>
      <div className="bg-green-100 p-4 rounded">Normal</div>
      <div className="bg-yellow-100 p-4 rounded">Normal</div>
      <div className="bg-red-100 p-4 rounded">Normal</div>
      <div className="bg-purple-100 p-4 rounded col-span-3">Spans 3 columns</div>
      <div className="bg-pink-100 p-4 rounded col-span-4">Spans all 4 columns</div>
    </Grid>
  )
}

const AutoFitExample = () => {
  return (
    <Grid autoFit minColWidth="200px" gap={4}>
      <div className="bg-blue-100 p-4 rounded">Auto-fit Item 1</div>
      <div className="bg-green-100 p-4 rounded">Auto-fit Item 2</div>
      <div className="bg-yellow-100 p-4 rounded">Auto-fit Item 3</div>
      <div className="bg-red-100 p-4 rounded">Auto-fit Item 4</div>
      <div className="bg-purple-100 p-4 rounded">Auto-fit Item 5</div>
    </Grid>
  )
}

const NestedExample = () => {
  return (
    <Grid cols={2} gap={4}>
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-medium mb-3">Nested Grid</h3>
        <Grid cols={2} gap={2}>
          <div className="bg-blue-100 p-2 rounded text-sm">A</div>
          <div className="bg-green-100 p-2 rounded text-sm">B</div>
          <div className="bg-yellow-100 p-2 rounded text-sm">C</div>
          <div className="bg-red-100 p-2 rounded text-sm">D</div>
        </Grid>
      </div>
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-medium mb-3">Another Section</h3>
        <p className="text-sm text-gray-600">This is a regular content area alongside the nested grid.</p>
      </div>
    </Grid>
  )
}

const AlignmentExample = () => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Center Alignment</h4>
        <Grid cols={3} gap={4} align="center" className="min-h-32">
          <div className="bg-blue-100 p-4 rounded">Center</div>
          <div className="bg-green-100 p-4 rounded">Aligned</div>
          <div className="bg-yellow-100 p-4 rounded">Items</div>
        </Grid>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">End Alignment</h4>
        <Grid cols={3} gap={4} align="end" className="min-h-32">
          <div className="bg-blue-100 p-4 rounded">End</div>
          <div className="bg-green-100 p-4 rounded">Aligned</div>
          <div className="bg-yellow-100 p-4 rounded">Items</div>
        </Grid>
      </div>
    </div>
  )
}

const examples = [
  {
    title: 'Basic Grid',
    code: `<Grid cols={3} gap={4}>
  <div className="bg-blue-100 p-4 rounded">Item 1</div>
  <div className="bg-green-100 p-4 rounded">Item 2</div>
  <div className="bg-yellow-100 p-4 rounded">Item 3</div>
  <div className="bg-red-100 p-4 rounded">Item 4</div>
  <div className="bg-purple-100 p-4 rounded">Item 5</div>
  <div className="bg-pink-100 p-4 rounded">Item 6</div>
</Grid>`,
    component: <BasicExample />,
  },
  {
    title: 'Responsive Grid',
    code: `<Grid 
  cols={{
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 6
  }}
  gap={4}
>
  <div className="bg-blue-100 p-4 rounded text-center">1</div>
  <div className="bg-green-100 p-4 rounded text-center">2</div>
  <div className="bg-yellow-100 p-4 rounded text-center">3</div>
  <div className="bg-red-100 p-4 rounded text-center">4</div>
  <div className="bg-purple-100 p-4 rounded text-center">5</div>
  <div className="bg-pink-100 p-4 rounded text-center">6</div>
</Grid>`,
    component: <ResponsiveExample />,
  },
  {
    title: 'Different Gap Sizes',
    code: `<div className="space-y-6">
  <Grid cols={3} gap={2}>
    <div className="bg-blue-100 p-4 rounded">Small Gap</div>
    <div className="bg-green-100 p-4 rounded">Items</div>
    <div className="bg-yellow-100 p-4 rounded">Closer</div>
  </Grid>
  
  <Grid cols={3} gap={8}>
    <div className="bg-blue-100 p-4 rounded">Large Gap</div>
    <div className="bg-green-100 p-4 rounded">Items</div>
    <div className="bg-yellow-100 p-4 rounded">Spaced</div>
  </Grid>
</div>`,
    component: <GapExample />,
  },
  {
    title: 'Column Spanning',
    code: `<Grid cols={4} gap={4}>
  <div className="bg-blue-100 p-4 rounded col-span-2">Spans 2 columns</div>
  <div className="bg-green-100 p-4 rounded">Normal</div>
  <div className="bg-yellow-100 p-4 rounded">Normal</div>
  <div className="bg-red-100 p-4 rounded">Normal</div>
  <div className="bg-purple-100 p-4 rounded col-span-3">Spans 3 columns</div>
  <div className="bg-pink-100 p-4 rounded col-span-4">Spans all 4 columns</div>
</Grid>`,
    component: <SpanExample />,
  },
  {
    title: 'Auto-Fit Grid',
    code: `<Grid autoFit minColWidth="200px" gap={4}>
  <div className="bg-blue-100 p-4 rounded">Auto-fit Item 1</div>
  <div className="bg-green-100 p-4 rounded">Auto-fit Item 2</div>
  <div className="bg-yellow-100 p-4 rounded">Auto-fit Item 3</div>
  <div className="bg-red-100 p-4 rounded">Auto-fit Item 4</div>
  <div className="bg-purple-100 p-4 rounded">Auto-fit Item 5</div>
</Grid>`,
    component: <AutoFitExample />,
  },
  {
    title: 'Nested Grids',
    code: `<Grid cols={2} gap={4}>
  <div className="bg-gray-100 p-4 rounded">
    <h3 className="font-medium mb-3">Nested Grid</h3>
    <Grid cols={2} gap={2}>
      <div className="bg-blue-100 p-2 rounded text-sm">A</div>
      <div className="bg-green-100 p-2 rounded text-sm">B</div>
      <div className="bg-yellow-100 p-2 rounded text-sm">C</div>
      <div className="bg-red-100 p-2 rounded text-sm">D</div>
    </Grid>
  </div>
  <div className="bg-gray-100 p-4 rounded">
    <h3 className="font-medium mb-3">Another Section</h3>
    <p className="text-sm text-gray-600">Regular content area</p>
  </div>
</Grid>`,
    component: <NestedExample />,
  },
  {
    title: 'Grid Alignment',
    code: `<Grid cols={3} gap={4} align="center" className="min-h-32">
  <div className="bg-blue-100 p-4 rounded">Center</div>
  <div className="bg-green-100 p-4 rounded">Aligned</div>
  <div className="bg-yellow-100 p-4 rounded">Items</div>
</Grid>

<Grid cols={3} gap={4} align="end" className="min-h-32">
  <div className="bg-blue-100 p-4 rounded">End</div>
  <div className="bg-green-100 p-4 rounded">Aligned</div>
  <div className="bg-yellow-100 p-4 rounded">Items</div>
</Grid>`,
    component: <AlignmentExample />,
  },
]

export default function GridPage() {
  return (
    <ComponentLayout
      title="Grid"
      description="A powerful CSS Grid layout component with responsive breakpoints, auto-fit capabilities, and flexible column configurations."
      examples={examples}
    />
  )
}