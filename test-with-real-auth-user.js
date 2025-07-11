// Test organization creation with a real auth user ID
const { createClient } = require('@supabase/supabase-js');

async function testWithRealAuthUser() {
  console.log('Testing organization creation with real auth user...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    // Step 1: Create an auth user (like in our signup API)
    console.log('1. Creating auth user...');
    
    const testEmail = `test-real-auth-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // Disable email confirmation
      user_metadata: {
        first_name: 'Test',
        last_name: 'User',
        full_name: 'Test User',
      },
    });

    if (userError) {
      console.error('❌ Auth user creation failed:', userError);
      return;
    }

    console.log('✅ Auth user created:', userData.user.id, userData.user.email);

    // Step 2: Try to create organization directly with this auth user ID
    console.log('\n2. Creating organization with auth user ID...');
    
    const orgName = `Test Org ${Date.now()}`;
    const orgSlug = `test-org-${Date.now()}`;
    
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: orgName,
        slug: orgSlug,
        created_by: userData.user.id, // Use the real auth user ID
      })
      .select()
      .single();
      
    if (orgError) {
      console.error('❌ Organization creation failed:', orgError);
      console.error('   This confirms the foreign key issue');
    } else {
      console.log('✅ Organization created successfully:', orgData);
    }

    // Step 3: Check what foreign key the organizations table is actually referencing
    console.log('\n3. The issue is that organizations.created_by references public.users, not auth.users');
    console.log('   The auth user ID', userData.user.id, 'exists in auth.users but not in public.users');
    
    // Clean up auth user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userData.user.id);
    if (deleteError) {
      console.error('Failed to delete test auth user:', deleteError);
    } else {
      console.log('✅ Test auth user cleaned up');
    }

  } catch (error) {
    console.error('General error:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testWithRealAuthUser();