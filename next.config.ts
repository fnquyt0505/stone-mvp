import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep old WordPress-style URLs such as /mo-da-doi/ (see docs/ARCHITECTURE.md §5).
  trailingSlash: true,
  env: {
    // Versions data-cache keys per build (see src/server/cache-key.ts).
    CACHE_BUILD_ID:
      process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? String(Date.now()),
  },
  images: {
    // Uploaded images are served from Cloudinary (see docs/ARCHITECTURE.md §1).
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
