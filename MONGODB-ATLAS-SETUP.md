# MongoDB Atlas Setup Instructions

## Step 1: Create a MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account

## Step 2: Create a New Project and Cluster
1. After logging in, create a new project
2. Create a new cluster (select the FREE tier)
3. Choose a cloud provider and region close to your location
4. Click "Create Cluster"

## Step 3: Set Up Database Access
1. In the sidebar, go to "Security" > "Database Access"
2. Click "Add New Database User"
3. Create a username and password (save these securely)
4. Set privileges to "Read and Write to Any Database"
5. Click "Add User"

## Step 4: Set Up Network Access
1. In the sidebar, go to "Security" > "Network Access"
2. Click "Add IP Address"
3. Either:
   - Add your specific IP address
   - Or click "Allow Access from Anywhere" (0.0.0.0/0) for development
4. Click "Confirm"

## Step 5: Get Connection String
1. In the sidebar, go to "Databases"
2. On your cluster, click "Connect"
3. Select "Connect your application"
4. Copy the connection string
5. Replace <username> and <password> with your database user credentials
6. Replace <dbname> with "technews"

## Step 6: Update Your Connection String
Update your connection string in .env.local file:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/technews?retryWrites=true&w=majority
```

Example with placeholder values (REPLACE WITH YOUR ACTUAL VALUES):
```
MONGODB_URI=mongodb+srv://technews_user:your_password_here@cluster0.abc123.mongodb.net/technews?retryWrites=true&w=majority
```
