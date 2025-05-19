// This is a mock implementation of MongoDB connections for development
// It allows the application to run without an actual MongoDB connection

import mongoose from 'mongoose';

// Define collection types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string;
  registeredAt: string;
  lastActive: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Author {
  id: string;
  name: string;
  image: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: Category;
  author: Author;
  tags: string[];
  isPublished: boolean;
  viewCount: number;
  coverImage: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface Collections {
  users: User[];
  articles: Article[];
  [key: string]: any; // Index signature to allow string indexing
}

// Mock in-memory database collections
const mockCollections: Collections = {
  users: [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "admin",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      registeredAt: new Date(Date.now() - 90 * 86400000).toISOString(),
      lastActive: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "editor",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      registeredAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      lastActive: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "user",
      image: "https://randomuser.me/api/portraits/men/86.jpg",
      registeredAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      lastActive: new Date(Date.now() - 10 * 86400000).toISOString(),
    }
  ],
  articles: [
    {
      id: "1",
      title: "Getting Started with Next.js",
      slug: "getting-started-with-nextjs",
      content: "Next.js is a great framework for building React applications with server-side rendering capabilities. This article guides you through the basics of setting up and developing with Next.js.\n\n## Installation\n\nTo get started with Next.js, make sure you have Node.js installed. Then, create a new project using:\n\n```bash\nnpx create-next-app my-app\n```\n\n## Key Features\n\n- Server-side rendering\n- Static site generation\n- API routes\n- CSS and Sass support\n- Fast refresh\n\n## Conclusion\n\nNext.js is a powerful framework that simplifies React development while providing performance optimization out of the box.",
      excerpt: "Learn the basics of Next.js and start building amazing applications",
      category: { id: "1", name: "Development", slug: "development" },
      author: { id: "1", name: "John Doe", image: "https://randomuser.me/api/portraits/men/32.jpg" },
      tags: ["react", "nextjs", "javascript"],
      isPublished: true,
      viewCount: 1250,
      coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
      publishedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: "2",
      title: "The Future of Web Development",
      slug: "future-of-web-development",
      content: "Web development is evolving rapidly with new frameworks and tools. This article explores the trends that will shape the future of web development.\n\n## Current Trends\n\n- JAMstack architecture\n- Serverless functions\n- Headless CMS\n- Web Assembly\n- Progressive Web Apps\n\n## What's Next\n\nThe future of web development is likely to focus on performance optimization, security, and developer experience. Tools that simplify complex tasks while maintaining flexibility will dominate the landscape.",
      excerpt: "Explore the trends that will shape the future of web development",
      category: { id: "2", name: "Technology", slug: "technology" },
      author: { id: "2", name: "Jane Smith", image: "https://randomuser.me/api/portraits/women/44.jpg" },
      tags: ["web", "trends", "future"],
      isPublished: true,
      viewCount: 980,
      coverImage: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3",
      publishedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: "3",
      title: "TypeScript Best Practices",
      slug: "typescript-best-practices",
      content: "TypeScript has become an essential tool for JavaScript developers. This article covers best practices for writing clean, maintainable TypeScript code.\n\n## Type Definitions\n\nProperly defining types is crucial for maximizing TypeScript benefits:\n\n```typescript\n// Instead of this\nlet user: any = { name: 'John' };\n\n// Do this\ninterface User {\n  name: string;\n  age?: number;\n}\nlet user: User = { name: 'John' };\n```\n\n## Conclusion\n\nFollowing TypeScript best practices leads to more maintainable and bug-free code.",
      excerpt: "Learn how to write clean and maintainable TypeScript code",
      category: { id: "1", name: "Development", slug: "development" },
      author: { id: "1", name: "John Doe", image: "https://randomuser.me/api/portraits/men/32.jpg" },
      tags: ["typescript", "javascript", "development"],
      isPublished: true,
      viewCount: 560,
      coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
      publishedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: "4",
      title: "CSS Variables: Modern Styling",
      slug: "CSS-Variables-Modern-Styling",  // Intentional capital letters to test case sensitivity
      content: "CSS Variables (Custom Properties) are a powerful feature for creating dynamic and maintainable stylesheets. This article explores how to use them effectively.\n\n## Basic Usage\n\n```css\n:root {\n  --primary-color: #3498db;\n  --secondary-color: #2ecc71;\n}\n\n.button {\n  background-color: var(--primary-color);\n  color: white;\n}\n```\n\n## Advanced Techniques\n\nCSS Variables can be manipulated with JavaScript, making them perfect for themes, responsive designs, and interactive elements.",
      excerpt: "Learn how to use CSS Variables for more maintainable stylesheets",
      category: { id: "1", name: "Development", slug: "development" },
      author: { id: "2", name: "Jane Smith", image: "https://randomuser.me/api/portraits/women/44.jpg" },
      tags: ["css", "web-design", "frontend"],
      isPublished: true,
      viewCount: 732,
      coverImage: "https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19",
      publishedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: "5",
      title: "React Hooks: Complete Guide",
      slug: "react-hooks-complete-guide",
      content: "React Hooks have revolutionized how we build React components. This comprehensive guide covers all the built-in hooks and how to create custom hooks.\n\n## useState\n\n```jsx\nconst [count, setCount] = useState(0);\n```\n\n## useEffect\n\n```jsx\nuseEffect(() => {\n  document.title = `Count: ${count}`;\n  return () => {\n    // Cleanup function\n  };\n}, [count]);\n```\n\n## Custom Hooks\n\nCreating custom hooks allows you to extract component logic into reusable functions.",
      excerpt: "Master React Hooks with this comprehensive guide",
      category: { id: "1", name: "Development", slug: "development" },
      author: { id: "1", name: "John Doe", image: "https://randomuser.me/api/portraits/men/32.jpg" },
      tags: ["react", "javascript", "hooks"],
      isPublished: true,
      viewCount: 1120,
      coverImage: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2",
      publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      id: "6",
      title: "Special Characters in URLs: A Technical Guide",
      slug: "special-characters-in-urls_a-technical-guide",  // Includes special characters and underscores
      content: "Handling special characters in URLs requires understanding of URL encoding and best practices. This article provides a technical guide to managing complex URLs in web applications.\n\n## URL Encoding Basics\n\n```javascript\n// Encoding a URL with special characters\nconst encodedUrl = encodeURIComponent('articles/why & how?');\nconsole.log(encodedUrl); // articles%2Fwhy%20%26%20how%3F\n```\n\n## Best Practices\n\n- Use slugs instead of IDs when possible\n- Handle spaces with hyphens instead of %20\n- Test thoroughly with various character sets",
      excerpt: "Learn how to properly handle special characters in URLs",
      category: { id: "2", name: "Technology", slug: "technology" },
      author: { id: "3", name: "Mike Johnson", image: "https://randomuser.me/api/portraits/men/86.jpg" },
      tags: ["web", "url", "encoding"],
      isPublished: true,
      viewCount: 456,
      coverImage: "https://images.unsplash.com/photo-1555952517-2e8e729e0b44",
      publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
    }
  ]
};

