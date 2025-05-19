// Link Verification Script for TechNews
// This script tests all important links in the application to ensure they work correctly

const puppeteer = require('puppeteer');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const chalk = require('chalk') || { green: (t) => t, red: (t) => t, yellow: (t) => t, blue: (t) => t };

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DATABASE || 'technews';
const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminpassword';

// Results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

async function verifyAllLinks() {
  console.log(chalk.blue('🔍 Starting TechNews link verification...'));
  console.log(chalk.blue('This script tests all important links in the application'));
  
  let client;
  let browser;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log(chalk.green('✅ Connected to MongoDB'));
    
    const db = client.db(DB_NAME);
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1280, height: 800 }
    });
    
    const page = await browser.newPage();
    page.setDefaultTimeout(10000); // 10 second timeout for actions
    
    // Listen for console messages from the page
    page.on('console', message => {
      console.log(`Browser console: ${message.type()}: ${message.text()}`);
    });
    
    // Test public pages first
    await testPublicPages(page);
    
    // Test admin pages (requires login)
    await testAdminPages(page, db);
    
    // Print results summary
    console.log(chalk.blue('\n============================================'));
    console.log(chalk.blue('🎯 Link Verification Results Summary'));
    console.log(chalk.blue('============================================'));
    console.log(chalk.green(`✅ Total passed: ${results.passed}`));
    console.log(chalk.red(`❌ Total failed: ${results.failed}`));
    
    // Show detailed results
    console.log(chalk.blue('\nDetailed Results:'));
    results.tests.forEach((test, index) => {
      const status = test.passed 
        ? chalk.green('✅ PASSED')
        : chalk.red('❌ FAILED');
      console.log(`${index + 1}. ${status} - ${test.name}`);
      if (!test.passed) {
        console.log(`   Error: ${chalk.red(test.error)}`);
      }
    });
    
    if (results.failed === 0) {
      console.log(chalk.green('\n🎉 All link tests passed!'));
    } else {
      console.log(chalk.red(`\n⚠️ ${results.failed} link tests failed. Review the issues above.`));
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error during verification:'), error);
  } finally {
    if (client) await client.close();
    if (browser) await browser.close();
    console.log(chalk.blue('🔌 Test completed, all connections closed'));
  }
}

async function testPublicPages(page) {
  console.log(chalk.blue('\n🌐 Testing Public Pages:'));
  
  // Test homepage
  await testLink(page, 'Homepage', `${BASE_URL}/`, 'TechNews');
  
  // Test news page
  await testLink(page, 'News page', `${BASE_URL}/news`, 'Latest News');
  
  // Test categories page
  await testLink(page, 'Categories page', `${BASE_URL}/categories`, 'Categories');
  
  // Test an article page (we'll get a random article slug from the homepage)
  try {
    await page.goto(`${BASE_URL}/`);
    await page.waitForSelector('a[href^="/articles/"]');
    
    const articleHref = await page.evaluate(() => {
      const articleLink = document.querySelector('a[href^="/articles/"]');
      return articleLink ? articleLink.getAttribute('href') : null;
    });
    
    if (articleHref) {
      await testLink(page, 'Article page', `${BASE_URL}${articleHref}`, null, async () => {
        const articleTitle = await page.$eval('h1', el => el.textContent.trim());
        return articleTitle.length > 0;
      });
    } else {
      recordResult('Random article link from homepage', false, 'No article links found on homepage');
    }
  } catch (error) {
    recordResult('Random article link from homepage', false, error.message);
  }
  
  // Test search functionality
  await testLink(page, 'Search page', `${BASE_URL}/search`, 'Search');
  
  // Test login page
  await testLink(page, 'Login page', `${BASE_URL}/login`, 'Login');
  
  // Test registration page
  await testLink(page, 'Registration page', `${BASE_URL}/register`, 'Register');
  
  // Test navigation links
  console.log(chalk.blue('\n🧭 Testing Navigation Menu Links:'));
  try {
    await page.goto(`${BASE_URL}/`);
    
    // Get all navigation links
    const navLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a'));
      return links.map(link => ({
        text: link.textContent.trim(),
        href: link.getAttribute('href')
      })).filter(link => link.href && link.href.startsWith('/') && !link.href.includes('#'));
    });
    
    console.log(`Found ${navLinks.length} navigation links to test`);
    
    // Test each navigation link
    for (const link of navLinks) {
      await testLink(page, `Navigation: ${link.text}`, `${BASE_URL}${link.href}`, null);
    }
  } catch (error) {
    recordResult('Navigation menu links', false, error.message);
  }
}

