// Test script for retrieving an article by slug
// Using native fetch (available in Node.js 18+)

async function testArticleRetrieval() {
  console.log('Starting article retrieval test...');
  
  // Configure test settings
  const PORT = 3000; // Update this to match your Next.js server port
  
  // Get the slug from command line arguments or use a default one
  const testSlug = process.argv[2] || 'test-article-api-' + Date.now();
  
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
    
    // Endpoint to retrieve article by slug
    const endpoint = `http://localhost:${PORT}/api/articles/${testSlug}`;
    
    console.log(`Attempting to retrieve article with slug: ${testSlug}`);
    console.log(`GET request to: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    
    try {
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      // Check if article exists and has expected properties
      if (data.article) {
        console.log('\n✅ Article found successfully!');
        console.log('Title:', data.article.title);
        console.log('Slug:', data.article.slug);
        console.log('Content preview:', data.article.content.substring(0, 100) + '...');
        
        // Test the frontend URL to view this article
        const frontendUrl = `http://localhost:${PORT}/articles/${data.article.slug}`;
        console.log(`\nFrontend URL for this article: ${frontendUrl}`);
        
        // Try to access the frontend URL
        console.log('\nChecking if the article page loads properly...');
        try {
          const pageResponse = await fetch(frontendUrl);
          console.log('Article page response status:', pageResponse.status);
          
          if (pageResponse.ok) {
            console.log('✅ Article page loaded successfully!');
          } else {
            console.log('❌ Article page failed to load correctly.');
          }
        } catch (pageError) {
          console.error('Error fetching article page:', pageError.message);
        }
      } else {
        console.log('❌ Article not found or unexpected response format.');
        console.log('Response data:', data);
      }
    } catch (parseError) {
      console.log('Could not parse response as JSON');
      const text = await response.text();
      console.log('Raw response:', text);
    }
    
    if (response.ok) {
      console.log('\n✅ API test successful!');
    } else {
      console.log('\n❌ API test failed. Check the error details above.');
      
      if (response.status === 404) {
        console.log('\nArticle not found. Possible reasons:');
        console.log('1. The slug does not exist in the database');
        console.log('2. The article API endpoint is not correctly implemented');
        console.log('3. There might be a route configuration issue');
        
        // Let's also check if the API articles endpoint exists
        try {
          const apiCheckResponse = await fetch(`http://localhost:${PORT}/api/articles`);
          console.log('\nArticles API check status:', apiCheckResponse.status);
          if (apiCheckResponse.ok) {
            console.log('✅ Articles API endpoint exists');
          } else {
            console.log('❌ Articles API endpoint may have issues');
          }
        } catch (apiCheckError) {
          console.error('Error checking articles API:', apiCheckError.message);
        }
      }
    }
  } catch (error) {
    console.error('Error during test:', error);
    console.log('❌ Test failed. Is the development server running?');
  }
}

// If a slug is provided as a command-line argument, use it.
// Otherwise, we'll first create a test article and then try to retrieve it.
if (process.argv[2]) {
  testArticleRetrieval();
} else {
  // Create an article first, then test retrieval
  console.log('No slug provided. Creating a test article first...');
  
  // Import and run the article creation test first
  const createAndTest = async () => {
    try {
      // First create a test article
      const PORT = 3000;
      const testArticleData = {
        title: "Test Article for Retrieval",
        slug: "test-article-retrieval-" + Date.now(),
        content: "This is a test article created for testing the article retrieval process.",
        excerpt: "Test article excerpt",
        category: "News",
        tags: ["test", "retrieval", "troubleshooting"],
        isPublished: true,
        metaDescription: "Test meta description",
        metaKeywords: "test,retrieval,troubleshooting"
      };
      
      const endpoint = `http://localhost:${PORT}/api/test-article`;
      
      console.log(`Creating test article with slug: ${testArticleData.slug}`);
      const createResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testArticleData)
      });
      
      if (createResponse.ok) {
        const createData = await createResponse.json();
        console.log('✅ Test article created successfully!');
        
        // Now test retrieving this article
        console.log('\nNow testing article retrieval...');
        process.argv[2] = testArticleData.slug;
        await testArticleRetrieval();
      } else {
        console.log('❌ Failed to create test article. Skipping retrieval test.');
        console.log('Response status:', createResponse.status);
        try {
          const data = await createResponse.json();
          console.log('Error details:', data);
        } catch (e) {
          console.log('Could not parse error response');
        }
      }
    } catch (err) {
      console.error('Error in create and test flow:', err);
    }
  };
  
  createAndTest();
}
