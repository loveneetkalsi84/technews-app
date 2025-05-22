# TechNewsApp Task Tracking Template

This template provides a standardized format for tracking tasks in GitHub issues. Copy and paste this template when creating new issues for the TechNewsApp improvement project.

## User Story Template

```markdown
## User Story
As a [type of user], I want [goal] so that [benefit].

## Background
[Provide context and explanation of why this feature is important]

## Tasks
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Details
[Provide any technical implementation details, API specifications, etc.]

## UI/UX Design
[Link to mockups or describe UI/UX expectations]

## Dependencies
[List any dependencies or prerequisites]

## Story Points
[Estimate of effort: 1, 2, 3, 5, 8, 13, 21]

## Sprint
[Target sprint for implementation]

## Milestone
[Associated milestone]
```

## Bug Report Template

```markdown
## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Screenshots/Videos
[If applicable]

## Environment
- Browser: [e.g. Chrome 98]
- OS: [e.g. Windows 10]
- Device: [e.g. Desktop, Mobile]

## Severity
[Critical, High, Medium, Low]

## Regression
[Is this a regression from previous behavior? Yes/No]

## Suggested Fix
[If you have ideas about the cause or solution]
```

## Technical Task Template

```markdown
## Task Description
[Clear description of the technical task]

## Implementation Details
[Detailed explanation of what needs to be done]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Dependencies
[List any dependencies or prerequisites]

## Estimated Effort
[Story points or time estimate]

## Priority
[High, Medium, Low]

## Notes
[Any additional notes]
```

## Task States

When tracking tasks, use the following states:

1. **Backlog** - Task identified but not yet ready for development
2. **Ready** - Task is ready for development with all details
3. **In Progress** - Task is being actively worked on
4. **Review** - Task is complete and awaiting review/testing
5. **Done** - Task is complete, tested, and approved

## Labels

Use the following labels to categorize issues:

- `enhancement` - New features or improvements
- `bug` - Something isn't working
- `documentation` - Documentation updates
- `tech-debt` - Code improvement without changing functionality
- `question` - Further information is requested
- `priority-high` - High priority issues
- `priority-medium` - Medium priority issues
- `priority-low` - Low priority issues
- `sprint-1` through `sprint-10` - For assigning to sprints
- `milestone-1` through `milestone-5` - For tracking milestone progress

## Assignment Workflow

1. **Selection**: Team members select tasks from "Ready" state
2. **Assignment**: Assign the issue to yourself
3. **Status Update**: Move to "In Progress"
4. **Branch Creation**: Create a feature branch from main
5. **Completion**: Create PR and link to issue
6. **Review**: Get PR reviewed and approved
7. **Merge**: Merge to main branch
8. **Closure**: Close the issue

## Status Reporting

For each task, provide brief status updates as comments:

```markdown
## Status Update [YYYY-MM-DD]
- Completed: [list of completed subtasks]
- In Progress: [current focus]
- Blocked: [any blockers with action items]
- Next: [next steps]
```

## Definition of Done

An issue is considered "Done" when:

1. All acceptance criteria are met
2. Code is reviewed and approved
3. Tests are written and passing
4. Documentation is updated
5. The feature is deployed to staging environment
6. QA verification is complete
7. The PR is merged to main branch
