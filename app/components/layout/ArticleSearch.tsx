"use client";

import { useState, useEffect, useRef } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/app/hooks/useDebounce";

interface SearchResult {
  title: string;
  slug: string;
  category: string;
  excerpt?: string;
  image?: string;
}

export default function ArticleSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchTerm = useDebounce(searchQuery, 300);
  const router = useRouter();

  // Mock search function - in production, this would call your API
  const searchArticles = async (query: string) => {
    if (!query) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call with timeout
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock results based on query
    const mockResults: SearchResult[] = [
      {
        title: "Apple's Latest MacBook Pro with M3 Chip",
        slug: "apple-macbook-pro-m3-chip",
        category: "Hardware",
        excerpt: "Apple's new MacBook Pro featuring the M3 chip offers unprecedented performance for creative professionals.",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1026&q=80",
      },
      {
        title: "Apple Vision Pro: The Future of Spatial Computing",
        slug: "apple-vision-pro-spatial-computing",
        category: "Hardware",
        excerpt: "The Vision Pro represents Apple's first entry into the AR/VR market with a focus on mixed reality experiences.",
        image: "https://images.unsplash.com/photo-1649859398021-afbfe80e83b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      },
      {
        title: "Apple's iOS 18: The Biggest Update Yet",
        slug: "apple-ios-18-biggest-update",
        category: "Software",
        excerpt: "iOS 18 brings significant AI features and a refreshed design to iPhone users worldwide.",
        image: "https://images.unsplash.com/photo-1678911820864-e5ece716ddc5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1176&q=80",
      },
    ].filter(result => 
      result.title.toLowerCase().includes(query.toLowerCase()) || 
      result.excerpt?.toLowerCase().includes(query.toLowerCase()) ||
      result.category.toLowerCase().includes(query.toLowerCase())
    );
    
    setResults(mockResults);
    setIsLoading(false);
  };

  // Effect for handling search
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchArticles(debouncedSearchTerm);
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm]);

  // Effect for handling clicks outside search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value) {
      setIsOpen(true);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setResults([]);
    setIsOpen(false);
  };

  // Focus input when search opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="text-gray-500 dark:text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="search"
            className="w-full p-2 pl-10 pr-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsOpen(true)}
          />
          {searchQuery && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={clearSearch}
            >
              <FiX className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" />
            </button>
          )}
        </div>
      </form>

      {/* Results dropdown */}
      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <div className="animate-pulse">Searching...</div>
            </div>
          ) : results.length > 0 ? (
            <div>
              <ul>
                {results.map((result) => (
                  <li key={result.slug} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <Link
                      href={`/articles/${result.slug}`}
                      className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => setIsOpen(false)}
                    >
                      {result.image && (
                        <div className="flex-shrink-0 w-12 h-12 mr-3 relative">
                          <Image
                            src={result.image}
                            alt={result.title}
                            fill
                            className="rounded object-cover"
                            sizes="48px"
                          />
                        </div>
                      )}
                      <div className="flex-grow min-w-0">
                        <p className="font-medium text-sm mb-1 truncate">{result.title}</p>
                        <div className="flex items-center">
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                            {result.category}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 text-center">
                <button
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                    setIsOpen(false);
                  }}
                  className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                >
                  View all results for &quot;{searchQuery}&quot;
                </button>
              </div>
            </div>
          ) : searchQuery ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No results found for &quot;{searchQuery}&quot;
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Type to search articles
            </div>
          )}
        </div>
      )}
    </div>
  );
}
