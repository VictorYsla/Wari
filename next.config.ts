import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_HAWK_BASE_URL: process.env.NEXT_HAWK_BASE_URL,
    NEXT_HAWK_INITIAL_PARAMS: process.env.NEXT_HAWK_INITIAL_PARAMS,
    NEXT_HAWK_END_PARAMS: process.env.NEXT_HAWK_END_PARAMS,
    NEXT_GOOGLE_MAPS_API_KEY: process.env.NEXT_GOOGLE_MAPS_API_KEY
  },
};

export default nextConfig;
