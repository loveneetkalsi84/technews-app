# Steps to set up a private experimental GitHub repository

## 1. Create a new private repository on GitHub
1. Go to: https://github.com/new
2. Repository name: technews-app-private (or choose your preferred name)
3. Make sure to select "Private" visibility
4. Do not initialize the repository with any files
5. Click "Create repository"

## 2. Add the new repository as a remote called "private"
Run this command in your terminal, replacing YOUR_USERNAME with your GitHub username:

```powershell
git remote add private https://github.com/YOUR_USERNAME/technews-app-private.git
```

## 3. Push your experimental branch to the private repository
Run this command in your terminal:

```powershell
git push -u private experimental
```

## 4. Verify your setup
Run this command to see both remote repositories:

```powershell
git remote -v
```

You should see both:
- origin - Your public repository
- private - Your new private repository

## 5. Working with your experimental branch

### To switch between branches:
```powershell
git checkout experimental  # Switch to experimental branch
git checkout master        # Switch back to master
```

### To push new changes to your private repository:
```powershell
git checkout experimental  # Make sure you're on the experimental branch
# Make your changes
git add .
git commit -m "Your commit message"
git push private experimental
```

### To pull changes from your private repository:
```powershell
git pull private experimental
```

## Important Notes
- Keep your public repository for stable code
- Use the private repository for experiments and features not ready for public release
- Always check which branch you're on before making changes
