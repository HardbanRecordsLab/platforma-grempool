"use client";

import { useEffect, useState } from "react";
import { Loader2, KeyRound, CheckCircle2, Download, DatabaseBackup } from "lucide-react";
import { BACKUP_TABLES } from "@/lib/backup-tables";

const inputClass =
  "w-full bg-[#000000] border border-[#5c4716] focus:border-[#f5b52c] rounded-lg px-3 py-2.5 text-sm text-white outline-none";

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== repeat) {
      setError("Nowe hasła nie są takie same");
      setState("error");
      return;
    }
    setState("saving");
    const res = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current, next }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      setState("saved");
      setCurrent("");
      setNext("");
      setRepeat("");
    } else {
      setError(body.error ?? "Nie udało się zmienić hasła");
      setState("error");
    }
  };

  return (
    <form onSubmit={save} className="mt-8 p-5 rounded-xl bg-[#000000] border border-[#5c4716]">
      <h3 className="font-semibold flex items-center gap-2 mb-1">
        <KeyRound size={18} className="text-[#f5b52c]" /> Zmiana hasła
      </h3>
      <p className="text-sm text-[#e8dfcc] mb-4">
        Zmienia hasło zalogowanego konta. Inne urządzenia zalogowane na to konto zostaną wylogowane w ciągu minuty.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input type="password" autoComplete="current-password" placeholder="Obecne hasło" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputClass} />
        <input type="password" autoComplete="new-password" placeholder="Nowe hasło (min. 8 znaków)" value={next} onChange={(e) => setNext(e.target.value)} className={inputClass} />
        <input type="password" autoComplete="new-password" placeholder="Powtórz nowe hasło" value={repeat} onChange={(e) => setRepeat(e.target.value)} className={inputClass} />
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button
          type="submit"
          disabled={state === "saving" || !current || !next || !repeat}
          className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold text-black flex items-center gap-2 disabled:opacity-60"
        >
          {state === "saving" ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />} Zmień hasło
        </button>
        {state === "saved" && (
          <span className="text-sm text-green-400 flex items-center gap-1.5">
            <CheckCircle2 size={16} /> Hasło zmienione.
          </span>
        )}
        {state === "error" && <span className="text-sm text-red-400">{error}</span>}
      </div>
    </form>
  );
}

interface AuditEntry {
  id: number;
  login: string | null;
  method: string;
  path: string;
  created_at: string;
}

const RESOURCES: [RegExp, string][] = [
  [/^\/api\/materials\/import/, "Import ogłoszeń z Excela"],
  [/^\/api\/materials/, "ogłoszenie"],
  [/^\/api\/scrap-prices/, "cennik złomu"],
  [/^\/api\/scrap-purchases\/[^/]+\/email/, "Wysłano kwit mailem"],
  [/^\/api\/scrap-deliveries/, "dostawa złomu"],
  [/^\/api\/scrap-purchases/, "kwit skupu"],
  [/^\/api\/offers\/[^/]+\/email/, "Wysłano ofertę mailem"],
  [/^\/api\/offers/, "oferta"],
  [/^\/api\/client-emails/, "Wysłano e-mail do klienta"],
  [/^\/api\/clients/, "klient (kartoteka)"],
  [/^\/api\/leads/, "zapytanie (CRM)"],
  [/^\/api\/orders/, "zlecenie"],
  [/^\/api\/vehicles/, "pojazd"],
  [/^\/api\/machines/, "maszyna"],
  [/^\/api\/tasks/, "zadanie w kalendarzu"],
  [/^\/api\/services/, "usługa"],
  [/^\/api\/social-channels/, "kanał social media"],
  [/^\/api\/contact-messages/, "wiadomość"],
  [/^\/api\/site-settings/, "Zmieniono ustawienia strony"],
  [/^\/api\/upload/, "Wgrano zdjęcie"],
  [/^\/api\/settings\/test-email/, "Wysłano testowe powiadomienie"],
];

const VERBS: Record<string, string> = { POST: "Dodano", PUT: "Zmieniono", PATCH: "Zmieniono", DELETE: "Usunięto" };

function describe(entry: AuditEntry) {
  const match = RESOURCES.find(([re]) => re.test(entry.path));
  if (!match) return `${entry.method} ${entry.path}`;
  const label = match[1];
  // Labels starting with a capital letter are complete actions.
  return label[0] === label[0].toUpperCase() ? label : `${VERBS[entry.method] ?? entry.method}: ${label}`;
}

export function AuditLogPanel() {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);

  useEffect(() => {
    fetch("/api/audit?limit=300", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then(setEntries)
      .catch(() => setEntries([]));
  }, []);

  return (
    <div className="bg-[#0a0a0a] p-6 rounded-xl border border-[#5c4716]">
      <h2 className="text-xl font-montserrat font-bold mb-2">Dziennik zmian</h2>
      <p className="text-sm text-[#e8dfcc] mb-6">Kto i kiedy zmieniał coś w panelu — ostatnie 300 operacji.</p>
      {entries === null ? (
        <div className="flex items-center gap-2 text-sm text-[#e8dfcc]">
          <Loader2 size={16} className="animate-spin" /> Wczytywanie...
        </div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-[#e8dfcc]">Brak wpisów. Każda zmiana w panelu pojawi się tutaj.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[#e8dfcc] border-b border-[#5c4716]">
              <tr>
                <th className="py-2 pr-4 font-semibold">Kiedy</th>
                <th className="py-2 pr-4 font-semibold">Kto</th>
                <th className="py-2 font-semibold">Co</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#5c4716]/50">
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className="py-2 pr-4 whitespace-nowrap text-[#e8dfcc]">
                    {new Date(e.created_at).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="py-2 pr-4 text-white">{e.login ?? "—"}</td>
                  <td className="py-2">{describe(e)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function BackupPanel() {
  return (
    <div className="bg-[#0a0a0a] p-6 rounded-xl border border-[#5c4716]">
      <h2 className="text-xl font-montserrat font-bold mb-2">Kopia zapasowa</h2>
      <p className="text-sm text-[#e8dfcc] mb-6">
        Pobierz dane do Excela (pliki CSV) albo całą kopię w jednym pliku. Warto robić pełną kopię raz w miesiącu i trzymać
        ją na dysku lub w chmurze.
      </p>
      <a
        href="/api/backup?all=1"
        className="inline-flex items-center gap-2 btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold text-black mb-6"
      >
        <DatabaseBackup size={16} /> Pobierz pełną kopię (wszystko)
      </a>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {Object.entries(BACKUP_TABLES).map(([table, label]) => (
          <a
            key={table}
            href={`/api/backup?table=${table}`}
            className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-[#000000] border border-[#5c4716] hover:border-[#f5b52c] text-sm"
          >
            <span className="text-white">{label}</span>
            <Download size={15} className="text-[#e8dfcc]" />
          </a>
        ))}
      </div>
    </div>
  );
}
