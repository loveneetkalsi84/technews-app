import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
// Define the type for our cached connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the NodeJS global type to include our custom properties
declare global {
  var mongoose: MongooseCache | undefined;
}

// Initialize the cached connection
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

// Save the cached connection to the global object
if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connect to MongoDB and return the mongoose instance
 * This function is exported as the default export of this module
 */
async function connectToDatabase(): Promise<typeof mongoose> {
  // If we already have a connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If we don't have a connection promise yet, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      console.log('Connected to MongoDB');
      return mongoose;
    });
  }

  try {
    // Wait for the connection to resolve
    cached.conn = await cached.promise;
  } catch (e) {
    // If there's an error, clear the promise so we can try again
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Export the connectToDatabase function as the default export
export default connectToDatabase;
