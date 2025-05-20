# TechNews Article Tests Runner
# This script specifically runs tests for article features with the mock database

Write-Host "`n===============================================================" -ForegroundColor Cyan
Write-Host "   TechNews Article Tests Runner" -ForegroundColor Cyan
Write-Host "===============================================================`n" -ForegroundColor Cyan

# Configuration
$config = @{
    Port = 3002
    UseMockDB = $true
}

# Check if the app is running
function Test-AppConnection {
    Write-Host "`n[1/3] Checking TechNews application..." -ForegroundColor Yellow
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
    Write-Host "`n[2/3] Setting up test environment..." -ForegroundColor Yellow
    
    # Set environment variables
    [Environment]::SetEnvironmentVariable("USE_MOCK_DB", "true", "Process")
    [Environment]::SetEnvironmentVariable("PORT", $config.Port, "Process")
    
    Write-Host "✅ Test environment variables set" -ForegroundColor Green
}

# Run all article tests
function Test-ArticleFeatures {
    Write-Host "`n[3/3] Running Article Feature Tests..." -ForegroundColor Yellow
      $tests = @(
        @{Name = "Quick Article Rendering"; Path = "tests/article-tests/quick-verify-article-rendering.js"},
        @{Name = "Quick Slug Handling"; Path = "tests/article-tests/quick-check-slug-handling.js"},
        @{Name = "Comprehensive Article Rendering"; Path = "tests/article-tests/verify-article-rendering-comprehensive.js"; Critical = $true},
        @{Name = "Slug Handling Verification"; Path = "tests/article-tests/verify-slug-handling.js"; Critical = $true},
        @{Name = "Article Links Verification"; Path = "tests/integration-tests/verify-article-links-mock.js"; Critical = $true}
    )
    
    $results = @{
        Total = $tests.Count
        Passed = 0
        Failed = 0
        Tests = @()
    }
    
    foreach ($test in $tests) {
        $isCritical = if ($test.ContainsKey('Critical')) { $test.Critical } else { $false }
        $testSuccess = Run-Test -TestName $test.Name -TestPath $test.Path -Critical $isCritical
        
        $results.Tests += @{
            Name = $test.Name
            Path = $test.Path
            Success = $testSuccess
            Critical = $isCritical
        }
        
        if ($testSuccess) {
            $results.Passed++
        } else {
            $results.Failed++
            if ($isCritical) {
                Write-Host "A critical test failed. Stopping article tests." -ForegroundColor Red
                break
            }
        }
    }
    
    return $results
}

# Main function
function Start-ArticleTests {
    # Check if the app is running
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
    
    # Run article tests
    $results = Test-ArticleFeatures
    
    # Print summary
    Write-Host "`n Test Results Summary:" -ForegroundColor Yellow
    Write-Host "==============================" -ForegroundColor Yellow
    Write-Host "Total Tests: $($results.Total)" -ForegroundColor Blue
    Write-Host "Passed: $($results.Passed)" -ForegroundColor Green
    Write-Host "Failed: $($results.Failed)" -ForegroundColor Red
    Write-Host "==============================" -ForegroundColor Yellow
    
    # Show detailed results
    Write-Host "`nDetailed Results:" -ForegroundColor Yellow
    foreach ($test in $results.Tests) {        $status = if ($test.Success) { "✅ PASSED" } else { "❌ FAILED" }
        $color = if ($test.Success) { "Green" } else { "Red" }
        $criticalText = if ($test.Critical) { " (CRITICAL)" } else { "" }
        Write-Host "$($test.Name)$criticalText`: $status" -ForegroundColor $color
    }
    
    if ($results.Failed -eq 0) {
        Write-Host "`n🎉 All article tests passed!" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️ Some article tests failed. Please review the logs above." -ForegroundColor Red
    }
}

# Start the test runner
Start-ArticleTests
