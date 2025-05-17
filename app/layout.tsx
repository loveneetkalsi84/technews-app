import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
// Fix the import path using absolute imports
import { Providers } from "@/app/providers";
import { ReactNode } from "react";
// Conditionally include Header and Footer only for non-admin pages
import ConditionalHeader from "@/app/components/layout/ConditionalHeader";
import ConditionalFooter from "@/app/components/layout/ConditionalFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TechNews - Latest Technology News and Reviews",
  description: "Stay updated with the latest tech news, product reviews, and expert insights on TechNews.",
  keywords: "tech news, technology, reviews, smartphones, laptops, AI, gaming",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google AdSense Script */}
        <Script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        
        {/* Google AdSense Auto Ads - Optional */}
        <Script id="adsense-auto-ads" strategy="afterInteractive">
          {`
            (adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: "ca-pub-1234567890123456",
              enable_page_level_ads: true,
              overlays: {bottom: true}
            });
          `}
        </Script>
        
        {/* Google Analytics Script */}
        <Script 
          async 
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ANALYTICS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950`}>
        <Providers>
          <ConditionalHeader />
          <main className="flex-grow">
            {children}
          </main>
          <ConditionalFooter />
        </Providers>
      </body>
    </html>
  );
}
