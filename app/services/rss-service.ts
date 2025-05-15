import Parser from "rss-parser";
import connectToDatabase from "@/app/lib/mongodb";
import { Article, Source } from "@/app/models/schema";
import { generateSlug } from "@/app/utils/helpers";

// Type for our RSS parser
type CustomFeed = {
  title: string;
  description: string;
  link: string;
  image: {
    url: string;
  };
};

type CustomItem = {
  title: string;
  link: string;
  content: string;
  contentSnippet: string;
  creator: string;
  isoDate: string;
  categories: string[];
  enclosure?: {
    url: string;
    type: string;
  };
  "media:content"?: {
    $: {
      url: string;
      type: string;
    };
  };
  "content:encoded"?: string;
};

// Create a custom parser with our types
const parser: Parser<CustomFeed, CustomItem> = new Parser({
  customFields: {
    item: [
      "creator",
      "content",
      "contentSnippet",
      "enclosure",
      "media:content",
      "content:encoded",
      "categories",
    ],
  },
});

// Function to fetch RSS feeds from sources
export async function fetchRssFeeds() {
  try {
    await connectToDatabase();
    
    // Get all active RSS sources from the database
    const sources = await Source.find({ type: "rss", isActive: true });
    
    if (!sources.length) {
      console.log("No active RSS sources found");
      return { success: true, message: "No active RSS sources found" };
    }
    
    console.log(`Found ${sources.length} active RSS sources`);
    
    let totalNewArticles = 0;
    let totalUpdatedArticles = 0;
    
    // Process each source
    for (const source of sources) {
      try {
        console.log(`Fetching RSS feed from ${source.name}: ${source.url}`);
        
        // Fetch the RSS feed
        const feed = await parser.parseURL(source.url);
        
        console.log(`Found ${feed.items.length} items in feed from ${source.name}`);
        
        // Process each item in the feed
        for (const item of feed.items) {
          // Extract image URL if available
          let imageUrl = "";
          
          // Check different possible locations for the image
          if (item.enclosure && item.enclosure.type?.startsWith("image/")) {
            imageUrl = item.enclosure.url;
          } else if (item["media:content"] && item["media:content"].$?.type?.startsWith("image/")) {
            imageUrl = item["media:content"].$.url;
          } else {
            // Try to extract an image from the content if available
            const contentToSearch = item["content:encoded"] || item.content || "";
            const imgMatch = contentToSearch.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch && imgMatch[1]) {
              imageUrl = imgMatch[1];
            }
          }
          
          // Prepare the article data
          const articleData = {
            title: item.title,
            slug: await generateSlug(item.title),
            content: item["content:encoded"] || item.content || "",
            excerpt: item.contentSnippet?.substring(0, 300) || "",
            coverImage: imageUrl,
            source: source._id,
            sourceUrl: item.link,
            publishedAt: new Date(item.isoDate),
            author: {
              name: item.creator || source.name,
            },
            tags: item.categories || [],
            isPublished: true,
          };
          
          // Check if article already exists by source URL
          const existingArticle = await Article.findOne({ sourceUrl: item.link });
          
          if (existingArticle) {
            // Update the existing article
            await Article.updateOne(
              { _id: existingArticle._id },
              { 
                $set: {
                  content: articleData.content,
                  excerpt: articleData.excerpt,
                  coverImage: existingArticle.coverImage || articleData.coverImage,
                  tags: articleData.tags,
                  updatedAt: new Date(),
                }
              }
            );
            
            totalUpdatedArticles++;
          } else {
            // Create a new article
            await Article.create(articleData);
            totalNewArticles++;
          }
        }
        
        // Update the lastFetched date on the source
        await Source.updateOne(
          { _id: source._id },
          { $set: { lastFetched: new Date() } }
        );
        
      } catch (err) {
        console.error(`Error processing source ${source.name}:`, err);
        
        // Update the source with error information
        await Source.updateOne(
          { _id: source._id },
          { 
            $set: { 
              lastFetched: new Date(),
              lastError: `${err}`,
              lastErrorDate: new Date()
            } 
          }
        );
      }
    }
    
    return {
      success: true,
      message: `RSS feeds fetched successfully. Added ${totalNewArticles} new articles and updated ${totalUpdatedArticles} existing articles.`
    };
    
  } catch (err) {
    console.error("Failed to fetch RSS feeds:", err);
    return { success: false, message: `Failed to fetch RSS feeds: ${err}` };
  }
}
