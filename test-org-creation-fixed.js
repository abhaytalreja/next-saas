const { createClient } = require('@supabase/supabase-js')

// Test the fixed organization creation
async function testOrganizationCreation() {
  console.log('🧪 Testing organization creation with service role...')

  try {
    // First, test basic signup (should work now without triggers)
    const supabaseUrl = 'https://rfakvkihqdhfueclbkhm.supabase.co'
    const anonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmYWt2a2locWRoZnVlY2xia2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2ODU2MjYsImV4cCI6MjA2NzI2MTYyNn0.4SxLDDphkgKUqRdghHuDh7fWQdWNqyJjOHO6oULE3F4'
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmYWt2a2locWRoZnVlY2xia2htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTY4NTYyNiwiZXhwIjoyMDY3MjYxNjI2fQ.6hNdFQBKwdl2RdFGxCMbJsV7xm6s-hKJNXK1VcF8_Vo'

    const supabaseAnon = createClient(supabaseUrl, anonKey)
    const supabaseService = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log('📧 Testing user signup...')
    const testEmail = `test-${Date.now()}@example.com`

    const { data: authData, error: authError } = await supabaseAnon.auth.signUp(
      {
        email: testEmail,
        password: 'TestPassword123!',
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User',
            full_name: 'Test User',
          },
        },
      }
    )

    if (authError) {
      console.log('❌ User signup failed:', authError.message)
      return
    }

    if (!authData.user) {
      console.log('❌ No user returned from signup')
      return
    }

    console.log('✅ User signup successful:', authData.user.id)

    // Now test organization creation with service role
    console.log('🏢 Testing organization creation...')

    const organizationName = 'Test Company'
    const slug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50)

    const uniqueSlug = `${slug}-${Date.now()}`

    // Create organization with service role
    const { data: org, error: orgError } = await supabaseService
      .from('organizations')
      .insert({
        name: organizationName,
        slug: uniqueSlug,
        created_by: authData.user.id,
      })
      .select()
      .single()

    if (orgError) {
      console.log('❌ Organization creation failed:', orgError.message)
      return
    }

    console.log('✅ Organization created:', org.id)

    // Create membership
    const { error: membershipError } = await supabaseService
      .from('organization_members')
      .insert({
        user_id: authData.user.id,
        organization_id: org.id,
        role: 'owner',
      })

    if (membershipError) {
      console.log('❌ Membership creation failed:', membershipError.message)
      return
    }

    console.log('✅ Membership created successfully')
    console.log('🎉 Complete signup + organization creation flow working!')
  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
  }
}

testOrganizationCreation()
