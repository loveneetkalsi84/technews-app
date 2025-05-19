// Initialize MongoDB with sample data using Node.js and Mongoose
// Run with: node initialize-mongodb.js

const mongoose = require('mongoose');
const crypto = require('crypto');

// MongoDB connection string
const MONGODB_URI = 'mongodb://localhost:27017/technews';

// Define schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  image: String,
  password: String, // This would be a hashed password in production
  registeredAt: Date,
  lastActive: Date
});

const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  createdAt: Date,
  updatedAt: Date
});

const articleSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  excerpt: String,
  category: String,
  author: String,
  authorId: mongoose.Schema.Types.ObjectId,
  tags: [String],
  isPublished: Boolean,
  viewCount: Number,
  createdAt: Date,
  updatedAt: Date,
  sourceType: String,
  isAIGenerated: Boolean
});

const commentSchema = new mongoose.Schema({
  articleId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  userName: String,
  content: String,
  createdAt: Date,
  updatedAt: Date,
  isApproved: Boolean
});

// Create models
const User = mongoose.model('User', userSchema);
const Category = mongoose.model('Category', categorySchema);
const Article = mongoose.model('Article', articleSchema);
const Comment = mongoose.model('Comment', commentSchema);

// Sample data creators
async function createUsers() {
  console.log('Creating users...');
  
  // Generate a simple hash for demo purposes (not secure for production)
  const demoPasswordHash = '$2b$10$abc123hash456example789';
  
  const users = [
    {
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      password: demoPasswordHash,
      registeredAt: new Date(Date.now() - 90 * 86400000),
      lastActive: new Date()
    },
    {
      name: "Editor User",
      email: "editor@example.com",
      role: "editor",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      password: demoPasswordHash,
      registeredAt: new Date(Date.now() - 60 * 86400000),
      lastActive: new Date(Date.now() - 3 * 86400000)
    },
    {
      name: "Regular User",
      email: "user@example.com",
      role: "user",
      image: "https://randomuser.me/api/portraits/men/86.jpg",
      password: demoPasswordHash,
      registeredAt: new Date(Date.now() - 30 * 86400000),
      lastActive: new Date(Date.now() - 10 * 86400000)
    }
  ];
  
  // Clear existing users if reset flag is used
  if (process.argv.includes('--reset')) {
    await User.deleteMany({});
  }
  
  // Only add users if none exist
  const existingCount = await User.countDocuments();
  if (existingCount === 0) {
    await User.insertMany(users);
    console.log(`Added ${users.length} users`);
  } else {
    console.log(`Users already exist (${existingCount} found). Skipping creation.`);
  }
  
  return await User.find();
}

