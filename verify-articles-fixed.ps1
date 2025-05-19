# Article Functionality Verification Script
# This script runs the article functionality verification test

# Set working directory to the project root
$projectRoot = Split-Path -Parent $PSScriptRoot

# Ensure we're in the right directory
Set-Location $projectRoot

# Check if puppeteer is installed
if (-not (Test-Path "node_modules/puppeteer")) {
    Write-Host "Installing puppeteer for testing..." -ForegroundColor Yellow
    npm install --save-dev puppeteer
}

# Run the verification test
Write-Host "Running article functionality verification test..." -ForegroundColor Cyan
node tests/verify-article-functionality.js

# Check if we should generate test articles
$generateArticles = Read-Host "Do you want to generate test articles? (y/n)"

if ($generateArticles -eq "y") {
    $numArticles = Read-Host "How many test articles do you want to generate? (default: 5)"
    
    if ([string]::IsNullOrEmpty($numArticles)) {
        $numArticles = 5
    }
    
    Write-Host "Generating $numArticles test articles..." -ForegroundColor Cyan
    node tests/generate-test-articles.js $numArticles
}

Write-Host "Verification complete!" -ForegroundColor Green
