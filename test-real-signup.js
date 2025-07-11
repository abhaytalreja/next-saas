// Test the real signup with your exact payload
const http = require('http');

async function testRealSignup() {
  const testData = JSON.stringify({
    "email": "abhay.talreja+test@gmail.com",
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

  console.log('Testing signup with your exact payload...');

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
        
        if (json.organization) {
          console.log('✅ SUCCESS: Organization "Axe" was created!');
        } else {
          console.log('❌ Organization creation failed');
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

// Wait a bit for server to be ready
setTimeout(testRealSignup, 1000);