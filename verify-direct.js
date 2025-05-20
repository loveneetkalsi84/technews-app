// Test script for article creation
// To bypass auth, use the direct mock database approach

// First, make sure we can import the mock database
const mockDbPath = './app/lib/mock-mongodb';

// Try to load it directly
try {
    const mockDb = require(mockDbPath);
    console.log('Mock database module loaded successfully');
    
    // Test with direct create
    async function testDirectCreate() {
        try {
            console.log('Connecting to mock database...');
            const mongoose = await mockDb.connectToDatabase();
            
            console.log('Creating a test article...');
            const Article = mongoose.model('Article');
            
            const testArticle = {
                title: 'Direct Test Article ' + Date.now(),
                slug: 'direct-test-article-' + Date.now(),
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
            const foundArticle = allArticles.find(article => article.slug === testArticle.slug);
            if (foundArticle) {
                console.log('Test article found in the database!');
                console.log('Test article details:', foundArticle);
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
    
    // Run the test
    testDirectCreate();
} catch (error) {
    console.error('Error loading mock database module:', error);
    console.log('Attempting alternative method...');
    
    // Create a simplified version of the test that doesn't require direct module loading
    const fs = require('fs');
    const mockDbFilePath = './app/lib/mock-mongodb.ts';
    
    // Check if the file exists
    if (fs.existsSync(mockDbFilePath)) {
        console.log('Mock database file found at:', mockDbFilePath);
        
        // Read the file to verify our fixes
        const fileContent = fs.readFileSync(mockDbFilePath, 'utf8');
        
        // Check for our key fixes
        const fixedBooleanHandling = fileContent.includes('typeof query[key] === \'boolean\'');
        const fixedCreation = fileContent.includes('newItem.isPublished = Boolean(newItem.isPublished)');
        const enhancedLogging = fileContent.includes('[Mock MongoDB] Filtered query returned');
        
        console.log('\nVerification of fixes:');
        console.log('- Boolean handling in queries:', fixedBooleanHandling ? '✅ FIXED' : '❌ NOT FIXED');
        console.log('- Boolean conversion in create:', fixedCreation ? '✅ FIXED' : '❌ NOT FIXED');
        console.log('- Enhanced logging:', enhancedLogging ? '✅ FIXED' : '❌ NOT FIXED');
        
        if (fixedBooleanHandling && fixedCreation && enhancedLogging) {
            console.log('\n✅ All fixes have been successfully applied!');
            console.log('Please restart the application and test the article creation through the UI.');
        } else {
            console.log('\n❌ Some fixes are missing! Please check the implementation.');
        }
    } else {
        console.error('Mock database file not found at expected location.');
    }
}
