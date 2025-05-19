// Comprehensive Link Verification for Articles
// This script validates all article links throughout the application to ensure proper routing

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
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
  screenshotDir: path.join(__dirname, '../../test-output/screenshots'),
  logFilePath: path.join(__dirname, '../../test-output/links-verification-log.txt')
};

// Ensure output directories exist
if (!fs.existsSync(config.screenshotDir)) {
  fs.mkdirSync(config.screenshotDir, { recursive: true });
}

// Set up logging
const logStream = fs.createWriteStream(config.logFilePath, { flags: 'w' });
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

function recordResult(name, passed, error = null) {
  results.tests.push({ name, passed, error });
  passed ? results.passed++ : results.failed++;
  
  console.log(`${passed ? '✅' : '❌'} ${name}`);
  if (!passed && error) console.log(`   Error: ${error}`);
}

async function verifyAllLinks() {
  console.log(`
╔═══════════════════════════════════════════════╗
║     COMPREHENSIVE LINK VERIFICATION           ║
║     ${new Date().toISOString()}              ║
╚═══════════════════════════════════════════════╝
`);
  
  let browser;
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(config.mongodbUri);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(config.databaseName);
    const articlesCollection = db.collection('articles');
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1280, height: 800 }
    });
    
    const page = await browser.newPage();
    page.setDefaultTimeout(15000);
    
    // Listen for console messages from the page
    page.on('console', msg => console.log(`Browser console: ${msg.type()}: ${msg.text()}`));
    
    // Test cases
    await testHomepageLinks(page);
    await testArticlePageLinks(page);
    await testCategoryPageLinks(page);
    await testAdminDashboardLinks(page);
    await testArticleDetailShareLinks(page);
    await testArticleDetailRelatedLinks(page);
    await testSearchResults(page);
    
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
      console.log('\n🎉 All link verification tests passed!');
      return 0; // Exit code for success
    } else {
      console.log(`\n⚠️ ${results.failed} link verification tests failed.`);
      return 1; // Exit code for failure
    }
  } catch (error) {
    console.error('❌ Error during verification:', error);
    return 1; // Exit code for failure
  } finally {
    if (client) await client.close();
    if (browser) await browser.close();
    logStream.end();
    console.log('\n🔌 Test completed, all connections closed');
    console.log(`Test results log saved to: ${config.logFilePath}`);
  }
}

async function testHomepageLinks(page) {
  console.log('\n🔍 Testing homepage article links:');
  
  try {
    // Navigate to homepage
    await page.goto(config.baseUrl);
    await page.screenshot({ path: path.join(config.screenshotDir, 'homepage.png') });
    
    // Find all article links
    const articleLinks = await page.$$eval('a[href^="/articles/"]', links => 
      links.map(link => ({
        href: link.href,
        text: link.textContent || 'No text'
      }))
    );
    
    console.log(`Found ${articleLinks.length} article links on homepage`);
    
    if (articleLinks.length === 0) {
      recordResult('Homepage Article Links', false, 'No article links found on homepage');
      return;
    }
    
    // Test the first 5 links or fewer if there are less than 5
    const linksToTest = articleLinks.slice(0, Math.min(5, articleLinks.length));
    let allLinksWork = true;
    
    for (const link of linksToTest) {
      console.log(`Testing link: ${link.text} (${link.href})`);
      
      // Open in a new page
      const newPage = await browser.newPage();
      await newPage.setDefaultTimeout(10000);
      
      try {
        await newPage.goto(link.href);
        await newPage.waitForSelector('.prose', { timeout: 5000 });
        
        const title = await newPage.$eval('h1', el => el.textContent);
        console.log(`  - Successfully loaded: "${title}"`);
        
        await newPage.screenshot({ 
          path: path.join(config.screenshotDir, `article-from-homepage-${title.substring(0, 20).replace(/[^\w]/g, '_')}.png`) 
        });
      } catch (error) {
        console.log(`  - Failed to load article: ${error.message}`);
        allLinksWork = false;
      } finally {
        await newPage.close();
      }
    }
    
    recordResult('Homepage Article Links', allLinksWork, 
      allLinksWork ? null : 'Some article links on homepage do not work correctly');
    
  } catch (error) {
    recordResult('Homepage Article Links', false, error.message);
    await page.screenshot({ path: path.join(config.screenshotDir, 'homepage-error.png') });
  }
}

