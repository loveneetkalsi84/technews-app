import { NextRequest, NextResponse } from "next/server";
import { User } from "@/app/models/schema";
import bcrypt from "bcrypt";
import connectToDatabase from "@/app/lib/mongodb";

// This endpoint should only be used for initial setup and then secured or removed
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { name, email, password, secretKey } = body;

    // Check if the secret key matches the one in the environment variables
    // This adds a basic layer of security to prevent unauthorized admin creation
    const setupKey = process.env.ADMIN_SETUP_KEY || "tech_news_admin_setup_123";
    
    if (secretKey !== setupKey) {
      return NextResponse.json(
        { error: "Invalid setup key" },
        { status: 401 }
      );
    }

    // Validate request data
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin", // Set role to admin
      emailVerified: new Date(),
      subscribed: false,
      notificationSettings: {
        email: true,
        push: true,
      },
    });

    // Return success without sending password
    const user = {
      id: (newUser._id as any).toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: (newUser as any).createdAt,
    };

    return NextResponse.json(
      { user, message: "Admin user created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Admin setup error:", error);
    return NextResponse.json(
      { error: "An error occurred during admin setup" },
      { status: 500 }
    );
  }
}
