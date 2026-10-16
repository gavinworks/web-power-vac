import type { NextConfig } from "next";

const directusUrl = (
  process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://localhost:8055"
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // Only Directus may frame the site, for live preview and the visual editor.
  // netlify.toml sends the same header on the deployed site.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors 'self' ${new URL(directusUrl).origin}`,
          },
        ],
      },
    ];
  },
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
