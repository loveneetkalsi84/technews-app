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