async function testArticlePageLinks(page) {
  console.log('\n🔍 Testing article detail page navigation:');
  
  try {
    // Go to homepage then click first article
    await page.goto(config.baseUrl);
    
    // Find first article link
    const articleLink = await page.$('a[href^="/articles/"]');
    if (!articleLink) {
      recordResult('Article Detail Navigation', false, 'No article links found on homepage');
      return;
    }
    
    // Get the URL from the link
    const href = await page.evaluate(link => link.href, articleLink);
    console.log(`Navigating to article: ${href}`);
    
    // Navigate to the article
    await page.goto(href);
    await page.waitForSelector('.prose', { timeout: 5000 });
    await page.screenshot({ path: path.join(config.screenshotDir, 'article-detail.png') });
    
    // Verify article has loaded
    const title = await page.$eval('h1', el => el.textContent);
    console.log(`Article loaded: "${title}"`);
    
    recordResult('Article Detail Navigation', true);
  } catch (error) {
    recordResult('Article Detail Navigation', false, error.message);
    await page.screenshot({ path: path.join(config.screenshotDir, 'article-navigation-error.png') });
  }
}

async function testCategoryPageLinks(page) {
  console.log('\n🔍 Testing category page article links:');
  
  try {
    // Go to a category page - try "tech" or "news" first
    const categories = ['tech', 'news', 'reviews', 'business'];
    let categoryFound = false;
    
    for (const category of categories) {
      try {
        await page.goto(`${config.baseUrl}/categories/${category}`);
        await page.waitForSelector('h1', { timeout: 5000 });
        
        // Check if there are any articles
        const hasArticles = await page.evaluate(() => 
          document.querySelectorAll('a[href^="/articles/"]').length > 0
        );
        
        if (hasArticles) {
          categoryFound = true;
          console.log(`Found category page with articles: ${category}`);
          break;
        } else {
          console.log(`Category page ${category} has no articles`);
        }
      } catch (error) {
        console.log(`Error accessing category ${category}: ${error.message}`);
      }
    }
    
    if (!categoryFound) {
      recordResult('Category Page Links', false, 'No categories with articles found');
      return;
    }
    
    await page.screenshot({ path: path.join(config.screenshotDir, 'category-page.png') });
    
    // Find all article links on this category page
    const articleLinks = await page.$$eval('a[href^="/articles/"]', links => 
      links.map(link => ({
        href: link.href,
        text: link.textContent || 'No text'
      }))
    );
    
    console.log(`Found ${articleLinks.length} article links on category page`);
    
    if (articleLinks.length === 0) {
      recordResult('Category Page Links', false, 'No article links found on category page');
      return;
    }
    
    // Test the first article link
    console.log(`Testing link: ${articleLinks[0].text} (${articleLinks[0].href})`);
    
    await page.goto(articleLinks[0].href);
    await page.waitForSelector('.prose', { timeout: 5000 });
    
    const title = await page.$eval('h1', el => el.textContent);
    console.log(`Successfully loaded article from category page: "${title}"`);
    
    await page.screenshot({ path: path.join(config.screenshotDir, 'article-from-category.png') });
    
    recordResult('Category Page Links', true);
  } catch (error) {
    recordResult('Category Page Links', false, error.message);
    await page.screenshot({ path: path.join(config.screenshotDir, 'category-error.png') });
  }
}

async function testAdminDashboardLinks(page) {
  console.log('\n🔍 Testing admin dashboard article links:');
  
  try {
    // Log in to admin panel
    await login(page);
    
    // Navigate to articles management
    await page.goto(`${config.baseUrl}/admin/articles`);
    await page.waitForSelector('table', { timeout: 5000 });
    await page.screenshot({ path: path.join(config.screenshotDir, 'admin-articles.png') });
    
    // Find all view links (they should be a tags pointing to /articles/...)
    const viewLinks = await page.$$eval('a[href^="/articles/"]', links => 
      links.map(link => ({
        href: link.href,
        text: link.textContent || 'No text'
      }))
    );
    
    console.log(`Found ${viewLinks.length} article view links in admin dashboard`);
    
    if (viewLinks.length === 0) {
      recordResult('Admin Dashboard View Links', false, 'No article view links found in admin dashboard');
      return;
    }
    
    // Test the first view link
    console.log(`Testing admin view link: ${viewLinks[0].href}`);
    
    // Open in a new tab
    const newPagePromise = new Promise(resolve =>
      browser.once('targetcreated', target => resolve(target.page()))
    );
    
    // Find and click the link
    const linkSelector = `a[href="${new URL(viewLinks[0].href).pathname}"]`;
    await page.click(linkSelector);
    
    const newPage = await newPagePromise;
    await newPage.waitForSelector('.prose', { timeout: 5000 });
    
    const title = await newPage.$eval('h1', el => el.textContent);
    console.log(`Successfully loaded article from admin view link: "${title}"`);
    
    await newPage.screenshot({ path: path.join(config.screenshotDir, 'article-from-admin.png') });
    await newPage.close();
    
    recordResult('Admin Dashboard View Links', true);
  } catch (error) {
    recordResult('Admin Dashboard View Links', false, error.message);
    await page.screenshot({ path: path.join(config.screenshotDir, 'admin-links-error.png') });
  }
}

