'use client'

import { useState, useEffect, useCallback } from 'react'
import { useOrganization } from '@next-saas/multi-tenant'
import { createSupabaseBrowserClient } from '@nextsaas/supabase'
import type { SecurityPolicy, SecurityEvent } from '../types/sso'
import { SecurityPolicyEngine } from '../lib/security-policy-engine'

export function useSecurityPolicies() {
  const { currentOrganization: organization } = useOrganization()
  const [policies, setPolicies] = useState<SecurityPolicy[]>([])
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createSupabaseBrowserClient()

  const fetchPolicies = useCallback(async () => {
    if (!organization?.id) {
      setPolicies([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('security_policies')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setPolicies(data || [])
    } catch (err) {
      console.error('Error fetching security policies:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch security policies')
    } finally {
      setIsLoading(false)
    }
  }, [organization?.id, supabase])

  const fetchSecurityEvents = useCallback(async (limit = 50) => {
    if (!organization?.id) {
      setEvents([])
      return
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('security_events')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (fetchError) {
        throw fetchError
      }

      setEvents(data || [])
    } catch (err) {
      console.error('Error fetching security events:', err)
    }
  }, [organization?.id, supabase])

  useEffect(() => {
    fetchPolicies()
    fetchSecurityEvents()
  }, [fetchPolicies, fetchSecurityEvents])

  const savePolicy = useCallback(async (policy: Partial<SecurityPolicy>) => {
    if (!organization?.id) {
      throw new Error('No organization selected')
    }

    try {
      const policyData = {
        ...policy,
        organization_id: organization.id,
        updated_at: new Date().toISOString(),
      }

      let result
      if (policy.id) {
        // Update existing policy
        const { data, error } = await supabase
          .from('security_policies')
          .update(policyData)
          .eq('id', policy.id)
          .eq('organization_id', organization.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        // Create new policy
        const { data, error } = await supabase
          .from('security_policies')
          .insert({
            ...policyData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) throw error
        result = data
      }

      // Update local state
      setPolicies(prev => {
        if (policy.id) {
          return prev.map(p => p.id === policy.id ? result : p)
        } else {
          return [result, ...prev]
        }
      })

      return result
    } catch (err) {
      console.error('Error saving security policy:', err)
      throw err
    }
  }, [organization?.id, supabase])

  const deletePolicy = useCallback(async (policyId: string) => {
    if (!organization?.id) {
      throw new Error('No organization selected')
    }

    try {
      const { error } = await supabase
        .from('security_policies')
        .delete()
        .eq('id', policyId)
        .eq('organization_id', organization.id)

      if (error) throw error

      // Update local state
      setPolicies(prev => prev.filter(p => p.id !== policyId))
    } catch (err) {
      console.error('Error deleting security policy:', err)
      throw err
    }
  }, [organization?.id, supabase])

  const togglePolicy = useCallback(async (policyId: string, isActive: boolean) => {
    if (!organization?.id) {
      throw new Error('No organization selected')
    }

    try {
      const { data, error } = await supabase
        .from('security_policies')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', policyId)
        .eq('organization_id', organization.id)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setPolicies(prev => 
        prev.map(p => p.id === policyId ? { ...p, is_active: isActive } : p)
      )

      return data
    } catch (err) {
      console.error('Error toggling security policy:', err)
      throw err
    }
  }, [organization?.id, supabase])

  const getPoliciesByType = useCallback((policyType: SecurityPolicy['policy_type']) => {
    return policies.filter(p => p.policy_type === policyType && p.is_active)
  }, [policies])

  const getActivePolicies = useCallback(() => {
    return policies.filter(p => p.is_active)
  }, [policies])

  return {
    policies,
    events,
    isLoading,
    error,
    savePolicy,
    deletePolicy,
    togglePolicy,
    getPoliciesByType,
    getActivePolicies,
    refetch: fetchPolicies,
    refetchEvents: fetchSecurityEvents,
  }
}

export function useSecurityValidation() {
  const { currentOrganization: organization } = useOrganization()
  const { policies } = useSecurityPolicies()
  const [policyEngine] = useState(() => new SecurityPolicyEngine())

  const validateIPAccess = useCallback(async (
    ipAddress: string,
    userAgent?: string
  ) => {
    if (!organization?.id) {
      return { allowed: true }
    }

    return await policyEngine.validateIPAccess(organization.id, ipAddress, userAgent)
  }, [organization?.id, policyEngine])

  const validateMFARequirement = useCallback(async (
    userId: string,
    hasMFA: boolean,
    lastMFATime?: Date
  ) => {
    if (!organization?.id) {
      return { required: false }
    }

    return await policyEngine.validateMFARequirement(
      organization.id,
      userId,
      hasMFA,
      lastMFATime
    )
  }, [organization?.id, policyEngine])

  const validateSessionTimeout = useCallback(async (
    sessionStart: Date,
    lastActivity: Date
  ) => {
    if (!organization?.id) {
      return { valid: true }
    }

    return await policyEngine.validateSessionTimeout(
      organization.id,
      sessionStart,
      lastActivity
    )
  }, [organization?.id, policyEngine])

  const validatePassword = useCallback(async (
    password: string,
    previousPasswords?: string[]
  ) => {
    if (!organization?.id) {
      return { valid: true, errors: [] }
    }

    return await policyEngine.validatePassword(
      organization.id,
      password,
      previousPasswords
    )
  }, [organization?.id, policyEngine])

  const detectSuspiciousActivity = useCallback(async (
    userId: string,
    activityData: {
      ipAddress: string
      userAgent: string
      location?: { country?: string; city?: string }
      loginAttempts?: number
      timeSinceLastLogin?: number
    }
  ) => {
    if (!organization?.id) {
      return { suspicious: false, reasons: [], riskScore: 0 }
    }

    return await policyEngine.detectSuspiciousActivity(
      organization.id,
      userId,
      activityData
    )
  }, [organization?.id, policyEngine])

  const checkSecurityCompliance = useCallback(async (context: {
    userId: string
    ipAddress: string
    userAgent: string
    hasMFA: boolean
    sessionStart: Date
    lastActivity: Date
  }) => {
    if (!organization?.id) {
      return { compliant: true, violations: [] }
    }

    const violations: string[] = []

    try {
      // Check IP access
      const ipResult = await validateIPAccess(context.ipAddress, context.userAgent)
      if (!ipResult.allowed) {
        violations.push(`IP access denied: ${ipResult.reason}`)
      }

      // Check MFA requirement
      const mfaResult = await validateMFARequirement(context.userId, context.hasMFA)
      if (mfaResult.required) {
        violations.push(`MFA required: ${mfaResult.reason}`)
      }

      // Check session timeout
      const sessionResult = await validateSessionTimeout(context.sessionStart, context.lastActivity)
      if (!sessionResult.valid) {
        violations.push(`Session timeout: ${sessionResult.reason}`)
      }

      // Check for suspicious activity
      const suspiciousResult = await detectSuspiciousActivity(context.userId, {
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      })

      if (suspiciousResult.suspicious) {
        violations.push(`Suspicious activity detected: ${suspiciousResult.reasons.join(', ')}`)
      }

      return {
        compliant: violations.length === 0,
        violations,
        riskScore: suspiciousResult.riskScore,
      }
    } catch (err) {
      console.error('Error checking security compliance:', err)
      return {
        compliant: false,
        violations: ['Security check failed'],
        riskScore: 100,
      }
    }
  }, [
    organization?.id,
    validateIPAccess,
    validateMFARequirement,
    validateSessionTimeout,
    detectSuspiciousActivity,
  ])

  return {
    validateIPAccess,
    validateMFARequirement,
    validateSessionTimeout,
    validatePassword,
    detectSuspiciousActivity,
    checkSecurityCompliance,
    hasActivePolicies: policies.some(p => p.is_active),
  }
}