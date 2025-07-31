// Test Google OAuth Backend Integration
const testGoogleAuth = async () => {
  try {
    console.log('Testing Google OAuth backend endpoint...');
    
    // Test the POST endpoint for Google OAuth
    const response = await fetch('http://localhost:5000/api/auth/google/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        credential: 'fake-test-credential'
      }),
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);

    if (response.status === 400 && data.message.includes('Invalid Google credential')) {
      console.log('✅ Google OAuth endpoint is working (correctly rejected fake credential)');
    } else {
      console.log('❌ Unexpected response from Google OAuth endpoint');
    }

  } catch (error) {
    console.error('❌ Error testing Google OAuth:', error);
  }
};

// Test regular auth endpoints
const testRegularAuth = async () => {
  try {
    console.log('\nTesting regular registration endpoint...');
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'User'
      }),
    });

    const data = await response.json();
    console.log('Registration response status:', response.status);
    console.log('Registration response:', data);

  } catch (error) {
    console.error('❌ Error testing registration:', error);
  }
};

// Run tests
testGoogleAuth();
testRegularAuth();
