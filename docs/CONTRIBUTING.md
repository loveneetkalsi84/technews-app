# Contributing to TechNews

Thank you for your interest in contributing to the TechNews application! This guide will help you understand our development process and how we use GitHub to track our work.

## Development Process

### 1. Find an Issue to Work On
- All planned work is tracked as issues in our GitHub repository
- Issues are organized using the enhancement plan phases
- Issues are labeled by priority, type, and difficulty

### 2. Create a Branch
- Create a new branch from `master` for your work
- Use a descriptive name that includes the issue number, e.g., `feature/123-password-strength-indicator`

### 3. Make Your Changes
- Follow coding standards and conventions
- Write tests for your changes
- Keep commits small and focused
- Reference the issue number in commit messages

### 4. Create a Pull Request
- Submit a PR to the `master` branch
- Fill out the PR template with details about your changes
- Link the PR to the issue it resolves
- Request reviews from team members

### 5. Review and Merge
- Address any feedback from code reviews
- Make sure the CI pipeline passes
- Once approved, the PR will be merged into `master`

## GitHub Issue Labels

We use the following labels to organize our issues:

- **Type:**
  - `feature`: New functionality
  - `bug`: Something that needs to be fixed
  - `enhancement`: Improvements to existing features
  - `documentation`: Documentation-related tasks

- **Priority:**
  - `high`: Critical issues that need immediate attention
  - `medium`: Important but not urgent
  - `low`: Nice to have, can be addressed later

- **Phase:**
  - `phase-1`: Authentication and User Experience
  - `phase-2`: Content Management Enhancements
  - `phase-3`: Admin Dashboard Improvements
  - `phase-4`: Performance Optimization
  - `phase-5`: New Features

- **Difficulty:**
  - `easy`: Good for beginners
  - `medium`: Requires some experience
  - `hard`: Complex tasks requiring deep understanding

## Enhancement Plan

Our complete enhancement plan is documented in [enhancement-plan.md](enhancement-plan.md). This plan outlines all the features and improvements we intend to implement, organized into five phases.

For detailed implementation guidelines of specific features, check the individual implementation documents in the `docs` directory, such as [auth-enhancement-implementation.md](auth-enhancement-implementation.md) for authentication enhancements.

## Getting Started

To set up your development environment:

1. Clone the repository
2. Run `npm install` to install dependencies
3. Use the provided scripts in the root directory to set up MongoDB
4. Run `npm run dev` to start the development server

## Questions?

If you have any questions or need help, feel free to:
- Ask questions in issue comments
- Reach out to the team leads
- Create a new issue with the `question` label
