import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://kleanhq.com", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: "https://kleanhq.com/privacy", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: "https://kleanhq.com/terms", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];
}
