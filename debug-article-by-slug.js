"use strict";

/**
 * Find and Debug Article by Slug
 * 
 * This script helps diagnose issues with article retrieval by slug
 * by directly querying the MongoDB database.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Article schema to match your application
const ArticleSchema = new Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  content: { type: String, required: true },
  // ... other fields as needed
});

async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  const slug = args[0];
  
  if (!slug) {
    console.error('Error: Please provide an article slug as an argument');
    console.error('Usage: node debug-article-by-slug.js my-article-slug');
    process.exit(1);
  }
    try {
    // Get MongoDB URI from environment variables with a fallback for local development
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/technews';
    
    console.log(`Connecting to MongoDB at: ${MONGODB_URI.replace(/:[^:]*@/, ':****@')}`); // Hide password in logs
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      connectTimeoutMS: 10000, // 10 seconds timeout
    });
    
    console.log('Connected to MongoDB successfully!');
    
    // Create a model from the schema
    const Article = mongoose.model('Article', ArticleSchema);
    
    console.log(`Searching for article with slug: "${slug}"`);
    
    // Use different query methods to find the article
    console.log('\n1. Using findOne with exact match:');
    const exactMatch = await Article.findOne({ slug });
    console.log(exactMatch ? `Found: ${exactMatch.title} (${exactMatch.slug})` : 'No exact match found');
    
    console.log('\n2. Using findOne with $eq operator:');
    const eqMatch = await Article.findOne({ slug: { $eq: slug } });
    console.log(eqMatch ? `Found: ${eqMatch.title} (${eqMatch.slug})` : 'No $eq match found');
      console.log('\n3. Using findOne with case-sensitive RegExp:');
    const regexMatch = await Article.findOne({ slug: new RegExp(`^${slug}$`) });
    console.log(regexMatch ? `Found: ${regexMatch.title} (${regexMatch.slug})` : 'No case-sensitive RegExp match found');
    
    console.log('\n4. Using findOne with case-insensitive RegExp:');
    const caseInsensitiveMatch = await Article.findOne({ slug: new RegExp(`^${slug}$`, 'i') });
    console.log(caseInsensitiveMatch ? `Found: ${caseInsensitiveMatch.title} (${caseInsensitiveMatch.slug})` : 'No case-insensitive RegExp match found');
    
    console.log('\n5. Using find with similar slug pattern:');
    const similarMatches = await Article.find({ slug: new RegExp(slug, 'i') }, 'title slug');
    console.log(`Found ${similarMatches.length} articles with similar slugs:`);
    similarMatches.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title} (${article.slug})`);
    });
    
    console.log('\n6. Using find with no filter (listing all articles):');
    const allArticles = await Article.find({}, 'title slug');
    console.log(`Found ${allArticles.length} articles in total:`);
    allArticles.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title} (${article.slug})`);
    });
    
    // Close the MongoDB connection
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);
