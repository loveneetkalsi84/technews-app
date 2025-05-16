import { NextRequest, NextResponse } from "next/server";
import { Article } from "@/app/models/schema";
import connectToDatabase from "@/app/lib/mongodb";

// Test article creation via POST request
export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse request body
    const data = await request.json();
    
    // Create test article from request data
    const testArticle = new Article({
      title: data.title || "Test Article " + new Date().toISOString(),
      slug: data.slug || "test-article-" + Date.now(),
      content: data.content || "This is a test article created via API.",
      excerpt: data.excerpt || "Test excerpt",
      author: "admin",
      category: data.category || "News",
      tags: data.tags || [],
      isPublished: data.status === "published",
      publishedAt: data.status === "published" ? new Date() : null,
      viewCount: 0,
      sourceType: 'api-test',
      isAIGenerated: false
    });
    
    // Save to database
    const savedArticle = await testArticle.save();
    
    return NextResponse.json({
      success: true,
      message: "Test article created successfully via POST",
      article: savedArticle
    });
  } catch (error) {
    console.error("Test article creation failed:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to create test article", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Test article creation directly via GET for simple testing
export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Create a minimal test article
    const testArticle = new Article({
      title: "Test Article " + new Date().toISOString(),
      slug: "test-article-" + Date.now(),
      content: "This is a test article created directly via API test.",
      excerpt: "Test excerpt",
      author: "admin",
      category: "News",
      isPublished: false
    });
    
    // Save to database
    const savedArticle = await testArticle.save();
    
    return NextResponse.json({
      success: true,
      message: "Test article created successfully",
      article: savedArticle
    });
  } catch (error) {
    console.error("Test article creation failed:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to create test article", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
