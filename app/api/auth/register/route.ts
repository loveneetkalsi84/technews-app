import { NextRequest, NextResponse } from "next/server";
import { User } from "@/app/models/schema";
import bcrypt from "bcrypt";
import connectToDatabase from "@/app/lib/mongodb";

// Create a handler function for registration
async function registerHandler(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { name, email, password } = body;

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

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
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
      { user, message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );  }
}

// Export the handler functions for Next.js App Router
export { registerHandler as POST };
