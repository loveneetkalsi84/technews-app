import Parser from 'rss-parser';
import { Article } from '@/app/models/schema';
import { generateSEOMetadata } from '@/app/lib/content-generation/openai';
import slugify from '@/app/utils/slugify';

// Define types for parsed item
interface CustomItem {
  title: string;
  link: string;
  content?: string;
  contentSnippet?: string;
  guid?: string;
  categories?: string[];
  isoDate?: string;
  creator?: string;
  'content:encoded'?: string;
  'dc:creator'?: string;
  pubDate?: string;
  author?: string;
}

interface CustomFeed {
  title: string;
  description: string;
  link: string;
}

// Create a new RSS parser
const parser: Parser<CustomFeed, CustomItem> = new Parser({
  customFields: {
    item: [
      'content',
      'content:encoded',
      'dc:creator',
    ],
  },
});

/**
 * Fetches articles from an RSS feed and processes them
 */
export async function fetchArticlesFromRSS(feedUrl: string, limit = 10) {
  try {
    const feed = await parser.parseURL(feedUrl);
    const sourceName = feed.title || new URL(feedUrl).hostname;
    
    // Take only the most recent articles up to the limit
    const recentItems = feed.items.slice(0, limit);
    
    // Process each item from the feed
    return Promise.all(recentItems.map(async item => {
      const content = item['content:encoded'] || item.content || item.contentSnippet || '';
      const title = item.title || '';
      const slug = slugify(title);
      const author = item['dc:creator'] || item.creator || item.author || 'Unknown Author';
      const publishedAt = item.isoDate ? new Date(item.isoDate) : 
                         item.pubDate ? new Date(item.pubDate) : 
                         new Date();
      
      // Check if article with this title or URL already exists
      const existingArticle = await Article.findOne({
        $or: [
          { slug },
          { sourceUrl: item.link }
        ]
      });
      
      if (existingArticle) {
        return null; // Skip if already exists
      }
      
      // Generate SEO metadata for the article
      const seoData = await generateSEOMetadata(title, content);
      
      // Extract an excerpt (first 150 characters)
      const excerpt = content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
      
      // Extract the first image from content if available
      const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
      const coverImage = imgMatch ? imgMatch[1] : '/images/default-article.jpg';
      
      // Create a new article object
      return {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        author,
        tags: item.categories || [],
        metaDescription: seoData.metaDescription,
        metaKeywords: seoData.keywords,
        seoScore: seoData.seoScore,
        isAIGenerated: false,
        isPublished: true,
        sourceType: 'rss',
        sourceUrl: item.link,
        publishedAt,
      };
    })).then(articles => articles.filter(Boolean)); // Filter out null values (skipped articles)
  } catch (error) {
    console.error(`Error fetching RSS feed from ${feedUrl}:`, error);
    return [];
  }
}

/**
 * Processes articles from all configured RSS feeds
 */
export async function processAllRSSFeeds() {
  const rssFeedUrls = process.env.RSS_FEED_SOURCES?.split(',') || [];
  
  if (rssFeedUrls.length === 0) {
    console.warn('No RSS feed URLs configured in environment variables.');
    return [];
  }
  
  const articlesFromAllFeeds = await Promise.all(
    rssFeedUrls.map(url => fetchArticlesFromRSS(url, 5))
  );
  
  // Flatten the array of arrays
  return articlesFromAllFeeds.flat();
}

/**
 * Saves fetched RSS articles to the database
 */
export async function saveRSSArticlesToDB() {
  const articles = await processAllRSSFeeds();
  
  if (articles.length === 0) {
    console.log('No new articles to save from RSS feeds.');
    return [];
  }
  
  try {
    const savedArticles = await Article.insertMany(articles, { ordered: false });
    console.log(`Successfully saved ${savedArticles.length} articles from RSS feeds.`);
    return savedArticles;
  } catch (error) {
    // Some articles might fail due to duplicate key errors, but some might succeed
    console.error('Error saving RSS articles to database:', error);
    return [];
  }
}

export default {
  fetchArticlesFromRSS,
  processAllRSSFeeds,
  saveRSSArticlesToDB
};
