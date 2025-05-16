"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FaSave, 
  FaCheck,
  FaTimes,
  FaSpinner,
  FaArrowLeft,
  FaRss,
  FaGlobe,
  FaLink
} from "react-icons/fa";
import DashboardSidebar from "@/app/components/dashboard/DashboardSidebar";

export default function ImportContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [importType, setImportType] = useState<"rss" | "url">("rss");
  const [formData, setFormData] = useState({
    url: "",
    category: "News",
  });
  
  // Default RSS feeds for quick selection
  const defaultRSSFeeds = [
    { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
    { name: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
    { name: "Wired", url: "https://www.wired.com/feed/rss" },
    { name: "Engadget", url: "https://www.engadget.com/rss.xml" },
    { name: "Ars Technica", url: "https://arstechnica.com/feed/" },
  ];
  
  // Available categories
  const categories = ["News", "Reviews", "Features", "Tutorials"];

  // Protected route - check for auth and admin role
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/import");
    } else if (status === "authenticated") {
      if ((session.user as any).role !== "admin") {
        router.push("/unauthorized");
      } else {
        setIsLoading(false);
      }
    }
  }, [status, session, router]);

  // Handle selecting a default feed
  const handleSelectFeed = (url: string) => {
    setFormData({
      ...formData,
      url
    });
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsImporting(true);
    setError("");
    setSuccess("");
    
    if (!formData.url) {
      setError("URL is required");
      setIsImporting(false);
      return;
    }
    
    try {
      // Call the appropriate API based on import type
      const endpoint = importType === "rss" 
        ? "/api/import-content?type=rss" 
        : "/api/import-content?type=url";
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: formData.url,
          category: formData.category,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(`Successfully imported ${data.count || 0} articles!`);
        setFormData({
          url: "",
          category: formData.category,
        });
      } else {
        throw new Error(data.error || "Error importing content");
      }
    } catch (error) {
      console.error("Error importing content:", error);
      setError(error instanceof Error ? error.message : 'Failed to import content. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

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
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Import Content</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2 ml-5.5">Import content from RSS feeds or web pages</p>
            </div>
            <div className="mt-6 md:mt-0 flex flex-wrap gap-3">
              <Link
                href="/admin"
                className="inline-flex items-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2.5 px-5 rounded-lg shadow-sm hover:shadow transition-all duration-200"
              >
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Notifications */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg dark:bg-red-900/30 dark:border-red-500/70">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FaTimes className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="inline-flex rounded-md p-1.5 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 focus:outline-none"
                  >
                    <span className="sr-only">Dismiss</span>
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg dark:bg-green-900/30 dark:border-green-500/70">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FaCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    type="button"
                    onClick={() => setSuccess("")}
                    className="inline-flex rounded-md p-1.5 text-green-500 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 focus:outline-none"
                  >
                    <span className="sr-only">Dismiss</span>
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Import Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 p-6">
            {/* Import Type Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav className="flex space-x-4" aria-label="Import options">
                <button
                  onClick={() => setImportType("rss")}
                  className={`pb-3 px-2 font-medium text-sm ${
                    importType === "rss"
                      ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <span className="flex items-center">
                    <FaRss className="mr-2" />
                    Import from RSS Feed
                  </span>
                </button>
                <button
                  onClick={() => setImportType("url")}
                  className={`pb-3 px-2 font-medium text-sm ${
                    importType === "url"
                      ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <span className="flex items-center">
                    <FaGlobe className="mr-2" />
                    Import from URL
                  </span>
                </button>
              </nav>
            </div>

            {/* Quick Feed Selection (for RSS only) */}
            {importType === "rss" && (
              <div className="mb-6">
                <h3 className="text-gray-800 dark:text-gray-200 font-medium mb-3">Quick Select Feed</h3>
                <div className="flex flex-wrap gap-2">
                  {defaultRSSFeeds.map((feed) => (
                    <button
                      key={feed.name}
                      type="button"
                      onClick={() => handleSelectFeed(feed.url)}
                      className={`px-4 py-2 text-sm rounded-full ${
                        formData.url === feed.url
                          ? "bg-blue-600 text-white dark:bg-blue-700"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {feed.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* URL Input */}
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {importType === "rss" ? "RSS Feed URL" : "Web Page URL"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLink className="text-gray-400" />
                  </div>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    placeholder={importType === "rss" ? "https://example.com/feed" : "https://example.com/article"}
                    className="block w-full pl-10 px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    required
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  {importType === "rss" 
                    ? "Enter an RSS feed URL to import all articles from the feed" 
                    : "Enter a web page URL to import a single article"}
                </p>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                  disabled={isImporting}
                >
                  <div className="flex items-center justify-center">
                    {isImporting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <FaRss className="mr-2" />
                        {importType === "rss" ? "Import from RSS Feed" : "Import from URL"}
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>
          </div>

          {/* Tips Section */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-800/50">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400 mb-3">Tips for Importing Content</h3>
            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800/60 h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5">1</span>
                <span>For RSS feeds, make sure the URL points directly to the RSS/XML file.</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800/60 h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5">2</span>
                <span>Most news sites have RSS feeds available at /feed, /rss, or in their website footer.</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800/60 h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5">3</span>
                <span>The importer will attempt to extract article content, images, and metadata.</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800/60 h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5">4</span>
                <span>Duplicate articles (with the same URL) will not be imported again.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
