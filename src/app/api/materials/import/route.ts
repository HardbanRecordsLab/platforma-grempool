import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { IMPORT_LIMIT, normalizeImportRow } from "@/lib/materials-import";

// Admin only (proxy.ts). Rows are validated again here; any invalid row
// rejects the whole import so nothing is half-imported.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const input: unknown[] = Array.isArray(body?.rows) ? body.rows : [];
  if (input.length === 0) return NextResponse.json({ error: "Brak wierszy do importu" }, { status: 400 });
  if (input.length > IMPORT_LIMIT) {
    return NextResponse.json({ error: `Za dużo wierszy (maks. ${IMPORT_LIMIT} naraz)` }, { status: 400 });
  }

  const parsed = input.map((row, i) => normalizeImportRow((row ?? {}) as Record<string, unknown>, i + 2));
  const invalid = parsed.filter((p) => p.errors.length > 0);
  if (invalid.length > 0) {
    return NextResponse.json(
      { error: `Błędy w wierszach: ${invalid.map((p) => `${p.line} (${p.errors.join(", ")})`).join("; ")}` },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("materials")
    .insert(parsed.map((p) => p.row))
    .select("id_materialu");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ imported: data.length, codes: data.map((r) => r.id_materialu) });
}
