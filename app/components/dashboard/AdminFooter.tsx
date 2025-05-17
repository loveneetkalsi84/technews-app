"use client";

import Link from "next/link";
import { FaHeart } from "react-icons/fa";

export default function AdminFooter() {
  const currentYear = new Date().getFullYear();
    return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-3 sm:py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <span className="text-center sm:text-left">
            &copy; {currentYear} TechNews. All rights reserved.
          </span>
          <span className="inline-flex items-center mt-2 sm:mt-0">
            Made with <FaHeart className="mx-1 text-red-500 h-3 w-3" /> by TechNews Team
          </span>
        </div>
        
        <div className="mt-2 text-center sm:text-right text-xs text-gray-500 dark:text-gray-500">
          <p>Version 2.0.0</p>
        </div>
      </div>
    </footer>
  );
}
