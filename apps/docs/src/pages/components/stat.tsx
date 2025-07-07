import { Stat } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { TrendingUp, TrendingDown, Users, DollarSign, ShoppingCart, Eye, ArrowUp, ArrowDown } from 'lucide-react'

const BasicExample = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat
        label="Total Users"
        value="1,234"
      />
      <Stat
        label="Revenue"
        value="$45,678"
      />
      <Stat
        label="Orders"
        value="892"
      />
      <Stat
        label="Conversion Rate"
        value="3.24%"
      />
    </div>
  )
}

const WithIconsExample = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat
        label="Total Users"
        value="1,234"
        icon={Users}
      />
      <Stat
        label="Revenue"
        value="$45,678"
        icon={DollarSign}
      />
      <Stat
        label="Orders"
        value="892"
        icon={ShoppingCart}
      />
      <Stat
        label="Page Views"
        value="12.5K"
        icon={Eye}
      />
    </div>
  )
}

const WithChangesExample = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat
        label="Total Users"
        value="1,234"
        icon={Users}
        change={{
          value: 12.5,
          type: 'increase',
          period: 'vs last month'
        }}
      />
      <Stat
        label="Revenue"
        value="$45,678"
        icon={DollarSign}
        change={{
          value: 8.2,
          type: 'increase',
          period: 'vs last month'
        }}
      />
      <Stat
        label="Bounce Rate"
        value="2.1%"
        icon={TrendingDown}
        change={{
          value: 1.4,
          type: 'decrease',
          period: 'vs last month'
        }}
      />
      <Stat
        label="Support Tickets"
        value="45"
        icon={Users}
        change={{
          value: 5.7,
          type: 'decrease',
          period: 'vs last week'
        }}
      />
    </div>
  )
}

const SizesExample = () => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Small</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            size="sm"
            label="Users"
            value="1.2K"
            icon={Users}
            change={{ value: 12.5, type: 'increase' }}
          />
          <Stat
            size="sm"
            label="Revenue"
            value="$45K"
            icon={DollarSign}
            change={{ value: 8.2, type: 'increase' }}
          />
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Medium (Default)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            size="md"
            label="Users"
            value="1,234"
            icon={Users}
            change={{ value: 12.5, type: 'increase' }}
          />
          <Stat
            size="md"
            label="Revenue"
            value="$45,678"
            icon={DollarSign}
            change={{ value: 8.2, type: 'increase' }}
          />
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Large</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Stat
            size="lg"
            label="Users"
            value="1,234"
            icon={Users}
            change={{ value: 12.5, type: 'increase' }}
          />
          <Stat
            size="lg"
            label="Revenue"
            value="$45,678"
            icon={DollarSign}
            change={{ value: 8.2, type: 'increase' }}
          />
        </div>
      </div>
    </div>
  )
}

const VariantsExample = () => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Default Variant</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            label="Users"
            value="1,234"
            icon={Users}
            change={{ value: 12.5, type: 'increase' }}
          />
          <Stat
            label="Revenue"
            value="$45,678"
            icon={DollarSign}
            change={{ value: 8.2, type: 'increase' }}
          />
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Card Variant</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            variant="card"
            label="Users"
            value="1,234"
            icon={Users}
            change={{ value: 12.5, type: 'increase' }}
          />
          <Stat
            variant="card"
            label="Revenue"
            value="$45,678"
            icon={DollarSign}
            change={{ value: 8.2, type: 'increase' }}
          />
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Outlined Variant</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            variant="outlined"
            label="Users"
            value="1,234"
            icon={Users}
            change={{ value: 12.5, type: 'increase' }}
          />
          <Stat
            variant="outlined"
            label="Revenue"
            value="$45,678"
            icon={DollarSign}
            change={{ value: 8.2, type: 'increase' }}
          />
        </div>
      </div>
    </div>
  )
}

const ColoredStatsExample = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat
        label="Active Users"
        value="1,234"
        icon={Users}
        change={{ value: 12.5, type: 'increase' }}
        color="blue"
      />
      <Stat
        label="Revenue"
        value="$45,678"
        icon={DollarSign}
        change={{ value: 8.2, type: 'increase' }}
        color="green"
      />
      <Stat
        label="Error Rate"
        value="0.5%"
        icon={TrendingDown}
        change={{ value: 2.1, type: 'decrease' }}
        color="red"
      />
      <Stat
        label="Performance"
        value="98.5%"
        icon={TrendingUp}
        change={{ value: 0.3, type: 'increase' }}
        color="purple"
      />
    </div>
  )
}

const CustomContentExample = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Stat
        label="Revenue Growth"
        value="$45,678"
        icon={DollarSign}
        change={{ value: 12.5, type: 'increase', period: 'vs last month' }}
        additionalContent={
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Target:</span>
              <span className="font-medium">$50,000</span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '91%' }}></div>
            </div>
            <div className="mt-1 text-xs text-gray-500">91% of target reached</div>
          </div>
        }
      />
      
      <Stat
        label="User Engagement"
        value="76.3%"
        icon={Users}
        change={{ value: 4.2, type: 'increase', period: 'vs last week' }}
        additionalContent={
          <div className="mt-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Daily</span>
                <span className="font-medium">45.2%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Weekly</span>
                <span className="font-medium">76.3%</span>
              </div>
            </div>
          </div>
        }
      />
      
      <Stat
        label="Server Health"
        value="99.9%"
        icon={TrendingUp}
        change={{ value: 0.1, type: 'increase', period: 'uptime' }}
        additionalContent={
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">CPU Usage:</span>
              <span className="font-medium text-green-600">23%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Memory:</span>
              <span className="font-medium text-yellow-600">67%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Disk:</span>
              <span className="font-medium text-green-600">45%</span>
            </div>
          </div>
        }
      />
    </div>
  )
}

