// This file has been modified to use mock data in development mode
// You can switch between real and mock database using enable-mock-db.ps1 and disable-mock-db.ps1 scripts

import { connectToDatabase as mockConnectToDatabase, disconnectFromDatabase as mockDisconnectFromDatabase } from './mock-mongodb';
import mongoose from 'mongoose';

// Get MongoDB URI from environment variables with a fallback for local development
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/technews';

// Initialize cached connection (for real MongoDB)
// Ensure global.mongoose exists and is initialized properly
declare global {
  var mongoose: { conn: any; promise: any } | undefined;
}

// Use cached connection or create a new one
let cached = global.mongoose || { conn: null, promise: null };
// Update global.mongoose for future reference but only if it's undefined
if (!global.mongoose) {
  global.mongoose = cached;
}

// Use mock database in development mode
// This value can be changed by the enable-mock-db.ps1 and disable-mock-db.ps1 scripts
const USE_MOCK_DB = true; // Set to false to use real MongoDB connection

/**
 * Connect to database and return the mongoose instance
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // Use mock database when USE_MOCK_DB is true
  if (USE_MOCK_DB) {
    console.log('[MongoDB] Using mock database implementation');
    return mockConnectToDatabase();
  }
  
  // Real MongoDB connection logic
  console.log('[MongoDB] Connecting to real MongoDB instance');
  
  if (cached.conn) {
    console.log('[MongoDB] Using cached connection');
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

    console.log('[MongoDB] Creating new connection to', MONGODB_URI);
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('[MongoDB] Connection successful');
        return mongoose;
      })
      .catch((error) => {
        console.error('[MongoDB] Connection error:', error);
        throw error;
      });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    console.error('[MongoDB] Connection failed:', e);
    throw e;
  }
}

/**
 * Disconnects from database
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (USE_MOCK_DB) {
    console.log('[MongoDB] Disconnecting from mock database');
    return mockDisconnectFromDatabase();
  }
  
  console.log('[MongoDB] Disconnecting from real MongoDB instance');
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('[MongoDB] Successfully disconnected');
  } else {
    console.log('[MongoDB] No active connection to disconnect');
  }
}

// Add default export for legacy imports
export default connectToDatabase;




