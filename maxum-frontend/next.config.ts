import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Dev-only double mount of effects is off so data fetches run once per mount (prod unchanged). */
  reactStrictMode: false,
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.coincap.io",
        pathname: "/assets/icons/**",
      },
    ],
  },
};

export default nextConfig;
