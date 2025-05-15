import { Article } from "@/app/models/schema";

/**
 * Generate a URL-friendly slug from a string
 * @param text The text to convert into a slug
 * @returns A URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[\s\W-]+/g, '-') // Replace spaces, non-word chars and dashes with a single dash
    .replace(/^-+/, '') // Trim dashes from start
    .replace(/-+$/, ''); // Trim dashes from end
}

/**
 * Generate a unique slug based on the provided title
 * Checks if the slug already exists and appends a number if needed
 * @param title The title to convert to a slug
 * @returns A unique slug
 */
export async function generateSlug(title: string): Promise<string> {
  const baseSlug = slugify(title);
  
  // Check if this slug already exists
  const slugExists = await Article.findOne({ slug: baseSlug });
  
  // If no article with this slug exists, return the base slug
  if (!slugExists) {
    return baseSlug;
  }
  
  // Find articles with this slug pattern to determine the next number
  const slugRegex = new RegExp(`^${baseSlug}(-[0-9]+)?$`);
  const existingSlugs = await Article.find({ slug: slugRegex }, { slug: 1 }).sort({ slug: -1 });
  
  // If no articles found (which shouldn't happen), return with -1
  if (!existingSlugs.length) {
    return `${baseSlug}-1`;
  }
  
  // Find the highest number suffix
  let highestSuffix = 0;
  for (const article of existingSlugs) {
    const match = article.slug.match(new RegExp(`^${baseSlug}-([0-9]+)$`));
    if (match && match[1]) {
      const suffix = parseInt(match[1], 10);
      if (suffix > highestSuffix) {
        highestSuffix = suffix;
      }
    }
  }
  
  // Return slug with the next number
  return `${baseSlug}-${highestSuffix + 1}`;
}

/**
 * Format a date in a human-readable format
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format read time based on content length
 * @param content The content to calculate read time for
 * @returns Formatted read time string
 */
export function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  
  return `${readTime} min read`;
}

/**
 * Truncate text to a specified length and add ellipsis
 * @param text The text to truncate
 * @param length The maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, length: number): string {
  if (text.length <= length) {
    return text;
  }
  
  // Truncate to the specified length
  let truncated = text.substring(0, length);
  
  // Find the last space to avoid cutting words in half
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 0) {
    truncated = truncated.substring(0, lastSpace);
  }
  
  return `${truncated}...`;
}
