// Test signup with a fresh email that doesn't exist
const http = require('http');

async function testFreshSignup() {
  const testData = JSON.stringify({
    "email": `abhay.test.${Date.now()}@gmail.com`,
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

  console.log('Testing signup with fresh email...');
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
          console.log('✅ SUCCESS: Signup completed without email confirmation error!');
          if (json.organization) {
            console.log('✅ SUCCESS: Organization created successfully!');
          }
        } else {
          console.log('❌ FAILED: Signup failed with error');
        }
      } catch (e) {
        console.log('Failed to parse as JSON');
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error);
  });

  req.write(testData);
  req.end();
}

testFreshSignup();