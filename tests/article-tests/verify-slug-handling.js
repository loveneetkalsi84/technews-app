/**
 * Specialized Script for Verifying Article Slug Handling
 * 
 * This script specifically tests:
 * 1. Case insensitivity in article slugs
 * 2. Special character handling in URLs
 * 3. Slug normalization and redirection
 * 4. Error handling for invalid slugs
 */

const axios = require('axios');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  port: process.env.PORT || 3000,
  baseUrl: `http://localhost:${process.env.PORT || 3000}`,
  apiUrl: `http://localhost:${process.env.PORT || 3000}/api`,
  logFilePath: path.join(__dirname, '../../test-output/slug-handling-test.log'),
  // Test cases for slug variations
  slugTests: [
    // Test case for standard slugs
    { 
      original: 'getting-started-with-nextjs',
      variations: [
        'Getting-Started-With-NextJS',  // capital letters
        'GETTING-STARTED-WITH-NEXTJS',  // all caps
        'getting-started-with-nextjs '  // trailing space (should be trimmed)
      ] 
    },
    // Test case for capital letters in original slug
    { 
      original: 'CSS-Variables-Modern-Styling',
      variations: [
        'css-variables-modern-styling',  // all lowercase
        'Css-Variables-Modern-Styling',  // mixed case
        'CSS-VARIABLES-MODERN-STYLING'   // all caps
      ] 
    },
    // Test case for special characters
    { 
      original: 'special-characters-in-urls_a-technical-guide',
      variations: [
        'Special-Characters-In-Urls_A-Technical-Guide',  // capital letters
        'special-characters-in-urls_a-technical-guide-',  // trailing dash
        'special-characters-in-urls_a-technical-guide/'   // trailing slash
      ] 
    }
  ]
};

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
 * Fetches an article by slug from the API
 */
async function fetchArticleBySlug(slug) {
  try {
    console.log(chalk.blue(`🔍 Fetching article with slug: "${slug}"`));
    const response = await axios.get(`${CONFIG.apiUrl}/articles/${slug}`);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    if (error.response) {
      return { 
        success: false, 
        status: error.response.status, 
        data: error.response.data,
        error: `HTTP Error ${error.response.status}`
      };
    }
    return { 
      success: false, 
      error: error.message || 'Unknown error' 
    };
  }
}

/**
 * Tests if the article can be fetched by a specific slug variation
 */
async function testSlugVariation(original, variation) {
  const testName = `Slug Variation: "${variation}" (Original: "${original}")`;
  
  try {
    // Fetch using the variation
    const result = await fetchArticleBySlug(variation);
    
    if (!result.success) {
      recordResult(
        testName,
        false,
        `Failed to fetch article: ${result.error}`,
        result
      );
      return;
    }
    
    // Check if we got an article back
    if (!result.data || !result.data.article) {
      recordResult(
        testName,
        false,
        'API returned success but no article data',
        result
      );
      return;
    }
    
    // Check if the slug of the returned article matches the original
    // (Allowing for case differences since we're testing case insensitivity)
    if (result.data.article.slug.toLowerCase() !== original.toLowerCase()) {
      recordResult(
        testName,
        false,
        `Returned article has wrong slug: "${result.data.article.slug}"`,
        { expected: original, actual: result.data.article.slug, response: result }
      );
      return;
    }
    
    // Success - we got the right article using a variant slug
    recordResult(
      testName,
      true,
      null,
      { 
        original, 
        variation, 
        returnedSlug: result.data.article.slug,
        title: result.data.article.title
      }
    );
    
  } catch (error) {
    recordResult(
      testName,
      false,
      `Test threw an exception: ${error.message}`,
      { error: error.stack }
    );
  }
}

/**
 * Tests all configured slug variations
 */
async function testAllSlugVariations() {
  console.log(chalk.yellow('\nTesting all slug variations...'));
  
  for (const test of CONFIG.slugTests) {
    console.log(chalk.cyan(`\n📋 Testing original slug: "${test.original}"`));
    
    // First verify the original slug works
    const originalResult = await fetchArticleBySlug(test.original);
    if (!originalResult.success || !originalResult.data?.article) {
      recordResult(
        `Original Slug: "${test.original}"`,
        false,
        'Original slug failed to fetch article. Cannot proceed with variations.',
        originalResult
      );
      continue;
    }
    
    recordResult(
      `Original Slug: "${test.original}"`,
      true,
      null,
      { 
        title: originalResult.data.article.title,
        id: originalResult.data.article.id
      }
    );
    
    // Now test all variations
    for (const variation of test.variations) {
      await testSlugVariation(test.original, variation);
    }
  }
}

/**
 * Tests handling of completely invalid slugs
 */
async function testInvalidSlugs() {
  console.log(chalk.yellow('\nTesting invalid slug handling...'));
  
  const invalidSlugs = [
    'non-existent-article',
    '!@#$%^&*()-invalid',
    '<script>alert("xss")</script>',
    '../../../etc/passwd',
    ''  // Empty slug
  ];
  
  for (const slug of invalidSlugs) {
    const testName = `Invalid Slug: "${slug}"`;
    
    try {
      const result = await fetchArticleBySlug(slug);
      
      // We expect these to fail, so if they succeed that's a problem
      if (result.success && result.data?.article) {
        recordResult(
          testName,
          false,
          'Invalid slug incorrectly returned an article',
          { slug, article: result.data.article }
        );
        continue;
      }
      
      // Check if we got an appropriate error status
      if (!result.status || (result.status !== 404 && result.status !== 400)) {
        recordResult(
          testName,
          false,
          `Expected 404/400 status but got ${result.status || 'unknown'}`,
          result
        );
        continue;
      }
      
      // Success - we got an appropriate error response
      recordResult(
        testName,
        true,
        null,
        { status: result.status, message: result.data?.message || 'No message' }
      );
      
    } catch (error) {
      recordResult(
        testName,
        false,
        `Test threw an exception: ${error.message}`,
        { error: error.stack }
      );
    }
  }
}

/**
 * Main verification function
 */
async function verifySlugHandling() {
  console.log(chalk.bold(`
╔════════════════════════════════════════════════════╗
║       ARTICLE SLUG HANDLING VERIFICATION          ║
╚════════════════════════════════════════════════════╝
`));
  
  console.log(`Starting verification at: ${new Date().toLocaleString()}`);
  console.log(`API URL: ${CONFIG.apiUrl}`);
  console.log(`Log file: ${CONFIG.logFilePath}`);
  
  try {
    // Test all configured slug variations
    await testAllSlugVariations();
    
    // Test invalid slugs
    await testInvalidSlugs();
    
  } catch (error) {
    console.error(chalk.red('Fatal error:'), error);
    results.failed++;
  } finally {
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
  }
}

// Run the verification
console.log('Starting slug handling verification...');
verifySlugHandling().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
