/**
 * Comprehensive Article Rendering Verification
 * This script tests all aspects of article rendering including:
 * - Proper loading of articles by slug
 * - Case insensitivity in slug handling
 * - Special character handling in slugs
 * - Article content rendering
 * - Metadata display
 * - Images and formatting
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  port: process.env.PORT || 3000,
  baseUrl: `http://localhost:${process.env.PORT || 3000}`,
  screenshotDir: path.join(__dirname, '../../test-output/screenshots'),
  logFilePath: path.join(__dirname, '../../test-output/comprehensive-article-test.log'),
  testArticleSlugs: [
    // Regular slug
    'getting-started-with-nextjs',
    // Same slug with different casing
    'Getting-Started-with-NextJS',
    // Slug with capital letters
    'CSS-Variables-Modern-Styling',
    // Lowercase version to test case insensitivity
    'css-variables-modern-styling',
    // Slug with underscore and mixed casing
    'special-characters-in-urls_a-technical-guide',
    // Non-existent slug (for error handling)
    'non-existent-article-slug'
  ]
};

// Ensure screenshot directory exists
if (!fs.existsSync(CONFIG.screenshotDir)) {
  fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
}

// Initialize log file
const logStream = fs.createWriteStream(CONFIG.logFilePath, { flags: 'w' });

// Setup console logging to also write to file
const originalConsoleLog = console.log;
console.log = function(...args) {
  const message = args.join(' ');
  originalConsoleLog(message);
  logStream.write(message + '\n');
};

// Results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

function recordTestResult(name, passed, error = null, screenshot = null) {
  results.total++;
  results.tests.push({ name, passed, error, screenshot });
  
  if (passed) {
    results.passed++;
    console.log(`✅ PASSED: ${name}`);
  } else {
    results.failed++;
    console.log(`❌ FAILED: ${name}${error ? ': ' + error : ''}`);
  }
}

/**
 * Takes a screenshot of the current page
 */