// Mock mongoose implementation
const mockMongoose = {
  connect: async () => {
    console.log('[Mock MongoDB] Connected successfully to mock database');
    return mockMongoose;
  },
  disconnect: async () => {
    console.log('[Mock MongoDB] Disconnected from mock database');
  },
  connection: {
    readyState: 1 // 1 = connected
  },
  model: (modelName: string) => {
    return {      find: async (query: any = {}) => {
        const collection = mockCollections[modelName.toLowerCase()] || [];
        
        // Filter the collection based on the query
        if (Object.keys(query).length === 0) {
          return collection;
        }
        
        return collection.filter((item: any) => 
          Object.keys(query).every(key => {
            // Handle regex queries (for case-insensitive searches)
            if (query[key] instanceof RegExp) {
              return query[key].test(item[key]);
            }
            return item[key] === query[key];
          })
        );
      },
      findOne: async (query: any) => {
        const collection = mockCollections[modelName.toLowerCase()] || [];
        return collection.find((item: any) => 
          Object.keys(query).every(key => {
            // Handle regex queries (for case-insensitive searches)
            if (query[key] instanceof RegExp) {
              return query[key].test(item[key]);
            }
            return item[key] === query[key];
          })
        ) || null;
      },      create: async (data: any) => {
        console.log('[Mock MongoDB] Creating:', data);
        const newId = Date.now().toString();
        const newItem = { ...data, id: newId };
        mockCollections[modelName.toLowerCase()].push(newItem);
        return newItem;
      },
      findById: async (id: string) => {
        const collection = mockCollections[modelName.toLowerCase()] || [];
        return collection.find((item: any) => item.id === id) || null;
      },
      populate: function() {
        // This is a mock of the populate method that just returns the same object
        return this;
      }
    };
  }
};

// Export a function that mimics the real connectToDatabase function
export async function connectToDatabase(): Promise<typeof mongoose> {
  console.log('[Mock MongoDB] Using mock database implementation');
  return mockMongoose as unknown as typeof mongoose;
}

export async function disconnectFromDatabase(): Promise<void> {
  console.log('[Mock MongoDB] Disconnected from mock database');
  return;
}
