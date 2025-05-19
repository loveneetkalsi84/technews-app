# Disable Mock MongoDB
# This script disables the mock database implementation and restores real MongoDB connection

$ErrorActionPreference = "Stop"

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host " Disabling TechNews Mock Database" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Path to the MongoDB connection file
$mongoDbPath = "app\lib\mongodb.ts"

# Check if the mongodb.ts file exists
if (Test-Path $mongoDbPath) {
    # Read current file content
    $content = Get-Content $mongoDbPath -Raw
    
    # Check if the file contains the USE_MOCK_DB constant
    if ($content -match "const USE_MOCK_DB = (false|true)") {
        # Replace the constant value with false
        $updatedContent = $content -replace "const USE_MOCK_DB = (false|true)", "const USE_MOCK_DB = false"
        Set-Content $mongoDbPath -Value $updatedContent
        Write-Host "✅ Successfully disabled mock database by setting USE_MOCK_DB to false" -ForegroundColor Green
    } else {
        Write-Host "❌ Could not find USE_MOCK_DB constant in $mongoDbPath" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ MongoDB connection file not found at $mongoDbPath" -ForegroundColor Red
    exit 1
}

# Set environment variable
[Environment]::SetEnvironmentVariable("USE_MOCK_DB", "false", "Process")
Write-Host "✅ Set environment variable USE_MOCK_DB=false" -ForegroundColor Green

Write-Host "`nMock database has been disabled. The application will now use the real MongoDB connection." -ForegroundColor Green
Write-Host "`nTo start MongoDB:"
Write-Host "  .\start-mongodb.ps1" -ForegroundColor Yellow
Write-Host "`nTo start the development server:"
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host "`n=================================================" -ForegroundColor Cyan
