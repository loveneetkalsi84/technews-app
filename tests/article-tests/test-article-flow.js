// Test script for article creation and retrieval
const fetch = require('node-fetch');

async function testArticleFlow() {
  const PORT = 3000;
  const baseUrl = `http://localhost:${PORT}`;

  console.log('Starting article test flow...');
  
  try {
    // Test database connection
    console.log('1. Testing database connection...');
    const dbResponse = await fetch(`${baseUrl}/api/test-db`);
    const dbData = await dbResponse.json();
    console.log(`   Database connection: ${dbData.success ? '✅ Success' : '❌ Failed'}`);
    
    // Create a new test article
    console.log('\n2. Creating a new test article...');
    const uniqueId = Date.now();
    const testArticle = {
      title: `Test Article ${uniqueId}`,
      slug: `test-article-flow-${uniqueId}`,
      content: "This is a test article created via the direct API test.",
      excerpt: "Test excerpt",
      category: "News",
      tags: ["test", "api", "flow"],
      isPublished: true, // Setting to true to make it visible in the regular API
      metaDescription: "Test meta description",
      metaKeywords: ["test", "api", "flow"]
    };
    
    const createResponse = await fetch(`${baseUrl}/api/test-article`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testArticle)
    });
    
    const createData = await createResponse.json();
    console.log(`   Article creation: ${createResponse.ok ? '✅ Success' : '❌ Failed'}`);
    
    if (createResponse.ok && createData.article) {
      const articleId = createData.article._id;
      console.log(`   Created article ID: ${articleId}`);
      console.log(`   Article title: ${createData.article.title}`);
      console.log(`   Published: ${createData.article.isPublished ? 'Yes' : 'No'}`);
      
      // Wait a moment to ensure database consistency
      console.log('\n   Waiting 2 seconds for database consistency...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Now fetch all articles
      console.log('\n3. Fetching all articles...');
      const allArticlesResponse = await fetch(`${baseUrl}/api/articles?showAll=true`);
      
      if (allArticlesResponse.ok) {
        const allArticlesData = await allArticlesResponse.json();
        const articles = allArticlesData.articles || [];
        
        console.log(`   Retrieved ${articles.length} articles`);
        
        if (articles.length > 0) {
          console.log('   Article list:');
          articles.forEach((article, i) => {
            console.log(`     ${i+1}. ${article.title} (${article.isPublished ? 'published' : 'draft'})`);
          });
          
          // Check if our newly created article is in the list
          const foundArticle = articles.find(a => a._id === articleId);
          console.log(`\n   Found newly created article: ${foundArticle ? '✅ Yes' : '❌ No'}`);
        } else {
          console.log('   ❌ No articles found in the response');
        }
      } else {
        console.log(`   ❌ Failed to fetch articles: ${allArticlesResponse.status}`);
        try {
          const errorData = await allArticlesResponse.json();
          console.log(`   Error: ${JSON.stringify(errorData)}`);
        } catch (e) {
          console.log(`   Could not parse error response`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testArticleFlow();
