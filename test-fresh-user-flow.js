// Test fresh user signup and login flow
const http = require('http');

async function testFreshUserFlow() {
  const uniqueKey = Date.now();
  const email = `tappect+${uniqueKey}@gmail.com`;
  const password = "Test@1234";
  
  console.log('=== TESTING FRESH USER SIGNUP AND LOGIN FLOW ===');
  console.log('Email:', email);
  console.log('Password:', password);
  
  // Step 1: Signup
  console.log('\n1. Testing Fresh User Signup...');
  const signupData = JSON.stringify({
    email,
    password,
    firstName: "Abhay",
    lastName: "Talreja",
    organizationName: "Fresh Test Org"
  });

  const signupResult = await makeRequest('/api/auth/signup', signupData);
  
  if (signupResult.success && signupResult.organization) {
    console.log('✅ Signup successful!');
    console.log('   User ID:', signupResult.user.id);
    console.log('   Organization ID:', signupResult.organization.id);
  } else {
    console.log('❌ Signup failed:', signupResult);
    return;
  }
  
  // Step 2: Wait a moment, then try login
  console.log('\n2. Waiting 3 seconds before login attempt...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n3. Testing Login with Fresh User...');
  const loginData = JSON.stringify({
    email,
    password
  });
  
  const loginResult = await makeRequest('/api/auth/signin', loginData);
  
  if (loginResult.error) {
    console.log('❌ Login failed:', loginResult.error);
    if (loginResult.details) {
      console.log('   Details:', loginResult.details);
    }
  } else if (loginResult.success) {
    console.log('✅ Login successful!');
    console.log('   Session created successfully');
    console.log('   User ID:', loginResult.user?.id);
  } else {
    console.log('🤷 Unexpected login response:', loginResult);
  }
}

async function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3010,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ error: body });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Wait for server to be ready
setTimeout(testFreshUserFlow, 1000);