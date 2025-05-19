# Set up MongoDB connection string directly
# This script accepts a connection string as a parameter

param(
    [Parameter(Mandatory=$false)]
    [string]$ConnectionString = "mongodb://localhost:27017/technews"
)

$ErrorActionPreference = "Stop"

# Define paths
$projectRoot = "c:\xampp\htdocs\TechNews\technews-app"
$envPath = Join-Path $projectRoot ".env.local"
$mongodbPath = Join-Path $projectRoot "app\lib\mongodb.ts"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " MongoDB Connection Setup" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Validate connection string format
Write-Host "Validating connection string format..." -ForegroundColor Yellow
node "$projectRoot\validate-connection-string.js" 
$env:CONNECTION_STRING = $ConnectionString

if ($LASTEXITCODE -ne 0) {
    Write-Host "Connection string format appears invalid. Continuing anyway..." -ForegroundColor Yellow
}

# Update .env.local file
Write-Host "Updating .env.local with connection string..." -ForegroundColor Yellow

if (Test-Path $envPath) {
    # Read and update existing .env.local file
    $content = Get-Content $envPath -Raw
    
    if ($content -match "MONGODB_URI=") {
        # Replace existing connection string
        $content = $content -replace "MONGODB_URI=.*", "MONGODB_URI=$ConnectionString"
    } else {
        # Add connection string if it doesn't exist
        $content += "`nMONGODB_URI=$ConnectionString"
    }
    
    # Write updated content back to file
    Set-Content -Path $envPath -Value $content -Force
} else {
    # Create new .env.local file
    @"
MONGODB_URI=$ConnectionString
NEXTAUTH_SECRET=technews_secret_key_for_development
NEXTAUTH_URL=http://localhost:3002
"@ | Set-Content -Path $envPath
}

Write-Host "Updated .env.local with new connection string" -ForegroundColor Green

# Ensure real MongoDB connection is used
if (Test-Path $mongodbPath) {
    $content = Get-Content $mongodbPath -Raw
    if ($content -match "USE_MOCK_DB = true") {
        $content = $content -replace "USE_MOCK_DB = true", "USE_MOCK_DB = false"
        Set-Content -Path $mongodbPath -Value $content -Force
        Write-Host "Updated mongodb.ts to use real MongoDB connection" -ForegroundColor Green
    } else {
        Write-Host "mongodb.ts is already set to use real MongoDB connection" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " Connection Setup Complete" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Your MongoDB connection has been configured with:" -ForegroundColor Green
Write-Host $ConnectionString.Replace("mongodb+srv://", "mongodb+srv://***:***@") -ForegroundColor Yellow
Write-Host ""
Write-Host "You can now start your application with:" -ForegroundColor Yellow
Write-Host "cd $projectRoot && .\start-dev-server.ps1" -ForegroundColor Yellow
