import { UniversalProfileManager } from '../universal-profile-manager'
import type { SupabaseClient } from '@supabase/supabase-js'

// Mock the activity service and audit service modules
const mockActivityServiceInstance = {
  trackProfileActivity: jest.fn().mockResolvedValue({ success: true }),
  trackAuthActivity: jest.fn().mockResolvedValue({ success: true }),
  trackDataActivity: jest.fn().mockResolvedValue({ success: true }),
  getUserActivities: jest.fn().mockResolvedValue({ success: true, activities: [] }),
  getUserActivityStats: jest.fn().mockResolvedValue({ success: true, stats: {} })
}

jest.mock('../../services/activity-service', () => ({
  ActivityService: jest.fn(() => mockActivityServiceInstance),
  createActivityService: jest.fn(() => mockActivityServiceInstance)
}))

jest.mock('../../services/audit-service', () => ({
  createAuditService: jest.fn(() => ({
    logEvent: jest.fn().mockResolvedValue({ success: true })
  })),
  auditService: {
    logEvent: jest.fn().mockResolvedValue({ success: true })
  }
}))

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => ({ data: null, error: null })),
        limit: jest.fn(() => ({ data: [], error: null })),
        order: jest.fn(() => ({ data: [], error: null }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({ data: null, error: null }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({ data: null, error: null }))
      })),
      upsert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({ data: null, error: null }))
        }))
      }))
    }))
  }))
} as unknown as SupabaseClient

