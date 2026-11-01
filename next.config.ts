import type { NextConfig } from "next";

const mediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(
  /\/+$/,
  "",
);

const nextConfig: NextConfig = {
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
