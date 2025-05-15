import { Article, Category } from "@/app/models/schema";
import connectToDatabase from "@/app/lib/mongodb";
import { MetadataRoute } from "next";

// Define the base URL for your site
const baseUrl = process.env.SITE_URL || "https://technews.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Connect to database
  await connectToDatabase();
  
  // Initialize sitemap array with static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
  
  // Fetch dynamic article pages
  try {
    // Get all published articles
    const articles = await Article.find({ isPublished: true })
      .select("slug publishedAt updatedAt")
      .sort({ publishedAt: -1 });
    
    const articlePages = articles.map((article) => ({
      url: `${baseUrl}/articles/${article.slug}`,
      lastModified: article.updatedAt || article.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
    
    // Get all categories
    const categories = await Category.find().select("slug updatedAt");
    
    const categoryPages = categories.map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: category.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
      // Combine all pages - removed tags as they're not in the schema yet
    return [...staticPages, ...articlePages, ...categoryPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return just static pages if there was an error fetching dynamic pages
    return staticPages;
  }
}
