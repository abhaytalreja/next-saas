import { z } from 'zod';

/**
 * Billing Configuration Schema
 * 
 * Validates payment and billing settings including:
 * - Payment processors (Stripe, PayPal, etc.)
 * - Subscription management
 * - Pricing plans and tiers
 * - Tax configuration
 * - Invoice generation
 * - Webhook handling
 */

// Payment provider enum
export const PaymentProvider = z.enum([
  'stripe',
  'paypal',
  'square',
  'braintree',
  'razorpay',
  'paddle',
  'chargebee',
  'recurly'
]);

// Currency configuration
export const Currency = z.enum([
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'SGD', 'HKD', 'CHF', 'SEK', 'NOK', 'DKK'
]);

// Stripe configuration schema
const stripeConfigSchema = z.object({
  publishableKey: z.string().min(1, 'Stripe publishable key is required'),
  secretKey: z.string().min(1, 'Stripe secret key is required'),
  webhookSecret: z.string().min(1, 'Stripe webhook secret is required'),
  apiVersion: z.string().default('2023-10-16'),
  connectAccountId: z.string().optional(),
  
  // Stripe Connect configuration
  connect: z.object({
    enabled: z.boolean().default(false),
    clientId: z.string().optional(),
    applicationFee: z.number().min(0).max(100).default(0),
  }).default({}),
}).describe('Stripe payment processor configuration');

// PayPal configuration schema
const paypalConfigSchema = z.object({
  clientId: z.string().min(1, 'PayPal client ID is required'),
  clientSecret: z.string().min(1, 'PayPal client secret is required'),
  mode: z.enum(['sandbox', 'live']).default('sandbox'),
  webhookId: z.string().optional(),
}).describe('PayPal payment processor configuration');

// Square configuration schema
const squareConfigSchema = z.object({
  applicationId: z.string().min(1, 'Square application ID is required'),
  accessToken: z.string().min(1, 'Square access token is required'),
  environment: z.enum(['sandbox', 'production']).default('sandbox'),
  locationId: z.string().optional(),
  webhookSignatureKey: z.string().optional(),
}).describe('Square payment processor configuration');

// Subscription plan configuration
const subscriptionPlanSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  currency: Currency,
  interval: z.enum(['day', 'week', 'month', 'year']),
  intervalCount: z.number().int().min(1).default(1),
  trialPeriodDays: z.number().int().min(0).default(0),
  
  // Plan features and limits
  features: z.array(z.string()).default([]),
  limits: z.record(z.string(), z.number()).default({}),
  
  // Stripe-specific fields
  stripePriceId: z.string().optional(),
  stripeProductId: z.string().optional(),
  
  // Plan metadata
  metadata: z.record(z.string(), z.string()).default({}),
  active: z.boolean().default(true),
  popular: z.boolean().default(false),
  
  // Setup fees and discounts
  setupFee: z.number().min(0).default(0),
  discount: z.object({
    type: z.enum(['percent', 'amount']),
    value: z.number().min(0),
    duration: z.enum(['once', 'repeating', 'forever']),
    durationInMonths: z.number().int().min(1).optional(),
  }).optional(),
}).describe('Subscription plan configuration');

// Tax configuration
const taxConfigSchema = z.object({
  enabled: z.boolean().default(false),
  provider: z.enum(['stripe-tax', 'taxjar', 'avalara', 'manual']).default('manual'),
  
  // Default tax rates by region
  defaultRates: z.record(z.string(), z.number().min(0).max(100)).default({}),
  
  // Tax-inclusive pricing
  inclusive: z.boolean().default(false),
  
  // Stripe Tax configuration
  stripeTax: z.object({
    enabled: z.boolean().default(false),
    taxBehavior: z.enum(['inclusive', 'exclusive']).default('exclusive'),
  }).default({}),
  
  // TaxJar configuration
  taxjar: z.object({
    apiToken: z.string().optional(),
    nexusStates: z.array(z.string()).default([]),
  }).optional(),
  
  // Manual tax configuration
  manual: z.object({
    rates: z.array(z.object({
      country: z.string(),
      state: z.string().optional(),
      city: z.string().optional(),
      rate: z.number().min(0).max(100),
      name: z.string(),
    })).default([]),
  }).default({}),
}).describe('Tax calculation configuration');

