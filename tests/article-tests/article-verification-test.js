// This script creates a test article via the API and retrieves all articles 
// to ensure articles are being created and retrieved correctly.

const createAndVerifyArticle = async () => {
  try {
    console.log('1. Creating a test article...');
    
    // Create a unique test article
    const testArticle = {
      title: `Test Article ${new Date().toISOString()}`,
      slug: `test-article-${Date.now()}`,
      content: 'This is a test article content. It should appear in the admin interface.',
      excerpt: 'Test excerpt for verification',
      isPublished: true,
      publishedAt: new Date().toISOString(),
      category: 'News',
      sourceType: 'manual'
    };
      // Create article via API
    const createResponse = await fetch('http://localhost:3001/api/test-article', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testArticle)
    });
    
    const createResult = await createResponse.json();
    console.log('Create article result:', createResult);
    
    if (!createResult.success && !createResult.article) {
      throw new Error('Failed to create article: ' + JSON.stringify(createResult));
    }
    
    console.log('✅ Test article created successfully!');
    
    // Wait 1 second before retrieving the articles
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('2. Retrieving all articles to verify...');
      // Get all articles (including unpublished)
    const getResponse = await fetch('http://localhost:3001/api/articles?showAll=true');
    const getResult = await getResponse.json();
    
    console.log(`Found ${getResult.articles.length} total articles`);
    console.log('Latest 3 articles:', getResult.articles.slice(0, 3).map(a => ({
      id: a._id,
      title: a.title,
      isPublished: a.isPublished,
      createdAt: a.createdAt
    })));
    
    // Check if our test article is there
    const foundArticle = getResult.articles.find(a => a.title === testArticle.title);
    if (foundArticle) {
      console.log('✅ Test article found in the articles list!');
    } else {
      console.log('❌ Test article NOT found in the articles list!');
    }
    
    return {
      success: true,
      articleCreated: createResult.article,
      allArticles: getResult.articles,
      foundInList: !!foundArticle
    };
  } catch (error) {
    console.error('Error in article test:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Run the test when the file is executed directly
if (typeof window === 'undefined') {
  createAndVerifyArticle().then(result => {
    console.log('Test completed with result:', result.success ? 'SUCCESS' : 'FAILURE');
    process.exit(result.success ? 0 : 1);
  });
}

export default createAndVerifyArticle;
