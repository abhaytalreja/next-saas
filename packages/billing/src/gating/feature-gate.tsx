'use client'

import React, { ReactNode } from 'react'
import { useBillingSubscription } from '../hooks/use-billing-subscription'
import { usePlanFeatures } from '../hooks/use-plan-features'

interface FeatureGateProps {
  feature: string
  fallback?: ReactNode
  upgradePrompt?: ReactNode
  children: ReactNode
  organizationId?: string
  showUpgradePrompt?: boolean
}

/**
 * Component that conditionally renders children based on subscription features
 */
export function FeatureGate({
  feature,
  fallback = null,
  upgradePrompt,
  children,
  organizationId,
  showUpgradePrompt = true
}: FeatureGateProps) {
  const { subscription, isLoading: subLoading } = useBillingSubscription(organizationId)
  const { hasFeature, isLoading: featuresLoading } = usePlanFeatures(
    subscription?.plan_id,
    feature
  )

  const isLoading = subLoading || featuresLoading

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-8 rounded" />
  }

  if (hasFeature) {
    return <>{children}</>
  }

  if (upgradePrompt && showUpgradePrompt) {
    return <>{upgradePrompt}</>
  }

  return <>{fallback}</>
}

/**
 * Higher-order component for feature gating
 */
export function withFeatureGate<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: string,
  fallback?: ReactNode
) {
  return function FeatureGatedComponent(props: P & { organizationId?: string }) {
    const { organizationId, ...componentProps } = props

    return (
      <FeatureGate
        feature={feature}
        fallback={fallback}
        organizationId={organizationId}
      >
        <WrappedComponent {...(componentProps as P)} />
      </FeatureGate>
    )
  }
}

/**
 * Hook for imperative feature checking
 */
export function useFeatureGate(feature: string, organizationId?: string) {
  const { subscription, isLoading: subLoading } = useBillingSubscription(organizationId)
  const { hasFeature, isLoading: featuresLoading } = usePlanFeatures(
    subscription?.plan_id,
    feature
  )

  return {
    hasFeature,
    isLoading: subLoading || featuresLoading,
    subscription
  }
}

/**
 * Multiple feature gate - all features must be available
 */
export function MultiFeatureGate({
  features,
  fallback = null,
  upgradePrompt,
  children,
  organizationId,
  showUpgradePrompt = true,
  requireAll = true
}: {
  features: string[]
  fallback?: ReactNode
  upgradePrompt?: ReactNode
  children: ReactNode
  organizationId?: string
  showUpgradePrompt?: boolean
  requireAll?: boolean
}) {
  const { subscription, isLoading: subLoading } = useBillingSubscription(organizationId)
  const planId = subscription?.plan_id

  // Check each feature
  const featureChecks = features.map(feature => 
    usePlanFeatures(planId, feature)
  )

  const isLoading = subLoading || featureChecks.some(check => check.isLoading)
  const hasAllFeatures = featureChecks.every(check => check.hasFeature)
  const hasSomeFeatures = featureChecks.some(check => check.hasFeature)

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-8 rounded" />
  }

  const hasRequiredFeatures = requireAll ? hasAllFeatures : hasSomeFeatures

  if (hasRequiredFeatures) {
    return <>{children}</>
  }

  if (upgradePrompt && showUpgradePrompt) {
    return <>{upgradePrompt}</>
  }

  return <>{fallback}</>
}

/**
 * Usage-based feature gate - checks quota limits
 */
export function UsageFeatureGate({
  feature,
  requestedQuantity = 1,
  fallback = null,
  quotaExceededPrompt,
  children,
  organizationId,
  showQuotaPrompt = true
}: {
  feature: string
  requestedQuantity?: number
  fallback?: ReactNode
  quotaExceededPrompt?: ReactNode
  children: ReactNode
  organizationId?: string
  showQuotaPrompt?: boolean
}) {
  // This would use a quota checking hook
  // const { canPerform, isLoading } = useQuotaCheck(
  //   organizationId,
  //   feature,
  //   requestedQuantity
  // )

  // Placeholder implementation
  const canPerform = true
  const isLoading = false

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-8 rounded" />
  }

  if (canPerform) {
    return <>{children}</>
  }

  if (quotaExceededPrompt && showQuotaPrompt) {
    return <>{quotaExceededPrompt}</>
  }

  return <>{fallback}</>
}