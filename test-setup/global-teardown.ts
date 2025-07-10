export default async function globalTeardown() {
  console.log('\n🧹 Cleaning up integration test environment...')

  // Cleanup any global test resources
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )

      // Clean up any remaining test data
      const testEmailPattern = '%test-%@example.com'
      
      // Find test users
      const { data: testUsers } = await supabase.auth.admin.listUsers()
      
      const testUserIds = testUsers.users
        ?.filter(user => user.email?.includes('test-') && user.email?.includes('@example.com'))
        ?.map(user => user.id) || []

      if (testUserIds.length > 0) {
        console.log(`🗑️  Cleaning up ${testUserIds.length} test users...`)
        
        // Delete related data first
        for (const userId of testUserIds) {
          await supabase.from('user_activity').delete().eq('user_id', userId)
          await supabase.from('user_preferences').delete().eq('user_id', userId)
          await supabase.from('user_avatars').delete().eq('user_id', userId)
          await supabase.from('profiles').delete().eq('id', userId)
          await supabase.auth.admin.deleteUser(userId)
        }
        
        console.log('✅ Test data cleanup completed')
      } else {
        console.log('✅ No test data to cleanup')
      }
    } catch (error) {
      console.warn('⚠️  Could not cleanup test data:', error)
    }
  }

  console.log('🏁 Integration test suite completed\n')
}