# GitHub Enhancement Plan Issue Creator
#
# This script reads the enhancement-plan.md file and automatically creates GitHub issues
# for each task in the plan. It requires the GitHub CLI (gh) to be installed and authenticated.
#
# Usage: ./create-github-issues.ps1

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

# Path to the enhancement plan
$enhancementPlanPath = "docs/enhancement-plan.md"

if (-not (Test-Path $enhancementPlanPath)) {
    Write-Error "Enhancement plan file not found at $enhancementPlanPath"
    exit 1
}

# Read the enhancement plan file
$content = Get-Content $enhancementPlanPath -Raw

# Regular expression to match tasks
$taskRegex = '- \[ \] \*\*([\d\.]+) ([^*]+)\*\*\s+- ([^\n]+)'

# Find all tasks in the plan
$matches = [regex]::Matches($content, $taskRegex)

$totalIssues = $matches.Count
$createdIssues = 0

Write-Host "Found $totalIssues tasks in the enhancement plan."
Write-Host "Starting to create GitHub issues..."

foreach ($match in $matches) {
    $taskId = $match.Groups[1].Value
    $taskName = $match.Groups[2].Value.Trim()
    $taskDescription = $match.Groups[3].Value.Trim()
    
    # Determine phase
    $phase = "Phase " + [int]$taskId.Split('.')[0]
    
    # Create issue title
    $issueTitle = "[$phase] $taskName"
    
    # Create issue body
    $issueBody = @"
## Enhancement Task
$taskDescription

## Enhancement Plan Reference
- Phase: $taskId
- Task: $taskName

## Acceptance Criteria
- [ ] Implementation is complete
- [ ] Tests are written and passing
- [ ] Documentation is updated

## Estimated Effort
- [ ] Small (1-2 days)
- [ ] Medium (3-5 days)
- [ ] Large (1-2 weeks)

---
*This issue was automatically created from the enhancement plan.*
"@
    
    # Create the issue using GitHub CLI
    Write-Host "Creating issue: $issueTitle"
    gh issue create --title "$issueTitle" --body "$issueBody" --label "enhancement" --label $phase.ToLower().Replace(' ', '-')
    
    $createdIssues++
    Write-Host "Created $createdIssues of $totalIssues issues..." -ForegroundColor Green
    
    # Sleep to avoid rate limiting
    Start-Sleep -Seconds 1
}

Write-Host "Successfully created $createdIssues GitHub issues from the enhancement plan." -ForegroundColor Green