const LoadingExample = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat
        label="Loading..."
        value="---"
        loading
      />
      <Stat
        label="Users"
        value="1,234"
        icon={Users}
        loading
      />
      <Stat
        label="Revenue"
        value="$45,678"
        icon={DollarSign}
        change={{ value: 8.2, type: 'increase' }}
        loading
      />
      <Stat
        label="Orders"
        value="892"
        icon={ShoppingCart}
        loading
      />
    </div>
  )
}

const examples = [
  {
    title: 'Basic Stats',
    code: `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <Stat
    label="Total Users"
    value="1,234"
  />
  <Stat
    label="Revenue"
    value="$45,678"
  />
  <Stat
    label="Orders"
    value="892"
  />
  <Stat
    label="Conversion Rate"
    value="3.24%"
  />
</div>`,
    component: <BasicExample />,
  },
  {
    title: 'With Icons',
    code: `import { Users, DollarSign, ShoppingCart, Eye } from 'lucide-react'

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <Stat
    label="Total Users"
    value="1,234"
    icon={Users}
  />
  <Stat
    label="Revenue"
    value="$45,678"
    icon={DollarSign}
  />
  <Stat
    label="Orders"
    value="892"
    icon={ShoppingCart}
  />
  <Stat
    label="Page Views"
    value="12.5K"
    icon={Eye}
  />
</div>`,
    component: <WithIconsExample />,
  },
  {
    title: 'With Change Indicators',
    code: `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <Stat
    label="Total Users"
    value="1,234"
    icon={Users}
    change={{
      value: 12.5,
      type: 'increase',
      period: 'vs last month'
    }}
  />
  <Stat
    label="Revenue"
    value="$45,678"
    icon={DollarSign}
    change={{
      value: 8.2,
      type: 'increase',
      period: 'vs last month'
    }}
  />
  <Stat
    label="Bounce Rate"
    value="2.1%"
    icon={TrendingDown}
    change={{
      value: 1.4,
      type: 'decrease',
      period: 'vs last month'
    }}
  />
</div>`,
    component: <WithChangesExample />,
  },
  {
    title: 'Different Sizes',
    code: `// Small size
<Stat
  size="sm"
  label="Users"
  value="1.2K"
  icon={Users}
  change={{ value: 12.5, type: 'increase' }}
/>

// Medium size (default)
<Stat
  size="md"
  label="Users"
  value="1,234"
  icon={Users}
  change={{ value: 12.5, type: 'increase' }}
/>

// Large size
<Stat
  size="lg"
  label="Users"
  value="1,234"
  icon={Users}
  change={{ value: 12.5, type: 'increase' }}
/>`,
    component: <SizesExample />,
  },
  {
    title: 'Stat Variants',
    code: `// Default variant
<Stat
  label="Users"
  value="1,234"
  icon={Users}
  change={{ value: 12.5, type: 'increase' }}
/>

// Card variant
<Stat
  variant="card"
  label="Users"
  value="1,234"
  icon={Users}
  change={{ value: 12.5, type: 'increase' }}
/>

// Outlined variant
<Stat
  variant="outlined"
  label="Users"
  value="1,234"
  icon={Users}
  change={{ value: 12.5, type: 'increase' }}
/>`,
    component: <VariantsExample />,
  },
  {
    title: 'Colored Stats',
    code: `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <Stat
    label="Active Users"
    value="1,234"
    icon={Users}
    change={{ value: 12.5, type: 'increase' }}
    color="blue"
  />
  <Stat
    label="Revenue"
    value="$45,678"
    icon={DollarSign}
    change={{ value: 8.2, type: 'increase' }}
    color="green"
  />
  <Stat
    label="Error Rate"
    value="0.5%"
    icon={TrendingDown}
    change={{ value: 2.1, type: 'decrease' }}
    color="red"
  />
  <Stat
    label="Performance"
    value="98.5%"
    icon={TrendingUp}
    change={{ value: 0.3, type: 'increase' }}
    color="purple"
  />
</div>`,
    component: <ColoredStatsExample />,
  },
  {
    title: 'Custom Additional Content',
    code: `<Stat
  label="Revenue Growth"
  value="$45,678"
  icon={DollarSign}
  change={{ value: 12.5, type: 'increase', period: 'vs last month' }}
  additionalContent={
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Target:</span>
        <span className="font-medium">$50,000</span>
      </div>
      <div className="mt-2 bg-gray-200 rounded-full h-2">
        <div className="bg-green-500 h-2 rounded-full" style={{ width: '91%' }}></div>
      </div>
      <div className="mt-1 text-xs text-gray-500">91% of target reached</div>
    </div>
  }
/>`,
    component: <CustomContentExample />,
  },
  {
    title: 'Loading State',
    code: `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <Stat
    label="Loading..."
    value="---"
    loading
  />
  <Stat
    label="Users"
    value="1,234"
    icon={Users}
    loading
  />
  <Stat
    label="Revenue"
    value="$45,678"
    icon={DollarSign}
    change={{ value: 8.2, type: 'increase' }}
    loading
  />
</div>`,
    component: <LoadingExample />,
  },
]

export default function StatPage() {
  return (
    <ComponentLayout
      title="Stat"
      description="A statistics display component for showcasing key metrics and KPIs with support for icons, change indicators, and custom content."
      examples={examples}
    />
  )
}