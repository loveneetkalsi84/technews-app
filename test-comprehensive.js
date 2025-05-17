// Comprehensive test script for TechNews article functionality
// This script provides several testing options for different aspects of the system

async function runTests() {
  // Test configuration
  const config = {
    baseUrl: 'http://localhost:3002',
    testEndpoint: true, // Use the test endpoint that doesn't require auth
    verbose: true // Show detailed logs
  };

  console.log('🧪 TechNews Article Functionality Test Suite');
  console.log('============================================');
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Testing Mode: ${config.testEndpoint ? 'Test endpoint (no auth required)' : 'Production endpoint (auth required)'}`);
  console.log('============================================\n');

  // Step 1: Check if server is running
  if (!(await checkServerConnection(config))) {
    return;
  }

  // Step 2: Test article creation
  await testArticleCreation(config);
}

// Test server connection
async function checkServerConnection(config) {
  console.log('📡 Testing server connection...');
  
  try {
    const response = await fetch(`${config.baseUrl}/api/test-connection`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Server connection successful: ${data.message || 'Connected'}`);
      console.log(`   Server time: ${data.timestamp || new Date().toISOString()}`);
      return true;
    } else {
      console.error(`❌ Server responded with status ${response.status}`);
      console.log('   Response:', await response.text());
      showServerStartupInstructions();
      return false;
    }
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
    showServerStartupInstructions();
    return false;
  }
}

// Test article creation
async function testArticleCreation(config) {
  console.log('\n📝 Testing article creation...');
  
  const testArticleData = {
    title: "Comprehensive Test Article",
    slug: "comprehensive-test-" + Date.now(),
    content: "This is a test article created via the comprehensive test script. It verifies the article creation functionality of TechNews.",
    excerpt: "Testing article creation with comprehensive tests",
    category: "Development",
    tags: ["test", "comprehensive", "development"],
    isPublished: false,
    metaDescription: "Test article for development purposes",
    metaKeywords: "test,development,technews"
  };
  
  try {
    // Choose endpoint based on config
    const endpoint = config.testEndpoint 
      ? `${config.baseUrl}/api/test-article` 
      : `${config.baseUrl}/api/articles`;
    
    console.log(`📤 Sending article to ${config.testEndpoint ? 'test' : 'production'} endpoint...`);
    if (config.verbose) {
      console.log('   Article data:', JSON.stringify(testArticleData, null, 2));
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testArticleData),
      ...(config.testEndpoint ? {} : { credentials: 'include' })
    });
    
    console.log(`   Response status: ${response.status} ${response.statusText}`);
    
    try {
      const data = await response.json();
      if (config.verbose) {
        console.log('   Response data:', JSON.stringify(data, null, 2));
      } else {
        console.log('   Response:', data.success ? 'Success' : 'Failed', data.message || '');
      }
      
      if (response.ok) {
        console.log('✅ Article creation test successful!');
        if (data.article && data.article._id) {
          console.log(`   Created article ID: ${data.article._id}`);
          console.log(`   Article title: ${data.article.title}`);
        }
      } else {
        console.log('❌ Article creation test failed.');
        handleArticleCreationError(response.status, config);
      }
    } catch (parseError) {
      console.log('❌ Could not parse response as JSON');
      const text = await response.text();
      console.log('   Raw response:', text);
    }
  } catch (error) {
    console.error('❌ Error during article creation test:', error.message);
  }
}

// Display server startup instructions
function showServerStartupInstructions() {
  console.log('\n📋 Server Startup Instructions:');
  console.log('1. Ensure you are in the technews-app directory');
  console.log('2. Run the PowerShell script to start the server:');
  console.log('   .\\start-dev-server.ps1');
  console.log('   or manually with:');
  console.log('   npm run dev -- -p 3002');
  console.log('3. Wait for the server to start completely');
  console.log('4. Run this test script again');
}

// Handle article creation errors
function handleArticleCreationError(statusCode, config) {
  if (!config.testEndpoint && (statusCode === 401 || statusCode === 403)) {
    console.log('\n🔐 Authentication Issue Detected:');
    console.log('This endpoint requires authentication with admin or editor privileges.');
    console.log('\nTroubleshooting options:');
    console.log('1. Log in through the web UI first at http://localhost:3002/login');
    console.log('2. Set testEndpoint to true in the config to use the test endpoint');
    console.log('3. Run node test-auth.js to test authentication specifically');
  } else if (statusCode >= 500) {
    console.log('\n🔧 Server Error Detected:');
    console.log('Check the server logs for more details about this error.');
  }
}

// Run the tests
runTests();
