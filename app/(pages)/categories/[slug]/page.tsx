import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ArticleCard from "@/app/components/articles/ArticleCard";
import AdPlaceholder from "@/app/components/ads/AdPlaceholder";
import Pagination from "@/app/components/layout/Pagination";
import FilterBar from "@/app/components/layout/FilterBar";

// This is a dynamic page that will be generated for each category
// The params will include the category slug from the URL
interface CategoryPageProps {
  params: {
    slug: string;
  };
}

// Mock function to get category data
// In production, this would fetch from the database
async function getCategoryData(slug: string) {
  // Simulate database fetch
  const categories = {
    smartphones: {
      name: "Smartphones",
      slug: "smartphones",
      description: "The latest news, reviews, and insights about smartphones and mobile technology.",
      articleCount: 47,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80",
    },
    laptops: {
      name: "Laptops",
      slug: "laptops",
      description: "Comprehensive reviews and news about the latest laptops, notebooks, and mobile computing devices.",
      articleCount: 32,
      image: "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1176&q=80",
    },
    gaming: {
      name: "Gaming",
      slug: "gaming",
      description: "Stay updated on the gaming industry with reviews of the latest games, consoles, and gaming hardware.",
      articleCount: 28,
      image: "https://images.unsplash.com/photo-1614294149010-950b698f72c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    },
  };
  
  return categories[slug as keyof typeof categories] || null;
}

// Mock function to get articles for a category
// In production, this would fetch from the database
async function getCategoryArticles(slug: string) {
  // Smartphone articles
  const smartphoneArticles = [
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
        name: "Smartphones",
        slug: "smartphones",
      },
      tags: ["Samsung", "Galaxy", "Smartphone"],
      isReview: true,
      rating: 9.2,
    },
    {
      title: "Google Pixel 8 Pro Review: Computational Photography Champion",
      slug: "google-pixel-8-pro-review",
      excerpt: "Google's latest flagship phone takes computational photography to new heights with AI-powered features and the best camera on any smartphone.",
      coverImage: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2127&q=80",
      publishedAt: new Date(Date.now() - 604800000), // 7 days ago
      author: {
        name: "Sarah Johnson",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
      },
      viewCount: 2876,
      category: {
        name: "Smartphones",
        slug: "smartphones",
      },
      tags: ["Google", "Pixel", "Smartphone"],
      isReview: true,
      rating: 9.3,
    },
    {
      title: "Apple iPhone 15 Pro Max Review: The Best iPhone Yet",
      slug: "apple-iphone-15-pro-max-review",
      excerpt: "Apple's flagship iPhone gets better with improved cameras, a faster A17 chip, and a new titanium design.",
      coverImage: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80",
      publishedAt: new Date(Date.now() - 1209600000), // 14 days ago
      author: {
        name: "Mark Wilson",
        image: "https://randomuser.me/api/portraits/men/33.jpg",
      },
      viewCount: 5632,
      category: {
        name: "Smartphones",
        slug: "smartphones",
      },
      tags: ["Apple", "iPhone", "Smartphone"],
      isReview: true,
      rating: 9.0,
    },
  ];
  
  // Laptop articles
  const laptopArticles = [
    {
      title: "MacBook Pro 16-inch (M3 Max) Review: The Ultimate Creator Laptop",
      slug: "macbook-pro-16-m3-max-review",
      excerpt: "Apple's flagship laptop with the M3 Max chip delivers unprecedented performance for creative professionals, but comes with a steep price tag.",
      coverImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1026&q=80",
      publishedAt: new Date(Date.now() - 172800000), // 2 days ago
      author: {
        name: "John Doe",
        image: "https://randomuser.me/api/portraits/men/23.jpg",
      },
      viewCount: 2215,
      category: {
        name: "Laptops",
        slug: "laptops",
      },
      tags: ["Apple", "MacBook", "M3 Chip"],
      isReview: true,
      rating: 9.5,
    },
    {
      title: "Dell XPS 15 (2023) Review: Still the Best Windows Laptop?",
      slug: "dell-xps-15-2023-review",
      excerpt: "Dell's latest XPS 15 combines stunning design with powerful internals, but faces stiff competition from the MacBook Pro.",
      coverImage: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80",
      publishedAt: new Date(Date.now() - 518400000), // 6 days ago
      author: {
        name: "Robert Johnson",
        image: "https://randomuser.me/api/portraits/men/77.jpg",
      },
      viewCount: 1432,
      category: {
        name: "Laptops",
        slug: "laptops",
      },
      tags: ["Dell", "XPS", "Windows Laptop"],
      isReview: true,
      rating: 8.7,
    },
    {
      title: "ASUS ROG Zephyrus G14 Review: The Portable Gaming Powerhouse",
      slug: "asus-rog-zephyrus-g14-review",
      excerpt: "ASUS delivers an impressive gaming laptop in a compact form factor with the ROG Zephyrus G14, featuring AMD's latest processors.",
      coverImage: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1168&q=80",
      publishedAt: new Date(Date.now() - 1036800000), // 12 days ago
      author: {
        name: "Alex Chen",
        image: "https://randomuser.me/api/portraits/men/22.jpg",
      },
      viewCount: 1843,
      category: {
        name: "Laptops",
        slug: "laptops",
      },
      tags: ["ASUS", "ROG", "Gaming Laptop"],
      isReview: true,
      rating: 8.9,
    },
  ];
  
  // Gaming articles
  const gamingArticles = [
    {
      title: "PlayStation 5 Pro Review: The Ultimate Console for 4K Gaming",
      slug: "playstation-5-pro-review",
      excerpt: "Sony's mid-generation upgrade delivers impressive 4K performance and ray-tracing capabilities, but is it worth the premium over the standard PS5?",
      coverImage: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80",
      publishedAt: new Date(Date.now() - 691200000), // 8 days ago
      author: {
        name: "David Lee",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      viewCount: 4532,
      category: {
        name: "Gaming",
        slug: "gaming",
      },
      tags: ["PlayStation", "PS5", "Gaming Console"],
      isReview: true,
      rating: 9.0,
    },
    {
      title: "Microsoft Announces New Xbox Controller with Adaptive Features",
      slug: "microsoft-xbox-adaptive-controller",
      excerpt: "Microsoft's latest Xbox controller includes innovative accessibility features to make gaming more inclusive for players with disabilities.",
      coverImage: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80",
      publishedAt: new Date(Date.now() - 345600000), // 4 days ago
      author: {
        name: "Jessica Wong",
        image: "https://randomuser.me/api/portraits/women/12.jpg",
      },
      viewCount: 2154,
      category: {
        name: "Gaming",
        slug: "gaming",
      },
      tags: ["Xbox", "Microsoft", "Accessibility"],
    },
    {
      title: "Steam Deck 2 Announcement: Everything We Know So Far",
      slug: "steam-deck-2-announcement",
      excerpt: "Valve has officially teased the Steam Deck 2, promising major improvements in performance, battery life, and display quality.",
      coverImage: "https://images.unsplash.com/photo-1616207133639-cd5a15ced75b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      publishedAt: new Date(Date.now() - 259200000), // 3 days ago
      author: {
        name: "Michael Thompson",
        image: "https://randomuser.me/api/portraits/men/42.jpg",
      },
      viewCount: 3127,
      category: {
        name: "Gaming",
        slug: "gaming",
      },
      tags: ["Steam", "Valve", "Handheld Gaming"],
    },
  ];
  
  const articlesByCategory = {
    smartphones: smartphoneArticles,
    laptops: laptopArticles,
    gaming: gamingArticles,
  };
  
  return articlesByCategory[slug as keyof typeof articlesByCategory] || [];
}

