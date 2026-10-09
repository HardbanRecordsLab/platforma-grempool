import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase-admin";

// Web push to every device where an admin turned notifications on
// (Ustawienia → Powiadomienia). Dead subscriptions are removed.

export interface PushMessage {
  title: string;
  body: string;
  url?: string;
}

let configured = false;
function configure(): boolean {
  if (configured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:powiadomienia@grempool.pl", publicKey, privateKey);
  configured = true;
  return true;
}

export async function sendPushToAdmins(message: PushMessage): Promise<{ sent: number; failed: number }> {
  if (!configure()) return { sent: 0, failed: 0 };
  const supabase = createAdminClient();
  const { data: subs } = await supabase.from("push_subscriptions").select("id, endpoint, p256dh, auth");
  if (!subs || subs.length === 0) return { sent: 0, failed: 0 };

  const payload = JSON.stringify({ url: "/admin/dashboard", ...message });
  const results = await Promise.allSettled(
    subs.map((s) =>
      webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 60 * 60 * 24 })
    )
  );

  const gone: string[] = [];
  results.forEach((r, i) => {
    const status = r.status === "rejected" ? (r.reason as { statusCode?: number })?.statusCode : undefined;
    if (status === 404 || status === 410) gone.push(subs[i].id);
  });
  if (gone.length > 0) await supabase.from("push_subscriptions").delete().in("id", gone);

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return { sent, failed: results.length - sent };
}
