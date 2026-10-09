import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { BACKUP_TABLES } from "@/lib/backup-tables";

// Admin only (proxy.ts): data export. ?table=<name> gives one table as CSV
// (opens in Excel), ?all=1 gives everything as one JSON file for safekeeping.

const csvCell = (value: unknown) => {
  if (value === null || value === undefined) return "";
  const s = typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

async function readAll(table: string) {
  const supabase = createAdminClient();
  const rows: Record<string, unknown>[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select("*").range(from, from + 999);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) return rows;
  }
}

export async function GET(request: NextRequest) {
  const date = new Date().toISOString().slice(0, 10);
  try {
    if (request.nextUrl.searchParams.get("all") === "1") {
      const entries = await Promise.all(Object.keys(BACKUP_TABLES).map(async (t) => [t, await readAll(t)] as const));
      return new NextResponse(JSON.stringify({ exported_at: new Date().toISOString(), tables: Object.fromEntries(entries) }, null, 1), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="grempool-kopia-${date}.json"`,
        },
      });
    }

    const table = request.nextUrl.searchParams.get("table") ?? "";
    if (!(table in BACKUP_TABLES)) return NextResponse.json({ error: "Nieznana tabela" }, { status: 400 });
    const rows = await readAll(table);
    const columns = [...new Set(rows.flatMap((r) => Object.keys(r)))];
    const csv = "\uFEFF" + [columns.join(";"), ...rows.map((r) => columns.map((c) => csvCell(r[c])).join(";"))].join("\r\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="grempool-${table}-${date}.csv"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Eksport się nie udał" }, { status: 500 });
  }
}
