import { NextResponse } from "next/server";

// Which integrations are configured on the server. Values themselves stay
// secret; only the notification address is shown, since it is not sensitive.
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return NextResponse.json({
    notificationEmail: process.env.NOTIFICATION_EMAIL ?? null,
    emailConfigured: Boolean(process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL),
    photosConfigured: Boolean(
      process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME
    ),
    photosUrl: process.env.R2_PUBLIC_URL ?? null,
    database: supabaseUrl.replace(/^https:\/\//, "").replace(/\.supabase\.co\/?$/, "") || null,
  });
}
