import { NextRequest, NextResponse } from "next/server";
import { Article } from "@/app/models/schema";
import connectToDatabase from "@/app/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface Params {
  params: {
    slug: string;
  };
}

// GET single article by slug
export async function GET(request: NextRequest, { params }: Params) {  try {
    let { slug } = params;
    
    // Normalize the slug before searching (optional, but helps with consistency)
    const normalizedSlug = slug.toLowerCase().trim();
    
    // Only log and redirect if the slug is not normalized, but otherwise proceed with original slug
    // This maintains URLs with camelCase or special characters while enabling case-insensitive lookups
    if (normalizedSlug !== slug) {
      console.log(`API: Processing non-normalized slug: "${slug}" vs normalized: "${normalizedSlug}"`);
    }
    
    console.log(`API: Fetching article with slug: ${slug}`);
    
    // Connect to the database
    await connectToDatabase();// Find the article first with exact case match, then with case-insensitive if needed
    let article = await Article.findOne({ 
      slug: slug // Exact match first
    })
      .populate("author", "name image bio")
      .populate("category", "name slug");
      // If not found with exact match, try case-insensitive
    if (!article) {
      console.log(`API: Article not found with exact match, trying case-insensitive for: "${slug}"`);
      
      // Use a more robust regex pattern that ignores case and handles special characters
      const escapedSlug = slug.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      article = await Article.findOne({ 
        slug: new RegExp(`^${escapedSlug}$`, 'i') // Case-insensitive match with escaped special chars
      })
        .populate("author", "name image bio")
        .populate("category", "name slug");
    }
    
    console.log(`API: Article lookup result:`, article ? `Found: ${article.slug}` : "Not found");
      if (!article) {
      console.log(`API: Article with slug "${slug}" not found`);
      
      // For debugging, list all articles to see what's available
      if (process.env.NODE_ENV === 'development') {
        try {
          const allArticles = await Article.find({}, 'title slug');
          console.log(`API: Available articles (${allArticles.length} total):`);
          allArticles.slice(0, 10).forEach((a, i) => {
            console.log(`  ${i+1}. ${a.title} (${a.slug})`);
          });
          if (allArticles.length > 10) {
            console.log(`  ... and ${allArticles.length - 10} more`);
          }
        } catch (err) {
          console.error('Error listing articles:', err);
        }
      }
      
      return NextResponse.json(
        { error: "Article not found", slug: slug },
        { status: 404 }
      );
    }    // Double check that the slug matches exactly (case sensitive)
    if (article.slug !== slug) {
      console.log(`API: Slug case mismatch: requested "${slug}" but found "${article.slug}"`);
      console.log(`API: This is normal when URLs have different cases, returning article anyway`);
      // We're returning the article anyway since we want case-insensitive matching
      // But we log it for debugging purposes
    }
    
    // Increment view count
    article.viewCount += 1;
    await article.save();
    
    console.log(`API: Successfully returned article: ${article.title} (${article.slug})`);
    
    return NextResponse.json(article);  } catch (error) {
    console.error(`Error fetching article with slug ${params.slug}:`, error);
    
    // Check if this is a connection error or other serious error
    if (error instanceof Error) {
      console.log(`API: Error type: ${error.name}, message: ${error.message}`);
      
      // If this is a mock database and the error is related to finding articles
      if (process.env.USE_MOCK_DB === 'true' && error.message.includes('find')) {
        console.log(`API: Using mock DB, returning 404 for article not found error`);
        return NextResponse.json(
          { error: "Article not found", slug: params.slug },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

// PATCH update article
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { slug } = params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the article
    const article = await Article.findOne({ slug });
    
    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }
    
    // Check permissions (admin, editor, or the author)
    const isAdmin = session.user.role === "admin";
    const isEditor = session.user.role === "editor";
    const isAuthor = article.author.toString() === session.user.id;
    
    if (!isAdmin && !isEditor && !isAuthor) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }
    
    // Get update data
    const updates = await request.json();
    
    // If updating the publish status
    if (updates.isPublished === true && !article.isPublished) {
      updates.publishedAt = new Date();
    }
      // Apply updates with proper type handling
    Object.keys(updates).forEach((key) => {
      if (key in article) {
        // Type assertion to avoid index errors
        (article as any)[key] = updates[key];
      }
    });
    
    // Save changes
    await article.save();
    
    return NextResponse.json(article);
  } catch (error) {
    console.error(`Error updating article with slug ${params.slug}:`, error);
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

// DELETE article
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { slug } = params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the article
    const article = await Article.findOne({ slug });
    
    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }
    
    // Only admins or the article author can delete
    const isAdmin = session.user.role === "admin";
    const isAuthor = article.author.toString() === session.user.id;
    
    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }
    
    // Delete the article
    await Article.deleteOne({ slug });
    
    return NextResponse.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error(`Error deleting article with slug ${params.slug}:`, error);
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
