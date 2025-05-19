"use strict";

/**
 * Test Article View Link
 * 
 * This script tests the "View Article" link functionality by:
 * 1. Creating a test article
 * 2. Clicking the View Article link from the admin dashboard
 * 3. Verifying that the correct article is displayed
 */

const puppeteer = require('puppeteer');

const TEST_ARTICLE = {
  title: 'Test Article View Link Functionality',
  slug: 'test-article-view-link',
  content: `# This is a test article
  
This article is used to test the "View Article" link functionality from the admin dashboard.
It should display this exact article when the View Article link is clicked.

## Features

* Unique identifier text
* Markdown formatting
* Special timestamp: ${new Date().toISOString()}
  `,
  category: 'Test',
  tags: 'test,view,link'
};

async function testViewArticleLink() {
  console.log('Starting article view link functionality test...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--window-size=1280,800']
  });
  
  try {
    const page = await browser.newPage();
      // Step 1: Log in to the admin panel
    console.log('Logging in to admin panel...');
    await page.goto('http://localhost:3007/admin');
    
    if (await page.url().includes('login')) {
      await page.type('input[name="email"]', 'admin@technews.com');
      await page.type('input[name="password"]', 'adminpassword');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();
    }
      // Step 2: Navigate to create a new article
    console.log('Creating test article...');
    await page.goto('http://localhost:3007/admin/articles/new');
    await page.waitForSelector('input[name="title"]');
    
    // Fill out the article form
    await page.type('input[name="title"]', TEST_ARTICLE.title);
    await page.type('input[name="slug"]', TEST_ARTICLE.slug);
    await page.type('textarea[name="content"]', TEST_ARTICLE.content);
    
    // Select "Published" status
    await page.select('select[name="status"]', 'published');
    
    // Add category and tags
    await page.select('select[name="category"]', TEST_ARTICLE.category);
    await page.type('input[name="tags"]', TEST_ARTICLE.tags);
    
    // Save the article
    console.log('Saving article...');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
      // Step 3: Navigate to the articles management page
    console.log('Navigating to articles management...');
    await page.goto('http://localhost:3007/admin/articles');
    await page.waitForSelector('table');
    
    // Step 4: Find our test article in the table
    console.log('Finding test article in the table...');
    const linkSelector = `a[href="/articles/${TEST_ARTICLE.slug}"]`;
    await page.waitForSelector(linkSelector);
    
    // Step 5: Open the article in a new tab
    console.log('Opening article view link...');
    const newPagePromise = new Promise(resolve => 
      browser.once('targetcreated', target => resolve(target.page()))
    );
    
    await page.click(linkSelector);
    const newPage = await newPagePromise;
    await newPage.waitForSelector('.prose');
    
    // Step 6: Verify the content matches our test article
    console.log('Verifying article content...');
    const articleContent = await newPage.evaluate(() => {
      return document.querySelector('.prose').innerText;
    });
    
    const articleTitle = await newPage.evaluate(() => {
      return document.querySelector('h1').innerText;
    });
    
    if (articleTitle === TEST_ARTICLE.title && 
        articleContent.includes('This is a test article') && 
        articleContent.includes('Special timestamp:')) {
      console.log('✅ SUCCESS: Correct article is displayed when using the View Article link');
    } else {
      console.error('❌ ERROR: Article content does not match the expected test article');
      console.error('Expected title:', TEST_ARTICLE.title);
      console.error('Actual title:', articleTitle);
      console.error('Article content contains correct text:', articleContent.includes('This is a test article'));
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Keep the browser open for 5 seconds to see the results
    await new Promise(resolve => setTimeout(resolve, 5000));
    await browser.close();
  }
}

testViewArticleLink().catch(console.error);
