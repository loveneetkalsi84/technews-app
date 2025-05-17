// Test script for authentication
// This script helps you troubleshoot authentication issues

async function testAuthentication() {
  console.log('Starting authentication test...');
  
  const credentials = {
    email: "admin@example.com", // Change to your admin email
    password: "your-admin-password" // Change to your admin password
  };
  
  try {
    // Check if server is running first
    try {
      await fetch('http://localhost:3002/api/test-connection');
      console.log('✅ Server connection test successful');
    } catch (connError) {
      console.error('❌ Server connection failed. Make sure the Next.js server is running on port 3002');
      console.log('Run the server with: npm run dev -- -p 3002');
      return;
    }
    
    // Try to authenticate
    console.log('Attempting to authenticate...');
    const response = await fetch('http://localhost:3002/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials),
      credentials: 'include' // Important for session cookies
    });
    
    console.log('Authentication response status:', response.status);
    
    try {
      const data = await response.json();
      console.log('Authentication response:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.log('Could not parse response as JSON');
      const text = await response.text();
      console.log('Raw response:', text);
    }
    
    // Now try to get the session
    console.log('\nChecking session...');
    const sessionResponse = await fetch('http://localhost:3002/api/auth/session', {
      credentials: 'include'
    });
    
    console.log('Session response status:', sessionResponse.status);
    
    try {
      const sessionData = await sessionResponse.json();
      console.log('Session data:', JSON.stringify(sessionData, null, 2));
      
      if (sessionData.user) {
        console.log(`\n✅ Successfully authenticated as ${sessionData.user.name || sessionData.user.email}`);
        console.log(`User role: ${sessionData.user.role || 'Not specified'}`);
        
        if (sessionData.user.role !== 'admin' && sessionData.user.role !== 'editor') {
          console.log('\n⚠️ Warning: Your user does not have admin or editor privileges required to create articles');
        }
      } else {
        console.log('\n❌ Not authenticated. No user session found.');
      }
    } catch (parseError) {
      console.log('Could not parse session response as JSON');
    }
    
  } catch (error) {
    console.error('Error during authentication test:', error);
    console.log('❌ Test failed. Is the development server running?');
  }
}

// Run the test
testAuthentication();
