 "use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FaSave, 
  FaSpinner, 
  FaGlobe, 
  FaCog, 
  FaEnvelope, 
  FaServer,
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaInfoCircle
} from "react-icons/fa";
import AdminWrapper from "@/app/components/dashboard/AdminWrapper";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("general");
  
  const [settings, setSettings] = useState({
    general: {
      siteName: "TechNews",
      siteDescription: "Your source for the latest tech news and reviews",
      siteTagline: "Stay ahead with tech insights",
      siteUrl: "https://technews.example.com",
      logoUrl: "/images/logo.png",
      faviconUrl: "/images/favicon.ico",
      socialShareImage: "/images/social-share.png",
      postsPerPage: 10,
      defaultCategory: "News",
    },
    seo: {
      metaTitle: "TechNews - Latest Technology News and Reviews",
      metaDescription: "Stay updated with the latest technology news, product reviews, and digital trends on TechNews",
      useOpenGraph: true,
      googleAnalyticsId: "",
      enableIndexing: true,
      enableSitemap: true,
      sitemapChangeFreq: "daily",
      sitemapPriority: "0.7",
    },
    email: {
      smtpHost: "",
      smtpPort: 587,
      smtpUser: "",
      smtpPassword: "",
      fromEmail: "noreply@technews.example.com",
      fromName: "TechNews",
      sendWelcomeEmail: true,
      welcomeEmailSubject: "Welcome to TechNews",
      welcomeEmailTemplate: "Welcome to TechNews! We're excited to have you on board.",
    },
    api: {
      contentImportApiKey: "",
      openAiApiKey: "",
      enablePublicApi: false,
      rateLimit: 100,
    }
  });

  // Protected route - check for auth and admin role
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/settings");
    } else if (status === "authenticated") {
      if ((session.user as any).role !== "admin") {
        router.push("/unauthorized");
      } else {
        // Fetch settings (in production, this would be an API call)
        // For now, we'll use the default values set above
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    }
  }, [status, session, router]);

  // Handle input changes for different setting sections
  const handleChange = (section: string, field: string, value: string | number | boolean) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section as keyof typeof settings],
        [field]: value
      }
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      // In production, this would be an API call
      // const response = await fetch("/api/admin/settings", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(settings),
      // });
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setSuccess("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      setError("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
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
    <AdminWrapper>
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <div className="flex items-center">
                <div className="h-10 w-1.5 rounded-full bg-purple-600 dark:bg-purple-500 mr-4"></div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Site Settings</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2 ml-5.5">Configure your site settings and preferences</p>
            </div>
            <div className="mt-6 md:mt-0 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-2.5 px-5 rounded-lg shadow-sm hover:shadow transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Save Settings
                  </>
                )}
              </button>
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

          {/* Settings Area */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex overflow-x-auto scrollbar-none py-2 px-4 space-x-6" aria-label="Settings sections">
                <button
                  className={`pb-3 pt-1 font-medium text-sm px-1 ${
                    activeTab === "general"
                      ? "border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("general")}
                >
                  <span className="flex items-center">
                    <FaGlobe className="mr-2" />
                    General
                  </span>
                </button>
                <button
                  className={`pb-3 pt-1 font-medium text-sm px-1 ${
                    activeTab === "seo"
                      ? "border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("seo")}
                >
                  <span className="flex items-center">
                    <FaCog className="mr-2" />
                    SEO
                  </span>
                </button>
                <button
                  className={`pb-3 pt-1 font-medium text-sm px-1 ${
                    activeTab === "email"
                      ? "border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("email")}
                >
                  <span className="flex items-center">
                    <FaEnvelope className="mr-2" />
                    Email
                  </span>
                </button>
                <button
                  className={`pb-3 pt-1 font-medium text-sm px-1 ${
                    activeTab === "api"
                      ? "border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("api")}
                >
                  <span className="flex items-center">
                    <FaServer className="mr-2" />
                    API
                  </span>
                </button>
              </nav>
            </div>

            {/* Form Fields */}
            <form className="p-6" onSubmit={handleSubmit}>
              {/* General Settings */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">General Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Site Name
                      </label>
                      <input
                        type="text"
                        id="siteName"
                        value={settings.general.siteName}
                        onChange={(e) => handleChange("general", "siteName", e.target.value)}
                        className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="siteUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Site URL
                      </label>
                      <input
                        type="url"
                        id="siteUrl"
                        value={settings.general.siteUrl}
                        onChange={(e) => handleChange("general", "siteUrl", e.target.value)}
                        className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Site Description
                      </label>
                      <textarea
                        id="siteDescription"
                        value={settings.general.siteDescription}
                        onChange={(e) => handleChange("general", "siteDescription", e.target.value)}
                        rows={2}
                        className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="siteTagline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Site Tagline
                      </label>
                      <input
                        type="text"
                        id="siteTagline"
                        value={settings.general.siteTagline}
                        onChange={(e) => handleChange("general", "siteTagline", e.target.value)}
                        className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Logo URL
                      </label>
                      <input
                        type="text"
                        id="logoUrl"
                        value={settings.general.logoUrl}
                        onChange={(e) => handleChange("general", "logoUrl", e.target.value)}
                        className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="faviconUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Favicon URL
                      </label>
                      <input
                        type="text"
                        id="faviconUrl"
                        value={settings.general.faviconUrl}
                        onChange={(e) => handleChange("general", "faviconUrl", e.target.value)}
                        className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="socialShareImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Social Share Image
                      </label>
                      <input
                        type="text"
                        id="socialShareImage"
                        value={settings.general.socialShareImage}
                        onChange={(e) => handleChange("general", "socialShareImage", e.target.value)}
                        className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="postsPerPage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Posts Per Page
                      </label>
                      <input
                        type="number"
                        id="postsPerPage"
                        value={settings.general.postsPerPage}
                        onChange={(e) => handleChange("general", "postsPerPage", parseInt(e.target.value))}
                        min="1"
                        max="100"
                        className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="defaultCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Default Category
                      </label>
                      <input
                        type="text"
                        id="defaultCategory"
                        value={settings.general.defaultCategory}
                        onChange={(e) => handleChange("general", "defaultCategory", e.target.value)}
                        className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SEO Settings */}
              {activeTab === "seo" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">SEO Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Default Meta Title
                      </label>
                      <input
                        type="text"
                        id="metaTitle"
                        value={settings.seo.metaTitle}
                        onChange={(e) => handleChange("seo", "metaTitle", e.target.value)}
                        className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Default Meta Description
                      </label>
                      <textarea
                        id="metaDescription"
                        value={settings.seo.metaDescription}
                        onChange={(e) => handleChange("seo", "metaDescription", e.target.value)}
                        rows={2}
                        className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="googleAnalyticsId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Google Analytics ID
                      </label>
                      <input
                        type="text"
                        id="googleAnalyticsId"
                        value={settings.seo.googleAnalyticsId}
                        onChange={(e) => handleChange("seo", "googleAnalyticsId", e.target.value)}
                        placeholder="G-XXXXXXXXXX"
                        className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="useOpenGraph" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Enable Open Graph Tags
                        </label>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none">
                          <input
                            type="checkbox"
                            id="useOpenGraph"
                            checked={settings.seo.useOpenGraph}
                            onChange={(e) => handleChange("seo", "useOpenGraph", e.target.checked)}
                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-out checked:right-0 checked:border-purple-500"
                          />
                          <label
                            htmlFor="useOpenGraph"
                            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                              settings.seo.useOpenGraph ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          ></label>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Open Graph tags improve sharing on social media
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="enableIndexing" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Allow Search Engine Indexing
                        </label>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none">
                          <input
                            type="checkbox"
                            id="enableIndexing"
                            checked={settings.seo.enableIndexing}
                            onChange={(e) => handleChange("seo", "enableIndexing", e.target.checked)}
                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-out checked:right-0 checked:border-purple-500"
                          />
                          <label
                            htmlFor="enableIndexing"
                            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                              settings.seo.enableIndexing ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          ></label>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Disable to prevent search engines from indexing your site
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="enableSitemap" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Generate Sitemap
                        </label>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none">
                          <input
                            type="checkbox"
                            id="enableSitemap"
                            checked={settings.seo.enableSitemap}
                            onChange={(e) => handleChange("seo", "enableSitemap", e.target.checked)}
                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-out checked:right-0 checked:border-purple-500"
                          />
                          <label
                            htmlFor="enableSitemap"
                            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                              settings.seo.enableSitemap ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          ></label>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Automatically generate and update sitemap.xml
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Settings */}
              {activeTab === "email" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Email Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        id="smtpHost"
                        value={settings.email.smtpHost}
                        onChange={(e) => handleChange("email", "smtpHost", e.target.value)}
                        placeholder="smtp.example.com"
                        className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        id="smtpPort"
                        value={settings.email.smtpPort}
                        onChange={(e) => handleChange("email", "smtpPort", parseInt(e.target.value))}
                        className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="smtpUser" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        SMTP Username
                      </label>
                      <input
                        type="text"
                        id="smtpUser"
                        value={settings.email.smtpUser}
                        onChange={(e) => handleChange("email", "smtpUser", e.target.value)}
                        className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        SMTP Password
                      </label>
                      <input
                        type="password"
                        id="smtpPassword"
                        value={settings.email.smtpPassword}
                        onChange={(e) => handleChange("email", "smtpPassword", e.target.value)}
                        className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        From Email
                      </label>
                      <input
                        type="email"
                        id="fromEmail"
                        value={settings.email.fromEmail}
                        onChange={(e) => handleChange("email", "fromEmail", e.target.value)}
                        className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="fromName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        From Name
                      </label>
                      <input
                        type="text"
                        id="fromName"
                        value={settings.email.fromName}
                        onChange={(e) => handleChange("email", "fromName", e.target.value)}
                        className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <div className="flex items-center mb-4">
                        <input
                          id="sendWelcomeEmail"
                          type="checkbox"
                          checked={settings.email.sendWelcomeEmail}
                          onChange={(e) => handleChange("email", "sendWelcomeEmail", e.target.checked)}
                          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="sendWelcomeEmail" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                          Send welcome email to new users
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="welcomeEmailSubject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Welcome Email Subject
                      </label>
                      <input
                        type="text"
                        id="welcomeEmailSubject"
                        value={settings.email.welcomeEmailSubject}
                        onChange={(e) => handleChange("email", "welcomeEmailSubject", e.target.value)}
                        className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="welcomeEmailTemplate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Welcome Email Template
                      </label>
                      <textarea
                        id="welcomeEmailTemplate"
                        value={settings.email.welcomeEmailTemplate}
                        onChange={(e) => handleChange("email", "welcomeEmailTemplate", e.target.value)}
                        rows={4}
                        className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        You can use placeholders like {"{{username}}"}, {"{{siteUrl}}"}, and {"{{siteName}}"}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* API Settings */}
              {activeTab === "api" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">API Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="contentImportApiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Content Import API Key
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          id="contentImportApiKey"
                          value={settings.api.contentImportApiKey}
                          onChange={(e) => handleChange("api", "contentImportApiKey", e.target.value)}
                          className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <button
                            type="button"
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            onClick={() => {
                              const input = document.getElementById('contentImportApiKey') as HTMLInputElement;
                              input.type = input.type === 'password' ? 'text' : 'password';
                            }}
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Used for scheduled content imports
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="openAiApiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        OpenAI API Key
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          id="openAiApiKey"
                          value={settings.api.openAiApiKey}
                          onChange={(e) => handleChange("api", "openAiApiKey", e.target.value)}
                          className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <button
                            type="button"
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            onClick={() => {
                              const input = document.getElementById('openAiApiKey') as HTMLInputElement;
                              input.type = input.type === 'password' ? 'text' : 'password';
                            }}
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Required for AI-powered features
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="enablePublicApi" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Enable Public API
                        </label>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none">
                          <input
                            type="checkbox"
                            id="enablePublicApi"
                            checked={settings.api.enablePublicApi}
                            onChange={(e) => handleChange("api", "enablePublicApi", e.target.checked)}
                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-out checked:right-0 checked:border-purple-500"
                          />
                          <label
                            htmlFor="enablePublicApi"
                            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                              settings.api.enablePublicApi ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          ></label>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Allow public access to read-only API endpoints
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="rateLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        API Rate Limit (requests per minute)
                      </label>
                      <input
                        type="number"
                        id="rateLimit"
                        value={settings.api.rateLimit}
                        onChange={(e) => handleChange("api", "rateLimit", parseInt(e.target.value))}
                        min="10"
                        max="1000"
                        className="block w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                      />
                    </div>
                    
                    <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/40">
                      <div className="flex">
                        <FaInfoCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">API Documentation</h3>
                          <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                            <p>The public API allows read-only access to published content. For documentation, visit:</p>
                            <p className="mt-1 font-medium">{settings.general.siteUrl}/api/docs</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
          
          {/* Save Button (bottom) */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-2.5 px-5 rounded-lg shadow-sm hover:shadow transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Save Settings
                </>
              )}
            </button>          </div>
        </div>
    </AdminWrapper>
  );
}

type FaEye = React.ElementType;
const FaEye: FaEye = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 576 512"
      className={className}
      fill="currentColor"
    >
      <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"/>
    </svg>
  );
};
