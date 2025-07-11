// Check what database triggers currently exist
const { createClient } = require('@supabase/supabase-js');

async function checkTriggers() {
  console.log('Checking current database triggers...');
  
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

  // We can't directly query information_schema through the JS client,
  // but we can test if specific operations work to infer trigger status
  
  try {
    console.log('1. Testing if problematic triggers still exist...');
    
    // Test 1: Try creating a simple organization (this will fail if triggers exist)
    const testOrgName = `Trigger Test ${Date.now()}`;
    const testSlug = `trigger-test-${Date.now()}`;
    
    const { data, error } = await supabase
      .from('organizations')
      .insert({
        name: testOrgName,
        slug: testSlug,
      })
      .select()
      .single();
      
    if (error) {
      if (error.message.includes('organization_id')) {
        console.log('❌ Problematic triggers are STILL ACTIVE');
        console.log('   Error:', error.message);
        console.log('   The database fix was not applied or not effective');
      } else {
        console.log('❌ Different error (triggers may be fixed):', error.message);
      }
    } else {
      console.log('✅ Organization creation SUCCESSFUL - triggers are fixed!');
      console.log('   Created org:', data);
      
      // Clean up
      await supabase.from('organizations').delete().eq('id', data.id);
      console.log('✅ Test organization cleaned up');
    }
    
    // Test 2: Check if we can create users now
    console.log('\n2. Testing user creation in public.users...');
    
    const testUserId = '11111111-1111-1111-1111-111111111111';
    const testEmail = `trigger-test-${Date.now()}@example.com`;
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: testEmail,
        name: 'Trigger Test User',
      })
      .select()
      .single();
      
    if (userError) {
      if (userError.message.includes('organization_id')) {
        console.log('❌ User table triggers are STILL ACTIVE');
        console.log('   Error:', userError.message);
      } else {
        console.log('❌ Different user creation error:', userError.message);
      }
    } else {
      console.log('✅ User creation SUCCESSFUL - user triggers are fixed!');
      console.log('   Created user:', userData);
      
      // Clean up
      await supabase.from('users').delete().eq('id', testUserId);
      console.log('✅ Test user cleaned up');
    }
    
  } catch (error) {
    console.error('General error:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

checkTriggers();