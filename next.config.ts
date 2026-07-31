import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Profile images are limited to 4MB. Keep extra room for
      // multipart/form-data boundaries and headers.
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
