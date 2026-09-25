import { NextResponse } from "next/server";
import { getRelevantTenders } from "@/lib/tenders";

export async function GET() {
  try {
    const tenders = await getRelevantTenders();
    return NextResponse.json(tenders);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Nie udało się pobrać przetargów" },
      { status: 500 }
    );
  }
}
