# TechNews API Troubleshooting Guide

## Common Issues and Solutions

### 1. "Parsing ecmascript source code failed"

This error typically occurs when there's a syntax error in your JavaScript code. However, in the context of the TechNews application, this might also appear when:

- The server isn't running on the expected port
- There's a network connection issue
- The route handler is returning malformed JSON

**Solution:**

1. Ensure the development server is running:
   ```powershell
   # Start the server on port 3002
   cd c:\xampp\htdocs\TechNews\technews-app
   npm run dev -- -p 3002
   ```

2. Check your JavaScript syntax:
   ```javascript
   // Make sure all brackets, parentheses, and quotes are properly closed
   // Use a linter (ESLint) to help identify syntax errors
   ```

3. Use the comprehensive test script:
   ```powershell
   node test-comprehensive.js
   ```

### 2. Authentication Issues (401/403 Errors)

If you're getting authentication errors when trying to submit articles:

**Solution:**

1. Use the test endpoint that bypasses authentication:
   - In `test-article-api.js`, set `USE_TEST_ENDPOINT = true`
   - Or use `test-comprehensive.js` with default settings

2. Log in through the web interface:
   - Visit `http://localhost:3002/login`
   - Log in with your admin credentials
   - Try the API request again

3. Test authentication specifically:
   ```powershell
   node test-auth.js
   ```

### 3. Database Connection Issues

If you're seeing database connection errors:

**Solution:**

1. Ensure MongoDB is running:
   - Check your local MongoDB instance or Atlas connection
   - Verify the connection string in your `.env` file

2. Test the database connection directly:
   ```powershell
   # Run the database test script
   node test-article-direct.js
   ```

3. Check the test-connection endpoint:
   ```
   http://localhost:3002/api/test-connection
   ```

### 4. Port Already in Use

If port 3002 is already in use:

**Solution:**

1. Find and close the process using the port:
   ```powershell
   # Find process using port 3002
   netstat -ano | findstr :3002
   
   # Kill the process (replace PID with the actual process ID)
   taskkill /F /PID <PID>
   ```

2. Or use a different port:
   ```powershell
   # Use port 3003 instead
   npm run dev -- -p 3003
   ```
   Remember to update your test scripts with the new port!

## Testing Workflow

For the smoothest testing experience:

1. Start the dev server:
   ```powershell
   .\start-dev-server.ps1
   ```

2. Run the comprehensive test:
   ```powershell
   node test-comprehensive.js
   ```

3. If you encounter issues, check the specific component:
   - For authentication: `node test-auth.js`
   - For database: `node test-article-direct.js`
   - For API: `node test-article-api.js`

4. Review server logs for detailed error messages

## API Endpoints Quick Reference

| Endpoint | Description | Auth Required |
|----------|-------------|--------------|
| `/api/test-connection` | Test server and DB connection | No |
| `/api/test-article` | Create test article without auth | No |
| `/api/articles` | Main article API | Yes (admin/editor) |
| `/api/auth/session` | Check current session | No |

Need more help? Check the TechNews documentation or project README.
