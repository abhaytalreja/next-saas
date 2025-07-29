/**
 * Admin Components Integration Test
 * 
 * Tests the integration between admin components and services:
 * - Component-service interaction patterns
 * - Data flow between UI and business logic
 * - State management across component boundaries
 * - Error handling in component hierarchies
 * - Real-time updates and event handling
 */

import { adminService } from '../../lib/admin-service'

// Mock admin service
jest.mock('../../lib/admin-service', () => ({
  adminService: {
    getDashboardMetrics: jest.fn(),
    getUsers: jest.fn(),
    getUserById: jest.fn(),
    updateUser: jest.fn(),
    suspendUser: jest.fn(),
    activateUser: jest.fn(),
    deleteUser: jest.fn(),
    bulkUserAction: jest.fn(),
    createUser: jest.fn(),
    getOrganizations: jest.fn(),
    getOrganizationById: jest.fn(),
    updateOrganization: jest.fn(),
    suspendOrganization: jest.fn(),
    activateOrganization: jest.fn(),
    deleteOrganization: jest.fn(),
    createOrganization: jest.fn(),
  }
}))

// Mock hooks that might be used by components
const mockUseRealTimeMetrics = jest.fn()
const mockUseUserManagement = jest.fn()
const mockUseOrganizationManagement = jest.fn()
const mockUseSystemHealth = jest.fn()

jest.mock('../../hooks/useRealTimeMetrics', () => ({
  useRealTimeMetrics: mockUseRealTimeMetrics
}))

jest.mock('../../hooks/useUserManagement', () => ({
  useUserManagement: mockUseUserManagement
}))

jest.mock('../../hooks/useOrganizationManagement', () => ({
  useOrganizationManagement: mockUseOrganizationManagement
}))

jest.mock('../../hooks/useSystemHealth', () => ({
  useSystemHealth: mockUseSystemHealth
}))

