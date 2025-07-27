// Quick test script for email system
const fetch = require('node-fetch');

async function testEmailSystem() {
  const url = 'http://localhost:3010/api/email/send';
  
  const testEmail = {
    type: 'simple',
    to: 'test@example.com',
    subject: 'NextSaaS Email Test',
    html: '<h1>🎉 Success!</h1><p>Your NextSaaS email system is working!</p>',
    text: 'Success! Your NextSaaS email system is working!',
    organizationId: 'test-org-123'
  };

  try {
    console.log('🧪 Testing NextSaaS Email System...');
    console.log('📍 URL:', url);
    console.log('📧 Email:', testEmail);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEmail)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Email sent successfully!');
      console.log('📊 Result:', result);
    } else {
      console.log('❌ Email failed to send');
      console.log('🐛 Error:', result);
    }
  } catch (error) {
    console.log('🔴 Connection failed:', error.message);
    console.log('💡 Make sure the NextSaaS app is running on port 3010');
  }
}

testEmailSystem();