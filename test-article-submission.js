// Test script for article creation functionality
// Using native fetch (available in Node.js 18+)

async function testArticleSubmission() {
  console.log('Starting article submission test...');
  
  const testArticleData = {
    title: "Test Article Submission After Fix",
    slug: "test-article-submission-" + Date.now(),
    content: "This is a test article to verify the fix for the Response type issue. This article was created to test the article submission functionality.",
    excerpt: "Testing article submission fix",
    category: "News",
    tags: ["test", "fix", "response-type"],
    isPublished: false,
    metaDescription: "Test meta description",
    metaKeywords: "test,fix,typescript"
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
    
    // Try to get authentication token - this is for testing purposes
    // In a real app, you would implement proper login
    console.log('Attempting to authenticate...');
    
    // The server is running on port 3002
    console.log('Sending request to articles API endpoint...');
    const response = await fetch('http://localhost:3002/api/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You might need to add an Authorization header with a token
        // 'Authorization': 'Bearer your-token-here'
      },
      body: JSON.stringify(testArticleData),
      credentials: 'include' // Includes cookies in the request
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
      console.log('✅ Test successful! Article submitted successfully.');
    } else {
      console.log('❌ Test failed. Check the error details above.');
      
      // Provide troubleshooting guidance based on status code
      if (response.status === 401) {
        console.log('Authentication error: You need to be logged in with admin or editor privileges.');
        console.log('Try logging in through the web UI first at http://localhost:3002/login');
      } else if (response.status === 403) {
        console.log('Permission error: Your user account does not have editor or admin privileges.');
      }
    }
  } catch (error) {
    console.error('Error during test:', error);
    console.log('❌ Test failed. Is the development server running?');
    console.log('Run the server with: npm run dev -- -p 3002');
  }
}

// Run the test
testArticleSubmission();
