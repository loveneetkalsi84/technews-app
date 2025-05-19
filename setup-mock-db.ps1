# Create a mock DB implementation for development
# This script will modify the MongoDB connection to use in-memory mock data

$ErrorActionPreference = "Stop"

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host " Setting up TechNews with mock database" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Path to the mock database implementation file
$mockDbPath = "c:\xampp\htdocs\TechNews\technews-app\app\lib\mock-mongodb.ts"

# Create the mock database file
@"
// This is a mock implementation of MongoDB connections for development
// It allows the application to run without an actual MongoDB connection

import mongoose from 'mongoose';

// Mock in-memory database collections
const mockCollections = {
  users: [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "admin",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      registeredAt: new Date(Date.now() - 90 * 86400000).toISOString(),
      lastActive: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "editor",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      registeredAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      lastActive: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "user",
      image: "https://randomuser.me/api/portraits/men/86.jpg",
      registeredAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      lastActive: new Date(Date.now() - 10 * 86400000).toISOString(),
    }
  ],
  articles: [
    {
      id: "1",
      title: "Getting Started with Next.js",
      slug: "getting-started-with-nextjs",
      content: "Next.js is a great framework for building React applications...",
      excerpt: "Learn the basics of Next.js and start building amazing applications",
      category: "Development",
      tags: ["react", "nextjs", "javascript"],
      isPublished: true,
      viewCount: 1250,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: "2",
      title: "The Future of Web Development",
      slug: "future-of-web-development",
      content: "Web development is evolving rapidly with new frameworks and tools...",
      excerpt: "Explore the trends that will shape the future of web development",
      category: "Technology",
      tags: ["web", "trends", "future"],
      isPublished: true,
      viewCount: 980,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
    }
  ]
};

// Mock mongoose implementation
const mockMongoose = {
  connect: async () => {
    console.log('[Mock MongoDB] Connected successfully to mock database');
    return mockMongoose;
  },
  disconnect: async () => {
    console.log('[Mock MongoDB] Disconnected from mock database');
  },
  connection: {
    readyState: 1 // 1 = connected
  },
  model: (modelName: string) => {
    return {
      find: async () => mockCollections[modelName.toLowerCase()] || [],
      findOne: async (query: any) => {
        const collection = mockCollections[modelName.toLowerCase()] || [];
        return collection.find(item => 
          Object.keys(query).every(key => item[key] === query[key])
        ) || null;
      },
      create: async (data: any) => {
        console.log(\`[Mock MongoDB] Creating \${modelName}:\`, data);
        return { ...data, id: Date.now().toString() };
      },
      // Add more methods as needed
    };
  }
};

// Export a function that mimics the real connectToDatabase function
export async function connectToDatabase(): Promise<typeof mongoose> {
  console.log('[Mock MongoDB] Using mock database implementation');
  return mockMongoose as unknown as typeof mongoose;
}

export async function disconnectFromDatabase(): Promise<void> {
  console.log('[Mock MongoDB] Disconnected from mock database');
  return;
}
"@ | Set-Content $mockDbPath

Write-Host "Created mock database implementation" -ForegroundColor Green

# Create a modified version of the mongodb.ts file that uses the mock implementation
$mockWrapperPath = "c:\xampp\htdocs\TechNews\technews-app\app\lib\mongodb.ts.new"

@"
// This file has been modified to use mock data in development mode
// You can switch back to the real MongoDB connection by removing the .new extension

import { connectToDatabase as mockConnectToDatabase, disconnectFromDatabase as mockDisconnectFromDatabase } from './mock-mongodb';
import mongoose from 'mongoose';

// Get MongoDB URI from environment variables with a fallback for local development
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/technews';

// Initialize cached connection (for real MongoDB)
let cached: any = global.mongoose || { conn: null, promise: null };
if (!global.mongoose) {
  global.mongoose = cached;
}

// Use mock database in development mode
const USE_MOCK_DB = true;

/**
 * Connect to database and return the mongoose instance
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // Use mock database in development mode
  if (USE_MOCK_DB) {
    return mockConnectToDatabase();
  }
  
  // Real MongoDB connection logic
  if (cached.conn) {
    return cached.conn;
  }
  
  if (!cached.promise) {
    const opts = {
      connectTimeoutMS: 10000,
      serverApi: {
        version: '1' as const,
        strict: true,
        deprecationErrors: true,
      }
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

/**
 * Disconnects from database
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (USE_MOCK_DB) {
    return mockDisconnectFromDatabase();
  }
  
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}
"@ | Set-Content $mockWrapperPath

# Back up the original mongodb.ts if it hasn't been backed up yet
$originalPath = "c:\xampp\htdocs\TechNews\technews-app\app\lib\mongodb.ts"
$backupPath = "c:\xampp\htdocs\TechNews\technews-app\app\lib\mongodb.ts.original"

if (!(Test-Path $backupPath) -and (Test-Path $originalPath)) {
    Copy-Item $originalPath $backupPath
    Write-Host "Backed up original mongodb.ts to mongodb.ts.original" -ForegroundColor Yellow
}

# Replace the mongodb.ts file with our modified version
if (Test-Path $mockWrapperPath) {
    Copy-Item $mockWrapperPath $originalPath -Force
    Write-Host "Replaced mongodb.ts with mock implementation" -ForegroundColor Green
}

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host " Mock database setup complete!" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "You can now start your Next.js application with mock data:" -ForegroundColor Yellow
Write-Host "cd c:\xampp\htdocs\TechNews\technews-app && .\start-dev-server.ps1" -ForegroundColor Yellow
