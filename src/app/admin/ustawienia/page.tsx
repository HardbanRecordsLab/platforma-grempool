"use client";

import { useEffect, useState } from "react";
import { Building, Bell, Shield, CheckCircle2, XCircle, Loader2, Send, LogOut } from "lucide-react";
import { BUSINESS } from "@/lib/site";

interface SystemStatus {
  notificationEmail: string | null;
  emailConfigured: boolean;
  photosConfigured: boolean;
  photosUrl: string | null;
  database: string | null;
}

const DAY_LABELS: Record<string, string> = {
  Monday: "Pon",
  Tuesday: "Wt",
  Wednesday: "Śr",
  Thursday: "Czw",
  Friday: "Pt",
  Saturday: "Sob",
  Sunday: "Ndz",
};

const formatDays = (days: string[]) =>
  days.length > 1 ? `${DAY_LABELS[days[0]]}–${DAY_LABELS[days[days.length - 1]]}` : DAY_LABELS[days[0]];

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 border-b border-[#5c4716] last:border-0">
      <span className="sm:w-44 shrink-0 text-sm text-[#e8dfcc]">{label}</span>
      <span className="text-white break-words">{value}</span>
    </div>
  );
}

function StatusBadge({ ok, okText, badText }: { ok: boolean; okText: string; badText: string }) {
  return ok ? (
    <span className="inline-flex items-center gap-1.5 text-green-400 text-sm">
      <CheckCircle2 size={16} /> {okText}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-red-400 text-sm">
      <XCircle size={16} /> {badText}
    </span>
  );
}

export default function UstawieniaPage() {
  const [activeTab, setActiveTab] = useState("firma");
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [user, setUser] = useState<{ login: string; label: string } | null>(null);
  const [testState, setTestState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [testError, setTestError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then(setStatus)
      .catch(() => setStatus(null));
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const sendTest = async () => {
    setTestState("sending");
    try {
      const res = await fetch("/api/settings/test-email", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setTestState("sent");
      } else {
        setTestError(body.error ?? "Nie udało się wysłać");
        setTestState("error");
      }
    } catch {
      setTestError("Brak połączenia z serwerem");
      setTestState("error");
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.replace("/admin/login");
  };

  const tabs = [
    { id: "firma", label: "Firma", icon: Building },
    { id: "powiadomienia", label: "Powiadomienia i system", icon: Bell },
    { id: "bezpieczenstwo", label: "Konto i dostęp", icon: Shield },
  ];

  return (
    <div>
      <h1 className="text-2xl font-montserrat font-bold mb-6">Ustawienia</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-[#0a0a0a] p-4 rounded-xl border border-[#5c4716] h-fit">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id ? "bg-[#f5b52c]/10 text-[#f5b52c]" : "text-[#e8dfcc] hover:bg-[#5c4716]"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3">
          {activeTab === "firma" && (
            <div className="bg-[#0a0a0a] p-6 rounded-xl border border-[#5c4716]">
              <h2 className="text-xl font-montserrat font-bold mb-2">Dane firmy</h2>
              <p className="text-sm text-[#e8dfcc] mb-6">
                Te dane widać na stronie (stopka, kontakt, „O nas”) i w wynikach Google. Zmianę zgłoś osobie, która
                prowadzi stronę — są wpisane w kodzie, żeby nikt ich przypadkiem nie nadpisał.
              </p>
              <Row label="Nazwa" value={BUSINESS.legalName} />
              <Row label="NIP" value={BUSINESS.taxId} />
              <Row label="REGON" value={BUSINESS.regon} />
              <Row
                label="Adres"
                value={`${BUSINESS.streetAddress}, ${BUSINESS.postalCode} ${BUSINESS.addressLocality}`}
              />
              <Row label="Telefon" value={BUSINESS.phoneDisplay} />
              <Row label="E-mail na stronie" value={BUSINESS.email} />
              <Row
                label="Godziny otwarcia"
                value={BUSINESS.openingHours.map((h) => `${formatDays(h.days)} ${h.opens}–${h.closes}`).join(", ")}
              />
              <Row label="Obszar działania" value={BUSINESS.areaServed.join(", ")} />
            </div>
          )}

          {activeTab === "powiadomienia" && (
            <div className="bg-[#0a0a0a] p-6 rounded-xl border border-[#5c4716]">
              <h2 className="text-xl font-montserrat font-bold mb-2">Powiadomienia i system</h2>
              <p className="text-sm text-[#e8dfcc] mb-6">
                Każde nowe zapytanie o wycenę i każda wiadomość z formularza kontaktowego trafia na poniższy adres
                e-mail.
              </p>
              {!status ? (
                <div className="flex items-center gap-2 text-[#e8dfcc] text-sm">
                  <Loader2 size={16} className="animate-spin" /> Sprawdzanie...
                </div>
              ) : (
                <>
                  <Row label="Powiadomienia na adres" value={status.notificationEmail ?? "— nie ustawiono —"} />
                  <Row
                    label="Wysyłka e-maili"
                    value={<StatusBadge ok={status.emailConfigured} okText="Działa" badText="Nie skonfigurowana" />}
                  />
                  <Row
                    label="Zdjęcia (Cloudflare R2)"
                    value={
                      <StatusBadge
                        ok={status.photosConfigured}
                        okText={status.photosUrl ? `Działa — ${status.photosUrl}` : "Działa"}
                        badText="Nie skonfigurowane"
                      />
                    }
                  />
                  <Row label="Baza danych (Supabase)" value={status.database ?? "—"} />

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      onClick={sendTest}
                      disabled={testState === "sending" || !status.emailConfigured}
                      className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold text-[#000000] flex items-center gap-2 disabled:opacity-60"
                    >
                      {testState === "sending" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      Wyślij testowe powiadomienie
                    </button>
                    {testState === "sent" && (
                      <span className="text-sm text-green-400">Wysłano — sprawdź skrzynkę (także folder spam).</span>
                    )}
                    {testState === "error" && <span className="text-sm text-red-400">{testError}</span>}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "bezpieczenstwo" && (
            <div className="bg-[#0a0a0a] p-6 rounded-xl border border-[#5c4716]">
              <h2 className="text-xl font-montserrat font-bold mb-2">Konto i dostęp</h2>
              <p className="text-sm text-[#e8dfcc] mb-6">
                Panel ma dwa konta z pełnym dostępem: <span className="text-white">owner</span> i{" "}
                <span className="text-white">admin</span>. Logowanie jest ważne 30 dni na danym urządzeniu. Zmiana
                hasła wylogowuje to konto ze wszystkich urządzeń — hasła zmienia osoba prowadząca stronę.
              </p>
              <Row label="Zalogowany jako" value={user ? `${user.login} (${user.label})` : "…"} />
              <button
                onClick={logout}
                className="mt-6 px-5 py-2.5 rounded-lg text-sm font-semibold border border-red-500/40 text-red-400 hover:bg-red-500/10 flex items-center gap-2"
              >
                <LogOut size={16} /> Wyloguj z tego urządzenia
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
