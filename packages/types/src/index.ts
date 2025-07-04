// Common types used across the application

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface User {
  id: string
  email: string
  name?: string
  image?: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  createdAt: Date
  updatedAt: Date
}

export interface Organization {
  id: string
  name: string
  slug: string
  image?: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  id: string
  organizationId: string
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  priceId: string
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
}

export interface Plan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
}

// API Error types
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Form types
export interface FormState {
  message?: string
  errors?: Record<string, string[]>
  success?: boolean
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'

// Navigation types
export interface NavItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
  external?: boolean
  label?: string
}

// Export use case configuration types
export * from './use-case-config';