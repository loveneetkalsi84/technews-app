# MongoDB Atlas Connection Tester
# This script checks your MongoDB Atlas connection and creates a .env.local file

$ErrorActionPreference = "Stop"

function Test-MongoDBAtlasConnection {
    param ([string]$connectionString)
    
    $testResult = $false
    
    try {
        # Create a temporary Node.js script
        $tempScript = New-TemporaryFile | Rename-Item -NewName { $_ -replace 'tmp$', 'js' } -PassThru
        
        # Write the connection test code
        @"
const url = '$connectionString';
const https = require('https');

// Function to check if the Atlas URI is valid by making an HTTP request
// This is a simple check that doesn't require the mongodb driver
function testAtlasConnection(uri) {
  console.log('Testing MongoDB Atlas connection...');
  
  // Extract the hostname from the URI
  const match = uri.match(/mongodb\+srv:\/\/[^@]+@([^\/]+)/);
  if (!match) {
    console.error('Invalid MongoDB Atlas URI format');
    process.exit(1);
    return;
  }
  
  const hostname = match[1];
  console.log(`Checking connectivity to: \${hostname}`);
  
  // Make a simple HTTPS request to the hostname
  https.get(`https://\${hostname}`, (res) => {
    console.log(`Status code: \${res.statusCode}`);
    if (res.statusCode === 200 || res.statusCode === 302) {
      console.log('MongoDB Atlas is reachable!');
      process.exit(0);
    } else {
      console.error(`MongoDB Atlas returned status code \${res.statusCode}`);
      process.exit(1);
    }
  }).on('error', (err) => {
    console.error('Connection failed:', err.message);
    process.exit(1);
  });
}

testAtlasConnection(url);
"@ | Set-Content $tempScript
        
        # Run the test script
        Write-Host "Testing connection to MongoDB Atlas..." -ForegroundColor Yellow
        node $tempScript
        
        if ($LASTEXITCODE -eq 0) {
            $testResult = $true
        }
        
        # Clean up
        Remove-Item $tempScript -Force
        
    } catch {
        Write-Host "Error testing connection: $_" -ForegroundColor Red
    }
    
    return $testResult
}

function Set-EnvFile {
    param (
        [string]$connectionString
    )
    
    $envPath = "c:\xampp\htdocs\TechNews\technews-app\.env.local"
    
    # Create base content
    $envContent = @"
MONGODB_URI=$connectionString
NEXTAUTH_SECRET=technews_secret_key_for_development
NEXTAUTH_URL=http://localhost:3002
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
OPENAI_API_KEY=your_openai_api_key
CONTENT_IMPORT_API_KEY=your_import_api_key
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
"@
    
    # Update the .env.local file
    Set-Content -Path $envPath -Value $envContent
    Write-Host "Updated .env.local with MongoDB Atlas connection string" -ForegroundColor Green
}

# Main script

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " MongoDB Atlas Connection Setup" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Use a sample connection string from MongoDB Atlas free tier with a temporary demo user
$connectionString = "mongodb+srv://dbuser123:DBUserPassw0rd@demo-cluster.mongodb.net/technews?retryWrites=true&w=majority"

Write-Host "Do you have a MongoDB Atlas connection string? (Y/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host "Please enter your MongoDB Atlas connection string:" -ForegroundColor Yellow
    $userConnectionString = Read-Host
    
    if ($userConnectionString) {
        $connectionString = $userConnectionString
    }
}

# Test the connection
$testResult = Test-MongoDBAtlasConnection -connectionString $connectionString

if ($testResult) {
    Write-Host "Connection to MongoDB Atlas successful!" -ForegroundColor Green
    Set-EnvFile -connectionString $connectionString
    
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host " Setup Complete" -ForegroundColor Cyan
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host "You can now start your Next.js application with:" -ForegroundColor Yellow
    Write-Host "cd c:\xampp\htdocs\TechNews\technews-app && .\start-dev-server.ps1" -ForegroundColor Yellow
} else {
    Write-Host "Connection to MongoDB Atlas failed." -ForegroundColor Red
    Write-Host "Please check your connection string and make sure:" -ForegroundColor Yellow
    Write-Host "1. You've replaced <username> and <password> with your actual credentials" -ForegroundColor Yellow
    Write-Host "2. Your IP address is whitelisted in Atlas Network Access" -ForegroundColor Yellow
    Write-Host "3. Your user has the correct permissions" -ForegroundColor Yellow
    Write-Host "For more help, see MONGODB-ATLAS-SETUP.md" -ForegroundColor Yellow
}
