"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  FaChartBar, 
  FaChartLine, 
  FaChartPie, 
  FaFileDownload, 
  FaCalendarAlt,
  FaUsers,
  FaGlobe,
  FaDesktop,
  FaMobile,
  FaTabletAlt
} from "react-icons/fa";
import Link from "next/link";

// Analytics components (you can create these in components/dashboard folder)
const PerformanceChart = ({ data, type }: { data: any; type: string }) => {
  // For the real implementation, you'd use a charting library like recharts, chart.js, etc.
  return (
    <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 min-h-[300px] flex items-center justify-center">
      <div className="text-center text-gray-500 dark:text-gray-400">
        <FaChartLine className="mx-auto h-12 w-12 mb-3" />
        <p className="mb-2">This is a placeholder for the {type} chart</p>
        <p className="text-sm">In production, this would show real data visualization</p>
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7days");  const [analyticsData, setAnalyticsData] = useState({
    pageViews: 0,
    uniqueVisitors: 0,
    averageTimeOnSite: "0:00",
    bounceRate: "0%",
    trafficSources: [] as Array<{ source: string; percentage: number }>,
    topContent: [] as Array<{ title: string; views: number; path: string }>,
    deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
    dailyStats: [] as Array<{ date: string; views: number; visitors: number }>
  });

  // Protected route - check for auth and admin role
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/analytics");
    } else if (status === "authenticated") {
      if ((session.user as any).role !== "admin") {
        router.push("/unauthorized");
      } else {
        fetchAnalyticsData(timeRange);
      }
    }
  }, [status, session, router, timeRange]);

  const fetchAnalyticsData = async (range: string) => {
    try {
      setIsLoading(true);
      
      // In production, fetch from API based on selected time range
      // const response = await fetch(`/api/analytics?range=${range}`);
      // const data = await response.json();
      // setAnalyticsData(data);
      
      // For now, use mock data
      setTimeout(() => {
        const mockData = {
          pageViews: range === '7days' ? 24750 : range === '30days' ? 98320 : 320150,
          uniqueVisitors: range === '7days' ? 15834 : range === '30days' ? 59247 : 186923,
          averageTimeOnSite: "2:34",
          bounceRate: "38%",
          trafficSources: [
            { source: "Organic Search", percentage: 42 },
            { source: "Direct", percentage: 25 },
            { source: "Social Media", percentage: 18 },
            { source: "Referral", percentage: 12 },
            { source: "Email", percentage: 3 }
          ],
          topContent: [
            { title: "The Future of AI in Gaming: What to Expect in 2025", views: 4235, path: "/articles/future-ai-gaming-2025" },
            { title: "Review: The Latest MacBook Pro M3 Max - Worth the Upgrade?", views: 3128, path: "/articles/review-macbook-pro-m3-max" },
            { title: "Samsung Galaxy S23 Ultra Review", views: 2742, path: "/articles/samsung-galaxy-s23-ultra-review" },
            { title: "How Web3 is Transforming Online Communities", views: 2318, path: "/articles/web3-transforming-online-communities" },
            { title: "10 Must-Have Tech Gadgets for 2025", views: 1975, path: "/articles/must-have-tech-gadgets-2025" }
          ],
          deviceBreakdown: { desktop: 45, mobile: 49, tablet: 6 },
          dailyStats: Array(range === '7days' ? 7 : range === '30days' ? 30 : 90).fill(0).map((_, i) => ({
            date: new Date(Date.now() - (i * 86400000)).toISOString().split('T')[0],
            views: Math.floor(Math.random() * 5000) + 1000,
            visitors: Math.floor(Math.random() * 3000) + 500
          })).reverse()
        };
        
        setAnalyticsData(mockData);
        setIsLoading(false);
      }, 800);
      
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setIsLoading(false);
    }
  };

  const downloadReportAsCSV = () => {
    // In production, this would generate a real CSV file
    alert('In production, this would download a CSV report of your analytics data.');
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center">
                <div className="h-10 w-1.5 rounded-full bg-yellow-600 dark:bg-yellow-500 mr-4"></div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2 ml-5.5">Track and analyze your site performance</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner">
                <button
                  onClick={() => setTimeRange('7days')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    timeRange === '7days' 
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => setTimeRange('30days')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    timeRange === '30days' 
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                  }`}
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => setTimeRange('90days')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    timeRange === '90days' 
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                  }`}
                >
                  Last 90 Days
                </button>
              </div>
              <button
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"
              >
                <FaFileDownload className="mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 mr-4">
                    <FaChartLine className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Page Views</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.pageViews.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 mr-4">
                    <FaUsers className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Visitors</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.uniqueVisitors.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 mr-4">
                    <FaChartBar className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Time on Site</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.averageTimeOnSite}</h3>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 mr-4">
                    <FaChartPie className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bounce Rate</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.bounceRate}</h3>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Traffic Overview</h2>
                <PerformanceChart data={analyticsData.dailyStats} type="traffic" />
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Traffic Sources</h2>
                <div className="space-y-4">
                  {analyticsData.trafficSources.map((source, index) => (
                    <div key={index} className="relative">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{source.source}</span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{source.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            index === 0 ? 'bg-blue-600' : 
                            index === 1 ? 'bg-green-500' : 
                            index === 2 ? 'bg-purple-500' : 
                            index === 3 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${source.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Device Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Device Breakdown</h2>
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 mr-3">
                        <FaDesktop className="text-lg" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Desktop</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{analyticsData.deviceBreakdown.desktop}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 mr-3">
                        <FaMobile className="text-lg" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mobile</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{analyticsData.deviceBreakdown.mobile}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 mr-3">
                        <FaTabletAlt className="text-lg" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tablet</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{analyticsData.deviceBreakdown.tablet}%</span>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Content</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Article</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Views</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {analyticsData.topContent.map((content, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            <Link href={content.path} className="hover:text-blue-600 dark:hover:text-blue-400">
                              {content.title}
                            </Link>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                            {content.views.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Additional insights could be added here */}
          </>
        )}
      </div>
    </div>
  );
}
