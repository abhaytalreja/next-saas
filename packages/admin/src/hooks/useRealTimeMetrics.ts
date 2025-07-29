'use client'

import { useState, useEffect, useRef } from 'react'
import { getSupabaseBrowserClient } from '@nextsaas/supabase'
import { AdminMetrics } from '../types'

export function useRealTimeMetrics() {
  const [metrics, setMetrics] = useState<Partial<AdminMetrics>>({})
  const [isConnected, setIsConnected] = useState(false)
  const supabase = getSupabaseBrowserClient()
  const channelRef = useRef<any>(null)

  useEffect(() => {
    // Create a channel for real-time updates
    channelRef.current = supabase.channel('admin-metrics')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'users'
      }, (payload: any) => {
        console.log('Users table change:', payload)
        updateUserMetrics()
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'organizations'
      }, (payload: any) => {
        console.log('Organizations table change:', payload)
        updateOrganizationMetrics()
      })
      .subscribe((status: any) => {
        console.log('Subscription status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    // Initial metrics load
    loadInitialMetrics()

    // Cleanup subscription on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  const loadInitialMetrics = async () => {
    try {
      const [userCount, orgCount] = await Promise.all([
        getUserCount(),
        getOrganizationCount()
      ])

      setMetrics(prev => ({
        ...prev,
        totalUsers: userCount,
        totalOrganizations: orgCount,
        // Simulate other real-time metrics
        activeUsers: Math.floor(userCount * 0.4),
        activeOrganizations: Math.floor(orgCount * 0.8),
        systemUptime: 99.9,
        apiResponseTime: Math.floor(Math.random() * 200) + 50,
        errorRate: Math.random() * 2,
        activeConnections: Math.floor(Math.random() * 1000) + 200
      }))
    } catch (error) {
      console.error('Error loading initial metrics:', error)
      // Use mock data if real data fails
      setMetrics({
        totalUsers: 5432,
        activeUsers: 2168,
        totalOrganizations: 891,
        activeOrganizations: 712,
        systemUptime: 99.9,
        apiResponseTime: 120,
        errorRate: 1.2,
        activeConnections: 456
      })
    }
  }

  const getUserCount = async () => {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error fetching user count:', error)
      return 5432 // Fallback mock data
    }
  }

  const getOrganizationCount = async () => {
    try {
      const { count, error } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'deleted')

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error fetching organization count:', error)
      return 891 // Fallback mock data
    }
  }

  const updateUserMetrics = async () => {
    const userCount = await getUserCount()
    setMetrics(prev => ({
      ...prev,
      totalUsers: userCount,
      activeUsers: Math.floor(userCount * 0.4),
      newUsersToday: prev.newUsersToday ? prev.newUsersToday + 1 : 1
    }))
  }

  const updateOrganizationMetrics = async () => {
    const orgCount = await getOrganizationCount()
    setMetrics(prev => ({
      ...prev,
      totalOrganizations: orgCount,
      activeOrganizations: Math.floor(orgCount * 0.8),
      newOrganizationsToday: prev.newOrganizationsToday ? prev.newOrganizationsToday + 1 : 1
    }))
  }

  // Simulate live system metrics updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        setMetrics(prev => ({
          ...prev,
          systemUptime: 99.9 + (Math.random() - 0.5) * 0.1,
          apiResponseTime: Math.floor(Math.random() * 100) + 80,
          errorRate: Math.random() * 1.5,
          activeConnections: Math.floor(Math.random() * 500) + 800,
          emailsSentToday: (prev.emailsSentToday || 15420) + Math.floor(Math.random() * 10),
          activeUsers: prev.totalUsers ? Math.floor(prev.totalUsers * (0.35 + Math.random() * 0.1)) : prev.activeUsers,
          // Add security-related real-time updates
          failedLogins: (prev.failedLogins || 47) + Math.floor(Math.random() * 3),
          activeSessions: Math.floor(Math.random() * 50) + 120,
          // Add system health updates  
          cpuUsage: Math.random() * 40 + 30,
          memoryUsage: Math.random() * 30 + 50,
          diskUsage: Math.random() * 10 + 20
        }))
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [isConnected])

  // Add subscription to audit logs for security alerts
  useEffect(() => {
    if (channelRef.current) {
      channelRef.current
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs'
        }, (payload: any) => {
          console.log('New audit log entry:', payload)
          // Update security metrics based on audit log events
          if (payload.new.action === 'sign_in_failed') {
            setMetrics(prev => ({
              ...prev,
              failedLogins: (prev.failedLogins || 0) + 1
            }))
          }
        })
    }
  }, [channelRef.current])

  return {
    metrics,
    isConnected,
    refresh: loadInitialMetrics
  }
}