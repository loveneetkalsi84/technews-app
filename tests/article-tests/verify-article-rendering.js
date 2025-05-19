// Article Rendering Verification Test
// This script tests article rendering functionality across the TechNews application
// It verifies articles are correctly displayed from various entry points

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const CONFIG = {
  port: process.env.PORT || 3000,
  baseUrl: `http://localhost:${process.env.PORT || 3000}`,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  databaseName: process.env.MONGODB_DATABASE || 'technews',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@technews.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'adminpassword',
  screenshotDir: path.join(__dirname, '../../test-output/screenshots'),
  logFilePath: path.join(__dirname, '../../test-output/article-rendering-test.log')
};

// Ensure screenshot directory exists
if (!fs.existsSync(CONFIG.screenshotDir)) {
  fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
}

// Initialize log file
const logStream = fs.createWriteStream(CONFIG.logFilePath, { flags: 'w' });
const consoleLog = console.log;
console.log = function(...args) {
  const message = args.join(' ');
  consoleLog(message);
  logStream.write(message + '\n');
};

// Results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function recordTestResult(name, passed, error = null) {
  results.tests.push({ name, passed, error });
  if (passed) {
    results.passed++;
    console.log(`✅ PASSED: ${name}`);
  } else {
    results.failed++;
    console.log(`❌ FAILED: ${name} - ${error}`);
  }
}

async function verifyArticleRendering() {
  console.log(`
╔═══════════════════════════════════════════════╗
║     ARTICLE RENDERING VERIFICATION TEST       ║
║     ${new Date().toISOString()}        ║
╚═══════════════════════════════════════════════╝
`);
  
  let browser;
  let client;
  
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    client = new MongoClient(CONFIG.mongodbUri);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    // Launch browser
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1280, height: 800 }
    });
    
    const page = await browser.newPage();
    page.setDefaultTimeout(15000);
    
    // Listen for console messages from the page
    page.on('console', msg => console.log(`Browser console: ${msg.type()}: ${msg.text()}`));
    
    // Create a test article
    const testArticle = await createTestArticle(client);
    console.log(`Created test article with slug: ${testArticle.slug}`);
    
    // Test cases
    await testHomePageArticleLinks(page, testArticle);
    await testDirectArticleAccess(page, testArticle);
    await testCategoryPageArticleLinks(page, testArticle);
    await testAdminDashboardViewLink(page, testArticle);
    await testArticleSharingLinks(page, testArticle);
    await testSlugCaseInsensitivity(page, testArticle);
    
    // Print results summary
    console.log(`
╔═══════════════════════════════════════════════╗
║              TEST RESULTS SUMMARY             ║
╚═══════════════════════════════════════════════╝
`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log('\nDetailed Results:');
    results.tests.forEach((test, index) => {
      console.log(`${index + 1}. ${test.passed ? '✅' : '❌'} ${test.name}`);
      if (!test.passed) {
        console.log(`   Error: ${test.error}`);
      }
    });

    if (results.failed === 0) {
      console.log('\n🎉 All article rendering tests passed!');
    } else {
      console.log(`\n⚠️ ${results.failed} article rendering tests failed. Review the issues above.`);
    }
  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    if (client) await client.close();
    if (browser) await browser.close();
    logStream.end();
    console.log('\n🔌 Test completed, all connections closed');
    console.log(`Test results log saved to: ${CONFIG.logFilePath}`);
  }
  
  // Return exit code based on results
  return results.failed > 0 ? 1 : 0;
}

async function createTestArticle(client) {
  const db = client.db(CONFIG.databaseName);
  const articlesCollection = db.collection('articles');
  
  // Unique timestamp for test article
  const timestamp = Date.now();
  
  // Create test article
  const testArticle = {
    title: `Article Rendering Test ${timestamp}`,
    slug: `article-rendering-test-${timestamp}`,
    content: `# Article Rendering Test ${timestamp}
    
This is a test article created by the article rendering verification script.
It contains specific content that can be verified during the test.

## Test Information
- Created: ${new Date().toISOString()}
- Test ID: ${timestamp}
- Test Type: Rendering Verification

This article should render correctly from all entry points in the application.`,
    excerpt: `Test article created for rendering verification. Test ID: ${timestamp}`,
    coverImage: 'https://picsum.photos/800/400',
    category: 'Test',
    publishedAt: new Date(),
    author: 'Test Script',
    viewCount: 0,
    isPublished: true,
    tags: ['test', 'rendering', 'verification']
  };
  
  // Insert the article
  const result = await articlesCollection.insertOne(testArticle);
  testArticle._id = result.insertedId;
  
  return testArticle;
}

