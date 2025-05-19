"use strict";

/**
 * Fix Article Slugs
 * 
 * This script finds and fixes issues with article slugs in the database:
 * 1. Normalizes all slugs to ensure they match the expected format
 * 2. Identifies and fixes any duplicates
 * 3. Ensures case consistency
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define a function to normalize a slug
function normalizeSlug(slug) {
  if (!slug) return '';
  
  return slug
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')    // Remove non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '');    // Remove leading/trailing hyphens
}

// Define the Article schema to match your application
const ArticleSchema = new Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  content: { type: String, required: true },
  excerpt: { type: String, default: "" },
  coverImage: { type: String, default: "" },
  author: { type: Schema.Types.Mixed, ref: 'User' },
  category: { type: Schema.Types.Mixed, ref: 'Category' },
  tags: [{ type: String }],
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  viewCount: { type: Number, default: 0 },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
});

async function main() {
  try {
    // Get MongoDB URI from environment variables with a fallback for local development
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/technews';
    
    console.log(`Connecting to MongoDB at: ${MONGODB_URI.replace(/:[^:]*@/, ':****@')}`);
    
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
    
    // Step 1: Get all articles
    console.log('\nFetching all articles...');
    const articles = await Article.find({}, 'title slug');
    console.log(`Found ${articles.length} articles in total.`);
    
    // Step 2: Check for and fix issues
    let fixedCount = 0;
    let duplicateCount = 0;
    let skipCount = 0;
    
    // First, collect all existing slugs to check for duplicates
    const existingSlugs = new Set();
    const slugCounts = {};
    
    articles.forEach(article => {
      const slug = article.slug.toLowerCase();
      existingSlugs.add(slug);
      slugCounts[slug] = (slugCounts[slug] || 0) + 1;
    });
    
    // Find duplicates
    const duplicateSlugs = Object.entries(slugCounts)
      .filter(([_, count]) => count > 1)
      .map(([slug]) => slug);
      
    if (duplicateSlugs.length > 0) {
      console.log(`\n⚠️ Found ${duplicateSlugs.length} duplicate slugs:`);
      duplicateSlugs.forEach(slug => console.log(`  - "${slug}" (${slugCounts[slug]} occurrences)`));
    } else {
      console.log('\n✅ No duplicate slugs found.');
    }
    
    // Step 3: Process each article
    console.log('\nProcessing articles...');
    
    for (const article of articles) {
      const originalSlug = article.slug;
      const normalizedSlug = normalizeSlug(originalSlug);
      
      // Check if normalization needed
      if (originalSlug !== normalizedSlug) {
        console.log(`\nFixing article "${article.title}":`);
        console.log(`  Original slug: "${originalSlug}"`);
        console.log(`  Normalized slug: "${normalizedSlug}"`);
        
        try {
          // Update the slug
          await Article.updateOne(
            { _id: article._id },
            { $set: { slug: normalizedSlug } }
          );
          
          console.log('  ✅ Slug normalized successfully.');
          fixedCount++;
        } catch (error) {
          console.error(`  ❌ Error updating slug: ${error.message}`);
          skipCount++;
        }
      }
      
      // Check for duplicates (only if this is a duplicate slug)
      if (duplicateSlugs.includes(originalSlug.toLowerCase())) {
        const baseSlug = normalizeSlug(originalSlug);
        let newSlug = baseSlug;
        let counter = 1;
        
        // Find a unique slug by adding a counter
        while (existingSlugs.has(newSlug.toLowerCase())) {
          newSlug = `${baseSlug}-${counter}`;
          counter++;
        }
        
        if (newSlug !== originalSlug) {
          console.log(`\nFixing duplicate article "${article.title}":`);
          console.log(`  Original slug: "${originalSlug}"`);
          console.log(`  New unique slug: "${newSlug}"`);
          
          try {
            // Update with the unique slug
            await Article.updateOne(
              { _id: article._id },
              { $set: { slug: newSlug } }
            );
            
            // Add the new slug to our set
            existingSlugs.add(newSlug.toLowerCase());
            
            console.log('  ✅ Duplicate resolved successfully.');
            duplicateCount++;
          } catch (error) {
            console.error(`  ❌ Error fixing duplicate: ${error.message}`);
            skipCount++;
          }
        }
      }
    }
    
    // Step 4: Summary
    console.log('\n🔄 Slug Normalization Summary:');
    console.log(`  • Articles processed: ${articles.length}`);
    console.log(`  • Slugs normalized: ${fixedCount}`);
    console.log(`  • Duplicates resolved: ${duplicateCount}`);
    console.log(`  • Articles skipped due to errors: ${skipCount}`);
    
    if (fixedCount === 0 && duplicateCount === 0) {
      console.log('\n✅ All slugs are already in the correct format!');
    } else {
      console.log(`\n✅ Fixed ${fixedCount + duplicateCount} article slugs successfully!`);
    }
    
    // Close the MongoDB connection
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);
