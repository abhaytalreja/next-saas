import { AvatarService } from '../../avatar-service'
import { createClient } from '@supabase/supabase-js'

// Integration tests for profile services with real database connections
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key'

describe('Profile Service Integration Tests', () => {
  let supabase: any
  let avatarService: AvatarService
  let testUserId: string

  beforeAll(async () => {
    // Skip integration tests if no Supabase credentials
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Skipping service integration tests - Supabase credentials not provided')
      return
    }

    supabase = createClient(supabaseUrl, supabaseServiceKey)
    avatarService = new AvatarService()

    // Create test user
    const timestamp = Date.now()
    const testEmail = `service-test-${timestamp}@example.com`
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'test-password-123',
      email_confirm: true
    })

    if (authError || !authData.user) {
      throw new Error(`Failed to create test user: ${authError?.message}`)
    }

    testUserId = authData.user.id

    // Create test profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        email: testEmail,
        first_name: 'Service',
        last_name: 'Test',
      })

    if (profileError) {
      throw new Error(`Failed to create test profile: ${profileError.message}`)
    }
  })

  afterAll(async () => {
    if (!supabase || !testUserId) return

    try {
      // Cleanup test data
      await supabase.from('user_activity').delete().eq('user_id', testUserId)
      await supabase.from('user_avatars').delete().eq('user_id', testUserId)
      await supabase.from('profiles').delete().eq('id', testUserId)
      await supabase.auth.admin.deleteUser(testUserId)
    } catch (error) {
      console.warn('Failed to cleanup service test data:', error)
    }
  })

  describe('AvatarService Integration', () => {
    it('handles complete avatar lifecycle with real storage', async () => {
      // Skip if no storage configuration
      if (!process.env.BACKBLAZE_APPLICATION_KEY_ID) {
        console.log('Skipping avatar storage tests - storage credentials not provided')
        return
      }

      // Create test image file
      const createTestImageBuffer = (): Buffer => {
        // Simple 1x1 PNG image data
        const pngData = Buffer.from([
          0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
          0x00, 0x00, 0x00, 0x0D, // IHDR chunk size
          0x49, 0x48, 0x44, 0x52, // IHDR
          0x00, 0x00, 0x00, 0x01, // Width: 1
          0x00, 0x00, 0x00, 0x01, // Height: 1
          0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type, etc.
          0x90, 0x77, 0x53, 0xDE, // CRC
          0x00, 0x00, 0x00, 0x0C, // IDAT chunk size
          0x49, 0x44, 0x41, 0x54, // IDAT
          0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // Image data
          0xE5, 0x27, 0xDE, 0xFC, // CRC
          0x00, 0x00, 0x00, 0x00, // IEND chunk size
          0x49, 0x45, 0x4E, 0x44, // IEND
          0xAE, 0x42, 0x60, 0x82  // CRC
        ])
        return pngData
      }

      const testImageBuffer = createTestImageBuffer()
      const testFile = new File([testImageBuffer], 'test-avatar.png', { type: 'image/png' })

      // Step 1: Upload avatar
      const uploadResult = await avatarService.uploadAvatar(testUserId, testFile)

      expect(uploadResult.success).toBe(true)
      expect(uploadResult.data).toBeDefined()
      expect(uploadResult.data!.id).toBeDefined()
      expect(uploadResult.data!.file_path).toContain('avatars/')
      expect(uploadResult.data!.variants).toBeDefined()

      const avatarId = uploadResult.data!.id

      // Step 2: Verify avatar was saved to database
      const { data: avatarRecord, error: fetchError } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('id', avatarId)
        .single()

      expect(fetchError).toBeNull()
      expect(avatarRecord).toBeDefined()
      expect(avatarRecord.user_id).toBe(testUserId)
      expect(avatarRecord.status).toBe('approved')

      // Step 3: Verify variants are accessible
      const variants = uploadResult.data!.variants
      expect(variants.thumbnail).toBeDefined()
      expect(variants.small).toBeDefined()
      expect(variants.medium).toBeDefined()
      expect(variants.large).toBeDefined()

      // Each variant should have valid dimensions
      expect(variants.thumbnail.width).toBe(64)
      expect(variants.thumbnail.height).toBe(64)
      expect(variants.medium.width).toBe(256)
      expect(variants.medium.height).toBe(256)

      // Step 4: Test avatar replacement
      const newTestFile = new File([testImageBuffer], 'new-avatar.png', { type: 'image/png' })
      const replaceResult = await avatarService.uploadAvatar(testUserId, newTestFile, { 
        replaceExisting: true 
      })

      expect(replaceResult.success).toBe(true)
      expect(replaceResult.data!.id).not.toBe(avatarId) // New avatar ID

      // Old avatar should be deleted
      const { data: oldAvatar } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('id', avatarId)
        .single()

      expect(oldAvatar).toBeNull()

      // Step 5: Delete new avatar
      const deleteResult = await avatarService.deleteAvatar(replaceResult.data!.id, testUserId)

      expect(deleteResult.success).toBe(true)

      // Avatar should be removed from database
      const { data: deletedAvatar } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('id', replaceResult.data!.id)
        .single()

      expect(deletedAvatar).toBeNull()
    })

    it('handles concurrent avatar uploads correctly', async () => {
      const createTestFile = (name: string): File => {
        const buffer = Buffer.from('test image data')
        return new File([buffer], name, { type: 'image/jpeg' })
      }

      // Attempt multiple concurrent uploads
      const uploadPromises = [
        avatarService.uploadAvatar(testUserId, createTestFile('avatar1.jpg')),
        avatarService.uploadAvatar(testUserId, createTestFile('avatar2.jpg')),
        avatarService.uploadAvatar(testUserId, createTestFile('avatar3.jpg'))
      ]

      const results = await Promise.allSettled(uploadPromises)

      // Only one should succeed due to user avatar limit
      const successfulUploads = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      )
      const failedUploads = results.filter(result => 
        result.status === 'fulfilled' && !result.value.success
      )

      expect(successfulUploads).toHaveLength(1)
      expect(failedUploads.length).toBeGreaterThan(0)

      // Cleanup successful upload
      if (successfulUploads.length > 0) {
        const successResult = successfulUploads[0] as any
        await avatarService.deleteAvatar(successResult.value.data.id, testUserId)
      }
    })

    it('validates file constraints in real scenarios', async () => {
      // Test file too large
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024) // 6MB
      const largeFile = new File([largeBuffer], 'large.jpg', { type: 'image/jpeg' })

      const largeResult = await avatarService.uploadAvatar(testUserId, largeFile)
      expect(largeResult.success).toBe(false)
      expect(largeResult.error).toContain('too large')

      // Test invalid file type
      const textFile = new File(['text content'], 'document.txt', { type: 'text/plain' })

      const textResult = await avatarService.uploadAvatar(testUserId, textFile)
      expect(textResult.success).toBe(false)
      expect(textResult.error).toContain('Invalid file type')

      // Test empty file
      const emptyFile = new File([''], 'empty.jpg', { type: 'image/jpeg' })

      const emptyResult = await avatarService.uploadAvatar(testUserId, emptyFile)
      expect(emptyResult.success).toBe(false)
      expect(emptyResult.error).toContain('empty')
    })

    it('handles storage failures gracefully', async () => {
      // Mock temporary storage failure
      const originalUploadMethod = avatarService['uploadToStorage']
      avatarService['uploadToStorage'] = jest.fn().mockRejectedValue(new Error('Storage unavailable'))

      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const result = await avatarService.uploadAvatar(testUserId, testFile)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Storage unavailable')

      // Restore original method
      avatarService['uploadToStorage'] = originalUploadMethod
    })
  })

  describe('Database Integration Patterns', () => {
    it('maintains referential integrity across profile operations', async () => {
      // Test profile deletion cascade
      const testProfile = {
        id: testUserId,
        first_name: 'Integrity',
        last_name: 'Test',
        bio: 'Testing referential integrity'
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update(testProfile)
        .eq('id', testUserId)

      expect(updateError).toBeNull()

      // Add related data
      const { error: activityError } = await supabase
        .from('user_activity')
        .insert({
          user_id: testUserId,
          action: 'integrity_test',
          description: 'Testing database integrity',
          status: 'success'
        })

      expect(activityError).toBeNull()

      const { error: prefsError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: testUserId,
          theme: 'dark',
          language: 'en'
        })

      expect(prefsError).toBeNull()

      // Verify all data exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testUserId)
        .single()

      const { data: activities } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', testUserId)

      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', testUserId)

      expect(profile).toBeDefined()
      expect(activities.length).toBeGreaterThan(0)
      expect(preferences).toBeDefined()

      // Test constraint validation
      const { error: duplicatePrefsError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: testUserId,
          theme: 'light'
        })

      expect(duplicatePrefsError).toBeDefined()
      expect(duplicatePrefsError.code).toBe('23505') // Unique violation
    })

    it('handles concurrent database operations safely', async () => {
      const operations = [
        // Multiple profile updates
        supabase.from('profiles').update({ 
          bio: 'Concurrent update 1' 
        }).eq('id', testUserId),
        
        supabase.from('profiles').update({ 
          company: 'Concurrent update 2' 
        }).eq('id', testUserId),

        // Activity insertions
        supabase.from('user_activity').insert({
          user_id: testUserId,
          action: 'concurrent_test_1',
          description: 'Concurrent operation 1',
          status: 'success'
        }),

        supabase.from('user_activity').insert({
          user_id: testUserId,
          action: 'concurrent_test_2',
          description: 'Concurrent operation 2',
          status: 'success'
        }),
      ]

      const results = await Promise.allSettled(operations)

      // All operations should complete (some may override others)
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`Operation ${index} failed:`, result.reason)
        }
      })

      // Final state should be consistent
      const { data: finalProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testUserId)
        .single()

      expect(finalProfile).toBeDefined()
      expect(finalProfile.id).toBe(testUserId)
    })

    it('validates row-level security policies', async () => {
      // Create another user to test RLS
      const { data: otherUserAuth, error: createError } = await supabase.auth.admin.createUser({
        email: `rls-test-${Date.now()}@example.com`,
        password: 'test-password-123',
        email_confirm: true
      })

      if (createError || !otherUserAuth.user) {
        throw new Error('Failed to create RLS test user')
      }

      const otherUserId = otherUserAuth.user.id

      try {
        // Create client for other user
        const otherUserClient = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY!)
        
        // Try to access test user's profile as other user
        const { data: unauthorizedProfile, error: rslError } = await otherUserClient
          .from('profiles')
          .select('*')
          .eq('id', testUserId)

        // Should be blocked by RLS
        expect(unauthorizedProfile === null || unauthorizedProfile.length === 0).toBe(true)

        // Try to update test user's profile as other user
        const { error: updateError } = await otherUserClient
          .from('profiles')
          .update({ first_name: 'Hacked' })
          .eq('id', testUserId)

        expect(updateError).toBeDefined()

      } finally {
        // Cleanup other user
        await supabase.auth.admin.deleteUser(otherUserId)
      }
    })
  })

  describe('Performance and Scalability', () => {
    it('handles large data operations efficiently', async () => {
      const startTime = Date.now()

      // Create many activity records
      const activities = Array.from({ length: 100 }, (_, i) => ({
        user_id: testUserId,
        action: 'performance_test',
        description: `Performance test activity ${i}`,
        status: 'success'
      }))

      const { error: bulkError } = await supabase
        .from('user_activity')
        .insert(activities)

      const insertTime = Date.now() - startTime

      expect(bulkError).toBeNull()
      expect(insertTime).toBeLessThan(5000) // Should complete within 5 seconds

      // Test pagination performance
      const paginationStart = Date.now()

      const { data: page1 } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', testUserId)
        .order('created_at', { ascending: false })
        .range(0, 49)

      const { data: page2 } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', testUserId)
        .order('created_at', { ascending: false })
        .range(50, 99)

      const paginationTime = Date.now() - paginationStart

      expect(page1).toHaveLength(50)
      expect(page2).toHaveLength(50)
      expect(paginationTime).toBeLessThan(2000) // Pagination should be fast

      // Cleanup test data
      await supabase
        .from('user_activity')
        .delete()
        .eq('user_id', testUserId)
        .eq('action', 'performance_test')
    })

    it('optimizes query patterns for common operations', async () => {
      // Test complex query with joins and filters
      const complexQueryStart = Date.now()

      const { data: profileWithActivity } = await supabase
        .from('profiles')
        .select(`
          *,
          user_activity(id, action, status, created_at),
          user_preferences(theme, language)
        `)
        .eq('id', testUserId)
        .single()

      const complexQueryTime = Date.now() - complexQueryStart

      expect(profileWithActivity).toBeDefined()
      expect(complexQueryTime).toBeLessThan(1000) // Should be optimized

      // Test filtered activity queries
      const filteredQueryStart = Date.now()

      const { data: recentActivities } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', testUserId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10)

      const filteredQueryTime = Date.now() - filteredQueryStart

      expect(recentActivities).toBeDefined()
      expect(filteredQueryTime).toBeLessThan(500) // Should be very fast with indexes
    })
  })
})