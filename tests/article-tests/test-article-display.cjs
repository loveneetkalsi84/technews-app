// Test article creation via the test-article API endpoint
const fetch = require('node-fetch');

async function testArticleCreation() {
  try {
    console.log("Creating a test article via test-article endpoint...");
    
    // Create a unique article for testing
    const testArticle = {
      title: `Test Article ${Date.now()}`,
      slug: `test-article-${Date.now()}`,
      content: "This is a test article created to verify the article display functionality.",
      excerpt: "Test excerpt for verification",
      status: "published", // This tells the test endpoint to publish the article
      category: "News",
      tags: ["test", "verification"]
    };
    
    // Use the test-article endpoint which doesn't require auth
    const createResponse = await fetch('http://localhost:3002/api/test-article', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testArticle)
    });
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Failed to create test article: ${createResponse.status} ${errorText}`);
    }
    
    const createResult = await createResponse.json();
    console.log("Test article created successfully:", createResult.article._id);
    
    // Wait for the article to be saved
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check all articles including drafts
    console.log("\nFetching all articles with showAll=true...");
    const allResponse = await fetch('http://localhost:3002/api/articles?showAll=true');
    const allData = await allResponse.json();
    
    const allArticlesCount = allData.articles.length;
    console.log(`Found ${allArticlesCount} total articles (published and draft)`);
    
    // Print the first 3 articles
    console.log("Latest 3 articles:", allData.articles.slice(0, 3).map(a => ({
      id: a._id,
      title: a.title,
      isPublished: a.isPublished,
      createdAt: a.createdAt
    })));
    
    // Check if our article is in the results
    const foundInAll = allData.articles.some(article => article.slug === testArticle.slug);
    
    if (foundInAll) {
      console.log("✅ Test article found in all articles list with showAll=true");
    } else {
      console.log("❌ ERROR: Test article NOT found in all articles list with showAll=true");
    }
    
    return {
      success: foundInAll,
      articleId: createResult.article._id,
      allArticlesCount
    };
  } catch (error) {
    console.error("Error in test article creation:", error);
    return { success: false, error: error.message };
  }
}

testArticleCreation().then(result => {
  console.log("\nTest result:", result.success ? "SUCCESS" : "FAILURE");
  if (!result.success) {
    console.error("Error:", result.error);
    process.exit(1);
  }
  process.exit(0);
});
