"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FaEdit, 
  FaEye, 
  FaTrash, 
  FaBookmark,
  FaSearch,
  FaFileAlt,
  FaFilePdf,
  FaArrowRight,
  FaEllipsisH 
} from "react-icons/fa";

// Types
interface Draft {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  lastSaved: string;
  thumbnail?: string;
  wordCount: number;
  completionStatus: number; // percentage of completion
}

export default function DraftsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "lastSaved",
    direction: "desc", // asc or desc
  });
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Categories derived from drafts for filter dropdown
  const categories = ["All", "News", "Reviews", "Features", "Tutorials"];

  // Protected route - check for auth and admin role
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/drafts");
    } else if (status === "authenticated") {
      if ((session.user as any).role !== "admin") {
        router.push("/unauthorized");
      } else {
        // Load drafts data
        fetchDrafts();
      }
    }
  }, [status, session, router]);

  const fetchDrafts = async () => {
    try {
      setIsLoading(true);
      
      // In production, fetch from API
      // const response = await fetch("/api/drafts");
      // const data = await response.json();
      // setDrafts(data.drafts);
      
      // For now, use mock data
      setTimeout(() => {
        setDrafts([
          {
            id: "1",
            title: "The Future of AI in Content Creation: A Deep Dive",
            slug: "future-ai-content-creation-deep-dive",
            excerpt: "Exploring how AI is revolutionizing the way we create and consume digital content across industries.",
            category: "Features",
            author: "John Doe",
            lastSaved: new Date().toISOString(),
            wordCount: 1250,
            completionStatus: 65
          },
          {
            id: "2",
            title: "Hands-on Review: The New Samsung Galaxy S25 Ultra",
            slug: "hands-on-review-samsung-galaxy-s25-ultra",
            excerpt: "Our exclusive first look at Samsung's latest flagship smartphone and all its innovative features.",
            category: "Reviews",
            author: "Jane Smith",
            lastSaved: new Date(Date.now() - 2 * 86400000).toISOString(),
            wordCount: 2100,
            completionStatus: 90
          },
          {
            id: "3",
            title: "Understanding Web3: Blockchain and the Future of the Internet",
            slug: "understanding-web3-blockchain-future-internet",
            excerpt: "Breaking down the core concepts of Web3 and how it aims to decentralize the internet.",
            category: "Features",
            author: "Mike Johnson",
            lastSaved: new Date(Date.now() - 5 * 86400000).toISOString(),
            wordCount: 850,
            completionStatus: 40
          },
          {
            id: "4",
            title: "How to Build a Custom Mechanical Keyboard: Complete Guide",
            slug: "build-custom-mechanical-keyboard-guide",
            excerpt: "Step-by-step instructions for building your own custom mechanical keyboard from scratch.",
            category: "Tutorials",
            author: "Sarah Williams",
            lastSaved: new Date(Date.now() - 7 * 86400000).toISOString(),
            wordCount: 3250,
            completionStatus: 95
          },
          {
            id: "5",
            title: "Exclusive: First Look at Apple's Next Generation MacBooks",
            slug: "exclusive-first-look-apple-next-macbooks",
            excerpt: "Our insider sources reveal details about Apple's upcoming MacBook lineup and its groundbreaking features.",
            category: "News",
            author: "John Doe",
            lastSaved: new Date(Date.now() - 3 * 86400000).toISOString(),
            wordCount: 450,
            completionStatus: 25
          }
        ]);
        setIsLoading(false);
      }, 800);
      
    } catch (error) {
      console.error("Error fetching drafts:", error);
      setIsLoading(false);
    }
  };

  // Filter drafts based on search term and category
  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = 
      draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.author.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = 
      selectedCategory === "all" || 
      draft.category === selectedCategory;
      
    return matchesSearch && matchesCategory;
  });
  // Sort drafts
  const sortedDrafts = [...filteredDrafts].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof Draft];
    const bValue = b[sortConfig.key as keyof Draft];
    
    if (aValue !== undefined && bValue !== undefined) {
      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
    }
    return 0;
  });

  // Toggle sort
  const requestSort = (key: string) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Delete draft
  const deleteDraft = (id: string) => {
    // In production, make API call to delete
    // await fetch(`/api/drafts/${id}`, { method: 'DELETE' });
    
    setDrafts(drafts.filter(draft => draft.id !== id));
    setActionMenuOpen(null);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center">
                <div className="h-10 w-1.5 rounded-full bg-blue-600 dark:bg-blue-500 mr-4"></div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Saved Drafts</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2 ml-5.5">Track and manage your article drafts</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/articles/new"
                className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow hover:shadow-lg transition-all duration-200"
              >
                <FaFileAlt className="mr-2" />
                New Draft
              </Link>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search drafts..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          <div>
            <select
              className="w-full pl-4 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category === "All" ? "all" : category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Drafts Grid/List */}
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrafts.map((draft) => (
              <div 
                key={draft.id} 
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="border-b border-gray-100 dark:border-gray-700 relative">
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                      draft.completionStatus >= 90 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : draft.completionStatus >= 50
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {draft.completionStatus}% Complete
                    </div>
                  </div>
                  
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 w-full">
                    <div 
                      className={`h-full ${
                        draft.completionStatus >= 90 
                          ? 'bg-green-500' 
                          : draft.completionStatus >= 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${draft.completionStatus}%` }}
                    ></div>
                  </div>
                  
                  <div className="p-5 pt-8">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {draft.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                      {draft.excerpt}
                    </p>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full text-xs">
                        {draft.category}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {draft.wordCount} words
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Last saved: {new Date(draft.lastSaved).toLocaleDateString()} 
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === draft.id ? null : draft.id)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FaEllipsisH className="text-gray-500 dark:text-gray-400" />
                      </button>
                      
                      {actionMenuOpen === draft.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <Link 
                              href={`/admin/articles/${draft.slug}/edit`}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <FaEdit className="mr-2 text-blue-500" />
                              Edit
                            </Link>
                            <Link 
                              href={`/articles/${draft.slug}`}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <FaEye className="mr-2 text-green-500" />
                              Preview
                            </Link>
                            <button
                              onClick={() => deleteDraft(draft.id)}
                              className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 w-full text-left"
                            >
                              <FaTrash className="mr-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Empty state */}
        {!isLoading && filteredDrafts.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-100 dark:border-gray-700">
            <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <FaBookmark className="text-blue-500 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No drafts found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || selectedCategory !== "all" 
                ? "Try changing your search criteria or category filter" 
                : "Get started by creating a new article draft"}
            </p>
            <Link
              href="/admin/articles/new"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              <FaFileAlt className="mr-2" />
              New Draft
            </Link>
          </div>
        )}
        
        {/* Pagination */}
        {!isLoading && filteredDrafts.length > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredDrafts.length} draft{filteredDrafts.length === 1 ? "" : "s"}
            </div>
            <div className="flex space-x-2">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md shadow-sm disabled:opacity-50"
                disabled={true}
              >
                Previous
              </button>
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md shadow-sm disabled:opacity-50"
                disabled={true}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
