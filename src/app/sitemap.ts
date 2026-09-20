import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/uslugi", priority: 0.9, changeFrequency: "weekly" },
  { path: "/uslugi/skup-zlomu", priority: 0.8, changeFrequency: "monthly" },
  { path: "/uslugi/transport", priority: 0.8, changeFrequency: "monthly" },
  { path: "/uslugi/koparki", priority: 0.8, changeFrequency: "monthly" },
  { path: "/uslugi/rozbiorki", priority: 0.8, changeFrequency: "monthly" },
  { path: "/uslugi/materialy", priority: 0.8, changeFrequency: "daily" },
  { path: "/uslugi/klimatyzacja", priority: 0.8, changeFrequency: "monthly" },
  { path: "/wycena", priority: 0.9, changeFrequency: "monthly" },
  { path: "/kontakt", priority: 0.7, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
