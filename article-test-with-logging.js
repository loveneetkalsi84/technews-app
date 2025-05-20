/**
 * Article Creation and Listing Test
 * 
 * This script tests the article creation and listing functionality
 * in the TechNews application using the mock database.
 */

// Output file for logging
const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, 'article-test-results.log');

// Log function that writes to both console and file
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(logFile, logMessage + '\n');
}

// Clear previous log file
fs.writeFileSync(logFile, `ARTICLE CREATION AND LISTING TEST\n${new Date().toISOString()}\n\n`);

// API endpoint
const API_URL = 'http://localhost:3002/api/articles';

async function testArticleAPI() {
  try {
    log('===== TESTING ARTICLE API WITH MOCK DATABASE =====');

    // 1. Get all articles (including drafts)
    log('\n1. Getting all articles (including drafts)...');
    let allResponse;
    try {
      allResponse = await fetch(`${API_URL}?showAll=true`);
      log(`Response status: ${allResponse.status} ${allResponse.statusText}`);
    } catch (fetchError) {
      log(`Fetch error: ${fetchError.message}`);
      throw fetchError;
    }
    
    if (!allResponse.ok) {
      throw new Error(`Failed to fetch articles: ${allResponse.status} ${allResponse.statusText}`);
    }
    
    const allData = await allResponse.json();
    log(`Found ${allData.articles.length} total articles`);
    
    if (allData.articles.length > 0) {
      log('Sample articles:');
      allData.articles.slice(0, 3).forEach((article, i) => {
        log(`  ${i+1}. ${article.title} (Published: ${article.isPublished ? 'Yes' : 'No'})`);
      });
    }
    
    // 2. Create a new test article
    log('\n2. Creating a new test article...');
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
    
    log(`Sending article creation request with data: ${JSON.stringify(testArticle, null, 2)}`);
    let createResponse;
    try {
      createResponse = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testArticle)
      });
      log(`Creation response status: ${createResponse.status} ${createResponse.statusText}`);
    } catch (createError) {
      log(`Creation fetch error: ${createError.message}`);
      throw createError;
    }
    
    // Handle response
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      log(`Error response body: ${errorText}`);
      throw new Error(`Failed to create article: ${createResponse.status}\n${errorText}`);
    }
    
    const createdArticle = await createResponse.json();
    log('Article created successfully:');
    log(`  ID: ${createdArticle._id || createdArticle.id}`);
    log(`  Title: ${createdArticle.title}`);
    log(`  Slug: ${createdArticle.slug}`);
    log(`  Published: ${createdArticle.isPublished ? 'Yes' : 'No'}`);
    
    // 3. Get updated article list
    log('\n3. Getting updated article list...');
    const updatedResponse = await fetch(`${API_URL}?showAll=true`);
    const updatedData = await updatedResponse.json();
    
    log(`Article count before: ${allData.articles.length}`);
    log(`Article count after: ${updatedData.articles.length}`);
    
    // 4. Verify the article count increased
    if (updatedData.articles.length > allData.articles.length) {
      log('✅ SUCCESS: Article count increased');
    } else {
      log('❌ ERROR: Article count did not increase');
    }
    
    // 5. Find the new article in the list
    const foundArticle = updatedData.articles.find(a => a.slug === testArticle.slug);
    
    if (foundArticle) {
      log('✅ SUCCESS: New article found in the list');
    } else {
      log('❌ ERROR: New article not found in the list');
      log('Latest articles:');
      updatedData.articles.slice(0, 5).forEach((a, i) => {
        log(`  ${i+1}. ${a.title}`);
      });
    }
    
    // 6. Verify filtering works with isPublished=true
    log('\n6. Testing published articles filter...');
    const publishedResponse = await fetch(API_URL);
    const publishedData = await publishedResponse.json();
    
    log(`Published articles count: ${publishedData.articles.length}`);
    
    // Check if our new article is in the published list
    const foundInPublished = publishedData.articles.find(a => a.slug === testArticle.slug);
    
    if (foundInPublished) {
      log('✅ SUCCESS: New article found in published articles');
    } else {
      log('❌ ERROR: New article not found in published articles');
    }
    
    // 7. Summary
    log('\n===== TEST SUMMARY =====');
    log(`Initial article count: ${allData.articles.length}`);
    log(`Final article count: ${updatedData.articles.length}`);
    log(`Article creation successful: ${createResponse.ok}`);
    log(`Article found in listing: ${foundArticle ? 'Yes' : 'No'}`);
    log(`Article found in published listing: ${foundInPublished ? 'Yes' : 'No'}`);
    
    if (updatedData.articles.length > allData.articles.length && foundArticle && foundInPublished) {
      log('\n✅ OVERALL TEST RESULT: SUCCESS - Article creation and listing working correctly!');
    } else {
      log('\n❌ OVERALL TEST RESULT: FAILURE - Issues remain with article creation or listing');
    }
    
    log(`\nTest log written to: ${logFile}`);
    
  } catch (error) {
    log(`TEST ERROR: ${error.message}`);
    log(`Stack trace: ${error.stack}`);
  }
}

// Run the test
testArticleAPI();
