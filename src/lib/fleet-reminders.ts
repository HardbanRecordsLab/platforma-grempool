import { createAdminClient } from "@/lib/supabase-admin";
import { escapeHtml, sendEmail } from "@/lib/notifications";
import { sendPushToAdmins } from "@/lib/push";

// Daily reminders about vehicle inspection, insurance (OC) and service
// dates from the Flota tab. Sent 14, 7, 3 and 1 day before, on the day,
// and once a week while overdue, so the owner is not spammed every day.

export interface FleetDue {
  vehicle: string;
  kind: "Przegląd" | "OC" | "Serwis";
  date: string;
  daysLeft: number;
}

const KINDS = [
  { column: "przeglad", kind: "Przegląd" },
  { column: "oc", kind: "OC" },
  { column: "serwis", kind: "Serwis" },
] as const;

const REMIND_ON = new Set([14, 7, 3, 1, 0]);

// Days between today in Poland and a YYYY-MM-DD date.
function daysUntil(date: string, today: string) {
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
}

export const shouldRemind = (daysLeft: number) => REMIND_ON.has(daysLeft) || (daysLeft < 0 && -daysLeft % 7 === 0);

export async function fleetDueItems(): Promise<FleetDue[]> {
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Warsaw" });
  const { data } = await createAdminClient().from("vehicles").select("nazwa, rejestracja, przeglad, oc, serwis");
  const items: FleetDue[] = [];
  for (const v of data ?? []) {
    for (const { column, kind } of KINDS) {
      const date = v[column] as string | null;
      if (!date) continue;
      const daysLeft = daysUntil(date, today);
      if (daysLeft <= 14) items.push({ vehicle: `${v.nazwa} (${v.rejestracja})`, kind, date, daysLeft });
    }
  }
  return items.sort((a, b) => a.daysLeft - b.daysLeft);
}

const when = (d: number) =>
  d < 0 ? `po terminie ${-d} dni` : d === 0 ? "DZIŚ" : d === 1 ? "jutro" : `za ${d} dni`;

export async function sendFleetReminders(): Promise<{ reminded: number }> {
  const due = (await fleetDueItems()).filter((item) => shouldRemind(item.daysLeft));
  if (due.length === 0) return { reminded: 0 };

  const rows = due
    .map(
      (i) =>
        `<li style="margin-bottom:6px;"><strong>${escapeHtml(i.kind)}</strong> — ${escapeHtml(i.vehicle)}: ${escapeHtml(
          new Date(i.date).toLocaleDateString("pl-PL")
        )} (<span style="color:${i.daysLeft <= 0 ? "#c00" : "#000"};">${when(i.daysLeft)}</span>)</li>`
    )
    .join("");
  const html = `<div style="font-family:sans-serif;max-width:520px;">
    <h2 style="color:#000;">Terminy floty</h2>
    <ul style="padding-left:18px;">${rows}</ul>
    <p style="color:#555;font-size:13px;">Daty zmienisz w panelu: Flota → Edytuj pojazd.</p>
  </div>`;

  const first = due[0];
  await Promise.allSettled([
    sendEmail(`Flota: ${first.kind} ${first.vehicle} ${when(first.daysLeft)}${due.length > 1 ? ` (+${due.length - 1})` : ""}`, html),
    sendPushToAdmins({
      title: `Flota: ${first.kind} — ${when(first.daysLeft)}`,
      body: due.map((i) => `${i.kind} ${i.vehicle}: ${when(i.daysLeft)}`).join(" · ").slice(0, 180),
      url: "/admin/flota",
    }),
  ]);
  return { reminded: due.length };
}
