import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GET, PATCH } from '../route'
import { POST as ProfilePreferencesPost, PATCH as ProfilePreferencesPatch } from '../preferences/route'
import { POST as AvatarPost, DELETE as AvatarDelete } from '../avatar/route'

// Integration tests use real Supabase connection with test database
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'test-key'

describe('Profile API Integration Tests', () => {
  let testUserId: string
  let testUserEmail: string
  let testSession: any
  let supabase: any

  beforeAll(async () => {
    // Skip integration tests if no Supabase credentials
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.log('Skipping integration tests - Supabase credentials not provided')
      return
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Create test user
    const timestamp = Date.now()
    testUserEmail = `test-${timestamp}@example.com`
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUserEmail,
      password: 'test-password-123',
    })

    if (authError || !authData.user) {
      throw new Error(`Failed to create test user: ${authError?.message}`)
    }

    testUserId = authData.user.id
    testSession = authData.session

    // Create test profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        email: testUserEmail,
        first_name: 'Test',
        last_name: 'User',
        display_name: 'testuser',
      })

    if (profileError) {
      throw new Error(`Failed to create test profile: ${profileError.message}`)
    }
  })

  afterAll(async () => {
    if (!supabase || !testUserId) return

    // Cleanup test data
    try {
      // Delete user data in reverse order of dependencies
      await supabase.from('user_activity').delete().eq('user_id', testUserId)
      await supabase.from('user_preferences').delete().eq('user_id', testUserId)
      await supabase.from('user_avatars').delete().eq('user_id', testUserId)
      await supabase.from('profiles').delete().eq('id', testUserId)
      
      // Delete auth user
      await supabase.auth.admin.deleteUser(testUserId)
    } catch (error) {
      console.warn('Failed to cleanup test data:', error)
    }
  })

  describe('Profile Management Workflow', () => {
    it('completes full profile management lifecycle', async () => {
      // Mock session for API routes
      jest.doMock('@supabase/auth-helpers-nextjs', () => ({
        createRouteHandlerClient: () => ({
          auth: {
            getSession: () => Promise.resolve({
              data: { session: { user: { id: testUserId, email: testUserEmail } } }
            })
          },
          from: (table: string) => supabase.from(table),
        })
      }))

      // Step 1: Get initial profile
      const getRequest = new NextRequest('http://localhost:3000/api/profile')
      const getResponse = await GET(getRequest)
      const profileData = await getResponse.json()

      expect(getResponse.status).toBe(200)
      expect(profileData.success).toBe(true)
      expect(profileData.data.profile.first_name).toBe('Test')

      // Step 2: Update profile
      const updateData = {
        first_name: 'Updated',
        last_name: 'Name',
        bio: 'Integration test bio',
        company: 'Test Corp',
        job_title: 'Developer'
      }

      const patchRequest = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
        headers: { 'content-type': 'application/json' }
      })

      const patchResponse = await PATCH(patchRequest)
      const updateResult = await patchResponse.json()

      expect(patchResponse.status).toBe(200)
      expect(updateResult.success).toBe(true)
      expect(updateResult.data.profile.first_name).toBe('Updated')
      expect(updateResult.data.profile.bio).toBe('Integration test bio')

      // Step 3: Verify activity was logged
      const { data: activities } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', testUserId)
        .eq('action', 'profile_update')

      expect(activities).toHaveLength(1)
      expect(activities[0].description).toContain('Updated profile fields')

      // Step 4: Get updated profile with activity
      const getWithActivityRequest = new NextRequest(
        'http://localhost:3000/api/profile?include_activity=true'
      )
      const getWithActivityResponse = await GET(getWithActivityRequest)
      const profileWithActivity = await getWithActivityResponse.json()

      expect(profileWithActivity.data.profile.first_name).toBe('Updated')
      expect(profileWithActivity.data.activities).toHaveLength(1)
    })

    it('handles validation errors correctly', async () => {
      jest.doMock('@supabase/auth-helpers-nextjs', () => ({
        createRouteHandlerClient: () => ({
          auth: {
            getSession: () => Promise.resolve({
              data: { session: { user: { id: testUserId, email: testUserEmail } } }
            })
          },
          from: (table: string) => supabase.from(table),
        })
      }))

      const invalidData = {
        first_name: '', // Invalid: empty
        display_name: 'invalid@name', // Invalid: contains @
        phone_number: '123', // Invalid: too short
      }

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(invalidData),
        headers: { 'content-type': 'application/json' }
      })

      const response = await PATCH(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid request data')
      expect(result.errors).toBeDefined()
    })
  })

  describe('Preferences Management Workflow', () => {
    it('creates and updates user preferences', async () => {
      jest.doMock('@supabase/auth-helpers-nextjs', () => ({
        createRouteHandlerClient: () => ({
          auth: {
            getSession: () => Promise.resolve({
              data: { session: { user: { id: testUserId, email: testUserEmail } } }
            })
          },
          from: (table: string) => supabase.from(table),
        })
      }))

      // Step 1: Create preferences
      const preferencesData = {
        theme: 'dark',
        language: 'en',
        email_notifications_enabled: true,
        notify_security_alerts: true,
        profile_visibility: 'organization'
      }

      const createRequest = new NextRequest('http://localhost:3000/api/profile/preferences', {
        method: 'POST',
        body: JSON.stringify(preferencesData),
        headers: { 'content-type': 'application/json' }
      })

      const createResponse = await ProfilePreferencesPost(createRequest)
      const createResult = await createResponse.json()

      expect(createResponse.status).toBe(200)
      expect(createResult.success).toBe(true)
      expect(createResult.data.preferences.theme).toBe('dark')

      // Step 2: Update preferences
      const updateData = {
        theme: 'light',
        email_notifications_enabled: false
      }

      const updateRequest = new NextRequest('http://localhost:3000/api/profile/preferences', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
        headers: { 'content-type': 'application/json' }
      })

      const updateResponse = await ProfilePreferencesPatch(updateRequest)
      const updateResult = await updateResponse.json()

      expect(updateResponse.status).toBe(200)
      expect(updateResult.success).toBe(true)
      expect(updateResult.data.preferences.theme).toBe('light')
      expect(updateResult.data.preferences.email_notifications_enabled).toBe(false)

      // Step 3: Verify activity was logged
      const { data: activities } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', testUserId)
        .in('action', ['preferences_create', 'preferences_update'])

      expect(activities.length).toBeGreaterThanOrEqual(2)
    })

    it('prevents duplicate preferences creation', async () => {
      jest.doMock('@supabase/auth-helpers-nextjs', () => ({
        createRouteHandlerClient: () => ({
          auth: {
            getSession: () => Promise.resolve({
              data: { session: { user: { id: testUserId, email: testUserEmail } } }
            })
          },
          from: (table: string) => supabase.from(table),
        })
      }))

      const preferencesData = {
        theme: 'system',
        language: 'en'
      }

      const request = new NextRequest('http://localhost:3000/api/profile/preferences', {
        method: 'POST',
        body: JSON.stringify(preferencesData),
        headers: { 'content-type': 'application/json' }
      })

      const response = await ProfilePreferencesPost(request)
      const result = await response.json()

      expect(response.status).toBe(409)
      expect(result.success).toBe(false)
      expect(result.error).toContain('already exist')
    })
  })

  describe('Avatar Management Workflow', () => {
    it('handles avatar upload and deletion', async () => {
      jest.doMock('@supabase/auth-helpers-nextjs', () => ({
        createRouteHandlerClient: () => ({
          auth: {
            getSession: () => Promise.resolve({
              data: { session: { user: { id: testUserId, email: testUserEmail } } }
            })
          },
          from: (table: string) => supabase.from(table),
          storage: {
            from: () => ({
              upload: jest.fn().mockResolvedValue({ error: null }),
              remove: jest.fn().mockResolvedValue({ error: null }),
            })
          }
        })
      }))

      // Mock the AvatarService for integration tests
      jest.doMock('@nextsaas/auth/services/avatar-service', () => ({
        AvatarService: jest.fn().mockImplementation(() => ({
          uploadAvatar: jest.fn().mockResolvedValue({
            success: true,
            data: {
              id: 'avatar-123',
              file_path: 'avatars/test.jpg',
              variants: {
                thumbnail: { url: 'http://example.com/thumb.jpg', width: 64, height: 64 },
                medium: { url: 'http://example.com/medium.jpg', width: 256, height: 256 }
              }
            }
          }),
          deleteAvatar: jest.fn().mockResolvedValue({
            success: true
          })
        }))
      }))

      // Step 1: Upload avatar
      const formData = new FormData()
      const mockFile = new File(['avatar content'], 'avatar.jpg', { type: 'image/jpeg' })
      formData.append('file', mockFile)

      const uploadRequest = new NextRequest('http://localhost:3000/api/profile/avatar', {
        method: 'POST',
        body: formData
      })

      const uploadResponse = await AvatarPost(uploadRequest)
      const uploadResult = await uploadResponse.json()

      expect(uploadResponse.status).toBe(200)
      expect(uploadResult.success).toBe(true)
      expect(uploadResult.data.id).toBe('avatar-123')

      // Step 2: Delete avatar
      const deleteRequest = new NextRequest('http://localhost:3000/api/profile/avatar', {
        method: 'DELETE',
        body: JSON.stringify({ avatar_id: 'avatar-123' }),
        headers: { 'content-type': 'application/json' }
      })

      const deleteResponse = await AvatarDelete(deleteRequest)
      const deleteResult = await deleteResponse.json()

      expect(deleteResponse.status).toBe(200)
      expect(deleteResult.success).toBe(true)
    })

    it('validates avatar file requirements', async () => {
      jest.doMock('@supabase/auth-helpers-nextjs', () => ({
        createRouteHandlerClient: () => ({
          auth: {
            getSession: () => Promise.resolve({
              data: { session: { user: { id: testUserId, email: testUserEmail } } }
            })
          },
          from: (table: string) => supabase.from(table),
        })
      }))

      // Test with no file
      const emptyFormData = new FormData()
      const emptyRequest = new NextRequest('http://localhost:3000/api/profile/avatar', {
        method: 'POST',
        body: emptyFormData
      })

      const emptyResponse = await AvatarPost(emptyRequest)
      const emptyResult = await emptyResponse.json()

      expect(emptyResponse.status).toBe(400)
      expect(emptyResult.success).toBe(false)
      expect(emptyResult.error).toBe('No file provided')
    })
  })

  describe('Data Consistency and Transactions', () => {
    it('maintains data consistency across related tables', async () => {
      // Test that profile updates, activity logging, and preference changes
      // all work together correctly without race conditions

      const promises = [
        // Multiple concurrent profile updates
        supabase.from('profiles').update({ 
          bio: 'Concurrent update 1' 
        }).eq('id', testUserId),
        
        supabase.from('profiles').update({ 
          company: 'Concurrent update 2' 
        }).eq('id', testUserId),

        // Activity logging
        supabase.from('user_activity').insert({
          user_id: testUserId,
          action: 'test_action',
          description: 'Concurrent test',
          status: 'success'
        })
      ]

      const results = await Promise.all(promises)
      
      // All operations should succeed
      results.forEach(result => {
        expect(result.error).toBeNull()
      })

      // Verify final state is consistent
      const { data: finalProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testUserId)
        .single()

      expect(finalProfile).toBeDefined()
      expect(finalProfile.company).toBe('Concurrent update 2')
    })

    it('handles database constraints properly', async () => {
      // Test unique constraints, foreign key constraints, etc.
      
      // Try to create duplicate preferences (should fail)
      const { error: duplicateError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: testUserId,
          theme: 'dark'
        })

      expect(duplicateError).toBeDefined()
      expect(duplicateError.code).toBe('23505') // Unique violation

      // Try to reference non-existent user (should fail)
      const { error: fkError } = await supabase
        .from('user_activity')
        .insert({
          user_id: 'non-existent-user',
          action: 'test',
          status: 'success'
        })

      expect(fkError).toBeDefined()
      expect(fkError.code).toBe('23503') // Foreign key violation
    })
  })

  describe('Security and Authorization', () => {
    it('enforces row-level security policies', async () => {
      // Create another test user
      const { data: otherUserAuth } = await supabase.auth.signUp({
        email: `other-${Date.now()}@example.com`,
        password: 'test-password-123'
      })

      if (!otherUserAuth.user) {
        throw new Error('Failed to create other test user')
      }

      const otherUserId = otherUserAuth.user.id

      try {
        // Try to access first user's data as second user
        const { data: unauthorizedData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', testUserId)

        // Should either return empty or error due to RLS
        expect(unauthorizedData === null || unauthorizedData.length === 0).toBe(true)

        // Try to update first user's data as second user
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ first_name: 'Hacked' })
          .eq('id', testUserId)

        expect(updateError).toBeDefined()

      } finally {
        // Cleanup other user
        await supabase.auth.admin.deleteUser(otherUserId)
      }
    })

    it('validates user ownership for avatar operations', async () => {
      // Create test avatar record
      const { data: avatar, error: avatarError } = await supabase
        .from('user_avatars')
        .insert({
          user_id: testUserId,
          file_path: 'test/avatar.jpg',
          file_size: 1000,
          mime_type: 'image/jpeg',
          original_name: 'avatar.jpg'
        })
        .select()
        .single()

      expect(avatarError).toBeNull()
      expect(avatar).toBeDefined()

      // Create another user and try to delete first user's avatar
      const { data: otherUserAuth } = await supabase.auth.signUp({
        email: `avatar-test-${Date.now()}@example.com`,
        password: 'test-password-123'
      })

      const otherUserId = otherUserAuth.user?.id

      try {
        jest.doMock('@supabase/auth-helpers-nextjs', () => ({
          createRouteHandlerClient: () => ({
            auth: {
              getSession: () => Promise.resolve({
                data: { session: { user: { id: otherUserId, email: 'other@example.com' } } }
              })
            },
            from: (table: string) => supabase.from(table),
          })
        }))

        const deleteRequest = new NextRequest('http://localhost:3000/api/profile/avatar', {
          method: 'DELETE',
          body: JSON.stringify({ avatar_id: avatar.id }),
          headers: { 'content-type': 'application/json' }
        })

        const deleteResponse = await AvatarDelete(deleteRequest)
        const deleteResult = await deleteResponse.json()

        expect(deleteResponse.status).toBe(404)
        expect(deleteResult.success).toBe(false)
        expect(deleteResult.error).toBe('Avatar not found')

      } finally {
        // Cleanup
        await supabase.from('user_avatars').delete().eq('id', avatar.id)
        if (otherUserId) {
          await supabase.auth.admin.deleteUser(otherUserId)
        }
      }
    })
  })

  describe('Performance and Scalability', () => {
    it('handles concurrent operations efficiently', async () => {
      const startTime = Date.now()
      
      // Simulate concurrent operations
      const operations = Array.from({ length: 10 }, (_, i) => 
        supabase.from('user_activity').insert({
          user_id: testUserId,
          action: 'performance_test',
          description: `Concurrent operation ${i}`,
          status: 'success'
        })
      )

      await Promise.all(operations)
      
      const endTime = Date.now()
      const duration = endTime - startTime

      // All operations should complete in reasonable time
      expect(duration).toBeLessThan(5000) // 5 seconds max

      // Verify all records were created
      const { data: activities } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', testUserId)
        .eq('action', 'performance_test')

      expect(activities).toHaveLength(10)
    })

    it('handles large data sets appropriately', async () => {
      // Create many activity records
      const activities = Array.from({ length: 100 }, (_, i) => ({
        user_id: testUserId,
        action: 'bulk_test',
        description: `Bulk activity ${i}`,
        status: 'success'
      }))

      const { error } = await supabase
        .from('user_activity')
        .insert(activities)

      expect(error).toBeNull()

      // Test pagination works correctly
      const { data: page1 } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', testUserId)
        .eq('action', 'bulk_test')
        .order('created_at', { ascending: false })
        .range(0, 49)

      const { data: page2 } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', testUserId)
        .eq('action', 'bulk_test')
        .order('created_at', { ascending: false })
        .range(50, 99)

      expect(page1).toHaveLength(50)
      expect(page2).toHaveLength(50)
    })
  })
})