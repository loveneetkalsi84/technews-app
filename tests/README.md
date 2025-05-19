# TechNews Testing Guide

## Test Directory Structure

```
tests/
  ├── admin-tests/       # Tests for admin dashboard features
  ├── api-tests/         # Tests for API endpoints
  ├── article-tests/     # Tests for article features
  ├── auth-tests/        # Tests for authentication
  └── integration-tests/ # End-to-end integration tests
```

## Key Test Files

### Article Tests

- `quick-verify-article-rendering.js` - Quick article rendering test (works without MongoDB)
- `quick-check-slug-handling.js` - Quick slug handling test (works without MongoDB)
- `verify-article-rendering.js` - Standard article rendering test
- `verify-article-rendering-comprehensive.js` - Comprehensive article rendering test
- `verify-slug-fix.js` - Standard slug fix verification
- `verify-slug-handling.js` - Comprehensive slug handling test
- `test-article-api.js` - Article API tests

### Integration Tests

- `verify-all-links.js` - Tests all links in the application
- `verify-article-links.js` - Tests article links specifically
- `verify-article-links-mock.js` - Tests article links with mock database

## Running Tests

### Using the Test Runner

The main test runner script (`run-tests.ps1`) automates the process of running tests. It:

1. Checks prerequisites (MongoDB, application running)
2. Sets up test environment variables
3. Runs tests and reports results

Run all tests:
```
npm test
```

Run only article tests:
```
npm run test:articles
```

Run only integration tests:
```
npm run test:integration
```

### Testing with Mock Database

For testing without MongoDB, use:

```
npm run enable-mock-db
npm run test:article-features
```

To verify article links with mock database:
```
npm run verify-mock-links
```

When finished, return to real MongoDB:
```
npm run disable-mock-db
```

## Output

Test output is saved to:

- Logs: `test-output/*.log`
- Screenshots: `test-output/screenshots/`

## Adding New Tests

1. Place tests in the appropriate directory based on functionality
2. Update the test runner script if needed
3. Add an npm script to package.json for running the new test

## Mock Database

The mock database implementation (`app/lib/mock-mongodb.ts`) provides:

- Sample users with different roles
- Sample articles with various slugs (including case variations and special characters)
- A simulated MongoDB API that matches the real MongoDB interface

Toggle between real and mock database with:
```
npm run enable-mock-db  # Use mock database
npm run disable-mock-db # Use real MongoDB
```
