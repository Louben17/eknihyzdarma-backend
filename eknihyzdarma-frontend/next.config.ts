import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eknihyzdarma-backend-1.onrender.com",
      },
    ],
  },
};

export default nextConfig;
