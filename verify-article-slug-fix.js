// Verification script for article slug fix
// This script tests if articles can be correctly retrieved by their slug

const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const chalk = require('chalk') || { green: (t) => t, red: (t) => t, yellow: (t) => t, blue: (t) => t };

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DATABASE || 'technews';
const PORT = process.env.PORT || 3000;

async function checkArticleBySlug() {
  console.log(chalk.blue('🔍 Starting article slug verification test...'));
  console.log(chalk.blue('This test verifies that articles can be correctly retrieved by their slug'));
  
  // Connect to MongoDB to get some real article slugs
  let client;
  let testArticles = [];
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log(chalk.green('✅ Connected to MongoDB'));
    
    const db = client.db(DB_NAME);
    const articleCollection = db.collection('articles');
    
    // Get 3 published articles
    testArticles = await articleCollection.find({ isPublished: true })
      .limit(3)
      .project({ title: 1, slug: 1, _id: 1 })
      .toArray();
    
    if (testArticles.length === 0) {
      console.log(chalk.yellow('⚠️ No published articles found. Creating a test article...'));
      
      // Create a test article if none exist
      const testArticle = {
        title: 'Test Article for Slug Verification',
        slug: 'test-article-slug-verification',
        content: 'This is a test article created for slug verification.',
        excerpt: 'Test article excerpt',
        isPublished: true,
        author: new ObjectId(),
        category: new ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await articleCollection.insertOne(testArticle);
      testArticles = [{ 
        _id: result.insertedId, 
        title: testArticle.title, 
        slug: testArticle.slug 
      }];
      console.log(chalk.green(`✅ Created test article with slug: ${testArticle.slug}`));
    } else {
      console.log(chalk.green(`✅ Found ${testArticles.length} articles for testing`));
    }
    
    // Run tests for each article
    for (const article of testArticles) {
      await testArticleAccess(article);
    }
    
    // Test case sensitivity (only if we have articles)
    if (testArticles.length > 0) {
      const article = testArticles[0];
      // Test with uppercase slug
      await testArticleAccess({
        ...article,
        slug: article.slug.toUpperCase(),
        original: article.slug,
        note: 'Testing with uppercase slug'
      });
      
      // Test with mixed case slug
      const mixedCaseSlug = article.slug
        .split('')
        .map((char, idx) => idx % 2 === 0 ? char.toUpperCase() : char.toLowerCase())
        .join('');
      
      await testArticleAccess({
        ...article,
        slug: mixedCaseSlug,
        original: article.slug,
        note: 'Testing with mixed case slug'
      });
    }
    
    console.log(chalk.blue('\n🎯 Summary:'));
    console.log(chalk.green(`✅ Total tests passed: ${results.passed}`));
    console.log(chalk.red(`❌ Total tests failed: ${results.failed}`));
    
    if (results.failed === 0) {
      console.log(chalk.green('\n🎉 All tests passed! The article slug fix is working correctly.'));
    } else {
      console.log(chalk.red('\n⚠️ Some tests failed. The article slug fix may not be working correctly.'));
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error during verification:'), error);
  } finally {
    if (client) {
      await client.close();
      console.log(chalk.blue('🔌 Disconnected from MongoDB'));
    }
  }
}

// Track results
const results = {
  passed: 0,
  failed: 0
};

async function testArticleAccess(article) {
  console.log(chalk.blue(`\n🧪 Testing article: "${article.title}" (slug: ${article.slug})`));
  if (article.note) {
    console.log(chalk.blue(`📝 Note: ${article.note}`));
  }
  
  try {
    // API test - Direct API endpoint
    const apiUrl = `http://localhost:${PORT}/api/articles/${encodeURIComponent(article.slug)}`;
    console.log(chalk.blue(`📡 Testing API endpoint: ${apiUrl}`));
    
    const apiResponse = await fetch(apiUrl);
    const apiData = await apiResponse.json();
    
    if (apiResponse.ok) {
      console.log(chalk.green('✅ API test: Article found via API'));
      console.log(chalk.blue(`📊 Article data from API: ID=${apiData._id}, Title="${apiData.title}", Slug="${apiData.slug}"`));
      
      // Verify the returned article is the correct one
      const expectedSlug = article.original || article.slug;
      if (apiData.slug.toLowerCase() === expectedSlug.toLowerCase()) {
        console.log(chalk.green('✅ Slug verification: Correct article returned'));
        results.passed++;
      } else {
        console.log(chalk.red(`❌ Slug verification failed: Expected "${expectedSlug}", got "${apiData.slug}"`));
        results.failed++;
      }
    } else {
      console.log(chalk.red(`❌ API test failed: ${apiResponse.status} ${apiResponse.statusText}`));
      console.log(chalk.red(`Error: ${JSON.stringify(apiData)}`));
      results.failed++;
    }
    
    // Frontend page test
    const pageUrl = `http://localhost:${PORT}/articles/${encodeURIComponent(article.slug)}`;
    console.log(chalk.blue(`🌐 Testing frontend page: ${pageUrl}`));
    
    const pageResponse = await fetch(pageUrl);
    const pageHtml = await pageResponse.text();
    
    if (pageResponse.ok) {
      // Check if the page contains the article title (simple verification)
      if (pageHtml.includes(article.title)) {
        console.log(chalk.green('✅ Frontend test: Article page loaded successfully'));
        results.passed++;
      } else {
        console.log(chalk.red('❌ Frontend test failed: Article title not found in page content'));
        results.failed++;
      }
    } else {
      console.log(chalk.red(`❌ Frontend test failed: ${pageResponse.status} ${pageResponse.statusText}`));
      results.failed++;
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Test error:'), error);
    results.failed++;
  }
}

// Run the verification
checkArticleBySlug();
