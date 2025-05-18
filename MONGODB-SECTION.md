```markdown
# MongoDB Connection Troubleshooting Section

## MongoDB Connection Error: ECONNREFUSED

If you see errors like `connect ECONNREFUSED ::1:27017` or `connect ECONNREFUSED 127.0.0.1:27017`:

**Problem:** Your application cannot connect to MongoDB. This happens when:
- MongoDB is not running locally
- Your connection string is incorrect
- Network/firewall issues are preventing the connection

**Solutions:**

1. **Check if MongoDB is installed and running:**
   ```powershell
   # Check MongoDB service status
   Get-Service -Name MongoDB

   # Try to start the service if it's not running
   Start-Service -Name MongoDB
   ```

2. **Use the MongoDB diagnostics endpoint:**
   - Visit `http://localhost:3000/api/mongodb-diagnostics` in your browser
   - This will test the connection and provide specific troubleshooting steps

3. **Switch to MongoDB Atlas (recommended):**
   - Follow the setup guide in `MONGODB-ATLAS-SETUP.md`
   - Update your `.env.local` file with the Atlas connection string

4. **Verify your .env.local configuration:**
   - Make sure your MONGODB_URI is properly formatted
   - For local MongoDB: `mongodb://localhost:27017/technews`
   - For MongoDB Atlas: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/technews?retryWrites=true&w=majority`

5. **Test with MongoDB Compass:**
   - Download [MongoDB Compass](https://www.mongodb.com/products/compass)
   - Try connecting with the same URI to verify the connection

For more detailed instructions, see:
- `MONGODB-TROUBLESHOOTING.md` for general MongoDB issues
- `MONGODB-ATLAS-SETUP.md` for setting up MongoDB Atlas
```
