import type { NextConfig } from "next";

const directusUrl =
  process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://localhost:8055";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/files/:id",
        destination: `${directusUrl}/assets/:id`,
      },
    ];
  },
};

export default nextConfig;
