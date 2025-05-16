"use client";

"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FaSave, 
  FaTimes, 
  FaImage, 
  FaEye,
  FaArrowLeft,
  FaHashtag, 
  FaFolder
} from "react-icons/fa";
import DashboardSidebar from "@/app/components/dashboard/DashboardSidebar";

export default function NewArticlePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savingStep, setSavingStep] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState("");
    // Function to ensure session is valid
  const ensureValidSession = async () => {
    if (status !== "authenticated") {
      // Redirect to login if not authenticated
      router.push("/login?callbackUrl=/admin/articles/new");
      return false;
    }
    
    try {
      // Attempt to update the session to refresh tokens if needed
      await updateSession();
      
      // Double-check that we still have a valid session after update
      if (status !== "authenticated" || !session || !session.user) {
        console.warn("Session validation failed after update");
        return false;
      }
      
      // Verify the user has admin role
      if ((session.user as any).role !== "admin") {
        console.warn("User does not have admin role");
        router.push("/unauthorized");
        return false;
      }
      
      console.log("Session validated successfully", { 
        userId: session.user.id,
        role: (session.user as any).role 
      });
      return true;
    } catch (error) {
      console.error("Failed to refresh session:", error);
      return false;
    }
  };

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    category: "News",
    coverImage: "",
    tags: "",
    status: "draft",
    metaDescription: "",
    metaKeywords: ""
  });
  
  // Available categories
  const categories = ["News", "Reviews", "Features", "Tutorials"];

  // Protected route - check for auth and admin role
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/articles/new");
    } else if (status === "authenticated") {
      if ((session.user as any).role !== "admin") {
        router.push("/unauthorized");
      } else {
        setIsLoading(false);
      }
    }
  }, [status, session, router]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // If title is changed, auto-generate a slug (unless slug was manually edited)
    if (name === "title" && !formData.slug) {
      const generatedSlug = value.toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      setFormData({
        ...formData,
        [name]: value,
        slug: generatedSlug
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSavingStep('Initializing submission');
      // Ensure we have a valid session before proceeding
    setSavingStep('Verifying authentication');
    const isSessionValid = await ensureValidSession();
    if (!isSessionValid) {
      setError("Your session has expired. Please log in again.");
      setIsSaving(false);
      setSavingStep('');
      setTimeout(() => {
        router.push("/login?callbackUrl=/admin/articles/new");
      }, 1500);
      return;
    }
    
    // Basic validation
    if (!formData.title.trim()) {
      setError("Article title is required");
      setIsSaving(false);
      return;
    }
    
    if (!formData.content.trim()) {
      setError("Article content is required");
      setIsSaving(false);
      return;
    }
    
    if (!formData.slug.trim()) {
      setError("URL slug is required");
      setIsSaving(false);
      return;
    }
      try {      setSavingStep('Formatting article data');
      
      // Convert tags from string to array
      const tagsArray = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
        : [];
      
      // Convert meta keywords from string to array
      const metaKeywordsArray = formData.metaKeywords
        ? formData.metaKeywords.split(',').map(keyword => keyword.trim()).filter(keyword => keyword !== '')
        : [];
        
      // Format data for API
      const articleData = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt ? formData.excerpt.trim() : formData.content.substring(0, 160).trim(),
        category: formData.category || "News", // Provide a default category
        coverImage: formData.coverImage || `https://via.placeholder.com/1200x630?text=${encodeURIComponent(formData.title)}`,
        tags: tagsArray,
        metaDescription: formData.metaDescription ? formData.metaDescription.trim() 
          : (formData.excerpt ? formData.excerpt.trim() : formData.content.substring(0, 160).trim()),
        metaKeywords: metaKeywordsArray,
        isPublished: formData.status === "published",
        publishedAt: formData.status === "published" ? new Date().toISOString() : null,
        isAIGenerated: false,
        sourceType: 'manual',        viewCount: 0,  // Explicitly set to 0
      };      
      
      // Get the current host and port from the window
      const baseUrl = window.location.origin;
        console.log("Submitting article with data:", articleData);      // Add feedback for the user
      console.log("Obtaining security token...");
      setSavingStep('Obtaining security token');
      
      // Get CSRF token if your NextAuth implementation uses it
      // This depends on your specific NextAuth configuration
      let csrfToken;
      try {
        const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`);
        if (csrfResponse.ok) {
          csrfToken = await csrfResponse.json();
          console.log("Security token obtained successfully");
        } else {
          console.warn("Could not obtain CSRF token, proceeding without it");
        }
      } catch (error) {
        console.warn("Failed to fetch CSRF token:", error);
        // Continue without CSRF token if the endpoint fails
      }
      
      console.log("Saving article to database...");
      setSavingStep('Saving article to database');
      // Make the actual API request to create the article
      const response = await fetch(`${baseUrl}/api/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken?.csrfToken ? { "X-CSRF-Token": csrfToken.csrfToken } : {})
        },
        body: JSON.stringify(articleData),
        credentials: "include" // Include cookies for auth session
      });
        if (!response.ok) {
        console.error("API error status:", response.status);
        console.error("API error statusText:", response.statusText);
        
        // Handle common auth errors separately
        if (response.status === 401) {
          throw new Error("You need to be logged in. Redirecting to login page...");
          // Could also redirect here: router.push('/login?callbackUrl=/admin/articles/new');
        }
        
        if (response.status === 403) {
          throw new Error("You don't have permission to create articles");
        }
      }
      
      const data = await response.json();
      console.log("API response:", data);
      
      if (response.ok) {
        console.log("Article saved successfully:", data);
        
        // Show success message temporarily before redirecting
        setError("");
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-lg z-50';
        successMessage.innerHTML = `
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-700">Article saved successfully!</p>
            </div>
          </div>
        `;
        document.body.appendChild(successMessage);
        
        // Redirect after a brief delay
        setTimeout(() => {
          router.push("/admin/articles");
        }, 1500);
      } else {
        // Handle detailed API errors
        let errorMessage = "Error creating article";
        
        if (data.details) {
          errorMessage = typeof data.details === 'string' ? data.details : JSON.stringify(data.details);
        } else if (data.error) {
          errorMessage = data.error;
        }
        
        // Log full error details for debugging
        console.error("API Error Response:", data);
        
        throw new Error(errorMessage);
      }    } catch (error) {
      console.error("Error saving article:", error);
      setIsSaving(false);
      setSavingStep('');
      
      // Create an error notification element
      const errorNotification = document.createElement('div');
      errorNotification.className = 'fixed top-4 right-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg z-50 animate-slide-in-right';
      
      // Provide more specific error messages based on the type of error
      let errorMessage = '';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error: Please check your internet connection and try again.';
      } else if (error instanceof Error && error.message.includes('login')) {
        errorMessage = 'Authentication error: Your session has expired. You will be redirected to login.';
        setTimeout(() => {
          router.push('/login?callbackUrl=/admin/articles/new');
        }, 2000);
      } else {
        errorMessage = error instanceof Error ? error.message : 'Failed to save article. Please try again.';
      }
      
      // Set the error message state for the in-page notification
      setError(errorMessage);
      
      // Add HTML content to the notification
      errorNotification.innerHTML = `
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 001.414 1.414L10 11.414l1.293 1.293a1 1 001.414-1.414L11.414 10l1.293-1.293a1 1 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">${errorMessage}</p>
          </div>
          <div class="ml-auto pl-3">
            <div class="-mx-1.5 -my-1.5">
              <button type="button" class="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none">
                <span class="sr-only">Dismiss</span>
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 011.414 0L10 8.586l4.293-4.293a1 1 011.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
      
      // Add the notification to the DOM
      document.body.appendChild(errorNotification);
      
      // Add click handler to dismiss button
      const dismissButton = errorNotification.querySelector('button');
      if (dismissButton) {
        dismissButton.addEventListener('click', () => {
          errorNotification.remove();
        });
      }
      
      // Automatically remove after 5 seconds
      setTimeout(() => {
        errorNotification.classList.add('animate-fade-out');
        setTimeout(() => {
          if (document.body.contains(errorNotification)) {
            document.body.removeChild(errorNotification);
          }
        }, 300); // animation duration
      }, 5000);
    }
  };

  // Toggle between edit and preview modes
  const togglePreview = () => {
    setIsPreview(!isPreview);
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
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Create New Article</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2 ml-5.5">Create and publish a new article</p>
            </div>
            <div className="mt-6 md:mt-0 flex flex-wrap gap-3">
              <Link
                href="/admin/articles"
                className="inline-flex items-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2.5 px-5 rounded-lg shadow-sm hover:shadow transition-all duration-200"
              >
                <FaArrowLeft className="mr-2" />
                Back to Articles
              </Link>
            </div>
          </div>          {/* Error notification */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg dark:bg-red-900/30 dark:border-red-500/70">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 101.414 1.414L10 11.414l1.293 1.293a1 1 001.414-1.414L11.414 10l1.293-1.293a1 1 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      onClick={() => setError("")}
                      className="inline-flex rounded-md p-1.5 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 focus:outline-none"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 011.414 0L10 8.586l4.293-4.293a1 1 011.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 010-1.414z" clipRule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main content column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Article Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter article title"
                    required
                    className="block w-full px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                </div>

                {/* URL Slug */}
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL Slug
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 bg-gray-100 dark:bg-gray-800 text-gray-500 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg">
                      /articles/
                    </span>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="article-slug"
                      required
                      className="block w-full px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-r-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Content
                    </label>
                    <button 
                      type="button"
                      onClick={togglePreview}
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                    >
                      <FaEye className="mr-1" />
                      {isPreview ? "Edit" : "Preview"}
                    </button>
                  </div>
                  
                  {isPreview ? (
                    <div className="prose dark:prose-invert max-w-none p-4 min-h-[400px] border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 overflow-auto">
                      {formData.content ? (
                        <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                      ) : (
                        <p className="text-gray-400">No content to preview</p>
                      )}
                    </div>
                  ) : (
                    <textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      placeholder="Write your article content here..."
                      rows={15}
                      required
                      className="block w-full px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                  )}
                </div>                {/* Excerpt */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Excerpt / Summary
                    </label>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formData.excerpt.length}/255
                    </span>
                  </div>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    placeholder="Brief summary of the article (will be auto-generated if left empty)"
                    rows={3}
                    className="block w-full px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This text will appear in search results and article previews
                  </p>
                </div>
              </div>

              {/* Sidebar column */}
              <div className="space-y-6">
                {/* Status */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">Publication</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      type="submit"
                      name="save_draft"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                      disabled={isSaving}
                    >
                      <div className="flex items-center justify-center">
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            {savingStep ? savingStep : 'Saving...'}
                          </>
                        ) : (
                          <>
                            <FaSave className="mr-1.5" />
                            Save Article
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Category */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center mb-2">
                    <FaFolder className="mr-2 text-gray-600 dark:text-gray-400" />
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Category</h3>
                  </div>
                  
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="block w-full px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Featured Image */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center mb-2">
                    <FaImage className="mr-2 text-gray-600 dark:text-gray-400" />
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Featured Image</h3>
                  </div>
                  
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="coverImage"
                      value={formData.coverImage}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      className="block w-full px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                  </div>
                  
                  {formData.coverImage && (
                    <div className="mt-4 border rounded-lg overflow-hidden relative aspect-video">
                      <img 
                        src={formData.coverImage} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/640x360?text=Image+Not+Found'}
                      />
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Recommended size: 1200 × 630 pixels
                  </div>
                </div>                {/* Tags */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center mb-2">
                    <FaHashtag className="mr-2 text-gray-600 dark:text-gray-400" />
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Tags</h3>
                  </div>
                  
                  <div className="mt-2">
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="tag1, tag2, tag3"
                      className="block w-full px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Separate tags with commas
                    </p>
                  </div>
                </div>
                
                {/* SEO Section */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center mb-2">
                    <svg className="mr-2 text-gray-600 dark:text-gray-400 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 001 1h2a1 1 001-1v-2a1 1 001-1h2a1 1 001 1v2a1 1 001-1h2a1 1 001-1v-6.586l.293.293a1 1 001.414-1.414l-7-7z"></path>
                    </svg>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">SEO</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Meta Description
                      </label>
                      <textarea
                        name="metaDescription"
                        value={formData.metaDescription}
                        onChange={handleChange}
                        placeholder="Brief description for search engines"
                        rows={2}
                        className="block w-full px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      ></textarea>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                        <span>Recommended: 150-160 characters</span>
                        <span>{formData.metaDescription.length} chars</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        name="metaKeywords"
                        value={formData.metaKeywords}
                        onChange={handleChange}
                        placeholder="keyword1, keyword2, keyword3"
                        className="block w-full px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Separate keywords with commas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
