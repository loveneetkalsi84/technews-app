import { Metadata } from "next";
import ArticleCard from "@/app/components/articles/ArticleCard";
import FeaturedReview from "@/app/components/articles/FeaturedReview";
import AdPlaceholder from "@/app/components/ads/AdPlaceholder";
import FilterBar from "@/app/components/layout/FilterBar";
import Pagination from "@/app/components/layout/Pagination";

export const metadata: Metadata = {
  title: "Tech Product Reviews - In-depth Analysis and Ratings",
  description: "Expert reviews on the latest smartphones, laptops, TVs, cameras, and more. Find detailed analysis, comparisons, and ratings to help you make informed purchasing decisions.",
  keywords: "product reviews, tech reviews, smartphone reviews, laptop reviews, gadget reviews, product ratings",
};

// Mock categories for filter bar
const categories = [
  { name: "All Reviews", slug: "all-reviews", count: 128 },
  { name: "Smartphones", slug: "smartphones", count: 47 },
  { name: "Laptops", slug: "laptops", count: 32 },
  { name: "TVs", slug: "tvs", count: 21 },
  { name: "Headphones", slug: "headphones", count: 18 },
  { name: "Cameras", slug: "cameras", count: 15 },
  { name: "Smart Home", slug: "smart-home", count: 12 },
  { name: "Gaming", slug: "gaming", count: 9 },
];

// Mock brands for filter bar
const brands = [
  { name: "Apple", slug: "apple", count: 24 },
  { name: "Samsung", slug: "samsung", count: 22 },
  { name: "Google", slug: "google", count: 16 },
  { name: "Sony", slug: "sony", count: 14 },
  { name: "LG", slug: "lg", count: 12 },
  { name: "Microsoft", slug: "microsoft", count: 9 },
  { name: "Dell", slug: "dell", count: 7 },
  { name: "HP", slug: "hp", count: 6 },
  { name: "Asus", slug: "asus", count: 5 },
  { name: "Lenovo", slug: "lenovo", count: 5 },
];

// Mock data for featured review
const featuredReview = {
  title: "Samsung Galaxy S23 Ultra Review: The Ultimate Android Flagship",
  slug: "samsung-galaxy-s23-ultra-review",
  excerpt: "The Samsung Galaxy S23 Ultra pushes smartphone photography to new heights with its 200MP camera and impressive low-light performance. But is it worth the premium price tag?",
  content: "The Samsung Galaxy S23 Ultra represents the pinnacle of Android smartphones in 2023, combining cutting-edge camera technology with the most powerful processor available...",
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
  rating: 9.2,
  pros: [
    "Incredible camera system with 200MP main sensor",
    "Excellent battery life that easily lasts all day",
    "S-Pen functionality adds versatility",
    "Best-in-class display with adaptive 120Hz refresh rate",
    "Snapdragon 8 Gen 2 offers exceptional performance"
  ],
  cons: [
    "Expensive starting price",
    "Large and heavy compared to other flagships",
    "Charging could be faster at this price point",
    "Some camera features feel gimmicky"
  ]
};

// Mock data for regular reviews
const mockReviews = [
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
    rating: 9.5,
  },
  {
    title: "Sony WH-1000XM5 Review: Best Noise Cancelling Headphones of 2023",
    slug: "sony-wh-1000xm5-review",
    excerpt: "Sony's latest flagship headphones set a new standard for noise cancellation and audio quality, but are they worth upgrading from the XM4?",
    coverImage: "https://images.unsplash.com/photo-1578319439584-104c94d37305?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    publishedAt: new Date(Date.now() - 345600000), // 4 days ago
    author: {
      name: "Emily Chen",
      image: "https://randomuser.me/api/portraits/women/33.jpg",
    },
    viewCount: 1865,
    category: {
      name: "Headphones",
      slug: "headphones",
    },
    tags: ["Sony", "Headphones", "Noise Cancelling"],
    rating: 9.0,
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
    rating: 8.7,
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
    rating: 9.3,
  },
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
    rating: 9.0,
  },
  {
    title: "LG C3 OLED TV Review: The Best TV for Most People",
    slug: "lg-c3-oled-tv-review",
    excerpt: "LG's latest OLED TV continues to impress with perfect blacks, vibrant colors, and excellent gaming features at a more accessible price point.",
    coverImage: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    publishedAt: new Date(Date.now() - 777600000), // 9 days ago
    author: {
      name: "Michelle Wong",
      image: "https://randomuser.me/api/portraits/women/63.jpg",
    },
    viewCount: 3217,
    category: {
      name: "TVs",
      slug: "tvs",
    },
    tags: ["LG", "OLED", "TV"],
    rating: 9.4,
  },
];

export default function ReviewsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Product Reviews</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        In-depth analysis and expert opinions on the latest tech products
      </p>

      {/* Featured Review */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <span className="bg-blue-600 w-4 h-8 mr-3 inline-block"></span>
          Featured Review
        </h2>
        <FeaturedReview review={featuredReview} />
      </div>

      {/* Ad banner */}
      <div className="mb-12">
        <AdPlaceholder type="banner" />
      </div>

      {/* Filters and main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar filters */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="text-xl font-bold mb-4">Filter Reviews</h3>
            <FilterBar title="Categories" items={categories} />
            <FilterBar title="Brands" items={brands} />
            
            {/* Rating filter */}
            <div className="mb-8">
              <h4 className="font-medium mb-2">Minimum Rating</h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center">
                    <input
                      type="radio"
                      id={`rating-${rating}`}
                      name="rating"
                      className="mr-2"
                    />
                    <label htmlFor={`rating-${rating}`} className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill={i < rating ? "currentColor" : "none"}
                          stroke="currentColor"
                          className={`w-4 h-4 ${
                            i < rating
                              ? "text-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={i < rating ? 0 : 1}
                            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                          />
                        </svg>
                      ))}
                      <span className="ml-2">&amp; Up</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar ad */}
            <AdPlaceholder type="sidebar" />
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Latest Reviews</h2>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockReviews.map((review) => (
              <ArticleCard
                key={review.slug}
                article={{
                  ...review,
                  isReview: true,
                }}
                size="medium"
              />
            ))}
          </div>

          {/* Native ad */}
          <div className="my-8">
            <AdPlaceholder type="native" />
          </div>

          {/* Pagination */}
          <div className="mt-12">
            <Pagination currentPage={1} totalPages={5} baseUrl="/reviews" />
          </div>
        </div>
      </div>
    </div>
  );
}