// Invoice configuration
const invoiceConfigSchema = z.object({
  enabled: z.boolean().default(true),
  
  // Invoice numbering
  numberFormat: z.string().default('INV-{{year}}-{{month}}-{{sequence}}'),
  startingNumber: z.number().int().min(1).default(1000),
  
  // Invoice terms and conditions
  terms: z.string().default('Payment is due within 30 days'),
  notes: z.string().optional(),
  footer: z.string().optional(),
  
  // Invoice delivery
  autoSend: z.boolean().default(true),
  emailTemplate: z.string().default('invoice'),
  
  // Payment terms
  paymentTerms: z.object({
    dueDays: z.number().int().min(0).default(30),
    lateFeePercentage: z.number().min(0).max(100).default(0),
    lateFeeDays: z.number().int().min(1).default(30),
  }).default({}),
  
  // Invoice branding
  branding: z.object({
    logo: z.string().optional(),
    primaryColor: z.string().default('#000000'),
    accentColor: z.string().default('#6366f1'),
    companyName: z.string().optional(),
    companyAddress: z.string().optional(),
    companyPhone: z.string().optional(),
    companyEmail: z.string().email().optional(),
    companyWebsite: z.string().url().optional(),
  }).default({}),
}).describe('Invoice generation configuration');

// Webhook configuration
const webhookConfigSchema = z.object({
  enabled: z.boolean().default(true),
  url: z.string().url().optional(),
  secret: z.string().optional(),
  
  // Webhook events to listen for
  events: z.array(z.enum([
    'payment.succeeded',
    'payment.failed',
    'subscription.created',
    'subscription.updated',
    'subscription.deleted',
    'subscription.trial.ending',
    'invoice.created',
    'invoice.paid',
    'invoice.payment.failed',
    'customer.created',
    'customer.updated',
    'customer.deleted',
    'refund.created',
    'dispute.created',
  ])).default([
    'payment.succeeded',
    'payment.failed',
    'subscription.updated',
    'invoice.payment.failed',
  ]),
  
  // Webhook retry configuration
  retries: z.object({
    maxAttempts: z.number().int().min(1).default(3),
    backoffMultiplier: z.number().min(1).default(2),
    initialDelay: z.number().int().min(1000).default(1000),
    maxDelay: z.number().int().min(1000).default(300000), // 5 minutes
  }).default({}),
  
  // Webhook security
  verifySignature: z.boolean().default(true),
  tolerance: z.number().int().min(0).default(300), // 5 minutes
}).describe('Webhook configuration for billing events');

// Dunning management (failed payment handling)
const dunningConfigSchema = z.object({
  enabled: z.boolean().default(true),
  
  // Retry schedule for failed payments
  retrySchedule: z.array(z.number().int().min(1)).default([1, 3, 7, 14]), // Days
  
  // Email notifications
  notifications: z.object({
    enabled: z.boolean().default(true),
    templates: z.object({
      paymentFailed: z.string().default('payment-failed'),
      retryScheduled: z.string().default('payment-retry'),
      subscriptionCanceled: z.string().default('subscription-canceled'),
    }).default({}),
  }).default({}),
  
  // Actions after all retries fail
  finalAction: z.enum(['cancel', 'downgrade', 'suspend']).default('cancel'),
  downgradeToFreePlan: z.boolean().default(false),
  
  // Grace period before taking action
  gracePeriodDays: z.number().int().min(0).default(3),
}).describe('Dunning management configuration');

// Analytics and reporting
const analyticsConfigSchema = z.object({
  enabled: z.boolean().default(true),
  
  // Revenue tracking
  trackRevenue: z.boolean().default(true),
  trackMRR: z.boolean().default(true),
  trackARR: z.boolean().default(true),
  trackChurn: z.boolean().default(true),
  trackLTV: z.boolean().default(true),
  
  // Cohort analysis
  cohortAnalysis: z.boolean().default(false),
  
  // Third-party analytics
  integrations: z.object({
    googleAnalytics: z.object({
      enabled: z.boolean().default(false),
      trackingId: z.string().optional(),
      enhancedEcommerce: z.boolean().default(false),
    }).default({}),
    mixpanel: z.object({
      enabled: z.boolean().default(false),
      projectToken: z.string().optional(),
    }).default({}),
    amplitude: z.object({
      enabled: z.boolean().default(false),
      apiKey: z.string().optional(),
    }).default({}),
  }).default({}),
}).describe('Billing analytics configuration');