// Generate metadata for this page
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = params;
  const category = await getCategoryData(slug);
  
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }
  
  return {
    title: `${category.name} - TechNews`,
    description: category.description,
    keywords: [`${category.name.toLowerCase()}`, 'tech news', 'technology', 'reviews'],
    openGraph: {
      title: `${category.name} - TechNews`,
      description: category.description,
      images: [category.image],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} - TechNews`,
      description: category.description,
      images: [category.image],
    },
  };
}

// Mock categories for filter bar
const relatedCategories = [
  { name: "Smartphones", slug: "smartphones", count: 47 },
  { name: "Laptops", slug: "laptops", count: 32 },
  { name: "TVs", slug: "tvs", count: 21 },
  { name: "Headphones", slug: "headphones", count: 18 },
  { name: "Cameras", slug: "cameras", count: 15 },
  { name: "Smart Home", slug: "smart-home", count: 12 },
  { name: "Gaming", slug: "gaming", count: 28 },
];

// Mock brands for filter bar (based on the category)
const brands = {
  smartphones: [
    { name: "Apple", slug: "apple", count: 8 },
    { name: "Samsung", slug: "samsung", count: 12 },
    { name: "Google", slug: "google", count: 7 },
    { name: "Xiaomi", slug: "xiaomi", count: 5 },
    { name: "OnePlus", slug: "oneplus", count: 4 },
  ],
  laptops: [
    { name: "Apple", slug: "apple", count: 7 },
    { name: "Dell", slug: "dell", count: 8 },
    { name: "HP", slug: "hp", count: 6 },
    { name: "Lenovo", slug: "lenovo", count: 5 },
    { name: "ASUS", slug: "asus", count: 4 },
  ],
  gaming: [
    { name: "Sony", slug: "sony", count: 9 },
    { name: "Microsoft", slug: "microsoft", count: 8 },
    { name: "Nintendo", slug: "nintendo", count: 6 },
    { name: "Valve", slug: "valve", count: 3 },
    { name: "Razer", slug: "razer", count: 2 },
  ],
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  // Extract slug from params to avoid Next.js warnings about synchronous access
  const { slug } = params;
  
  const category = await getCategoryData(slug);
  
  if (!category) {
    notFound();
  }
  
  const articles = await getCategoryArticles(slug);
  const brandFilters = brands[slug as keyof typeof brands] || [];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center">
          <Link href="/categories" className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
            Categories
          </Link>
          <span className="mx-2 text-gray-500 dark:text-gray-400">&rsaquo;</span>
          <span className="text-sm">{category.name}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-3">{category.name}</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-3xl">{category.description}</p>
      </div>
      
      {/* Category header image */}
      <div className="relative w-full h-48 md:h-72 rounded-lg overflow-hidden mb-8">
        <Image
          src={category.image}
          alt={category.name}
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
          <div className="p-6">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {category.articleCount} Articles
            </span>
          </div>
        </div>
      </div>
      
      {/* Ad banner */}
      <div className="mb-8">
        <AdPlaceholder type="banner" />
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="text-xl font-bold mb-4">Filter {category.name}</h3>
            
            {/* Filters */}
            <div className="mb-8">
              <FilterBar title="Categories" items={relatedCategories} />
              {brandFilters.length > 0 && (
                <FilterBar title="Brands" items={brandFilters} />
              )}
            </div>
            
            {/* Sidebar ad */}
            <AdPlaceholder type="sidebar" />
          </div>
        </aside>
        
        {/* Article grid */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Latest in {category.name}</h2>
            <div className="flex items-center">
              <label htmlFor="sort" className="mr-2 text-sm">Sort by:</label>
              <select
                id="sort"
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1 text-sm"
              >
                <option value="latest">Latest</option>
                <option value="popular">Most Popular</option>
                <option value="rating-high">Highest Rated</option>
                <option value="rating-low">Lowest Rated</option>
              </select>
            </div>
          </div>
          
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article, index) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  featured={index === 0}
                  size="medium"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No articles found in this category.</p>
            </div>
          )}
          
          {/* Native ad */}
          <div className="my-8">
            <AdPlaceholder type="native" />
          </div>
            {/* Pagination */}
          {articles.length > 0 && (
            <div className="mt-12">
              <Pagination currentPage={1} totalPages={3} baseUrl={`/categories/${slug}`} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
