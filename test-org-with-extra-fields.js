// Test organization creation with extra fields to satisfy triggers
const { createClient } = require('@supabase/supabase-js');

async function testOrgWithExtraFields() {
  console.log('Testing organization creation with extra fields...');
  
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
    const orgName = `Test Org ${Date.now()}`;
    const orgSlug = `test-org-${Date.now()}`;
    
    // Try different combinations to see if we can satisfy the trigger
    const testCases = [
      {
        name: 'With metadata',
        data: {
          name: orgName,
          slug: orgSlug,
          metadata: {},
          settings: {},
        }
      },
      {
        name: 'With all optional fields',
        data: {
          name: orgName + '-full',
          slug: orgSlug + '-full',
          domain: null,
          logo_url: null,
          settings: {},
          metadata: {},
          subscription_status: 'trial',
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`\nTesting: ${testCase.name}`);
      console.log('Data:', testCase.data);
      
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert(testCase.data)
        .select()
        .single();
        
      if (orgError) {
        console.error(`❌ ${testCase.name} failed:`, orgError.message);
      } else {
        console.log(`✅ ${testCase.name} succeeded:`, orgData);
        
        // Clean up
        await supabase.from('organizations').delete().eq('id', orgData.id);
        console.log('✅ Cleaned up');
        break; // If one succeeds, no need to test others
      }
    }

  } catch (error) {
    console.error('General error:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testOrgWithExtraFields();