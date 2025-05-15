"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaEdit, FaEye, FaPlus, FaTrash, FaUsers, FaNewspaper, FaRss, FaChartBar, FaDatabase, FaCog } from "react-icons/fa";
import Link from "next/link";

// Dashboard components
import DashboardSidebar from "@/app/components/dashboard/DashboardSidebar";
import StatsCards from "@/app/components/dashboard/StatsCards";
import ArticlesTable from "@/app/components/dashboard/ArticlesTable";
import LatestComments from "@/app/components/dashboard/LatestComments";
import PerformanceChart from "@/app/components/dashboard/PerformanceChart";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    articles: 0,
    comments: 0,
    users: 0,
    views: 0,
  });  // Define the article type to match ArticlesTable component expectations
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

  const [recentArticles, setRecentArticles] = useState<Article[]>([]);

  // Protected route - check for auth and admin role
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin");
    } else if (status === "authenticated") {
      if ((session.user as any).role !== "admin") {
        router.push("/unauthorized");
      } else {
        // Load dashboard data
        fetchDashboardData();
      }
    }
  }, [status, session, router]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    
    try {
      // In production, fetch from API
      // const response = await fetch("/api/admin/dashboard");
      // const data = await response.json();
      // setStats(data.stats);
      // setRecentArticles(data.recentArticles);
      
      // For now, use mock data
      setTimeout(() => {
        setStats({
          articles: 157,
          comments: 324,
          users: 1253,
          views: 45892,
        });
        
        setRecentArticles([
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
        ]);
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setIsLoading(false);
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
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Welcome back, {session?.user?.name}!</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Link
                href="/admin/articles/new"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                <FaPlus className="mr-2" />
                New Article
              </Link>
              <Link
                href="/admin/import"
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                <FaRss className="mr-2" />
                Import Content
              </Link>
            </div>
          </div>

          {/* Stats cards */}
          <StatsCards stats={stats} />

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Traffic Overview</h2>
              <PerformanceChart />
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Recent Comments</h2>
              <LatestComments />
            </div>
          </div>

          {/* Recent articles */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Recent Articles</h2>
              <Link
                href="/admin/articles"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View all articles
              </Link>
            </div>
            <ArticlesTable articles={recentArticles} />
          </div>

          {/* Quick actions */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/admin/articles"
                className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <FaNewspaper className="text-blue-600 dark:text-blue-400 text-2xl mb-2" />
                <span>Manage Articles</span>
              </Link>
              <Link
                href="/admin/users"
                className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <FaUsers className="text-green-600 dark:text-green-400 text-2xl mb-2" />
                <span>Manage Users</span>
              </Link>
              <Link
                href="/admin/analytics"
                className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <FaChartBar className="text-purple-600 dark:text-purple-400 text-2xl mb-2" />
                <span>Analytics</span>
              </Link>
              <Link
                href="/admin/settings"
                className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <FaCog className="text-gray-600 dark:text-gray-400 text-2xl mb-2" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
