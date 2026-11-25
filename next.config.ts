import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep old WordPress-style URLs such as /mo-da-doi/ (see docs/ARCHITECTURE.md §5).
  trailingSlash: true,
};

export default nextConfig;
