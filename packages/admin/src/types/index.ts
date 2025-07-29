// Dashboard types
export interface AdminMetrics {
  // User metrics
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  userGrowthRate: number
  userRetentionRate: number

  // Organization metrics
  totalOrganizations: number
  activeOrganizations: number
  newOrganizationsToday: number
  organizationGrowthRate: number

  // Revenue metrics
  monthlyRecurringRevenue: number
  totalRevenue: number
  averageRevenuePerUser: number
  revenueGrowthRate: number
  churnRate: number

  // System metrics
  systemUptime: number
  apiResponseTime: number
  errorRate: number
  activeConnections: number

  // Email metrics
  emailsSentToday: number
  emailDeliveryRate: number
  campaignsActive: number
  subscriberCount: number

  // Security metrics
  failedLogins?: number
  activeSessions?: number

  // System performance metrics (for real-time updates)
  cpuUsage?: number
  memoryUsage?: number
  diskUsage?: number

  // Recent activity
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  description: string
  timestamp: string
  type: 'user' | 'organization' | 'system' | 'email' | 'billing'
  userId?: string
  metadata?: Record<string, any>
}

// User management types
export interface AdminUser {
  id: string
  email: string
  name: string | null
  avatar_url?: string | null
  status: 'active' | 'inactive' | 'suspended' | 'invited'
  is_system_admin: boolean
  organizations: UserOrganization[]
  last_seen_at: string | null
  created_at: string
  updated_at: string
  
  // Admin-specific fields
  email_verified_at: string | null
  login_count: number
  last_ip: string | null
  subscription_status?: string
}

export interface UserOrganization {
  id: string
  name: string
  role: string
  joined_at: string
  status?: string
  member_count?: number
  plan?: string
  created_at?: string
  permissions?: string[]
}

// Organization management types
export interface AdminOrganization {
  id: string
  name: string
  slug: string
  status: 'active' | 'suspended' | 'deleted'
  plan: string
  member_count: number
  monthly_revenue: number
  storage_used: number
  storage_limit: number
  created_at: string
  updated_at: string
  owner: {
    id: string
    name: string
    email: string
  }
}

// Analytics types
export interface AnalyticsData {
  userGrowth: TimeSeriesData[]
  revenueGrowth: TimeSeriesData[]
  organizationGrowth: TimeSeriesData[]
  engagementMetrics: TimeSeriesData[]
}

export interface TimeSeriesData {
  date: string
  value: number
  label?: string
}

// System health types
export interface SystemHealthData {
  database: ServiceStatus
  api: ServiceStatus
  email: ServiceStatus
  storage: ServiceStatus
  
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkIO: number
  
  recentErrors: SystemEvent[]
  recentAlerts: SystemEvent[]
}

export interface ServiceStatus {
  name: string
  status: 'healthy' | 'warning' | 'error' | 'maintenance'
  responseTime: number
  uptime: number
  lastCheck: string
}

export interface SystemEvent {
  id: string
  type: 'error' | 'warning' | 'info'
  message: string
  timestamp: string
  service?: string
  metadata?: Record<string, any>
}

// Security types
export interface AuditLog {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id?: string
  details: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface SecurityAlert {
  id: string
  type: 'suspicious_activity' | 'failed_login' | 'data_breach' | 'unauthorized_access'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  user_id?: string
  ip_address?: string
  resolved: boolean
  created_at: string
}

// API response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
  metadata?: {
    total?: number
    page?: number
    limit?: number
  }
}

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
}

// Filter types
export interface UserFilters {
  search?: string
  status?: string
  role?: string
  organizationId?: string
}

export interface OrganizationFilters {
  search?: string
  status?: string
  plan?: string
}

// Export utility type for hook returns
export interface UseAdminHookReturn<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}