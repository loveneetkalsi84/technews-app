// Test script for article API
// Using native fetch (available in Node.js 18+)

async function testArticleCreation() {
  console.log('Starting API test...');
  
  // Configure test settings
  const PORT = 3002; // Update this to match your Next.js server port
  const USE_TEST_ENDPOINT = true; // Set to false to test the real articles endpoint (requires auth)
  
  const testArticleData = {
    title: "Test Article via API",
    slug: "test-article-api-" + Date.now(),
    content: "This is a test article created via the API. This is part of troubleshooting the article creation process.",
    excerpt: "Test article excerpt",
    category: "News",
    tags: ["test", "api", "troubleshooting"],
    isPublished: false,
    metaDescription: "Test meta description",
    metaKeywords: "test,api,troubleshooting"
  };
  
  try {
    // Check if server is running first
    try {
      const pingResponse = await fetch(`http://localhost:${PORT}/api/test-connection`);
      if (pingResponse.ok) {
        const pingData = await pingResponse.json();
        console.log('✅ Server connection test successful:', pingData.message || 'Connected');
      } else {
        throw new Error(`Server responded with status ${pingResponse.status}`);
      }
    } catch (connError) {
      console.error(`❌ Server connection failed. Make sure the Next.js server is running on port ${PORT}`);
      console.log(`Run the server with: npm run dev -- -p ${PORT}`);
      return;
    }
    
    // Choose the endpoint based on settings
    const endpoint = USE_TEST_ENDPOINT 
      ? `http://localhost:${PORT}/api/test-article` 
      : `http://localhost:${PORT}/api/articles`;
    
    console.log(`Sending request to ${USE_TEST_ENDPOINT ? 'test' : 'production'} API endpoint...`);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testArticleData),
      ...(USE_TEST_ENDPOINT ? {} : { credentials: 'include' }) // Include cookies for real endpoint
    });
    
    console.log('Response status:', response.status);
    
    try {
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.log('Could not parse response as JSON');
      const text = await response.text();
      console.log('Raw response:', text);
    }
    
    if (response.ok) {
      console.log('✅ Test successful! Article created successfully.');
    } else {
      console.log('❌ Test failed. Check the error details above.');
      
      if (!USE_TEST_ENDPOINT && (response.status === 401 || response.status === 403)) {
        console.log('\nAuthentication error detected. This endpoint requires authentication.');
        console.log('Try one of the following:');
        console.log('1. Log in through the web UI first at http://localhost:3002/login');
        console.log('2. Set USE_TEST_ENDPOINT to true to use the test endpoint that bypasses auth');
        console.log('3. Run test-auth.js to test authentication specifically');
      }
    }
  } catch (error) {
    console.error('Error during test:', error);
    console.log('❌ Test failed. Is the development server running?');
  }
}

testArticleCreation();
