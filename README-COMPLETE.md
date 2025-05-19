# TechNews Application

A modern news portal for technology articles with admin dashboard, article management, and user authentication.

## 🚀 Getting Started

Follow these steps to set up and run the TechNews application:

### Prerequisites

- Node.js (v18+)
- MongoDB
- npm or yarn package manager

### Installation

1. Clone the repository (if you haven't already)
2. Install dependencies:

```bash
npm install
```

3. Set up MongoDB:

```bash
# Start MongoDB server
npm run start-mongodb

# Initialize the database
npm run init-mongodb
```

4. Create a `.env` file with the following variables:

```
MONGODB_URI=mongodb://localhost:27017/technews
MONGODB_DATABASE=technews
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=adminpassword
```

5. Start the development server:

```bash
npm run dev
```

6. The application should now be running at [http://localhost:3000](http://localhost:3000)

## 📋 Feature Implementation Guide

### 1. Article Management

The core functionality of TechNews revolves around articles. Here's how to implement and test this feature:

#### Step 1: Create Articles

1. Log in as an admin user
2. Navigate to Admin Dashboard > Articles
3. Click "New Article"
4. Fill in the article details:
   - Title
   - Content (Markdown supported)
   - Choose a category
   - Add tags (comma-separated)
   - Set status (Draft or Published)
   - Upload or link a featured image
5. Click "Save" to save as draft or "Publish" to make it live

#### Step 2: View Articles

1. Navigate to the homepage or News section
2. Click on an article card to view the full article
3. Verify that the article displays correctly with proper formatting
4. Check that the author information, publication date, and category are visible
5. Test the social sharing buttons

#### Step 3: Manage Articles

1. In the Admin Dashboard, go to Articles
2. Use filters to find specific articles
3. Edit, unpublish, or delete articles as needed
4. Verify changes immediately reflect on the frontend

### 2. User Authentication

#### Step 1: Register a New User

1. Navigate to the Register page
2. Fill in the registration form
3. Submit and verify account creation
4. Check for welcome email (if implemented)

#### Step 2: User Login

1. Go to the Login page
2. Enter credentials
3. Verify successful login and proper redirection based on user role

#### Step 3: Password Reset

1. On the Login page, click "Forgot Password"
2. Enter your email
3. Check for password reset email and follow instructions
4. Set a new password and verify login works

### 3. Category Management

1. In Admin Dashboard, go to Categories
2. Create new categories with:
   - Name
   - Slug (auto-generated but editable)
   - Description
3. Verify categories appear in the frontend navigation
4. Test filtering articles by category

### 4. Search Functionality

1. Use the search bar in the header
2. Enter keywords related to articles
3. Verify relevant results appear
4. Test filtering search results

## 🧪 Testing Guide

We've provided several testing tools to ensure the application works correctly:

### Comprehensive Feature Test

Run the all-in-one testing script:

```bash
./test-all-features.ps1
```

This will guide you through testing all major features step by step.

### Individual Component Tests

Test specific components:

```bash
# Test all links in the application
node verify-all-links.js

# Test article slug resolution
node verify-article-slug-fix.js

# Test view article links in admin dashboard
node verify-view-article-link.js
```

### Optimization

Run the optimization script to identify and remove unused code:

```bash
node optimize-app.js
```

## 🔧 Troubleshooting

### Articles Not Displaying Correctly

If articles are not displaying correctly or the "View Article" link shows the wrong article:

1. Check that article slugs are unique and properly formatted
2. Run the article slug verification test:

```bash
node verify-article-slug-fix.js
```

3. If issues persist, check the API response in browser developer tools

### Authentication Issues

If you're having problems with login or registration:

1. Verify MongoDB connection is working
2. Check that the NextAuth environment variables are set correctly
3. Clear browser cookies and try again
4. Run the authentication test:

```bash
node tests/test-auth.js
```

### MongoDB Connection Errors

If you encounter database connection issues:

1. Make sure MongoDB is running
2. Verify your connection string in `.env`
3. Run the connection test:

```bash
node test-connection-string.js
```

## 📱 Responsive Design

The application is fully responsive across devices:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

Test the responsive design by resizing your browser or using browser developer tools.

## 🔒 Security Considerations

- All API routes are protected with authentication where necessary
- Form validation is implemented on both client and server sides
- User passwords are hashed using bcrypt
- CSRF protection is enabled

## 🚀 Deployment

To deploy to production:

1. Build the application:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

## 📚 Documentation

For detailed documentation on specific components and APIs, see:

- [Article Slug Fix Documentation](./docs/article-slug-fix.md)
- [Feature Documentation](./feature-documentation.md)

## 🔄 Continuous Integration

We recommend setting up a CI/CD pipeline to automate testing and deployment:

1. Add unit tests for all components
2. Configure GitHub Actions or another CI service
3. Run tests automatically on pull requests
4. Automate deployment to staging/production

## 🧹 Code Optimization

To keep the codebase clean and performant:

1. Remove unused test files:

```bash
node optimize-app.js
```

2. Consolidate duplicate components
3. Implement code splitting to reduce bundle size
4. Use proper caching for static assets

## 📈 Performance Monitoring

Monitor performance using:

1. Next.js Analytics
2. Lighthouse scores
3. Core Web Vitals

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
