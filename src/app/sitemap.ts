import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getPosts, getServices } from "@/lib/directus";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, posts] = await Promise.all([getServices(), getPosts()]);
  const url = (path: string) => `${siteConfig.url}${path}`;

  return [
    { url: url("/"), changeFrequency: "monthly", priority: 1 },
    { url: url("/services"), changeFrequency: "monthly", priority: 0.9 },
    ...services
      .filter((s) => s.has_page)
      .map((s) => ({
        url: url(`/services/${s.slug}`),
        changeFrequency: "monthly" as const,
        priority: s.kind === "main" ? 0.9 : 0.7,
      })),
    {
      url: url("/before-and-after"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    { url: url("/areas"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/news"), changeFrequency: "weekly", priority: 0.6 },
    ...posts.map((p) => ({
      url: url(`/news/${p.slug}`),
      lastModified: p.date_published,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.8 },
    { url: url("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: url("/cookies"), changeFrequency: "yearly", priority: 0.2 },
  ];
}
