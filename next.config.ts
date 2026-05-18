import type { NextConfig } from "next";

const DEFAULT_BACKEND_URL = "https://focusquest-backend-72376614461.us-central1.run.app";
const BACKEND_PUBLIC_URL = (
  process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL
).replace(/\/+$/, "");
const BACKEND_INTERNAL_URL = (
  process.env.BACKEND_INTERNAL_URL || BACKEND_PUBLIC_URL
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  eslint: {
    // Allow production builds to complete even if ESLint errors are present
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to complete even if TypeScript errors are present
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_INTERNAL_URL}/api/:path*`,
      },
      {
        source: "/eyetracking",
        destination: `${BACKEND_INTERNAL_URL}/eyetracking`,
      },
    ];
  },
};

export default nextConfig;
