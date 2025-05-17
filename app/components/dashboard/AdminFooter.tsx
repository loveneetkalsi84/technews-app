"use client";

import Link from "next/link";
import { FaHeart, FaGithub, FaTwitter } from "react-icons/fa";

export default function AdminFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-b from-transparent to-gray-50 dark:from-transparent dark:to-gray-850 border-t border-gray-200 dark:border-gray-700 pt-4 pb-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <span>
              &copy; {currentYear} TechNews.{" "}
              <span className="hidden sm:inline">Crafted with </span>
              <FaHeart className="inline-block mx-1 text-red-500 h-3 w-3 animate-pulse-subtle" />
              <span className="hidden sm:inline"> by the TechNews Team</span>
            </span>
          </div>
          
          <div className="flex gap-6 items-center">
            <Link 
              href="/admin/settings" 
              className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors flex items-center focus:outline-none focus:text-blue-600 dark:focus:text-blue-400"
            >
              Settings
            </Link>
            <Link 
              href="/" 
              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center focus:outline-none focus:text-blue-700 dark:focus:text-blue-300"
            >
              Visit Site
            </Link>
            <Link 
              href="/admin/help" 
              className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors flex items-center focus:outline-none focus:text-blue-600 dark:focus:text-blue-400"
            >
              Help & Support
            </Link>
            
            <div className="flex items-center space-x-3 ml-2">
              <a 
                href="https://github.com/yourusername/technews" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
                aria-label="GitHub"
              >
                <FaGithub className="h-4 w-4" />
              </a>
              <a 
                href="https://twitter.com/technews" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700"
                aria-label="Twitter"
              >
                <FaTwitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-500 animate-fadeIn">
          <p>Version 2.0.0 | <Link href="/admin/changelog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Changelog</Link></p>
        </div>
      </div>
    </footer>
  );
}
