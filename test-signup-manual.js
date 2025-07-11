// Manual test of signup API to debug organization creation
const fetch = require('node-fetch');

async function testSignup() {
  console.log('Testing signup API...');
  
  const testData = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    organizationName: 'Acme Inc.'
  };
  
  console.log('Test data:', testData);
  
  try {
    const response = await fetch('http://localhost:3010/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.text();
    console.log('Response body:', result);
    
    // Try to parse as JSON
    try {
      const json = JSON.parse(result);
      console.log('Parsed JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Could not parse as JSON');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Wait a bit for server to start, then test
setTimeout(testSignup, 5000);