import type { NextConfig } from "next";

const mediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(
  /\/+$/,
  "",
);

const nextConfig: NextConfig = {
  // The end-to-end suite builds apart, so it never mixes with `.next`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    serverActions: {
      // Product images arrive already reduced by the browser (up to 4 MB).
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: mediaBaseUrl ? [new URL(`${mediaBaseUrl}/**`)] : [],
  },
};

export default nextConfig;
