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
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { slug } = params;
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the article
    const article = await Article.findOne({ slug })
      .populate("author", "name image")
      .populate("category", "name slug");
    
    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }
    
    // Increment view count
    article.viewCount += 1;
    await article.save();
    
    return NextResponse.json(article);
  } catch (error) {
    console.error(`Error fetching article with slug ${params.slug}:`, error);
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
