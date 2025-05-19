# Enable Mock MongoDB
# This script enables the mock database implementation for development

$ErrorActionPreference = "Stop"

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host " Enabling TechNews Mock Database" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Path to the MongoDB connection file
$mongoDbPath = "app\lib\mongodb.ts"

# Check if the mongodb.ts file exists
if (Test-Path $mongoDbPath) {
    # Read current file content
    $content = Get-Content $mongoDbPath -Raw
    
    # Check if the file contains the USE_MOCK_DB constant
    if ($content -match "const USE_MOCK_DB = (false|true)") {
        # Replace the constant value with true
        $updatedContent = $content -replace "const USE_MOCK_DB = (false|true)", "const USE_MOCK_DB = true"
        Set-Content $mongoDbPath -Value $updatedContent
        Write-Host "✅ Successfully enabled mock database by setting USE_MOCK_DB to true" -ForegroundColor Green
    } else {
        Write-Host "❌ Could not find USE_MOCK_DB constant in $mongoDbPath" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ MongoDB connection file not found at $mongoDbPath" -ForegroundColor Red
    exit 1
}

# Set environment variable
[Environment]::SetEnvironmentVariable("USE_MOCK_DB", "true", "Process")
Write-Host "✅ Set environment variable USE_MOCK_DB=true" -ForegroundColor Green

Write-Host "`nMock database has been enabled successfully. You can now run the application without a real MongoDB connection." -ForegroundColor Green
Write-Host "`nTo run tests with the mock database:"
Write-Host "  npm run test:article-features" -ForegroundColor Yellow
Write-Host "`nTo verify article links with mock database:"
Write-Host "  npm run verify-mock-links" -ForegroundColor Yellow
Write-Host "`nTo start the development server:"
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host "`n=================================================" -ForegroundColor Cyan