async function takeScreenshot(page, name) {
  const filename = `${Date.now()}-${name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
  const filePath = path.join(CONFIG.screenshotDir, filename);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`   📸 Screenshot saved: ${filename}`);
  return filename;
}

/**
 * Tests an article page for proper rendering
 */
async function testArticlePage(browser, slug) {
  console.log(`\n🔍 Testing article with slug: "${slug}"`);
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    const url = `${CONFIG.baseUrl}/articles/${slug}`;
    console.log(`   Loading: ${url}`);
    
    // Navigate to the article page
    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
    
    // Check if the page loaded successfully
    const status = response.status();
    if (status !== 200) {
      const screenshot = await takeScreenshot(page, `error-${slug}`);
      recordTestResult(
        `Article "${slug}" - HTTP Status Check`, 
        false, 
        `Received status ${status} instead of 200`,
        screenshot
      );
      await page.close();
      return;
    }
    
    // Check for error messages in the UI
    const errorElement = await page.$('.error-message');
    if (errorElement) {
      const errorText = await page.evaluate(el => el.textContent, errorElement);
      const screenshot = await takeScreenshot(page, `error-message-${slug}`);
      
      if (slug === 'non-existent-article-slug') {
        // This is expected for our non-existent test slug
        recordTestResult(
          `Article "${slug}" - Expected Error Message`, 
          true,
          null,
          screenshot
        );
      } else {
        recordTestResult(
          `Article "${slug}" - Error Message Check`, 
          false, 
          `Found error message: ${errorText}`,
          screenshot
        );
      }
      
      await page.close();
      return;
    }
    
    // If we're testing the non-existent slug and no error appeared, that's a problem
    if (slug === 'non-existent-article-slug') {
      const screenshot = await takeScreenshot(page, `missing-error-${slug}`);
      recordTestResult(
        `Article "${slug}" - Missing Error Message`, 
        false, 
        `Non-existent article should show an error but did not`,
        screenshot
      );
      await page.close();
      return;
    }
    
    // Check if the article title is present
    const titleElement = await page.$('h1');
    if (!titleElement) {
      const screenshot = await takeScreenshot(page, `no-title-${slug}`);
      recordTestResult(
        `Article "${slug}" - Title Check`, 
        false, 
        `Article title (h1) not found`,
        screenshot
      );
      await page.close();
      return;
    }
    
    // Get the article title
    const title = await page.evaluate(el => el.textContent.trim(), titleElement);
    console.log(`   Article title: "${title}"`);
    
    // Validate article components
    const components = {
      'Article Title': 'h1',
      'Article Content': '.article-content',
      'Author Info': '.author-info',
      'Publication Date': '.publication-date'
    };
    
    // Test for each component
    for (const [name, selector] of Object.entries(components)) {
      const element = await page.$(selector);
      const screenshot = await takeScreenshot(page, `${name.toLowerCase().replace(/\s+/g, '-')}-${slug}`);
      
      recordTestResult(
        `Article "${slug}" - ${name}`, 
        !!element, 
        element ? null : `${name} not found using selector: ${selector}`,
        screenshot
      );
    }
    
    // Check for broken images
    const brokenImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src);
    });
    
    if (brokenImages.length > 0) {
      recordTestResult(
        `Article "${slug}" - Images`, 
        false, 
        `Found ${brokenImages.length} broken images: ${brokenImages.join(', ')}`,
        await takeScreenshot(page, `broken-images-${slug}`)
      );
    } else {
      recordTestResult(
        `Article "${slug}" - Images`, 
        true, 
        null,
        await takeScreenshot(page, `images-${slug}`)
      );
    }
    
    // Success - the page loaded with all expected components
    console.log(`   ✅ Article "${slug}" loaded successfully`);
    
    // Take a full page screenshot
    await takeScreenshot(page, `full-page-${slug}`);
  } catch (error) {
    console.error(`   ❌ Error testing article "${slug}":`, error.message);
    try {
      const screenshot = await takeScreenshot(page, `exception-${slug}`);
      recordTestResult(
        `Article "${slug}" - Exception`, 
        false, 
        error.message,
        screenshot
      );
    } catch (screenshotError) {
      recordTestResult(
        `Article "${slug}" - Exception`, 
        false, 
        `${error.message} (failed to take screenshot: ${screenshotError.message})`
      );
    }
  } finally {
    await page.close();
  }
}

/**
 * Main test function
 */
async function runVerification() {
  console.log(`
╔════════════════════════════════════════════════════╗
║  COMPREHENSIVE ARTICLE RENDERING VERIFICATION      ║
╚════════════════════════════════════════════════════╝
`);
  
  console.log(`Starting verification at: ${new Date().toLocaleString()}`);
  console.log(`Base URL: ${CONFIG.baseUrl}`);
  console.log(`Screenshots folder: ${CONFIG.screenshotDir}`);
  console.log(`Log file: ${CONFIG.logFilePath}`);
  
  let browser;
  
  try {
    console.log('\nLaunching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('Browser launched successfully.\n');
    
    // Test each article slug
    for (const slug of CONFIG.testArticleSlugs) {
      await testArticlePage(browser, slug);
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
    results.failed++;
  } finally {
    if (browser) {
      await browser.close();
      console.log('\nBrowser closed.');
    }
    
    // Print summary
    console.log('\n========== TEST SUMMARY ==========');
    console.log(`Total tests: ${results.total}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log('=================================');
    
    if (results.failed > 0) {
      console.log('\nFailed tests:');
      results.tests
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`- ${test.name}${test.error ? ': ' + test.error : ''}`);
          if (test.screenshot) {
            console.log(`  Screenshot: ${test.screenshot}`);
          }
        });
    }
    
    console.log(`\nVerification completed at: ${new Date().toLocaleString()}`);
  }
}

// Run the verification
runVerification().catch(console.error);
