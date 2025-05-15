import { NextRequest, NextResponse } from "next/server";
import { Article } from "@/app/models/schema";
import connectToDatabase from "@/app/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  generateArticleContent,
  generateSEOMetadata,
  checkForPlagiarism,
} from "@/app/lib/content-generation/openai";
import slugify from "@/app/utils/slugify";

// POST to generate a new article using AI
export async function POST(request: NextRequest) {
  try {
    // Check authentication and permissions
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    if (session.user.role !== "admin" && session.user.role !== "editor") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Get generation parameters
    const { topic, type, keywords, tone, wordCount, category, image } =
      await request.json();
    
    // Validate required parameters
    if (!topic || !type || !keywords) {
      return NextResponse.json(
        { error: "Missing required parameters: topic, type, or keywords" },
        { status: 400 }
      );
    }
    
    // Generate article content
    const content = await generateArticleContent({
      topic,
      type,
      keywords,
      tone,
      wordCount,
      includeHeadings: true,
    });
    
    // Check for plagiarism
    const plagiarismCheck = await checkForPlagiarism(content);
    
    if (plagiarismCheck.isPlagiarismSuspected) {
      return NextResponse.json(
        {
          error: "Generated content may contain plagiarism",
          originalityScore: plagiarismCheck.originalityScore,
          content,
        },
        { status: 400 }
      );
    }
    
    // Generate SEO metadata
    const seoData = await generateSEOMetadata(topic, content);
    
    // Create slug
    const slug = slugify(topic);
    
    // Extract excerpt
    const plainText = content.replace(/<[^>]*>/g, "");
    const excerpt = plainText.substring(0, 150) + "...";
    
    // Create article object (not saving yet)
    const article = {
      title: topic,
      slug,
      content,
      excerpt,
      coverImage: image || "/images/default-article.jpg",
      author: session.user.id,
      category,
      tags: keywords,
      metaDescription: seoData.metaDescription,
      metaKeywords: seoData.keywords,
      seoScore: seoData.seoScore,
      isAIGenerated: true,
      isPublished: false, // AI articles are not published by default
      sourceType: "ai",
    };
    
    return NextResponse.json({ article, message: "Content generated successfully" });
  } catch (error) {
    console.error("Error generating article content:", error);
    return NextResponse.json(
      { error: "Failed to generate article content" },
      { status: 500 }
    );
  }
}
