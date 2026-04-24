import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['172.16.232.69'],
  images: {
    qualities: [75, 80],
  },
};

export default nextConfig;
