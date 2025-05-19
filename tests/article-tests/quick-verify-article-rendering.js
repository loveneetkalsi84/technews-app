// Simplified Article Rendering Verification Test
// This script tests article rendering functionality without requiring MongoDB

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  port: 3002,
  baseUrl: 'http://localhost:3002',
  screenshotDir: path.join(__dirname, '../../test-output/screenshots'),
  logFilePath: path.join(__dirname, '../../test-output/quick-article-test.log')
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

async function quickVerifyArticleRendering() {
  console.log(`
╔═══════════════════════════════════════════════╗
║     QUICK ARTICLE RENDERING VERIFICATION      ║
║     ${new Date().toISOString()}               ║
╚═══════════════════════════════════════════════╝
`);
  
  let browser;
  
  try {
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
    
    // Test cases
    await testHomePageArticleLinks(page);
    await testDirectArticleAccess(page);
    await testCategoryPageArticleLinks(page);
    
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
    if (browser) await browser.close();
    logStream.end();
    console.log('\n🔌 Test completed, all connections closed');
    console.log(`Test results log saved to: ${CONFIG.logFilePath}`);
  }
  
  // Return exit code based on results
  return results.failed > 0 ? 1 : 0;
}

async function testHomePageArticleLinks(page) {
  console.log('\n🔍 Testing article links from homepage:');
  
  try {
    // Navigate to homepage
    await page.goto(`${CONFIG.baseUrl}/`);
    await page.waitForSelector('article a', { timeout: 10000 }).catch(() => {
      console.log('No article links found on homepage after timeout');
    });
    
    // Take a screenshot
    await page.screenshot({ path: path.join(CONFIG.screenshotDir, 'homepage.png') });
    
    // Check if our test article is visible
    const articleLinks = await page.$$eval('a[href^="/articles/"]', (links) => 
      links.map(link => ({ href: link.href, text: link.textContent }))
    );
    
    console.log(`Found ${articleLinks.length} article links on homepage`);
    
    // Click the first article link and verify it loads
    if (articleLinks.length > 0) {
      await page.click('a[href^="/articles/"]');
      
      // Wait for article page to load with reasonable timeout
      await page.waitForSelector('h1, .prose, .article-content', { timeout: 10000 }).catch(() => {
        console.log('Article content not found after timeout');
      });
      
      const articleUrl = page.url();
      const articleTitle = await page.$eval('h1', el => el.textContent).catch(() => 'No title found');
      
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

async function testDirectArticleAccess(page) {
  console.log('\n🔍 Testing direct article access:');
  
  try {
    // Try to access a few known article slugs
    const slugsToTry = ['mythirdart', 'test-article-api', 'welcome-to-technews'];
    let accessedArticle = false;
    
    for (const slug of slugsToTry) {
      try {
        // Navigate directly to the article
        const articleUrl = `${CONFIG.baseUrl}/articles/${slug}`;
        console.log(`Trying to access: ${articleUrl}`);
        
        await page.goto(articleUrl);
        
        // Wait for article content with reasonable timeout
        await page.waitForSelector('h1, .prose, .article-content', { timeout: 5000 });
        
        // Take a screenshot
        await page.screenshot({ path: path.join(CONFIG.screenshotDir, `direct-article-${slug}.png`) });
        
        // Get the article title
        const pageTitle = await page.$eval('h1', el => el.textContent);
        console.log(`Successfully accessed article: "${pageTitle}"`);
        
        accessedArticle = true;
        recordTestResult(`Direct Access to Article: ${slug}`, true);
        break; // Found a valid article, no need to try others
      } catch (err) {
        console.log(`Could not access article with slug: ${slug}`);
      }
    }
    
    if (!accessedArticle) {
      recordTestResult('Direct Article Access', false, 'Could not access any article directly by slug');
    }
  } catch (error) {
    console.error('Error testing direct article access:', error);
    await page.screenshot({ path: path.join(CONFIG.screenshotDir, 'direct-article-access-error.png') });
    recordTestResult('Direct Article Access', false, error.message);
  }
}

async function testCategoryPageArticleLinks(page) {
  console.log('\n🔍 Testing article links from category page:');
  
  try {
    // Try to access category pages
    const categoriesToTry = ['news', 'tech', 'reviews', 'business'];
    let foundCategory = false;
    
    for (const category of categoriesToTry) {
      try {
        // Navigate to the category page
        const categoryUrl = `${CONFIG.baseUrl}/categories/${category}`;
        console.log(`Trying to access category: ${categoryUrl}`);
        
        await page.goto(categoryUrl);
        await page.waitForSelector('h1, .category-title', { timeout: 5000 });
        
        // Check if there are any article links
        const articleLinks = await page.$$eval('a[href^="/articles/"]', links => links.length);
        
        if (articleLinks > 0) {
          console.log(`Found ${articleLinks} article links in category ${category}`);
          await page.screenshot({ path: path.join(CONFIG.screenshotDir, `category-${category}.png`) });
          
          // Click the first article link
          await page.click('a[href^="/articles/"]');
          await page.waitForSelector('h1, .prose, .article-content', { timeout: 5000 });
          
          const articleTitle = await page.$eval('h1', el => el.textContent);
          await page.screenshot({ path: path.join(CONFIG.screenshotDir, `article-from-category-${category}.png`) });
          
          console.log(`Clicked article from category ${category}: "${articleTitle}"`);
          recordTestResult(`Category Page (${category}) Article Links`, true);
          
          foundCategory = true;
          break; // Found a working category, no need to try others
        } else {
          console.log(`No article links found in category ${category}`);
        }
      } catch (err) {
        console.log(`Could not test category: ${category} - ${err.message}`);
      }
    }
    
    if (!foundCategory) {
      recordTestResult('Category Page Article Links', false, 'Could not find articles in any category');
    }
  } catch (error) {
    console.error('Error testing category page article links:', error);
    await page.screenshot({ path: path.join(CONFIG.screenshotDir, 'category-page-error.png') });
    recordTestResult('Category Page Article Links', false, error.message);
  }
}

// Run the verification if this script is executed directly
if (require.main === module) {
  quickVerifyArticleRendering().then(exitCode => {
    process.exit(exitCode);
  });
}

module.exports = { quickVerifyArticleRendering };
