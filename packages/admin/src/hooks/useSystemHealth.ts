'use client'

import { useState, useEffect } from 'react'
import { SystemHealthData, UseAdminHookReturn } from '../types'

export function useSystemHealth(): UseAdminHookReturn<SystemHealthData> {
  const [data, setData] = useState<SystemHealthData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSystemHealth = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Mock system health data for now
      const healthData: SystemHealthData = {
        database: {
          name: 'Database',
          status: 'healthy',
          responseTime: 45,
          uptime: 99.95,
          lastCheck: new Date().toISOString()
        },
        api: {
          name: 'API',
          status: 'healthy',
          responseTime: 120,
          uptime: 99.9,
          lastCheck: new Date().toISOString()
        },
        email: {
          name: 'Email',
          status: 'healthy',
          responseTime: 200,
          uptime: 99.8,
          lastCheck: new Date().toISOString()
        },
        storage: {
          name: 'Storage',
          status: 'healthy',
          responseTime: 80,
          uptime: 99.99,
          lastCheck: new Date().toISOString()
        },
        cpuUsage: 45,
        memoryUsage: 62,
        diskUsage: 34,
        networkIO: 78,
        recentErrors: [],
        recentAlerts: []
      }
      
      setData(healthData)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch system health'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSystemHealth()
    
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchSystemHealth, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return {
    data,
    isLoading,
    error,
    refetch: fetchSystemHealth
  }
}