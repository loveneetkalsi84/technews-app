# Create GitHub Issues for Sprint 1
#
# This script creates GitHub issues for Sprint 1 tasks using the GitHub CLI.
# Make sure you have GitHub CLI installed and are authenticated.
#
# Usage: ./create-sprint1-issues.ps1

# Ensure GitHub CLI is installed
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

# Get repository owner and name from git remote
$remote = git remote get-url origin
$repoPath = $remote -replace "https://github.com/", "" -replace "\.git$", ""
$repoOwner, $repoName = $repoPath -split "/"

if (-not $repoOwner -or -not $repoName) {
    Write-Error "Could not determine repository owner and name from remote URL."
    exit 1
}

Write-Host "Creating issues for Sprint 1 in repository: $repoOwner/$repoName" -ForegroundColor Cyan

# Issues to create for Sprint 1
$issues = @(
    @{
        Title = "[Sprint 1] Enhanced Authentication Error Handling"
        Body = @"
## User Story
As a user, I want to see clear and specific error messages when authentication fails so that I can understand what went wrong and how to fix it.

## Background
Currently, authentication errors display generic messages that don't provide enough guidance to users. We need to improve error handling to give users clear, actionable feedback.

## Tasks
- [ ] Review current error handling in NextAuth configuration
- [ ] Create mapping of error codes to user-friendly messages
- [ ] Implement custom error display component
- [ ] Add client-side validation with immediate feedback
- [ ] Test different error scenarios (invalid credentials, account locked, etc.)

## Acceptance Criteria
- [ ] Different error types display appropriate messages
- [ ] Error messages are clear and provide actionable guidance
- [ ] Error states are visually distinct and accessible
- [ ] Internationalization support for error messages

## Technical Details
- Modify NextAuth configuration in `app/api/auth/[...nextauth]/route.ts`
- Create new error component in `app/components/auth/AuthError.tsx`
- Update login page to use new error component

## Story Points
5

## Sprint
Sprint 1

## Milestone
Milestone 1: Authentication & User Experience
"@
        Labels = @("enhancement", "sprint-1", "milestone-1", "priority-high")
    },
    @{
        Title = "[Sprint 1] Password Strength Indicator"
        Body = @"
## User Story
As a new user, I want to see feedback on my password strength during signup so that I can create a secure password.

## Background
We currently don't provide any feedback on password strength during signup, which can lead to users creating weak passwords.

## Tasks
- [ ] Research password strength libraries (zxcvbn recommended)
- [ ] Create password strength component with visual indicator
- [ ] Implement real-time feedback as user types
- [ ] Add specific improvement suggestions based on password analysis
- [ ] Style component to match application design

## Acceptance Criteria
- [ ] Strength indicator updates in real-time as user types
- [ ] At least 4 levels of password strength are visually indicated
- [ ] Specific suggestions for improving password are provided
- [ ] Component is accessible (works with screen readers)

## Technical Details
- Use zxcvbn library for password analysis
- Create new component: `app/components/auth/PasswordStrengthMeter.tsx`
- Integrate into signup form

## UI/UX Design
Password strength meter should have the following levels:
- Very Weak (red)
- Weak (orange)
- Medium (yellow)
- Strong (light green)
- Very Strong (green)

## Story Points
8

## Sprint
Sprint 1

## Milestone
Milestone 1: Authentication & User Experience
"@
        Labels = @("enhancement", "sprint-1", "milestone-1", "priority-high")
    },
    @{
        Title = "[Sprint 1] Password Recovery Flow"
        Body = @"
## User Story
As a user who forgot my password, I want a secure way to reset it so that I can regain access to my account.

## Background
Currently, users who forget their passwords have no self-service way to reset them, requiring manual intervention.

## Tasks
- [ ] Create forgot password page with email input
- [ ] Implement API endpoint for password reset requests
- [ ] Set up email sending functionality for reset links
- [ ] Create reset password page with token validation
- [ ] Implement new password form with confirmation
- [ ] Add success/error notifications
- [ ] Create email templates for password reset

## Acceptance Criteria
- [ ] User can request password reset with email
- [ ] Reset link is sent via email with secure token
- [ ] Token has expiration time (24 hours)
- [ ] New password requires confirmation
- [ ] Process includes success/error notifications
- [ ] Email templates are professional and branded

## Technical Details
- Create new pages:
  - `app/(auth)/forgot-password/page.tsx`
  - `app/(auth)/reset-password/[token]/page.tsx`
- Create new API endpoints:
  - `app/api/auth/forgot-password/route.ts`
  - `app/api/auth/reset-password/route.ts`
- Set up email service integration

## Dependencies
- Email service credentials needed (SendGrid or similar)

## Story Points
13

## Sprint
Sprint 1

## Milestone
Milestone 1: Authentication & User Experience
"@
        Labels = @("enhancement", "sprint-1", "milestone-1", "priority-high")
    },
    @{
        Title = "[Sprint 1] User Profile Page"
        Body = @"
## User Story
As a logged-in user, I want to access and edit my profile information so that I can keep my details up to date.

## Background
Users currently cannot view or edit their profile information after registration.

## Tasks
- [ ] Design user profile page layout
- [ ] Create profile page route and component
- [ ] Implement form for editable user fields
- [ ] Add form validation
- [ ] Create API endpoint for profile updates
- [ ] Add success/error notifications for updates

## Acceptance Criteria
- [ ] User can view their current profile information
- [ ] Form allows editing of name, bio, and other details
- [ ] Changes persist when user returns to the page
- [ ] Form includes proper validation
- [ ] User receives confirmation when changes are saved

## Technical Details
- Create new page: `app/(auth)/profile/page.tsx`
- Create new API endpoint: `app/api/user/profile/route.ts`
- Update User model for additional profile fields

## UI/UX Design
Profile page should include:
- Profile picture (placeholder if none)
- Name, email, bio fields
- Save button
- Feedback on save (success/error)

## Story Points
8

## Sprint
Sprint 1

## Milestone
Milestone 1: Authentication & User Experience
"@
        Labels = @("enhancement", "sprint-1", "milestone-1", "priority-medium")
    }
)

# Create each issue
foreach ($issue in $issues) {
    Write-Host "Creating issue: $($issue.Title)" -ForegroundColor Cyan
    
    # Prepare labels parameter
    $labelsParam = $issue.Labels -join ","
    
    # Create the issue using GitHub CLI
    gh issue create --repo "$repoOwner/$repoName" --title "$($issue.Title)" --body "$($issue.Body)" --label "$labelsParam"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Created issue: $($issue.Title)" -ForegroundColor Green
    } else {
        Write-Host "Failed to create issue: $($issue.Title)" -ForegroundColor Red
    }
    
    # Sleep to avoid rate limiting
    Start-Sleep -Seconds 1
}

Write-Host "`nSuccessfully created Sprint 1 issues." -ForegroundColor Green
Write-Host "Note: You may need to manually assign these issues to the appropriate milestone in GitHub." -ForegroundColor Yellow
