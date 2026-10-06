import type { LucideIcon } from "lucide-react";
import { AppWindow, BrickWall, Boxes, Columns3, DoorOpen, Hammer, Mountain, Tractor, TreePine, Truck } from "lucide-react";
import type { Material } from "@/types";

export interface ListingCategory {
  value: Material["kategoria"];
  label: string;
  icon: LucideIcon;
}

// Board sections. A new section also needs the matching value in the
// material_category enum in the database.
export const LISTING_CATEGORIES: ListingCategory[] = [
  { value: "stal", label: "Stal użytkowa", icon: Columns3 },
  { value: "cegla", label: "Cegła", icon: BrickWall },
  { value: "okna", label: "Okna", icon: AppWindow },
  { value: "drzwi", label: "Drzwi", icon: DoorOpen },
  { value: "kruszywa", label: "Kruszywa i gruz", icon: Mountain },
  { value: "drewno", label: "Drewno", icon: TreePine },
  { value: "maszyny", label: "Maszyny budowlane", icon: Tractor },
  { value: "pojazdy", label: "Pojazdy", icon: Truck },
  { value: "narzedzia", label: "Narzędzia i sprzęt", icon: Hammer },
  { value: "inne", label: "Inne", icon: Boxes },
];

export const categoryOf = (value: Material["kategoria"]) =>
  LISTING_CATEGORIES.find((c) => c.value === value);
