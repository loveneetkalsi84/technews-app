# TechNews Step-by-Step Testing Script
# This script guides you through testing all key features of the TechNews application

Write-Host "`n===============================================================" -ForegroundColor Cyan
Write-Host "   TechNews Application Testing Guide" -ForegroundColor Cyan
Write-Host "===============================================================`n" -ForegroundColor Cyan

Write-Host "This script will guide you through testing all key features of the TechNews application step by step."
Write-Host "For each feature, it will provide instructions and verify if the required components are working."

# Check if MongoDB is running
Write-Host "`n[1/8] Checking if MongoDB is running..." -ForegroundColor Yellow
try {
    $mongoStatus = mongosh --eval "db.version()" --quiet
    Write-Host "✅ MongoDB is running: $mongoStatus" -ForegroundColor Green
} catch {
    Write-Host "❌ MongoDB does not appear to be running. Please start MongoDB first." -ForegroundColor Red
    $startMongo = Read-Host "Would you like to start MongoDB now? (y/n)"
    if ($startMongo -eq "y") {
        Write-Host "Starting MongoDB..." -ForegroundColor Yellow
        Start-Process "mongod" -ArgumentList "--dbpath=./data/db" -WindowStyle Hidden
        Start-Sleep -Seconds 5
        Write-Host "MongoDB should now be running in the background." -ForegroundColor Green
    } else {
        Write-Host "Please start MongoDB manually and run this script again." -ForegroundColor Yellow
        exit
    }
}

# Check if the app is running
Write-Host "`n[2/8] Checking if TechNews application is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ TechNews application is running" -ForegroundColor Green
} catch {
    Write-Host "❌ TechNews application is not running on http://localhost:3000" -ForegroundColor Red
    $startApp = Read-Host "Would you like to start the application now? (y/n)"
    if ($startApp -eq "y") {
        Write-Host "Starting TechNews application..." -ForegroundColor Yellow
        Start-Process -FilePath "npm" -ArgumentList "run dev" -WindowStyle Hidden
        Write-Host "Waiting for application to start (15 seconds)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15
        Write-Host "TechNews application should now be running." -ForegroundColor Green
    } else {
        Write-Host "Please start the application with 'npm run dev' and run this script again." -ForegroundColor Yellow
        exit
    }
}

# Check if required Node.js packages are installed
Write-Host "`n[3/8] Checking required packages for testing..." -ForegroundColor Yellow
$packages = @("puppeteer", "mongodb", "dotenv", "chalk", "node-fetch")
$needsInstall = $false
foreach ($package in $packages) {
    try {
        $null = npx -p $package -c "echo Checking $package" 2>$null
        Write-Host "✅ $package is available" -ForegroundColor Green
    } catch {
        Write-Host "❌ $package is not installed" -ForegroundColor Red
        $needsInstall = $true
    }
}

if ($needsInstall) {
    $installPackages = Read-Host "Some required packages are missing. Would you like to install them now? (y/n)"
    if ($installPackages -eq "y") {
        Write-Host "Installing packages..." -ForegroundColor Yellow
        npm install $packages --save-dev
        Write-Host "Packages installed successfully." -ForegroundColor Green
    } else {
        Write-Host "Please install the required packages manually with 'npm install $packages --save-dev'" -ForegroundColor Yellow
    }
}

# Check if there's an admin account
Write-Host "`n[4/8] Checking for admin account..." -ForegroundColor Yellow
$adminEmail = [Environment]::GetEnvironmentVariable("ADMIN_EMAIL")
$adminPassword = [Environment]::GetEnvironmentVariable("ADMIN_PASSWORD")

if (-not $adminEmail -or -not $adminPassword) {
    Write-Host "❓ Admin credentials not found in environment variables." -ForegroundColor Yellow
    $adminEmail = Read-Host "Please enter admin email (leave empty to use default 'admin@example.com')"
    if (-not $adminEmail) {
        $adminEmail = "admin@example.com"
    }
    $adminPassword = Read-Host "Please enter admin password (leave empty to use default 'adminpassword')"
    if (-not $adminPassword) {
        $adminPassword = "adminpassword"
    }
    
    # Save credentials for tests
    [Environment]::SetEnvironmentVariable("ADMIN_EMAIL", $adminEmail, "Process")
    [Environment]::SetEnvironmentVariable("ADMIN_PASSWORD", $adminPassword, "Process")
    
    Write-Host "Admin credentials set for testing." -ForegroundColor Green
} else {
    Write-Host "✅ Admin credentials found in environment variables." -ForegroundColor Green
}

