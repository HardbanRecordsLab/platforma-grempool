import { NextResponse } from "next/server";
import { sendPushToAdmins } from "@/lib/push";

export async function POST() {
  const result = await sendPushToAdmins({
    title: "GREMPOOL — test powiadomień",
    body: "Działa! Tak będą wyglądać powiadomienia o nowych zapytaniach.",
    url: "/admin/ustawienia",
  });
  return NextResponse.json(result, { status: result.sent > 0 ? 200 : 500 });
}
