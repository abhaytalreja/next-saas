import { UniversalProfileManager } from '../universal-profile-manager'
import type { SupabaseClient } from '@supabase/supabase-js'

// Mock the activity service
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
const createMockChain = (finalResult = { data: null, error: null }) => {
  const mockChain: any = {
    select: jest.fn(() => mockChain),
    eq: jest.fn(() => mockChain),
    single: jest.fn(() => finalResult),
    limit: jest.fn(() => finalResult),
    order: jest.fn(() => finalResult),
    update: jest.fn(() => mockChain),
    insert: jest.fn(() => mockChain),
    upsert: jest.fn(() => mockChain)
  }
  return mockChain
}

const mockSupabaseClient = {
  from: jest.fn(() => {
    const defaultData = {
      id: 'user-123',
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe'
    }
    return createMockChain({ data: defaultData, error: null })
  })
} as unknown as SupabaseClient

describe('UniversalProfileManager - Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set default environment
    process.env.NEXT_PUBLIC_ORGANIZATION_MODE = 'single'
  })

  describe('Constructor and Mode Detection', () => {
    it('creates instance with correct mode detection', () => {
      process.env.NEXT_PUBLIC_ORGANIZATION_MODE = 'none'
      const manager = new UniversalProfileManager(mockSupabaseClient, 'test-user')
      expect(manager).toBeDefined()
      expect(manager['mode']).toBe('none')
    })

    it('detects single mode correctly', () => {
      process.env.NEXT_PUBLIC_ORGANIZATION_MODE = 'single'
      const manager = new UniversalProfileManager(mockSupabaseClient, 'test-user')
      expect(manager['mode']).toBe('single')
    })

    it('detects multi mode correctly', () => {
      process.env.NEXT_PUBLIC_ORGANIZATION_MODE = 'multi'
      const manager = new UniversalProfileManager(mockSupabaseClient, 'test-user')
      expect(manager['mode']).toBe('multi')
    })

    it('defaults to single when mode is invalid', () => {
      process.env.NEXT_PUBLIC_ORGANIZATION_MODE = 'invalid'
      const manager = new UniversalProfileManager(mockSupabaseClient, 'test-user')
      expect(manager['mode']).toBe('single')
    })

    it('accepts explicit mode parameter', () => {
      process.env.NEXT_PUBLIC_ORGANIZATION_MODE = 'none'
      const manager = new UniversalProfileManager(mockSupabaseClient, 'test-user', 'multi')
      expect(manager['mode']).toBe('multi')
    })
  })

  describe('Profile Loading', () => {
    it('loads basic profile data successfully', async () => {
      const manager = new UniversalProfileManager(mockSupabaseClient, 'user-123')
      
      const result = await manager.getProfile()
      
      expect(result).toBeDefined()
      expect(result.profile).toBeDefined()
      expect(result.profile.id).toBe('user-123')
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles')
    })

    it('loads profile with preferences when requested', async () => {
      const manager = new UniversalProfileManager(mockSupabaseClient, 'user-123')
      
      const result = await manager.getProfile({ 
        includePreferences: true 
      })
      
      expect(result).toBeDefined()
      expect(result.profile).toBeDefined()
    })

    it('loads profile with organization context', async () => {
      process.env.NEXT_PUBLIC_ORGANIZATION_MODE = 'single'
      const manager = new UniversalProfileManager(mockSupabaseClient, 'user-123')
      
      const result = await manager.getProfile({ 
        organizationId: 'org-456' 
      })
      
      expect(result).toBeDefined()
      expect(result.context?.organizationId).toBe('org-456')
    })

    it('handles database errors gracefully', async () => {
      // Create a mock that returns an error
      const errorMockClient = {
        from: jest.fn(() => createMockChain({
          data: null,
          error: { message: 'Database error', code: 'ERROR' }
        }))
      } as unknown as SupabaseClient

      const manager = new UniversalProfileManager(errorMockClient, 'user-123')
      
      await expect(manager.getProfile()).rejects.toThrow()
    })
  })

  describe('Profile Updates', () => {
    it('updates profile successfully', async () => {
      const manager = new UniversalProfileManager(mockSupabaseClient, 'user-123')
      
      const updates = {
        first_name: 'Jane',
        last_name: 'Smith'
      }
      
      const result = await manager.updateProfile(updates)
      
      expect(result).toBeDefined()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles')
    })

    it('validates profile completeness after update', async () => {
      const manager = new UniversalProfileManager(mockSupabaseClient, 'user-123')
      
      const result = await manager.updateProfile({ first_name: 'Updated' })
      
      expect(result).toBeDefined()
      // Should have called the activity service to track the update
      expect(mockActivityServiceInstance.trackProfileActivity).toHaveBeenCalled()
    })
  })

  describe('Organization Context', () => {
    it('includes organization context for single mode', async () => {
      process.env.NEXT_PUBLIC_ORGANIZATION_MODE = 'single'
      const manager = new UniversalProfileManager(mockSupabaseClient, 'user-123')
      
      const result = await manager.getProfile({ 
        organizationId: 'org-123' 
      })
      
      expect(result.context?.mode).toBe('single')
      expect(result.context?.organizationId).toBe('org-123')
    })

    it('excludes organization context for none mode', async () => {
      process.env.NEXT_PUBLIC_ORGANIZATION_MODE = 'none'
      const manager = new UniversalProfileManager(mockSupabaseClient, 'user-123')
      
      const result = await manager.getProfile()
      
      expect(result.context?.mode).toBe('none')
      expect(result.context?.organizationId).toBeUndefined()
    })
  })

  describe('Activity Tracking Integration', () => {
    it('tracks profile update activities', async () => {
      const manager = new UniversalProfileManager(mockSupabaseClient, 'user-123')
      
      await manager.updateProfile({ first_name: 'Updated Name' })
      
      expect(mockActivityServiceInstance.trackProfileActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123'
        }),
        expect.objectContaining({
          action: 'profile_update'
        })
      )
    })
  })
})