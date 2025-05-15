"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiX } from "react-icons/fi";
import ArticleCard from "@/app/components/articles/ArticleCard";
import Pagination from "@/app/components/layout/Pagination";
import AdPlaceholder from "@/app/components/ads/AdPlaceholder";

// Mock categories for filter
const categories = [
  { name: "Hardware", slug: "hardware", count: 37 },
  { name: "Software", slug: "software", count: 29 },
  { name: "Mobile", slug: "mobile", count: 22 },
  { name: "AI", slug: "ai", count: 18 },
  { name: "Gaming", slug: "gaming", count: 15 },
  { name: "Enterprise", slug: "enterprise", count: 5 },
];

// Mock companies for filter
const companies = [
  { name: "Apple", slug: "apple", count: 23 },
  { name: "Microsoft", slug: "microsoft", count: 18 },
  { name: "Google", slug: "google", count: 16 },
  { name: "Samsung", slug: "samsung", count: 14 },
  { name: "Meta", slug: "meta", count: 12 },
  { name: "Tesla", slug: "tesla", count: 10 },
  { name: "Intel", slug: "intel", count: 8 },
  { name: "AMD", slug: "amd", count: 7 },
  { name: "Nvidia", slug: "nvidia", count: 6 },
];

// Mock content types for filter
const contentTypes = [
  { name: "Articles", slug: "articles", count: 126 },
  { name: "Reviews", slug: "reviews", count: 45 },
  { name: "News", slug: "news", count: 89 },
  { name: "Guides", slug: "guides", count: 32 },
  { name: "Interviews", slug: "interviews", count: 18 },
];

