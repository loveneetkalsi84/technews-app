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
  const statItems = [
    {
      title: "Total Articles",
      value: stats.articles,
      icon: <FaNewspaper className="text-blue-500" />,
      change: "+12%",
      trend: "up",
    },
    {
      title: "Registered Users",
      value: stats.users,
      icon: <FaUsers className="text-green-500" />,
      change: "+8%",
      trend: "up",
    },
    {
      title: "Comments",
      value: stats.comments,
      icon: <FaComments className="text-purple-500" />,
      change: "+24%",
      trend: "up",
    },
    {
      title: "Total Page Views",
      value: stats.views.toLocaleString(),
      icon: <FaChartLine className="text-red-500" />,
      change: "+18%",
      trend: "up",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                {item.title}
              </p>
              <h3 className="text-2xl font-bold mt-1">{item.value}</h3>
            </div>
            <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
              {item.icon}
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span
              className={`text-xs font-semibold ${
                item.trend === "up"
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {item.change}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              since last month
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
