import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // izinkan semua domain https
      },
      {
        protocol: "http",
        hostname: "**", // izinkan semua domain http
      },
    ],
  },
};

export default nextConfig;