async function testAdminPages(page, db) {
  console.log(chalk.blue('\n👑 Testing Admin Pages:'));
  
  // Login to admin area
  try {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('input[name="email"]');
    
    await page.type('input[name="email"]', ADMIN_EMAIL);
    await page.type('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for admin dashboard to load
    await page.waitForSelector('h1');
    const dashboardTitle = await page.$eval('h1', el => el.textContent.trim());
    
    if (dashboardTitle.includes('Dashboard')) {
      recordResult('Admin login', true);
      console.log(chalk.green('✅ Successfully logged into admin dashboard'));
    } else {
      recordResult('Admin login', false, 'Failed to reach admin dashboard after login');
      console.log(chalk.red('❌ Login failed or did not redirect to dashboard'));
      return; // Exit if login fails
    }
  } catch (error) {
    recordResult('Admin login', false, error.message);
    console.log(chalk.red(`❌ Error during admin login: ${error.message}`));
    return; // Exit if login fails
  }
  
  // Test admin dashboard
  await testLink(page, 'Admin dashboard', `${BASE_URL}/admin`, 'Dashboard');
  
  // Test articles management page
  await testLink(page, 'Articles management', `${BASE_URL}/admin/articles`, 'Articles Management');
  
  // Test categories management page
  await testLink(page, 'Categories management', `${BASE_URL}/admin/categories`, 'Categories');
  
  // Test "New Article" page
  await testLink(page, 'New article page', `${BASE_URL}/admin/articles/new`, 'Create New Article');
  
  // Test admin sidebar links
  console.log(chalk.blue('\n📋 Testing Admin Sidebar Links:'));
  try {
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForSelector('aside a');
    
    // Get all sidebar links
    const sidebarLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('aside a'));
      return links.map(link => ({
        text: link.textContent.trim(),
        href: link.getAttribute('href')
      })).filter(link => link.href && !link.href.includes('#'));
    });
    
    console.log(`Found ${sidebarLinks.length} sidebar links to test`);
    
    // Test each sidebar link
    for (const link of sidebarLinks) {
      if (!link.href.includes('logout')) {
        await testLink(page, `Sidebar: ${link.text}`, link.href.startsWith('http') ? link.href : `${BASE_URL}${link.href}`, null);
      }
    }
  } catch (error) {
    recordResult('Admin sidebar links', false, error.message);
  }
  
  // Get articles from database to test "View Article" links in admin dashboard
  console.log(chalk.blue('\n📰 Testing View Article Links from Admin Dashboard:'));
  try {
    const articleCollection = db.collection('articles');
    const articles = await articleCollection.find({ isPublished: true })
      .limit(3)
      .project({ title: 1, slug: 1 })
      .toArray();
    
    if (articles.length > 0) {
      console.log(`Found ${articles.length} articles to test View Article links`);
      
      // Go to articles management page
      await page.goto(`${BASE_URL}/admin/articles`);
      await page.waitForSelector('table');
      
      // Test each article's View Article link
      for (const article of articles) {
        console.log(`Testing View Article link for: ${article.title} (${article.slug})`);
        
        // Find the row with this article
        const rowExists = await page.evaluate((articleTitle) => {
          return Array.from(document.querySelectorAll('tr')).some(row => 
            row.textContent.includes(articleTitle)
          );
        }, article.title);
        
        if (!rowExists) {
          console.log(chalk.yellow(`⚠️ Article "${article.title}" not found in table, skipping`));
          continue;
        }
        
        // Find and click the View Article link
        try {
          const newPagePromise = new Promise(resolve => browser.once('targetcreated', resolve));
          
          await page.evaluate((articleTitle) => {
            const rows = Array.from(document.querySelectorAll('tr'));
            const row = rows.find(row => row.textContent.includes(articleTitle));
            if (row) {
              const viewLink = row.querySelector('a[title="View article"]');
              if (viewLink) viewLink.click();
            }
          }, article.title);
          
          // Wait for the new tab to open
          const newTarget = await newPagePromise;
          const newPage = await newTarget.page();
          await newPage.waitForSelector('h1');
          
          // Verify it's showing the correct article
          const articlePageTitle = await newPage.$eval('h1', el => el.textContent.trim());
          const currentUrl = newPage.url();
          
          if (articlePageTitle === article.title && currentUrl.includes(article.slug)) {
            recordResult(`View Article link: ${article.title}`, true);
            console.log(chalk.green(`✅ View Article link works correctly for: ${article.title}`));
          } else {
            recordResult(`View Article link: ${article.title}`, false, 
              `Expected article "${article.title}" but got "${articlePageTitle}"`);
            console.log(chalk.red(`❌ View Article link shows wrong article. Expected: ${article.title}, Got: ${articlePageTitle}`));
          }
          
          await newPage.close();
        } catch (error) {
          recordResult(`View Article link: ${article.title}`, false, error.message);
          console.log(chalk.red(`❌ Error testing View Article link: ${error.message}`));
        }
      }
    } else {
      console.log(chalk.yellow('⚠️ No published articles found to test View Article links'));
    }
  } catch (error) {
    recordResult('View Article links', false, error.message);
    console.log(chalk.red(`❌ Error testing View Article links: ${error.message}`));
  }
}

async function testLink(page, name, url, expectedTextContent, customValidator = null) {
  console.log(`Testing link: ${name} (${url})`);
  try {
    await page.goto(url);
    
    // Allow for custom validation logic
    if (customValidator) {
      const isValid = await customValidator();
      recordResult(name, isValid, isValid ? null : 'Custom validation failed');
      if (isValid) {
        console.log(chalk.green(`✅ Link ${name} passed custom validation`));
      } else {
        console.log(chalk.red(`❌ Link ${name} failed custom validation`));
      }
      return;
    }
    
    // Default validation checks for expected text content
    if (expectedTextContent) {
      const bodyText = await page.evaluate(() => document.body.textContent);
      if (bodyText.includes(expectedTextContent)) {
        recordResult(name, true);
        console.log(chalk.green(`✅ Link ${name} works correctly`));
      } else {
        recordResult(name, false, `Expected text "${expectedTextContent}" not found on page`);
        console.log(chalk.red(`❌ Link ${name} does not contain expected text: ${expectedTextContent}`));
      }
    } else {
      // If no expected text, just check that page loaded without error
      recordResult(name, true);
      console.log(chalk.green(`✅ Link ${name} loaded successfully`));
    }
  } catch (error) {
    recordResult(name, false, error.message);
    console.log(chalk.red(`❌ Error testing link ${name}: ${error.message}`));
  }
}

function recordResult(name, passed, error = null) {
  results.tests.push({ name, passed, error });
  if (passed) {
    results.passed++;
  } else {
    results.failed++;
  }
}

// Run the tests
verifyAllLinks();
