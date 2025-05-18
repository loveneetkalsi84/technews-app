# MongoDB Connection Troubleshooting

## Error: ECONNREFUSED ::1:27017 or 127.0.0.1:27017

This error occurs when your application cannot connect to a MongoDB server at the default localhost address (127.0.0.1 or ::1) and port (27017).

## Solution Options

### Option 1: Start your local MongoDB server

If you have MongoDB installed locally:

```powershell
# For Windows, start the MongoDB service
Start-Service MongoDB

# If that doesn't work, try running MongoDB directly
mongod --dbpath="C:\data\db"
```

### Option 2: Use MongoDB Atlas (Recommended)

MongoDB Atlas provides a free cloud-hosted MongoDB database that's more reliable than local installations:

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a new project and cluster (choose the free tier)
3. In "Security" > "Database Access", create a new database user with a username and password
4. In "Security" > "Network Access", add your IP address (or 0.0.0.0/0 for any IP)
5. In "Databases", click "Connect" on your cluster and select "Connect your application"
6. Copy the connection string and replace the username and password with your credentials

Add the connection string to your `.env.local` file:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/technews?retryWrites=true&w=majority
```

### Option 3: Use MongoDB Docker Container

If you have Docker installed, you can easily run MongoDB in a container:

```powershell
# Pull and run MongoDB in a Docker container
docker run --name mongodb -p 27017:27017 -d mongo:latest
```

## How to verify connection

After setting up your MongoDB connection, you can verify it by:

1. Restart your Next.js development server
2. Visit the test endpoint: `http://localhost:3000/api/test-db`
3. Check the response - it should show "success: true" if connected

## Common Issues

- **Firewall blocking connections**: Ensure port 27017 is open if using local MongoDB
- **MongoDB not running**: Check if the MongoDB service is active
- **Invalid connection string**: Double-check your MONGODB_URI in .env.local
- **Missing IP whitelist**: For Atlas, ensure your IP is added to the whitelist
- **Authentication issues**: Verify username and password in connection string

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Connection Troubleshooting](https://docs.mongodb.com/manual/reference/connection-string/)
- [Next.js with MongoDB](https://github.com/vercel/next.js/tree/canary/examples/with-mongodb)
