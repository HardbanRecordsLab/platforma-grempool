import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { uploadToR2 } from "@/lib/r2";

const ALLOWED_FOLDERS = new Set(["materials", "services"]);

export async function POST(request: NextRequest) {
  const folder = request.nextUrl.searchParams.get("folder") || "misc";
  if (!ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json({ error: "Nieprawidłowy folder" }, { status: 400 });
  }

  const contentType = request.headers.get("content-type") || "image/jpeg";
  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ error: "Dozwolone są tylko obrazy" }, { status: 400 });
  }

  const bytes = Buffer.from(await request.arrayBuffer());
  if (bytes.length === 0) {
    return NextResponse.json({ error: "Brak pliku" }, { status: 400 });
  }

  const ext = contentType.split("/")[1]?.split("+")[0] || "jpg";
  const key = `${folder}/${randomUUID()}.${ext}`;

  try {
    const url = await uploadToR2(key, bytes, contentType);
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Nie udało się wgrać zdjęcia" },
      { status: 500 }
    );
  }
}