async function testHomePageArticleLinks(page, testArticle) {
  console.log('\n🔍 Testing article links from homepage:');
  
  try {
    // Navigate to homepage
    await page.goto(`${CONFIG.baseUrl}/`);
    await page.waitForSelector('article a', { timeout: 10000 });
    
    // Take a screenshot
    await page.screenshot({ path: path.join(CONFIG.screenshotDir, 'homepage.png') });
    
    // Check if our test article is visible (it might not be if it's too new)
    const articleLinks = await page.$$eval('article a', (links) => 
      links.map(link => ({ href: link.href, text: link.textContent }))
    );
    
    console.log(`Found ${articleLinks.length} article links on homepage`);
    
    // Click the first article link and verify it loads
    if (articleLinks.length > 0) {
      await page.click('article a');
      await page.waitForSelector('.prose', { timeout: 10000 });
      
      const articleUrl = page.url();
      const articleTitle = await page.$eval('h1', el => el.textContent);
      
      await page.screenshot({ path: path.join(CONFIG.screenshotDir, 'article-from-homepage.png') });
      
      console.log(`Clicked article: "${articleTitle}" at ${articleUrl}`);
      recordTestResult('HomePage Article Links', true);
    } else {
      console.log('No article links found on homepage to test');
      recordTestResult('HomePage Article Links', false, 'No article links found on homepage');
    }
  } catch (error) {
    console.error('Error testing homepage article links:', error);
    await page.screenshot({ path: path.join(CONFIG.screenshotDir, 'homepage-error.png') });
    recordTestResult('HomePage Article Links', false, error.message);
  }
}

async function testDirectArticleAccess(page, testArticle) {
  console.log('\n🔍 Testing direct article access:');
  
  try {
    // Navigate directly to the test article
    const articleUrl = `${CONFIG.baseUrl}/articles/${testArticle.slug}`;
    console.log(`Navigating to: ${articleUrl}`);
    
    await page.goto(articleUrl);
    await page.waitForSelector('.prose', { timeout: 10000 });
    
    // Take a screenshot
    await page.screenshot({ path: path.join(CONFIG.screenshotDir, 'direct-article-access.png') });
    
    // Verify the article title
    const pageTitle = await page.$eval('h1', el => el.textContent);
    if (pageTitle.includes(testArticle.title)) {
      console.log(`Article title verified: "${pageTitle}"`);
      recordTestResult('Direct Article Access', true);
    } else {
      console.log(`Expected title "${testArticle.title}" but found "${pageTitle}"`);
      recordTestResult('Direct Article Access', false, `Title mismatch: expected "${testArticle.title}" but found "${pageTitle}"`);
    }
  } catch (error) {
    console.error('Error testing direct article access:', error);
    await page.screenshot({ path: path.join(CONFIG.screenshotDir, 'direct-article-access-error.png') });
    recordTestResult('Direct Article Access', false, error.message);
  }
}

async function testCategoryPageArticleLinks(page, testArticle) {
  console.log('\n🔍 Testing article links from category page:');
  
  try {
    // Navigate to the test category page
    const categoryUrl = `${CONFIG.baseUrl}/categories/test`;
    console.log(`Navigating to: ${categoryUrl}`);
    
    await page.goto(categoryUrl);
    await page.waitForSelector('article', { timeout: 10000 }).catch(() => {
      console.log('No articles found on category page, might be empty or not exist');
    });
    
    // Take a screenshot
    await page.screenshot({ path: path.join(CONFIG.screenshotDir, 'category-page.png') });
    
    // Check if there are any article links
    const hasArticles = await page.evaluate(() => {
      return document.querySelectorAll('article').length > 0;
    });
    
    if (hasArticles) {
      // Click the first article link
      await page.click('article a');
      await page.waitForSelector('.prose', { timeout: 10000 });
      
      const articleUrl = page.url();
      const articleTitle = await page.$eval('h1', el => el.textContent);
      
      await page.screenshot({ path: path.join(CONFIG.screenshotDir, 'article-from-category.png') });
      
      console.log(`Clicked article: "${articleTitle}" at ${articleUrl}`);
      recordTestResult('Category Page Article Links', true);
    } else {
      console.log('No articles found on category page to test');
      recordTestResult('Category Page Article Links', false, 'No articles found on category page');
    }
  } catch (error) {
    console.error('Error testing category page article links:', error);
    await page.screenshot({ path: path.join(CONFIG.screenshotDir, 'category-page-error.png') });
    recordTestResult('Category Page Article Links', false, error.message);
  }
}

