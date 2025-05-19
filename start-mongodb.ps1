# Start MongoDB directly without relying on the Windows service
# This script will run MongoDB with a data directory in the project folder

$ErrorActionPreference = "Stop"

# Define paths
$projectRoot = "c:\xampp\htdocs\TechNews\technews-app"
$dataDir = Join-Path $projectRoot "data\db"
$logDir = Join-Path $projectRoot "data\log"

# Create directories if they don't exist
if (!(Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
    Write-Host "Created data directory: $dataDir" -ForegroundColor Green
}

if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    Write-Host "Created log directory: $logDir" -ForegroundColor Green
}

# Get MongoDB installation path
$mongodPath = (Get-Command mongod -ErrorAction SilentlyContinue).Source

if (!$mongodPath) {
    # Try common installation locations
    $possiblePaths = @(
        "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe",
        "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe",
        "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe",
        "C:\Program Files\MongoDB\Server\4.4\bin\mongod.exe"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $mongodPath = $path
            break
        }
    }
}

if (!$mongodPath) {
    Write-Host "MongoDB executable not found. Please install MongoDB or provide the path to mongod.exe." -ForegroundColor Red
    exit 1
}

Write-Host "Starting MongoDB with data directory: $dataDir" -ForegroundColor Cyan
Write-Host "MongoDB logs will be saved to: $logDir\mongodb.log" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop MongoDB" -ForegroundColor Yellow

# Update the connection string in .env.local to use the local MongoDB
$envPath = Join-Path $projectRoot ".env.local"
$envContent = Get-Content $envPath -Raw
$envContent = $envContent -replace "MONGODB_URI=.*", "MONGODB_URI=mongodb://localhost:27017/technews"
Set-Content -Path $envPath -Value $envContent

# Run MongoDB
& $mongodPath --dbpath="$dataDir" --logpath="$logDir\mongodb.log" --logappend
