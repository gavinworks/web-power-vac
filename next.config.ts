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
    // Next's defaults plus 160, so the 80px header logo gets a close match on phones instead of jumping to 256
    imageSizes: [32, 48, 64, 96, 128, 160, 256, 384],
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
