# Setup Private GitHub Repository for Experimental Branch
#
# This script helps you set up a private GitHub repository for your experimental branch.
# It will create a new branch if it doesn't exist and configure the remote.
#
# Usage: ./setup-private-repo.ps1 -Username "YOUR_GITHUB_USERNAME" -RepoName "YOUR_PRIVATE_REPO_NAME"

param (
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "technews-app-private",
    
    [Parameter(Mandatory=$false)]
    [string]$BranchName = "experimental"
)

# Check if git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is not installed or not in your PATH. Please install Git."
    exit 1
}

# Check current repository status
$status = git status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Not in a git repository. Please run this script from your TechNews app directory."
    exit 1
}

Write-Host "Setting up private GitHub repository for experimental branch..." -ForegroundColor Cyan

# Step 1: Make sure we have the latest changes from origin
Write-Host "Pulling latest changes from origin..." -ForegroundColor Cyan
git pull origin master
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to pull latest changes. Please resolve any conflicts manually."
    exit 1
}

# Step 2: Check if experimental branch exists, create if not
$branches = git branch
if ($branches -notcontains "*$BranchName" -and $branches -notcontains "  $BranchName") {
    Write-Host "Creating new experimental branch..." -ForegroundColor Cyan
    git checkout -b $BranchName
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create experimental branch."
        exit 1
    }
} else {
    Write-Host "Experimental branch already exists, switching to it..." -ForegroundColor Cyan
    git checkout $BranchName
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to switch to experimental branch."
        exit 1
    }
}

# Step 3: Check if private remote already exists
$remotes = git remote
if ($remotes -contains "private") {
    $remoteUrl = git remote get-url private
    Write-Host "Private remote already exists pointing to: $remoteUrl" -ForegroundColor Yellow
    
    $confirmation = Read-Host "Do you want to update it to point to https://github.com/$Username/$RepoName.git? (y/n)"
    if ($confirmation -eq 'y') {
        git remote set-url private "https://github.com/$Username/$RepoName.git"
        Write-Host "Updated private remote URL." -ForegroundColor Green
    }
} else {
    # Add the new private repository as a remote
    Write-Host "Adding private remote..." -ForegroundColor Cyan
    git remote add private "https://github.com/$Username/$RepoName.git"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to add private remote."
        exit 1
    }
    Write-Host "Added private remote pointing to: https://github.com/$Username/$RepoName.git" -ForegroundColor Green
}

# Print instructions for the user
Write-Host "`nSetup Complete!" -ForegroundColor Green
Write-Host "`nIMPORTANT: Before pushing, make sure you've created the private repository on GitHub:" -ForegroundColor Yellow
Write-Host "1. Go to: https://github.com/new" -ForegroundColor Yellow
Write-Host "2. Repository name: $RepoName" -ForegroundColor Yellow
Write-Host "3. Make sure to select 'Private' visibility" -ForegroundColor Yellow
Write-Host "4. Do not initialize the repository with any files" -ForegroundColor Yellow
Write-Host "5. Click 'Create repository'" -ForegroundColor Yellow

Write-Host "`nOnce you've created the repository, push your experimental branch with:" -ForegroundColor Cyan
Write-Host "git push -u private $BranchName" -ForegroundColor White

Write-Host "`nTo verify your setup, run:" -ForegroundColor Cyan
Write-Host "git remote -v" -ForegroundColor White

Write-Host "`nYou're now on the '$BranchName' branch connected to your private repository." -ForegroundColor Green
