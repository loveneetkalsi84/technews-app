// Direct MongoDB article creation script
const mongoose = require('mongoose');

// Connection URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/technews';

// Connect to MongoDB
async function createArticleDirectly() {
  try {
    console.log('Connecting to MongoDB...');
    console.log(`Using connection string: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Define a simplified version of the Article schema
    const ArticleSchema = new mongoose.Schema({
      title: { type: String, required: true },
      slug: { type: String, required: true },
      content: { type: String, required: true },
      excerpt: { type: String, default: "" },
      coverImage: { type: String, default: "https://via.placeholder.com/1200x630?text=Direct+MongoDB" },
      author: { type: String, default: "admin" },
      category: { type: String, default: "News" },
      tags: [{ type: String }],
      metaDescription: { type: String },
      metaKeywords: [{ type: String }],
      seoScore: { type: Number, default: 0 },
      isAIGenerated: { type: Boolean, default: false },
      isPublished: { type: Boolean, default: true },
      viewCount: { type: Number, default: 0 },
      sourceType: { type: String, enum: ['ai', 'rss', 'manual', 'scraped'], default: 'manual' },
      publishedAt: { type: Date, default: Date.now },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }, { collection: 'articles' });
    
    // Create the model
    const Article = mongoose.models.Article || mongoose.model('Article', ArticleSchema);
    
    // Create a unique timestamp for the slug
    const timestamp = Date.now();
    
    // Create the article
    const article = new Article({
      title: `Direct MongoDB Article ${timestamp}`,
      slug: `direct-mongodb-article-${timestamp}`,
      content: "This article was created directly through MongoDB connection, bypassing the API.",
      excerpt: "A direct MongoDB article",
      author: "admin",
      category: "News",
      tags: ["mongodb", "direct", "test"],
      isPublished: true,
      publishedAt: new Date(),
      sourceType: "manual"
    });
    
    // Save the article
    const savedArticle = await article.save();
    console.log('✅ Article created successfully:');
    console.log(`  Title: ${savedArticle.title}`);
    console.log(`  ID: ${savedArticle._id}`);
    console.log(`  Published: ${savedArticle.isPublished ? 'Yes' : 'No'}`);
    
    // Now try to retrieve the article
    console.log('\nRetrieving all articles...');
    const allArticles = await Article.find({});
    console.log(`Found ${allArticles.length} articles:`);
    
    if (allArticles.length > 0) {
      allArticles.forEach((article, i) => {
        console.log(`\nArticle ${i+1}:`);
        console.log(`  ID: ${article._id}`);
        console.log(`  Title: ${article.title}`);
        console.log(`  Slug: ${article.slug}`);
        console.log(`  Published: ${article.isPublished ? 'Yes' : 'No'}`);
        console.log(`  Created: ${article.createdAt}`);
      });
    } else {
      console.log('No articles found ❌');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the function
createArticleDirectly();
