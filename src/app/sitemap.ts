import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAvailableMaterialCodes } from "@/lib/materials-server";

const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/uslugi", priority: 0.9, changeFrequency: "weekly" },
  { path: "/uslugi/skup-zlomu", priority: 0.8, changeFrequency: "monthly" },
  { path: "/uslugi/transport", priority: 0.8, changeFrequency: "monthly" },
  { path: "/uslugi/koparki", priority: 0.8, changeFrequency: "monthly" },
  { path: "/uslugi/rozbiorki", priority: 0.8, changeFrequency: "monthly" },
  { path: "/uslugi/waga-najazdowa", priority: 0.8, changeFrequency: "monthly" },
  { path: "/ogloszenia", priority: 0.8, changeFrequency: "daily" },
  { path: "/wycena", priority: 0.9, changeFrequency: "monthly" },
  { path: "/kontakt", priority: 0.7, changeFrequency: "monthly" },
];

// Rebuilt at most once an hour, so new listings reach Google without a deploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const listings = await getAvailableMaterialCodes().catch(() => []);
  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...listings.map((listing) => ({
      url: `${SITE_URL}/ogloszenia/${listing.code}`,
      lastModified: new Date(listing.updated),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
