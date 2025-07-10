import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import UAParser from 'ua-parser-js'

type Tables = Database['public']['Tables']
type UserSession = Tables['user_sessions']['Row']
type InsertUserSession = Tables['user_sessions']['Insert']
type UpdateUserSession = Tables['user_sessions']['Update']

export interface SessionInfo {
  id: string
  userId: string
  deviceInfo: {
    browser: string
    os: string
    device: string
    isMobile: boolean
  }
  location?: {
    ip: string
    country?: string
    city?: string
  }
  isActive: boolean
  isCurrent: boolean
  lastActivity: string
  createdAt: string
  expiresAt: string
}

export interface CreateSessionParams {
  userId: string
  ipAddress?: string
  userAgent?: string
  sessionToken?: string
}

export class SessionService {
  private supabase: ReturnType<typeof createClient<Database>>

  constructor() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required Supabase environment variables')
    }

    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  }

  /**
   * Create a new user session
   */
  async createSession(params: CreateSessionParams): Promise<{ success: boolean; session?: UserSession; error?: string }> {
    try {
      const { userId, ipAddress, userAgent, sessionToken } = params

      // Parse user agent for device info
      const deviceInfo = this.parseUserAgent(userAgent || '')
      
      // Generate session token if not provided
      const token = sessionToken || this.generateSessionToken()

      // Set expiration (30 days from now)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

      const sessionData: InsertUserSession = {
        id: crypto.randomUUID(),
        user_id: userId,
        session_token: token,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_name: deviceInfo.device,
        device_type: deviceInfo.type,
        browser_name: deviceInfo.browser,
        browser_version: deviceInfo.browserVersion,
        os_name: deviceInfo.os,
        os_version: deviceInfo.osVersion,
        is_mobile: deviceInfo.isMobile,
        expires_at: expiresAt.toISOString(),
        last_activity_at: new Date().toISOString(),
        is_active: true
      }

      const { data, error } = await this.supabase
        .from('user_sessions')
        .insert(sessionData)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      // Log session creation
      await this.logSessionActivity(userId, 'session_created', {
        session_id: data.id,
        ip_address: ipAddress,
        device_info: deviceInfo
      })

      return { success: true, session: data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create session' 
      }
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string, currentSessionId?: string): Promise<{ success: boolean; sessions?: SessionInfo[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_activity_at', { ascending: false })

      if (error) {
        return { success: false, error: error.message }
      }

      const sessions: SessionInfo[] = data.map(session => ({
        id: session.id,
        userId: session.user_id,
        deviceInfo: {
          browser: `${session.browser_name || 'Unknown'} ${session.browser_version || ''}`.trim(),
          os: `${session.os_name || 'Unknown'} ${session.os_version || ''}`.trim(),
          device: session.device_name || 'Unknown Device',
          isMobile: session.is_mobile || false
        },
        location: {
          ip: session.ip_address || 'Unknown',
          country: session.country,
          city: session.city
        },
        isActive: session.is_active || false,
        isCurrent: session.id === currentSessionId,
        lastActivity: session.last_activity_at || session.created_at,
        createdAt: session.created_at,
        expiresAt: session.expires_at || ''
      }))

      return { success: true, sessions }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get sessions' 
      }
    }
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId: string, ipAddress?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: UpdateUserSession = {
        last_activity_at: new Date().toISOString()
      }

      if (ipAddress) {
        updateData.ip_address = ipAddress
      }

      const { error } = await this.supabase
        .from('user_sessions')
        .update(updateData)
        .eq('id', sessionId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update session' 
      }
    }
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string, userId: string, reason: string = 'user_revoked'): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('user_sessions')
        .update({ 
          is_active: false,
          revoked_at: new Date().toISOString(),
          revoked_reason: reason
        })
        .eq('id', sessionId)
        .eq('user_id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      // Log session revocation
      await this.logSessionActivity(userId, 'session_revoked', {
        session_id: sessionId,
        reason
      })

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to revoke session' 
      }
    }
  }

  /**
   * Revoke all other sessions except the current one
   */
  async revokeAllOtherSessions(userId: string, currentSessionId: string): Promise<{ success: boolean; revokedCount?: number; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('user_sessions')
        .update({ 
          is_active: false,
          revoked_at: new Date().toISOString(),
          revoked_reason: 'user_revoked_all_others'
        })
        .eq('user_id', userId)
        .eq('is_active', true)
        .neq('id', currentSessionId)
        .select('id')

      if (error) {
        return { success: false, error: error.message }
      }

      const revokedCount = data?.length || 0

      // Log bulk session revocation
      await this.logSessionActivity(userId, 'sessions_bulk_revoked', {
        current_session_id: currentSessionId,
        revoked_count: revokedCount
      })

      return { success: true, revokedCount }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to revoke sessions' 
      }
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<{ success: boolean; cleanedCount?: number; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('user_sessions')
        .update({ 
          is_active: false,
          revoked_at: new Date().toISOString(),
          revoked_reason: 'expired'
        })
        .lt('expires_at', new Date().toISOString())
        .eq('is_active', true)
        .select('id')

      if (error) {
        return { success: false, error: error.message }
      }

      const cleanedCount = data?.length || 0

      return { success: true, cleanedCount }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to cleanup sessions' 
      }
    }
  }

  /**
   * Get session by token
   */
  async getSessionByToken(token: string): Promise<{ success: boolean; session?: UserSession; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('session_token', token)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, session: data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get session' 
      }
    }
  }

  /**
   * Parse user agent string to extract device information
   */
  private parseUserAgent(userAgent: string) {
    const parser = new UAParser(userAgent)
    const result = parser.getResult()

    return {
      browser: result.browser.name || 'Unknown',
      browserVersion: result.browser.version || '',
      os: result.os.name || 'Unknown',
      osVersion: result.os.version || '',
      device: result.device.model || result.device.vendor || 'Desktop',
      type: result.device.type || 'desktop',
      isMobile: result.device.type === 'mobile' || result.device.type === 'tablet'
    }
  }

  /**
   * Generate a secure session token
   */
  private generateSessionToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Log session-related activity
   */
  private async logSessionActivity(userId: string, action: string, details: any): Promise<void> {
    try {
      await this.supabase.from('user_activity').insert({
        user_id: userId,
        action,
        resource: 'session',
        details,
        status: 'success'
      })
    } catch (error) {
      console.error('Failed to log session activity:', error)
    }
  }
}

// Singleton instance
export const sessionService = new SessionService()