async function testArticleDetailShareLinks(page) {
  console.log('\n🔍 Testing article detail page share links:');
  
  try {
    // Go to homepage then click first article
    await page.goto(config.baseUrl);
    
    // Find first article link
    const articleLink = await page.$('a[href^="/articles/"]');
    if (!articleLink) {
      recordResult('Article Share Links', false, 'No article links found on homepage');
      return;
    }
    
    // Navigate to the article
    const href = await page.evaluate(link => link.href, articleLink);
    await page.goto(href);
    await page.waitForSelector('.prose', { timeout: 5000 });
    
    // Find share links
    const shareLinks = await page.$$eval('.social-share-buttons a, a[aria-label*="Share"]', links => 
      links.map(link => ({
        href: link.href,
        label: link.getAttribute('aria-label') || link.textContent || 'No label'
      }))
    );
    
    console.log(`Found ${shareLinks.length} share links on article page`);
    
    if (shareLinks.length === 0) {
      recordResult('Article Share Links', false, 'No share links found on article page');
      return;
    }
    
    // Verify share links contain the current URL
    const currentUrl = page.url();
    const validShareLinks = shareLinks.filter(link => 
      link.href.includes('url=') || 
      link.href.includes(encodeURIComponent(currentUrl)) ||
      link.href.includes('sharer')
    );
    
    console.log(`Found ${validShareLinks.length} valid share links`);
    
    if (validShareLinks.length > 0) {
      recordResult('Article Share Links', true);
    } else {
      recordResult('Article Share Links', false, 'No valid share links found');
    }
    
    await page.screenshot({ path: path.join(config.screenshotDir, 'article-share-links.png') });
  } catch (error) {
    recordResult('Article Share Links', false, error.message);
    await page.screenshot({ path: path.join(config.screenshotDir, 'share-links-error.png') });
  }
}

async function testArticleDetailRelatedLinks(page) {
  console.log('\n🔍 Testing article detail page related articles:');
  
  try {
    // Go to homepage then click first article
    await page.goto(config.baseUrl);
    
    // Find first article link
    const articleLink = await page.$('a[href^="/articles/"]');
    if (!articleLink) {
      recordResult('Related Articles Links', false, 'No article links found on homepage');
      return;
    }
    
    // Navigate to the article
    const href = await page.evaluate(link => link.href, articleLink);
    await page.goto(href);
    await page.waitForSelector('.prose', { timeout: 5000 });
    
    // Look for related articles section
    const hasRelatedSection = await page.evaluate(() => {
      const relatedSection = document.querySelector('h2, h3, h4, div');
      return relatedSection && 
        (relatedSection.textContent.includes('Related') || 
         relatedSection.textContent.includes('More Articles') ||
         relatedSection.textContent.includes('You may also like'));
    });
    
    if (!hasRelatedSection) {
      console.log('No related articles section found');
      recordResult('Related Articles Links', false, 'No related articles section found');
      return;
    }
    
    // Find related article links
    const relatedLinks = await page.$$eval('a[href^="/articles/"]', links => {
      // Skip the first link which might be the current article
      const currentPath = window.location.pathname;
      return links
        .filter(link => link.href !== window.location.href && link.href.includes('/articles/'))
        .map(link => ({
          href: link.href,
          text: link.textContent || 'No text'
        }));
    });
    
    console.log(`Found ${relatedLinks.length} related article links`);
    
    if (relatedLinks.length === 0) {
      recordResult('Related Articles Links', false, 'No related article links found');
      return;
    }
    
    // Test the first related link
    console.log(`Testing related link: ${relatedLinks[0].text} (${relatedLinks[0].href})`);
    
    // Open in a new tab
    const newPagePromise = new Promise(resolve =>
      browser.once('targetcreated', target => resolve(target.page()))
    );
    
    // Find and click the link
    const linkUrl = new URL(relatedLinks[0].href);
    const linkSelector = `a[href^="${linkUrl.pathname}"]`;
    await page.click(linkSelector);
    
    const newPage = await newPagePromise;
    await newPage.waitForSelector('.prose', { timeout: 5000 });
    
    const title = await newPage.$eval('h1', el => el.textContent);
    console.log(`Successfully loaded related article: "${title}"`);
    
    await newPage.screenshot({ path: path.join(config.screenshotDir, 'related-article.png') });
    await newPage.close();
    
    recordResult('Related Articles Links', true);
  } catch (error) {
    recordResult('Related Articles Links', false, error.message);
    await page.screenshot({ path: path.join(config.screenshotDir, 'related-links-error.png') });
  }
}

