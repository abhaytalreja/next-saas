// Inspect database table structure
const { createClient } = require('@supabase/supabase-js');

async function inspectDatabaseTables() {
  console.log('Inspecting database table structure...');
  
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
    // Try different possible table names for users
    const possibleTables = ['users', 'profiles', 'user_profiles'];
    
    for (const tableName of possibleTables) {
      console.log(`\n--- Testing table: ${tableName} ---`);
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
          
        if (error) {
          console.log(`❌ Table ${tableName} error:`, error.message);
        } else {
          console.log(`✅ Table ${tableName} exists and is accessible`);
          console.log(`   Sample data:`, data);
        }
      } catch (e) {
        console.log(`❌ Table ${tableName} exception:`, e.message);
      }
    }

    // Try to get table schema information
    console.log('\n--- Testing table information ---');
    try {
      // This might not work with regular Supabase client, but let's try
      const { data: tables, error: tableError } = await supabase
        .rpc('get_table_info'); // This RPC might not exist
        
      if (tableError) {
        console.log('Table info RPC not available:', tableError.message);
      } else {
        console.log('Available tables:', tables);
      }
    } catch (e) {
      console.log('Table info not available via RPC');
    }

  } catch (error) {
    console.error('General error:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

inspectDatabaseTables();