import { MongoClient } from "mongodb";

// Set MongoDB URI with a fallback for local development
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/technews";
const options = {
  connectTimeoutMS: 10000, // 10 seconds timeout
  serverSelectionTimeoutMS: 5000, // 5 seconds timeout
  socketTimeoutMS: 30000 // 30 seconds timeout
};

let client;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// In development mode, use a global variable so that the value
// is preserved across module reloads caused by HMR (Hot Module Replacement).
if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof global & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
