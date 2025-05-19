# Verification script to test the article slug fix
# This script runs both verification tests and provides a summary of the results

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host "   TechNews Article Slug Fix Verification Suite" -ForegroundColor Cyan
Write-Host "======================================================`n" -ForegroundColor Cyan

Write-Host "This script will run two verification tests:" -ForegroundColor Yellow
Write-Host "1. Testing article retrieval by slug (verify-article-slug-fix.js)" -ForegroundColor Yellow
Write-Host "2. Testing 'View Article' link in admin dashboard (verify-view-article-link.js)" -ForegroundColor Yellow

Write-Host "`nPrerequisites:" -ForegroundColor Yellow
Write-Host "- MongoDB server running" -ForegroundColor Yellow
Write-Host "- TechNews app running on localhost (npm run dev)" -ForegroundColor Yellow
Write-Host "- Node.js installed" -ForegroundColor Yellow
Write-Host "- Required npm packages installed (puppeteer, mongodb, dotenv, chalk)" -ForegroundColor Yellow

# Check if required packages are installed
Write-Host "`nChecking required packages..." -ForegroundColor Cyan
$packages = @("puppeteer", "mongodb", "dotenv", "chalk", "node-fetch")
$needsInstall = $false
foreach ($package in $packages) {
    try {
        $null = npx -p $package -c "echo Checking $package"
        Write-Host "✓ $package is available" -ForegroundColor Green
    } catch {
        Write-Host "✗ $package is not installed" -ForegroundColor Red
        $needsInstall = $true
    }
}

if ($needsInstall) {
    Write-Host "`nInstalling missing packages..." -ForegroundColor Cyan
    npm install $packages --no-save
}

# Check if the app is running
Write-Host "`nChecking if TechNews app is running..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    Write-Host "✓ TechNews app is running" -ForegroundColor Green
} catch {
    Write-Host "✗ TechNews app does not appear to be running on http://localhost:3000" -ForegroundColor Red
    Write-Host "Please start the app with 'npm run dev' in a separate terminal" -ForegroundColor Yellow
    
    $startApp = Read-Host "Would you like to start the app now? (y/n)"
    if ($startApp -eq "y") {
        Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "." -NoNewWindow
        Write-Host "Waiting for app to start..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15  # Wait for app to start
    } else {
        Write-Host "Verification aborted. Please start the app and run this script again." -ForegroundColor Red
        exit
    }
}

# Run the first verification script
Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host "Running Test 1: Article Slug Verification" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
try {
    node verify-article-slug-fix.js
    Write-Host "`n✓ Article Slug Test completed" -ForegroundColor Green
} catch {
    Write-Host "`n✗ Article Slug Test failed to run properly: $_" -ForegroundColor Red
}

# Run the second verification script
Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host "Running Test 2: View Article Link Verification" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
try {
    node verify-view-article-link.js
    Write-Host "`n✓ View Article Link Test completed" -ForegroundColor Green
} catch {
    Write-Host "`n✗ View Article Link Test failed to run properly: $_" -ForegroundColor Red
}

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host "   Verification Complete" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

Write-Host "`nIf all tests passed, the article slug fix has been successfully implemented!" -ForegroundColor Green
Write-Host "If any tests failed, review the console output for details and fix the issues." -ForegroundColor Yellow

Write-Host "`nAdditional verification steps:" -ForegroundColor Yellow
Write-Host "1. Manually check a few articles in the admin dashboard" -ForegroundColor Yellow
Write-Host "2. Verify that article links in category pages work correctly" -ForegroundColor Yellow
Write-Host "3. Test with newly created articles with special characters in the title" -ForegroundColor Yellow
