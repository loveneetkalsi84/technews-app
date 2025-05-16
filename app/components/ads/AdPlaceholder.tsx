"use client";

import { useEffect, useState } from "react";
import AdSense from "./AdSense";

export default function AdPlaceholder({ type = "banner" }: { type: "banner" | "sidebar" | "in-article" | "native" }) {
  const [useRealAds, setUseRealAds] = useState(false);
  
  // Check if we should show real ads (in production) or placeholders
  useEffect(() => {
    // Enable real ads in production
    setUseRealAds(process.env.NODE_ENV === "production");
  }, []);
    // Map ad types to AdSense ad slots and formats
  const adConfig = {
    banner: { slot: "8123456789", format: "horizontal" as const, className: "h-24 md:h-32" },
    sidebar: { slot: "7987654321", format: "vertical" as const, className: "h-[400px] w-full" },
    "in-article": { slot: "6122334455", format: "rectangle" as const, className: "h-32 md:h-48" },
    native: { slot: "5566778899", format: "auto" as const, className: "h-40 md:h-48" },
  };
  
  const config = adConfig[type];
  
  // If using real ads and in production, render the AdSense component
  if (useRealAds) {
    return (
      <div className="mb-6">
        <p className="font-medium text-gray-400 dark:text-gray-500 text-center text-xs mb-1">Advertisement</p>
        <AdSense 
          adSlot={config.slot} 
          adFormat={config.format} 
          className={config.className} 
        />
      </div>
    );
  }
  
  // Otherwise show the placeholder in development
  let style = "bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded overflow-hidden relative";
  
  if (type === "native") {
    style += " border border-gray-200 dark:border-gray-700";
  }

  return (
    <div className={`${style} ${config.className} flex items-center justify-center mb-6`}>
      <div className="text-center">
        <p className="font-medium text-gray-400 dark:text-gray-500">Advertisement</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          {type === "banner" && "Banner Ad - 728×90"}
          {type === "sidebar" && "Sidebar Ad - 300x600"}
          {type === "in-article" && "In-article Ad - 728×90"}
          {type === "native" && "Native Ad"}
        </p>
      </div>
      
      {/* Placeholder visualization for development */}
      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-24 h-24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
          />
        </svg>
      </div>
    </div>
  );
}