// Mock search results - in production, this would be fetched from an API
const mockSearchResults = [
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
  {
    title: "Google Releases Android 15 with Advanced AI Features",
    slug: "google-releases-android-15",
    excerpt: "Android 15 introduces a suite of AI-powered features to enhance productivity, creativity, and device optimization.",
    coverImage: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    publishedAt: new Date(Date.now() - 172800000), // 2 days ago
    author: {
      name: "Andy Williams",
      image: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    viewCount: 3125,
    category: {
      name: "News",
      slug: "news",
    },
    tags: ["Google", "Android", "Mobile OS"],
  },
  {
    title: "The Best MacBook Pro Alternatives for Windows Users",
    slug: "best-macbook-pro-alternatives",
    excerpt: "Looking for a Windows laptop with the power and quality of a MacBook Pro? Here are our top picks for professionals and creatives.",
    coverImage: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    publishedAt: new Date(Date.now() - 604800000), // 7 days ago
    author: {
      name: "Sarah Johnson",
      image: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    viewCount: 8742,
    category: {
      name: "Reviews",
      slug: "reviews",
    },
    tags: ["Laptops", "Windows", "MacBook Alternatives"],
  },
  {
    title: "Apple Vision Pro Review: The Future of Computing?",
    slug: "apple-vision-pro-review",
    excerpt: "We spent two weeks with Apple's new spatial computing headset to determine if it lives up to the hype and justifies its premium price tag.",
    coverImage: "https://images.unsplash.com/photo-1661347333292-b783583d4210?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    publishedAt: new Date(Date.now() - 1209600000), // 14 days ago
    author: {
      name: "Mark Wilson",
      image: "https://randomuser.me/api/portraits/men/33.jpg",
    },
    viewCount: 12543,
    category: {
      name: "Reviews",
      slug: "reviews",
    },
    tags: ["Apple", "Vision Pro", "AR/VR"],
    isReview: true,
    rating: 8.5,
  },
];

export default function SearchPage() {
  // Get the search query from URL
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  
  // State
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState(mockSearchResults);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [sorting, setSorting] = useState<"relevance" | "latest" | "popular">("relevance");
  
  // Handle search when query changes from URL
  useEffect(() => {
    setSearchQuery(queryParam);
    
    // Mock search function - in production, this would call your API
    const performSearch = async () => {
      // Filter results based on search query
      if (queryParam) {
        const filtered = mockSearchResults.filter(result => 
          result.title.toLowerCase().includes(queryParam.toLowerCase()) || 
          result.excerpt.toLowerCase().includes(queryParam.toLowerCase()) || 
          result.tags.some(tag => tag.toLowerCase().includes(queryParam.toLowerCase()))
        );
        setResults(filtered);
      } else {
        setResults(mockSearchResults);
      }
    };
    
    performSearch();
  }, [queryParam]);
  
  // Apply filters
  useEffect(() => {
    let filteredResults = [...mockSearchResults];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredResults = filteredResults.filter(result => 
        result.title.toLowerCase().includes(query) || 
        result.excerpt.toLowerCase().includes(query) || 
        result.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by categories
    if (selectedCategories.length > 0) {
      filteredResults = filteredResults.filter(result => 
        selectedCategories.some(cat => 
          result.tags.some(tag => tag.toLowerCase() === cat.toLowerCase())
        )
      );
    }
    
    // Filter by companies
    if (selectedCompanies.length > 0) {
      filteredResults = filteredResults.filter(result => 
        selectedCompanies.some(comp => 
          result.tags.some(tag => tag.toLowerCase() === comp.toLowerCase())
        )
      );
    }
    
    // Filter by content types
    if (selectedContentTypes.length > 0) {
      filteredResults = filteredResults.filter(result => 
        selectedContentTypes.some(type => 
          result.category.slug === type || 
          (type === "reviews" && result.isReview)
        )
      );
    }
    
    // Apply sorting
    if (sorting === "latest") {
      filteredResults.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } else if (sorting === "popular") {
      filteredResults.sort((a, b) => b.viewCount - a.viewCount);
    }
    
    setResults(filteredResults);
  }, [selectedCategories, selectedCompanies, selectedContentTypes, sorting]);
  
  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update URL with search query
    const url = new URL(window.location.href);
    url.searchParams.set("q", searchQuery);
    window.history.pushState({}, "", url);
    
    // Filter results by search query
    const filteredResults = mockSearchResults.filter(result => 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      result.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) || 
      result.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setResults(filteredResults);
  };
  
  // Toggle filters for categories, companies, and content types
  const toggleCategoryFilter = (slug: string) => {
    setSelectedCategories(prev => 
      prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]
    );
  };
  
  const toggleCompanyFilter = (slug: string) => {
    setSelectedCompanies(prev => 
      prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]
    );
  };
  
  const toggleContentTypeFilter = (slug: string) => {
    setSelectedContentTypes(prev => 
      prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]
    );
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedCompanies([]);
    setSelectedContentTypes([]);
    setSorting("relevance");
  };
  
  const activeFilterCount = selectedCategories.length + selectedCompanies.length + selectedContentTypes.length;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">
        {searchQuery ? `Search Results for "${searchQuery}"` : "Search Articles"}
      </h1>
      
      {/* Search form */}
      <form onSubmit={handleSearchSubmit} className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400">
              <FiSearch />
            </div>
            <input
              type="search"
              className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search for articles, reviews, news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={() => setSearchQuery("")}
              >
                <FiX className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" />
              </button>
            )}
          </div>
          
          <button
            type="submit"
            className="md:w-auto w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Search
          </button>
          
          <button
            type="button"
            className="md:w-auto w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 inline-flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          
          <select
            className="md:w-auto w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            value={sorting}
            onChange={(e) => setSorting(e.target.value as "relevance" | "latest" | "popular")}
          >
            <option value="relevance">Relevance</option>
            <option value="latest">Latest</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
        
        {/* Expandable filters */}
        {showFilters && (
          <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Filter Results</h3>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1"
                  onClick={clearFilters}
                >
                  <FiX size={14} />
                  Clear all filters
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Categories */}
              <div>
                <h4 className="font-medium mb-2">Categories</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category.slug} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`cat-${category.slug}`}
                        checked={selectedCategories.includes(category.slug)}
                        onChange={() => toggleCategoryFilter(category.slug)}
                        className="mr-2 rounded border-gray-300 dark:border-gray-600"
                      />
                      <label
                        htmlFor={`cat-${category.slug}`}
                        className="flex items-center justify-between w-full cursor-pointer"
                      >
                        <span>{category.name}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          {category.count}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Companies */}
              <div>
                <h4 className="font-medium mb-2">Companies</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {companies.map((company) => (
                    <div key={company.slug} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`comp-${company.slug}`}
                        checked={selectedCompanies.includes(company.slug)}
                        onChange={() => toggleCompanyFilter(company.slug)}
                        className="mr-2 rounded border-gray-300 dark:border-gray-600"
                      />
                      <label
                        htmlFor={`comp-${company.slug}`}
                        className="flex items-center justify-between w-full cursor-pointer"
                      >
                        <span>{company.name}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          {company.count}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Content Types */}
              <div>
                <h4 className="font-medium mb-2">Content Types</h4>
                <div className="space-y-2">
                  {contentTypes.map((contentType) => (
                    <div key={contentType.slug} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`type-${contentType.slug}`}
                        checked={selectedContentTypes.includes(contentType.slug)}
                        onChange={() => toggleContentTypeFilter(contentType.slug)}
                        className="mr-2 rounded border-gray-300 dark:border-gray-600"
                      />
                      <label
                        htmlFor={`type-${contentType.slug}`}
                        className="flex items-center justify-between w-full cursor-pointer"
                      >
                        <span>{contentType.name}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          {contentType.count}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
      
      {/* Results info */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <p className="text-gray-600 dark:text-gray-300">
          Found {results.length} result{results.length !== 1 ? 's' : ''}
          {searchQuery && <span> for &quot;{searchQuery}&quot;</span>}
          {activeFilterCount > 0 && <span> with {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}</span>}
        </p>
      </div>
      
      {/* Results grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main content */}
        <div className="lg:col-span-3">
          {results.length > 0 ? (
            <div className="space-y-8">
              {results.map((article, index) => (
                <div key={article.slug}>
                  <ArticleCard 
                    article={article} 
                    featured={index === 0}
                    size={index === 0 ? "large" : "medium"}
                  />
                  {/* Insert ad after every 3 articles */}
                  {(index + 1) % 3 === 0 && index < results.length - 1 && (
                    <div className="my-8">
                      <AdPlaceholder type="in-article" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-xl font-bold mb-2">No results found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
          
          {/* Pagination */}
          {results.length > 0 && (
            <div className="mt-12">
              <Pagination currentPage={1} totalPages={3} baseUrl="/search" />
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-8">
            {/* Popular searches */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-lg mb-4">Popular Searches</h3>
              <div className="space-y-2">
                {["iPhone 15", "Windows 12", "RTX 5090", "Apple Vision", "Samsung Galaxy", "AI Tools", "ChatGPT"].map((term) => (
                  <Link
                    key={term}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Ad placement */}
            <div>
              <AdPlaceholder type="sidebar" />
            </div>
            
            {/* Related tags */}
            {searchQuery && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-lg mb-4">Related Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {["Technology", "Hardware", "Software", "Review", "News", "AI", "Gaming"].map((tag) => (
                    <Link
                      key={tag}
                      href={`/search?q=${encodeURIComponent(searchQuery + " " + tag)}`}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