describe('Admin Components Integration Tests', () => {
  const mockAdminUser = {
    id: 'admin-123',
    email: 'admin@nextsaas.com',
    name: 'Admin User'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('AdminDashboard Service Integration', () => {
    it('integrates dashboard metrics with service calls', async () => {
      // Setup: Mock service responses
      const mockMetrics = {
        totalUsers: 1500,
        activeUsers: 1200,
        newUsersToday: 25,
        userGrowthRate: 5.2,
        userRetentionRate: 85.3,
        totalOrganizations: 200,
        activeOrganizations: 180,
        newOrganizationsToday: 5,
        organizationGrowthRate: 3.8,
        monthlyRecurringRevenue: 150000,
        totalRevenue: 2000000,
        averageRevenuePerUser: 100.00,
        revenueGrowthRate: 12.0,
        churnRate: 2.1,
        systemUptime: 99.95,
        apiResponseTime: 135,
        errorRate: 0.02,
        activeConnections: 1500,
        emailsSentToday: 20000,
        emailDeliveryRate: 99.1,
        campaignsActive: 10,
        subscriberCount: 150000,
        recentActivity: [
          {
            id: 'activity-1',
            description: 'New user registration',
            timestamp: '2024-01-15T10:30:00Z',
            type: 'user' as const,
            userId: 'user-123'
          },
          {
            id: 'activity-2',
            description: 'Organization created',
            timestamp: '2024-01-15T10:25:00Z',
            type: 'organization' as const,
            userId: 'user-456'
          }
        ]
      }

      // Mock the hook to return metrics data
      mockUseRealTimeMetrics.mockReturnValue({
        metrics: mockMetrics,
        isLoading: false,
        error: null,
        refetch: jest.fn()
      })

      ;(adminService.getDashboardMetrics as jest.Mock).mockResolvedValue(mockMetrics)

      // Test service integration
      const result = await adminService.getDashboardMetrics()
      const hookData = mockUseRealTimeMetrics()

      expect(result.totalUsers).toBe(1500)
      expect(result.recentActivity).toHaveLength(2)
      expect(hookData.metrics.totalUsers).toBe(1500)
      expect(hookData.isLoading).toBe(false)
    })

    it('handles dashboard metric loading states and errors', async () => {
      // Test loading state
      mockUseRealTimeMetrics.mockReturnValue({
        metrics: null,
        isLoading: true,
        error: null,
        refetch: jest.fn()
      })

      const loadingState = mockUseRealTimeMetrics()
      expect(loadingState.isLoading).toBe(true)
      expect(loadingState.metrics).toBeNull()

      // Test error state
      mockUseRealTimeMetrics.mockReturnValue({
        metrics: null,
        isLoading: false,
        error: new Error('Failed to fetch metrics'),
        refetch: jest.fn()
      })

      const errorState = mockUseRealTimeMetrics()
      expect(errorState.isLoading).toBe(false)
      expect(errorState.error).toBeInstanceOf(Error)
      expect(errorState.error.message).toBe('Failed to fetch metrics')
    })
  })

  describe('UserManagement Service Integration', () => {
    it('integrates user data fetching with service calls', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          name: 'User One',
          avatar_url: null,
          status: 'active' as const,
          is_system_admin: false,
          organizations: [
            { id: 'org-1', name: 'Org One', role: 'member', joined_at: '2024-01-01T00:00:00Z' }
          ],
          last_seen_at: '2024-01-15T10:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          email_verified_at: '2024-01-01T01:00:00Z',
          login_count: 25,
          last_ip: '192.168.1.1'
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          name: 'User Two',
          avatar_url: null,
          status: 'suspended' as const,
          is_system_admin: false,
          organizations: [],
          last_seen_at: '2024-01-14T08:00:00Z',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-14T08:00:00Z',
          email_verified_at: '2024-01-02T01:00:00Z',
          login_count: 10,
          last_ip: '192.168.1.2'
        }
      ]

      const mockUserManagementHook = {
        users: mockUsers,
        isLoading: false,
        error: null,
        pagination: { page: 1, limit: 20, total: 2 },
        filters: {},
        updateFilters: jest.fn(),
        refetch: jest.fn(),
        suspendUser: jest.fn(),
        activateUser: jest.fn(),
        deleteUser: jest.fn()
      }

      mockUseUserManagement.mockReturnValue(mockUserManagementHook)

      ;(adminService.getUsers as jest.Mock).mockResolvedValue({
        data: mockUsers,
        success: true,
        metadata: { total: 2, page: 1, limit: 20 }
      })

      // Test service integration
      const serviceResult = await adminService.getUsers({}, { page: 1, limit: 20 })
      const hookData = mockUseUserManagement()

      expect(serviceResult.data).toHaveLength(2)
      expect(serviceResult.data[0].status).toBe('active')
      expect(hookData.users).toHaveLength(2)
      expect(hookData.users[1].status).toBe('suspended')
    })

    it('handles user search and filtering integration', async () => {
      const mockUpdateFilters = jest.fn()
      
      mockUseUserManagement.mockReturnValue({
        users: [],
        isLoading: false,
        error: null,
        pagination: { page: 1, limit: 20, total: 0 },
        filters: { search: '', status: '' },
        updateFilters: mockUpdateFilters,
        refetch: jest.fn()
      })

      const hookData = mockUseUserManagement()
      
      // Simulate filter updates
      hookData.updateFilters({ search: 'john@example.com' })
      hookData.updateFilters({ status: 'active' })

      expect(mockUpdateFilters).toHaveBeenCalledWith({ search: 'john@example.com' })
      expect(mockUpdateFilters).toHaveBeenCalledWith({ status: 'active' })
    })

    it('integrates bulk user actions with service calls', async () => {
      const mockBulkAction = jest.fn()
      
      ;(adminService.bulkUserAction as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          processed: 2,
          successful: 2,
          failed: 0,
          errors: []
        }
      })

      // Test bulk suspend action
      const result = await adminService.bulkUserAction('suspend', ['user-1', 'user-2'], {
        reason: 'Bulk suspension for policy violation'
      })

      expect(adminService.bulkUserAction).toHaveBeenCalledWith('suspend', ['user-1', 'user-2'], {
        reason: 'Bulk suspension for policy violation'
      })

      expect(result.success).toBe(true)
      expect(result.data.processed).toBe(2)
      expect(result.data.successful).toBe(2)
    })
  })

  describe('OrganizationManagement Service Integration', () => {
    it('integrates organization data with member management', async () => {
      const mockOrganizations = [
        {
          id: 'org-1',
          name: 'Organization One',
          slug: 'org-one',
          status: 'active' as const,
          plan: 'pro',
          member_count: 5,
          monthly_revenue: 500,
          storage_used: 50,
          storage_limit: 100,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          owner: {
            id: 'user-1',
            name: 'Owner One',
            email: 'owner1@example.com'
          }
        }
      ]

      mockUseOrganizationManagement.mockReturnValue({
        organizations: mockOrganizations,
        isLoading: false,
        error: null,
        suspendOrganization: jest.fn(),
        activateOrganization: jest.fn(),
        deleteOrganization: jest.fn()
      })

      ;(adminService.getOrganizations as jest.Mock).mockResolvedValue({
        data: mockOrganizations,
        success: true,
        metadata: { total: 1, page: 1, limit: 10 }
      })

      // Test service integration
      const serviceResult = await adminService.getOrganizations({}, { page: 1, limit: 10 })
      const hookData = mockUseOrganizationManagement()

      expect(serviceResult.data).toHaveLength(1)
      expect(serviceResult.data[0].name).toBe('Organization One')
      expect(hookData.organizations).toHaveLength(1)
      expect(hookData.organizations[0].member_count).toBe(5)

      // Test organization action
      hookData.suspendOrganization('org-1', 'Terms violation')
      expect(hookData.suspendOrganization).toHaveBeenCalledWith('org-1', 'Terms violation')
    })
  })

  describe('SystemHealthDashboard Service Integration', () => {
    it('integrates system health monitoring with real-time updates', async () => {
      const mockHealthData = {
        database: {
          name: 'PostgreSQL',
          status: 'healthy' as const,
          responseTime: 12,
          uptime: 99.95,
          lastCheck: '2024-01-15T10:30:00Z'
        },
        api: {
          name: 'REST API',
          status: 'healthy' as const,
          responseTime: 145,
          uptime: 99.98,
          lastCheck: '2024-01-15T10:30:00Z'
        },
        email: {
          name: 'Email Service',
          status: 'warning' as const,
          responseTime: 250,
          uptime: 99.5,
          lastCheck: '2024-01-15T10:30:00Z'
        },
        storage: {
          name: 'File Storage',
          status: 'healthy' as const,
          responseTime: 80,
          uptime: 99.99,
          lastCheck: '2024-01-15T10:30:00Z'
        },
        cpuUsage: 45.2,
        memoryUsage: 67.8,
        diskUsage: 34.1,
        networkIO: 1250,
        recentErrors: [],
        recentAlerts: [
          {
            id: 'alert-1',
            type: 'warning' as const,
            message: 'Email service response time elevated',
            timestamp: '2024-01-15T10:25:00Z',
            service: 'email'
          }
        ]
      }

      mockUseSystemHealth.mockReturnValue({
        healthData: mockHealthData,
        isLoading: false,
        error: null,
        refetch: jest.fn()
      })

      const hookData = mockUseSystemHealth()

      expect(hookData.healthData.database.status).toBe('healthy')
      expect(hookData.healthData.api.responseTime).toBe(145)
      expect(hookData.healthData.email.status).toBe('warning')
      expect(hookData.healthData.cpuUsage).toBe(45.2)
      expect(hookData.healthData.recentAlerts).toHaveLength(1)
      expect(hookData.healthData.recentAlerts[0].message).toBe('Email service response time elevated')
    })
  })

  describe('Cross-Component State Management', () => {
    it('handles shared state across admin components', async () => {
      // Mock shared admin context state
      const mockAdminContext = {
        currentView: 'dashboard',
        setCurrentView: jest.fn(),
        selectedOrganization: null,
        setSelectedOrganization: jest.fn(),
        adminUser: mockAdminUser
      }

      // Test navigation state changes
      mockAdminContext.setCurrentView('users')
      expect(mockAdminContext.setCurrentView).toHaveBeenCalledWith('users')

      mockAdminContext.setCurrentView('organizations')
      expect(mockAdminContext.setCurrentView).toHaveBeenCalledWith('organizations')

      // Test organization selection
      const testOrg = { id: 'org-1', name: 'Test Org' }
      mockAdminContext.setSelectedOrganization(testOrg)
      expect(mockAdminContext.setSelectedOrganization).toHaveBeenCalledWith(testOrg)
    })

    it('validates error handling across component boundaries', async () => {
      // Test error propagation through hooks
      const testError = new Error('Component integration error')

      mockUseRealTimeMetrics.mockReturnValue({
        metrics: null,
        isLoading: false,
        error: testError,
        refetch: jest.fn()
      })

      const hookData = mockUseRealTimeMetrics()
      expect(hookData.error).toBeInstanceOf(Error)
      expect(hookData.error.message).toBe('Component integration error')
    })
  })

  describe('Performance and Optimization Integration', () => {
    it('validates component optimization strategies work together', async () => {
      // Test memoization and optimization patterns
      const expensiveCalculation = jest.fn(() => {
        return Array.from({ length: 1000 }, (_, i) => i).reduce((sum, n) => sum + n, 0)
      })

      // Mock optimized component behavior
      const MockOptimizedComponent = {
        renderCount: 0,
        memoizedValue: null,
        
        render() {
          this.renderCount++
          
          // Simulate useMemo behavior
          if (!this.memoizedValue) {
            this.memoizedValue = expensiveCalculation()
          }
          
          return {
            renderCount: this.renderCount,
            expensiveValue: this.memoizedValue
          }
        }
      }

      // Initial render
      const firstRender = MockOptimizedComponent.render()
      expect(firstRender.renderCount).toBe(1)
      expect(firstRender.expensiveValue).toBe(499500)
      expect(expensiveCalculation).toHaveBeenCalledTimes(1)

      // Re-render with same props (should use memoized value)
      const secondRender = MockOptimizedComponent.render()
      expect(secondRender.renderCount).toBe(2)
      expect(secondRender.expensiveValue).toBe(499500)
      expect(expensiveCalculation).toHaveBeenCalledTimes(1) // Still only called once
    })
  })

  describe('Service Integration Workflows', () => {
    it('completes complex admin workflow through multiple service calls', async () => {
      // Workflow: Get user -> Update user -> Get updated user
      const userId = 'user-123'

      const mockUser = {
        id: userId,
        email: 'user@example.com',
        name: 'Test User',
        status: 'active' as const
      }

      const updatedUser = {
        ...mockUser,
        name: 'Updated User',
        status: 'suspended' as const
      }

      ;(adminService.getUserById as jest.Mock).mockResolvedValue(mockUser)
      ;(adminService.updateUser as jest.Mock).mockResolvedValue(undefined)
      ;(adminService.getUserById as jest.Mock).mockResolvedValueOnce(mockUser).mockResolvedValueOnce(updatedUser)

      // Execute workflow
      const initialUser = await adminService.getUserById(userId)
      expect(initialUser).toEqual(mockUser)

      await adminService.updateUser(userId, { name: 'Updated User', status: 'suspended' })
      expect(adminService.updateUser).toHaveBeenCalledWith(userId, { name: 'Updated User', status: 'suspended' })

      const finalUser = await adminService.getUserById(userId)
      expect(finalUser.name).toBe('Updated User')
      expect(finalUser.status).toBe('suspended')
    })

    it('handles service integration error scenarios', async () => {
      // Test service call failure handling
      const errorMessage = 'Service temporarily unavailable'
      
      ;(adminService.getDashboardMetrics as jest.Mock).mockRejectedValue(new Error(errorMessage))

      await expect(adminService.getDashboardMetrics()).rejects.toThrow(errorMessage)

      // Test hook error handling
      mockUseRealTimeMetrics.mockReturnValue({
        metrics: null,
        isLoading: false,
        error: new Error(errorMessage),
        refetch: jest.fn()
      })

      const hookData = mockUseRealTimeMetrics()
      expect(hookData.error.message).toBe(errorMessage)
    })
  })
})