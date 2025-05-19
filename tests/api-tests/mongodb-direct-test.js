// Simple MongoDB test script
const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb://localhost:27017';
const dbName = 'technews';

async function main() {
  // Create a new MongoClient
  const client = new MongoClient(url);

  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected successfully to MongoDB server');

    // Get the database
    const db = client.db(dbName);
    
    // List all collections in the database
    const collections = await db.listCollections().toArray();
    console.log('Collections in the database:');
    for (const collection of collections) {
      console.log(`- ${collection.name}`);
    }
    
    // Check if articles collection exists
    const articlesCollection = collections.find(c => c.name === 'articles');
    
    if (articlesCollection) {
      // Get the articles collection
      const articles = db.collection('articles');
      
      // Find all articles
      const allArticles = await articles.find({}).toArray();
      
      console.log(`\nFound ${allArticles.length} articles in the 'articles' collection:`);
      
      if (allArticles.length > 0) {
        // Print first 5 articles
        const limit = Math.min(5, allArticles.length);
        for (let i = 0; i < limit; i++) {
          const article = allArticles[i];
          console.log(`\nArticle ${i+1}:`);
          console.log(`  ID: ${article._id}`);
          console.log(`  Title: ${article.title}`);
          console.log(`  Slug: ${article.slug}`);
          console.log(`  Published: ${article.isPublished ? 'Yes' : 'No'}`);
        }
        
        if (allArticles.length > 5) {
          console.log(`\n(${allArticles.length - 5} more articles not shown)`);
        }
      } else {
        console.log('No articles found in the collection');
      }
    } else {
      console.log('\nThe "articles" collection does not exist yet');
    }
    
  } catch (err) {
    console.error('An error occurred:', err);
  } finally {
    // Close the connection
    await client.close();
    console.log('Connection closed');
  }
}

main().catch(console.error);
