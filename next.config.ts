import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Prevent stale webpack chunk errors (e.g. Cannot find module './873.js') after crashes. */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
