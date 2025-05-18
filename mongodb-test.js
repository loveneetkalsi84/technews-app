// Test script for MongoDB connection
// Run with: node mongodb-test.js

const mongoose = require('mongoose');

async function testMongoDBConnection() {
  console.log('------------- MongoDB Connection Test -------------');
  
  // Try to connect to MongoDB
  try {
    // Get the MongoDB URI from environment variables, or use default
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/technews';
    console.log(`Attempting to connect to MongoDB at: ${MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://[username]:[password]@')}`);
    
    // Set connection options
    const options = {
      connectTimeoutMS: 10000,  // 10 seconds
      serverSelectionTimeoutMS: 5000,  // 5 seconds
      socketTimeoutMS: 30000,  // 30 seconds
    };
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, options);
    
    // If successful, log success message
    console.log('✅ MongoDB connection successful!');
    
    // Create a simple test document in a test collection
    const TestModel = mongoose.model('TestConnection', new mongoose.Schema({ 
      test: String, 
      timestamp: Date 
    }));
    
    // Save a test document
    await new TestModel({ 
      test: 'Connection test', 
      timestamp: new Date() 
    }).save();
    
    console.log('✅ Successfully wrote test data to database');
    
    // Count documents
    const count = await TestModel.countDocuments();
    console.log(`✅ Database contains ${count} test documents`);
    
  } catch (error) {
    // If error occurs, log error details
    console.error('❌ MongoDB connection failed:', error);
    
    // Provide helpful error messages based on error type
    if (error.name === 'MongoNetworkError' || error.code === 'ECONNREFUSED') {
      console.error(`
------------------------------------------------------------
MongoDB Connection Failed: Server not running or unreachable
------------------------------------------------------------
Possible solutions:

1. If using local MongoDB:
   - Make sure MongoDB is installed and running
   - Try starting MongoDB manually:
     Windows: Run "mongod --dbpath=C:/data/db"
   - Check if MongoDB is listening on port 27017

2. If using MongoDB Atlas:
   - Check your internet connection
   - Verify your connection string in .env.local
   - Make sure your IP address is whitelisted in Atlas

3. General troubleshooting:
   - Check firewall settings
   - Try a different MongoDB URI
   - Restart your application
------------------------------------------------------------
`);
    }
  } finally {
    // Close the connection
    try {
      await mongoose.disconnect();
      console.log('MongoDB connection closed');
    } catch (e) {
      // Ignore errors during disconnection
    }
    
    console.log('----------------- Test Complete -----------------');
  }
}

// Run the test
testMongoDBConnection();
