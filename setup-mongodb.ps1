# MongoDB Setup Helper Script
# This script helps you set up and test MongoDB connection
# Run with: .\setup-mongodb.ps1

# Define helper functions
function Write-Header {
    param ([string]$message)
    Write-Host ""
    Write-Host "=====================================================" -ForegroundColor Cyan
    Write-Host " $message" -ForegroundColor Cyan
    Write-Host "=====================================================" -ForegroundColor Cyan
}

function Write-Success {
    param ([string]$message)
    Write-Host "✅ $message" -ForegroundColor Green
}

function Write-Error {
    param ([string]$message)
    Write-Host "❌ $message" -ForegroundColor Red
}

function Write-Info {
    param ([string]$message)
    Write-Host "ℹ️ $message" -ForegroundColor Yellow
}

function Test-MongoDBConnection {
    param ([string]$connectionString)
    
    Write-Info "Testing connection to: $($connectionString -replace 'mongodb(\+srv)?:\/\/([^:]+):([^@]+)@', 'mongodb$1://[username]:[password]@')"
    
    try {
        # Create a temporary file with the connection test
        $tempFile = [System.IO.Path]::GetTempFileName() + ".js"
        @"
const { MongoClient } = require('mongodb');

async function testConnection() {
    console.log('Testing MongoDB connection...');
    const client = new MongoClient('$connectionString', { 
        connectTimeoutMS: 5000, 
        serverSelectionTimeoutMS: 5000 
    });
    
    try {
        await client.connect();
        console.log('Connection successful!');
        const db = client.db();
        const collections = await db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name).join(', ') || 'None');
        return true;
    } catch (err) {
        console.error('Connection failed:', err.message);
        return false;
    } finally {
        await client.close();
    }
}

testConnection()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(err => {
        console.error('Test error:', err);
        process.exit(1);
    });
"@ | Out-File -FilePath $tempFile -Encoding utf8
        
        # Run the test
        $result = node $tempFile
        $success = $LASTEXITCODE -eq 0
        
        # Display results
        if ($success) {
            Write-Success "MongoDB connection test passed!"
            foreach ($line in $result) {
                if ($line -match "Connection successful") {
                    Write-Success $line
                } elseif ($line -match "Available collections") {
                    Write-Info $line
                } else {
                    Write-Host $line
                }
            }
        } else {
            Write-Error "MongoDB connection test failed!"
            foreach ($line in $result) {
                if ($line -match "Connection failed") {
                    Write-Error $line
                } else {
                    Write-Host $line
                }
            }
        }
        
        # Clean up
        Remove-Item $tempFile -Force
        
        return $success
        
    } catch {
        Write-Error "Error running test: $_"
        return $false
    }
}

function Update-EnvFile {
    param ([string]$connectionString)
    
    try {
        $envPath = ".env.local"
        
        # Check if file exists
        if (Test-Path $envPath) {
            # Read existing content
            $content = Get-Content $envPath -Raw
            
            # Check if MONGODB_URI already exists
            if ($content -match 'MONGODB_URI=') {
                # Replace existing MONGODB_URI
                $content = $content -replace 'MONGODB_URI=.*', "MONGODB_URI=$connectionString"
            } else {
                # Add MONGODB_URI
                $content += "`nMONGODB_URI=$connectionString"
            }
            
            # Write back to file
            $content | Out-File -FilePath $envPath -Encoding utf8
        } else {
            # Create new file with MONGODB_URI
            "MONGODB_URI=$connectionString" | Out-File -FilePath $envPath -Encoding utf8
        }
        
        Write-Success "Updated $envPath with MongoDB connection string"
        return $true
    } catch {
        Write-Error "Failed to update .env.local file: $_"
        return $false
    }
}

# Check MongoDB local service
function Test-LocalMongoDB {
    Write-Header "Checking Local MongoDB"
    
    try {
        $service = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
        
        if ($service) {
            Write-Info "MongoDB service found: $($service.Status)"
            
            if ($service.Status -ne 'Running') {
                Write-Info "Attempting to start MongoDB service..."
                Start-Service MongoDB -ErrorAction SilentlyContinue
                
                $service = Get-Service -Name MongoDB
                if ($service.Status -eq 'Running') {
                    Write-Success "MongoDB service started successfully"
                } else {
                    Write-Error "Failed to start MongoDB service"
                    return $false
                }
            } else {
                Write-Success "MongoDB service is already running"
            }
            
            # Test connection to local MongoDB
            $localConnection = "mongodb://localhost:27017/technews"
            $testResult = Test-MongoDBConnection -connectionString $localConnection
            
            if ($testResult) {
                return $localConnection
            } else {
                Write-Error "Local MongoDB service is running but connection test failed"
                return $false
            }
        } else {
            Write-Info "MongoDB service not found on this system"
            return $false
        }
    } catch {
        Write-Error "Error checking MongoDB service: $_"
        return $false
    }
}

# Main script
Write-Header "MongoDB Setup Helper"

Write-Info "This script will help you set up MongoDB for your TechNews application"
Write-Info "We'll check for a local MongoDB installation first, then help with MongoDB Atlas if needed"

# Try local MongoDB first
$localMongoResult = Test-LocalMongoDB

if ($localMongoResult) {
    Write-Success "Local MongoDB is available and working!"
    $useLocal = Read-Host "Would you like to use local MongoDB? (y/n)"
    
    if ($useLocal -eq 'y' -or $useLocal -eq 'Y') {
        Update-EnvFile -connectionString $localMongoResult
        Write-Success "Local MongoDB configured successfully!"
        exit 0
    }
}

# MongoDB Atlas Setup
Write-Header "MongoDB Atlas Setup"

Write-Info "Since local MongoDB is not available or you chose not to use it,"
Write-Info "let's configure MongoDB Atlas (cloud-hosted MongoDB)"
Write-Info ""
Write-Info "If you don't have a MongoDB Atlas account:"
Write-Info "1. Go to https://www.mongodb.com/cloud/atlas/register"
Write-Info "2. Create a free account and follow the setup instructions in MONGODB-ATLAS-SETUP.md"
Write-Info ""

$atlasUri = Read-Host "Please enter your MongoDB Atlas connection string (mongodb+srv://...)"

if ($atlasUri) {
    $testResult = Test-MongoDBConnection -connectionString $atlasUri
    
    if ($testResult) {
        Update-EnvFile -connectionString $atlasUri
        Write-Success "MongoDB Atlas configured successfully!"
        exit 0
    } else {
        Write-Error "MongoDB Atlas connection failed"
        Write-Info "Please check your connection string and make sure:"
        Write-Info "1. You've replaced <username> and <password> with your actual credentials"
        Write-Info "2. Your IP address is whitelisted in Atlas Network Access"
        Write-Info "3. Your user has the correct permissions"
        Write-Info ""
        Write-Info "For more help, see MONGODB-ATLAS-SETUP.md"
        exit 1
    }
} else {
    Write-Error "No connection string provided"
    Write-Info "Please follow the instructions in MONGODB-ATLAS-SETUP.md to set up MongoDB Atlas"
    exit 1
}
