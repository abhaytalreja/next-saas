'use client'

import React, { useState } from 'react'
import { BarChart, RefreshCw, Download, TrendingUp } from 'lucide-react'
import { useAnalytics } from '../../hooks/useAnalytics'
import { UserGrowthChart } from './UserGrowthChart'
import { RevenueChart } from './RevenueChart'
import { EngagementChart } from './EngagementChart'
import { ConversionFunnel } from './ConversionFunnel'
import { DateRangePicker, DateRange } from './DateRangePicker'
import { MetricsTable } from './MetricsTable'
import { Button, Card, CardContent } from '@nextsaas/ui'

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last 30 days'
  })

  const { data, isLoading, error, refetch } = useAnalytics()

  // Mock data for demonstration - replace with real data from analytics hook
  const mockUserGrowthData = [
    { date: '2024-01-01', value: 1000 },
    { date: '2024-01-02', value: 1050 },
    { date: '2024-01-03', value: 1100 },
    { date: '2024-01-04', value: 1180 },
    { date: '2024-01-05', value: 1250 },
    { date: '2024-01-06', value: 1320 },
    { date: '2024-01-07', value: 1400 },
  ]

  const mockRevenueData = [
    { date: '2024-01-01', value: 15000 },
    { date: '2024-01-02', value: 15500 },
    { date: '2024-01-03', value: 16200 },
    { date: '2024-01-04', value: 17100 },
    { date: '2024-01-05', value: 18000 },
    { date: '2024-01-06', value: 18800 },
    { date: '2024-01-07', value: 19500 },
  ]

  const mockEngagementData = [
    { date: '2024-01-01', value: 250, pageViews: 1200, sessionDuration: 180, bounceRate: 45 },
    { date: '2024-01-02', value: 280, pageViews: 1350, sessionDuration: 195, bounceRate: 42 },
    { date: '2024-01-03', value: 320, pageViews: 1500, sessionDuration: 210, bounceRate: 38 },
    { date: '2024-01-04', value: 350, pageViews: 1650, sessionDuration: 225, bounceRate: 35 },
    { date: '2024-01-05', value: 380, pageViews: 1800, sessionDuration: 240, bounceRate: 32 },
    { date: '2024-01-06', value: 420, pageViews: 1950, sessionDuration: 255, bounceRate: 30 },
    { date: '2024-01-07', value: 450, pageViews: 2100, sessionDuration: 270, bounceRate: 28 },
  ]

  const mockFunnelData = [
    { name: 'Visitors', value: 10000, description: 'Unique website visitors' },
    { name: 'Sign-ups', value: 1200, description: 'Created accounts' },
    { name: 'Email Verified', value: 900, description: 'Verified email addresses' },
    { name: 'Activated', value: 600, description: 'Completed onboarding' },
    { name: 'Paid Users', value: 180, description: 'Upgraded to paid plan' },
  ]

  const mockMetricsData = [
    {
      id: '1',
      metric: 'Monthly Active Users',
      current: 1400,
      previous: 1250,
      change: 12,
      trend: 'up' as const,
      category: 'Users',
      format: 'number' as const,
      description: 'Users active in the last 30 days'
    },
    {
      id: '2',
      metric: 'Monthly Recurring Revenue',
      current: 19500,
      previous: 18000,
      change: 8.3,
      trend: 'up' as const,
      category: 'Revenue',
      format: 'currency' as const,
      description: 'Recurring revenue from subscriptions'
    },
    {
      id: '3',
      metric: 'Customer Acquisition Cost',
      current: 45,
      previous: 52,
      change: -13.5,
      trend: 'down' as const,
      category: 'Marketing',
      format: 'currency' as const,
      description: 'Average cost to acquire a new customer'
    },
    {
      id: '4',
      metric: 'Churn Rate',
      current: 3.2,
      previous: 4.1,
      change: -22,
      trend: 'down' as const,
      category: 'Retention',
      format: 'percentage' as const,
      description: 'Monthly customer churn rate'
    },
    {
      id: '5',
      metric: 'Average Session Duration',
      current: 270,
      previous: 240,
      change: 12.5,
      trend: 'up' as const,
      category: 'Engagement',
      format: 'duration' as const,
      description: 'Average time users spend per session'
    },
    {
      id: '6',
      metric: 'Conversion Rate',
      current: 1.8,
      previous: 1.5,
      change: 20,
      trend: 'up' as const,
      category: 'Marketing',
      format: 'percentage' as const,
      description: 'Visitor to paid customer conversion rate'
    }
  ]

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting analytics data...')
  }

  const handleRefresh = () => {
    refetch()
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading analytics
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {error.message}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart className="h-8 w-8 text-blue-600" />
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Comprehensive analytics and insights for your platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '---' : '1,400'}
                </p>
              </div>
              <div className="flex items-center text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">+12%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '---' : '$19,500'}
                </p>
              </div>
              <div className="flex items-center text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">+8.3%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '---' : '1.8%'}
                </p>
              </div>
              <div className="flex items-center text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">+20%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '---' : '3.2%'}
                </p>
              </div>
              <div className="flex items-center text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">-22%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserGrowthChart
          data={mockUserGrowthData}
          loading={isLoading}
          period={dateRange.label}
        />
        
        <RevenueChart
          data={mockRevenueData}
          loading={isLoading}
          period={dateRange.label}
          target={25000}
          showMRR={true}
        />
      </div>

      {/* Engagement and Conversion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EngagementChart
          data={mockEngagementData}
          loading={isLoading}
          period={dateRange.label}
          metric="sessions"
        />
        
        <ConversionFunnel
          steps={mockFunnelData}
          loading={isLoading}
          title="User Acquisition Funnel"
          showConversionRates={true}
        />
      </div>

      {/* Detailed Metrics Table */}
      <MetricsTable
        data={mockMetricsData}
        loading={isLoading}
        title="Detailed Analytics"
        showExport={true}
        showFilters={true}
        onExport={handleExport}
      />
    </div>
  )
}