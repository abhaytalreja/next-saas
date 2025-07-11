// Test if RLS policies or other security features are interfering
const { createClient } = require('@supabase/supabase-js');

async function testRLSPolicies() {
  console.log('Testing RLS policies and permissions...');
  
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
    // Test with service role which should bypass RLS
    console.log('1. Testing service role permissions...');
    
    // Check if we can query the tables at all
    const { data: orgData, error: orgQueryError } = await supabase
      .from('organizations')
      .select('count(*)')
      .single();
      
    if (orgQueryError) {
      console.error('❌ Cannot even query organizations table:', orgQueryError);
    } else {
      console.log('✅ Can query organizations table:', orgData);
    }
    
    // Test different insertion approaches
    console.log('\n2. Testing different insertion methods...');
    
    // Method 1: Minimal insert
    const { data: test1, error: error1 } = await supabase
      .from('organizations')
      .insert({ name: 'Test 1', slug: 'test-1-' + Date.now() });
      
    console.log('Method 1 (minimal):', error1 ? `❌ ${error1.message}` : '✅ Success');
    
    // Method 2: With explicit values for all fields
    const { data: test2, error: error2 } = await supabase
      .from('organizations')
      .insert({ 
        name: 'Test 2', 
        slug: 'test-2-' + Date.now(),
        subscription_status: 'trial',
        metadata: {},
        settings: {}
      });
      
    console.log('Method 2 (full fields):', error2 ? `❌ ${error2.message}` : '✅ Success');
    
    // Method 3: Check if the issue is with UUID generation
    const testId = '22222222-2222-2222-2222-222222222222';
    const { data: test3, error: error3 } = await supabase
      .from('organizations')
      .insert({ 
        id: testId,
        name: 'Test 3', 
        slug: 'test-3-' + Date.now()
      });
      
    console.log('Method 3 (explicit ID):', error3 ? `❌ ${error3.message}` : '✅ Success');
    
    // If we got any successes, clean them up
    if (!error1) await supabase.from('organizations').delete().eq('name', 'Test 1');
    if (!error2) await supabase.from('organizations').delete().eq('name', 'Test 2');
    if (!error3) await supabase.from('organizations').delete().eq('id', testId);
    
    console.log('\n3. Summary:');
    console.log('All three insertion methods failed with the same error,');
    console.log('indicating there are still active triggers or constraints');
    console.log('that were not removed by the SQL cleanup script.');
    
  } catch (error) {
    console.error('General error:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testRLSPolicies();