"use client";

import { FaNewspaper, FaUsers, FaComments, FaChartLine } from "react-icons/fa";

interface StatsCardsProps {
  stats: {
    articles: number;
    users: number;
    comments: number;
    views: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const statItems = [    {
      title: "Total Articles",
      value: stats.articles,
      icon: <FaNewspaper className="text-blue-500 text-2xl" />,
      change: "+12%",
      trend: "up",
      gradientFrom: "from-blue-600",
      gradientTo: "to-indigo-600",
      bgFrom: "from-blue-50",
      bgTo: "to-blue-100",
      darkBgFrom: "dark:from-blue-900/30",
      darkBgTo: "dark:to-blue-800/30",
    },
    {
      title: "Registered Users",
      value: stats.users,
      icon: <FaUsers className="text-emerald-500 text-2xl" />,
      change: "+8%",
      trend: "up",
      gradientFrom: "from-emerald-600",
      gradientTo: "to-green-600",
      bgFrom: "from-emerald-50",
      bgTo: "to-emerald-100",
      darkBgFrom: "dark:from-emerald-900/30",
      darkBgTo: "dark:to-emerald-800/30",
    },
    {
      title: "Comments",
      value: stats.comments,
      icon: <FaComments className="text-purple-500 text-2xl" />,
      change: "+24%",
      trend: "up",
      gradientFrom: "from-purple-600",
      gradientTo: "to-violet-600",
      bgFrom: "from-purple-50",
      bgTo: "to-purple-100",
      darkBgFrom: "dark:from-purple-900/30",
      darkBgTo: "dark:to-purple-800/30",
    },
    {
      title: "Total Page Views",
      value: stats.views.toLocaleString(),
      icon: <FaChartLine className="text-rose-500 text-2xl" />,
      change: "+18%",
      trend: "up",
      gradientFrom: "from-rose-600",
      gradientTo: "to-red-600",
      bgFrom: "from-rose-50",
      bgTo: "to-rose-100",
      darkBgFrom: "dark:from-rose-900/30",
      darkBgTo: "dark:to-rose-800/30",
    },
  ];  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 transform hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/5 rounded-bl-[100px] z-0"></div>
          <div className="flex items-center justify-between relative z-10">            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide uppercase">
                {item.title}
              </p>              <h3 className={`text-3xl font-bold mt-2 bg-clip-text text-transparent bg-gradient-to-r 
              ${item.gradientFrom} ${item.gradientTo} dark:from-white dark:to-gray-300`}>
                {item.value}
              </h3>
            </div>
            <div className={`w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br 
            ${item.bgFrom} ${item.bgTo} ${item.darkBgFrom} ${item.darkBgTo} shadow-sm`}>
              {item.icon}
            </div>
          </div>          <div className="mt-4 flex items-center">
            <span
              className={`px-2.5 py-1.5 rounded-full text-xs font-semibold flex items-center shadow-sm ${
                item.trend === "up"
                  ? "bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-800 dark:from-green-900/40 dark:to-green-800/40 dark:text-green-300"
                  : "bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-800 dark:from-red-900/40 dark:to-red-800/40 dark:text-red-300"
              }`}
            >
              {item.change}
              {item.trend === "up" ? (
                <svg className="w-3 h-3 ml-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              ) : (
                <svg className="w-3 h-3 ml-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              )}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 font-medium">
              since last month
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
