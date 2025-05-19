# Initialize MongoDB with sample data for TechNews application
# This script creates basic collections and inserts sample data

# Define MongoDB server details
$connectionString = "mongodb://localhost:27017/technews"

# Create the init script
$scriptPath = "$env:TEMP\init-technews-db.js"

@"
// MongoDB initialization script for TechNews
// This script creates collections and inserts sample data

// Connect to the technews database
var db = connect('$connectionString');

// Check if collections already exist to avoid duplicate data
var collections = db.getCollectionNames();
print('Current collections: ' + collections);

// Clear existing data if --reset flag is passed
var args = [];
if (typeof process !== 'undefined' && process.argv) {
  args = process.argv;
}

var resetDb = args.includes('--reset');
if (resetDb) {
  print('Resetting database...');
  
  // Drop existing collections
  if (collections.includes('users')) db.users.drop();
  if (collections.includes('articles')) db.articles.drop();
  if (collections.includes('categories')) db.categories.drop();
  if (collections.includes('comments')) db.comments.drop();
  
  print('Database reset complete.');
}

// Create users collection if it doesn't exist or was dropped
if (!collections.includes('users') || resetDb) {
  print('Creating users collection...');
  
  // Sample users data
  var users = [
    {
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      registeredAt: new Date(Date.now() - 90 * 86400000),
      lastActive: new Date(),
      password: "\$2b\$10\$abc123hash456example789", // Hashed password (example only)
    },
    {
      name: "Editor User",
      email: "editor@example.com",
      role: "editor",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      registeredAt: new Date(Date.now() - 60 * 86400000),
      lastActive: new Date(Date.now() - 3 * 86400000),
      password: "\$2b\$10\$abc123hash456example789", // Hashed password (example only)
    },
    {
      name: "Regular User",
      email: "user@example.com",
      role: "user",
      image: "https://randomuser.me/api/portraits/men/86.jpg",
      registeredAt: new Date(Date.now() - 30 * 86400000),
      lastActive: new Date(Date.now() - 10 * 86400000),
      password: "\$2b\$10\$abc123hash456example789", // Hashed password (example only)
    }
  ];
  
  // Insert users
  db.users.insertMany(users);
  print('Added ' + users.length + ' users.');
}

