import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "images.unsplash.com",  // For Unsplash images
      "randomuser.me",        // For random user profile images
      "localhost",            // For local development
    ],
  },
};

export default nextConfig;
