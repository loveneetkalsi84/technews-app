# GitHub Milestone Creator
#
# This script creates GitHub milestones for each phase of the enhancement plan.
# It requires the GitHub CLI (gh) to be installed and authenticated.
#
# Usage: ./create-github-milestones.ps1

# Ensure gh CLI is installed
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue
if (-not $ghInstalled) {
    Write-Error "GitHub CLI (gh) is not installed. Please install it from https://cli.github.com/"
    exit 1
}

# Check if logged in to GitHub
$loginStatus = gh auth status -h github.com 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Not logged in to GitHub. Please run 'gh auth login' first."
    exit 1
}

# Milestones to create based on the implementation plan
$milestones = @(
    @{
        Title = "Milestone 1: Authentication & User Experience"
        Description = "Enhanced error messaging, password recovery, user profile management, and theme persistence"
        DueDate = "2025-06-21"
    },
    @{
        Title = "Milestone 2: Content Management Enhancements"
        Description = "Advanced rich text editor, article versioning, draft management, and SEO optimization tools"
        DueDate = "2025-07-21"
    },
    @{
        Title = "Milestone 3: Admin Dashboard Improvements"
        Description = "Analytics dashboard, user management, and content moderation tools"
        DueDate = "2025-08-21"
    },
    @{
        Title = "Milestone 4: Performance Optimization"
        Description = "Frontend and backend optimizations, improved mobile responsiveness"
        DueDate = "2025-09-21"
    },
    @{
        Title = "Milestone 5: New Features"
        Description = "Newsletter subscription, social features, and notification system"
        DueDate = "2025-10-21"
    }
)

Write-Host "Creating GitHub milestones..."

foreach ($milestone in $milestones) {
    Write-Host "Creating milestone: $($milestone.Title)"
    
    # Use GitHub CLI to create the milestone
    gh api repos/:owner/:repo/milestones -f title="$($milestone.Title)" -f description="$($milestone.Description)" -f due_on="$($milestone.DueDate)T00:00:00Z"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Created milestone: $($milestone.Title)" -ForegroundColor Green
    } else {
        Write-Host "Failed to create milestone: $($milestone.Title)" -ForegroundColor Red
    }
    
    # Sleep to avoid rate limiting
    Start-Sleep -Seconds 1
}

Write-Host "Successfully created all milestones." -ForegroundColor Green
