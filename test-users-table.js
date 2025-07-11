// Test users table structure
const { createClient } = require('@supabase/supabase-js');

async function testUsersTable() {
  console.log('Testing users table structure...');
  
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
    // Check if public.users table exists
    console.log('\n1. Testing public.users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
      
    if (usersError) {
      console.error('Public users table error:', usersError);
    } else {
      console.log('Public users table accessible, sample data:', users);
      console.log('User count:', users.length);
    }

    // Check the most recent user created (should be our test user)
    console.log('\n2. Finding most recent user...');
    const { data: recentUsers, error: recentError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
      
    if (recentError) {
      console.error('Recent users query error:', recentError);
    } else {
      console.log('Recent users:', recentUsers);
    }

    // Also check auth.users to compare
    console.log('\n3. Checking auth.users (recent entries)...');
    // We can't directly query auth.users with the client, but we can check if our user exists by email
    
  } catch (error) {
    console.error('General error:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testUsersTable();