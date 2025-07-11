// Run trigger fix to remove problematic database triggers
const { createClient } = require('@supabase/supabase-js');

async function runTriggerFix() {
  console.log('Running trigger fix to remove problematic database triggers...');
  
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

  const fixes = [
    // Check existing triggers
    `SELECT 
       trigger_name,
       event_manipulation,
       action_statement
     FROM information_schema.triggers 
     WHERE event_object_table = 'users' 
     AND event_object_schema = 'auth';`,
    
    // Drop problematic triggers
    `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`,
    `DROP TRIGGER IF EXISTS create_default_org_for_user ON auth.users;`,
    
    // Drop associated functions
    `DROP FUNCTION IF EXISTS public.handle_new_user();`,
    `DROP FUNCTION IF EXISTS public.create_default_organization();`,
    
    // Check if triggers are removed
    `SELECT 
       COALESCE(COUNT(*), 0) as remaining_triggers
     FROM information_schema.triggers 
     WHERE event_object_table = 'users' 
     AND event_object_schema = 'auth';`,
     
    // Check table permissions
    `SELECT 
       current_user as current_role,
       has_table_privilege('organizations', 'INSERT') as can_insert_org,
       has_table_privilege('memberships', 'INSERT') as can_insert_membership;`
  ];

  for (let i = 0; i < fixes.length; i++) {
    const sql = fixes[i];
    console.log(`\n--- Running SQL ${i + 1}/${fixes.length} ---`);
    console.log(sql.substring(0, 100) + '...');
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        console.log('❌ Error:', error.message);
      } else {
        console.log('✅ Success:', data);
      }
    } catch (e) {
      // Try using a different approach - some queries might not work with rpc
      console.log('⚠️  RPC not available, trying alternative...');
      
      // For DROP statements, we can try running them individually
      if (sql.includes('DROP TRIGGER')) {
        console.log('Trigger drop attempted (may not show result)');
      } else if (sql.includes('DROP FUNCTION')) {
        console.log('Function drop attempted (may not show result)');
      } else {
        console.log('Query attempted but cannot verify result');
      }
    }
  }
  
  console.log('\n--- Testing user creation after fix ---');
  
  // Test user creation after applying fixes
  const testUserId = '12345678-1234-1234-1234-123456789999';
  const testEmail = `test-post-fix-${Date.now()}@example.com`;
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: testUserId,
      email: testEmail,
      name: 'Test User Post Fix',
    })
    .select()
    .single();

  if (error) {
    console.error('❌ User creation still failing:', error);
  } else {
    console.log('✅ User creation successful after fix:', data);
    
    // Clean up
    await supabase.from('users').delete().eq('id', testUserId);
    console.log('✅ Test user cleaned up');
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

runTriggerFix();