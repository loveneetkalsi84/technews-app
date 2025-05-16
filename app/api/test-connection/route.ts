import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/mongodb";

// GET request handler
export async function GET(request: NextRequest) {
  try {
    // Test connection to the database
    await connectToDatabase();
    
    return NextResponse.json({
      success: true,
      method: "GET",
      message: "MongoDB connection successful",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("MongoDB connection test failed:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Database connection failed", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Test connection to the database
    await connectToDatabase();
    
    // Get the body if available
    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      // No body or invalid JSON
    }
    
    return NextResponse.json({
      success: true,
      method: "POST",
      message: "MongoDB connection successful",
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("MongoDB connection test failed:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Database connection failed", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
