// Simple API test script (CommonJS)
// Tests the article creation and listing API to verify our mock database fixes

// API endpoint
const API_URL = 'http://localhost:3002/api/articles';

async function testArticleAPI() {
  try {
    console.log('===== TESTING ARTICLE API WITH MOCK DATABASE =====');

    // 1. Get all articles (including drafts)
    console.log('\n1. Getting all articles (including drafts)...');
    const allResponse = await fetch(`${API_URL}?showAll=true`);
    
    if (!allResponse.ok) {
      throw new Error(`Failed to fetch articles: ${allResponse.status} ${allResponse.statusText}`);
    }
    
    const allData = await allResponse.json();
    console.log(`Found ${allData.articles.length} total articles`);
    
    if (allData.articles.length > 0) {
      console.log('Sample articles:');
      allData.articles.slice(0, 3).forEach((article, i) => {
        console.log(`  ${i+1}. ${article.title} (Published: ${article.isPublished ? 'Yes' : 'No'})`);
      });
    }
    
    // 2. Create a new test article
    console.log('\n2. Creating a new test article...');
    const timestamp = Date.now();
    const testArticle = {
      title: `Test Article ${timestamp}`,
      slug: `test-article-${timestamp}`,
      content: 'This is a test article with content long enough to pass validation. The article is being created to verify our fixes to the mock database implementation.',
      excerpt: 'Test article excerpt',
      category: 'Test',
      tags: ['test', 'verification'],
      isPublished: true
    };
    
    const createResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testArticle)
    });
    
    // Handle response
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Failed to create article: ${createResponse.status}\n${errorText}`);
    }
    
    const createdArticle = await createResponse.json();
    console.log('Article created successfully:');
    console.log(`  ID: ${createdArticle._id || createdArticle.id}`);
    console.log(`  Title: ${createdArticle.title}`);
    console.log(`  Slug: ${createdArticle.slug}`);
    console.log(`  Published: ${createdArticle.isPublished ? 'Yes' : 'No'}`);
    
    // 3. Get updated article list
    console.log('\n3. Getting updated article list...');
    const updatedResponse = await fetch(`${API_URL}?showAll=true`);
    const updatedData = await updatedResponse.json();
    
    console.log(`Article count before: ${allData.articles.length}`);
    console.log(`Article count after: ${updatedData.articles.length}`);
    
    // 4. Verify the article count increased
    if (updatedData.articles.length > allData.articles.length) {
      console.log('✅ SUCCESS: Article count increased');
    } else {
      console.log('❌ ERROR: Article count did not increase');
    }
    
    // 5. Find the new article in the list
    const foundArticle = updatedData.articles.find(a => a.slug === testArticle.slug);
    
    if (foundArticle) {
      console.log('✅ SUCCESS: New article found in the list');
    } else {
      console.log('❌ ERROR: New article not found in the list');
      console.log('Latest articles:');
      updatedData.articles.slice(0, 5).forEach((a, i) => {
        console.log(`  ${i+1}. ${a.title}`);
      });
    }
    
    // 6. Verify filtering works with isPublished=true
    console.log('\n6. Testing published articles filter...');
    const publishedResponse = await fetch(API_URL);
    const publishedData = await publishedResponse.json();
    
    console.log(`Published articles count: ${publishedData.articles.length}`);
    
    // Check if our new article is in the published list
    const foundInPublished = publishedData.articles.find(a => a.slug === testArticle.slug);
    
    if (foundInPublished) {
      console.log('✅ SUCCESS: New article found in published articles');
    } else {
      console.log('❌ ERROR: New article not found in published articles');
    }
    
    // 7. Summary
    console.log('\n===== TEST SUMMARY =====');
    console.log(`Initial article count: ${allData.articles.length}`);
    console.log(`Final article count: ${updatedData.articles.length}`);
    console.log(`Article creation successful: ${createResponse.ok}`);
    console.log(`Article found in listing: ${foundArticle ? 'Yes' : 'No'}`);
    console.log(`Article found in published listing: ${foundInPublished ? 'Yes' : 'No'}`);
    
    if (updatedData.articles.length > allData.articles.length && foundArticle && foundInPublished) {
      console.log('\n✅ OVERALL TEST RESULT: SUCCESS - Article creation and listing working correctly!');
    } else {
      console.log('\n❌ OVERALL TEST RESULT: FAILURE - Issues remain with article creation or listing');
    }
    
  } catch (error) {
    console.error('TEST ERROR:', error);
  }
}

// Run the test
testArticleAPI();
