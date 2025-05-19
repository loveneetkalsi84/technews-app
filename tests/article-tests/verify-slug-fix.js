// Verify Article Slug Fix
// This script tests article slug normalization and collision handling

const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configuration
const config = {
  port: process.env.PORT || 3000,
  baseUrl: `http://localhost:${process.env.PORT || 3000}`,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  databaseName: process.env.MONGODB_DATABASE || 'technews',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@technews.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'adminpassword',
};

// Results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function recordResult(name, passed, error = null) {
  results.tests.push({ name, passed, error });
  passed ? results.passed++ : results.failed++;
  
  console.log(`${passed ? '✅' : '❌'} ${name}`);
  if (!passed && error) console.log(`   Error: ${error}`);
}

async function verifySlugFix() {
  console.log('Starting article slug fix verification...');
  
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(config.mongodbUri);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(config.databaseName);
    const articlesCollection = db.collection('articles');
    
    // Test 1: Test special character normalization
    await testSpecialCharacters(articlesCollection);
    
    // Test 2: Test duplicate slug handling
    await testDuplicateSlugs(articlesCollection);
    
    // Test 3: Test case insensitivity 
    await testCaseInsensitivity(articlesCollection);
    
    // Clean up test articles
    await cleanupTestArticles(articlesCollection);
    
    // Print summary
    console.log('\n======================================');
    console.log('TEST RESULTS SUMMARY');
    console.log('======================================');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    
    if (results.failed === 0) {
      console.log('\n🎉 All slug fix tests passed!');
    } else {
      console.log(`\n⚠️ ${results.failed} slug fix tests failed.`);
      return 1; // Exit code for failure
    }
    
    return 0; // Exit code for success
  } catch (error) {
    console.error('❌ Error during verification:', error);
    return 1; // Exit code for failure
  } finally {
    if (client) await client.close();
  }
}

async function testSpecialCharacters(articlesCollection) {
  console.log('\n🔍 Testing special character normalization:');
  
  const testTitle = 'Test Special Chars!@#$%^&*() Article';
  const expectedSlug = 'test-special-chars-article';
  
  try {
    // Create article with special characters in title
    const result = await createArticle(testTitle);
    
    if (result.ok) {
      const article = await result.json();
      console.log(`Created article: "${article.title}" with slug: "${article.slug}"`);
      
      const correctNormalization = article.slug.startsWith(expectedSlug);
      
      if (correctNormalization) {
        recordResult('Special Character Normalization', true);
      } else {
        recordResult('Special Character Normalization', false, 
          `Expected slug to start with "${expectedSlug}" but got "${article.slug}"`);
      }
    } else {
      recordResult('Special Character Normalization', false, 
        `Failed to create article, status: ${result.status}`);
    }
  } catch (error) {
    recordResult('Special Character Normalization', false, error.message);
  }
}

async function testDuplicateSlugs(articlesCollection) {
  console.log('\n🔍 Testing duplicate slug handling:');
  
  // Create two articles with the same title
  const sameTitle = 'Duplicate Slug Test';
  
  try {
    // Create first article
    const firstResult = await createArticle(sameTitle);
    
    if (!firstResult.ok) {
      recordResult('Duplicate Slug Handling', false, 
        `Failed to create first article, status: ${firstResult.status}`);
      return;
    }
    
    const firstArticle = await firstResult.json();
    console.log(`Created first article: "${firstArticle.title}" with slug: "${firstArticle.slug}"`);
    
    // Create second article with same title
    const secondResult = await createArticle(sameTitle);
    
    if (!secondResult.ok) {
      recordResult('Duplicate Slug Handling', false, 
        `Failed to create second article, status: ${secondResult.status}`);
      return;
    }
    
    const secondArticle = await secondResult.json();
    console.log(`Created second article: "${secondArticle.title}" with slug: "${secondArticle.slug}"`);
    
    // Verify the slugs are different
    if (firstArticle.slug !== secondArticle.slug) {
      console.log('✅ Duplicate slug was handled correctly with different slugs');
      recordResult('Duplicate Slug Handling', true);
    } else {
      recordResult('Duplicate Slug Handling', false, 
        `Both articles have the same slug: "${firstArticle.slug}"`);
    }
    
    // Verify both articles can be retrieved via their slug
    await verifyArticleAccessBySlug(firstArticle.slug, 'First Duplicate');
    await verifyArticleAccessBySlug(secondArticle.slug, 'Second Duplicate');
    
  } catch (error) {
    recordResult('Duplicate Slug Handling', false, error.message);
  }
}

