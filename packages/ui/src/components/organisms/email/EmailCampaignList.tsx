'use client'

import React from 'react'
import { cn } from '../../../lib/utils'
import { Button } from '../../../atoms/buttons/Button'
import { Badge } from '../../../atoms/badges/Badge'
import { Heading } from '../../../atoms/typography/Heading'
import { Text } from '../../../atoms/typography/Text'

export interface EmailCampaign {
  id: string
  name: string
  description?: string
  status:
    | 'draft'
    | 'scheduled'
    | 'running'
    | 'paused'
    | 'completed'
    | 'cancelled'
  type: 'one_time' | 'recurring' | 'triggered' | 'ab_test'
  audienceCount: number
  scheduledAt?: Date
  createdAt: Date
  metrics?: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    deliveryRate: number
    openRate: number
    clickRate: number
  }
}

export interface EmailCampaignListProps {
  campaigns: EmailCampaign[]
  loading?: boolean
  onCreateCampaign?: () => void
  onEditCampaign?: (campaignId: string) => void
  onDuplicateCampaign?: (campaignId: string) => void
  onDeleteCampaign?: (campaignId: string) => void
  onPauseCampaign?: (campaignId: string) => void
  onResumeCampaign?: (campaignId: string) => void
  onViewAnalytics?: (campaignId: string) => void
  className?: string
}

const getStatusColor = (status: EmailCampaign['status']) => {
  switch (status) {
    case 'draft':
      return 'secondary'
    case 'scheduled':
      return 'default'
    case 'running':
      return 'success'
    case 'paused':
      return 'warning'
    case 'completed':
      return 'success'
    case 'cancelled':
      return 'destructive'
    default:
      return 'secondary'
  }
}

const getTypeLabel = (type: EmailCampaign['type']) => {
  switch (type) {
    case 'one_time':
      return 'One-time'
    case 'recurring':
      return 'Recurring'
    case 'triggered':
      return 'Triggered'
    case 'ab_test':
      return 'A/B Test'
    default:
      return type
  }
}

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toString()
}

const formatPercentage = (rate: number): string => {
  return `${rate.toFixed(1)}%`
}

export const EmailCampaignList: React.FC<EmailCampaignListProps> = ({
  campaigns,
  loading = false,
  onCreateCampaign,
  onEditCampaign,
  onDuplicateCampaign,
  onDeleteCampaign,
  onPauseCampaign,
  onResumeCampaign,
  onViewAnalytics,
  className,
}) => {
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-6 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-48"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <Heading level="h3" className="text-gray-900 mb-2">
          No email campaigns yet
        </Heading>
        <Text className="text-gray-600 mb-6 max-w-md mx-auto">
          Create your first email campaign to start engaging with your audience
          and tracking performance.
        </Text>
        {onCreateCampaign && (
          <Button onClick={onCreateCampaign} variant="default">
            Create Campaign
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h3" className="text-gray-900">
            Email Campaigns
          </Heading>
          <Text className="text-gray-600 mt-1">
            Manage and track your email marketing campaigns
          </Text>
        </div>
        {onCreateCampaign && (
          <Button onClick={onCreateCampaign} variant="default">
            Create Campaign
          </Button>
        )}
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        {campaigns.map(campaign => (
          <div
            key={campaign.id}
            className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
          >
            {/* Campaign Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <Heading level="h4" className="text-gray-900 truncate">
                    {campaign.name}
                  </Heading>
                  <Badge variant={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                  <Badge variant="outline">{getTypeLabel(campaign.type)}</Badge>
                </div>
                {campaign.description && (
                  <Text className="text-gray-600 text-sm line-clamp-2">
                    {campaign.description}
                  </Text>
                )}
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>Audience: {formatNumber(campaign.audienceCount)}</span>
                  {campaign.scheduledAt && (
                    <span>
                      Scheduled: {campaign.scheduledAt.toLocaleDateString()}
                    </span>
                  )}
                  <span>
                    Created: {campaign.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                {onViewAnalytics && campaign.metrics && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewAnalytics(campaign.id)}
                  >
                    Analytics
                  </Button>
                )}

                {campaign.status === 'running' && onPauseCampaign && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPauseCampaign(campaign.id)}
                  >
                    Pause
                  </Button>
                )}

                {campaign.status === 'paused' && onResumeCampaign && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResumeCampaign(campaign.id)}
                  >
                    Resume
                  </Button>
                )}

                {onEditCampaign && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditCampaign(campaign.id)}
                  >
                    Edit
                  </Button>
                )}

                {/* Dropdown Menu */}
                <div className="relative">
                  <Button variant="ghost" size="sm" className="px-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </Button>
                  {/* Dropdown content would be implemented with a proper dropdown component */}
                </div>
              </div>
            </div>

            {/* Campaign Metrics */}
            {campaign.metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <Text className="text-xs text-gray-500 uppercase tracking-wide">
                    Sent
                  </Text>
                  <Text className="text-lg font-semibold text-gray-900 mt-1">
                    {formatNumber(campaign.metrics.sent)}
                  </Text>
                </div>

                <div className="text-center">
                  <Text className="text-xs text-gray-500 uppercase tracking-wide">
                    Delivered
                  </Text>
                  <Text className="text-lg font-semibold text-gray-900 mt-1">
                    {formatNumber(campaign.metrics.delivered)}
                  </Text>
                </div>

                <div className="text-center">
                  <Text className="text-xs text-gray-500 uppercase tracking-wide">
                    Opened
                  </Text>
                  <Text className="text-lg font-semibold text-gray-900 mt-1">
                    {formatNumber(campaign.metrics.opened)}
                  </Text>
                </div>

                <div className="text-center">
                  <Text className="text-xs text-gray-500 uppercase tracking-wide">
                    Clicked
                  </Text>
                  <Text className="text-lg font-semibold text-gray-900 mt-1">
                    {formatNumber(campaign.metrics.clicked)}
                  </Text>
                </div>

                <div className="text-center">
                  <Text className="text-xs text-gray-500 uppercase tracking-wide">
                    Delivery Rate
                  </Text>
                  <Text className="text-lg font-semibold text-green-600 mt-1">
                    {formatPercentage(campaign.metrics.deliveryRate)}
                  </Text>
                </div>

                <div className="text-center">
                  <Text className="text-xs text-gray-500 uppercase tracking-wide">
                    Open Rate
                  </Text>
                  <Text className="text-lg font-semibold text-blue-600 mt-1">
                    {formatPercentage(campaign.metrics.openRate)}
                  </Text>
                </div>

                <div className="text-center">
                  <Text className="text-xs text-gray-500 uppercase tracking-wide">
                    Click Rate
                  </Text>
                  <Text className="text-lg font-semibold text-purple-600 mt-1">
                    {formatPercentage(campaign.metrics.clickRate)}
                  </Text>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