// Main billing configuration schema
export const billingConfigSchema = z.object({
  // Payment provider
  provider: PaymentProvider.default('stripe'),
  
  // Provider-specific configurations
  stripe: stripeConfigSchema.optional(),
  paypal: paypalConfigSchema.optional(),
  square: squareConfigSchema.optional(),
  
  // Global billing settings
  currency: Currency.default('USD'),
  
  // Test mode
  testMode: z.boolean().default(true),
  
  // Subscription plans
  plans: z.array(subscriptionPlanSchema).default([]),
  
  // Tax configuration
  tax: taxConfigSchema.default({}),
  
  // Invoice configuration
  invoices: invoiceConfigSchema.default({}),
  
  // Webhook configuration
  webhooks: webhookConfigSchema.default({}),
  
  // Dunning management
  dunning: dunningConfigSchema.default({}),
  
  // Analytics and reporting
  analytics: analyticsConfigSchema.default({}),
  
  // Feature flags
  features: z.object({
    subscriptions: z.boolean().default(true),
    oneTimePayments: z.boolean().default(true),
    refunds: z.boolean().default(true),
    prorations: z.boolean().default(true),
    coupons: z.boolean().default(true),
    trials: z.boolean().default(true),
    usage: z.boolean().default(false),
  }).default({}),
  
  // Compliance and security
  compliance: z.object({
    pciCompliant: z.boolean().default(true),
    gdprCompliant: z.boolean().default(true),
    soc2Compliant: z.boolean().default(false),
    dataRetentionDays: z.number().int().min(30).default(2555), // 7 years
  }).default({}),
  
}).describe('Billing and payment configuration settings');

// Export types
export type BillingConfig = z.infer<typeof billingConfigSchema>;
export type PaymentProvider = z.infer<typeof PaymentProvider>;
export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;
export type Currency = z.infer<typeof Currency>;

// Environment-specific billing configurations
export const developmentBillingDefaults: Partial<BillingConfig> = {
  provider: 'stripe',
  currency: 'USD',
  testMode: true,
  stripe: {
    publishableKey: 'pk_test_...',
    secretKey: 'sk_test_...',
    webhookSecret: 'whsec_...',
    apiVersion: '2023-10-16',
  },
  plans: [
    {
      id: 'free',
      name: 'Free',
      description: 'Free plan for development',
      price: 0,
      currency: 'USD',
      interval: 'month',
      features: ['Basic features', '100 API calls/month'],
      limits: { apiCalls: 100, users: 1 },
      active: true,
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Pro plan for development',
      price: 9.99,
      currency: 'USD',
      interval: 'month',
      trialPeriodDays: 14,
      features: ['All features', 'Unlimited API calls'],
      limits: { apiCalls: -1, users: 10 },
      active: true,
      popular: true,
    },
  ],
  tax: {
    enabled: false,
  },
  webhooks: {
    enabled: true,
    url: 'http://localhost:3000/api/webhooks/billing',
  },
  dunning: {
    enabled: false,
  },
  analytics: {
    enabled: true,
    trackRevenue: true,
    trackMRR: false,
  },
};

export const productionBillingDefaults: Partial<BillingConfig> = {
  testMode: false,
  tax: {
    enabled: true,
    stripeTax: {
      enabled: true,
      taxBehavior: 'exclusive',
    },
  },
  invoices: {
    enabled: true,
    autoSend: true,
    paymentTerms: {
      dueDays: 30,
      lateFeePercentage: 1.5,
      lateFeeDays: 30,
    },
  },
  dunning: {
    enabled: true,
    retrySchedule: [1, 3, 7, 14],
    notifications: {
      enabled: true,
    },
    finalAction: 'cancel',
    gracePeriodDays: 3,
  },
  analytics: {
    enabled: true,
    trackRevenue: true,
    trackMRR: true,
    trackARR: true,
    trackChurn: true,
    trackLTV: true,
    cohortAnalysis: true,
  },
  compliance: {
    pciCompliant: true,
    gdprCompliant: true,
    soc2Compliant: true,
  },
};

export const testBillingDefaults: Partial<BillingConfig> = {
  provider: 'stripe',
  currency: 'USD',
  testMode: true,
  plans: [
    {
      id: 'test-free',
      name: 'Test Free',
      description: 'Test free plan',
      price: 0,
      currency: 'USD',
      interval: 'month',
      features: ['Test features'],
      limits: { apiCalls: 10 },
      active: true,
    },
  ],
  tax: {
    enabled: false,
  },
  webhooks: {
    enabled: false,
  },
  dunning: {
    enabled: false,
  },
  analytics: {
    enabled: false,
  },
};