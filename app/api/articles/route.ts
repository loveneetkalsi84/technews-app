import { NextRequest, NextResponse } from "next/server";
import { Article } from "@/app/models/schema";
import connectToDatabase from "@/app/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET articles with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const authorId = searchParams.get("author");
    
    // Build the filter object
    const filter: any = { isPublished: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (tag) {
      filter.tags = tag;
    }
    
    if (authorId) {
      filter.author = authorId;
    }
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query with pagination
    const articles = await Article.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name image")
      .populate("category", "name slug");
    
    // Get total count for pagination
    const total = await Article.countDocuments(filter);
    
    return NextResponse.json({
      articles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

// POST new article (protected route)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Only admins and editors can create articles
    if (session.user.role !== "admin" && session.user.role !== "editor") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Parse request body
    const data = await request.json();
      // Validate required fields
    if (!data.title || !data.content || !data.slug) {
      return NextResponse.json(
        { error: "Title, content, and slug are required" },
        { status: 400 }
      );
    }
    
    // Set defaults for optional fields
    if (!data.excerpt) {
      data.excerpt = data.content.substring(0, 160) + (data.content.length > 160 ? '...' : '');
    }
    
    if (!data.coverImage) {
      data.coverImage = "https://via.placeholder.com/1200x630?text=" + encodeURIComponent(data.title);
    }    // Format the data properly before creating the article
    const formattedData = {
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt || data.content.substring(0, 160),
      coverImage: data.coverImage || `https://via.placeholder.com/1200x630?text=${encodeURIComponent(data.title)}`,
      author: session.user.id || "admin", // Fallback to "admin" if user ID is not available
      category: data.category || "News", // Default to News if not provided
      tags: Array.isArray(data.tags) ? data.tags : [],
      isPublished: Boolean(data.isPublished) || false,
      publishedAt: data.isPublished ? new Date() : null,
      viewCount: 0,
      sourceType: data.sourceType || 'manual',
      isAIGenerated: Boolean(data.isAIGenerated) || false,
      metaKeywords: Array.isArray(data.metaKeywords) ? data.metaKeywords : [],
      metaDescription: data.metaDescription || data.excerpt || data.content.substring(0, 160)
    };
    
    // Calculate SEO score
    const seoScore = calculateSeoScore(formattedData);
    
    // Create new article with formatted data
    const article = new Article({
      ...formattedData,
      seoScore
    });
    
    // Simple function to calculate SEO score
    function calculateSeoScore(article: Record<string, any>): number {
      let score = 0;
      
      // Check title length (ideal: 50-60 chars)
      if (article.title && article.title.length >= 40 && article.title.length <= 65) {
        score += 20;
      } else if (article.title && article.title.length >= 20) {
        score += 10;
      }
      
      // Check meta description (ideal: 150-160 chars)
      const metaDesc = article.metaDescription || article.excerpt || "";
      if (metaDesc.length >= 140 && metaDesc.length <= 160) {
        score += 20;
      } else if (metaDesc.length >= 100) {
        score += 10;
      }
      
      // Check content length (ideal: 700+ words, approx 4000+ chars)
      if (article.content && article.content.length > 4000) {
        score += 25;
      } else if (article.content && article.content.length > 1500) {
        score += 15;
      }
      
      // Check keywords/tags presence
      if (article.metaKeywords && article.metaKeywords.length >= 3) {
        score += 15;
      } else if (article.tags && article.tags.length >= 3) {
        score += 10;
      }
        // Check if slug contains keywords from title
      const titleWords = article.title.toLowerCase().split(' ');
      if (titleWords.some((word: string) => article.slug.toLowerCase().includes(word))) {
        score += 10;
      }
      
      // Check image presence
      if (article.coverImage && article.coverImage.length > 10) {
        score += 10;
      }
      
      return Math.min(100, score);
    }
      // Debug data before saving
    console.log("About to save article:", JSON.stringify(article.toObject(), null, 2));
    
    try {
      // Save to database
      await article.save();
        console.log("Article saved successfully");
      return NextResponse.json(article, { status: 201 });
    } catch (saveError: any) {
      console.error("Error in article.save():", saveError);
      
      // Check if it's a validation error
      if (saveError.name === "ValidationError" && saveError.errors) {
        const validationErrors = Object.keys(saveError.errors).map(
          key => `${key}: ${saveError.errors[key].message}`
        ).join(", ");
        
        return NextResponse.json(
          { error: "Validation error", details: validationErrors },
          { status: 400 }
        );
      }
      
      // Check if it's a duplicate key error
      if (saveError.code === 11000) {
        return NextResponse.json(
          { error: "Duplicate error", details: "An article with this slug already exists." },
          { status: 400 }
        );
      }
        throw saveError; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { 
        error: "Failed to create article", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
