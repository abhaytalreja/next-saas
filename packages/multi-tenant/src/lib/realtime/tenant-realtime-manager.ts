import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'
import { useOrganization } from '../../hooks/useOrganization'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface TenantRealtimeConfig {
  organizationId: string
  userId: string
  permissions: string[]
}

export interface RealtimeSubscription {
  channel: RealtimeChannel
  unsubscribe: () => void
}

export type RealtimeEventHandler = (payload: any) => void

/**
 * Tenant-aware realtime manager for secure multi-tenant subscriptions
 */
export class TenantRealtimeManager {
  private supabase: SupabaseClient
  private config: TenantRealtimeConfig
  private subscriptions: Map<string, RealtimeChannel> = new Map()

  constructor(config: TenantRealtimeConfig) {
    this.config = config
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  /**
   * Subscribe to organization-level changes
   */
  subscribeToOrganization(
    events: string[],
    handler: RealtimeEventHandler
  ): RealtimeSubscription {
    const channelName = `org:${this.config.organizationId}`
    
    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organizations',
          filter: `id=eq.${this.config.organizationId}`
        },
        (payload) => {
          if (events.includes(payload.eventType)) {
            handler(this.sanitizePayload(payload))
          }
        }
      )
      .subscribe()

    this.subscriptions.set(channelName, channel)

