# Start the Next.js development server on port 3002
# This script simplifies the process of starting the server for testing

$port = 3002

Write-Host "Starting TechNews development server on port $port..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

# Change to the project directory if not already there
Set-Location -Path "c:\xampp\htdocs\TechNews\technews-app"

# Start the Next.js development server on port 3002
npm run dev -- -p $port