async function createCategories() {
  console.log('Creating categories...');
  
  const categories = [
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
  
  // Clear existing categories if reset flag is used
  if (process.argv.includes('--reset')) {
    await Category.deleteMany({});
  }
  
  // Only add categories if none exist
  const existingCount = await Category.countDocuments();
  if (existingCount === 0) {
    await Category.insertMany(categories);
    console.log(`Added ${categories.length} categories`);
  } else {
    console.log(`Categories already exist (${existingCount} found). Skipping creation.`);
  }
  
  return await Category.find();
}

async function createArticles(users) {
  console.log('Creating articles...');
  
  const adminUser = users.find(u => u.role === 'admin');
  const editorUser = users.find(u => u.role === 'editor');
  
  if (!adminUser || !editorUser) {
    console.log('Cannot create articles: admin or editor user not found');
    return [];
  }
  
  const articles = [
    {
      title: "Getting Started with Next.js",
      slug: "getting-started-with-nextjs",
      content: "# Getting Started with Next.js\n\nNext.js is a popular React framework that enables functionality such as server-side rendering and static site generation.\n\n## Why Next.js?\n\nNext.js provides a great developer experience with features like:\n\n- File-system based routing\n- API routes\n- Built-in CSS and Sass support\n- Fast refresh\n- Code splitting and bundling\n\n## Creating a Next.js App\n\nTo create a Next.js app, run:\n\n```bash\nnpx create-next-app@latest my-app\n```\n\nThis will set up everything automatically for you.\n\n## Running the Development Server\n\n```bash\nnpm run dev\n```\n\nOpen [http://localhost:3000](http://localhost:3000) to see your application.\n\n## Learn More\n\nTo learn more about Next.js, take a look at the following resources:\n\n- [Next.js Documentation](https://nextjs.org/docs)\n- [Learn Next.js](https://nextjs.org/learn)\n\nYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/).",
      excerpt: "Learn the basics of Next.js and start building amazing applications with this powerful React framework.",
      category: "Programming",
      author: adminUser.name,
      authorId: adminUser._id,
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
      author: editorUser.name,
      authorId: editorUser._id,
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
      author: adminUser.name,
      authorId: adminUser._id,
      tags: ["machine learning", "ai", "python", "data science"],
      isPublished: true,
      viewCount: 1460,
      createdAt: new Date(Date.now() - 15 * 86400000),
      updatedAt: new Date(Date.now() - 2 * 86400000),
      sourceType: "manual",
      isAIGenerated: false
    }
  ];
  
  // Clear existing articles if reset flag is used
  if (process.argv.includes('--reset')) {
    await Article.deleteMany({});
  }
  
  // Only add articles if none exist
  const existingCount = await Article.countDocuments();
  if (existingCount === 0) {
    await Article.insertMany(articles);
    console.log(`Added ${articles.length} articles`);
  } else {
    console.log(`Articles already exist (${existingCount} found). Skipping creation.`);
  }
  
  return await Article.find();
}

async function createComments(users, articles) {
  console.log('Creating comments...');
  
  const regularUser = users.find(u => u.role === 'user');
  const editorUser = users.find(u => u.role === 'editor');
  
  if (!regularUser || !editorUser || articles.length === 0) {
    console.log('Cannot create comments: users or articles not found');
    return;
  }
  
  const comments = [
    {
      articleId: articles[0]._id,
      userId: regularUser._id,
      userName: regularUser.name,
      content: "Great article! This helped me understand Next.js much better.",
      createdAt: new Date(Date.now() - 25 * 86400000),
      updatedAt: new Date(Date.now() - 25 * 86400000),
      isApproved: true
    },
    {
      articleId: articles[0]._id,
      userId: editorUser._id,
      userName: editorUser.name,
      content: "I would add that Next.js also has excellent support for TypeScript out of the box.",
      createdAt: new Date(Date.now() - 20 * 86400000),
      updatedAt: new Date(Date.now() - 20 * 86400000),
      isApproved: true
    },
    {
      articleId: articles[1]._id,
      userId: regularUser._id,
      userName: regularUser.name,
      content: "I'm excited about the potential of WebAssembly. It could really change how we build web applications.",
      createdAt: new Date(Date.now() - 15 * 86400000),
      updatedAt: new Date(Date.now() - 15 * 86400000),
      isApproved: true
    },
    {
      articleId: articles[2]._id,
      userId: editorUser._id,
      userName: editorUser.name,
      content: "Great introduction to machine learning! Would love to see a follow-up article on deep learning specifically.",
      createdAt: new Date(Date.now() - 10 * 86400000),
      updatedAt: new Date(Date.now() - 10 * 86400000),
      isApproved: true
    }
  ];
  
  // Clear existing comments if reset flag is used
  if (process.argv.includes('--reset')) {
    await Comment.deleteMany({});
  }
  
  // Only add comments if none exist
  const existingCount = await Comment.countDocuments();
  if (existingCount === 0) {
    await Comment.insertMany(comments);
    console.log(`Added ${comments.length} comments`);
  } else {
    console.log(`Comments already exist (${existingCount} found). Skipping creation.`);
  }
}

// Main function to initialize the database
async function initializeDatabase() {
  try {
    console.log('='.repeat(50));
    console.log('Initializing TechNews MongoDB Database');
    console.log('='.repeat(50));
    
    // Check for reset flag
    const resetMode = process.argv.includes('--reset');
    if (resetMode) {
      console.log('RESET MODE: Will clear existing data before initialization');
    }
    
    // Connect to MongoDB
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Create data
    const users = await createUsers();
    await createCategories();
    const articles = await createArticles(users);
    await createComments(users, articles);
    
    // Show database stats
    console.log('\nDatabase initialization complete!');
    console.log('='.repeat(50));
    console.log('Database Statistics:');
    console.log(`- Users: ${await User.countDocuments()}`);
    console.log(`- Categories: ${await Category.countDocuments()}`);
    console.log(`- Articles: ${await Article.countDocuments()}`);
    console.log(`- Comments: ${await Comment.countDocuments()}`);
    console.log('='.repeat(50));
    
    console.log('\nDefault user accounts:');
    console.log('- Admin:  admin@example.com');
    console.log('- Editor: editor@example.com');
    console.log('- User:   user@example.com');
    console.log('\nNote: In a production environment, you should set proper passwords.');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run the initialization
initializeDatabase();
