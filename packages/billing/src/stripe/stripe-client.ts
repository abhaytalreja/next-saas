import Stripe from 'stripe'
import type { StripeConfig } from '../types'

let stripeInstance: Stripe | null = null

export function getStripeClient(config?: StripeConfig): Stripe {
  if (stripeInstance) {
    return stripeInstance
  }

  const stripeConfig: StripeConfig = config || {
    secret_key: process.env.STRIPE_SECRET_KEY!,
    publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
    api_version: '2023-10-16' as Stripe.LatestApiVersion
  }

  if (!stripeConfig.secret_key) {
    throw new Error('Stripe secret key is required')
  }

  stripeInstance = new Stripe(stripeConfig.secret_key, {
    apiVersion: stripeConfig.api_version || '2023-10-16',
    typescript: true,
  })

  return stripeInstance
}

export function validateStripeConfig(): boolean {
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 
    'STRIPE_WEBHOOK_SECRET'
  ]

  return requiredVars.every(varName => !!process.env[varName])
}

export function getStripePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!key) {
    throw new Error('Stripe publishable key is required')
  }
  return key
}