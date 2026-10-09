import { createAdminClient } from "@/lib/supabase-admin";
import { fromRow, type MaterialRow } from "@/lib/materials-store";
import type { Material } from "@/types";

// Statuses a visitor may open by direct link. Sold listings stay reachable
// (old links and search results) but say they are sold.
const PUBLIC_STATUSES = ["dostepny", "zarezerwowany", "sprzedany"];

export async function getPublicMaterial(code: string): Promise<Material | null> {
  if (!/^MAT-\d+$/.test(code)) return null;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("materials")
    .select("*")
    .eq("id_materialu", code)
    .in("status", PUBLIC_STATUSES)
    .maybeSingle();
  return data ? fromRow(data as MaterialRow) : null;
}

export async function getSimilarMaterials(material: Material, limit = 3): Promise<Material[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("materials")
    .select("*")
    .eq("status", "dostepny")
    .eq("kategoria", material.kategoria)
    .neq("id", material.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((row) => fromRow(row as MaterialRow));
}

export async function getAvailableMaterialCodes(): Promise<{ code: string; updated: string }[]> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("materials").select("id_materialu, updated_at").eq("status", "dostepny");
  return (data ?? []).map((row) => ({ code: row.id_materialu, updated: row.updated_at }));
}
