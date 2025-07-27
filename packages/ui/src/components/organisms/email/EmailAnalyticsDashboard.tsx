'use client'

import React from 'react'
import { cn } from '../../../lib/utils'
import { Card } from '../../../molecules/cards/Card'
import { Heading } from '../../../atoms/typography/Heading'
import { Text } from '../../../atoms/typography/Text'
import { Badge } from '../../../atoms/badges/Badge'
import { Button } from '../../../atoms/buttons/Button'

export interface EmailAnalyticsData {
  totalSent: number
  totalDelivered: number
  totalOpened: number
  totalClicked: number
  totalBounced: number
  totalUnsubscribed: number
  totalComplaints: number

  // Calculated rates
  deliveryRate: number
  openRate: number
  clickRate: number
  clickToOpenRate: number
  bounceRate: number
  unsubscribeRate: number
  complaintRate: number

  // Trend data
  trendData: Array<{
    date: string
    sent: number
    opened: number
    clicked: number
    delivered: number
  }>

  // Top performing campaigns
  topCampaigns: Array<{
    id: string
    name: string
    openRate: number
    clickRate: number
    sent: number
  }>

  // Device breakdown
  deviceBreakdown: Array<{
    device: string
    percentage: number
    count: number
  }>

  // Location breakdown
  locationBreakdown: Array<{
    location: string
    percentage: number
    count: number
  }>

  // Time period
  dateRange: {
    start: Date
    end: Date
  }
}

