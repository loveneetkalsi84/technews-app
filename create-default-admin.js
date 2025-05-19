// Create default user with known password
// This script will create or update the admin user with a known password
// Run with: node create-default-admin.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Use direct connection string to ensure it works
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://loveneetkalsi84:eVbj6nMXDQCTzrc9@cluster0.uhrfuvk.mongodb.net/technews';

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  image: String,
  password: String,
  registeredAt: Date,
  lastActive: Date
});

// Set up default admin credentials
const DEFAULT_ADMIN = {
  name: "TechNews Admin",
  email: "admin@technews.com",
  password: "admin123", // Plain text password
  role: "admin",
  image: "https://randomuser.me/api/portraits/men/32.jpg",
  registeredAt: new Date(),
  lastActive: new Date()
};

async function createDefaultAdmin() {
  try {
    console.log('==================================================');
    console.log('Creating Default Admin User for TechNews Dashboard');
    console.log('==================================================');
    
    console.log(`Connecting to MongoDB at ${MONGODB_URI.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://*****:*****@')}...`);
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
    
    // Create model
    const User = mongoose.model('User', userSchema);
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN.email });
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, saltRounds);
    
    if (existingAdmin) {
      // Update existing admin user
      existingAdmin.password = hashedPassword;
      existingAdmin.lastActive = new Date();
      await existingAdmin.save();
      console.log('Updated existing admin user with new password');
    } else {
      // Create new admin user
      const newAdmin = new User({
        ...DEFAULT_ADMIN,
        password: hashedPassword
      });
      await newAdmin.save();
      console.log('Created new admin user');
    }
    
    console.log('==================================================');
    console.log('Default Admin User Created Successfully');
    console.log('==================================================');
    console.log('You can now log in with the following credentials:');
    console.log(`Email:    ${DEFAULT_ADMIN.email}`);
    console.log(`Password: ${DEFAULT_ADMIN.password}`);
    console.log('==================================================');
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}

// Run the function
createDefaultAdmin();