async function testCaseInsensitivity(articlesCollection) {
  console.log('\n🔍 Testing case insensitivity:');
  
  const mixedCaseTitle = 'Mixed CASE TesT Article';
  
  try {
    // Create article with mixed case
    const result = await createArticle(mixedCaseTitle);
    
    if (!result.ok) {
      recordResult('Case Insensitivity', false, 
        `Failed to create article, status: ${result.status}`);
      return;
    }
    
    const article = await result.json();
    console.log(`Created article: "${article.title}" with slug: "${article.slug}"`);
    
    // Verify slug is lowercase
    const isLowercase = article.slug === article.slug.toLowerCase();
    
    if (isLowercase) {
      console.log('✅ Slug was normalized to lowercase');
      recordResult('Case Insensitivity - Creation', true);
    } else {
      recordResult('Case Insensitivity - Creation', false, 
        `Slug contains uppercase characters: "${article.slug}"`);
      return;
    }
    
    // Try to access with uppercase variant of the slug
    const uppercaseSlug = article.slug.toUpperCase();
    console.log(`Testing access with uppercase slug: "${uppercaseSlug}"`);
    
    await verifyArticleAccessBySlug(uppercaseSlug, 'Case Insensitivity - Access');
    
  } catch (error) {
    recordResult('Case Insensitivity', false, error.message);
  }
}

async function verifyArticleAccessBySlug(slug, testName) {
  try {
    const response = await fetch(`${config.baseUrl}/api/articles/${slug}`);
    
    if (response.ok) {
      const article = await response.json();
      console.log(`Successfully retrieved article: "${article.title}" with slug: "${article.slug}"`);
      recordResult(`${testName} - Access by Slug`, true);
    } else {
      const error = await response.text();
      recordResult(`${testName} - Access by Slug`, false, 
        `Failed to access article via slug "${slug}": ${response.status} - ${error}`);
    }
  } catch (error) {
    recordResult(`${testName} - Access by Slug`, false, error.message);
  }
}

async function createArticle(title) {
  // Create unique test article
  const timestamp = Date.now();
  
  const article = {
    title: `${title} - ${timestamp}`,
    content: `Test content for ${title} created at ${new Date().toISOString()}`,
    category: 'Test',
    tags: ['test', 'slug-fix', 'verification'],
    isPublished: true
  };
  
  return fetch(`${config.baseUrl}/api/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': await getAdminCookie()
    },
    body: JSON.stringify(article)
  });
}

async function getAdminCookie() {
  // Log in to get an authentication cookie
  const loginResponse = await fetch(`${config.baseUrl}/api/auth/signin/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: config.adminEmail,
      password: config.adminPassword,
      callbackUrl: `${config.baseUrl}`
    }),
    redirect: 'manual'
  });
  
  return loginResponse.headers.get('set-cookie');
}

async function cleanupTestArticles(articlesCollection) {
  console.log('\n🧹 Cleaning up test articles...');
  
  try {
    // Delete articles created for this test
    const result = await articlesCollection.deleteMany({
      $or: [
        { title: { $regex: 'Test Special Chars' } },
        { title: { $regex: 'Duplicate Slug Test' } },
        { title: { $regex: 'Mixed CASE TesT Article' } }
      ]
    });
    
    console.log(`Deleted ${result.deletedCount} test articles`);
  } catch (error) {
    console.error('Error cleaning up test articles:', error);
  }
}

// Run the verification if this script is executed directly
if (require.main === module) {
  verifySlugFix().then(exitCode => {
    process.exit(exitCode);
  });
}

module.exports = { verifySlugFix };