// Create categories collection
if (!collections.includes('categories') || resetDb) {
  print('Creating categories collection...');
  
  // Sample categories
  var categories = [
    {
      name: "Technology",
      slug: "technology",
      description: "Latest technology news, reviews, and trends",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Programming",
      slug: "programming",
      description: "Programming languages, frameworks, and development tips",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "AI & Machine Learning",
      slug: "ai-machine-learning",
      description: "Artificial intelligence, machine learning, and data science",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Gadgets",
      slug: "gadgets",
      description: "Reviews and news about the latest gadgets and devices",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  // Insert categories
  db.categories.insertMany(categories);
  print('Added ' + categories.length + ' categories.');
}

// Create articles collection
if (!collections.includes('articles') || resetDb) {
  print('Creating articles collection...');
  
  // Sample articles
  var articles = [
    {
      title: "Getting Started with Next.js",
      slug: "getting-started-with-nextjs",
      content: "# Getting Started with Next.js\n\nNext.js is a popular React framework that enables functionality such as server-side rendering and static site generation.\n\n## Why Next.js?\n\nNext.js provides a great developer experience with features like:\n\n- File-system based routing\n- API routes\n- Built-in CSS and Sass support\n- Fast refresh\n- Code splitting and bundling\n\n## Creating a Next.js App\n\nTo create a Next.js app, run:\n\n```bash\nnpx create-next-app@latest my-app\n```\n\nThis will set up everything automatically for you.\n\n## Running the Development Server\n\n```bash\nnpm run dev\n```\n\nOpen [http://localhost:3000](http://localhost:3000) to see your application.\n\n## Learn More\n\nTo learn more about Next.js, take a look at the following resources:\n\n- [Next.js Documentation](https://nextjs.org/docs)\n- [Learn Next.js](https://nextjs.org/learn)\n\nYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/).",
      excerpt: "Learn the basics of Next.js and start building amazing applications with this powerful React framework.",
      category: "Programming",
      author: "Admin User",
      authorId: db.users.findOne({role: "admin"})._id,
      tags: ["react", "nextjs", "javascript"],
      isPublished: true,
      viewCount: 1250,
      createdAt: new Date(Date.now() - 30 * 86400000),
      updatedAt: new Date(Date.now() - 5 * 86400000),
      sourceType: "manual",
      isAIGenerated: false
    },
    {
      title: "The Future of Web Development",
      slug: "future-of-web-development",
      content: "# The Future of Web Development\n\nWeb development is evolving rapidly, with new tools and technologies emerging constantly.\n\n## Current Trends\n\n### 1. JAMstack Architecture\n\nJAMstack (JavaScript, APIs, and Markup) continues to gain popularity for its performance and security benefits.\n\n### 2. Serverless Functions\n\nServerless computing allows developers to build and run applications without managing servers.\n\n### 3. WebAssembly\n\nWebAssembly (Wasm) enables high-performance applications on the web, running code at near-native speed.\n\n### 4. Progressive Web Apps\n\nPWAs combine the best of web and mobile apps, offering offline capabilities and app-like experiences.\n\n## Emerging Technologies\n\n### AI-Assisted Development\n\nAI tools are helping developers write code, detect bugs, and optimize performance.\n\n### Low-Code/No-Code Platforms\n\nThese platforms are making web development more accessible to non-developers.\n\n### WebGPU\n\nThe successor to WebGL, WebGPU provides more direct access to GPU capabilities for web applications.\n\n## Conclusion\n\nThe future of web development will focus on performance, accessibility, and developer experience. Staying updated with these trends will help developers create better web applications.",
      excerpt: "Explore the trends that will shape the future of web development, from AI-assisted coding to emerging standards and frameworks.",
      category: "Technology",
      author: "Editor User",
      authorId: db.users.findOne({role: "editor"})._id,
      tags: ["web", "trends", "future"],
      isPublished: true,
      viewCount: 980,
      createdAt: new Date(Date.now() - 20 * 86400000),
      updatedAt: new Date(Date.now() - 3 * 86400000),
      sourceType: "manual",
      isAIGenerated: false
    },
    {
      title: "Understanding Machine Learning Basics",
      slug: "understanding-machine-learning-basics",
      content: "# Understanding Machine Learning Basics\n\nMachine Learning (ML) is a subset of artificial intelligence that focuses on developing systems that can learn from and make decisions based on data.\n\n## Key Machine Learning Concepts\n\n### Types of Machine Learning\n\n1. **Supervised Learning**: Training on labeled data to make predictions\n2. **Unsupervised Learning**: Finding patterns in unlabeled data\n3. **Reinforcement Learning**: Learning through trial and error with rewards\n\n### Common Algorithms\n\n#### Supervised Learning Algorithms\n- Linear Regression\n- Logistic Regression\n- Decision Trees\n- Random Forests\n- Support Vector Machines (SVM)\n- Neural Networks\n\n#### Unsupervised Learning Algorithms\n- K-means Clustering\n- Hierarchical Clustering\n- Principal Component Analysis (PCA)\n- Autoencoders\n\n## Getting Started with Machine Learning\n\n### Prerequisites\n\nBefore diving into machine learning, you should have a good understanding of:\n\n- Mathematics (Linear Algebra, Calculus, Probability)\n- Programming (Python is the most popular language for ML)\n- Data manipulation and analysis\n\n### Tools and Libraries\n\n- **Python Libraries**: NumPy, Pandas, Matplotlib, Seaborn\n- **ML Frameworks**: Scikit-learn, TensorFlow, PyTorch, Keras\n\n## Sample Python Code\n\n```python\n# Simple linear regression with scikit-learn\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LinearRegression\nimport numpy as np\n\n# Generate sample data\nX = np.random.rand(100, 1) * 10\ny = 2 * X + 1 + np.random.randn(100, 1) * 2\n\n# Split into training and testing sets\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)\n\n# Train the model\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\n\n# Make predictions\npredictions = model.predict(X_test)\n\n# Evaluate the model\nscore = model.score(X_test, y_test)\nprint(f'Model accuracy: {score}')\n```\n\n## Conclusion\n\nMachine learning is a powerful tool that can solve complex problems across various domains. Understanding the basics is the first step toward building sophisticated ML applications.",
      excerpt: "Learn the fundamentals of machine learning, from basic concepts to different algorithms and getting started with practical implementation.",
      category: "AI & Machine Learning",
      author: "Admin User",
      authorId: db.users.findOne({role: "admin"})._id,
      tags: ["machine learning", "ai", "python", "data science"],
      isPublished: true,
      viewCount: 1460,
      createdAt: new Date(Date.now() - 15 * 86400000),
      updatedAt: new Date(Date.now() - 2 * 86400000),
      sourceType: "manual",
      isAIGenerated: false
    }
  ];
  
  // Insert articles
  db.articles.insertMany(articles);
  print('Added ' + articles.length + ' articles.');
}

// Create comments collection
if (!collections.includes('comments') || resetDb) {
  print('Creating comments collection...');
  
  // Get article IDs
  var articleIds = db.articles.find({}, {_id: 1}).toArray().map(a => a._id);
  var userIds = db.users.find({}, {_id: 1}).toArray().map(u => u._id);
  
  if (articleIds.length > 0 && userIds.length > 0) {
    // Sample comments
    var comments = [
      {
        articleId: articleIds[0],
        userId: userIds[2], // Regular user
        userName: "Regular User",
        content: "Great article! This helped me understand Next.js much better.",
        createdAt: new Date(Date.now() - 25 * 86400000),
        updatedAt: new Date(Date.now() - 25 * 86400000),
        isApproved: true
      },
      {
        articleId: articleIds[0],
        userId: userIds[1], // Editor
        userName: "Editor User",
        content: "I would add that Next.js also has excellent support for TypeScript out of the box.",
        createdAt: new Date(Date.now() - 20 * 86400000),
        updatedAt: new Date(Date.now() - 20 * 86400000),
        isApproved: true
      },
      {
        articleId: articleIds[1],
        userId: userIds[2], // Regular user
        userName: "Regular User",
        content: "I'm excited about the potential of WebAssembly. It could really change how we build web applications.",
        createdAt: new Date(Date.now() - 15 * 86400000),
        updatedAt: new Date(Date.now() - 15 * 86400000),
        isApproved: true
      },
      {
        articleId: articleIds[2],
        userId: userIds[1], // Editor
        userName: "Editor User",
        content: "Great introduction to machine learning! Would love to see a follow-up article on deep learning specifically.",
        createdAt: new Date(Date.now() - 10 * 86400000),
        updatedAt: new Date(Date.now() - 10 * 86400000),
        isApproved: true
      }
    ];
    
    // Insert comments
    db.comments.insertMany(comments);
    print('Added ' + comments.length + ' comments.');
  } else {
    print('Skipping comments creation - no articles or users found.');
  }
}

print('Database initialization complete!');
print('Collections: ' + db.getCollectionNames());

// Count documents in each collection
collections = db.getCollectionNames();
collections.forEach(function(collection) {
  var count = db[collection].countDocuments();
  print(collection + ': ' + count + ' documents');
});
"@ | Out-File -FilePath $scriptPath -Encoding utf8

# Run the MongoDB initialization script
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " MongoDB Initialization for TechNews" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Check if mongosh exists and use it, otherwise fall back to mongo
$mongoshPath = $null
$mongoToolPaths = @(
    "C:\Program Files\MongoDB\Tools\mongosh.exe",
    "C:\Program Files\MongoDB\Server\8.0\bin\mongosh.exe",
    "C:\Program Files\MongoDB\Server\7.0\bin\mongosh.exe",
    "C:\Program Files\MongoDB\Server\6.0\bin\mongosh.exe",
    "C:\Program Files\MongoDB\Server\5.0\bin\mongosh.exe",
    "C:\Program Files\MongoDB\Server\8.0\bin\mongo.exe",
    "C:\Program Files\MongoDB\Server\7.0\bin\mongo.exe",
    "C:\Program Files\MongoDB\Server\6.0\bin\mongo.exe",
    "C:\Program Files\MongoDB\Server\5.0\bin\mongo.exe"
)

foreach ($path in $mongoToolPaths) {
    if (Test-Path $path) {
        $mongoshPath = $path
        break
    }
}

if (-not $mongoshPath) {
    Write-Host "MongoDB shell not found. Please make sure MongoDB is properly installed." -ForegroundColor Red
    exit 1
}

# Ask user if they want to reset the database
Write-Host ""
Write-Host "Do you want to reset the database (delete existing data)? (y/n)" -ForegroundColor Yellow
$resetDb = $false

$response = Read-Host
if ($response -eq "y" -or $response -eq "Y") {
    $resetDb = $true
    Write-Host "Database will be reset." -ForegroundColor Red
} else {
    Write-Host "Database will be initialized without resetting." -ForegroundColor Green
}

# Run the initialization script
Write-Host ""
Write-Host "Initializing MongoDB for TechNews..." -ForegroundColor Cyan

if ($resetDb) {
    & $mongoshPath --quiet --eval "load('$scriptPath')" --eval "process.argv.push('--reset')"
} else {
    & $mongoshPath --quiet --eval "load('$scriptPath')"
}

# Cleanup
Remove-Item $scriptPath -Force

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " MongoDB Setup Complete!" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your TechNews database has been configured." -ForegroundColor Green
Write-Host ""
Write-Host "Default user accounts:" -ForegroundColor Yellow
Write-Host "- Admin:  admin@example.com" -ForegroundColor Yellow
Write-Host "- Editor: editor@example.com" -ForegroundColor Yellow
Write-Host "- User:   user@example.com" -ForegroundColor Yellow
Write-Host ""
Write-Host "Note: In a production environment, you should set proper passwords." -ForegroundColor Yellow
Write-Host ""
Write-Host "You can now run the application with:" -ForegroundColor Cyan
Write-Host ".\start-technews.ps1" -ForegroundColor Cyan
