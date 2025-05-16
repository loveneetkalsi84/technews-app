import Image from "next/image";
import Link from "next/link";
import ArticleCard from "./components/articles/ArticleCard";
import AdPlaceholder from "./components/ads/AdPlaceholder";

// This is a mock data for demonstration purposes
// In production, this would be fetched from the database
// Define the article type to match ArticleCard's expected props
interface MockArticle {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string | Date;
  author: {
    name: string;
    image?: string;
  };
  viewCount?: number;
  category?: {
    name: string;
    slug: string;
  };
  tags?: string[];
  isReview?: boolean;
  rating?: number;
}

const mockArticles: MockArticle[] = [
  {
    title: "Apple Unveils New MacBook Pro with M3 Chip: A Revolutionary Leap in Performance",
    slug: "apple-unveils-new-macbook-pro-m3-chip",
    excerpt: "The new MacBook Pro featuring Apple's M3 chip offers unprecedented performance and battery life, setting new standards for professional laptops.",
    coverImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1026&q=80",
    publishedAt: new Date(),
    author: {
      name: "John Doe",
      image: "https://randomuser.me/api/portraits/men/23.jpg",
    },
    viewCount: 1254,
    category: {
      name: "News",
      slug: "news",
    },
    tags: ["Apple", "MacBook", "M3 Chip"],
  },
  {
    title: "Samsung Galaxy S23 Ultra Review: The Ultimate Android Flagship",
    slug: "samsung-galaxy-s23-ultra-review",
    excerpt: "The Samsung Galaxy S23 Ultra pushes smartphone photography to new heights with its 200MP camera and impressive low-light performance.",
    coverImage: "https://images.unsplash.com/photo-1610945265064-0e34e5d357bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    publishedAt: new Date(Date.now() - 86400000), // 1 day ago
    author: {
      name: "Jane Smith",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    viewCount: 3782,
    category: {
      name: "Reviews",
      slug: "reviews",
    },
    tags: ["Samsung", "Galaxy", "Smartphone"],
  },
  {
    title: "NVIDIA Announces RTX 5090: 8K Gaming Finally Becomes Mainstream",
    slug: "nvidia-announces-rtx-5090",
    excerpt: "NVIDIA's latest flagship GPU promises to deliver 8K gaming at 60fps with full ray tracing, setting a new standard for gaming performance.",
    coverImage: "https://images.unsplash.com/photo-1591488320212-4d092df8884d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    publishedAt: new Date(Date.now() - 172800000), // 2 days ago
    author: {
      name: "Mike Johnson",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    viewCount: 2534,
    category: {
      name: "Gaming",
      slug: "gaming",
    },
    tags: ["NVIDIA", "RTX", "GPU"],
  },
  {
    title: "OpenAI Introduces GPT-5: A New Era of Artificial Intelligence",
    slug: "openai-introduces-gpt5",
    excerpt: "OpenAI's latest language model demonstrates unprecedented reasoning capabilities and better understanding of complex instructions.",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad09f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80",
    publishedAt: new Date(Date.now() - 259200000), // 3 days ago
    author: {
      name: "Sarah Wilson",
      image: "https://randomuser.me/api/portraits/women/67.jpg",
    },
    viewCount: 5921,
    category: {
      name: "AI",
      slug: "ai",
    },
    tags: ["OpenAI", "GPT-5", "AI"],
  },
  {
    title: "Dell XPS 13 (2025) Review: Perfecting the Ultrabook Formula",
    slug: "dell-xps-13-2025-review",
    excerpt: "Dell's latest XPS 13 refines an already excellent design with improved performance, battery life, and display quality.",
    coverImage: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    publishedAt: new Date(Date.now() - 345600000), // 4 days ago
    author: {
      name: "Robert Brown",
      image: "https://randomuser.me/api/portraits/men/91.jpg",
    },
    viewCount: 2187,
    category: {
      name: "Reviews",
      slug: "reviews",
    },
    tags: ["Dell", "XPS", "Laptop"],
  },
  {
    title: "Microsoft Announces Windows 12: A Complete Redesign",
    slug: "microsoft-announces-windows-12",
    excerpt: "Microsoft unveils Windows 12 with a fresh design language, improved performance, and deeper AI integration across the operating system.",
    coverImage: "https://images.unsplash.com/photo-1624571409108-e9a41746af53?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    publishedAt: new Date(Date.now() - 432000000), // 5 days ago
    author: {
      name: "Linda Davis",
      image: "https://randomuser.me/api/portraits/women/22.jpg",
    },
    viewCount: 4321,
    category: {
      name: "News",
      slug: "news",
    },
    tags: ["Microsoft", "Windows", "Operating System"],
  },
];

export default function Home() {
  // Featured article is the first one in the list
  const featuredArticle = mockArticles[0];
  // Rest of the articles
  const regularArticles = mockArticles.slice(1);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section with Featured Article */}
      <section className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Featured Article */}
          <div className="lg:col-span-3">
            <ArticleCard article={featuredArticle} featured={true} />
          </div>

          {/* AdSense Ad - Vertical Banner */}
          <div className="lg:col-span-2">
            <AdPlaceholder type="sidebar" />
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest News</h2>
          <Link
            href="/news"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularArticles.slice(0, 3).map((article, index) => (
            <ArticleCard key={index} article={article} />
          ))}
        </div>
      </section>

      {/* AdSense Ad - Horizontal Banner */}
      <section className="mb-12">
        <AdPlaceholder type="banner" />
      </section>

      {/* Featured Reviews Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Reviews</h2>
          <Link
            href="/reviews"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularArticles.slice(3, 6).map((article, index) => (
            <ArticleCard key={index} article={article} />
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="mb-12 bg-blue-600 text-white rounded-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="p-8 md:w-2/3">
            <h2 className="text-2xl font-bold mb-4">Stay Updated with TechNews</h2>
            <p className="mb-6">
              Subscribe to our newsletter and never miss the latest tech news, reviews, and exclusive content.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-md text-gray-900 focus:outline-none"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md"
              >
                Subscribe
              </button>
            </form>
          </div>
          <div className="hidden md:block md:w-1/3 relative">
            <Image
              src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              alt="Newsletter"
              className="object-cover h-full"
              fill={true}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
