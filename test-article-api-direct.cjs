// Direct mock database test
// This script uses native fetch which is available in Node.js

async function testArticleAPI() {
  try {
    // API endpoint
    const API_URL = 'http://localhost:3002/api/articles';

    // 1. Get all articles (including unpublished)
    console.log('\n1. Fetching all articles (including unpublished)...');
    const allResponse = await fetch(`${API_URL}?showAll=true`);
    
    if (!allResponse.ok) {
      throw new Error(`API Error: ${allResponse.status} ${allResponse.statusText}`);
    }
    
    const allData = await allResponse.json();
    console.log(`Found ${allData.articles.length} total articles`);
    
    // 2. Get only published articles
    console.log('\n2. Fetching only published articles...');
    const publishedResponse = await fetch(API_URL);
    
    if (!publishedResponse.ok) {
      throw new Error(`API Error: ${publishedResponse.status} ${publishedResponse.statusText}`);
    }
    
    const publishedData = await publishedResponse.json();
    console.log(`Found ${publishedData.articles.length} published articles`);
    
    // 3. Create a new article
    console.log('\n3. Creating a new article...');
    const timestamp = Date.now();
    const newArticle = {
      title: `Test Article ${timestamp}`,
      slug: `test-article-${timestamp}`,
      content: 'This is a test article to verify the mock database fix.',
      excerpt: 'Test excerpt',
      category: 'Test',
      tags: ['test', 'mock', 'database'],
      isPublished: true
    };
    
    const createResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newArticle)
    });
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Failed to create article: ${createResponse.status} ${createResponse.statusText}\n${errorText}`);
    }
    
    const createdArticle = await createResponse.json();
    console.log('Article created:');
    console.log(`  ID: ${createdArticle._id || createdArticle.id}`);
    console.log(`  Title: ${createdArticle.title}`);
    console.log(`  Slug: ${createdArticle.slug}`);
    
    // 4. Verify the article was added by checking the updated count
    console.log('\n4. Verifying article was added...');
    const updatedResponse = await fetch(`${API_URL}?showAll=true`);
    const updatedData = await updatedResponse.json();
    
    console.log(`Initial article count: ${allData.articles.length}`);
    console.log(`Updated article count: ${updatedData.articles.length}`);
    
    if (updatedData.articles.length > allData.articles.length) {
      console.log('✅ SUCCESS: Article count increased');
    } else {
      console.log('❌ ERROR: Article count did not increase');
    }
    
    // 5. Look for the created article
    const foundArticle = updatedData.articles.find(a => a.slug === newArticle.slug);
    
    if (foundArticle) {
      console.log('✅ SUCCESS: Created article found in the list');
    } else {
      console.log('❌ ERROR: Created article not found in the list');
      console.log('Latest articles:');
      updatedData.articles.slice(0, 5).forEach((a, i) => {
        console.log(`  ${i+1}. ${a.title} (${a.slug})`);
      });
    }
    
    console.log('\n==== Test Complete ====');
    console.log('Is article creation working? ' + (updatedData.articles.length > allData.articles.length ? 'YES' : 'NO'));
    console.log('Is article listing working? ' + (foundArticle ? 'YES' : 'NO'));
    
  } catch (error) {
    console.error('TEST ERROR:', error);
  }
}

// Run the test
testArticleAPI();
