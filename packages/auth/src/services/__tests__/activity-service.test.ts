import { ActivityService, createActivityService } from '../activity-service'
import { createAuditService } from '../audit-service'

// Mock audit service
jest.mock('../audit-service', () => {
  const mockImpl = {
    logEvent: jest.fn().mockResolvedValue({ success: true, activityId: 'activity-123' }),
    logAuthEvent: jest.fn().mockResolvedValue({ success: true, activityId: 'activity-123' }),
    logDataAccess: jest.fn().mockResolvedValue({ success: true, activityId: 'activity-123' }),
    logSecurityEvent: jest.fn().mockResolvedValue({ success: true, activityId: 'activity-123' }),
    queryAuditLogs: jest.fn().mockResolvedValue({ success: true, logs: [] }),
    getUserSecurityEvents: jest.fn().mockResolvedValue([]),
  }
  
  return {
    createAuditService: jest.fn(() => mockImpl),
    auditService: mockImpl,
  }
})

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(),
  auth: {
    getUser: jest.fn(),
  },
}

describe('ActivityService', () => {
  let activityService: ActivityService
  let mockAuditServiceImpl: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Get the mock implementation
    const mockModule = require('../audit-service')
    mockAuditServiceImpl = mockModule.auditService
    
    activityService = new ActivityService()
  })

  describe('constructor', () => {
    it('creates service with default audit service when no supabase client provided', () => {
      const service = new ActivityService()
      expect(service).toBeInstanceOf(ActivityService)
    })

    it('creates service with custom supabase client', () => {
      const service = createActivityService(mockSupabaseClient as any)
      expect(service).toBeInstanceOf(ActivityService)
      expect(createAuditService).toHaveBeenCalledWith(mockSupabaseClient)
    })
  })

  describe('trackProfileActivity', () => {
    const mockContext = {
      userId: 'user-123',
      organizationId: 'org-123',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 Test Browser',
    }

    it('successfully tracks profile update activity', async () => {
      const mockEvent = {
        action: 'profile_update' as const,
        details: { fields: ['first_name', 'last_name'] },
        metadata: { source: 'profile_form' },
      }

      mockAuditServiceImpl.logEvent.mockResolvedValue({
        success: true,
        activityId: 'activity-123',
      })

      const result = await activityService.trackProfileActivity(mockContext, mockEvent)

      expect(result).toEqual({
        success: true,
        activityId: 'activity-123',
      })

      expect(mockAuditServiceImpl.logEvent).toHaveBeenCalledWith({
        userId: 'user-123',
        organizationId: 'org-123',
        action: 'profile_update',
        resource: 'profile',
        resourceId: 'user-123',
        details: {
          fields: ['first_name', 'last_name'],
          metadata: { source: 'profile_form' },
          activity_type: 'profile_management',
        },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 Test Browser',
        status: 'success',
        severity: 'low',
      })
    })

    it('tracks avatar upload with medium severity', async () => {
      const mockEvent = {
        action: 'avatar_upload' as const,
        details: { file_size: 1024000, mime_type: 'image/jpeg' },
      }

      mockAuditServiceImpl.logEvent.mockResolvedValue({
        success: true,
        activityId: 'activity-456',
      })

      const result = await activityService.trackProfileActivity(mockContext, mockEvent)

      expect(result.success).toBe(true)
      expect(mockAuditServiceImpl.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'avatar_upload',
          severity: 'medium',
        })
      )
    })

    it('tracks password change with high severity', async () => {
      const mockEvent = {
        action: 'password_change' as const,
        details: { method: 'profile_settings' },
      }

      mockAuditServiceImpl.logEvent.mockResolvedValue({
        success: true,
        activityId: 'activity-789',
      })

      await activityService.trackProfileActivity(mockContext, mockEvent)

      expect(mockAuditServiceImpl.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'password_change',
          severity: 'high',
        })
      )
    })

    it('handles context without organization ID', async () => {
      const contextWithoutOrg = {
        userId: 'user-123',
        ipAddress: '192.168.1.1',
      }

      const mockEvent = {
        action: 'profile_update' as const,
      }

      mockAuditServiceImpl.logEvent.mockResolvedValue({
        success: true,
        activityId: 'activity-no-org',
      })

      const result = await activityService.trackProfileActivity(contextWithoutOrg, mockEvent)

      expect(result.success).toBe(true)
      expect(mockAuditServiceImpl.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          organizationId: undefined,
        })
      )
    })

    it('returns error when audit service fails', async () => {
      const mockEvent = {
        action: 'profile_update' as const,
      }

      mockAuditServiceImpl.logEvent.mockResolvedValue({
        success: false,
        error: 'Database connection failed',
      })

      const result = await activityService.trackProfileActivity(mockContext, mockEvent)

      expect(result).toEqual({
        success: false,
        error: 'Database connection failed',
      })
    })
  })

  describe('trackAuthActivity', () => {
    const mockContext = {
      userId: 'user-123',
      ipAddress: '10.0.0.1',
      userAgent: 'Mobile App 1.0',
    }

    it('successfully tracks login activity', async () => {
      const mockEvent = {
        action: 'login' as const,
        status: 'success' as const,
        details: { method: 'password', device: 'mobile' },
      }

      mockAuditServiceImpl.logAuthEvent.mockResolvedValue({
        success: true,
        activityId: 'auth-123',
      })

      const result = await activityService.trackAuthActivity(mockContext, mockEvent)

      expect(result).toEqual({
        success: true,
        activityId: 'auth-123',
      })

      expect(mockAuditServiceImpl.logAuthEvent).toHaveBeenCalledWith({
        userId: 'user-123',
        organizationId: undefined,
        action: 'login',
        status: 'success',
        details: { method: 'password', device: 'mobile' },
        ipAddress: '10.0.0.1',
        userAgent: 'Mobile App 1.0',
      })
    })

    it('tracks failed authentication attempts', async () => {
      const mockEvent = {
        action: 'login' as const,
        status: 'failed' as const,
        details: { reason: 'invalid_password', attempts: 3 },
      }

      mockAuditServiceImpl.logAuthEvent.mockResolvedValue({
        success: true,
        activityId: 'auth-failed-123',
      })

      const result = await activityService.trackAuthActivity(mockContext, mockEvent)

      expect(result.success).toBe(true)
      expect(mockAuditServiceImpl.logAuthEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'login',
          status: 'failed',
          details: { reason: 'invalid_password', attempts: 3 },
        })
      )
    })

    it('tracks MFA events', async () => {
      const mockEvent = {
        action: 'mfa_enable' as const,
        status: 'success' as const,
        details: { method: 'totp' },
      }

      mockAuditServiceImpl.logAuthEvent.mockResolvedValue({
        success: true,
        activityId: 'mfa-123',
      })

      await activityService.trackAuthActivity(mockContext, mockEvent)

      expect(mockAuditServiceImpl.logAuthEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'mfa_enable',
          status: 'success',
        })
      )
    })
  })

  describe('trackDataActivity', () => {
    const mockContext = {
      userId: 'user-123',
      organizationId: 'org-456',
    }

    it('successfully tracks data export with medium severity', async () => {
      const mockEvent = {
        action: 'data_export' as const,
        resourceId: 'export-789',
        details: { format: 'json', size: 1024 },
      }

      mockAuditServiceImpl.logDataAccess.mockResolvedValue({
        success: true,
        activityId: 'data-123',
      })

      const result = await activityService.trackDataActivity(mockContext, mockEvent)

      expect(result).toEqual({
        success: true,
        activityId: 'data-123',
      })

      expect(mockAuditServiceImpl.logDataAccess).toHaveBeenCalledWith({
        userId: 'user-123',
        organizationId: 'org-456',
        action: 'data_export',
        resource: 'user_data',
        resourceId: 'export-789',
        details: {
          format: 'json',
          size: 1024,
          activity_type: 'data_management',
        },
        ipAddress: undefined,
        userAgent: undefined,
        severity: 'medium',
      })
    })

    it('tracks account deletion request with critical severity', async () => {
      const mockEvent = {
        action: 'account_deletion_requested' as const,
        details: { reason: 'user_request', scheduled_date: '2025-02-22' },
      }

      mockAuditServiceImpl.logDataAccess.mockResolvedValue({
        success: true,
        activityId: 'deletion-123',
      })

      await activityService.trackDataActivity(mockContext, mockEvent)

      expect(mockAuditServiceImpl.logDataAccess).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'account_deletion_requested',
          severity: 'critical',
        })
      )
    })

    it('uses user ID as resource ID when none provided', async () => {
      const mockEvent = {
        action: 'data_download' as const,
        details: { type: 'profile_data' },
      }

      mockAuditServiceImpl.logDataAccess.mockResolvedValue({
        success: true,
        activityId: 'download-123',
      })

      await activityService.trackDataActivity(mockContext, mockEvent)

      expect(mockAuditServiceImpl.logDataAccess).toHaveBeenCalledWith(
        expect.objectContaining({
          resourceId: 'user-123', // Should default to context.userId
        })
      )
    })
  })

  describe('trackOrganizationActivity', () => {
    const mockContext = {
      userId: 'user-123',
      ipAddress: '172.16.0.1',
    }

    it('successfully tracks organization join activity', async () => {
      const mockEvent = {
        action: 'org_joined' as const,
        organizationId: 'org-789',
        details: { role: 'member', invited_by: 'admin-456' },
      }

      mockAuditServiceImpl.logEvent.mockResolvedValue({
        success: true,
        activityId: 'org-activity-123',
      })

      const result = await activityService.trackOrganizationActivity(mockContext, mockEvent)

      expect(result).toEqual({
        success: true,
        activityId: 'org-activity-123',
      })

      expect(mockAuditServiceImpl.logEvent).toHaveBeenCalledWith({
        userId: 'user-123',
        organizationId: 'org-789',
        action: 'org_joined',
        resource: 'organization',
        resourceId: 'org-789',
        details: {
          role: 'member',
          invited_by: 'admin-456',
          activity_type: 'organization_management',
        },
        ipAddress: '172.16.0.1',
        userAgent: undefined,
        status: 'success',
        severity: 'low',
      })
    })

    it('tracks role changes with medium severity', async () => {
      const mockEvent = {
        action: 'role_changed' as const,
        organizationId: 'org-789',
        details: { from_role: 'member', to_role: 'admin', changed_by: 'owner-123' },
      }

      mockAuditServiceImpl.logEvent.mockResolvedValue({
        success: true,
        activityId: 'role-change-123',
      })

      await activityService.trackOrganizationActivity(mockContext, mockEvent)

      expect(mockAuditServiceImpl.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'role_changed',
          severity: 'medium',
        })
      )
    })

    it('tracks permission changes', async () => {
      const mockEvent = {
        action: 'permission_granted' as const,
        organizationId: 'org-789',
        details: { permission: 'manage_billing', granted_by: 'admin-456' },
      }

      mockAuditServiceImpl.logEvent.mockResolvedValue({
        success: true,
        activityId: 'permission-123',
      })

      await activityService.trackOrganizationActivity(mockContext, mockEvent)

      expect(mockAuditServiceImpl.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'permission_granted',
          severity: 'medium',
        })
      )
    })
  })

  describe('trackUserActivity', () => {
    const mockContext = {
      userId: 'user-123',
      organizationId: 'org-456',
      ipAddress: '192.168.0.100',
      userAgent: 'Desktop App 2.0',
    }

    it('successfully tracks general user activity', async () => {
      mockAuditServiceImpl.logEvent.mockResolvedValue({
        success: true,
        activityId: 'general-123',
      })

      const result = await activityService.trackUserActivity(
        mockContext,
        'project_created',
        'project',
        { project_name: 'My Project', template: 'blank' }
      )

      expect(result).toEqual({
        success: true,
        activityId: 'general-123',
      })

      expect(mockAuditServiceImpl.logEvent).toHaveBeenCalledWith({
        userId: 'user-123',
        organizationId: 'org-456',
        action: 'project_created',
        resource: 'project',
        resourceId: 'user-123',
        details: {
          project_name: 'My Project',
          template: 'blank',
          activity_type: 'general_activity',
        },
        ipAddress: '192.168.0.100',
        userAgent: 'Desktop App 2.0',
        status: 'success',
        severity: 'low',
      })
    })

    it('handles activity without details', async () => {
      mockAuditServiceImpl.logEvent.mockResolvedValue({
        success: true,
        activityId: 'simple-123',
      })

      const result = await activityService.trackUserActivity(
        mockContext,
        'page_view',
        'dashboard'
      )

      expect(result.success).toBe(true)
      expect(mockAuditServiceImpl.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'page_view',
          resource: 'dashboard',
          details: {
            activity_type: 'general_activity',
          },
        })
      )
    })
  })

  describe('getUserActivities', () => {
    const mockActivities = [
      {
        id: 'activity-1',
        user_id: 'user-123',
        action: 'profile_update',
        resource: 'profile',
        created_at: '2025-01-20T10:00:00Z',
      },
      {
        id: 'activity-2',
        user_id: 'user-123',
        action: 'login',
        resource: 'auth',
        created_at: '2025-01-20T09:00:00Z',
      },
    ]

    it('successfully fetches user activities with default options', async () => {
      mockAuditServiceImpl.queryAuditLogs.mockResolvedValue({
        success: true,
        activities: mockActivities,
        total: 2,
      })

      const result = await activityService.getUserActivities('user-123')

      expect(result).toEqual({
        success: true,
        activities: mockActivities,
        total: 2,
      })

      expect(mockAuditServiceImpl.queryAuditLogs).toHaveBeenCalledWith({
        userId: 'user-123',
        organizationId: undefined,
        limit: 50,
        offset: 0,
        dateFrom: undefined,
        dateTo: undefined,
        action: undefined,
      })
    })

    it('fetches activities with custom options', async () => {
      const options = {
        organizationId: 'org-456',
        limit: 20,
        offset: 10,
        dateFrom: new Date('2025-01-01'),
        dateTo: new Date('2025-01-31'),
        actions: ['login', 'logout'],
        resources: ['auth'],
      }

      mockAuditServiceImpl.queryAuditLogs.mockResolvedValue({
        success: true,
        activities: mockActivities.slice(0, 1),
        total: 1,
      })

      const result = await activityService.getUserActivities('user-123', options)

      expect(result.success).toBe(true)
      expect(mockAuditServiceImpl.queryAuditLogs).toHaveBeenCalledWith({
        userId: 'user-123',
        organizationId: 'org-456',
        limit: 20,
        offset: 10,
        dateFrom: options.dateFrom,
        dateTo: options.dateTo,
        action: 'login,logout', // Actions joined as string
      })
    })

    it('handles query errors', async () => {
      mockAuditServiceImpl.queryAuditLogs.mockResolvedValue({
        success: false,
        error: 'Database query failed',
      })

      const result = await activityService.getUserActivities('user-123')

      expect(result).toEqual({
        success: false,
        error: 'Database query failed',
      })
    })
  })

  describe('getUserActivityStats', () => {
    const mockActivities = [
      {
        id: '1',
        user_id: 'user-123',
        action: 'profile_update',
        created_at: '2025-01-20T10:00:00Z',
      },
      {
        id: '2',
        user_id: 'user-123',
        action: 'login',
        created_at: '2025-01-20T09:00:00Z',
      },
      {
        id: '3',
        user_id: 'user-123',
        action: 'data_export',
        created_at: '2025-01-19T14:00:00Z',
      },
      {
        id: '4',
        user_id: 'user-123',
        action: 'org_joined',
        created_at: '2025-01-19T12:00:00Z',
      },
      {
        id: '5',
        user_id: 'user-123',
        action: 'login',
        created_at: '2025-01-19T10:00:00Z',
      },
    ]

    it('successfully calculates activity statistics', async () => {
      mockAuditServiceImpl.queryAuditLogs.mockResolvedValue({
        success: true,
        activities: mockActivities,
        total: 5,
      })

      const result = await activityService.getUserActivityStats('user-123')

      expect(result.success).toBe(true)
      expect(result.stats).toEqual({
        totalActivities: 5,
        profileUpdates: 1, // profile_update
        authEvents: 2, // login events
        dataEvents: 1, // data_export
        organizationEvents: 1, // org_joined
        lastActivity: '2025-01-20T10:00:00Z', // Most recent
        mostActiveDay: '2025-01-19', // 3 activities on this day
        activityByDay: [
          { date: '2025-01-19', count: 3 },
          { date: '2025-01-20', count: 2 },
        ],
      })
    })

    it('calculates stats with organization filter and custom date range', async () => {
      mockAuditServiceImpl.queryAuditLogs.mockResolvedValue({
        success: true,
        activities: mockActivities.slice(0, 2),
        total: 2,
      })

      const result = await activityService.getUserActivityStats('user-123', 'org-456', 7)

      expect(result.success).toBe(true)
      expect(result.stats?.totalActivities).toBe(2)
      
      // Verify correct date range was used (7 days)
      expect(mockAuditServiceImpl.queryAuditLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          organizationId: 'org-456',
          limit: 1000,
          dateFrom: expect.any(Date),
        })
      )
    })

    it('handles empty activity results', async () => {
      mockAuditServiceImpl.queryAuditLogs.mockResolvedValue({
        success: true,
        activities: [],
        total: 0,
      })

      const result = await activityService.getUserActivityStats('user-123')

      expect(result.success).toBe(true)
      expect(result.stats).toEqual({
        totalActivities: 0,
        profileUpdates: 0,
        authEvents: 0,
        dataEvents: 0,
        organizationEvents: 0,
        lastActivity: undefined,
        mostActiveDay: '',
        activityByDay: [],
      })
    })

    it('handles audit service errors', async () => {
      mockAuditServiceImpl.queryAuditLogs.mockResolvedValue({
        success: false,
        error: 'Database connection timeout',
      })

      const result = await activityService.getUserActivityStats('user-123')

      expect(result).toEqual({
        success: false,
        error: 'Database connection timeout',
      })
    })

    it('handles calculation errors', async () => {
      mockAuditServiceImpl.queryAuditLogs.mockRejectedValue(new Error('Network error'))

      const result = await activityService.getUserActivityStats('user-123')

      expect(result).toEqual({
        success: false,
        error: 'Network error',
      })
    })
  })

  describe('getUserSecurityActivities', () => {
    const mockSecurityEvents = [
      {
        id: 'security-1',
        user_id: 'user-123',
        action: 'password_change',
        severity: 'high',
        created_at: '2025-01-20T10:00:00Z',
      },
      {
        id: 'security-2',
        user_id: 'user-123',
        action: 'mfa_enable',
        severity: 'medium',
        created_at: '2025-01-19T15:00:00Z',
      },
    ]

    it('successfully fetches user security activities', async () => {
      mockAuditServiceImpl.getUserSecurityEvents.mockResolvedValue({
        success: true,
        events: mockSecurityEvents,
      })

      const result = await activityService.getUserSecurityActivities('user-123')

      expect(result).toEqual({
        success: true,
        events: mockSecurityEvents,
      })

      expect(mockAuditServiceImpl.getUserSecurityEvents).toHaveBeenCalledWith('user-123', 20)
    })

    it('fetches security activities with custom limit', async () => {
      mockAuditServiceImpl.getUserSecurityEvents.mockResolvedValue({
        success: true,
        events: mockSecurityEvents.slice(0, 1),
      })

      const result = await activityService.getUserSecurityActivities('user-123', 1)

      expect(result.success).toBe(true)
      expect(mockAuditServiceImpl.getUserSecurityEvents).toHaveBeenCalledWith('user-123', 1)
    })

    it('handles security events query errors', async () => {
      mockAuditServiceImpl.getUserSecurityEvents.mockResolvedValue({
        success: false,
        error: 'Access denied',
      })

      const result = await activityService.getUserSecurityActivities('user-123')

      expect(result).toEqual({
        success: false,
        error: 'Access denied',
      })
    })
  })

  describe('trackBulkActivities', () => {
    const mockBulkActivities = [
      {
        context: { userId: 'user-1', organizationId: 'org-1' },
        action: 'project_created',
        resource: 'project',
        details: { name: 'Project 1' },
      },
      {
        context: { userId: 'user-2', organizationId: 'org-1' },
        action: 'project_created',
        resource: 'project',
        details: { name: 'Project 2' },
      },
    ]

    it('successfully tracks multiple activities', async () => {
      mockAuditServiceImpl.logEvent.mockResolvedValue({
        success: true,
        activityId: 'bulk-activity-123',
      })

      const result = await activityService.trackBulkActivities(mockBulkActivities)

      expect(result.success).toBe(true)
      expect(result.results).toHaveLength(2)
      expect(result.results?.[0]).toEqual({
        success: true,
        activityId: 'bulk-activity-123',
      })
      expect(mockAuditServiceImpl.logEvent).toHaveBeenCalledTimes(2)
    })

    it('handles partial failures in bulk operations', async () => {
      mockAuditServiceImpl.logEvent
        .mockResolvedValueOnce({ success: true, activityId: 'success-1' })
        .mockResolvedValueOnce({ success: false, error: 'Database error' })

      const result = await activityService.trackBulkActivities(mockBulkActivities)

      expect(result.success).toBe(false) // Overall failure due to one failed activity
      expect(result.error).toBe('Some activities failed to log')
      expect(result.results).toHaveLength(2)
      expect(result.results?.[0].success).toBe(true)
      expect(result.results?.[1].success).toBe(false)
    })

    it('handles complete failure in bulk operations', async () => {
      mockAuditServiceImpl.logEvent.mockRejectedValue(new Error('Service unavailable'))

      const result = await activityService.trackBulkActivities(mockBulkActivities)

      expect(result).toEqual({
        success: false,
        error: 'Service unavailable',
      })
    })

    it('handles empty bulk activities array', async () => {
      const result = await activityService.trackBulkActivities([])

      expect(result.success).toBe(true)
      expect(result.results).toHaveLength(0)
      expect(mockAuditServiceImpl.logEvent).not.toHaveBeenCalled()
    })
  })

  describe('severity calculation helpers', () => {
    it('correctly calculates profile activity severity', () => {
      const service = activityService as any

      expect(service.getProfileActivitySeverity('password_change')).toBe('high')
      expect(service.getProfileActivitySeverity('email_change')).toBe('high')
      expect(service.getProfileActivitySeverity('avatar_upload')).toBe('medium')
      expect(service.getProfileActivitySeverity('avatar_delete')).toBe('medium')
      expect(service.getProfileActivitySeverity('profile_update')).toBe('low')
      expect(service.getProfileActivitySeverity('preferences_update')).toBe('low')
      expect(service.getProfileActivitySeverity('unknown_action')).toBe('low')
    })

    it('correctly calculates data activity severity', () => {
      const service = activityService as any

      expect(service.getDataActivitySeverity('account_deletion_requested')).toBe('critical')
      expect(service.getDataActivitySeverity('account_deletion_cancelled')).toBe('high')
      expect(service.getDataActivitySeverity('data_export')).toBe('medium')
      expect(service.getDataActivitySeverity('data_download')).toBe('medium')
      expect(service.getDataActivitySeverity('unknown_action')).toBe('low')
    })

    it('correctly calculates organization activity severity', () => {
      const service = activityService as any

      expect(service.getOrgActivitySeverity('role_changed')).toBe('medium')
      expect(service.getOrgActivitySeverity('permission_granted')).toBe('medium')
      expect(service.getOrgActivitySeverity('permission_revoked')).toBe('medium')
      expect(service.getOrgActivitySeverity('org_joined')).toBe('low')
      expect(service.getOrgActivitySeverity('org_left')).toBe('low')
      expect(service.getOrgActivitySeverity('unknown_action')).toBe('low')
    })
  })
})