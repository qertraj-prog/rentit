import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
      // Unsplash placeholders
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // User uploaded via URL
      { protocol: 'https', hostname: '*.cloudinary.com' },
    ],
  },
  // Security: prevent exposing Next.js version
  poweredByHeader: false,
};

export default nextConfig;
