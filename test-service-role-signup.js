const { createClient } = require('@supabase/supabase-js')

async function testServiceRoleSignup() {
  console.log('🧪 Testing user creation with service role...')

  try {
    const supabaseUrl = 'https://rfakvkihqdhfueclbkhm.supabase.co'
    const serviceRoleKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmYWt2a2locWRoZnVlY2xia2htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTY4NTYyNiwiZXhwIjoyMDY3MjYxNjI2fQ.SXpHrTBNYk3mX7SHveBc76hwXSmQY10dmGrn1F3Gor4'

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const testEmail = `test-service-${Date.now()}@example.com`

    console.log('📧 Creating user with admin.createUser...')

    // Use admin.createUser instead of auth.signUp
    const { data: userData, error: userError } =
      await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'TestPassword123!',
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          first_name: 'Test',
          last_name: 'User',
          full_name: 'Test User',
        },
      })

    if (userError) {
      console.log('❌ User creation failed:', userError.message)
      return
    }

    console.log('✅ User created successfully:', userData.user.id)

    // Now test organization creation
    console.log('🏢 Creating organization...')

    const organizationName = 'Test Company Admin'
    const slug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50)

    const uniqueSlug = `${slug}-${Date.now()}`

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: organizationName,
        slug: uniqueSlug,
        created_by: userData.user.id,
      })
      .select()
      .single()

    if (orgError) {
      console.log('❌ Organization creation failed:', orgError.message)
      return
    }

    console.log('✅ Organization created:', org.id)

    // Create membership
    const { error: membershipError } = await supabase
      .from('organization_members')
      .insert({
        user_id: userData.user.id,
        organization_id: org.id,
        role: 'owner',
      })

    if (membershipError) {
      console.log('❌ Membership creation failed:', membershipError.message)
      return
    }

    console.log('✅ Membership created successfully')
    console.log('🎉 Service role user + organization creation working!')
  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
  }
}

testServiceRoleSignup()