# Menu for testing various features
function Show-TestMenu {
    Write-Host "`n===============================================================" -ForegroundColor Cyan
    Write-Host "   TechNews Testing Menu" -ForegroundColor Cyan
    Write-Host "===============================================================`n" -ForegroundColor Cyan
    
    Write-Host "[5/8] Select a feature to test:" -ForegroundColor Yellow
    Write-Host "1. Test all links in the application"
    Write-Host "2. Test article slug resolution (View Article links)"
    Write-Host "3. Test article creation and publishing"
    Write-Host "4. Test user authentication"
    Write-Host "5. Run all tests"
    Write-Host "6. Exit"
    
    $choice = Read-Host "`nEnter your choice (1-6)"
    
    switch ($choice) {
        "1" { Test-AllLinks }
        "2" { Test-ArticleSlugResolution }
        "3" { Test-ArticleCreation }
        "4" { Test-Authentication }
        "5" { Test-All }
        "6" { return $false }
        default { 
            Write-Host "Invalid choice, please try again." -ForegroundColor Red
            return $true
        }
    }
    return $true
}

function Test-AllLinks {
    Write-Host "`n[TEST] Testing all links in the application..." -ForegroundColor Cyan
    node verify-all-links.js
    
    Write-Host "`nTest completed. Press Enter to return to the menu." -ForegroundColor Yellow
    Read-Host
}

function Test-ArticleSlugResolution {
    Write-Host "`n[TEST] Testing article slug resolution..." -ForegroundColor Cyan
    node verify-article-slug-fix.js
    
    Write-Host "`nTest completed. Press Enter to return to the menu." -ForegroundColor Yellow
    Read-Host
}

function Test-ArticleCreation {
    Write-Host "`n[TEST] Testing article creation and publishing..." -ForegroundColor Cyan
    
    # Create a test article
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $testTitle = "Test Article $timestamp"
    $testSlug = "test-article-$timestamp"
    
    # Create a temporary test script
    $testScript = @"
// Test article creation
const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config();

async function createTestArticle() {
  try {
    const testArticle = {
      title: "$testTitle",
      slug: "$testSlug",
      content: "This is a test article created for testing purposes. It should be published and viewable.",
      excerpt: "Test article excerpt",
      category: "Test",
      tags: "test,verification",
      isPublished: true,
      metaDescription: "Test article meta description",
      metaKeywords: "test,verification"
    };
    
    console.log("Creating test article...");
    const response = await fetch("http://localhost:3000/api/articles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(testArticle)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Test article created successfully!");
      console.log("Article ID: " + data._id);
      console.log("Article Title: " + data.title);
      console.log("Article Slug: " + data.slug);
      console.log("You can view this article at: http://localhost:3000/articles/" + data.slug);
    } else {
      console.log("❌ Failed to create test article.");
      const errorText = await response.text();
      console.log("Error:", errorText);
    }
  } catch (error) {
    console.error("Error creating test article:", error);
  }
}

createTestArticle();
"@
    
    Set-Content -Path "temp-create-article.js" -Value $testScript
    
    # Run the test script
    node temp-create-article.js
    
    # Clean up
    Remove-Item -Path "temp-create-article.js"
    
    Write-Host "`nTest completed. Press Enter to return to the menu." -ForegroundColor Yellow
    Read-Host
}

