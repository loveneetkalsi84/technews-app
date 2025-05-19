"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NextResponse } from "next/server";
import Markdown from "react-markdown";
import Image from "next/image";
import { 
  FaSave, 
  FaTimes, 
  FaImage, 
  FaEye,
  FaArrowLeft,
  FaHashtag, 
  FaFolder
} from "react-icons/fa";

// Form data persistence key in localStorage
const FORM_STORAGE_KEY = 'technews_article_draft';

// Utility function to normalize a slug string to valid format
const normalizeSlug = (slug: string): string => {
  // Convert to lowercase
  let normalizedSlug = slug.toLowerCase()
    // Remove special characters except spaces and hyphens
    .replace(/[^\w\s-]/gi, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Replace consecutive hyphens with a single hyphen
    .replace(/-{2,}/g, '-');

  // If the slug is empty after normalization, provide a default
  if (!normalizedSlug) {
    normalizedSlug = 'article-' + Date.now();
  }

  return normalizedSlug;
};

export default function NewArticlePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savingStep, setSavingStep] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState("");
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  
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
  
  // Load saved form data from localStorage on initial render
  useEffect(() => {
    const savedFormData = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData(parsedData);
        console.log('Form data restored from localStorage');
      } catch (error) {
        console.error('Failed to parse saved form data:', error);
      }
    }
  }, []);
  
  // Save form data to localStorage whenever it changes (with debounce)
  useEffect(() => {
    if (!autosaveEnabled) return;
    
    const autosaveTimeout = setTimeout(() => {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
      console.log('Form data auto-saved to localStorage');
    }, 1000);
    
    return () => clearTimeout(autosaveTimeout);
  }, [formData, autosaveEnabled]);
  
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
  }, [status, session, router]);  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // If title is changed, auto-generate a slug (unless slug was manually edited)
    if (name === "title" && !formData.slug) {
      // Use the normalizeSlug utility to generate a valid slug from the title
      const generatedSlug = normalizeSlug(value);
      
      setFormData({
        ...formData,
        [name]: value,
        slug: generatedSlug
      });
    } else if (name === "slug") {
      // If slug is being manually edited, normalize it to ensure validity
      setFormData({
        ...formData,
        [name]: normalizeSlug(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  // Function to validate the form data
  const validateForm = (): { isValid: boolean; errorMessage?: string } => {
    // Check for required fields
    if (!formData.title.trim()) {
      return { isValid: false, errorMessage: "Article title is required" };
    }
    
    if (!formData.content.trim()) {
      return { isValid: false, errorMessage: "Article content is required" };
    }
    
    if (!formData.slug.trim()) {
      return { isValid: false, errorMessage: "URL slug is required" };
    }
      // Validate slug format (only alphanumeric chars, hyphens, no spaces)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(formData.slug.trim())) {
      // Use the normalizeSlug utility to fix the slug
      const fixedSlug = normalizeSlug(formData.slug);
      
      // If the fixed slug is valid, update the form and continue
      if (slugRegex.test(fixedSlug)) {
        setFormData({
          ...formData,
          slug: fixedSlug
        });
        return { isValid: true };
      }
      
      return { 
        isValid: false, 
        errorMessage: "URL slug can only contain lowercase letters, numbers, and hyphens. It cannot start or end with a hyphen." 
      };
    }
    
    // Check if content is too short (minimum 100 characters)
    if (formData.content.trim().length < 100) {
      return { 
        isValid: false, 
        errorMessage: "Article content is too short. Please provide at least 100 characters." 
      };
    }
    
    // Check if title is too short (minimum 10 characters)
    if (formData.title.trim().length < 10) {
      return { 
        isValid: false, 
        errorMessage: "Article title is too short. Please provide at least 10 characters." 
      };
    }
    
    // Validate image URL if provided
    if (formData.coverImage && !formData.coverImage.startsWith('http')) {
      return { 
        isValid: false, 
        errorMessage: "Cover image URL must start with http:// or https://" 
      };
    }
    
    // All validations passed
    return { isValid: true };
  };
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    
    const validation = validateForm();
    if (!validation.isValid) {
      setError(validation.errorMessage || 'Form validation failed');
      setIsSaving(false);
      return;
    }
    
    try {
      // Process form data to match API expectations
      const processedFormData = {
        ...formData,
        // Convert comma-separated tags to an array
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        // Convert comma-separated metaKeywords to an array
        metaKeywords: formData.metaKeywords ? formData.metaKeywords.split(',').map(keyword => keyword.trim()) : [],
        // Set isPublished based on status
        isPublished: formData.status === 'published',
      };
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${baseUrl}/api/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedFormData),
        credentials: 'include',
      });
      
      // Check if the response is OK (status in the range 200-299)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
      }
      
      // Process successful response
      const data = await response.json();
      router.push('/admin/articles');
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the article');
      console.error('Error creating article:', err);
    } finally {
      setIsSaving(false);
    }
  };
  // Toggle between edit and preview modes
  const togglePreview = () => {
    // Using a try-catch to ensure any errors in preview mode don't break the form
    try {
      // Validate if we have enough content to show a preview
      if (formData.title.trim() === '') {
        setError('Please add a title before previewing');
        return;
      }
      
      if (formData.content.trim() === '') {
        setError('Please add some content before previewing');
        return;
      }
      
      // Clear any errors when entering preview mode
      setError('');
      // Toggle preview state
      setIsPreview(!isPreview);
    } catch (err) {
      console.error('Error toggling preview:', err);
      setError('Failed to generate preview. Please try again.');
    }
  };

  // Clear saved draft from localStorage
  const clearSavedDraft = () => {
    if (window.confirm("Are you sure you want to clear the saved draft? This cannot be undone.")) {
      localStorage.removeItem(FORM_STORAGE_KEY);
      setFormData({
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
      
      // Show confirmation message
      const confirmMessage = document.createElement('div');
      confirmMessage.className = 'fixed top-4 right-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-lg z-50 animate-slide-in-right';
      confirmMessage.innerHTML = `
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 000-16 8 8 000 16zm3.707-9.293a1 1 000-1.414-1.414L9 10.586 7.707 9.293a1 1 00-1.414 1.414l2 2a1 1 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-700">Draft has been cleared</p>
          </div>
        </div>
      `;
      document.body.appendChild(confirmMessage);
      
      setTimeout(() => {
        confirmMessage.classList.add('animate-fade-out');
        setTimeout(() => {
          if (document.body.contains(confirmMessage)) {
            document.body.removeChild(confirmMessage);
          }
        }, 300);
      }, 3000);
    }
  };
  
  // Toggle autosave functionality
  const toggleAutosave = () => {
    setAutosaveEnabled(!autosaveEnabled);
    
    // Store the preference in localStorage
    localStorage.setItem('technews_autosave_preference', (!autosaveEnabled).toString());
    
    // Show notification about the change
    const message = !autosaveEnabled ? 'Autosave enabled' : 'Autosave disabled';
    const notifClass = !autosaveEnabled ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500';
    const textColor = !autosaveEnabled ? 'text-green-700' : 'text-yellow-700';
    const iconColor = !autosaveEnabled ? 'text-green-600' : 'text-yellow-600';
    
    const notif = document.createElement('div');
    notif.className = `fixed top-4 right-4 ${notifClass} border-l-4 p-4 rounded-lg shadow-lg z-50 animate-slide-in-right`;
    notif.innerHTML = `
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 ${iconColor}" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 000-16 8 8 000 16zm3.707-9.293a1 1 000-1.414-1.414L9 10.586 7.707 9.293a1 1 00-1.414 1.414l2 2a1 1 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm ${textColor}">${message}</p>
        </div>
      </div>
    `;
    document.body.appendChild(notif);
    
    setTimeout(() => {
      notif.classList.add('animate-fade-out');
      setTimeout(() => {
        if (document.body.contains(notif)) {
          document.body.removeChild(notif);
        }
      }, 300);
    }, 2000);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
    return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
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
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg dark:bg-red-900/30 dark:border-red-500/70">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 000-16 8 8 000 16zM8.707 7.293a1 1 000-1.414 1.414L8.586 10l-1.293 1.293a1 1 001.414 1.414L10 11.414l1.293 1.293a1 1 001.414-1.414L11.414 10l1.293-1.293a1 1 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
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
          </div>        )}

        {/* Form */}
        {!isPreview ? (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main content area - 2/3 width on desktop */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title field */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Article title"
                    className="block w-full px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    required
                  />
                </div>
                
                {/* Slug field */}
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL Slug
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg">
                      /articles/
                    </span>                  <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      onBlur={(e) => {
                        // Normalize the slug on blur to ensure it's valid
                        const normalizedSlug = normalizeSlug(e.target.value);
                        if (normalizedSlug !== formData.slug) {
                          setFormData({
                            ...formData,
                            slug: normalizedSlug
                          });
                        }
                      }}
                      placeholder="article-url-slug"
                      className="block w-full px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-r-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                {/* Content field */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content (Markdown supported)
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={20}
                    placeholder="Write your article content here... (Markdown is supported)"
                    className="block w-full px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-mono text-sm"
                    required
                  ></textarea>
                </div>
                
                {/* Excerpt field */}
                <div>
                  <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Excerpt <span className="text-gray-500 dark:text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Short summary of the article (if left empty, one will be generated automatically)"
                    className="block w-full px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  ></textarea>
                </div>
              </div>
              
              {/* Sidebar - 1/3 width on desktop */}
              <div className="space-y-6">
                {/* Article Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  >
                    <option value="draft">Draft - Save without publishing</option>
                    <option value="published">Published - Visible to everyone</option>
                  </select>
                </div>
                
                {/* Category field */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <div className="flex items-center">
                    <FaFolder className="text-gray-400 mr-2" />
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
                </div>
                
                {/* Featured Image field */}
                <div>
                  <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Featured Image URL <span className="text-gray-500 dark:text-gray-400">(optional)</span>
                  </label>
                  <div className="flex items-center">
                    <FaImage className="text-gray-400 mr-2" />
                    <input
                      type="url"
                      id="coverImage"
                      name="coverImage"
                      value={formData.coverImage}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      className="block w-full px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                {/* Tags field */}
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags <span className="text-gray-500 dark:text-gray-400">(comma-separated)</span>
                  </label>
                  <div className="flex items-center">
                    <FaHashtag className="text-gray-400 mr-2" />
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="technology, news, review"
                      className="block w-full px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                {/* SEO section */}
                <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-md">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">SEO Settings</h3>
                  
                  <div className="space-y-4">
                    {/* Meta Description */}
                    <div>
                      <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Meta Description <span className="text-gray-500 dark:text-gray-400">(optional)</span>
                      </label>
                      <textarea
                        id="metaDescription"
                        name="metaDescription"
                        value={formData.metaDescription}
                        onChange={handleChange}
                        rows={2}
                        placeholder="SEO description for search engines"
                        className="block w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      ></textarea>
                    </div>
                    
                    {/* Meta Keywords */}
                    <div>
                      <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Meta Keywords <span className="text-gray-500 dark:text-gray-400">(comma-separated)</span>
                      </label>
                      <input
                        type="text"
                        id="metaKeywords"
                        name="metaKeywords"
                        value={formData.metaKeywords}
                        onChange={handleChange}
                        placeholder="keyword1, keyword2, keyword3"
                        className="block w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col space-y-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex justify-center items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow hover:shadow-lg transition-colors"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        <span>Save {formData.status === 'published' ? 'and Publish' : 'Draft'}</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={togglePreview}
                    className="inline-flex justify-center items-center px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
                  >
                    <FaEye className="mr-2" />
                    <span>Preview</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={clearSavedDraft}
                    className="inline-flex justify-center items-center px-6 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-medium rounded-lg transition-colors"
                  >
                    <FaTimes className="mr-2" />
                    <span>Clear Draft</span>
                  </button>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autosaveEnabled}
                      onChange={toggleAutosave}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Enable autosave
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
            {/* Preview Header with Back button */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 -mx-6 -mt-6 mb-6 rounded-t-xl border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Article Preview</h2>
              <button
                onClick={togglePreview}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                Back to Editor
              </button>
            </div>
            
            {/* Article Preview Content */}
            <div className="overflow-y-auto max-h-[calc(100vh-12rem)]">
              <div className="max-w-4xl mx-auto">
                {/* Category */}
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                    {formData.category || 'Uncategorized'}
                  </span>
                </div>
                
                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                  {formData.title}
                </h1>
                
                {/* Author info */}
                <div className="flex items-center mb-6">
                  <div className="rounded-full bg-gray-300 dark:bg-gray-600 w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 mr-3">
                    {session?.user?.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{session?.user?.name || 'Admin User'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Just now (Preview)</p>
                  </div>
                </div>
                
                {/* Featured image */}
                {formData.coverImage && (
                  <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
                    <Image
                      src={formData.coverImage}
                      alt={formData.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        // If image fails to load, show placeholder
                        e.currentTarget.src = "https://via.placeholder.com/1200x800?text=Image+Not+Found";
                      }}
                    />
                  </div>
                )}
                
                {/* Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
                  <Markdown>{formData.content}</Markdown>
                </div>
                
                {/* Tags */}
                {formData.tags && (
                  <div className="mb-8">
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.split(',').map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm"
                        >
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Preview Modal - Article content preview */}
        {isPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
              {/* Modal header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Article Preview
                </h2>
                <button
                  onClick={togglePreview}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 000-16 8 8 000 16zm3.707-9.293a1 1 000-1.414-1.414L9 10.586 7.707 9.293a1 1 00-1.414 1.414l2 2a1 1 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
              
              {/* Modal content - Article preview that matches the published view */}
              <div className="p-6 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                  {/* Category tag */}
                  <div className="mb-4">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium">
                      {formData.category}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                    {formData.title}
                  </h1>

                  {/* Author info */}
                  <div className="flex items-center mb-8">
                    <div className="rounded-full bg-gray-300 dark:bg-gray-600 w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 mr-3">
                      {session?.user?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{session?.user?.name || 'Admin User'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Draft Preview</p>
                    </div>
                  </div>

                  {/* Featured image */}
                  {formData.coverImage && (
                    <div className="relative w-full h-80 mb-8 rounded-lg overflow-hidden">
                      <Image
                        src={formData.coverImage}
                        alt={formData.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          // If image fails to load, show placeholder
                          e.currentTarget.src = "https://via.placeholder.com/1200x800?text=Image+Not+Found";
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Content */}
                  <article className="prose prose-lg dark:prose-invert max-w-none mb-8">
                    <Markdown>{formData.content}</Markdown>
                  </article>
                  
                  {/* Tags */}
                  {formData.tags && (
                    <div className="mb-8">
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.split(',').map((tag, index) => (
                          <span 
                            key={index}
                            className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
