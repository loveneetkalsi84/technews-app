# Start MongoDB and Next.js TechNews application
# This script handles starting both the database and web server

$ErrorActionPreference = "Stop"

# Define paths and configuration
$projectRoot = "c:\xampp\htdocs\TechNews\technews-app"
$dataDir = Join-Path $projectRoot "data\db"
$logDir = Join-Path $projectRoot "data\log"
$port = 3002

# Create necessary directories
if (!(Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
    Write-Host "Created MongoDB data directory: $dataDir" -ForegroundColor Green
}

if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    Write-Host "Created MongoDB log directory: $logDir" -ForegroundColor Green
}

# Check if MongoDB is already running
$mongoRunning = Test-NetConnection -ComputerName localhost -Port 27017 -InformationLevel Quiet -ErrorAction SilentlyContinue

if (-not $mongoRunning) {
    Write-Host "Starting MongoDB server..." -ForegroundColor Cyan
    
    # Find MongoDB executable
    $mongodPath = "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe"
    if (-not (Test-Path $mongodPath)) {
        # Try other common versions
        foreach ($version in @("7.0", "6.0", "5.0", "4.4")) {
            $testPath = "C:\Program Files\MongoDB\Server\$version\bin\mongod.exe"
            if (Test-Path $testPath) {
                $mongodPath = $testPath
                break
            }
        }
    }
    
    if (-not (Test-Path $mongodPath)) {
        Write-Host "MongoDB executable not found. Please install MongoDB or provide the path to mongod.exe." -ForegroundColor Red
        exit 1
    }
    
    # Start MongoDB as a background process
    Start-Process $mongodPath -ArgumentList "--dbpath=`"$dataDir`"", "--logpath=`"$logDir\mongodb.log`"", "--logappend" -WindowStyle Minimized
    
    Write-Host "Waiting for MongoDB to start..." -ForegroundColor Yellow
    
    # Wait for MongoDB to start
    $attempts = 0
    $maxAttempts = 10
    $started = $false
    
    while ($attempts -lt $maxAttempts -and -not $started) {
        Start-Sleep -Seconds 2
        $attempts++
        
        $started = Test-NetConnection -ComputerName localhost -Port 27017 -InformationLevel Quiet -ErrorAction SilentlyContinue
        
        if ($started) {
            Write-Host "MongoDB started successfully!" -ForegroundColor Green
        } elseif ($attempts -eq $maxAttempts) {
            Write-Host "Failed to start MongoDB. Please check logs at $logDir\mongodb.log" -ForegroundColor Red
            exit 1
        } else {
            Write-Host "Waiting for MongoDB to start (attempt $attempts/$maxAttempts)..." -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "MongoDB is already running." -ForegroundColor Green
}

# Ensure the MongoDB URI is set correctly in .env.local
$envLocalPath = Join-Path $projectRoot ".env.local"
if (Test-Path $envLocalPath) {
    $envContent = Get-Content $envLocalPath -Raw
    
    # Check if MongoDB URI is set correctly
    if ($envContent -notmatch "MONGODB_URI=mongodb://localhost:27017/technews") {
        $envContent = $envContent -replace "MONGODB_URI=.*", "MONGODB_URI=mongodb://localhost:27017/technews"
        Set-Content -Path $envLocalPath -Value $envContent
        Write-Host "Updated MONGODB_URI in .env.local file." -ForegroundColor Green
    }
} else {
    # Create minimal .env.local if it doesn't exist
    @"
MONGODB_URI=mongodb://localhost:27017/technews
NEXTAUTH_SECRET=technews_secret_key_for_development
NEXTAUTH_URL=http://localhost:$port
"@ | Set-Content -Path $envLocalPath
    Write-Host "Created .env.local file with MongoDB connection." -ForegroundColor Green
}

# Start Next.js application
Write-Host ""
Write-Host "Starting TechNews application on port $port..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Yellow
Write-Host ""

# Set working directory
Set-Location -Path $projectRoot

# Start Next.js server
npx next dev -p $port