    return {
      channel,
      unsubscribe: () => this.unsubscribe(channelName)
    }
  }

  /**
   * Subscribe to workspace-level changes
   */
  subscribeToWorkspaces(
    events: string[],
    handler: RealtimeEventHandler,
    workspaceIds?: string[]
  ): RealtimeSubscription {
    const channelName = `workspaces:${this.config.organizationId}`
    
    let filter = `organization_id=eq.${this.config.organizationId}`
    
    if (workspaceIds && workspaceIds.length > 0) {
      // For specific workspaces, we'll filter client-side for now
      // Real implementation would use Supabase's IN operator when available
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workspaces',
          filter
        },
        (payload) => {
          // Additional client-side filtering for workspace access
          if (!this.hasWorkspaceAccess(payload.new?.id || payload.old?.id)) {
            return
          }

          if (workspaceIds && workspaceIds.length > 0) {
            const workspaceId = payload.new?.id || payload.old?.id
            if (!workspaceIds.includes(workspaceId)) {
              return
            }
          }

          if (events.includes(payload.eventType)) {
            handler(this.sanitizePayload(payload))
          }
        }
      )
      .subscribe()

    this.subscriptions.set(channelName, channel)

    return {
      channel,
      unsubscribe: () => this.unsubscribe(channelName)
    }
  }

  /**
   * Subscribe to project-level changes
   */
  subscribeToProjects(
    events: string[],
    handler: RealtimeEventHandler,
    filters?: {
      workspaceId?: string
      projectIds?: string[]
    }
  ): RealtimeSubscription {
    const channelName = `projects:${this.config.organizationId}${filters?.workspaceId ? `:${filters.workspaceId}` : ''}`
    
    const filter = `organization_id=eq.${this.config.organizationId}`

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter
        },
        (payload) => {
          // Client-side filtering for additional security
          const projectData = payload.new || payload.old
          
          // Check organization boundary
          if (projectData?.organization_id !== this.config.organizationId) {
            return
          }

          // Check workspace filter
          if (filters?.workspaceId && projectData?.workspace_id !== filters.workspaceId) {
            return
          }

          // Check specific project IDs
          if (filters?.projectIds && !filters.projectIds.includes(projectData?.id)) {
            return
          }

          // Verify user has access to this project
          if (!this.hasProjectAccess(projectData)) {
            return
          }

          if (events.includes(payload.eventType)) {
            handler(this.sanitizePayload(payload))
          }
        }
      )
      .subscribe()

    this.subscriptions.set(channelName, channel)

    return {
      channel,
      unsubscribe: () => this.unsubscribe(channelName)
    }
  }

  /**
   * Subscribe to member changes
   */
  subscribeToMembers(
    events: string[],
    handler: RealtimeEventHandler
  ): RealtimeSubscription {
    if (!this.hasPermission('organization:manage_members') && 
        !this.hasPermission('organization:view_audit_logs')) {
      throw new Error('Insufficient permissions to subscribe to member changes')
    }

    const channelName = `members:${this.config.organizationId}`

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organization_members',
          filter: `organization_id=eq.${this.config.organizationId}`
        },
        (payload) => {
          if (events.includes(payload.eventType)) {
            handler(this.sanitizePayload(payload))
          }
        }
      )
      .subscribe()

    this.subscriptions.set(channelName, channel)

    return {
      channel,
      unsubscribe: () => this.unsubscribe(channelName)
    }
  }

  /**
   * Subscribe to audit logs (admin only)
   */
  subscribeToAuditLogs(
    events: string[],
    handler: RealtimeEventHandler
  ): RealtimeSubscription {
    if (!this.hasPermission('organization:view_audit_logs')) {
      throw new Error('Insufficient permissions to subscribe to audit logs')
    }

    const channelName = `audit:${this.config.organizationId}`

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audit_logs',
          filter: `organization_id=eq.${this.config.organizationId}`
        },
        (payload) => {
          if (events.includes(payload.eventType)) {
            // Extra sanitization for audit logs
            handler(this.sanitizeAuditPayload(payload))
          }
        }
      )
      .subscribe()

    this.subscriptions.set(channelName, channel)

    return {
      channel,
      unsubscribe: () => this.unsubscribe(channelName)
    }
  }

  /**
   * Subscribe to user presence
   */
  subscribeToPresence(
    handler: (state: any) => void
  ): RealtimeSubscription {
    const channelName = `presence:${this.config.organizationId}`

    const channel = this.supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, handler)
      .on('presence', { event: 'join' }, handler)
      .on('presence', { event: 'leave' }, handler)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: this.config.userId,
            online_at: new Date().toISOString()
          })
        }
      })

    this.subscriptions.set(channelName, channel)

    return {
      channel,
      unsubscribe: () => this.unsubscribe(channelName)
    }
  }

  /**
   * Unsubscribe from a channel
   */
  private unsubscribe(channelName: string): void {
    const channel = this.subscriptions.get(channelName)
    if (channel) {
      channel.unsubscribe()
      this.subscriptions.delete(channelName)
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    for (const [channelName, channel] of this.subscriptions) {
      channel.unsubscribe()
    }
    this.subscriptions.clear()
  }

  /**
   * Check if user has workspace access
   */
  private hasWorkspaceAccess(workspaceId: string): boolean {
    // This would be enhanced with actual workspace membership check
    // For now, rely on organization-level permissions
    return this.hasPermission('workspace:view')
  }

  /**
   * Check if user has project access
   */
  private hasProjectAccess(projectData: any): boolean {
    // This would be enhanced with actual project access check
    // For now, rely on organization-level permissions
    return this.hasPermission('project:view')
  }

  /**
   * Check if user has a specific permission
   */
  private hasPermission(permission: string): boolean {
    return this.config.permissions.includes('*') || 
           this.config.permissions.includes(permission) ||
           this.config.permissions.some(p => {
             if (p.includes('*')) {
               const pattern = p.replace(/\*/g, '.*')
               return new RegExp(`^${pattern}$`).test(permission)
             }
             return false
           })
  }

  /**
   * Sanitize payload to remove sensitive data
   */
  private sanitizePayload(payload: any): any {
    const sanitized = { ...payload }
    
    // Remove sensitive fields
    if (sanitized.new) {
      delete sanitized.new.stripe_customer_id
      delete sanitized.new.api_keys
      delete sanitized.new.billing_address
    }
    
    if (sanitized.old) {
      delete sanitized.old.stripe_customer_id
      delete sanitized.old.api_keys
      delete sanitized.old.billing_address
    }

    return sanitized
  }

  /**
   * Extra sanitization for audit logs
   */
  private sanitizeAuditPayload(payload: any): any {
    const sanitized = this.sanitizePayload(payload)
    
    // Remove potentially sensitive metadata
    if (sanitized.new?.metadata) {
      const { password, token, key, ...safeMeta } = sanitized.new.metadata
      sanitized.new.metadata = safeMeta
    }

    return sanitized
  }
}

