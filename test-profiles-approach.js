// Test using profiles table instead of users table
const { createClient } = require('@supabase/supabase-js');

async function testProfilesApproach() {
  console.log('Testing profiles table approach...');
  
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
    // First, let's see what the profiles table structure looks like
    console.log('1. Testing profiles table structure...');
    
    // Try to insert a profile with minimal data
    const testUserId = 'f0000000-0000-0000-0000-000000000001'; // Valid UUID
    const testEmail = `test-profile-approach-${Date.now()}@example.com`;
    
    console.log('2. Creating profile with minimal data...');
    console.log('   User ID:', testUserId);
    console.log('   Email:', testEmail);
    
    // Try creating just with id and email
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        email: testEmail,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Profile creation failed:', error);
      console.error('   Error code:', error.code);
      console.error('   Error message:', error.message);
      console.error('   Error details:', error.details);
    } else {
      console.log('✅ Profile created successfully:', data);
      
      // Now test organization creation with this profile ID
      console.log('\n3. Testing organization creation with profile ID...');
      
      const orgName = `Test Org ${Date.now()}`;
      const orgSlug = `test-org-${Date.now()}`;
      
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          slug: orgSlug,
          created_by: testUserId, // Use the profile ID
        })
        .select()
        .single();
        
      if (orgError) {
        console.error('❌ Organization creation failed:', orgError);
      } else {
        console.log('✅ Organization created successfully:', orgData);
        
        // Test membership creation
        console.log('\n4. Testing membership creation...');
        const { data: memberData, error: memberError } = await supabase
          .from('memberships')
          .insert({
            user_id: testUserId,
            organization_id: orgData.id,
            role: 'owner',
            accepted_at: new Date().toISOString(),
          })
          .select()
          .single();
          
        if (memberError) {
          console.error('❌ Membership creation failed:', memberError);
        } else {
          console.log('✅ Membership created successfully:', memberData);
        }
        
        // Clean up
        await supabase.from('memberships').delete().eq('organization_id', orgData.id);
        await supabase.from('organizations').delete().eq('id', orgData.id);
        console.log('✅ Organization and membership cleaned up');
      }
      
      // Clean up profile
      await supabase.from('profiles').delete().eq('id', testUserId);
      console.log('✅ Profile cleaned up');
    }
    
    // Test if the issue is with using an existing auth user ID
    console.log('\n5. Testing with a real auth user ID...');
    
    // Let's see if we can find any existing auth users to use their IDs
    // Since we can't query auth.users directly, let's try a different approach
    
  } catch (error) {
    console.error('General error:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testProfilesApproach();