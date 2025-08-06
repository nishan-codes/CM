import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  /* config options here */
  images: {
    unoptimized: true
  }
};

export default nextConfig;
