// Test database connection and table structure
const { createClient } = require('@supabase/supabase-js');

async function testDatabaseConnection() {
  console.log('Testing database connection and table structure...');
  
  // Use the same credentials as the signup API
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
    // Test 1: Check if organizations table exists and can be queried
    console.log('\n1. Testing organizations table...');
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, slug')
      .limit(1);
      
    if (orgError) {
      console.error('Organizations table error:', orgError);
    } else {
      console.log('Organizations table accessible, sample data:', orgs);
    }

    // Test 2: Check if memberships table exists
    console.log('\n2. Testing memberships table...');
    const { data: memberships, error: memberError } = await supabase
      .from('memberships')
      .select('id, user_id, organization_id, role')
      .limit(1);
      
    if (memberError) {
      console.error('Memberships table error:', memberError);
    } else {
      console.log('Memberships table accessible, sample data:', memberships);
    }

    // Test 3: Try to create a test organization
    console.log('\n3. Testing organization creation...');
    const testOrgName = `Test Org ${Date.now()}`;
    const testSlug = `test-org-${Date.now()}`;
    
    const { data: newOrg, error: createError } = await supabase
      .from('organizations')
      .insert({
        name: testOrgName,
        slug: testSlug,
        created_by: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      })
      .select()
      .single();
      
    if (createError) {
      console.error('Organization creation error:', createError);
      console.error('Error details:', JSON.stringify(createError, null, 2));
    } else {
      console.log('Organization created successfully:', newOrg);
      
      // Clean up - delete the test organization
      const { error: deleteError } = await supabase
        .from('organizations')
        .delete()
        .eq('id', newOrg.id);
        
      if (deleteError) {
        console.error('Failed to clean up test organization:', deleteError);
      } else {
        console.log('Test organization cleaned up successfully');
      }
    }

  } catch (error) {
    console.error('General error:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testDatabaseConnection();