/**
 * Verify Article Links with Mock Database
 * This script tests all article links in the application using the mock database
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const CONFIG = {
  port: process.env.PORT || 3000,
  baseUrl: `http://localhost:${process.env.PORT || 3000}`,
  screenshotDir: path.join(__dirname, '../../test-output/screenshots'),
  logFilePath: path.join(__dirname, '../../test-output/mock-article-links-test.log'),
  expectedSlugs: [
    'getting-started-with-nextjs',
    'future-of-web-development',
    'typescript-best-practices',
    'CSS-Variables-Modern-Styling',  // Note the capital letters
    'react-hooks-complete-guide',
    'special-characters-in-urls_a-technical-guide'  // Note the underscore
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

/**
 * Records a test result
 */
function recordResult(name, passed, error = null, details = null) {
  results.total++;
  results.tests.push({ name, passed, error, details });
  
  if (passed) {
    results.passed++;
    console.log(chalk.green(`✅ PASSED: ${name}`));
  } else {
    results.failed++;
    console.log(chalk.red(`❌ FAILED: ${name}${error ? ': ' + error : ''}`));
  }
  
  if (details) {
    console.log(chalk.gray('   Details:'), details);
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
 * Test all article links on the homepage
 */
async function testHomepageArticleLinks(browser) {
  console.log(chalk.blue('\n📋 Testing article links on homepage...'));
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    // Navigate to the homepage
    console.log(`Navigating to: ${CONFIG.baseUrl}`);
    await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle2', timeout: 10000 });
    
    // Get all article links on the homepage
    const articleLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href^="/articles/"]'))
        .map(a => ({
          text: a.textContent.trim(),
          href: a.getAttribute('href')
        }));
    });
    
    console.log(`Found ${articleLinks.length} article links on homepage`);
    
    if (articleLinks.length === 0) {
      await takeScreenshot(page, 'no-article-links-homepage');
      recordResult(
        'Homepage Article Links Detection',
        false,
        'No article links found on homepage'
      );
      await page.close();
      return;
    }
    
    recordResult(
      'Homepage Article Links Detection',
      true,
      null,
      { count: articleLinks.length }
    );
    
    // Test each article link
    for (const link of articleLinks) {
      console.log(chalk.blue(`\nTesting article link: ${link.href}`));
      
      try {
        // Get the slug from the URL
        const slug = link.href.split('/').pop();
        
        // Navigate to the article page
        await page.goto(`${CONFIG.baseUrl}${link.href}`, { waitUntil: 'networkidle2', timeout: 10000 });
        
        // Check if the page loaded successfully by looking for article title
        const title = await page.evaluate(() => {
          const titleEl = document.querySelector('h1');
          return titleEl ? titleEl.textContent.trim() : null;
        });
        
        if (!title) {
          await takeScreenshot(page, `no-title-${slug}`);
          recordResult(
            `Article Link: ${slug}`,
            false,
            'Article page does not have a title (h1)',
            { url: link.href }
          );
          continue;
        }
        
        // Check for error messages
        const hasError = await page.evaluate(() => {
          return !!document.querySelector('.error-message');
        });
        
        if (hasError) {
          await takeScreenshot(page, `error-${slug}`);
          recordResult(
            `Article Link: ${slug}`,
            false,
            'Article page shows an error message',
            { url: link.href }
          );
          continue;
        }
        
        // Success - the article page loaded
        await takeScreenshot(page, `success-${slug}`);
        recordResult(
          `Article Link: ${slug}`,
          true,
          null,
          { url: link.href, title }
        );
        
      } catch (error) {
        await takeScreenshot(page, `exception-${link.href.split('/').pop()}`);
        recordResult(
          `Article Link: ${link.href}`,
          false,
          `Exception: ${error.message}`
        );
      }
    }
    
  } catch (error) {
    console.error(chalk.red('Error testing homepage article links:'), error);
    recordResult(
      'Homepage Article Links',
      false,
      `Fatal error: ${error.message}`
    );
  } finally {
    await page.close();
  }
}

/**
 * Test direct navigation to each expected article
 */
async function testDirectArticleNavigation(browser) {
  console.log(chalk.blue('\n📋 Testing direct navigation to articles...'));
  
  for (const slug of CONFIG.expectedSlugs) {
    console.log(chalk.blue(`\nTesting direct navigation to article: ${slug}`));
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    try {
      // Navigate directly to the article
      const url = `${CONFIG.baseUrl}/articles/${slug}`;
      console.log(`Navigating to: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
      
      // Check if the page loaded successfully by looking for article title
      const title = await page.evaluate(() => {
        const titleEl = document.querySelector('h1');
        return titleEl ? titleEl.textContent.trim() : null;
      });
      
      if (!title) {
        await takeScreenshot(page, `direct-no-title-${slug}`);
        recordResult(
          `Direct Navigation: ${slug}`,
          false,
          'Article page does not have a title (h1)',
          { url }
        );
        await page.close();
        continue;
      }
      
      // Check for error messages
      const hasError = await page.evaluate(() => {
        return !!document.querySelector('.error-message');
      });
      
      if (hasError) {
        await takeScreenshot(page, `direct-error-${slug}`);
        recordResult(
          `Direct Navigation: ${slug}`,
          false,
          'Article page shows an error message',
          { url }
        );
        await page.close();
        continue;
      }
      
      // Success - the article page loaded
      await takeScreenshot(page, `direct-success-${slug}`);
      recordResult(
        `Direct Navigation: ${slug}`,
        true,
        null,
        { url, title }
      );
      
    } catch (error) {
      recordResult(
        `Direct Navigation: ${slug}`,
        false,
        `Exception: ${error.message}`
      );
    } finally {
      await page.close();
    }
  }
}

/**
 * Main verification function
 */
async function verifyArticleLinks() {
  console.log(chalk.bold(`
╔════════════════════════════════════════════════════╗
║       ARTICLE LINKS VERIFICATION (MOCK DB)         ║
╚════════════════════════════════════════════════════╝
`));
  
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
    
    // Test article links on the homepage
    await testHomepageArticleLinks(browser);
    
    // Test direct navigation to expected articles
    await testDirectArticleNavigation(browser);
    
  } catch (error) {
    console.error(chalk.red('Fatal error:'), error);
    results.failed++;
  } finally {
    if (browser) {
      await browser.close();
      console.log('\nBrowser closed.');
    }
    
    // Print summary
    console.log(chalk.bold('\n========== TEST SUMMARY =========='));
    console.log(chalk.blue(`Total tests: ${results.total}`));
    console.log(chalk.green(`Passed: ${results.passed}`));
    console.log(chalk.red(`Failed: ${results.failed}`));
    console.log(chalk.bold('================================='));
    
    if (results.failed > 0) {
      console.log(chalk.red('\nFailed tests:'));
      results.tests
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(chalk.red(`- ${test.name}${test.error ? ': ' + test.error : ''}`));
        });
    }
    
    console.log(`\nVerification completed at: ${new Date().toLocaleString()}`);
    
    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
  }
}

// Run the verification
verifyArticleLinks().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
