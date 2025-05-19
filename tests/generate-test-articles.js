"use strict";

const fs = require('fs');
const path = require('path');

/**
 * A utility script to generate test article data for verifying article functionality
 */

// Generate a random date within the last 30 days
function getRandomDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const randomDate = new Date(now);
  randomDate.setDate(now.getDate() - daysAgo);
  return randomDate.toISOString();
}

// Generate a random view count between 100 and 5000
function getRandomViewCount() {
  return Math.floor(Math.random() * 4900) + 100;
}

// Generate a random article
function generateArticle(id) {
  const categories = ['News', 'Reviews', 'Features', 'Tutorials'];
  const category = categories[Math.floor(Math.random() * categories.length)];
  
  const title = `Test Article ${id}: ${category} Article for Testing`;
  const slug = `test-article-${id}-${category.toLowerCase()}-for-testing`;
  
  return {
    title,
    slug,
    content: `
# ${title}

This is a test article generated for verifying the article functionality in the TechNews application.

## Section 1

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, vitae aliquam nisl nunc eu nunc. Sed vitae nisl eget nisl aliquam ultricies.

## Section 2

* Item 1
* Item 2
* Item 3

## Section 3

1. First point
2. Second point
3. Third point

[This is a link](https://example.com)

> This is a blockquote. It's often used to highlight important information.

\`\`\`javascript
// This is a code block
const greeting = "Hello, world!";
console.log(greeting);
\`\`\`

Thank you for reading this test article!
    `,
    excerpt: `This is a test article ${id} for verifying article functionality in the TechNews application.`,
    category,
    coverImage: `https://source.unsplash.com/random/1200x800?${category.toLowerCase()}`,
    tags: ['test', 'verification', category.toLowerCase()],
    status: Math.random() > 0.3 ? 'published' : 'draft',
    publishedAt: getRandomDate(),
    author: {
      name: "Test User",
      image: "https://randomuser.me/api/portraits/lego/1.jpg",
    },
    viewCount: getRandomViewCount(),
    metaDescription: `Meta description for test article ${id}`,
    metaKeywords: ['test', 'article', 'tech', 'news']
  };
}

// Generate a specified number of test articles
function generateTestArticles(count = 5) {
  const articles = [];
  for (let i = 1; i <= count; i++) {
    articles.push(generateArticle(i));
  }
  return articles;
}

// Save articles to a JSON file
function saveArticlesToFile(articles, filePath) {
  const data = JSON.stringify(articles, null, 2);
  fs.writeFileSync(filePath, data);
  console.log(`Successfully saved ${articles.length} test articles to ${filePath}`);
}

// Main execution
try {
  const numberOfArticles = process.argv[2] ? parseInt(process.argv[2]) : 5;
  const articles = generateTestArticles(numberOfArticles);
  
  // Create data directory if it doesn't exist
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Save to file
  const filePath = path.join(dataDir, 'test-articles.json');
  saveArticlesToFile(articles, filePath);
  
  console.log('Test articles generated successfully.');
  console.log('You can use these articles to test the article functionality in your application.');
} catch (error) {
  console.error('Error generating test articles:', error);
  process.exit(1);
}
