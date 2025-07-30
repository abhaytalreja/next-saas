import type { BillingCustomer, StripeCustomerData } from '../types'
import { getStripeClient } from './stripe-client'

export class CustomerService {
  private stripe = getStripeClient()

  /**
   * Create or retrieve Stripe customer for organization
   */
  async ensureStripeCustomer(
    organizationId: string,
    email: string,
    name?: string,
    metadata?: Record<string, string>
  ): Promise<StripeCustomerData> {
    // Check if customer already exists by searching metadata
    const existingCustomers = await this.stripe.customers.list({
      email,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      const customer = existingCustomers.data[0]
      
      // Update metadata if needed
      if (metadata && !customer.metadata.organization_id) {
        await this.stripe.customers.update(customer.id, {
          metadata: {
            ...customer.metadata,
            organization_id: organizationId,
            ...metadata
          }
        })
      }

      return {
        id: customer.id,
        email: customer.email!,
        name: customer.name || undefined,
        metadata: customer.metadata,
        created: customer.created,
        subscriptions: customer.subscriptions
      }
    }

    // Create new customer
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata: {
        organization_id: organizationId,
        ...metadata
      }
    })

    return {
      id: customer.id,
      email: customer.email!,
      name: customer.name || undefined,
      metadata: customer.metadata,
      created: customer.created,
      subscriptions: customer.subscriptions
    }
  }

  /**
   * Get customer by Stripe customer ID
   */
  async getCustomer(customerId: string): Promise<StripeCustomerData | null> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId, {
        expand: ['subscriptions']
      })

      if (customer.deleted) {
        return null
      }

      return {
        id: customer.id,
        email: customer.email!,
        name: customer.name || undefined,
        metadata: customer.metadata,
        created: customer.created,
        subscriptions: customer.subscriptions
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('No such customer')) {
        return null
      }
      throw error
    }
  }

  /**
   * Update customer information
   */
  async updateCustomer(
    customerId: string,
    updates: {
      email?: string
      name?: string
      metadata?: Record<string, string>
    }
  ): Promise<StripeCustomerData> {
    const customer = await this.stripe.customers.update(customerId, updates)

    return {
      id: customer.id,
      email: customer.email!,
      name: customer.name || undefined,
      metadata: customer.metadata,
      created: customer.created,
      subscriptions: customer.subscriptions
    }
  }

  /**
   * Delete customer (marks as deleted in Stripe)
   */
  async deleteCustomer(customerId: string): Promise<void> {
    await this.stripe.customers.del(customerId)
  }

  /**
   * Get customer by organization ID from metadata
   */
  async getCustomerByOrganization(organizationId: string): Promise<StripeCustomerData | null> {
    const customers = await this.stripe.customers.list({
      limit: 1
    })

    const customer = customers.data.find(c => 
      c.metadata.organization_id === organizationId
    )

    if (!customer) {
      return null
    }

    return this.getCustomer(customer.id)
  }
}