export interface EmailAnalyticsDashboardProps {
  data: EmailAnalyticsData
  loading?: boolean
  onDateRangeChange?: (start: Date, end: Date) => void
  onExportData?: () => void
  onViewCampaign?: (campaignId: string) => void
  className?: string
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

const formatPercentage = (rate: number): string => {
  return `${rate.toFixed(1)}%`
}

const getRateColor = (
  rate: number,
  thresholds: { good: number; ok: number }
): string => {
  if (rate >= thresholds.good) return 'text-green-600'
  if (rate >= thresholds.ok) return 'text-yellow-600'
  return 'text-red-600'
}

export const EmailAnalyticsDashboard: React.FC<
  EmailAnalyticsDashboardProps
> = ({
  data,
  loading = false,
  onDateRangeChange,
  onExportData,
  onViewCampaign,
  className,
}) => {
  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Header skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>

        {/* Metrics skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h3" className="text-gray-900 mb-2">
            Email Analytics Dashboard
          </Heading>
          <Text className="text-gray-600">
            {data.dateRange.start.toLocaleDateString()} -{' '}
            {data.dateRange.end.toLocaleDateString()}
          </Text>
        </div>

        <div className="flex items-center space-x-4">
          {/* Date range selector would go here */}
          {onExportData && (
            <Button variant="outline" onClick={onExportData}>
              Export Data
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sent */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-sm font-medium text-gray-600">
                Total Sent
              </Text>
              <Heading level="h3" className="text-gray-900 mt-1">
                {formatNumber(data.totalSent)}
              </Heading>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </div>
          </div>
        </Card>

        {/* Delivery Rate */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-sm font-medium text-gray-600">
                Delivery Rate
              </Text>
              <Heading
                level="h3"
                className={cn(
                  'mt-1',
                  getRateColor(data.deliveryRate, { good: 95, ok: 90 })
                )}
              >
                {formatPercentage(data.deliveryRate)}
              </Heading>
              <Text className="text-xs text-gray-500">
                {formatNumber(data.totalDelivered)} delivered
              </Text>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>

        {/* Open Rate */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-sm font-medium text-gray-600">
                Open Rate
              </Text>
              <Heading
                level="h3"
                className={cn(
                  'mt-1',
                  getRateColor(data.openRate, { good: 25, ok: 20 })
                )}
              >
                {formatPercentage(data.openRate)}
              </Heading>
              <Text className="text-xs text-gray-500">
                {formatNumber(data.totalOpened)} opens
              </Text>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
          </div>
        </Card>

        {/* Click Rate */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-sm font-medium text-gray-600">
                Click Rate
              </Text>
              <Heading
                level="h3"
                className={cn(
                  'mt-1',
                  getRateColor(data.clickRate, { good: 3, ok: 2 })
                )}
              >
                {formatPercentage(data.clickRate)}
              </Heading>
              <Text className="text-xs text-gray-500">
                {formatNumber(data.totalClicked)} clicks
              </Text>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
            </div>
          </div>
        </Card>

        {/* Bounce Rate */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-sm font-medium text-gray-600">
                Bounce Rate
              </Text>
              <Heading
                level="h3"
                className={cn(
                  'mt-1',
                  getRateColor(5 - data.bounceRate, { good: 3, ok: 2 })
                )}
              >
                {formatPercentage(data.bounceRate)}
              </Heading>
              <Text className="text-xs text-gray-500">
                {formatNumber(data.totalBounced)} bounces
              </Text>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
        </Card>

        {/* Click-to-Open Rate */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-sm font-medium text-gray-600">
                Click-to-Open
              </Text>
              <Heading
                level="h3"
                className={cn(
                  'mt-1',
                  getRateColor(data.clickToOpenRate, { good: 15, ok: 10 })
                )}
              >
                {formatPercentage(data.clickToOpenRate)}
              </Heading>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
        </Card>

        {/* Unsubscribe Rate */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-sm font-medium text-gray-600">
                Unsubscribe Rate
              </Text>
              <Heading
                level="h3"
                className={cn(
                  'mt-1',
                  getRateColor(2 - data.unsubscribeRate, { good: 1.5, ok: 1 })
                )}
              >
                {formatPercentage(data.unsubscribeRate)}
              </Heading>
              <Text className="text-xs text-gray-500">
                {formatNumber(data.totalUnsubscribed)} unsubscribes
              </Text>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6z"
                />
              </svg>
            </div>
          </div>
        </Card>

        {/* Complaint Rate */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-sm font-medium text-gray-600">
                Complaint Rate
              </Text>
              <Heading
                level="h3"
                className={cn(
                  'mt-1',
                  getRateColor(0.5 - data.complaintRate, { good: 0.4, ok: 0.2 })
                )}
              >
                {formatPercentage(data.complaintRate)}
              </Heading>
              <Text className="text-xs text-gray-500">
                {formatNumber(data.totalComplaints)} complaints
              </Text>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart Placeholder */}
        <Card className="p-6">
          <Heading level="h4" className="text-gray-900 mb-4">
            Email Performance Trend
          </Heading>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <Text className="text-gray-500">Chart component would go here</Text>
          </div>
        </Card>

        {/* Top Campaigns */}
        <Card className="p-6">
          <Heading level="h4" className="text-gray-900 mb-4">
            Top Performing Campaigns
          </Heading>
          <div className="space-y-4">
            {data.topCampaigns.slice(0, 5).map((campaign, index) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <Text className="font-medium text-gray-900 truncate">
                    {campaign.name}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {formatNumber(campaign.sent)} sent
                  </Text>
                </div>
                <div className="flex items-center space-x-4 ml-4">
                  <div className="text-right">
                    <Text className="text-sm font-medium text-gray-900">
                      {formatPercentage(campaign.openRate)}
                    </Text>
                    <Text className="text-xs text-gray-500">Open Rate</Text>
                  </div>
                  <div className="text-right">
                    <Text className="text-sm font-medium text-gray-900">
                      {formatPercentage(campaign.clickRate)}
                    </Text>
                    <Text className="text-xs text-gray-500">Click Rate</Text>
                  </div>
                  {onViewCampaign && (
                    <Button
                      variant="ghost"
                      onClick={() => onViewCampaign(campaign.id)}
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Device and Location Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <Card className="p-6">
          <Heading level="h4" className="text-gray-900 mb-4">
            Device Breakdown
          </Heading>
          <div className="space-y-3">
            {data.deviceBreakdown.map((device, index) => (
              <div
                key={device.device}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                  <Text className="font-medium text-gray-900">
                    {device.device}
                  </Text>
                </div>
                <div className="flex items-center space-x-4">
                  <Text className="text-sm text-gray-600">
                    {formatNumber(device.count)}
                  </Text>
                  <Text className="font-medium text-gray-900 w-12 text-right">
                    {formatPercentage(device.percentage)}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Location Breakdown */}
        <Card className="p-6">
          <Heading level="h4" className="text-gray-900 mb-4">
            Top Locations
          </Heading>
          <div className="space-y-3">
            {data.locationBreakdown.slice(0, 5).map((location, index) => (
              <div
                key={location.location}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <Text className="font-medium text-gray-900">
                    {location.location}
                  </Text>
                </div>
                <div className="flex items-center space-x-4">
                  <Text className="text-sm text-gray-600">
                    {formatNumber(location.count)}
                  </Text>
                  <Text className="font-medium text-gray-900 w-12 text-right">
                    {formatPercentage(location.percentage)}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
