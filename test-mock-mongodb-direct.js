// Test the mock-mongodb.ts file directly

const http = require('http');

// Simple function to make API requests
async function makeRequest(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {}
    };
    
    if (body) {
      options.headers['Content-Type'] = 'application/json';
    }
    
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP Error: ${res.statusCode} - ${data}`));
        } else {
          try {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: JSON.parse(data)
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data
            });
          }
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function testMockMongoDB() {
  try {
    console.log("Testing Mock MongoDB Boolean Handling...");
    
    // 1. Test listing only published articles
    console.log("\n1. Testing Published Articles Filter");
    const publishedResult = await makeRequest('http://localhost:3000/api/articles');
    console.log(`Found ${publishedResult.data.articles.length} published articles`);
    
    // 2. Test listing all articles
    console.log("\n2. Testing ShowAll Parameter");
    const allResult = await makeRequest('http://localhost:3000/api/articles?showAll=true');
    console.log(`Found ${allResult.data.articles.length} total articles`);
    
    // 3. Create a test unpublished article
    console.log("\n3. Creating Unpublished Article");
    const unpublishedArticle = {
      title: "Test Unpublished Article",
      content: "This is a test article with isPublished = false",
      isPublished: false
    };
    
    const createUnpublishedResult = await makeRequest(
      'http://localhost:3000/api/articles', 
      'POST', 
      unpublishedArticle
    );
    
    console.log("Unpublished article created with ID:", 
                createUnpublishedResult.data.id || createUnpublishedResult.data._id);
    console.log("isPublished value:", createUnpublishedResult.data.isPublished);
    
    // 4. Create a test published article
    console.log("\n4. Creating Published Article");
    const publishedArticle = {
      title: "Test Published Article",
      content: "This is a test article with isPublished = true",
      isPublished: true
    };
    
    const createPublishedResult = await makeRequest(
      'http://localhost:3000/api/articles', 
      'POST', 
      publishedArticle
    );
    
    console.log("Published article created with ID:", 
                createPublishedResult.data.id || createPublishedResult.data._id);
    console.log("isPublished value:", createPublishedResult.data.isPublished);
    
    // 5. Verify the filters again
    console.log("\n5. Re-testing Filters After Creation");
    const newPublishedResult = await makeRequest('http://localhost:3000/api/articles');
    const newAllResult = await makeRequest('http://localhost:3000/api/articles?showAll=true');
    
    console.log(`Published articles (should include new published): ${newPublishedResult.data.articles.length}`);
    console.log(`All articles (should include both new articles): ${newAllResult.data.articles.length}`);
    
    // 6. Check for the specific articles
    console.log("\n6. Checking for Specific Articles");
    
    // Find by slug in published results
    const publishedSlug = createPublishedResult.data.slug;
    const unpublishedSlug = createUnpublishedResult.data.slug;
    
    const foundPublishedInFiltered = newPublishedResult.data.articles.some(
      a => a.slug === publishedSlug
    );
    const foundUnpublishedInFiltered = newPublishedResult.data.articles.some(
      a => a.slug === unpublishedSlug
    );
    
    console.log(`Published article found in published results: ${foundPublishedInFiltered}`);
    console.log(`Unpublished article found in published results: ${foundUnpublishedInFiltered}`);
    
    const foundPublishedInAll = newAllResult.data.articles.some(
      a => a.slug === publishedSlug
    );
    const foundUnpublishedInAll = newAllResult.data.articles.some(
      a => a.slug === unpublishedSlug
    );
    
    console.log(`Published article found in all results: ${foundPublishedInAll}`);
    console.log(`Unpublished article found in all results: ${foundUnpublishedInAll}`);
    
    // 7. Summary
    console.log("\n== TEST SUMMARY ==");
    console.log("Published filter working:", 
      (foundPublishedInFiltered && !foundUnpublishedInFiltered) ? "YES ✅" : "NO ❌");
    console.log("ShowAll parameter working:", 
      (foundPublishedInAll && foundUnpublishedInAll) ? "YES ✅" : "NO ❌");
    
  } catch (error) {
    console.error("Test Error:", error.message);
  }
}

testMockMongoDB();
