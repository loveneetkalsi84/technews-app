// Test script to diagnose issues with article creation in mock database
// Using CommonJS require for compatibility
const { connectToDatabase } = require('./app/lib/mock-mongodb');

async function testArticleCreation() {
  try {
    console.log('Connecting to mock database...');
    const mongoose = await connectToDatabase();
    
    console.log('Creating a test article...');
    const Article = mongoose.model('Article');
    
    const testArticle = {
      title: 'Test Article Created Programmatically',
      slug: 'test-article-programmatic',
      content: 'This is a test article content created to diagnose issues with the mock database implementation.',
      excerpt: 'Test article excerpt',
      author: 'Test Author',
      category: 'Test Category',
      tags: ['test', 'article', 'debug'],
      isPublished: true,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Creating the article
    const createdArticle = await Article.create(testArticle);
    console.log('Article created successfully:', createdArticle);
    
    // Verify the article was saved by retrieving all articles
    console.log('Retrieving all articles from the database...');
    const allArticles = await Article.find({});
    console.log('Total articles in database:', allArticles.length);
    
    // Check if our test article exists
    const foundTestArticle = allArticles.find(article => article.slug === testArticle.slug);
    if (foundTestArticle) {
      console.log('Test article found in the database!');
      console.log('Test article details:', foundTestArticle);
    } else {
      console.error('ERROR: Test article was NOT found in the database after creation!');
      console.log('Available articles:', allArticles.map(a => ({ id: a.id, title: a.title, slug: a.slug })));
    }
    
    // Also test with a filter
    console.log('Testing article retrieval with filters...');
    const articlesWithFilter = await Article.find({ isPublished: true });
    console.log('Articles where isPublished=true:', articlesWithFilter.length);
    
    console.log('Test complete!');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testArticleCreation();
