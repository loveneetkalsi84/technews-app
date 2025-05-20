// Test script to verify article creation and filtering in the mock database
// This script is designed to run with Node.js and test the fixed mock database implementation

// Use ES module syntax for compatibility with the app
import { connectToDatabase } from './app/lib/mock-mongodb.js';

async function testMockDatabaseFixes() {
  try {
    console.log('===== TESTING MOCK DATABASE FIXES =====');
    console.log('Connecting to mock database...');
    const mongoose = await connectToDatabase();
    
    // Get the Article model
    const Article = mongoose.model('Article');
    
    // 1. First, count all articles (to establish a baseline)
    console.log('\n1. Checking initial articles count...');
    const initialArticles = await Article.find({});
    console.log(`Initial articles count: ${initialArticles.length}`);
    
    // 2. Create a new published article
    console.log('\n2. Creating a new PUBLISHED article...');
    const publishedArticle = await Article.create({
      title: 'Test Published Article',
      slug: 'test-published-article',
      content: 'This is a test published article to verify the fix.',
      excerpt: 'Test published article',
      category: 'Test',
      author: 'Tester',
      tags: ['test', 'published'],
      isPublished: true,
      publishedAt: new Date().toISOString()
    });
    console.log('Published article created with ID:', publishedArticle.id);
    
    // 3. Create a new unpublished (draft) article
    console.log('\n3. Creating a new DRAFT article...');
    const draftArticle = await Article.create({
      title: 'Test Draft Article',
      slug: 'test-draft-article',
      content: 'This is a test draft article to verify the fix.',
      excerpt: 'Test draft article',
      category: 'Test',
      author: 'Tester',
      tags: ['test', 'draft'],
      isPublished: false
    });
    console.log('Draft article created with ID:', draftArticle.id);
    
    // 4. Get all articles (should include both new articles)
    console.log('\n4. Getting all articles after creation...');
    const allArticles = await Article.find({});
    console.log(`Total articles after creation: ${allArticles.length}`);
    
    // Verify the count increased by 2
    if (allArticles.length === initialArticles.length + 2) {
      console.log('✅ SUCCESS: Both articles were successfully added to the collection');
    } else {
      console.log('❌ ERROR: Articles were not properly added to the collection');
    }
    
    // 5. Get only published articles
    console.log('\n5. Getting only PUBLISHED articles...');
    const publishedArticles = await Article.find({ isPublished: true });
    console.log(`Published articles count: ${publishedArticles.length}`);
    
    // 6. Get only unpublished articles
    console.log('\n6. Getting only DRAFT articles...');
    const draftArticles = await Article.find({ isPublished: false });
    console.log(`Draft articles count: ${draftArticles.length}`);
    
    // 7. Verify we can find articles by slug
    console.log('\n7. Testing article lookup by slug...');
    const articleBySlug = await Article.findOne({ slug: 'test-published-article' });
    
    if (articleBySlug) {
      console.log('✅ SUCCESS: Successfully found article by slug');
      console.log('  Title:', articleBySlug.title);
      console.log('  Published:', articleBySlug.isPublished ? 'Yes' : 'No');
    } else {
      console.log('❌ ERROR: Could not find article by slug');
    }
    
    // 8. Verify case-insensitive slug matching
    console.log('\n8. Testing case-insensitive slug matching...');
    const articleByMixedCaseSlug = await Article.findOne({ slug: 'Test-PUBLISHED-article' });
    
    if (articleByMixedCaseSlug) {
      console.log('✅ SUCCESS: Successfully found article with case-insensitive slug matching');
    } else {
      console.log('❌ ERROR: Case-insensitive slug matching failed');
    }
    
    // 9. Print a summary
    console.log('\n===== TEST SUMMARY =====');
    console.log('Initial articles:', initialArticles.length);
    console.log('Final articles:', allArticles.length);
    console.log('Published articles:', publishedArticles.length);
    console.log('Draft articles:', draftArticles.length);
    console.log('Slug lookup test:', articleBySlug ? 'Passed' : 'Failed');
    console.log('Case-insensitive slug test:', articleByMixedCaseSlug ? 'Passed' : 'Failed');
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testMockDatabaseFixes();
