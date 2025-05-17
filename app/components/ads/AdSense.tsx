"use client";

import { useEffect, useRef } from "react";

interface AdSenseProps {
  adSlot: string;
  adFormat?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  style?: React.CSSProperties;
  className?: string;
}

export default function AdSense({
  adSlot,
  adFormat = "auto",
  style = {},
  className = "",
}: AdSenseProps) {
  // Using any type to avoid TypeScript limitations with the ins element
  const adRef = useRef<any>(null);

  useEffect(() => {
    // Skip in development mode to avoid console errors
    if (process.env.NODE_ENV === "development") return;

    try {
      // Add the ad unit after the component has mounted
      if (adRef.current && typeof window !== "undefined") {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
      }
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  // Skip rendering actual ads in development mode
  if (process.env.NODE_ENV === "development") {
    return (
      <div
        className={`adsense-placeholder ${className}`}
        style={{
          background: "rgba(0,0,0,0.05)",
          padding: "1rem",
          borderRadius: "0.5rem",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: adFormat === "horizontal" ? "90px" : "250px",
          width: "100%",
          ...style,
        }}
      >
        <span className="text-gray-400">AdSense Ad (slot: {adSlot})</span>
      </div>
    );
  }
  return (
    <div className={className} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-1234567890123456"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}
