import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { fromScrapPurchaseRow } from "@/lib/scrap-purchases";
import { getSiteSettings } from "@/lib/site-settings-server";
import { sendEmail } from "@/lib/notifications";
import { receiptEmailHtml } from "@/lib/scrap-receipt-email";

// Admin only: e-mails the receipt to the address given on it.
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("scrap_purchases").select("*").eq("id", id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Nie ma takiego kwitu" }, { status: 404 });

  const purchase = fromScrapPurchaseRow(data);
  if (!purchase.sprzedawca_email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(purchase.sprzedawca_email)) {
    return NextResponse.json({ error: "Na kwicie nie ma poprawnego adresu e-mail klienta" }, { status: 400 });
  }

  const site = await getSiteSettings();
  const result = await sendEmail(`Kwit skupu ${purchase.numer} — GREMPOOL`, receiptEmailHtml(purchase, site), {
    to: purchase.sprzedawca_email,
    replyTo: site.email,
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
