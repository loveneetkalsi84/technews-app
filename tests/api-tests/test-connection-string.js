// MongoDB Connection String Tester
// This script tests a MongoDB connection string and validates that it works

const { MongoClient } = require('mongodb');

async function testConnection(connectionString) {
  console.log(`Testing connection to: ${connectionString.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://*****:*****@')}`);
  
  const client = new MongoClient(connectionString, {
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000
  });
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connection successful!');
    
    // Get database and collection info
    const dbName = client.db().databaseName;
    console.log(`Connected to database: ${dbName}`);
    
    const collections = await client.db().listCollections().toArray();
    if (collections.length === 0) {
      console.log('No collections found. Database is empty.');
    } else {
      console.log('Collections:');
      collections.forEach(collection => console.log(`- ${collection.name}`));
    }
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

async function main() {
  // Get connection string from command line or use default
  const connectionString = process.argv[2] || 'mongodb://localhost:27017/technews';
  
  // Test the connection
  const success = await testConnection(connectionString);
  
  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

main();
