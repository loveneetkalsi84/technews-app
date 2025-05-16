"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaPlus, FaFilter, FaSearch, FaFileExport, FaEllipsisH } from "react-icons/fa";
import DashboardSidebar from "@/app/components/dashboard/DashboardSidebar";
import ArticlesTable from "@/app/components/dashboard/ArticlesTable";

// Types
interface Article {
  id: string;
  title: string;
  slug: string;
  status: "published" | "draft";
  author: string;
  category: string;
  publishedAt: string | null;
  viewCount?: number;
}

export default function ArticlesManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Categories derived from articles for filter dropdown
  const categories = ["All", "News", "Reviews", "Features", "Tutorials"];

  // Protected route - check for auth and admin role
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/articles");
    } else if (status === "authenticated") {
      if ((session.user as any).role !== "admin") {
        router.push("/unauthorized");
      } else {
        // Load articles data
        fetchArticles();
      }
    }
  }, [status, session, router]);

  const fetchArticles = async () => {
    setIsLoading(true);
    
    try {
      // In production, fetch from API
      // const response = await fetch("/api/articles/admin");
      // const data = await response.json();
      // setArticles(data.articles);
      
      // For now, use mock data
      setTimeout(() => {
        setArticles([
          {
            id: "1",
            title: "Apple Unveils New MacBook Pro with M3 Chip",
            slug: "apple-unveils-new-macbook-pro-m3-chip",
            status: "published",
            author: "John Doe",
            category: "News",
            publishedAt: new Date().toISOString(),
            viewCount: 1254,
          },
          {
            id: "2",
            title: "Samsung Galaxy S23 Ultra Review",
            slug: "samsung-galaxy-s23-ultra-review",
            status: "published",
            author: "Jane Smith",
            category: "Reviews",
            publishedAt: new Date(Date.now() - 86400000).toISOString(),
            viewCount: 3782,
          },
          {
            id: "3",
            title: "The Future of Artificial Intelligence",
            slug: "future-of-artificial-intelligence",
            status: "draft",
            author: "Mike Johnson",
            category: "Features",
            publishedAt: null,
            viewCount: 0,
          },
          {
            id: "4",
            title: "How to Build a Modern Web Application with Next.js",
            slug: "build-modern-web-application-nextjs",
            status: "published",
            author: "Sarah Williams",
            category: "Tutorials",
            publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
            viewCount: 7230,
          },
          {
            id: "5",
            title: "The Rise of AR/VR in Gaming Industry",
            slug: "rise-of-arvr-gaming-industry",
            status: "draft",
            author: "Tom Brown",
            category: "Features",
            publishedAt: null,
            viewCount: 0,
          },
          {
            id: "6",
            title: "Microsoft Introduces New Surface Laptop Studio",
            slug: "microsoft-introduces-surface-laptop-studio",
            status: "published",
            author: "John Doe",
            category: "News",
            publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
            viewCount: 2145,
          },
          {
            id: "7",
            title: "Top Programming Languages to Learn in 2025",
            slug: "top-programming-languages-2025",
            status: "published",
            author: "Mike Johnson",
            category: "Features",
            publishedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
            viewCount: 5689,
          },
        ]);
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching articles:", error);
      setIsLoading(false);
    }
  };

  // Filter articles based on search term, category and status
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        article.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory.toLowerCase() === 'all' || 
                          article.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesStatus = selectedStatus.toLowerCase() === 'all' || 
                        article.status.toLowerCase() === selectedStatus.toLowerCase();
                        
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main content */}
      <div className="flex-1 md:ml-72 p-6 md:p-8 overflow-y-auto transition-all duration-300 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <div className="flex items-center">
                <div className="h-10 w-1.5 rounded-full bg-blue-600 dark:bg-blue-500 mr-4"></div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Articles Management</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2 ml-5.5">Manage, edit and create new articles</p>
            </div>
            <div className="mt-6 md:mt-0 flex flex-wrap gap-3">
              <Link
                href="/admin/articles/new"
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 px-5 rounded-lg shadow-sm hover:shadow transition-all duration-200"
              >
                <FaPlus className="mr-2" />
                New Article
              </Link>
              <button
                className="inline-flex items-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-2.5 px-5 rounded-lg shadow-sm hover:shadow transition-all duration-200"
              >
                <FaFileExport className="mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Filters and search */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="search"
                  className="block w-full pl-10 px-4 py-2.5 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  placeholder="Search articles by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-40">
                  <select
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category.toLowerCase()}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="w-full sm:w-40">
                  <select
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                
                <button className="sm:w-auto inline-flex items-center py-2.5 px-5 text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none">
                  <FaFilter className="mr-2" />
                  Filter
                </button>
              </div>
            </div>
          </div>

          {/* Articles Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
            <ArticlesTable articles={filteredArticles} />
          </div>
        </div>
      </div>
    </div>
  );
}
