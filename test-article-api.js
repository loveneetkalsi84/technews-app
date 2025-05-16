// Test script for article API
// Using native fetch (available in Node.js 18+)

async function testArticleCreation() {
  console.log('Starting API test...');
  
  const testArticleData = {
    title: "Test Article via API",
    slug: "test-article-api-" + Date.now(),
    content: "This is a test article created via the API. This is part of troubleshooting the article creation process.",
    excerpt: "Test article excerpt",
    category: "News",
    tags: ["test", "api", "troubleshooting"],
    status: "draft"
  };
  
  try {
    console.log('Sending request to API endpoint...');
    const response = await fetch('http://localhost:3000/api/test-article', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testArticleData)
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Test successful! Article created successfully.');
    } else {
      console.log('❌ Test failed. Check the error details above.');
    }
  } catch (error) {
    console.error('Error during test:', error);
    console.log('❌ Test failed. Is the development server running?');
  }
}

testArticleCreation();
