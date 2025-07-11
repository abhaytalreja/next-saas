// Test complete signup and login flow
const http = require('http');

async function testSignupAndLogin() {
  const uniqueKey = Date.now();
  const email = `tappect+${uniqueKey}@gmail.com`;
  const password = "Test@1234";
  
  console.log('=== TESTING COMPLETE SIGNUP AND LOGIN FLOW ===');
  console.log('Email:', email);
  console.log('Password:', password);
  
  // Step 1: Signup
  console.log('\n1. Testing Signup...');
  const signupData = JSON.stringify({
    email,
    password,
    firstName: "Abhay",
    lastName: "Talreja",
    organizationName: "Axe"
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
  console.log('\n2. Waiting 2 seconds before login attempt...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\n3. Testing Login...');
  const loginData = JSON.stringify({
    email,
    password
  });
  
  const loginResult = await makeRequest('/api/auth/signin', loginData);
  
  if (loginResult.error) {
    console.log('❌ Login failed:', loginResult.error);
    if (loginResult.error.includes('Email not confirmed')) {
      console.log('   This is the email confirmation issue we need to fix');
    }
  } else {
    console.log('✅ Login successful!');
    console.log('   Session created successfully');
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
setTimeout(testSignupAndLogin, 2000);