import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeDocument, type ClientType } from "@/lib/clients";

export interface Party {
  typ: ClientType;
  nazwa: string;
  dokument?: string | null;
  adres?: string | null;
  telefon?: string | null;
  email?: string | null;
  bdo?: string | null;
}

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (c) => `\\${c}`);

// Finds the card of the person or company in a transaction, or creates it,
// and brings its contact data up to date. A document number or NIP identifies
// the card; without one the exact name does. Never throws: a problem with the
// register must not stop a receipt from being saved.
export async function linkClient(supabase: SupabaseClient, party: Party): Promise<string | null> {
  try {
    const nazwa = party.nazwa.trim();
    if (!nazwa) return null;
    const norm = normalizeDocument(party.dokument);

    const find = async () => {
      const query = supabase.from("clients").select("id").eq("typ", party.typ);
      const { data } = norm
        ? await query.eq("dokument_norm", norm).limit(1).maybeSingle()
        : await query.is("dokument_norm", null).ilike("nazwa", escapeLike(nazwa)).limit(1).maybeSingle();
      return data?.id as string | undefined;
    };

    // Only non-empty values overwrite what the card already holds.
    const contact: Record<string, string> = {};
    for (const key of ["adres", "telefon", "email", "bdo"] as const) {
      const value = party[key]?.trim();
      if (value) contact[key] = value;
    }

    const existing = await find();
    if (existing) {
      await supabase
        .from("clients")
        .update({ nazwa, ...(party.dokument?.trim() ? { dokument: party.dokument.trim() } : {}), ...contact })
        .eq("id", existing);
      return existing;
    }

    const { data, error } = await supabase
      .from("clients")
      .insert({ typ: party.typ, nazwa, dokument: party.dokument?.trim() || null, dokument_norm: norm || null, ...contact })
      .select("id")
      .single();
    if (error) {
      // Two receipts saved at the same moment: the other one created the card first.
      return error.code === "23505" ? ((await find()) ?? null) : null;
    }
    return data.id;
  } catch {
    return null;
  }
}
