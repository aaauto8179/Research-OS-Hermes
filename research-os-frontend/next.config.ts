import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-dialog", "@radix-ui/react-tabs"],
  },
  output: 'standalone',
  turbopack: {
    resolveAlias: {},
  },
  async rewrites() {
    return [
      { source: '/api/math-engine/:path*', destination: `${process.env.MATH_ENGINE_URL || 'https://math-engine-api.vercel.app'}/:path*` },
      { source: '/api/data-ingestion/:path*', destination: `${process.env.DATA_INGESTION_URL || 'https://data-ingestion-api.vercel.app'}/:path*` }
    ];
  }
};

export default nextConfig;
