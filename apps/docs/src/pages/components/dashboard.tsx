import { Dashboard } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { BarChart3, TrendingUp, Users, DollarSign, Activity, Download, RefreshCw } from 'lucide-react'

const sampleMetrics = [
  {
    id: 'revenue',
    title: 'Total Revenue',
    value: '$45,231',
    change: {
      value: 12.5,
      type: 'positive' as const,
      period: 'last month',
    },
    icon: DollarSign,
    description: 'Revenue from all sources',
  },
  {
    id: 'users',
    title: 'Active Users',
    value: '2,150',
    change: {
      value: 8.2,
      type: 'positive' as const,
      period: 'last week',
    },
    icon: Users,
    description: 'Users active in the last 30 days',
  },
  {
    id: 'conversion',
    title: 'Conversion Rate',
    value: '3.24%',
    change: {
      value: 2.1,
      type: 'negative' as const,
      period: 'last month',
    },
    icon: TrendingUp,
    description: 'Percentage of visitors who convert',
  },
  {
    id: 'activity',
    title: 'System Health',
    value: '99.9%',
    change: {
      value: 0.1,
      type: 'positive' as const,
      period: 'last day',
    },
    icon: Activity,
    description: 'System uptime percentage',
  },
]

const sampleCharts = [
  {
    id: 'revenue-chart',
    title: 'Revenue Overview',
    type: 'line' as const,
    data: [],
    description: 'Monthly revenue trends',
    height: 300,
  },
  {
    id: 'user-growth',
    title: 'User Growth',
    type: 'bar' as const,
    data: [],
    description: 'New user registrations',
    height: 300,
  },
]

const sampleActivities = [
  {
    id: '1',
    title: 'New user registered',
    description: 'john.doe@example.com joined the platform',
    timestamp: new Date('2024-01-16T10:30:00'),
    type: 'user' as const,
  },
  {
    id: '2',
    title: 'Payment processed',
    description: '$299 payment from Acme Corp',
    timestamp: new Date('2024-01-16T09:15:00'),
    type: 'success' as const,
  },
  {
    id: '3',
    title: 'System maintenance',
    description: 'Scheduled maintenance completed successfully',
    timestamp: new Date('2024-01-16T08:00:00'),
    type: 'system' as const,
  },
  {
    id: '4',
    title: 'High CPU usage detected',
    description: 'Server load exceeded 80% threshold',
    timestamp: new Date('2024-01-16T07:45:00'),
    type: 'warning' as const,
  },
]

const quickActions = [
  {
    id: 'add-user',
    label: 'Add User',
    icon: Users,
    onClick: () => console.log('Add user clicked'),
    variant: 'primary' as const,
  },
  {
    id: 'export-data',
    label: 'Export',
    icon: Download,
    onClick: () => console.log('Export clicked'),
    variant: 'outline' as const,
  },
]

const BasicExample = () => {
  return (
    <Dashboard
      title="Analytics Dashboard"
      subtitle="Overview of your key metrics and recent activity"
      metrics={sampleMetrics}
    />
  )
}

const WithChartsExample = () => {
  return (
    <Dashboard
      title="Performance Dashboard"
      metrics={sampleMetrics.slice(0, 2)}
      charts={sampleCharts}
      layout="compact"
    />
  )
}

const WithActivityExample = () => {
  return (
    <Dashboard
      title="Activity Dashboard"
      metrics={sampleMetrics.slice(0, 3)}
      activities={sampleActivities}
    />
  )
}

const FullDashboardExample = () => {
  const handleRefresh = () => {
    console.log('Refreshing dashboard data...')
    return new Promise(resolve => setTimeout(resolve, 1000))
  }

  return (
    <Dashboard
      title="Complete Dashboard"
      subtitle="Full featured dashboard with all components"
      metrics={sampleMetrics}
      charts={sampleCharts}
      activities={sampleActivities}
      quickActions={quickActions}
      onRefresh={handleRefresh}
      customWidgets={
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Custom Widget</h3>
          <p className="text-muted-foreground">
            This is a custom widget that can contain any content.
          </p>
        </div>
      }
    />
  )
}

const LoadingExample = () => {
  return (
    <Dashboard
      title="Loading Dashboard"
      metrics={sampleMetrics}
      activities={sampleActivities}
      loading={true}
    />
  )
}

const examples = [
  {
    title: 'Basic Dashboard',
    code: `const metrics = [
  {
    id: 'revenue',
    title: 'Total Revenue',
    value: '$45,231',
    change: {
      value: 12.5,
      type: 'positive',
      period: 'last month',
    },
    icon: DollarSign,
  },
  // ... more metrics
]

<Dashboard
  title="Analytics Dashboard"
  subtitle="Overview of your key metrics"
  metrics={metrics}
/>`,
    component: <BasicExample />,
  },
  {
    title: 'With Charts',
    code: `const charts = [
  {
    id: 'revenue-chart',
    title: 'Revenue Overview',
    type: 'line',
    data: [],
    height: 300,
  },
  // ... more charts
]

<Dashboard
  title="Performance Dashboard"
  metrics={metrics}
  charts={charts}
  layout="compact"
/>`,
    component: <WithChartsExample />,
  },
  {
    title: 'With Activity Feed',
    code: `const activities = [
  {
    id: '1',
    title: 'New user registered',
    description: 'john.doe@example.com joined',
    timestamp: new Date(),
    type: 'user',
  },
  // ... more activities
]

<Dashboard
  title="Activity Dashboard"
  metrics={metrics}
  activities={activities}
/>`,
    component: <WithActivityExample />,
  },
  {
    title: 'Full Featured Dashboard',
    code: `const quickActions = [
  {
    id: 'add-user',
    label: 'Add User',
    icon: Users,
    onClick: () => console.log('Add user'),
    variant: 'primary',
  },
]

<Dashboard
  title="Complete Dashboard"
  subtitle="Full featured dashboard"
  metrics={metrics}
  charts={charts}
  activities={activities}
  quickActions={quickActions}
  onRefresh={handleRefresh}
  customWidgets={<CustomWidget />}
/>`,
    component: <FullDashboardExample />,
  },
  {
    title: 'Loading State',
    code: `<Dashboard
  title="Loading Dashboard"
  metrics={metrics}
  activities={activities}
  loading={true}
/>`,
    component: <LoadingExample />,
  },
]

export default function DashboardPage() {
  return (
    <ComponentLayout
      title="Dashboard"
      description="A comprehensive dashboard component with metrics, charts, activity feeds, and customizable widgets for data visualization."
      examples={examples}
    />
  )
}