import { NextRequest, NextResponse, after } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendContactMessageNotification } from "@/lib/notifications";
import { sendPushToAdmins } from "@/lib/push";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json().catch(() => ({}));

  // Only the contact form's own fields; status is always "nowa".
  const message: Record<string, unknown> = { status: "nowa" };
  for (const field of ["imie", "nazwisko", "email", "telefon", "temat", "wiadomosc"]) {
    if (body[field] !== undefined) message[field] = body[field];
  }

  const { data, error } = await supabase.from("contact_messages").insert(message).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  after(async () => {
    await Promise.allSettled([
      sendContactMessageNotification(data),
      sendPushToAdmins({
        title: `Nowa wiadomość: ${data.temat}`,
        body: `${data.imie} ${data.nazwisko} · ${data.wiadomosc}`.slice(0, 160),
        url: "/admin/wiadomosci",
      }),
    ]);
  });

  return NextResponse.json(data);
}
