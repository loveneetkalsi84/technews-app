"use strict";

/**
 * Article View and Preview Verification Test
 * 
 * This script verifies that the article view and preview functionality
 * is working correctly by opening a browser and checking key functionality.
 */

const puppeteer = require('puppeteer');

async function verifyArticleFunctionality() {
  console.log('Starting article functionality verification test...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for headless testing
    defaultViewport: null,
    args: ['--window-size=1280,800']
  });
  
  try {
    const page = await browser.newPage();
    console.log('Opening browser...');
    
    // 1. Verify the article creation form works
    console.log('Testing article creation form...');
    await page.goto('http://localhost:3000/admin/articles/new');
    
    // Wait for login if needed
    if (await page.url().includes('login')) {
      console.log('Login needed, attempting to log in...');
      await page.type('input[name="email"]', 'admin@technews.com');
      await page.type('input[name="password"]', 'adminpassword');
      await page.click('button[type="submit"]');
      await page.waitForNavigation();
    }
    
    // Verify we're on the article creation page
    await page.waitForSelector('input[name="title"]');
    console.log('Successfully loaded article creation form');
    
    // Fill out the form
    await page.type('input[name="title"]', 'Test Article for Verification');
    await page.waitForSelector('textarea[name="content"]');
    await page.type('textarea[name="content"]', `
# Test Article

This is a test article to verify that the article preview and view functionality is working correctly.

## Testing Markdown

* Item 1
* Item 2
* Item 3

[Link text](https://example.com)
    `);
    
    // Click the preview button
    console.log('Testing preview functionality...');
    await page.click('button:has-text("Preview")');
    
    // Verify the preview shows our content
    await page.waitForSelector('.prose');
    
    // Check that the preview contains our title and content
    const previewContent = await page.evaluate(() => {
      return document.querySelector('.prose').innerText;
    });
    
    if (previewContent.includes('Test Article') && previewContent.includes('Testing Markdown')) {
      console.log('✅ Preview functionality is working correctly');
    } else {
      console.error('❌ Preview content is not showing properly');
    }
    
    // Go back to the editor
    await page.click('button:has-text("Back to Editor")');
    await page.waitForSelector('textarea[name="content"]');
    console.log('Successfully returned to the editor');
    
    // Save the article (optional, depends on environment)
    if (process.env.SAVE_ARTICLE === 'true') {
      console.log('Saving the test article...');
      await page.click('button:has-text("Save")');
      await page.waitForNavigation();
      
      // Navigate to view the article
      console.log('Testing article view page...');
      await page.goto('http://localhost:3000/articles/test-article-for-verification');
      
      // Verify the article view page
      await page.waitForSelector('.prose');
      const articleContent = await page.evaluate(() => {
        return document.querySelector('.prose').innerText;
      });
      
      if (articleContent.includes('Test Article') && articleContent.includes('Testing Markdown')) {
        console.log('✅ Article view page is working correctly');
      } else {
        console.error('❌ Article view content is not showing properly');
      }
    }
    
    console.log('Article functionality verification completed successfully');
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    // Close the browser after a delay to see results
    setTimeout(async () => {
      await browser.close();
    }, 5000);
  }
}

verifyArticleFunctionality().catch(console.error);
