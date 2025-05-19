// MongoDB Connection String Validator
// A simple script to validate a MongoDB connection string

const connectionString = process.env.CONNECTION_STRING || 'mongodb://localhost:27017/technews';

console.log(`Validating connection string: ${connectionString.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://*****:*****@')}`);

// Parse the connection string
let dbName = 'technews';
let host = 'localhost';
let isAtlas = false;

try {
  const url = new URL(connectionString);
  host = url.hostname;
  dbName = url.pathname.replace('/', '') || dbName;
  isAtlas = url.protocol.includes('+srv') || host.includes('mongodb.net');
  
  console.log(`\nConnection Details:`);
  console.log(`- Host: ${host}`);
  console.log(`- Database: ${dbName}`);
  console.log(`- Type: ${isAtlas ? 'MongoDB Atlas (Cloud)' : 'Standard MongoDB'}`);
  
  if (isAtlas) {
    console.log(`\nMongoDB Atlas detected:`);
    console.log(`- Make sure your IP address is whitelisted in Atlas`);
    console.log(`- Check that your username and password are correct`);
  }
  
  console.log(`\nConnection string looks valid!`);
  process.exit(0);
} catch (error) {
  console.error(`\nInvalid connection string: ${error.message}`);
  console.log(`\nA valid connection string should look like:`);
  console.log(`- Standard MongoDB: mongodb://localhost:27017/technews`);
  console.log(`- MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/technews`);
  
  process.exit(1);
}
