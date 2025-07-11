// Check existing organizations to understand the working structure
const { createClient } = require('@supabase/supabase-js');

async function checkExistingOrgs() {
  console.log('Checking existing organizations...');
  
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
    // Check if there are any existing organizations
    console.log('1. Querying existing organizations...');
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .limit(5);
      
    if (orgError) {
      console.error('❌ Query failed:', orgError);
    } else {
      console.log('✅ Query successful');
      console.log('   Organization count:', orgs.length);
      if (orgs.length > 0) {
        console.log('   Sample organization:', orgs[0]);
      } else {
        console.log('   No organizations found');
      }
    }

    // Check if there are any existing memberships
    console.log('\n2. Querying existing memberships...');
    const { data: memberships, error: memberError } = await supabase
      .from('memberships')
      .select('*')
      .limit(5);
      
    if (memberError) {
      console.error('❌ Memberships query failed:', memberError);
    } else {
      console.log('✅ Memberships query successful');
      console.log('   Membership count:', memberships.length);
      if (memberships.length > 0) {
        console.log('   Sample membership:', memberships[0]);
      }
    }

    // Try to understand the trigger issue by checking if there are any functions or triggers
    console.log('\n3. This database has problematic triggers that prevent organization creation');
    console.log('   The triggers are looking for an "organization_id" field in the NEW record');
    console.log('   but organizations table uses "id" as the primary key');
    
  } catch (error) {
    console.error('General error:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

checkExistingOrgs();