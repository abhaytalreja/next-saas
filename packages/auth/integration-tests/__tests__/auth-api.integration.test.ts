/**
 * Integration Tests for Authentication API Endpoints
 * Tests the complete authentication flow from API calls to service interactions
 */

import { createClient } from '@supabase/supabase-js'
import { AuditService } from '../../services/audit-service'
import { ActivityService } from '../../services/activity-service'

// Test environment configuration
const SUPABASE_TEST_URL = process.env.SUPABASE_TEST_URL || 'http://localhost:54321'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key'

// Integration test timeout
const INTEGRATION_TIMEOUT = 30000

describe('Authentication API Integration Tests', () => {
  let supabase: any
  let auditService: AuditService
  let activityService: ActivityService
  let testUser: any

  beforeAll(async () => {
    // Initialize test Supabase client
    supabase = createClient(SUPABASE_TEST_URL, SUPABASE_SERVICE_KEY)
    
    // Initialize services
    auditService = new AuditService()
    activityService = new ActivityService(supabase)
    
    // Create test user for integration tests
    testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User'
    }
  }, INTEGRATION_TIMEOUT)

  afterAll(async () => {
    // Cleanup: Remove test user if created
    if (testUser.id) {
      try {
        await supabase.auth.admin.deleteUser(testUser.id)
      } catch (error) {
        console.warn('Failed to cleanup test user:', error)
      }
    }
  })

  describe('User Registration Flow', () => {
    it('should complete full user registration with audit logging', async () => {
      // Step 1: Register new user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
        options: {
          data: {
            first_name: testUser.firstName,
            last_name: testUser.lastName
          }
        }
      })

      expect(signUpError).toBeNull()
      expect(signUpData.user).toBeDefined()
      expect(signUpData.user?.email).toBe(testUser.email)
      
      testUser.id = signUpData.user?.id

      // Step 2: Verify profile was created
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testUser.id)
        .single()

      expect(profileError).toBeNull()
      expect(profile).toBeDefined()
      expect(profile.email).toBe(testUser.email)

      // Step 3: Verify audit log entry was created
      const auditResult = await auditService.logAuthEvent(testUser.id, {
        action: 'signup',
        success: true,
        method: 'email',
        ipAddress: '127.0.0.1'
      })

      expect(auditResult.success).toBe(true)
      expect(auditResult.activityId).toBeDefined()

      // Step 4: Verify activity tracking
      const activityResult = await activityService.trackAuthActivity(
        { userId: testUser.id },
        {
          action: 'signup',
          details: { method: 'email' }
        }
      )

      expect(activityResult.success).toBe(true)
    }, INTEGRATION_TIMEOUT)
  })

  describe('User Authentication Flow', () => {
    it('should authenticate user and track login activity', async () => {
      // Ensure we have a test user
      if (!testUser.id) {
        const { data: signUpData } = await supabase.auth.signUp({
          email: testUser.email,
          password: testUser.password
        })
        testUser.id = signUpData.user?.id
      }

      // Step 1: Sign in user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password
      })

      expect(signInError).toBeNull()
      expect(signInData.user).toBeDefined()
      expect(signInData.session).toBeDefined()

      // Step 2: Log authentication event
      const auditResult = await auditService.logAuthEvent(testUser.id, {
        action: 'login',
        success: true,
        method: 'password',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent'
      })

      expect(auditResult.success).toBe(true)

      // Step 3: Track activity
      const activityResult = await activityService.trackAuthActivity(
        { userId: testUser.id },
        {
          action: 'login',
          details: {
            method: 'password',
            success: true,
            ip_address: '127.0.0.1'
          }
        }
      )

      expect(activityResult.success).toBe(true)

      // Step 4: Verify session was created
      expect(signInData.session?.access_token).toBeDefined()
      expect(signInData.session?.user.id).toBe(testUser.id)
    }, INTEGRATION_TIMEOUT)

    it('should handle failed authentication attempts with proper logging', async () => {
      // Step 1: Attempt login with wrong password
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: 'WrongPassword123!'
      })

      expect(signInError).toBeDefined()
      expect(signInData.user).toBeNull()

      // Step 2: Log failed authentication attempt
      const auditResult = await auditService.logAuthEvent(testUser.id || 'unknown', {
        action: 'login',
        success: false,
        method: 'password',
        error: signInError?.message,
        ipAddress: '127.0.0.1'
      })

      expect(auditResult.success).toBe(true)

      // Step 3: Log security event for failed attempt
      const securityResult = await auditService.logSecurityEvent({
        userId: testUser.id || 'unknown',
        eventType: 'authentication',
        action: 'failed_login',
        resource: 'auth',
        riskLevel: 'medium',
        success: false,
        details: {
          email: testUser.email,
          error: signInError?.message,
          attempts: 1
        },
        ipAddress: '127.0.0.1'
      })

      expect(securityResult.success).toBe(true)
    }, INTEGRATION_TIMEOUT)
  })

  describe('Profile Management Integration', () => {
    beforeEach(async () => {
      // Ensure authenticated user for profile tests
      if (!testUser.id) {
        const { data: signUpData } = await supabase.auth.signUp({
          email: testUser.email,
          password: testUser.password
        })
        testUser.id = signUpData.user?.id
      }
    })

    it('should update user profile with activity tracking', async () => {
      const profileUpdates = {
        first_name: 'Updated',
        last_name: 'Name',
        bio: 'Updated bio for integration test'
      }

      // Step 1: Update profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', testUser.id)
        .select()
        .single()

      expect(updateError).toBeNull()
      expect(updatedProfile).toBeDefined()
      expect(updatedProfile.first_name).toBe('Updated')

      // Step 2: Log profile update activity
      const auditResult = await auditService.logProfileUpdate(testUser.id, {
        updatedFields: Object.keys(profileUpdates),
        oldValues: {
          first_name: testUser.firstName,
          last_name: testUser.lastName
        },
        newValues: profileUpdates,
        ipAddress: '127.0.0.1'
      })

      expect(auditResult.success).toBe(true)

      // Step 3: Track profile activity
      const activityResult = await activityService.trackProfileActivity(
        { userId: testUser.id },
        {
          action: 'profile_update',
          details: {
            updated_fields: Object.keys(profileUpdates),
            changes: profileUpdates
          }
        }
      )

      expect(activityResult.success).toBe(true)
    }, INTEGRATION_TIMEOUT)

    it('should handle sensitive profile data updates with enhanced logging', async () => {
      const sensitiveUpdates = {
        email: `updated-${Date.now()}@example.com`,
        phone: '+1-555-0123'
      }

      // Step 1: Update sensitive profile data
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(sensitiveUpdates)
        .eq('id', testUser.id)
        .select()
        .single()

      expect(updateError).toBeNull()
      expect(updatedProfile.email).toBe(sensitiveUpdates.email)

      // Step 2: Log sensitive data update with high priority
      const auditResult = await auditService.logProfileUpdate(testUser.id, {
        updatedFields: Object.keys(sensitiveUpdates),
        oldValues: { email: testUser.email },
        newValues: sensitiveUpdates,
        ipAddress: '127.0.0.1',
        sensitiveData: true
      })

      expect(auditResult.success).toBe(true)

      // Step 3: Log security event for sensitive data change
      const securityResult = await auditService.logSecurityEvent({
        userId: testUser.id,
        eventType: 'data_access',
        action: 'sensitive_data_update',
        resource: 'profile',
        riskLevel: 'high',
        success: true,
        details: {
          updated_fields: Object.keys(sensitiveUpdates),
          data_classification: 'sensitive'
        },
        ipAddress: '127.0.0.1'
      })

      expect(securityResult.success).toBe(true)
    }, INTEGRATION_TIMEOUT)
  })

  describe('Activity and Audit Log Integration', () => {
    it('should retrieve user activities with proper filtering', async () => {
      // Ensure we have some activities to retrieve
      await activityService.trackAuthActivity(
        { userId: testUser.id },
        {
          action: 'login',
          details: { method: 'integration_test' }
        }
      )

      // Step 1: Query user activities
      const activitiesResult = await activityService.getUserActivities(testUser.id, {
        limit: 10
      })

      expect(activitiesResult.success).toBe(true)
      expect(activitiesResult.activities).toBeDefined()
      expect(Array.isArray(activitiesResult.activities)).toBe(true)

      // Step 2: Query audit logs
      const auditResult = await auditService.queryAuditLogs({
        userId: testUser.id,
        limit: 10
      })

      expect(auditResult.success).toBe(true)
      expect(auditResult.logs).toBeDefined()

      // Step 3: Verify activity stats
      const statsResult = await activityService.getUserActivityStats(testUser.id)

      expect(statsResult.success).toBe(true)
      expect(statsResult.stats).toBeDefined()
    }, INTEGRATION_TIMEOUT)

    it('should handle security event queries and filtering', async () => {
      // Create a test security event
      await auditService.logSecurityEvent({
        userId: testUser.id,
        eventType: 'authentication',
        action: 'integration_test_event',
        resource: 'auth',
        riskLevel: 'low',
        success: true,
        details: { test: true },
        ipAddress: '127.0.0.1'
      })

      // Step 1: Query security events
      const securityResult = await auditService.getUserSecurityEvents(testUser.id, 30)

      expect(securityResult.success).toBe(true)
      expect(securityResult.events).toBeDefined()

      // Step 2: Query suspicious activities
      const suspiciousResult = await auditService.getSuspiciousActivities(7)

      expect(suspiciousResult.success).toBe(true)
    }, INTEGRATION_TIMEOUT)
  })

  describe('Data Export Integration', () => {
    it('should handle data export requests with audit logging', async () => {
      // Step 1: Log data export activity
      const exportResult = await auditService.logDataAccess(testUser.id, {
        action: 'export',
        resourceType: 'user_data',
        resourceId: testUser.id,
        format: 'json',
        recordCount: 1,
        ipAddress: '127.0.0.1'
      })

      expect(exportResult.success).toBe(true)

      // Step 2: Track export activity
      const activityResult = await activityService.trackDataActivity(
        { userId: testUser.id },
        {
          action: 'data_export',
          resourceType: 'profile',
          details: {
            export_format: 'json',
            export_size: 1024,
            record_count: 1
          }
        }
      )

      expect(activityResult.success).toBe(true)

      // Step 3: Verify export was logged in audit trail
      const auditQuery = await auditService.queryAuditLogs({
        userId: testUser.id,
        actions: ['export'],
        limit: 5
      })

      expect(auditQuery.success).toBe(true)
      expect(auditQuery.logs).toBeDefined()
    }, INTEGRATION_TIMEOUT)
  })

  describe('Error Handling and Recovery', () => {
    it('should handle database connection errors gracefully', async () => {
      // Create service with invalid connection
      const invalidSupabase = createClient('http://invalid-url', 'invalid-key')
      const invalidService = new ActivityService(invalidSupabase)

      // Attempt operation that should fail
      const result = await invalidService.trackAuthActivity(
        { userId: testUser.id },
        {
          action: 'test_failure',
          details: {}
        }
      )

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle malformed data inputs', async () => {
      // Test with invalid user ID
      const result = await auditService.logAuthEvent('', {
        action: 'invalid_test',
        success: false,
        ipAddress: '127.0.0.1'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid')
    })
  })

  describe('Performance and Load Testing', () => {
    it('should handle concurrent operations efficiently', async () => {
      const concurrentOperations = Array.from({ length: 10 }, (_, i) => 
        auditService.logAuthEvent(testUser.id, {
          action: 'concurrent_test',
          success: true,
          details: { operation: i },
          ipAddress: '127.0.0.1'
        })
      )

      const results = await Promise.all(concurrentOperations)
      
      results.forEach(result => {
        expect(result.success).toBe(true)
      })
    }, INTEGRATION_TIMEOUT)

    it('should maintain performance under batch operations', async () => {
      const startTime = Date.now()
      
      // Perform batch of activities
      const batchOperations = Array.from({ length: 5 }, () => 
        activityService.trackProfileActivity(
          { userId: testUser.id },
          {
            action: 'batch_test',
            details: { timestamp: Date.now() }
          }
        )
      )

      const results = await Promise.all(batchOperations)
      const endTime = Date.now()
      const duration = endTime - startTime

      // Should complete within reasonable time (5 seconds)
      expect(duration).toBeLessThan(5000)
      results.forEach(result => {
        expect(result.success).toBe(true)
      })
    }, INTEGRATION_TIMEOUT)
  })
})