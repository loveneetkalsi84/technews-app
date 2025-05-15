import { NextRequest, NextResponse } from "next/server";
import { saveRSSArticlesToDB } from "@/app/lib/scraping/rss-parser";
import { saveScrapedArticlesToDB } from "@/app/lib/scraping/web-scraper";
import connectToDatabase from "@/app/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Secret key for secure API triggering (should match environment variable)
const API_SECRET = process.env.CRON_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get("authorization");
    const requestSecret = authHeader?.split(" ")[1]; // "Bearer <secret>"
    
    // If not authorized by secret, check if admin user
    if (requestSecret !== API_SECRET) {
      const session = await getServerSession(authOptions);
      
      if (!session?.user || session.user.role !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Import from RSS feeds
    const rssResults = await saveRSSArticlesToDB();
    
    // Import from web scraping
    const scrapedResults = await saveScrapedArticlesToDB();
    
    return NextResponse.json({
      message: "Content import completed successfully",
      rssArticlesImported: rssResults.length,
      scrapedArticlesImported: scrapedResults.length,
    });
  } catch (error) {
    console.error("Error during scheduled content import:", error);
    return NextResponse.json(
      { error: "Failed to import content" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // POST method does the same as GET but allows for more parameters
  return GET(request);
}
