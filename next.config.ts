import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "randomuser.me"
      },
      {
        protocol: "http",
        hostname: "localhost"
      },
      {
        protocol: "https",
        hostname: "pagead2.googlesyndication.com"
      },
      {
        protocol: "https",
        hostname: "googleads.g.doubleclick.net"
      },
    ],
  },
  // Add security headers to allow AdSense scripts
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.googletagservices.com https://www.googletagmanager.com; frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com; img-src 'self' data: https: blob:; style-src 'self' 'unsafe-inline'; connect-src 'self' https://www.google-analytics.com;",
        },
      ],
    },
  ],
};

export default nextConfig;
