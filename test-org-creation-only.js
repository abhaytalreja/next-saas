// Test organization creation without foreign key constraints
const { createClient } = require('@supabase/supabase-js');

async function testOrgCreationOnly() {
  console.log('Testing organization creation without created_by constraint...');
  
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
    // Test organization creation without created_by field
    const orgName = `Test Org ${Date.now()}`;
    const orgSlug = `test-org-${Date.now()}`;
    
    console.log('Creating organization without created_by field...');
    console.log('Name:', orgName);
    console.log('Slug:', orgSlug);
    
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: orgName,
        slug: orgSlug,
        // No created_by field
      })
      .select()
      .single();
      
    if (orgError) {
      console.error('❌ Organization creation failed:', orgError);
      console.error('   Error code:', orgError.code);
      console.error('   Error message:', orgError.message);
    } else {
      console.log('✅ Organization created successfully:', orgData);
      
      // Clean up
      await supabase.from('organizations').delete().eq('id', orgData.id);
      console.log('✅ Test organization cleaned up');
    }

  } catch (error) {
    console.error('General error:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testOrgCreationOnly();