describe('UniversalProfileManager', () => {
  let profileManager: UniversalProfileManager
  let mockEnvironment: { [key: string]: string | undefined }

  beforeEach(() => {
    // Reset environment mock
    mockEnvironment = {}
    
    // Mock process.env
    Object.defineProperty(process, 'env', {
      value: new Proxy(mockEnvironment, {
        get: (target, prop) => target[prop as string],
        set: (target, prop, value) => {
          target[prop as string] = value
          return true
        }
      }),
      writable: true
    })

    profileManager = new UniversalProfileManager(mockSupabaseClient)
    jest.clearAllMocks()
  })

  describe('Organization Mode Detection', () => {
    it('should detect "none" organization mode', () => {
      mockEnvironment.NEXT_PUBLIC_ORGANIZATION_MODE = 'none'
      const manager = new UniversalProfileManager(mockSupabaseClient, 'test-user')
      expect(manager['mode']).toBe('none') // Access private property for testing
    })

    it('should detect "single" organization mode', () => {
      mockEnvironment.NEXT_PUBLIC_ORGANIZATION_MODE = 'single'
      const manager = new UniversalProfileManager(mockSupabaseClient, 'test-user')
      expect(manager['mode']).toBe('single')
    })

    it('should detect "multi" organization mode', () => {
      mockEnvironment.NEXT_PUBLIC_ORGANIZATION_MODE = 'multi'
      const manager = new UniversalProfileManager(mockSupabaseClient, 'test-user')
      expect(manager['mode']).toBe('multi')
    })

    it('should default to "single" for invalid mode', () => {
      mockEnvironment.NEXT_PUBLIC_ORGANIZATION_MODE = 'invalid'
      const manager = new UniversalProfileManager(mockSupabaseClient, 'test-user')
      expect(manager['mode']).toBe('single')
    })

    it('should default to "single" when no mode is set', () => {
      delete mockEnvironment.NEXT_PUBLIC_ORGANIZATION_MODE
      const manager = new UniversalProfileManager(mockSupabaseClient, 'test-user')
      expect(manager['mode']).toBe('single')
    })
  })

  describe('Profile Data Loading', () => {
    const mockUserId = 'user-123'
    const mockOrganizationId = 'org-123'
    const mockProfile = {
      id: mockUserId,
      full_name: 'John Doe',
      email: 'john@example.com',
      avatar_url: 'https://example.com/avatar.jpg'
    }

    beforeEach(() => {
      // Setup successful profile query mock
      const mockFrom = mockSupabaseClient.from as jest.MockedFunction<any>
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({ data: mockProfile, error: null }))
          }))
        }))
      })
    })

    it('should load profile for personal mode', async () => {
      mockEnvironment.NEXT_PUBLIC_ORGANIZATION_MODE = 'none'
      
      const result = await profileManager.loadProfileData(mockUserId)
      
      expect(result.success).toBe(true)
      expect(result.profile).toEqual(mockProfile)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles')
    })

    it('should load profile with organization context for single mode', async () => {
      mockEnvironment.NEXT_PUBLIC_ORGANIZATION_MODE = 'single'
      
      const result = await profileManager.loadProfileData(mockUserId, {
        organizationId: mockOrganizationId
      })
      
      expect(result.success).toBe(true)
      expect(result.profile).toEqual(mockProfile)
    })

    it('should handle database errors gracefully', async () => {
      const mockError = { message: 'Database connection failed' }
      const mockFrom = mockSupabaseClient.from as jest.MockedFunction<any>
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({ data: null, error: mockError }))
          }))
        }))
      })

      const result = await profileManager.loadProfileData(mockUserId)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Database connection failed')
    })

    it('should return user not found when no profile exists', async () => {
      const mockFrom = mockSupabaseClient.from as jest.MockedFunction<any>
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({ data: null, error: { code: 'PGRST116' } }))
          }))
        }))
      })

      const result = await profileManager.loadProfileData(mockUserId)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
    })
  })

  describe('Profile Updates', () => {
    const mockUserId = 'user-123'
    const mockUpdatedProfile = {
      id: mockUserId,
      full_name: 'Jane Doe',
      bio: 'Software Engineer',
      updated_at: new Date().toISOString()
    }

    beforeEach(() => {
      // Setup successful update mock
      const mockFrom = mockSupabaseClient.from as jest.MockedFunction<any>
      mockFrom.mockReturnValue({
        upsert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({ data: mockUpdatedProfile, error: null }))
          }))
        }))
      })
    })

    it('should update profile successfully', async () => {
      const updates = {
        full_name: 'Jane Doe',
        bio: 'Software Engineer'
      }

      const result = await profileManager.updateProfile(mockUserId, updates)
      
      expect(result.success).toBe(true)
      expect(result.profile).toEqual(mockUpdatedProfile)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles')
    })

    it('should include organization context in updates for organization modes', async () => {
      mockEnvironment.NEXT_PUBLIC_ORGANIZATION_MODE = 'single'
      const mockOrganizationId = 'org-123'
      
      const updates = { full_name: 'Jane Doe' }
      
      await profileManager.updateProfile(mockUserId, updates, {
        organizationId: mockOrganizationId
      })
      
      const mockFrom = mockSupabaseClient.from as jest.MockedFunction<any>
      const mockUpsert = mockFrom().upsert as jest.MockedFunction<any>
      
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUserId,
          full_name: 'Jane Doe',
          updated_at: expect.any(String)
        })
      )
    })

    it('should handle validation errors', async () => {
      const mockError = { 
        message: 'Validation failed',
        details: 'full_name must be at least 2 characters'
      }
      const mockFrom = mockSupabaseClient.from as jest.MockedFunction<any>
      mockFrom.mockReturnValue({
        upsert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({ data: null, error: mockError }))
          }))
        }))
      })

      const updates = { full_name: 'A' } // Too short
      const result = await profileManager.updateProfile(mockUserId, updates)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Validation failed')
    })
  })

  describe('Activity Loading', () => {
    const mockUserId = 'user-123'
    const mockActivities = [
      {
        id: 'activity-1',
        user_id: mockUserId,
        activity_type: 'profile',
        action: 'profile_update',
        created_at: new Date().toISOString()
      },
      {
        id: 'activity-2',
        user_id: mockUserId,
        activity_type: 'auth',
        action: 'login',
        created_at: new Date().toISOString()
      }
    ]

    beforeEach(() => {
      // Setup successful activities query mock
      const mockFrom = mockSupabaseClient.from as jest.MockedFunction<any>
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({ data: mockActivities, error: null }))
            }))
          }))
        }))
      })
    })

    it('should load user activities successfully', async () => {
      const result = await profileManager.loadUserActivity(mockUserId)
      
      expect(result.success).toBe(true)
      expect(result.activities).toEqual(mockActivities)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_activity')
    })

    it('should apply limit and organization filters', async () => {
      const mockOrganizationId = 'org-123'
      
      await profileManager.loadUserActivity(mockUserId, {
        limit: 25,
        organizationId: mockOrganizationId
      })
      
      const mockFrom = mockSupabaseClient.from as jest.MockedFunction<any>
      const mockSelect = mockFrom().select as jest.MockedFunction<any>
      const mockEq = mockSelect().eq as jest.MockedFunction<any>
      const mockOrder = mockEq().order as jest.MockedFunction<any>
      const mockLimit = mockOrder().limit as jest.MockedFunction<any>
      
      expect(mockLimit).toHaveBeenCalledWith(25)
    })

    it('should handle empty activity results', async () => {
      const mockFrom = mockSupabaseClient.from as jest.MockedFunction<any>
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({ data: [], error: null }))
            }))
          }))
        }))
      })

      const result = await profileManager.loadUserActivity(mockUserId)
      
      expect(result.success).toBe(true)
      expect(result.activities).toEqual([])
    })
  })

  describe('Preferences Management', () => {
    const mockUserId = 'user-123'
    const mockPreferences = {
      id: 'pref-123',
      user_id: mockUserId,
      notifications: {
        email_enabled: true,
        push_enabled: false
      },
      privacy: {
        profile_visibility: 'public'
      }
    }

    it('should load user preferences successfully', async () => {
      const mockFrom = mockSupabaseClient.from as jest.MockedFunction<any>
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({ data: mockPreferences, error: null }))
          }))
        }))
      })

      const result = await profileManager.loadUserPreferences(mockUserId)
      
      expect(result.success).toBe(true)
      expect(result.preferences).toEqual(mockPreferences)
    })

    it('should update preferences successfully', async () => {
      const updatedPreferences = {
        ...mockPreferences,
        notifications: {
          email_enabled: false,
          push_enabled: true
        }
      }

      const mockFrom = mockSupabaseClient.from as jest.MockedFunction<any>
      mockFrom.mockReturnValue({
        upsert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({ data: updatedPreferences, error: null }))
          }))
        }))
      })

      const updates = {
        notifications: {
          email_enabled: false,
          push_enabled: true
        }
      }

      const result = await profileManager.updateUserPreferences(mockUserId, updates)
      
      expect(result.success).toBe(true)
      expect(result.preferences).toEqual(updatedPreferences)
    })

    it('should create default preferences for new users', async () => {
      // Mock preferences not found
      const mockFrom = mockSupabaseClient.from as jest.MockedFunction<any>
      mockFrom.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({ data: null, error: { code: 'PGRST116' } }))
          }))
        }))
      })

      // Mock successful creation
      mockFrom.mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({ data: mockPreferences, error: null }))
          }))
        }))
      })

      const result = await profileManager.loadUserPreferences(mockUserId)
      
      expect(result.success).toBe(true)
      expect(result.preferences).toEqual(mockPreferences)
    })
  })

  describe('Organization Context', () => {
    const mockUserId = 'user-123'
    const mockOrganizationId = 'org-123'

    it('should validate organization access for single mode', async () => {
      mockEnvironment.NEXT_PUBLIC_ORGANIZATION_MODE = 'single'

      const mockFrom = mockSupabaseClient.from as jest.MockedFunction<any>
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({ 
              data: { 
                user_id: mockUserId, 
                organization_id: mockOrganizationId,
                role: 'member'
              }, 
              error: null 
            }))
          }))
        }))
      })

      const hasAccess = await profileManager.validateOrganizationAccess(
        mockUserId, 
        mockOrganizationId
      )
      
      expect(hasAccess).toBe(true)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('organization_memberships')
    })

    it('should reject access for users not in organization', async () => {
      mockEnvironment.NEXT_PUBLIC_ORGANIZATION_MODE = 'single'

      const mockFrom = mockSupabaseClient.from as jest.MockedFunction<any>
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({ data: null, error: { code: 'PGRST116' } }))
          }))
        }))
      })

      const hasAccess = await profileManager.validateOrganizationAccess(
        mockUserId, 
        mockOrganizationId
      )
      
      expect(hasAccess).toBe(false)
    })

    it('should always allow access in personal mode', async () => {
      mockEnvironment.NEXT_PUBLIC_ORGANIZATION_MODE = 'none'

      const hasAccess = await profileManager.validateOrganizationAccess(
        mockUserId, 
        mockOrganizationId
      )
      
      expect(hasAccess).toBe(true)
      // Should not query database in personal mode
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    const mockUserId = 'user-123'

    it('should handle network errors gracefully', async () => {
      const mockFrom = mockSupabaseClient.from as jest.MockedFunction<any>
      mockFrom.mockImplementation(() => {
        throw new Error('Network error')
      })

      const result = await profileManager.loadProfileData(mockUserId)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('An unexpected error occurred')
    })

    it('should handle invalid user IDs', async () => {
      const result = await profileManager.loadProfileData('')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid user ID')
    })

    it('should handle invalid organization IDs', async () => {
      mockEnvironment.NEXT_PUBLIC_ORGANIZATION_MODE = 'single'
      
      const result = await profileManager.loadProfileData(mockUserId, {
        organizationId: ''
      })
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid organization ID for organization mode')
    })
  })
})