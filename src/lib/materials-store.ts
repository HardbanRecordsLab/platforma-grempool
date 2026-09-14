import type { Material, MaterialStatus } from "@/types";

const STORAGE_KEY = "grempool_materials_v1";
const UPDATE_EVENT = "grempool:materials-updated";

export const MATERIAL_CATEGORIES: { value: Material["kategoria"]; label: string }[] = [
  { value: "stal", label: "Stal użytkowa" },
  { value: "cegla", label: "Cegła" },
  { value: "okna", label: "Okna" },
  { value: "drzwi", label: "Drzwi" },
  { value: "inne", label: "Inne materiały" },
];

export const MATERIAL_CONDITIONS: { value: Material["stan"]; label: string }[] = [
  { value: "nowy", label: "Nowy" },
  { value: "dobry", label: "Dobry" },
  { value: "uzywany", label: "Używany" },
  { value: "uszkodzony", label: "Uszkodzony" },
];

export const MATERIAL_STATUSES: { value: MaterialStatus; label: string }[] = [
  { value: "dostepny", label: "Dostępny" },
  { value: "zarezerwowany", label: "Zarezerwowany" },
  { value: "sprzedany", label: "Sprzedany" },
  { value: "ukryty", label: "Ukryty" },
  { value: "do_weryfikacji", label: "Do weryfikacji" },
];

function seedMaterials(): Material[] {
  const now = new Date().toISOString();
  const seed: Array<Omit<Material, "id" | "utworzone" | "zaktualizowane">> = [
    {
      id_materialu: "MAT-000184",
      kategoria: "stal",
      nazwa: "Profil stalowy 100x100",
      wymiary: "100 × 100 mm",
      dlugosc: 4.2,
      ilosc: 6,
      stan: "uzywany",
      zdjecia: [],
      lokalizacja: "Plac A / sektor 3",
      status: "dostepny",
      notatki: "",
    },
    {
      id_materialu: "MAT-000185",
      kategoria: "cegla",
      nazwa: "Cegła rozbiórkowa",
      wymiary: "Standard 25 × 12 × 6,5 cm",
      ilosc: 1500,
      stan: "uzywany",
      zdjecia: [],
      lokalizacja: "Plac B / sektor 1",
      cena: 0.8,
      status: "dostepny",
      notatki: "Cena za sztukę",
    },
    {
      id_materialu: "MAT-000186",
      kategoria: "okna",
      nazwa: "Okno PCV 120x150",
      wymiary: "120 × 150 cm",
      ilosc: 8,
      stan: "dobry",
      zdjecia: [],
      lokalizacja: "Magazyn",
      cena: 250,
      status: "dostepny",
      notatki: "",
    },
    {
      id_materialu: "MAT-000187",
      kategoria: "drzwi",
      nazwa: "Drzwi stalowe wejściowe",
      wymiary: "100 × 210 cm",
      ilosc: 3,
      stan: "dobry",
      zdjecia: [],
      lokalizacja: "Magazyn",
      cena: 450,
      status: "dostepny",
      notatki: "",
    },
    {
      id_materialu: "MAT-000188",
      kategoria: "inne",
      nazwa: "Kostka brukowa",
      wymiary: "20 × 10 cm",
      ilosc: 500,
      stan: "uzywany",
      zdjecia: [],
      lokalizacja: "Plac A / sektor 1",
      cena: 12,
      status: "dostepny",
      notatki: "Cena za m²",
    },
  ];

  return seed.map((item, index) => ({
    ...item,
    id: `local-${index + 1}`,
    utworzone: now,
    zaktualizowane: now,
  }));
}

function readAll(): Material[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedMaterials();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as Material[];
  } catch {
    return [];
  }
}

function writeAll(materials: Material[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
}

export function onMaterialsUpdated(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(UPDATE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(UPDATE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function getMaterials(): Material[] {
  return readAll().sort((a, b) => b.utworzone.localeCompare(a.utworzone));
}

export function getAvailableMaterials(): Material[] {
  return getMaterials().filter((m) => m.status === "dostepny");
}

export function getMaterial(id: string): Material | undefined {
  return readAll().find((m) => m.id === id);
}

function nextMaterialCode(materials: Material[]): string {
  const max = materials.reduce((acc, m) => {
    const match = m.id_materialu.match(/(\d+)$/);
    const num = match ? parseInt(match[1], 10) : 0;
    return Math.max(acc, num);
  }, 100);
  return `MAT-${String(max + 1).padStart(6, "0")}`;
}

export type MaterialInput = Omit<Material, "id" | "id_materialu" | "utworzone" | "zaktualizowane">;

export function createMaterial(data: MaterialInput): Material {
  const all = readAll();
  const now = new Date().toISOString();
  const material: Material = {
    ...data,
    id: `local-${Date.now()}`,
    id_materialu: nextMaterialCode(all),
    utworzone: now,
    zaktualizowane: now,
  };
  writeAll([material, ...all]);
  return material;
}

export function updateMaterial(id: string, data: Partial<MaterialInput>): Material | undefined {
  const all = readAll();
  let updated: Material | undefined;
  const next = all.map((m) => {
    if (m.id !== id) return m;
    updated = { ...m, ...data, zaktualizowane: new Date().toISOString() };
    return updated;
  });
  if (updated) writeAll(next);
  return updated;
}

export function deleteMaterial(id: string): void {
  const all = readAll();
  writeAll(all.filter((m) => m.id !== id));
}
