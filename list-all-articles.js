// Test script to fetch all articles directly from MongoDB
const mongoose = require('mongoose');

// Connection URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/technews';

// Define Article schema (simplified version)
const ArticleSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  isPublished: Boolean,
  // Other fields exist but not necessary for this test
}, { collection: 'articles' });

const Article = mongoose.model('Article', ArticleSchema);

async function getAllArticles() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    console.log('Fetching all articles...');
    const articles = await Article.find({});
    
    console.log(`Found ${articles.length} articles:`);
    
    if (articles.length === 0) {
      console.log('No articles found in the database');
    } else {
      // Print a summary of each article
      articles.forEach((article, i) => {
        console.log(`Article ${i+1}:`);
        console.log(`  ID: ${article._id}`);
        console.log(`  Title: ${article.title}`);
        console.log(`  Slug: ${article.slug}`);
        console.log(`  Published: ${article.isPublished ? 'Yes' : 'No'}`);
        console.log('--------------------------');
      });
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
getAllArticles();
