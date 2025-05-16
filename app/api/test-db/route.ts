import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    // Test connection to the database
    await connectToDatabase();
    
    return NextResponse.json({
      success: true,
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
