# TechNews Test Runner
# This script runs all tests for the TechNews application

Write-Host "`n===============================================================" -ForegroundColor Cyan
Write-Host "   TechNews Test Runner" -ForegroundColor Cyan
Write-Host "===============================================================`n" -ForegroundColor Cyan

# Default configuration
$config = @{
    MongoDB = $true
    Authentication = $true
    Articles = $true
    AdminDashboard = $true
    Integration = $true
    ArticleRendering = $true
    ArticleSlugFix = $true
    LinkVerification = $true
    Port = 3000
    AdminEmail = "admin@example.com"
    AdminPassword = "adminpassword"
}

# Check if MongoDB is running
function Test-MongoDBConnection {
    Write-Host "`n[1/5] Checking MongoDB connection..." -ForegroundColor Yellow
    try {
        $mongoStatus = mongosh --eval "db.version()" --quiet
        Write-Host "✅ MongoDB is running: $mongoStatus" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ MongoDB does not appear to be running." -ForegroundColor Red
        $startMongo = Read-Host "Would you like to start MongoDB now? (y/n)"
        if ($startMongo -eq "y") {
            try {
                Start-Process "mongod" -ArgumentList "--dbpath=./data/db" -WindowStyle Hidden
                Start-Sleep -Seconds 5
                Write-Host "MongoDB should now be running in the background." -ForegroundColor Green
                return $true
            } catch {
                Write-Host "Failed to start MongoDB. Please start it manually." -ForegroundColor Red
                return $false
            }
        } else {
            return $false
        }
    }
}

# Check if the app is running
function Test-AppConnection {
    Write-Host "`n[2/5] Checking TechNews application..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($config.Port)" -UseBasicParsing -TimeoutSec 5
        Write-Host "✅ TechNews application is running on port $($config.Port)" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ TechNews application is not running on http://localhost:$($config.Port)" -ForegroundColor Red
        $startApp = Read-Host "Would you like to start the application now? (y/n)"
        if ($startApp -eq "y") {
            Start-Process -FilePath "npm" -ArgumentList "run dev" -WindowStyle Hidden
            Write-Host "Waiting for application to start (15 seconds)..." -ForegroundColor Yellow
            Start-Sleep -Seconds 15
            
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:$($config.Port)" -UseBasicParsing -TimeoutSec 5
                Write-Host "✅ TechNews application is now running" -ForegroundColor Green
                return $true
            } catch {
                Write-Host "Failed to start the application. Please start it manually with 'npm run dev'" -ForegroundColor Red
                return $false
            }
        } else {
            return $false
        }
    }
}

# Run a test and return success/failure
function Run-Test {
    param(
        [string]$TestName,
        [string]$TestPath,
        [bool]$Critical = $false
    )
    
    Write-Host "`n>> Running test: $TestName" -ForegroundColor Cyan
    try {
        & node $TestPath
        $exitCode = $LASTEXITCODE
        if ($exitCode -eq 0) {
            Write-Host "✅ Test '$TestName' passed!" -ForegroundColor Green
            return $true
        } else {
            if ($Critical) {
                Write-Host "❌ Critical test '$TestName' failed! Stopping test suite." -ForegroundColor Red
            } else {
                Write-Host "❌ Test '$TestName' failed, but continuing with other tests." -ForegroundColor Red
            }
            return $false
        }
    } catch {
        Write-Host "❌ Error running test '$TestName': $_" -ForegroundColor Red
        return $false
    }
}

# Set environment variables for tests
function Set-TestEnvironment {
    Write-Host "`n[3/5] Setting up test environment..." -ForegroundColor Yellow
    
    # Set environment variables
    [Environment]::SetEnvironmentVariable("MONGODB_URI", "mongodb://localhost:27017", "Process")
    [Environment]::SetEnvironmentVariable("MONGODB_DATABASE", "technews", "Process")
    [Environment]::SetEnvironmentVariable("ADMIN_EMAIL", $config.AdminEmail, "Process")
    [Environment]::SetEnvironmentVariable("ADMIN_PASSWORD", $config.AdminPassword, "Process")
    [Environment]::SetEnvironmentVariable("PORT", $config.Port, "Process")
    
    Write-Host "✅ Test environment variables set" -ForegroundColor Green
}

# Run all MongoDB tests
function Test-MongoDB {
    Write-Host "`n[4/5] Running MongoDB tests..." -ForegroundColor Yellow
    
    $success = Run-Test -TestName "MongoDB Connection" -TestPath "tests/api-tests/test-connection-string.js" -Critical $true
    return $success
}

