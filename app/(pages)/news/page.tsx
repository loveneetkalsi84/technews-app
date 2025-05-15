"use client";

import { useState, useEffect } from "react";
import ArticleCard from "@/app/components/articles/ArticleCard";
import Link from "next/link";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";

// We'll use the same mock data for now
// In production, this would be fetched from the API
const mockArticles = [
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
    title: "Elon Musk Unveils Tesla's Self-Driving Semi Truck",
    slug: "elon-musk-unveils-tesla-semi-truck",
    excerpt: "Tesla's new all-electric semi truck features level 4 autonomy and promises to revolutionize the logistics industry.",
    coverImage: "https://images.unsplash.com/photo-1620471035432-38bab610758d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    publishedAt: new Date(Date.now() - 259200000), // 3 days ago
    author: {
      name: "Jessica Thompson",
      image: "https://randomuser.me/api/portraits/women/33.jpg",
    },
    viewCount: 5678,
    category: {
      name: "News",
      slug: "news",
    },
    tags: ["Tesla", "Electric Vehicles", "Autonomous Driving"],
  },
  {
    title: "Meta Announces Quest 4 VR Headset with Improved Resolution",
    slug: "meta-announces-quest-4-vr-headset",
    excerpt: "The next generation Meta Quest features 4K per-eye resolution, expanded field of view, and better ergonomics.",
    coverImage: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    publishedAt: new Date(Date.now() - 345600000), // 4 days ago
    author: {
      name: "Eric Chen",
      image: "https://randomuser.me/api/portraits/men/55.jpg",
    },
    viewCount: 2890,
    category: {
      name: "News",
      slug: "news",
    },
    tags: ["Meta", "VR", "Quest"],
  },
  {
    title: "Intel Launches New 'Meteor Lake' Processors with 3nm Technology",
    slug: "intel-launches-meteor-lake-processors",
    excerpt: "Intel's latest processor architecture offers significant performance and efficiency gains with its advanced manufacturing process.",
    coverImage: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
    publishedAt: new Date(Date.now() - 518400000), // 6 days ago
    author: {
      name: "Olivia Martinez",
      image: "https://randomuser.me/api/portraits/women/15.jpg",
    },
    viewCount: 3467,
    category: {
      name: "News",
      slug: "news",
    },
    tags: ["Intel", "Processors", "Computing"],
  },
  {
    title: "Amazon Unveils New Echo Devices with Enhanced AI Capabilities",
    slug: "amazon-unveils-new-echo-devices",
    excerpt: "The latest generation of Echo smart speakers feature improved sound quality and more advanced voice recognition technology.",
    coverImage: "https://images.unsplash.com/photo-1543512214-318c7553f230?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
    publishedAt: new Date(Date.now() - 604800000), // 7 days ago
    author: {
      name: "Ryan Jackson",
      image: "https://randomuser.me/api/portraits/men/67.jpg",
    },
    viewCount: 2134,
    category: {
      name: "News",
      slug: "news",
    },
    tags: ["Amazon", "Smart Home", "Echo"],
  },
  {
    title: "Samsung Announces 1TB microSD Card for Smartphones",
    slug: "samsung-announces-1tb-microsd",
    excerpt: "Samsung's new high-capacity microSD card brings unprecedented storage options to mobile devices at competitive prices.",
    coverImage: "https://images.unsplash.com/photo-1601737487795-dab272f52420?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    publishedAt: new Date(Date.now() - 691200000), // 8 days ago
    author: {
      name: "Sophia Lee",
      image: "https://randomuser.me/api/portraits/women/52.jpg",
    },
    viewCount: 1987,
    category: {
      name: "News",
      slug: "news",
    },
    tags: ["Samsung", "Storage", "Mobile"],
  },
];

const NewsPage = () => {
  const [articles, setArticles] = useState(mockArticles);
  const [filteredArticles, setFilteredArticles] = useState(mockArticles);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6;
  
  // All unique tags from the articles
  const tags = [...new Set(mockArticles.flatMap(article => article.tags))];
  
  // Filter articles based on search query and selected tag
  useEffect(() => {
    let result = articles;
    
    if (searchQuery) {
      result = result.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (selectedTag) {
      result = result.filter(article => 
        article.tags.includes(selectedTag)
      );
    }
    
    setFilteredArticles(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, selectedTag, articles]);
  
  // Calculate pagination
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };
  
  // Handle tag selection
  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag === selectedTag ? "" : tag);
    setIsFilterMenuOpen(false);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTag("");
  };
  
  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tech News</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Stay updated with the latest technology news, announcements, and industry trends.
        </p>
      </section>
      
      {/* Search and Filter Section */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Form */}
          <form 
            onSubmit={handleSearch}
            className="w-full md:w-1/2"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search news by title, content, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400" size={20} />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <FiX size={20} />
                </button>
              )}
            </div>
          </form>
          
          {/* Filter Button (Mobile) */}
          <div className="flex md:hidden w-full">
            <button
              type="button"
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
            >
              <FiFilter className="mr-2" />
              <span>Filter by Tags{selectedTag ? `: ${selectedTag}` : ''}</span>
            </button>
          </div>
          
          {/* Filter by Tags (Desktop) */}
          <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-gray-700 dark:text-gray-300">Filter:</span>
            <button
              onClick={clearFilters}
              className={`px-3 py-1 text-sm rounded-full ${
                !selectedTag ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagSelect(tag)}
                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                  selectedTag === tag
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        
        {/* Mobile Filter Menu */}
        {isFilterMenuOpen && (
          <div className="md:hidden mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={clearFilters}
                className={`px-3 py-1 text-sm rounded-full ${
                  !selectedTag ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                }`}
              >
                All
              </button>
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagSelect(tag)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    selectedTag === tag
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
      
      {/* Results Summary */}
      <section className="mb-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">
            {filteredArticles.length} articles found{selectedTag ? ` for tag "${selectedTag}"` : ''}
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </p>
          {(selectedTag || searchQuery) && (
            <button
              onClick={clearFilters}
              className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>
      
      {/* Articles Grid */}
      <section className="mb-8">
        {currentArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentArticles.map((article, index) => (
              <ArticleCard key={index} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No articles found matching your criteria.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>
      
      {/* Pagination */}
      {filteredArticles.length > articlesPerPage && (
        <section className="flex justify-center mt-8">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md ${
                currentPage === 1
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Previous
            </button>
            
            <span className="text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Next
            </button>
          </div>
        </section>
      )}
      
      {/* AdSense Ad */}
      <section className="mt-12 bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
        <div className="text-center">
          <div className="text-gray-400 mb-2 text-sm">ADVERTISEMENT</div>
          {/* This would be replaced by actual AdSense code */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 h-28 w-full rounded-lg flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">Google AdSense Ad</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsPage;
