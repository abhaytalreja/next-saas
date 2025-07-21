import { createClient } from '@nextsaas/supabase/server'
import type { 
  BillingCalculator,
  BillingPlan,
  UsageSummary,
  UsageCostCalculation,
  UsageInvoiceDetail,
  TierUsageBreakdown,
  UpgradePreview,
  Invoice,
  DateRange
} from '../types'

export class BillingCalculationService implements BillingCalculator {
  private supabase = createClient()

  /**
   * Calculate total cost for usage based on a billing plan
   */
  async calculateUsageCost(
    usage: UsageSummary[],
    plan: BillingPlan,
    period: DateRange
  ): Promise<UsageCostCalculation> {
    const usageDetails: UsageInvoiceDetail[] = []
    let totalUsageCost = 0

    for (const usageSummary of usage) {
      const pricing = plan.usage_pricing.find(p => p.metric_id === usageSummary.metric_id)
      if (!pricing) continue

      const costCalculation = await this.calculateMetricCost(usageSummary, pricing)
      usageDetails.push(costCalculation)
      totalUsageCost += costCalculation.total_cost
    }

    return {
      total_cost: plan.base_price + totalUsageCost,
      base_cost: plan.base_price,
      usage_cost: totalUsageCost,
      currency: plan.currency,
      usage_details: usageDetails,
      period
    }
  }

  /**
   * Calculate cost for a specific metric based on pricing model
   */
  private async calculateMetricCost(
    usage: UsageSummary,
    pricing: any // UsagePricing type
  ): Promise<UsageInvoiceDetail> {
    const totalUsage = usage.total_usage
    const freeTier = pricing.free_tier || 0
    const billableUsage = Math.max(0, totalUsage - freeTier)

    let totalCost = 0
    let tierBreakdown: TierUsageBreakdown[] = []

    switch (pricing.pricing_model) {
      case 'per_unit':
        totalCost = billableUsage * (pricing.unit_price || 0)
        break

      case 'tiered':
        const result = this.calculateTieredPricing(billableUsage, pricing.tiers || [])
        totalCost = result.totalCost
        tierBreakdown = result.tierBreakdown
        break

      case 'volume':
        totalCost = this.calculateVolumePricing(billableUsage, pricing.tiers || [])
        break

      case 'graduated':
        const graduatedResult = this.calculateGraduatedPricing(billableUsage, pricing.tiers || [])
        totalCost = graduatedResult.totalCost
        tierBreakdown = graduatedResult.tierBreakdown
        break

      default:
        totalCost = 0
    }

    return {
      metric_id: usage.metric_id,
      metric_name: usage.metric_name,
      total_usage: totalUsage,
      unit: usage.unit,
      unit_price: pricing.unit_price || 0,
      total_cost: totalCost,
      free_tier_used: Math.min(totalUsage, freeTier),
      billable_usage: billableUsage,
      tier_breakdown: tierBreakdown.length > 0 ? tierBreakdown : undefined
    }
  }

  /**
   * Calculate tiered pricing (pay different rates for different tiers)
   */
  private calculateTieredPricing(
    usage: number, 
    tiers: any[]
  ): { totalCost: number; tierBreakdown: TierUsageBreakdown[] } {
    let totalCost = 0
    let remainingUsage = usage
    const tierBreakdown: TierUsageBreakdown[] = []

    for (const tier of tiers.sort((a, b) => a.from - b.from)) {
      if (remainingUsage <= 0) break

      const tierStart = tier.from
      const tierEnd = tier.to || Infinity
      const tierCapacity = tierEnd - tierStart
      const usageInTier = Math.min(remainingUsage, tierCapacity)

      if (usageInTier > 0) {
        const tierCost = usageInTier * tier.unit_price + (tier.flat_fee || 0)
        totalCost += tierCost
        remainingUsage -= usageInTier

        tierBreakdown.push({
          tier_from: tierStart,
          tier_to: tier.to,
          usage_in_tier: usageInTier,
          unit_price: tier.unit_price,
          tier_cost: tierCost
        })
      }
    }

    return { totalCost, tierBreakdown }
  }

  /**
   * Calculate volume pricing (all usage charged at rate of highest tier reached)
   */
  private calculateVolumePricing(usage: number, tiers: any[]): number {
    const sortedTiers = tiers.sort((a, b) => a.from - b.from)
    
    for (let i = sortedTiers.length - 1; i >= 0; i--) {
      const tier = sortedTiers[i]
      if (usage >= tier.from) {
        return usage * tier.unit_price + (tier.flat_fee || 0)
      }
    }

    return 0
  }

  /**
   * Calculate graduated pricing (cumulative tier pricing)
   */
  private calculateGraduatedPricing(
    usage: number, 
    tiers: any[]
  ): { totalCost: number; tierBreakdown: TierUsageBreakdown[] } {
    let totalCost = 0
    let processedUsage = 0
    const tierBreakdown: TierUsageBreakdown[] = []

    for (const tier of tiers.sort((a, b) => a.from - b.from)) {
      const tierStart = tier.from
      const tierEnd = tier.to || Infinity
      
      if (usage <= tierStart) break

      const usageInTier = Math.min(usage - tierStart, tierEnd - tierStart)
      const tierCost = usageInTier * tier.unit_price + (tier.flat_fee || 0)
      
      totalCost += tierCost
      processedUsage += usageInTier

      tierBreakdown.push({
        tier_from: tierStart,
        tier_to: tier.to,
        usage_in_tier: usageInTier,
        unit_price: tier.unit_price,
        tier_cost: tierCost
      })

      if (processedUsage >= usage) break
    }

    return { totalCost, tierBreakdown }
  }

