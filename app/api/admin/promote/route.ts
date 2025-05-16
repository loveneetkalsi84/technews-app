import { NextRequest, NextResponse } from "next/server";
import { User } from "@/app/models/schema";
import connectToDatabase from "@/app/lib/mongodb";
import { Types } from "mongoose";

// This endpoint updates a user's role to admin
// Should only be accessible by existing admins in a production environment
export async function PATCH(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { email, secretKey } = body;

    // Check if the secret key matches for basic security
    const setupKey = process.env.ADMIN_SETUP_KEY || "tech_news_admin_setup_123";
    
    if (secretKey !== setupKey) {
      return NextResponse.json(
        { error: "Invalid setup key" },
        { status: 401 }
      );
    }

    // Validate request data
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();
    
    // Find the user
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update the role to admin
    user.role = "admin";
    await user.save();

    // Convert MongoDB document to a plain JavaScript object
    const userObj = {
      id: user._id ? user._id.toString() : '',
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'admin'
    };

    return NextResponse.json(
      { 
        message: "User role updated to admin",
        user: userObj
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Role update error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the role" },
      { status: 500 }
    );
  }
}