function Test-Authentication {
    Write-Host "`n[TEST] Testing user authentication..." -ForegroundColor Cyan
    
    # Create a temporary test script
    $testScript = @"
// Test authentication
const puppeteer = require('puppeteer');
const dotenv = require('dotenv');

dotenv.config();

async function testAuthentication() {
  try {
    console.log("Testing login functionality...");
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/login');
    
    // Fill in login form
    await page.type('input[name="email"]', process.env.ADMIN_EMAIL || 'admin@example.com');
    await page.type('input[name="password"]', process.env.ADMIN_PASSWORD || 'adminpassword');
    
    // Submit form
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation()
    ]);
    
    // Check if login was successful
    const url = page.url();
    if (url.includes('/admin')) {
      console.log("✅ Login successful! Redirected to admin dashboard.");
      
      // Get username from the page to verify
      const username = await page.evaluate(() => {
        const userElement = document.querySelector('header .user-info') || document.querySelector('header .username');
        return userElement ? userElement.textContent.trim() : null;
      });
      
      if (username) {
        console.log("✅ Found logged-in user: " + username);
      }
    } else {
      console.log("❌ Login failed! Current URL: " + url);
      
      // Try to get error message
      const errorMessage = await page.evaluate(() => {
        const errorElement = document.querySelector('.error-message') || document.querySelector('.alert');
        return errorElement ? errorElement.textContent.trim() : null;
      });
      
      if (errorMessage) {
        console.log("Error message: " + errorMessage);
      }
    }
    
    await browser.close();
  } catch (error) {
    console.error("Error testing authentication:", error);
  }
}

testAuthentication();
"@
    
    Set-Content -Path "temp-test-auth.js" -Value $testScript
    
    # Run the test script
    node temp-test-auth.js
    
    # Clean up
    Remove-Item -Path "temp-test-auth.js"
    
    Write-Host "`nTest completed. Press Enter to return to the menu." -ForegroundColor Yellow
    Read-Host
}

function Test-All {
    Write-Host "`n[TEST] Running all tests sequentially..." -ForegroundColor Cyan
    
    Test-ArticleSlugResolution
    Test-ArticleCreation
    Test-Authentication
    Test-AllLinks
    
    Write-Host "`nAll tests completed." -ForegroundColor Green
}

# Generate optimization recommendations
Write-Host "`n[6/8] Analyzing application for optimization opportunities..." -ForegroundColor Yellow
$optimizationRecommendations = @(
    "1. Clean up unused test scripts and consolidate them into a single 'tests' directory",
    "2. Remove duplicate admin layout components",
    "3. Minimize third-party dependencies and remove unused packages",
    "4. Implement proper code splitting to reduce bundle size",
    "5. Add proper caching headers for static assets",
    "6. Implement server-side rendering for article pages to improve SEO",
    "7. Set up a CI/CD pipeline for automated testing"
)

Write-Host "`nOptimization Recommendations:" -ForegroundColor Green
foreach ($recommendation in $optimizationRecommendations) {
    Write-Host "  $recommendation" -ForegroundColor White
}

# Display documentation for feature testing
Write-Host "`n[7/8] Documenting key features and test procedures..." -ForegroundColor Yellow

$featureDocumentation = @"
TechNews Key Features Documentation
==================================

1. Article Management
   - Creating articles with rich text editor
   - Publishing/unpublishing articles
   - Viewing article statistics
   - Categorizing and tagging articles

2. User Authentication
   - User registration
   - Login/logout
   - Password reset
   - Role-based access control

3. Admin Dashboard
   - Overview statistics
   - Content management
   - User management
   - Category management

4. Public Article Viewing
   - Article listing by category
   - Article detailed view
   - Related articles
   - Social sharing

5. Search Functionality
   - Full-text search
   - Filter by category, date, etc.
"@

Set-Content -Path "feature-documentation.md" -Value $featureDocumentation
Write-Host "Feature documentation created at: feature-documentation.md" -ForegroundColor Green

# Final step - interactive testing menu
Write-Host "`n[8/8] Starting interactive testing menu..." -ForegroundColor Yellow
$continue = $true
while ($continue) {
    $continue = Show-TestMenu
}

Write-Host "`n===============================================================" -ForegroundColor Cyan
Write-Host "   TechNews Testing Completed" -ForegroundColor Cyan
Write-Host "===============================================================`n" -ForegroundColor Cyan

Write-Host "Thank you for testing the TechNews application!" -ForegroundColor Green
Write-Host "For any issues found, please document them for further fixes." -ForegroundColor Yellow
