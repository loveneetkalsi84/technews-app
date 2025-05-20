// Test script to verify article creation and listing 
// using fetch calls to the Next.js API endpoints

async function testArticleCreation() {
  try {
    console.log('===== TESTING ARTICLE CREATION AND LISTING =====');
    
    // Base URL for local API
    const baseUrl = 'http://localhost:3002/api';
    
    // 1. First get a list of existing articles to establish a baseline
    console.log('\n1. Getting list of existing articles...');
    const initialResponse = await fetch(`${baseUrl}/articles?showAll=true`);
    
    if (!initialResponse.ok) {
      throw new Error(`Failed to fetch initial articles: ${initialResponse.status} ${initialResponse.statusText}`);
    }
    
    const initialData = await initialResponse.json();
    console.log(`Found ${initialData.articles.length} articles initially`);
    console.log('Sample article titles:');
    initialData.articles.slice(0, 3).forEach((article, i) => {
      console.log(`  ${i+1}. ${article.title} (${article.isPublished ? 'Published' : 'Draft'})`);
    });
    
    // 2. Create a new article
    console.log('\n2. Creating a new article...');
    const newArticle = {
      title: 'Test Article via API ' + Date.now(),
      slug: 'test-article-api-' + Date.now(),
      content: 'This is a test article content created to verify our fixes for article creation and listing.',
      excerpt: 'Test article excerpt',
      category: 'Test',
      tags: ['test', 'api', 'verification'],
      isPublished: true
    };
    
    const createResponse = await fetch(`${baseUrl}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newArticle)
    });
    
    if (!createResponse.ok) {
      throw new Error(`Failed to create article: ${createResponse.status} ${createResponse.statusText}`);
    }
    
    const createdArticle = await createResponse.json();
    console.log('Article created successfully:');
    console.log(`  Title: ${createdArticle.title}`);
    console.log(`  Slug: ${createdArticle.slug}`);
    console.log(`  Published: ${createdArticle.isPublished ? 'Yes' : 'No'}`);
    
    // 3. Get updated list of articles to verify the new one is included
    console.log('\n3. Getting updated list of articles...');
    const updatedResponse = await fetch(`${baseUrl}/articles?showAll=true`);
    
    if (!updatedResponse.ok) {
      throw new Error(`Failed to fetch updated articles: ${updatedResponse.status} ${updatedResponse.statusText}`);
    }
    
    const updatedData = await updatedResponse.json();
    console.log(`Found ${updatedData.articles.length} articles after creation`);
    
    // 4. Verify the article count increased
    if (updatedData.articles.length > initialData.articles.length) {
      console.log('✅ SUCCESS: Article count increased');
    } else {
      console.log('❌ ERROR: Article count did not increase as expected');
    }
    
    // 5. Look for our newly created article
    const foundArticle = updatedData.articles.find(article => article.slug === newArticle.slug);
    
    if (foundArticle) {
      console.log('✅ SUCCESS: Newly created article found in the article list');
      console.log('  Title:', foundArticle.title);
      console.log('  Slug:', foundArticle.slug);
      console.log('  Published:', foundArticle.isPublished ? 'Yes' : 'No');
    } else {
      console.log('❌ ERROR: Newly created article NOT found in the article list');
      console.log('  Articles found:', updatedData.articles.length);
      console.log('  Latest articles:');
      updatedData.articles.slice(0, 5).forEach((article, i) => {
        console.log(`    ${i+1}. ${article.title} (${article.slug})`);
      });
    }
    
    // 6. Get only published articles
    console.log('\n6. Getting only published articles...');
    const publishedResponse = await fetch(`${baseUrl}/articles`);
    
    if (!publishedResponse.ok) {
      throw new Error(`Failed to fetch published articles: ${publishedResponse.status} ${publishedResponse.statusText}`);
    }
    
    const publishedData = await publishedResponse.json();
    console.log(`Found ${publishedData.articles.length} published articles`);
    
    // 7. Test summary
    console.log('\n===== TEST SUMMARY =====');
    console.log(`Initial article count: ${initialData.articles.length}`);
    console.log(`Final article count: ${updatedData.articles.length}`);
    console.log(`Article creation successful: ${createResponse.ok ? 'Yes' : 'No'}`);
    console.log(`New article found in listing: ${foundArticle ? 'Yes' : 'No'}`);
    
    if (updatedData.articles.length > initialData.articles.length && foundArticle) {
      console.log('\n✅ OVERALL TEST RESULT: SUCCESS - Article creation and listing is working correctly!');
    } else {
      console.log('\n❌ OVERALL TEST RESULT: FAILURE - Issue with article creation or listing remains');
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test function
testArticleCreation();
