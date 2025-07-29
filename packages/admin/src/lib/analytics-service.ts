'use client'

import { getSupabaseBrowserClient } from '@nextsaas/supabase'
import { AnalyticsData, TimeSeriesData, AdminMetrics } from '../types'

type DateRange = '7d' | '30d' | '90d' | '1y'

class AnalyticsService {
  private supabase = getSupabaseBrowserClient()

  async getAnalytics(dateRange: DateRange = '30d'): Promise<AnalyticsData> {
    try {
      const response = await fetch(`/api/admin/analytics?range=${dateRange}&type=analytics`)
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      const result = await response.json()
      return result.data.analytics
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      // Fallback to local mock data
      const days = this.getDaysFromRange(dateRange)
      const [userGrowth, revenueGrowth, organizationGrowth, engagementMetrics] = await Promise.all([
        this.getUserGrowthData(days),
        this.getRevenueGrowthData(days),
        this.getOrganizationGrowthData(days),
        this.getEngagementMetricsData(days)
      ])

      return {
        userGrowth,
        revenueGrowth,
        organizationGrowth,
        engagementMetrics
      }
    }
  }

  async getMetrics(dateRange: DateRange = '30d'): Promise<AdminMetrics> {
    try {
      const response = await fetch(`/api/admin/analytics?range=${dateRange}&type=metrics`)
      if (!response.ok) {
        throw new Error('Failed to fetch metrics')
      }
      const result = await response.json()
      return result.data.metrics
    } catch (error) {
      console.error('Error fetching metrics:', error)
      // Fallback to local mock data
      const days = this.getDaysFromRange(dateRange)
      const [userMetrics, orgMetrics, revenueMetrics, systemMetrics, emailMetrics] = await Promise.all([
        this.getUserMetrics(days),
        this.getOrganizationMetrics(days),
        this.getRevenueMetrics(days),
        this.getSystemMetrics(),
        this.getEmailMetrics()
      ])

      return {
        ...userMetrics,
        ...orgMetrics,
        ...revenueMetrics,
        ...systemMetrics,
        ...emailMetrics,
        recentActivity: await this.getRecentActivity()
      }
    }
  }

  private getDaysFromRange(range: DateRange): number {
    switch (range) {
      case '7d': return 7
      case '30d': return 30
      case '90d': return 90
      case '1y': return 365
      default: return 30
    }
  }

  private async getUserMetrics(days: number) {
    // In a real implementation, this would query the actual database
    const mockData = {
      totalUsers: Math.floor(Math.random() * 10000) + 5000,
      activeUsers: Math.floor(Math.random() * 5000) + 2000,
      newUsersToday: Math.floor(Math.random() * 100) + 20,
      userGrowthRate: Math.floor(Math.random() * 20) + 5,
      userRetentionRate: Math.floor(Math.random() * 30) + 70
    }
    return mockData
  }

  private async getOrganizationMetrics(days: number) {
    const mockData = {
      totalOrganizations: Math.floor(Math.random() * 1000) + 500,
      activeOrganizations: Math.floor(Math.random() * 800) + 400,
      newOrganizationsToday: Math.floor(Math.random() * 10) + 2,
      organizationGrowthRate: Math.floor(Math.random() * 15) + 3
    }
    return mockData
  }

  private async getRevenueMetrics(days: number) {
    const mockData = {
      monthlyRecurringRevenue: Math.floor(Math.random() * 10000000) + 5000000, // in cents
      totalRevenue: Math.floor(Math.random() * 50000000) + 25000000, // in cents
      averageRevenuePerUser: Math.floor(Math.random() * 5000) + 2000, // in cents
      revenueGrowthRate: Math.floor(Math.random() * 25) + 8,
      churnRate: Math.floor(Math.random() * 10) + 2
    }
    return mockData
  }

  private async getSystemMetrics() {
    const mockData = {
      systemUptime: 99.9,
      apiResponseTime: Math.floor(Math.random() * 200) + 50,
      errorRate: Math.random() * 2,
      activeConnections: Math.floor(Math.random() * 1000) + 200
    }
    return mockData
  }

  private async getEmailMetrics() {
    const mockData = {
      emailsSentToday: Math.floor(Math.random() * 10000) + 1000,
      emailDeliveryRate: Math.floor(Math.random() * 5) + 95,
      campaignsActive: Math.floor(Math.random() * 20) + 5,
      subscriberCount: Math.floor(Math.random() * 50000) + 10000
    }
    return mockData
  }

  private async getRecentActivity() {
    // Mock recent activity data
    return [
      {
        id: '1',
        description: 'New user registration',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        type: 'user' as const,
        userId: 'user-123'
      },
      {
        id: '2',
        description: 'Organization created',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        type: 'organization' as const,
        userId: 'user-456'
      },
      {
        id: '3',
        description: 'System backup completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        type: 'system' as const
      }
    ]
  }

  private async getUserGrowthData(days: number): Promise<TimeSeriesData[]> {
    // This would fetch actual user growth data from the database
    // For now, return mock data
    return this.generateMockTimeSeriesData(days, 50, 200)
  }

  private async getRevenueGrowthData(days: number): Promise<TimeSeriesData[]> {
    // This would fetch actual revenue data from the billing system
    // For now, return mock data with increasing trend
    return this.generateMockTimeSeriesData(days, 5000, 12000, true)
  }

  private async getOrganizationGrowthData(days: number): Promise<TimeSeriesData[]> {
    // This would fetch actual organization growth data
    // For now, return mock data
    return this.generateMockTimeSeriesData(days, 5, 25)
  }

  private async getEngagementMetricsData(days: number): Promise<TimeSeriesData[]> {
    // This would fetch actual engagement metrics
    // For now, return mock data (percentage values)
    return this.generateMockTimeSeriesData(days, 65, 95)
  }

  private generateMockTimeSeriesData(days: number, minValue: number, maxValue: number, trending = false): TimeSeriesData[] {
    const data: TimeSeriesData[] = []
    const now = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      let value: number
      if (trending) {
        // Create an upward trending pattern
        const progress = (days - 1 - i) / (days - 1)
        const trendValue = minValue + (maxValue - minValue) * progress
        const randomVariation = (Math.random() - 0.5) * (maxValue - minValue) * 0.2
        value = Math.max(minValue, Math.min(maxValue, Math.floor(trendValue + randomVariation)))
      } else {
        value = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        value,
        label: date.toLocaleDateString()
      })
    }
    
    return data
  }

  async getUserAnalytics() {
    // Get user analytics from database
    const { data, error } = await this.supabase
      .from('users')
      .select('created_at, last_seen_at')
      .is('deleted_at', null)

    if (error) throw error

    // Process and return analytics
    return this.processUserAnalytics(data || [])
  }

  private processUserAnalytics(users: any[]) {
    // Process user data into analytics format
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => this.isActiveUser(u.last_seen_at)).length,
      newUsersThisMonth: users.filter(u => this.isThisMonth(u.created_at)).length
    }
  }

  private isActiveUser(lastSeenAt: string | null): boolean {
    if (!lastSeenAt) return false
    const lastSeen = new Date(lastSeenAt)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return lastSeen > thirtyDaysAgo
  }

  private isThisMonth(createdAt: string): boolean {
    const created = new Date(createdAt)
    const now = new Date()
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
  }
}

export const analyticsService = new AnalyticsService()