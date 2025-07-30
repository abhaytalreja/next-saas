'use client'

import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@nextsaas/supabase'
import type { Plan } from '../types'

export function usePlanFeatures(planId?: string, feature?: string) {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!planId) {
      setIsLoading(false)
      return
    }

    const fetchPlan = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('id', planId)
          .single()

        if (error) {
          throw error
        }

        setPlan(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching plan:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch plan')
        setPlan(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlan()
  }, [planId, supabase])

  const features = plan?.features as string[] | undefined
  const limits = plan?.limits as Record<string, number> | undefined

  const hasFeature = feature ? features?.includes(feature) ?? false : false
  const getFeatureLimit = (featureName: string) => limits?.[featureName]

  return {
    plan,
    features: features || [],
    limits: limits || {},
    hasFeature,
    getFeatureLimit,
    isLoading,
    error
  }
}

export function useMultiplePlanFeatures(planId?: string, featureList?: string[]) {
  const { plan, features, limits, isLoading, error } = usePlanFeatures(planId)

  const checkFeatures = (requiredFeatures: string[]) => {
    if (!features.length) return {}
    
    return requiredFeatures.reduce((acc, feature) => ({
      ...acc,
      [feature]: features.includes(feature)
    }), {})
  }

  const hasAllFeatures = (requiredFeatures: string[]) => {
    return requiredFeatures.every(feature => features.includes(feature))
  }

  const hasAnyFeature = (requiredFeatures: string[]) => {
    return requiredFeatures.some(feature => features.includes(feature))
  }

  const featureStatus = featureList ? checkFeatures(featureList) : {}

  return {
    plan,
    features,
    limits,
    featureStatus,
    hasAllFeatures,
    hasAnyFeature,
    checkFeatures,
    isLoading,
    error
  }
}