async function testSearchResults(page) {
  console.log('\n🔍 Testing search results article links:');
  
  try {
    // Go to homepage
    await page.goto(config.baseUrl);
    
    // Look for search box
    const hasSearchBox = await page.evaluate(() => {
      return !!document.querySelector('input[type="search"], input[placeholder*="Search"], input[aria-label*="Search"]');
    });
    
    if (!hasSearchBox) {
      console.log('No search box found on homepage');
      recordResult('Search Results Links', false, 'No search box found on homepage');
      return;
    }
    
    // Use a common tech term for search
    const searchTerm = 'technology';
    
    // Find the search input and type in it
    await page.type('input[type="search"], input[placeholder*="Search"], input[aria-label*="Search"]', searchTerm);
    await page.keyboard.press('Enter');
    
    // Wait for search results
    await page.waitForNavigation();
    await page.waitForSelector('h1, h2', { timeout: 5000 });
    await page.screenshot({ path: path.join(config.screenshotDir, 'search-results.png') });
    
    // Check for article links in search results
    const articleLinks = await page.$$eval('a[href^="/articles/"]', links => 
      links.map(link => ({
        href: link.href,
        text: link.textContent || 'No text'
      }))
    );
    
    console.log(`Found ${articleLinks.length} article links in search results`);
    
    if (articleLinks.length === 0) {
      console.log('No article links found in search results - this may be normal if no articles match the search term');
      recordResult('Search Results Links', true, 'No matching articles found for search term');
      return;
    }
    
    // Test the first search result link
    console.log(`Testing search result link: ${articleLinks[0].text} (${articleLinks[0].href})`);
    
    await page.goto(articleLinks[0].href);
    await page.waitForSelector('.prose', { timeout: 5000 });
    
    const title = await page.$eval('h1', el => el.textContent);
    console.log(`Successfully loaded article from search results: "${title}"`);
    
    await page.screenshot({ path: path.join(config.screenshotDir, 'article-from-search.png') });
    
    recordResult('Search Results Links', true);
  } catch (error) {
    recordResult('Search Results Links', false, error.message);
    await page.screenshot({ path: path.join(config.screenshotDir, 'search-error.png') });
  }
}

async function login(page) {
  console.log('Logging in to admin panel...');
  
  await page.goto(`${config.baseUrl}/login`);
  
  // Check if already logged in by looking for logout link
  const alreadyLoggedIn = await page.evaluate(() => {
    return !!document.querySelector('a[href*="logout"]');
  });
  
  if (alreadyLoggedIn) {
    console.log('Already logged in');
    return;
  }
  
  // Fill in login form
  await page.waitForSelector('input[name="email"]', { timeout: 5000 });
  await page.type('input[name="email"]', config.adminEmail);
  await page.type('input[name="password"]', config.adminPassword);
  
  // Submit form
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ timeout: 10000 })
  ]);
  
  console.log('Login successful');
  await page.screenshot({ path: path.join(config.screenshotDir, 'admin-login.png') });
}

// Run the verification if this script is executed directly
if (require.main === module) {
  verifyAllLinks().then(exitCode => {
    process.exit(exitCode);
  });
}

module.exports = { verifyAllLinks };