async function testAdminDashboardViewLink(page, testArticle) {
  console.log('\n🔍 Testing view link from admin dashboard:');
  
  try {
    // Log in to admin panel
    console.log('Logging in to admin panel...');
    await page.goto(`${CONFIG.baseUrl}/login`);
    
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await page.type('input[name="email"]', CONFIG.adminEmail);
    await page.type('input[name="password"]', CONFIG.adminPassword);
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation();
    await page.screenshot({ path: path.join(CONFIG.screenshotDir, 'admin-login.png') });
    
    // Navigate to articles page
    console.log('Navigating to admin articles page...');
    await page.goto(`${CONFIG.baseUrl}/admin/articles`);
    await page.waitForSelector('table', { timeout: 10000 });
    await page.screenshot({ path: path.join(CONFIG.screenshotDir, 'admin-articles.png') });
    
    // Find our test article and click view
    const viewLinkSelector = `a[href="/articles/${testArticle.slug}"]`;
    const hasViewLink = await page.evaluate((selector) => {
      return document.querySelector(selector) !== null;
    }, viewLinkSelector);
    
    if (hasViewLink) {
      console.log(`Found view link for test article: ${testArticle.slug}`);
      
      // Click the view link (it might open in a new tab)
      const newPagePromise = new Promise(resolve => 
        page.browser().once('targetcreated', target => resolve(target.page()))
      );
      
      await page.click(viewLinkSelector);
      const newPage = await newPagePromise;
      await newPage.waitForSelector('.prose', { timeout: 10000 });
      
      const articleUrl = newPage.url();
      const articleTitle = await newPage.$eval('h1', el => el.textContent);
      
      await newPage.screenshot({ path: path.join(CONFIG.screenshotDir, 'article-from-admin.png') });
      
      console.log(`Viewed article from admin: "${articleTitle}" at ${articleUrl}`);
      recordTestResult('Admin Dashboard View Link', true);
      
      // Close the new page
      await newPage.close();
    } else {
      console.log(`View link for test article not found: ${testArticle.slug}`);
      recordTestResult('Admin Dashboard View Link', false, 'View link not found');
    }
  } catch (error) {
    console.error('Error testing admin dashboard view link:', error);
    await page.screenshot({ path: path.join(CONFIG.screenshotDir, 'admin-view-link-error.png') });
    recordTestResult('Admin Dashboard View Link', false, error.message);
  }
}

async function testArticleSharingLinks(page, testArticle) {
  console.log('\n🔍 Testing article sharing links:');
  
  try {
    // Navigate directly to the test article
    const articleUrl = `${CONFIG.baseUrl}/articles/${testArticle.slug}`;
    console.log(`Navigating to: ${articleUrl}`);
    
    await page.goto(articleUrl);
    await page.waitForSelector('.prose', { timeout: 10000 });
    
    // Check for sharing links
    const shareLinks = await page.$$eval('.social-share-buttons a', links => 
      links.map(link => ({
        href: link.href,
        ariaLabel: link.getAttribute('aria-label') || ''
      }))
    );
    
    if (shareLinks.length > 0) {
      console.log(`Found ${shareLinks.length} sharing links:`);
      shareLinks.forEach(link => {
        console.log(`- ${link.ariaLabel}: ${link.href}`);
      });
      
      // Verify the links contain the article URL
      const allContainArticleUrl = shareLinks.every(link => 
        link.href.includes(encodeURIComponent(testArticle.slug)) || 
        link.href.includes(encodeURIComponent(articleUrl))
      );
      
      if (allContainArticleUrl) {
        recordTestResult('Article Sharing Links', true);
      } else {
        recordTestResult('Article Sharing Links', false, 'Not all sharing links include article URL');
      }
    } else {
      console.log('No sharing links found on article page');
      recordTestResult('Article Sharing Links', false, 'No sharing links found');
    }
  } catch (error) {
    console.error('Error testing article sharing links:', error);
    await page.screenshot({ path: path.join(CONFIG.screenshotDir, 'sharing-links-error.png') });
    recordTestResult('Article Sharing Links', false, error.message);
  }
}

async function testSlugCaseInsensitivity(page, testArticle) {
  console.log('\n🔍 Testing slug case insensitivity:');
  
  try {
    // Create an uppercase version of the slug
    const uppercaseSlug = testArticle.slug.toUpperCase();
    
    // Navigate using the uppercase slug
    const articleUrl = `${CONFIG.baseUrl}/articles/${uppercaseSlug}`;
    console.log(`Navigating to uppercase slug: ${articleUrl}`);
    
    await page.goto(articleUrl);
    await page.waitForSelector('.prose', { timeout: 10000 });
    
    // Take a screenshot
    await page.screenshot({ path: path.join(CONFIG.screenshotDir, 'uppercase-slug-access.png') });
    
    // Check if we're on the right article
    const pageTitle = await page.$eval('h1', el => el.textContent);
    if (pageTitle.includes(testArticle.title)) {
      console.log(`Successfully accessed article with uppercase slug`);
      console.log(`Article title verified: "${pageTitle}"`);
      recordTestResult('Slug Case Insensitivity', true);
    } else {
      console.log(`Expected title "${testArticle.title}" but found "${pageTitle}"`);
      recordTestResult('Slug Case Insensitivity', false, `Title mismatch with uppercase slug`);
    }
  } catch (error) {
    console.error('Error testing slug case insensitivity:', error);
    await page.screenshot({ path: path.join(CONFIG.screenshotDir, 'uppercase-slug-error.png') });
    recordTestResult('Slug Case Insensitivity', false, error.message);
  }
}

// Run the verification if this script is executed directly
if (require.main === module) {
  verifyArticleRendering().then(exitCode => {
    process.exit(exitCode);
  });
}

module.exports = { verifyArticleRendering };
