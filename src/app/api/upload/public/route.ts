import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";

// Public: photos attached to the quote form. Only images, compressed in the
// browser first, at most 5 MB each, and a per-address limit per hour so the
// endpoint cannot be used as free file hosting.

const MAX_BYTES = 5 * 1024 * 1024;
const LIMIT_PER_HOUR = 30;
const recent = new Map<string, number[]>();

function allowed(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  if (hits.length >= LIMIT_PER_HOUR) return false;
  hits.push(now);
  recent.set(ip, hits);
  return true;
}

export async function POST(request: NextRequest) {
  const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (!allowed(ip)) {
    return NextResponse.json({ error: "Za dużo zdjęć w krótkim czasie — spróbuj za godzinę" }, { status: 429 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!/^image\/(jpeg|png|webp)$/.test(contentType)) {
    return NextResponse.json({ error: "Dozwolone są tylko zdjęcia" }, { status: 400 });
  }
  const bytes = Buffer.from(await request.arrayBuffer());
  if (bytes.length === 0 || bytes.length > MAX_BYTES) {
    return NextResponse.json({ error: "Zdjęcie jest puste albo za duże (maks. 5 MB)" }, { status: 400 });
  }

  const ext = contentType.split("/")[1] === "jpeg" ? "jpg" : contentType.split("/")[1];
  try {
    const url = await uploadToR2(`leads/${randomUUID()}.${ext}`, bytes, contentType);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "Nie udało się zapisać zdjęcia" }, { status: 500 });
  }
}
