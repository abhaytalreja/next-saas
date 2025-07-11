// Test signup API to debug organization creation
const http = require('http');

async function testSignup() {
  const testData = JSON.stringify({
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    organizationName: 'Acme Inc.'
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

  console.log('Testing signup with data:', JSON.parse(testData));

  const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      console.log('Response Body:', body);
      try {
        const json = JSON.parse(body);
        console.log('Parsed Response:', JSON.stringify(json, null, 2));
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

// Wait a bit for server to be fully ready
setTimeout(testSignup, 2000);