import type { NextConfig } from "next";

const DEFAULT_BACKEND_URL = "https://focusquest-backend-72376614461.us-central1.run.app";
const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  eslint: {
    // Allow production builds to complete even if ESLint errors are present
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/eyetracking",
        destination: `${BACKEND_URL}/eyetracking`,
      },
    ];
  },
};

export default nextConfig;
