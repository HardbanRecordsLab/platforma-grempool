import type { Material } from "@/types";
import { MATERIAL_CONDITIONS } from "@/lib/materials-store";

// Formatting shared by listing cards (client) and the listing page (server).

export const conditionLabel = (value: Material["stan"]) =>
  MATERIAL_CONDITIONS.find((c) => c.value === value)?.label ?? value;

export const formatPrice = (price: number) =>
  price.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const listingHref = (item: Pick<Material, "id_materialu">) => `/ogloszenia/${item.id_materialu}`;

export const inquiryHref = (item: Pick<Material, "id_materialu" | "nazwa">) =>
  `/wycena?material=${encodeURIComponent(item.id_materialu)}&nazwa=${encodeURIComponent(item.nazwa)}`;

export function addedAgo(date?: string) {
  if (!date) return null;
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  if (Number.isNaN(days) || days < 0) return null;
  if (days === 0) return "dziś";
  if (days === 1) return "wczoraj";
  return `${days} dni temu`;
}
