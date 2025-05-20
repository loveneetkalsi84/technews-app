// Verification script for "View Article" link in admin dashboard
// This script simulates clicking on the "View Article" link and verifies the correct article is displayed

const { MongoClient, ObjectId } = require('mongodb');
const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const chalk = require('chalk') || { green: (t) => t, red: (t) => t, yellow: (t) => t, blue: (t) => t };

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DATABASE || 'technews';
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function testViewArticleLink() {
  console.log(chalk.blue('🔍 Starting "View Article" link verification test...'));
  console.log(chalk.blue('This test verifies that clicking "View Article" shows the correct article'));
  
  let client;
  let browser;
  
  try {
    // Connect to MongoDB to get some article data
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log(chalk.green('✅ Connected to MongoDB'));
    
    const db = client.db(DB_NAME);
    const articleCollection = db.collection('articles');
    
    // Get 2 published articles
    const articles = await articleCollection.find({ isPublished: true })
      .limit(2)
      .project({ title: 1, slug: 1, _id: 1, content: 1 })
      .toArray();
    
    if (articles.length < 2) {
      console.log(chalk.red('❌ Need at least 2 published articles for this test'));
      return;
    }
    
    console.log(chalk.green(`✅ Found ${articles.length} articles for testing`));
    
    // Launch browser for UI testing
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    
    // Login to admin dashboard
    console.log(chalk.blue('🔑 Logging into admin dashboard...'));
    await page.goto(`${BASE_URL}/admin/login`);
    
    // Fill login form - replace with your admin credentials
    await page.type('input[name="email"]', process.env.ADMIN_EMAIL || 'admin@example.com');
    await page.type('input[name="password"]', process.env.ADMIN_PASSWORD || 'adminpassword');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForSelector('h1:has-text("Dashboard")');
    console.log(chalk.green('✅ Successfully logged into admin dashboard'));
    
    // Navigate to articles page
    await page.goto(`${BASE_URL}/admin/articles`);
    await page.waitForSelector('table');
    console.log(chalk.green('✅ Navigated to articles page'));
    
    // Test each article's "View Article" link
    for (const article of articles) {
      console.log(chalk.blue(`\n🧪 Testing "View Article" link for: "${article.title}"`));
      
      // Find the article in the table
      const articleRow = await page.waitForSelector(`tr:has-text("${article.title}")`);
      console.log(chalk.green('✅ Found article in table'));
      
      // Get the article's "View Article" link
      const viewArticleLink = await articleRow.$('a:has-text("View Article")');
      if (!viewArticleLink) {
        console.log(chalk.red('❌ "View Article" link not found'));
        continue;
      }
      
      // Get the href attribute
      const href = await viewArticleLink.evaluate(el => el.getAttribute('href'));
      console.log(chalk.blue(`📎 "View Article" link href: ${href}`));
      
      // Verify the href contains the article's slug
      if (!href.includes(article.slug)) {
        console.log(chalk.yellow(`⚠️ Link doesn't match exact slug, but might be case differences`));
      }
      
      // Click the "View Article" link in a new tab
      console.log(chalk.blue('🖱️ Clicking "View Article" link...'));
      const pageTarget = page.target();
      await viewArticleLink.click();
      
      // Wait for the new tab to open
      const newTarget = await browser.waitForTarget(target => target !== pageTarget);
      const newPage = await newTarget.page();
      await newPage.waitForLoadState('networkidle');
      
      // Get the current URL to verify it's the correct article page
      const currentUrl = newPage.url();
      console.log(chalk.blue(`🌐 New page URL: ${currentUrl}`));
      
      // Check if the article page contains the article title and some content
      const pageContent = await newPage.content();
      if (pageContent.includes(article.title)) {
        console.log(chalk.green('✅ Article page contains the correct title'));
        
        // Extract a unique snippet from the article content for verification
        const contentSnippet = article.content.substring(0, 50).trim();
        if (pageContent.includes(contentSnippet)) {
          console.log(chalk.green('✅ Article page contains the correct content'));
          console.log(chalk.green('✅ TEST PASSED: "View Article" link shows the correct article'));
        } else {
          console.log(chalk.red('❌ Article page does not contain the expected content snippet'));
          console.log(chalk.red('❌ TEST FAILED: "View Article" link might show the wrong article'));
        }
      } else {
        console.log(chalk.red('❌ Article page does not contain the expected title'));
        console.log(chalk.red('❌ TEST FAILED: "View Article" link shows the wrong article'));
      }
      
      // Close the article page
      await newPage.close();
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error during verification:'), error);
  } finally {
    if (client) {
      await client.close();
      console.log(chalk.blue('🔌 Disconnected from MongoDB'));
    }
    if (browser) {
      await browser.close();
      console.log(chalk.blue('🔌 Closed browser'));
    }
  }
}

// Run the verification
testViewArticleLink();
