import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  env: {
    NEXT_BASE_URL: process.env.NEXT_BASE_URL,
    NEXT_HAWK_BASE_URL: process.env.NEXT_HAWK_BASE_URL,
    NEXT_HAWK_INITIAL_PARAMS: process.env.NEXT_HAWK_INITIAL_PARAMS,
    NEXT_HAWK_END_PARAMS: process.env.NEXT_HAWK_END_PARAMS,
    NEXT_GOOGLE_MAPS_API_KEY: process.env.NEXT_GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
