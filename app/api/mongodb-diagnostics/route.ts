// This is a troubleshooting utility for MongoDB connection
// Created specifically to diagnose connection issues
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

interface TroubleshootingInfo {
  localMongoDB: string;
  mongoDBAtlas: string;
  suggestions: string[];
  writeTest?: string;
  writeError?: string;
}

export async function GET() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/technews';
    // Response data
  let responseData = {
    success: false,
    timestamp: new Date().toISOString(),
    connection: {
      uri: MONGODB_URI.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://[username]:[password]@'),
      status: 'unknown',
      error: null as string | null
    },
    troubleshooting: {
      localMongoDB: 'Not tested',
      mongoDBAtlas: 'Not tested',
      suggestions: [] as string[]
    } as TroubleshootingInfo
  };

  try {
    console.log(`Attempting to connect to MongoDB at: ${responseData.connection.uri}`);
    
    // Set connection options
    const options = {
      connectTimeoutMS: 5000,  // 5 seconds
      serverSelectionTimeoutMS: 5000,  // 5 seconds
    };
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, options);
    
    // If successful, update response data
    responseData.success = true;
    responseData.connection.status = 'connected';
    
    // Add timestamp to database to verify write access
    try {
      const TestModel = mongoose.models.ConnectionTest || 
        mongoose.model('ConnectionTest', new mongoose.Schema({ 
          timestamp: Date,
          message: String
        }));
      
      await new TestModel({ 
        timestamp: new Date(),
        message: 'Connection test successful'
      }).save();      
      responseData.troubleshooting.writeTest = 'success';
    } catch (writeError: any) {
      responseData.troubleshooting.writeTest = 'failed';
      responseData.troubleshooting.writeError = writeError.message;
    }
    
    // Disconnect from MongoDB    await mongoose.disconnect();
    
  } catch (error: any) {
    // If error occurs, add error details to response
    responseData.connection.status = 'failed';
    responseData.connection.error = error.message;
    
    // Add troubleshooting steps based on error
    if (error.name === 'MongoNetworkError' || error.message.includes('ECONNREFUSED')) {
      if (MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1')) {
        responseData.troubleshooting.localMongoDB = 'Connection failed';
        responseData.troubleshooting.suggestions.push(
          'Your local MongoDB server is not running',
          'Start MongoDB service or use MongoDB Atlas instead',
          'See MONGODB-TROUBLESHOOTING.md for instructions'
        );
      } else if (MONGODB_URI.includes('mongodb+srv')) {
        responseData.troubleshooting.mongoDBAtlas = 'Connection failed';
        responseData.troubleshooting.suggestions.push(
          'Check your internet connection',
          'Verify your MongoDB Atlas connection string',
          'Ensure your IP address is whitelisted in Atlas Network Access',
          'See MONGODB-ATLAS-SETUP.md for setup instructions'
        );
      }
    } else if (error.name === 'MongoServerSelectionError') {
      responseData.troubleshooting.suggestions.push(
        'MongoDB server selection timeout',
        'Check if your MongoDB URI is correct',
        'Ensure the MongoDB server is running and accessible'
      );
    } else if (error.message.includes('Authentication failed')) {
      responseData.troubleshooting.suggestions.push(
        'MongoDB authentication failed',
        'Check username and password in your connection string',
        'Verify database user credentials in MongoDB Atlas'
      );
    }
    
    // Add general troubleshooting suggestions
    responseData.troubleshooting.suggestions.push(
      'Review connection string format',
      'Check firewall settings',
      'Try connecting with MongoDB Compass to verify server accessibility'
    );
  }
  
  // Return the response
  return NextResponse.json(responseData);
}
