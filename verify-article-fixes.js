// Script to verify the article creation and listing fixes
// Run this with: node verify-article-fixes.js

// Using the v2 syntax for node-fetch to ensure compatibility
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configure the API URL based on the standard port used in start-dev-server.ps1
const PRIMARY_API_URL = 'http://localhost:3002/api/articles';
// Fallback to default Next.js port if the custom port doesn't work
const FALLBACK_API_URL = 'http://localhost:3000/api/articles';

async function verifyArticleFixes() {
  let activeUrl = PRIMARY_API_URL;
  
  try {
    console.log('🔍 Verification Test: Article Creation and Listing');
    console.log('=================================================');
    console.log(`Using API URL: ${activeUrl}\n`);
    
    // Test API connection first
    try {
      const testConnection = await fetch(activeUrl, { 
        method: 'HEAD',
        timeout: 5000 
      });
      console.log(`✅ API connection successful on port 3002 (status: ${testConnection.status})`);
    } catch (connectionError) {
      console.log(`❌ Could not connect to API on port 3002: ${connectionError.message}`);
      console.log('Trying fallback port 3000...');
      
      try {
        const fallbackTest = await fetch(FALLBACK_API_URL, { 
          method: 'HEAD',
          timeout: 5000 
        });
        console.log(`✅ API connection successful on fallback port 3000 (status: ${fallbackTest.status})`);
        activeUrl = FALLBACK_API_URL;
      } catch (fallbackError) {
        throw new Error(`Cannot connect to API on either port.\nError: ${fallbackError.message}\n\nMake sure the server is running with 'npm run dev' or 'start-dev-server.ps1'`);
      }
    }
      // 1. First check: Get all articles (including unpublished)
    console.log('\n1. Fetching all articles (published and unpublished)');
    console.log('--------------------------------------------------');
    const allResponse = await fetch(`${activeUrl}?showAll=true`);
    
    if (!allResponse.ok) {
      throw new Error(`API Error: ${allResponse.status} ${allResponse.statusText}`);
    }
    
    const allData = await allResponse.json();
    console.log(`✅ Success: Found ${allData.articles.length} total articles`);
    
    // 2. Second check: Get only published articles
    console.log('\n2. Fetching only published articles');
    console.log('----------------------------------');
    const publishedResponse = await fetch(activeUrl);
    
    if (!publishedResponse.ok) {
      throw new Error(`API Error: ${publishedResponse.status} ${publishedResponse.statusText}`);
    }
    
    const publishedData = await publishedResponse.json();
    console.log(`✅ Success: Found ${publishedData.articles.length} published articles`);
    
    if (publishedData.articles.length <= allData.articles.length) {
      console.log('✅ Filter working correctly: Published count <= total count');
    } else {
      console.log('❌ Error: Published count > total count (something is wrong with filtering)');
    }    // 3. Create an unpublished article
    console.log('\n3. Creating an unpublished article');
    console.log('----------------------------------');
    const unpublishedTimestamp = Date.now();
    const unpublishedArticle = {
      title: `Unpublished Test Article ${unpublishedTimestamp}`,
      slug: `unpublished-test-article-${unpublishedTimestamp}`,
      content: 'This is an unpublished test article to verify the isPublished filter.',
      excerpt: 'Unpublished test excerpt',
      category: 'Test',
      tags: ['test', 'unpublished', 'filter'],
      isPublished: false
    };
    
    let createdUnpublishedArticle;
    try {
      const unpublishedResponse = await fetch(activeUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // For testing in a dev environment, we can use these credentials
          // In a real environment, you would need proper authentication
          'X-Test-Auth': 'true',
          'X-User-Role': 'admin'
        },
        body: JSON.stringify(unpublishedArticle)
      });
      
      if (!unpublishedResponse.ok) {
        const errorText = await unpublishedResponse.text();
        throw new Error(`Failed to create unpublished article: ${unpublishedResponse.status}\n${errorText}`);
      }
      
      const createdUnpublishedArticle = await unpublishedResponse.json();
      console.log('✅ Success: Unpublished article created');
      console.log(`  ID: ${createdUnpublishedArticle._id || createdUnpublishedArticle.id}`);
      console.log(`  Title: ${createdUnpublishedArticle.title}`);
      console.log(`  isPublished: ${createdUnpublishedArticle.isPublished}`);
    } catch (articleError) {
      console.log(`❌ Error creating unpublished article: ${articleError.message}`);
      console.log('This may be due to authentication issues. Continuing with the rest of the test...');
    }    // 4. Create a published article
    console.log('\n4. Creating a published article');
    console.log('------------------------------');
    const publishedTimestamp = Date.now() + 1;
    const publishedArticle = {
      title: `Published Test Article ${publishedTimestamp}`,
      slug: `published-test-article-${publishedTimestamp}`,
      content: 'This is a published test article to verify the isPublished filter.',
      excerpt: 'Published test excerpt',
      category: 'Test',
      tags: ['test', 'published', 'filter'],
      isPublished: true
    };
    
    let createdPublishedArticle;
    try {
      const publishArticleResponse = await fetch(activeUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // For testing in a dev environment, we can use these credentials
          'X-Test-Auth': 'true',
          'X-User-Role': 'admin'
        },
        body: JSON.stringify(publishedArticle)
      });
      
      if (!publishArticleResponse.ok) {
        const errorText = await publishArticleResponse.text();
        throw new Error(`Failed to create published article: ${publishArticleResponse.status}\n${errorText}`);
      }
      
      createdPublishedArticle = await publishArticleResponse.json();
      console.log('✅ Success: Published article created');
      console.log(`  ID: ${createdPublishedArticle._id || createdPublishedArticle.id}`);
      console.log(`  Title: ${createdPublishedArticle.title}`);
      console.log(`  isPublished: ${createdPublishedArticle.isPublished}`);
    } catch (articleError) {
      console.log(`❌ Error creating published article: ${articleError.message}`);
      console.log('This may be due to authentication issues. Continuing with the rest of the test...');
    }    // 5. Verify filter functionality by checking for new published article is returned but unpublished is not
    console.log('\n5. Verifying isPublished filter works correctly');
    console.log('--------------------------------------------');
    const verifyPublishedResponse = await fetch(activeUrl);
    const verifyPublishedData = await verifyPublishedResponse.json();
    
    // Check for published article
    let foundPublishedArticle = false;
    if (createdPublishedArticle && publishedArticle) {
      foundPublishedArticle = verifyPublishedData.articles.find(a => a.slug === publishedArticle.slug);
      
      if (foundPublishedArticle) {
        console.log('✅ Success: Published article was found in filtered results');
      } else {
        console.log('❌ Error: Published article was NOT found in filtered results');
      }
    } else {
      console.log('⚠️ Warning: Skipping published article check (article was not created)');
    }
    
    // Check for unpublished article (should not be found)
    let foundUnpublishedArticle = false;
    if (createdUnpublishedArticle && unpublishedArticle) {
      foundUnpublishedArticle = verifyPublishedData.articles.find(a => a.slug === unpublishedArticle.slug);
      
      if (!foundUnpublishedArticle) {
        console.log('✅ Success: Unpublished article was correctly excluded from filtered results');
      } else {
        console.log('❌ Error: Unpublished article was incorrectly included in filtered results');
      }
    } else {
      console.log('⚠️ Warning: Skipping unpublished article check (article was not created)');
    }    // 6. Verify showAll parameter works by checking that both articles appear
    console.log('\n6. Verifying showAll parameter works correctly');
    console.log('------------------------------------------');
    const verifyAllResponse = await fetch(`${activeUrl}?showAll=true`);
    const verifyAllData = await verifyAllResponse.json();
    
    // Check for published article in showAll results
    let foundPublishedInAll = false;
    if (createdPublishedArticle && publishedArticle) {
      foundPublishedInAll = verifyAllData.articles.find(a => a.slug === publishedArticle.slug);
      
      if (foundPublishedInAll) {
        console.log('✅ Success: Published article was found in showAll results');
      } else {
        console.log('❌ Error: Published article was NOT found in showAll results');
      }
    } else {
      console.log('⚠️ Warning: Skipping published article check in showAll (article was not created)');
    }
    
    // Check for unpublished article in showAll results
    let foundUnpublishedInAll = false;
    if (createdUnpublishedArticle && unpublishedArticle) {
      foundUnpublishedInAll = verifyAllData.articles.find(a => a.slug === unpublishedArticle.slug);
      
      if (foundUnpublishedInAll) {
        console.log('✅ Success: Unpublished article was found in showAll results');
      } else {
        console.log('❌ Error: Unpublished article was NOT found in showAll results');
      }
    } else {
      console.log('⚠️ Warning: Skipping unpublished article check in showAll (article was not created)');
    }
      // 7. Final summary
    console.log('\n🔎 VERIFICATION SUMMARY');
    console.log('====================');
    
    // Only check article creation if we successfully created both articles
    if (createdPublishedArticle && createdUnpublishedArticle) {
      console.log('1. Article creation: WORKING ✅');
    } else {
      console.log('1. Article creation: INCOMPLETE ❓ (Authentication may be required)');
    }
    
    console.log('2. Published filter: ' + (foundPublishedArticle && !foundUnpublishedArticle ? 'WORKING ✅' : 'FAILED ❌'));
    console.log('3. ShowAll parameter: ' + (foundPublishedInAll && foundUnpublishedInAll ? 'WORKING ✅' : 'FAILED ❌'));
    
    console.log('\n📝 RECOMMENDATION');
    if ((createdPublishedArticle || createdUnpublishedArticle) && 
        (foundPublishedArticle && !foundUnpublishedArticle) && 
        (foundPublishedInAll && foundUnpublishedInAll)) {
      console.log('Tests passed. The fixes appear to be working correctly!');
    } else if (!createdPublishedArticle && !createdUnpublishedArticle) {
      console.log('Article creation tests failed. This may be due to authentication requirements.');
      console.log('However, the filtering tests might still be working correctly.');
    } else {
      console.log('Some tests failed. Further debugging is required.');
    }
    
  } catch (error) {
    console.error('VERIFICATION ERROR:', error);
  }
}

// Run the verification
verifyArticleFixes();
