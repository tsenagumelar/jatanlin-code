import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
