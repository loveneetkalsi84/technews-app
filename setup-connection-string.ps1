# MongoDB Connection String Setup
# This script helps set up MongoDB connection string for TechNews

$ErrorActionPreference = "Stop"

function Test-ConnectionString {
    param ([string]$connectionString)
    
    Write-Host "Testing connection string..." -ForegroundColor Yellow
    
    # Run the test script
    $result = node "c:\xampp\htdocs\TechNews\technews-app\test-connection-string.js" $connectionString
    
    # Check exit code
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Connection successful!" -ForegroundColor Green
        return $true
    } else {
        Write-Host "Connection failed." -ForegroundColor Red
        return $false
    }
}

function Update-EnvFile {
    param ([string]$connectionString)
    
    $envPath = "c:\xampp\htdocs\TechNews\technews-app\.env.local"
    
    if (Test-Path $envPath) {
        # Read and update existing .env.local file
        $content = Get-Content $envPath -Raw
        
        if ($content -match "MONGODB_URI=") {
            # Replace existing connection string
            $content = $content -replace "MONGODB_URI=.*", "MONGODB_URI=$connectionString"
        } else {
            # Add connection string if it doesn't exist
            $content += "`nMONGODB_URI=$connectionString"
        }
        
        # Write updated content back to file
        Set-Content -Path $envPath -Value $content -Force
    } else {
        # Create new .env.local file
        @"
MONGODB_URI=$connectionString
NEXTAUTH_SECRET=technews_secret_key_for_development
NEXTAUTH_URL=http://localhost:3002
"@ | Set-Content -Path $envPath
    }
    
    Write-Host "Updated .env.local with new connection string" -ForegroundColor Green
}

function Update-MongoDBFile {
    $mongodbPath = "c:\xampp\htdocs\TechNews\technews-app\app\lib\mongodb.ts"
    
    if (Test-Path $mongodbPath) {
        # Make sure we're using the real MongoDB connection (not the mock)
        $content = Get-Content $mongodbPath -Raw
        if ($content -match "USE_MOCK_DB = true") {
            $content = $content -replace "USE_MOCK_DB = true", "USE_MOCK_DB = false"
            Set-Content -Path $mongodbPath -Value $content -Force
            Write-Host "Updated mongodb.ts to use real MongoDB connection" -ForegroundColor Green
        }
    }
}

# Main script logic
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " MongoDB Connection String Setup" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

Write-Host "This script will help you set up a MongoDB connection string for TechNews." -ForegroundColor Yellow
Write-Host ""
Write-Host "Enter your MongoDB connection string:" -ForegroundColor Yellow
Write-Host "Example: mongodb+srv://username:password@cluster.mongodb.net/technews" -ForegroundColor Gray

# Get connection string from user
$connectionString = Read-Host

# Validate that a connection string was provided
if ([string]::IsNullOrWhiteSpace($connectionString)) {
    Write-Host "No connection string provided. Using default: mongodb://localhost:27017/technews" -ForegroundColor Yellow
    $connectionString = "mongodb://localhost:27017/technews"
}

# Test the connection
$success = Test-ConnectionString -connectionString $connectionString

if ($success) {
    # Update .env.local file
    Update-EnvFile -connectionString $connectionString
    
    # Update mongodb.ts to use real connection
    Update-MongoDBFile
    
    Write-Host ""
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host " Connection Setup Complete" -ForegroundColor Cyan
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host "Your MongoDB connection has been successfully configured." -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now start your application with:" -ForegroundColor Yellow
    Write-Host "cd c:\xampp\htdocs\TechNews\technews-app && .\start-dev-server.ps1" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "====================================================" -ForegroundColor Red
    Write-Host " Connection Setup Failed" -ForegroundColor Red
    Write-Host "====================================================" -ForegroundColor Red
    Write-Host "Please check your connection string and try again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. Username or password might be incorrect" -ForegroundColor Yellow
    Write-Host "2. IP address might not be whitelisted (for MongoDB Atlas)" -ForegroundColor Yellow
    Write-Host "3. Database name might be missing (add '/dbname' at the end)" -ForegroundColor Yellow
    Write-Host "4. Network/firewall issues might be blocking the connection" -ForegroundColor Yellow
}