  /**
   * Generate a complete invoice for an organization
   */
  async generateInvoice(
    organizationId: string,
    subscriptionId: string,
    period: DateRange
  ): Promise<Invoice> {
    // Get subscription and plan
    const { data: subscription } = await this.supabase
      .from('subscriptions')
      .select(`
        *,
        plans (*)
      `)
      .eq('id', subscriptionId)
      .single()

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    // Get usage for the period
    const { data: usage } = await this.supabase
      .rpc('get_organization_usage_for_period', {
        org_id: organizationId,
        start_date: period.start,
        end_date: period.end
      })

    // Calculate costs
    const costCalculation = await this.calculateUsageCost(
      usage || [],
      subscription.plans,
      period
    )

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber()

    // Create invoice
    const invoice: Invoice = {
      id: crypto.randomUUID(),
      organization_id: organizationId,
      subscription_id: subscriptionId,
      invoice_number: invoiceNumber,
      amount_due: costCalculation.total_cost,
      amount_paid: 0,
      currency: subscription.plans.currency,
      status: 'draft',
      period_start: period.start,
      period_end: period.end,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      line_items: [
        {
          id: crypto.randomUUID(),
          description: `${subscription.plans.name} - Base Subscription`,
          quantity: 1,
          unit_price: subscription.plans.base_price,
          amount: subscription.plans.base_price,
          period_start: period.start,
          period_end: period.end
        },
        ...costCalculation.usage_details.map(detail => ({
          id: crypto.randomUUID(),
          description: `${detail.metric_name} - Usage`,
          quantity: detail.billable_usage,
          unit_price: detail.unit_price,
          amount: detail.total_cost,
          period_start: period.start,
          period_end: period.end
        }))
      ],
      usage_details: costCalculation.usage_details,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Save invoice to database
    const { error } = await this.supabase
      .from('invoices')
      .insert(invoice)

    if (error) {
      throw new Error(`Failed to generate invoice: ${error.message}`)
    }

    return invoice
  }

  /**
   * Preview costs and changes for a plan upgrade
   */
  async previewUpgrade(
    organizationId: string,
    targetPlanId: string
  ): Promise<UpgradePreview> {
    // Get current subscription and plan
    const { data: currentSubscription } = await this.supabase
      .from('subscriptions')
      .select(`
        *,
        plans (*)
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .single()

    if (!currentSubscription) {
      throw new Error('No active subscription found')
    }

    // Get target plan
    const { data: targetPlan } = await this.supabase
      .from('plans')
      .select('*')
      .eq('id', targetPlanId)
      .single()

    if (!targetPlan) {
      throw new Error('Target plan not found')
    }

    // Calculate prorated amount for current billing period
    const now = new Date()
    const periodStart = new Date(currentSubscription.current_period_start)
    const periodEnd = new Date(currentSubscription.current_period_end)
    const totalDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
    const remainingDays = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    const currentPlanDailyRate = currentSubscription.plans.base_price / totalDays
    const targetPlanDailyRate = targetPlan.base_price / totalDays
    
    const proratedAmount = (targetPlanDailyRate - currentPlanDailyRate) * remainingDays

    // Get recent usage to estimate next invoice
    const { data: recentUsage } = await this.supabase
      .rpc('get_organization_usage_for_period', {
        org_id: organizationId,
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date().toISOString()
      })

    const estimatedNextInvoice = await this.calculateUsageCost(
      recentUsage || [],
      targetPlan,
      {
        start: periodEnd.toISOString(),
        end: new Date(periodEnd.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    )

    return {
      current_plan: currentSubscription.plans,
      target_plan: targetPlan,
      prorated_amount: Math.max(0, proratedAmount),
      next_invoice_amount: estimatedNextInvoice.total_cost,
      effective_date: now.toISOString(),
      billing_cycle_impact: proratedAmount > 0 
        ? `You'll be charged $${proratedAmount.toFixed(2)} today for the upgrade, then $${targetPlan.base_price.toFixed(2)} on your next billing cycle.`
        : `Your next billing cycle will be $${targetPlan.base_price.toFixed(2)}.`
    }
  }

  /**
   * Generate a unique invoice number
   */
  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    
    // Get the count of invoices this month
    const { count } = await this.supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${year}-${month}-01`)
      .lt('created_at', `${year}-${String(parseInt(month) + 1).padStart(2, '0')}-01`)

    const sequence = String((count || 0) + 1).padStart(4, '0')
    return `INV-${year}${month}-${sequence}`
  }

  /**
   * Calculate cost breakdown by metric
   */
  async getCostBreakdown(
    organizationId: string,
    period: DateRange
  ): Promise<{ total: number; breakdown: Record<string, number> }> {
    const { data: usage } = await this.supabase
      .rpc('get_organization_usage_for_period', {
        org_id: organizationId,
        start_date: period.start,
        end_date: period.end
      })

    if (!usage || usage.length === 0) {
      return { total: 0, breakdown: {} }
    }

    // Get the organization's current plan
    const { data: subscription } = await this.supabase
      .from('subscriptions')
      .select(`
        *,
        plans (*)
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .single()

    if (!subscription) {
      return { total: 0, breakdown: {} }
    }

    const costCalculation = await this.calculateUsageCost(
      usage,
      subscription.plans,
      period
    )

    const breakdown: Record<string, number> = {
      'Base Subscription': subscription.plans.base_price
    }

    for (const detail of costCalculation.usage_details) {
      breakdown[detail.metric_name] = detail.total_cost
    }

    return {
      total: costCalculation.total_cost,
      breakdown
    }
  }
}