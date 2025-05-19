// Test script for article API
// Using native fetch (available in Node.js 18+)

async function testArticleCreation() {
  console.log('Starting Article API test...');
  
  // Configure test settings
  const PORT = process.env.PORT || 3000; // Use environment variable or default to 3000
  const USE_TEST_ENDPOINT = process.env.USE_TEST_ENDPOINT !== 'false'; // Default to true unless explicitly set to false
  
  // Create test article with timestamp to ensure uniqueness
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const testArticleData = {
    title: `Test Article via API ${timestamp}`,
    slug: `test-article-api-${Date.now()}`,
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
    console.log(`Checking server connection on port ${PORT}...`);
    try {
      const pingResponse = await fetch(`http://localhost:${PORT}/api/test-connection`, {
        headers: { 'Cache-Control': 'no-cache' },
        timeout: 5000 // 5 second timeout
      });
      
      if (pingResponse.ok) {
        const pingData = await pingResponse.json();
        console.log('✅ Server connection test successful:', pingData.message || 'Connected');
      } else {
        throw new Error(`Server responded with status ${pingResponse.status} ${pingResponse.statusText}`);
      }
    } catch (connError) {
      console.error(`❌ Server connection failed. Make sure the Next.js server is running on port ${PORT}`);
      console.log(`Run the server with: npm run dev -- -p ${PORT}`);
      process.exit(1); // Exit with error code
    }
      // Choose the endpoint based on settings
    const endpoint = USE_TEST_ENDPOINT 
      ? `http://localhost:${PORT}/api/test-article` 
      : `http://localhost:${PORT}/api/articles`;
    
    console.log(`Sending request to ${USE_TEST_ENDPOINT ? 'test' : 'production'} API endpoint...`);
    console.log(`Article title: "${testArticleData.title}"`);
    console.log(`Article slug: "${testArticleData.slug}"`);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(testArticleData),
      ...(USE_TEST_ENDPOINT ? {} : { credentials: 'include' }) // Include cookies for real endpoint
    });
    
    console.log('Response status:', response.status, response.statusText);
    
    let data;
    let responseText;
    
    try {
      responseText = await response.text();
      
      try {
        // Try to parse as JSON
        data = JSON.parse(responseText);
        console.log('Response data:', JSON.stringify(data, null, 2));
      } catch (jsonError) {
        console.log('Response is not valid JSON. Raw response:');
        console.log(responseText.substring(0, 1000)); // Limit output length
        if (responseText.length > 1000) {
          console.log(`... (${responseText.length - 1000} more characters)`);
        }
      }
    } catch (textError) {
      console.log('Could not read response text:', textError.message);
    }
      if (response.ok) {
      console.log('✅ Test successful! Article created successfully.');
      
      // Verify the created article is accessible
      if (data && data._id) {
        console.log(`\nArticle ID: ${data._id}`);
        console.log(`Article Title: ${data.title}`);
        console.log(`Article Slug: ${data.slug}`);
        
        // Verify the article URL
        const articleUrl = `http://localhost:${PORT}/articles/${data.slug}`;
        console.log(`\nArticle URL: ${articleUrl}`);
        console.log('\nYou can verify the article was created by visiting the URL above.');
        
        process.exit(0); // Success
      } else {
        console.log('⚠️ Article created but no ID returned. Cannot verify article URL.');
        process.exit(0); // Still consider it a success
      }
    } else {
      console.log('❌ Test failed. Check the error details above.');
      
      if (!USE_TEST_ENDPOINT && (response.status === 401 || response.status === 403)) {
        console.log('\nAuthentication error detected. This endpoint requires authentication.');
        console.log('Try one of the following:');
        console.log(`1. Log in through the web UI first at http://localhost:${PORT}/login`);
        console.log('2. Set USE_TEST_ENDPOINT to true to use the test endpoint that bypasses auth');
        console.log('3. Run tests/auth-tests/test-auth.js to test authentication specifically');
      } else if (response.status === 409) {
        console.log('\nConflict error: An article with the same slug might already exist.');
        console.log('The test is generating a unique slug with timestamp, but there might be an issue with slug handling.');
      } else if (response.status === 422 || response.status === 400) {
        console.log('\nValidation error: The article data is invalid.');
        console.log('Check the response data above for specific validation errors.');
      } else if (response.status >= 500) {
        console.log('\nServer error: There was an error on the server side.');
        console.log('Check the server logs for more information.');
      }
      
      process.exit(1); // Error
    }
  } catch (error) {
    console.error('Error during test:', error);
    console.log('❌ Test failed. Is the development server running?');
    process.exit(1); // Error
  }
}

testArticleCreation();
