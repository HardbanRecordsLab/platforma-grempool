import type { LucideIcon } from "lucide-react";
import { AppWindow, BrickWall, Boxes, Columns3, DoorOpen } from "lucide-react";
import type { Material } from "@/types";

export interface ListingCategory {
  value: Material["kategoria"];
  label: string;
  icon: LucideIcon;
}

// Add new board sections (e.g. machines, vehicles) here once the
// material_category enum in the database has the matching value.
export const LISTING_CATEGORIES: ListingCategory[] = [
  { value: "stal", label: "Stal użytkowa", icon: Columns3 },
  { value: "cegla", label: "Cegła", icon: BrickWall },
  { value: "okna", label: "Okna", icon: AppWindow },
  { value: "drzwi", label: "Drzwi", icon: DoorOpen },
  { value: "inne", label: "Inne", icon: Boxes },
];

export const categoryOf = (value: Material["kategoria"]) =>
  LISTING_CATEGORIES.find((c) => c.value === value);
