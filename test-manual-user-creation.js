// Test manual user creation in public.users table
const { createClient } = require('@supabase/supabase-js');

async function testManualUserCreation() {
  console.log('Testing manual user creation...');
  
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
    // Generate a unique test user
    const testUserId = '12345678-1234-1234-1234-123456789012'; // Valid UUID format
    const testEmail = `test-manual-${Date.now()}@example.com`;
    
    console.log('Attempting to create user with:');
    console.log('- ID:', testUserId);
    console.log('- Email:', testEmail);
    console.log('- Name: Test User');

    // Try to insert into users table
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: testEmail,
        name: 'Test User',
        email_verified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('❌ User creation failed:');
      console.error('  Error:', error);
      console.error('  Error code:', error.code);
      console.error('  Error message:', error.message);
      console.error('  Error details:', error.details);
      console.error('  Error hint:', error.hint);
    } else {
      console.log('✅ User created successfully:', data);
      
      // Clean up - delete the test user
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', testUserId);
        
      if (deleteError) {
        console.error('Failed to clean up test user:', deleteError);
      } else {
        console.log('✅ Test user cleaned up successfully');
      }
    }

    // Also test with profiles table
    console.log('\n--- Testing profiles table ---');
    const profileTestId = '12345678-1234-1234-1234-123456789013';
    const profileTestEmail = `test-profile-${Date.now()}@example.com`;
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: profileTestId,
        email: profileTestEmail,
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError);
    } else {
      console.log('✅ Profile created successfully:', profileData);
      
      // Clean up
      await supabase.from('profiles').delete().eq('id', profileTestId);
      console.log('✅ Test profile cleaned up');
    }

  } catch (error) {
    console.error('General error:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testManualUserCreation();