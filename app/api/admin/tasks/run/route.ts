import { NextRequest, NextResponse } from "next/server";
import { runScheduledTasks } from "@/app/services/task-scheduler";
import { fetchRssFeeds } from "@/app/services/rss-service";
import { scrapeProductData } from "@/app/services/scraping-service";
import { generateContent } from "@/app/services/ai-content-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    // Check if the user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access. Admin privileges required." },
        { status: 403 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { task, params } = body;

    let result;

    // Run the requested task
    switch (task) {
      case "run-all":
        result = await runScheduledTasks();
        break;
      case "fetch-rss":
        result = await fetchRssFeeds();
        break;
      case "scrape-products":
        result = await scrapeProductData();
        break;
      case "generate-content":
        if (!params) {
          return NextResponse.json(
            { error: "Missing parameters for content generation" },
            { status: 400 }
          );
        }
        result = await generateContent(params);
        break;
      default:
        return NextResponse.json(
          { error: "Unknown task type" },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error running task:", error);
    return NextResponse.json(
      { error: `Failed to run task: ${error.message}` },
      { status: 500 }
    );
  }
}

// Rate limit this API to prevent abuse
export const config = {
  runtime: 'edge',
  regions: ['iad1'], // Use the edge runtime in the specified regions
}
