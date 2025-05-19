// Test article creation and verification
const fetch = require('node-fetch');

async function createArticleAndVerify() {
  try {
    console.log("Creating a verification test article...");
    
    // Create a unique article for testing
    const testArticle = {
      title: `Verification Test Article ${Date.now()}`,
      slug: `verification-test-article-${Date.now()}`,
      content: "This is a verification test article to confirm that articles are being displayed correctly in the admin interface.",
      excerpt: "Test excerpt for verification",
      isPublished: true, // Try with a published article to test both scenarios
      publishedAt: new Date().toISOString(),
      category: "News",
      sourceType: "manual"
    };
    
    // Create the article via the API
    const createResponse = await fetch('http://localhost:3002/api/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testArticle)
    });
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Failed to create article: ${createResponse.status} ${errorText}`);
    }
    
    const createResult = await createResponse.json();
    console.log("Article created successfully:", createResult._id);
    
    // Wait for the article to be saved
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check all articles including draft
    console.log("Fetching all articles with showAll=true...");
    const allResponse = await fetch('http://localhost:3002/api/articles?showAll=true');
    const allData = await allResponse.json();
    
    const allArticlesCount = allData.articles.length;
    console.log(`Found ${allArticlesCount} total articles (published and draft)`);
    
    // Check if our article is in the results
    const foundInAll = allData.articles.some(article => article.title === testArticle.title);
    
    if (foundInAll) {
      console.log("✅ Article found in all articles list with showAll=true");
    } else {
      console.log("❌ ERROR: Article NOT found in all articles list with showAll=true");
    }
    
    // Check only published articles
    console.log("\nFetching only published articles...");
    const publishedResponse = await fetch('http://localhost:3002/api/articles');
    const publishedData = await publishedResponse.json();
    
    const publishedCount = publishedData.articles.length;
    console.log(`Found ${publishedCount} published articles`);
    
    // Check if our article is in the published results if it's marked as published
    const foundInPublished = publishedData.articles.some(article => article.title === testArticle.title);
    
    if (testArticle.isPublished) {
      if (foundInPublished) {
        console.log("✅ Published article found in published articles list");
      } else {
        console.log("❌ ERROR: Published article NOT found in published articles list");
      }
    } else {
      if (!foundInPublished) {
        console.log("✅ Draft article correctly NOT found in published articles list");
      } else {
        console.log("❌ ERROR: Draft article incorrectly found in published articles list");
      }
    }
    
    return {
      success: foundInAll && (testArticle.isPublished ? foundInPublished : !foundInPublished),
      articleId: createResult._id,
      allArticlesCount,
      publishedCount
    };
  } catch (error) {
    console.error("Error in verification test:", error);
    return { success: false, error: error.message };
  }
}

createArticleAndVerify().then(result => {
  console.log("\nTest result:", result.success ? "SUCCESS" : "FAILURE");
  if (!result.success) {
    console.error("Error:", result.error);
    process.exit(1);
  }
  process.exit(0);
});
