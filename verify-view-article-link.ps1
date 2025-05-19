# Script to verify Article View Link fix

Write-Host "Running Article View Link Fix Verification" -ForegroundColor Green

# Step 1: Restart the Next.js development server
Write-Host "Restarting Next.js development server..." -ForegroundColor Yellow
# Check if the server is running
$serverProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next dev*" }
if ($serverProcess) {
    Write-Host "Stopping existing Next.js server..." -ForegroundColor Yellow
    Stop-Process -Id $serverProcess.Id -Force
    Start-Sleep -Seconds 2
}

# Start the Next.js server in a new window
Start-Process powershell -ArgumentList "-Command cd $PSScriptRoot; npm run dev"
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 2: Run the debug script to check article slugs
Write-Host "`nChecking for article slug issues in the database..." -ForegroundColor Yellow
node $PSScriptRoot\debug-article-by-slug.js "test-article-view-link"

# Step 3: Run the test script
Write-Host "`nRunning View Article link test..." -ForegroundColor Yellow
node $PSScriptRoot\test-view-article-link.js

Write-Host "`nVerification complete!" -ForegroundColor Green
