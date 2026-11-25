import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep old WordPress-style URLs such as /mo-da-doi/ (see docs/ARCHITECTURE.md §5).
  trailingSlash: true,
  images: {
    // Uploaded images are served from Cloudinary (see docs/ARCHITECTURE.md §1).
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
