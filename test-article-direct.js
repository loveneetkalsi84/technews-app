// Direct article creation test without requiring the Next.js server
// This test directly uses mongoose to test article creation

require('dotenv').config();
const mongoose = require('mongoose');

// Define Article schema directly for testing
const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  coverImage: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { type: String, default: 'News' },
  tags: [{ type: String }],
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  viewCount: { type: Number, default: 0 },
  sourceType: { type: String },
  isAIGenerated: { type: Boolean, default: false },
  metaDescription: { type: String },
  metaKeywords: [{ type: String }],
  seoScore: { type: Number }
});

// Connect to the database
async function testDatabaseConnection() {
  console.log('Connecting to MongoDB...');
  
  try {
    // Get connection string from environment or use default
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/technews';
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    return false;
  }
}

// Test article creation
async function testArticleCreation() {
  // First, check database connection
  const isConnected = await testDatabaseConnection();
  if (!isConnected) {
    console.log('Skipping article creation test due to connection failure');
    return;
  }
  
  // Create Article model
  const Article = mongoose.model('Article', ArticleSchema);
  
  // Create test article data
  const testArticleData = {
    title: "Direct Test Article " + new Date().toISOString().substring(0, 19),
    slug: "direct-test-article-" + Date.now(),
    content: "This is a test article created with direct MongoDB access for troubleshooting.",
    excerpt: "Test article excerpt for direct creation",
    category: "News",
    tags: ["test", "direct", "troubleshooting"],
    isPublished: false,
    viewCount: 0,
    sourceType: 'direct-test',
    isAIGenerated: false
  };
  
  try {
    console.log('Creating test article...');
    const article = new Article(testArticleData);
    
    // Save to database
    const savedArticle = await article.save();
    console.log('✅ Test article created successfully!');
    console.log('Article ID:', savedArticle._id);
    console.log('Article Title:', savedArticle.title);
    console.log('Article Slug:', savedArticle.slug);
  } catch (error) {
    console.error('❌ Failed to create test article:', error);
  }
  
  // Close the database connection
  await mongoose.connection.close();
  console.log('Database connection closed');
}

// Run the test
testArticleCreation();
