import puppeteer from 'puppeteer';
import { Article } from '@/app/models/schema';
import slugify from '@/app/utils/slugify';
import { generateSEOMetadata } from '@/app/lib/content-generation/openai';

// Define interfaces for the scrapers
interface SiteScraper {
  name: string;
  url: string;
  articleSelector: string;
  titleSelector: string;
  contentSelector: string;
  authorSelector: string;
  imageSelector: string;
}

interface ArticleLink {
  link: string | null;
  title: string | null;
}

interface ScrapedArticleData {
  content: string;
  author: string;
  imageUrl: string | null;
}

interface SEOData {
  metaDescription: string;
  keywords: string[];
  seoScore: number;
}

// Define the sites we want to scrape
const TECH_SITES: SiteScraper[] = [
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/',
    articleSelector: 'article',
    titleSelector: 'h2 a',
    contentSelector: '.article-content',
    authorSelector: '.byline a',
    imageSelector: 'img.wp-post-image',
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/',
    articleSelector: '.duet--content-cards--content-card',
    titleSelector: 'h2',
    contentSelector: '.duet--article--article-body-component',
    authorSelector: '.duet--byline--byline-authors',
    imageSelector: 'img',
  },
  // Add more sites as needed
];

/**
 * Scrapes a specific tech site based on the provided configuration
 */
export async function scrapeTechSite(site: SiteScraper, maxArticles = 5) {
  console.log(`Starting scraping for ${site.name}...`);
    const browser = await puppeteer.launch({
    headless: true, // Using boolean instead of 'new' for compatibility
    args: ['--disable-setuid-sandbox', '--no-sandbox'],
  });
  
  try {
    const page = await browser.newPage();
    
    // Set timeout to 30 seconds
    page.setDefaultNavigationTimeout(30000);
    
    // Navigate to the site
    await page.goto(site.url, { waitUntil: 'networkidle2' });    // Get article links
    const articleLinks: ArticleLink[] = await page.evaluate((articleSelector, titleSelector) => {
      const articles = Array.from(document.querySelectorAll(articleSelector));
      return articles.slice(0, 10).map(article => {
        const titleElement = article.querySelector(titleSelector) as HTMLElement | null;
        let link: string | null = null;
        
        if (titleElement && titleElement.tagName === 'A') {
          link = (titleElement as HTMLAnchorElement).getAttribute('href');
        } else {
          const anchor = article.querySelector('a') as HTMLAnchorElement | null;
          link = anchor ? anchor.getAttribute('href') : null;
        }
        
        const title = titleElement ? titleElement.textContent?.trim() || null : null;
        return { link, title };
      });
    }, site.articleSelector, site.titleSelector);
    
    const results = [];
    
    // Visit each article link to scrape full content
    for (let i = 0; i < Math.min(articleLinks.length, maxArticles); i++) {
      const article = articleLinks[i];
      
      if (!article.link || !article.title) continue;
      
      // Make sure the link is a full URL
      const url = article.link.startsWith('http') 
        ? article.link 
        : new URL(article.link, site.url).href;
      
      // Check if we already have this article
      const slug = slugify(article.title);
      const existingArticle = await Article.findOne({
        $or: [
          { slug },
          { sourceUrl: url }
        ]
      });
      
      if (existingArticle) continue;
      
      try {
        await page.goto(url, { waitUntil: 'networkidle2' });
          // Extract article details
        const articleData: ScrapedArticleData = await page.evaluate((selectors) => {
          // Get main content
          const contentElement = document.querySelector(selectors.contentSelector);
          const content = contentElement ? contentElement.innerHTML : '';
          
          // Get author
          const authorElement = document.querySelector(selectors.authorSelector);
          const author = authorElement ? (authorElement.textContent?.trim() || 'Unknown Author') : 'Unknown Author';
          
          // Get main image
          const imageElement = document.querySelector(selectors.imageSelector) as HTMLImageElement | null;
          const imageUrl = imageElement ? imageElement.getAttribute('src') : null;
          
          return { content, author, imageUrl };
        }, {
          contentSelector: site.contentSelector,
          authorSelector: site.authorSelector,
          imageSelector: site.imageSelector
        });
        
        if (articleData.content) {
          // Extract an excerpt
          const plainText = articleData.content.replace(/<[^>]*>/g, '');
          const excerpt = plainText.substring(0, 150) + '...';
            // Generate SEO metadata
          const seoData: SEOData = await generateSEOMetadata(article.title || '', plainText);
          
          results.push({
            title: article.title,
            slug,
            content: articleData.content,
            excerpt,
            coverImage: articleData.imageUrl || '/images/default-article.jpg',
            author: articleData.author,
            metaDescription: seoData.metaDescription,
            metaKeywords: seoData.keywords,
            seoScore: seoData.seoScore,
            isAIGenerated: false,
            isPublished: true,
            sourceType: 'scraped',
            sourceUrl: url,
            publishedAt: new Date(),
          });
        }
      } catch (articleError) {
        console.error(`Error scraping article at ${url}:`, articleError);
        // Continue with next article
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error scraping ${site.name}:`, error);
    return [];
  } finally {
    await browser.close();
  }
}

/**
 * Scrapes all configured tech sites
 */
export async function scrapeAllTechSites(maxArticlesPerSite = 3) {
  const articlesFromAllSites = await Promise.all(
    TECH_SITES.map(site => scrapeTechSite(site, maxArticlesPerSite))
  );
  
  return articlesFromAllSites.flat();
}

/**
 * Saves scraped articles to the database
 */
export async function saveScrapedArticlesToDB() {
  const articles = await scrapeAllTechSites();
  
  if (articles.length === 0) {
    console.log('No new articles to save from web scraping.');
    return [];
  }
  
  try {
    const savedArticles = await Article.insertMany(articles, { ordered: false });
    console.log(`Successfully saved ${savedArticles.length} articles from web scraping.`);
    return savedArticles;
  } catch (error) {
    console.error('Error saving scraped articles to database:', error);
    return [];
  }
}

export default {
  scrapeTechSite,
  scrapeAllTechSites,
  saveScrapedArticlesToDB
};
