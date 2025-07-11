// Test signup with proper email format as requested
const http = require('http');

async function testWithProperEmail() {
  const uniqueKey = Date.now();
  const testData = JSON.stringify({
    "email": `tappect+${uniqueKey}@gmail.com`,
    "password": "Test@1234",
    "firstName": "Abhay",
    "lastName": "Talreja",
    "organizationName": "Axe"
  });

  const options = {
    hostname: 'localhost',
    port: 3010,
    path: '/api/auth/signup',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testData)
    }
  };

  console.log('Testing signup with proper email format...');
  console.log('Payload:', JSON.parse(testData));

  const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      console.log('Response Body:', body);
      try {
        const json = JSON.parse(body);
        console.log('Parsed Response:', JSON.stringify(json, null, 2));
        
        if (res.statusCode === 200 && json.success) {
          console.log('✅ SUCCESS: Signup completed successfully!');
          if (json.organization && json.organization.id) {
            console.log('✅ SUCCESS: Organization "Axe" created with ID:', json.organization.id);
          } else {
            console.log('❌ ISSUE: Organization creation returned null');
            console.log('   This suggests the audit function may be causing issues again');
          }
        } else {
          console.log('❌ FAILED: Signup failed');
          if (json.error) {
            console.log('Error:', json.error);
          }
        }
      } catch (e) {
        console.log('Failed to parse response as JSON');
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error);
  });

  req.write(testData);
  req.end();
}

testWithProperEmail();