/**
 * React hook for tenant-aware realtime subscriptions
 */
export function useTenantRealtime() {
  const { currentOrganization, userId, userPermissions } = useOrganization()
  const [manager, setManager] = useState<TenantRealtimeManager | null>(null)
  const subscriptionsRef = useRef<Map<string, RealtimeSubscription>>(new Map())

  useEffect(() => {
    if (currentOrganization?.id && userId && userPermissions) {
      const realtimeManager = new TenantRealtimeManager({
        organizationId: currentOrganization.id,
        userId,
        permissions: userPermissions
      })
      
      setManager(realtimeManager)

      return () => {
        realtimeManager.unsubscribeAll()
      }
    }
  }, [currentOrganization?.id, userId, userPermissions])

  const subscribe = useCallback((
    type: 'organization' | 'workspaces' | 'projects' | 'members' | 'audit' | 'presence',
    events: string[],
    handler: RealtimeEventHandler,
    options?: any
  ) => {
    if (!manager) return null

    let subscription: RealtimeSubscription

    try {
      switch (type) {
        case 'organization':
          subscription = manager.subscribeToOrganization(events, handler)
          break
        case 'workspaces':
          subscription = manager.subscribeToWorkspaces(events, handler, options?.workspaceIds)
          break
        case 'projects':
          subscription = manager.subscribeToProjects(events, handler, options)
          break
        case 'members':
          subscription = manager.subscribeToMembers(events, handler)
          break
        case 'audit':
          subscription = manager.subscribeToAuditLogs(events, handler)
          break
        case 'presence':
          subscription = manager.subscribeToPresence(handler)
          break
        default:
          throw new Error(`Unsupported subscription type: ${type}`)
      }

      const subscriptionId = `${type}:${Date.now()}`
      subscriptionsRef.current.set(subscriptionId, subscription)

      return {
        ...subscription,
        unsubscribe: () => {
          subscription.unsubscribe()
          subscriptionsRef.current.delete(subscriptionId)
        }
      }
    } catch (error) {
      console.error(`Failed to subscribe to ${type}:`, error)
      return null
    }
  }, [manager])

  const unsubscribeAll = useCallback(() => {
    subscriptionsRef.current.forEach(subscription => {
      subscription.unsubscribe()
    })
    subscriptionsRef.current.clear()
    manager?.unsubscribeAll()
  }, [manager])

  return {
    subscribe,
    unsubscribeAll,
    isReady: !!manager
  }
}

/**
 * Hook for workspace-specific realtime subscriptions
 */
export function useWorkspaceRealtime(workspaceId: string) {
  const { subscribe } = useTenantRealtime()

  const subscribeToWorkspaceChanges = useCallback((
    handler: RealtimeEventHandler
  ) => {
    return subscribe('workspaces', ['INSERT', 'UPDATE', 'DELETE'], handler, {
      workspaceIds: [workspaceId]
    })
  }, [subscribe, workspaceId])

  const subscribeToWorkspaceProjects = useCallback((
    handler: RealtimeEventHandler
  ) => {
    return subscribe('projects', ['INSERT', 'UPDATE', 'DELETE'], handler, {
      workspaceId
    })
  }, [subscribe, workspaceId])

  return {
    subscribeToWorkspaceChanges,
    subscribeToWorkspaceProjects
  }
}

/**
 * Hook for project-specific realtime subscriptions
 */
export function useProjectRealtime(projectId: string) {
  const { subscribe } = useTenantRealtime()

  const subscribeToProjectChanges = useCallback((
    handler: RealtimeEventHandler
  ) => {
    return subscribe('projects', ['UPDATE', 'DELETE'], handler, {
      projectIds: [projectId]
    })
  }, [subscribe, projectId])

  return {
    subscribeToProjectChanges
  }
}