# Run all article tests
function Test-Articles {
    Write-Host "`n>> Running Article Tests..." -ForegroundColor Yellow
      $tests = @(
        @{Name = "Article API"; Path = "tests/article-tests/test-article-api.js"},
        @{Name = "Article Slug Resolution"; Path = "tests/article-tests/verify-article-slug-fix.js"},
        @{Name = "Article Slug Fixes"; Path = "tests/article-tests/verify-slug-fix.js"},
        @{Name = "View Article Link"; Path = "tests/article-tests/verify-view-article-link.js"},
        @{Name = "Article Rendering"; Path = "tests/article-tests/verify-article-rendering.js"},
        @{Name = "Quick Article Rendering"; Path = "tests/article-tests/quick-verify-article-rendering.js"},
        @{Name = "Quick Slug Handling"; Path = "tests/article-tests/quick-check-slug-handling.js"},
        @{Name = "Comprehensive Article Rendering"; Path = "tests/article-tests/verify-article-rendering-comprehensive.js"; Critical = $true},
        @{Name = "Slug Handling Verification"; Path = "tests/article-tests/verify-slug-handling.js"; Critical = $true}
    )
    
    $success = $true
    foreach ($test in $tests) {
        $testSuccess = Run-Test -TestName $test.Name -TestPath $test.Path
        if (-not $testSuccess) {
            $success = $false
        }
    }
    
    return $success
}

# Run all authentication tests
function Test-Auth {
    Write-Host "`n>> Running Authentication Tests..." -ForegroundColor Yellow
    
    $tests = @(
        @{Name = "User Authentication"; Path = "tests/auth-tests/test-auth.js"}
    )
    
    $success = $true
    foreach ($test in $tests) {
        $testSuccess = Run-Test -TestName $test.Name -TestPath $test.Path
        if (-not $testSuccess) {
            $success = $false
        }
    }
    
    return $success
}

# Run all integration tests
function Test-Integration {
    Write-Host "`n>> Running Integration Tests..." -ForegroundColor Yellow
    
    $tests = @(
        @{Name = "All Links"; Path = "tests/integration-tests/verify-all-links.js"},
        @{Name = "Article Links"; Path = "tests/integration-tests/verify-article-links.js"}
    )
    
    $success = $true
    foreach ($test in $tests) {
        $testSuccess = Run-Test -TestName $test.Name -TestPath $test.Path
        if (-not $testSuccess) {
            $success = $false
        }
    }
    
    return $success
}

# Main test runner
function Start-TestRunner {
    $results = @{}
    
    # Prerequisites
    $mongodbRunning = Test-MongoDBConnection
    if (-not $mongodbRunning) {
        Write-Host "MongoDB connection failed. Some tests may fail." -ForegroundColor Yellow
    }
    
    $appRunning = Test-AppConnection
    if (-not $appRunning) {
        Write-Host "Application connection failed. Tests will likely fail." -ForegroundColor Red
        $continue = Read-Host "Continue anyway? (y/n)"
        if ($continue -ne "y") {
            return
        }
    }
    
    # Set up environment
    Set-TestEnvironment
    
    # Check for specific test group flags
    $testArticlesOnly = $env:TEST_ARTICLES_ONLY -eq $true
    $testIntegrationOnly = $env:TEST_INTEGRATION_ONLY -eq $true
    
    # Run selected test suites
    if ($config.MongoDB -and (-not $testArticlesOnly) -and (-not $testIntegrationOnly)) {
        $results.MongoDB = Test-MongoDB
    }
    
    if ($config.Articles -or $testArticlesOnly) {
        $results.Articles = Test-Articles
    }
    
    if ($config.Authentication -and (-not $testArticlesOnly) -and (-not $testIntegrationOnly)) {
        $results.Auth = Test-Auth
    }
    
    if ($config.Integration -or $testIntegrationOnly) {
        $results.Integration = Test-Integration
    }
    
    # Print summary
    Write-Host "`n[5/5] Test Results Summary:" -ForegroundColor Yellow
    Write-Host "==============================" -ForegroundColor Yellow
    
    $allPassed = $true
    foreach ($key in $results.Keys) {
        $status = if ($results[$key]) { "✅ PASSED" } else { "❌ FAILED" }
        $color = if ($results[$key]) { "Green" } else { "Red" }
        Write-Host "$key Tests: $status" -ForegroundColor $color
        
        if (-not $results[$key]) {
            $allPassed = $false
        }
    }
    
    Write-Host "==============================" -ForegroundColor Yellow
    if ($allPassed) {
        Write-Host "`n🎉 All tests passed!" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️ Some tests failed. Please review the logs above." -ForegroundColor Red
    }
}

# Start the test runner
Start-TestRunner
