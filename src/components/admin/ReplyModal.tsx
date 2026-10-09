"use client";

import { useEffect, useState } from "react";
import { X, Send, Loader2, CheckCircle2, History } from "lucide-react";
import { REPLY_TEMPLATES, fillTemplate } from "@/lib/client-replies";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

interface SentEmail {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  sent_by: string | null;
  created_at: string;
}

interface Props {
  kind: "lead" | "message";
  refId: string;
  to: string;
  name?: string;
  numer?: string;
  defaultSubject?: string;
  onClose: () => void;
  onSent?: () => void;
}

const inputClass =
  "w-full bg-[#000000] border border-[#5c4716] focus:border-[#f5b52c] rounded-lg px-3 py-2.5 text-sm text-white outline-none";

// E-mail reply to a customer from the CRM or the contact messages, with
// ready-made templates and the list of earlier replies.
export default function ReplyModal({ kind, refId, to, name, numer, defaultSubject, onClose, onSent }: Props) {
  const site = useSiteSettings();
  const values = { imie: name?.split(" ")[0], numer, telefon: site.phone };
  const first = REPLY_TEMPLATES[0];

  const [templateId, setTemplateId] = useState(first.id);
  const [subject, setSubject] = useState(defaultSubject ?? fillTemplate(first.subject, values));
  const [body, setBody] = useState(fillTemplate(first.body, values));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [history, setHistory] = useState<SentEmail[]>([]);

  useEffect(() => {
    fetch(`/api/client-emails?ref=${refId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [refId, sent]);

  const pickTemplate = (id: string) => {
    const template = REPLY_TEMPLATES.find((t) => t.id === id);
    if (!template) return;
    setTemplateId(id);
    setSubject(defaultSubject && id === first.id ? defaultSubject : fillTemplate(template.subject, values));
    setBody(fillTemplate(template.body, values));
    setSent(false);
  };

  const send = async () => {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/client-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, refId, to, subject, body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Nie udało się wysłać");
        return;
      }
      setSent(true);
      onSent?.();
    } catch {
      setError("Brak połączenia z serwerem");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70">
      <div className="bg-[#0a0a0a] border border-[#5c4716] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#5c4716]">
          <div>
            <h2 className="text-lg font-montserrat font-bold">Odpowiedz klientowi</h2>
            <p className="text-xs text-[#e8dfcc]">
              Do: {name ? `${name} <${to}>` : to}
            </p>
          </div>
          <button onClick={onClose} className="text-[#e8dfcc] hover:text-white" aria-label="Zamknij">
            <X size={22} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          <div className="flex flex-wrap gap-2">
            {REPLY_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => pickTemplate(t.id)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  templateId === t.id
                    ? "bg-[#f5b52c] border-[#f5b52c] text-black font-semibold"
                    : "border-[#5c4716] text-[#e8dfcc] hover:border-[#f5b52c]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="block text-xs text-[#e8dfcc] mb-1">Temat</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="block text-xs text-[#e8dfcc] mb-1">
              Treść (podpis firmy z adresem i telefonem doda się sam)
            </span>
            <textarea rows={10} value={body} onChange={(e) => setBody(e.target.value)} className={inputClass} />
          </label>

          {body.includes("…") && (
            <p className="text-xs text-[#f5b52c]">Uzupełnij miejsca oznaczone „…” przed wysłaniem.</p>
          )}

          {history.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-[#e8dfcc] flex items-center gap-1.5 mb-2">
                <History size={13} /> Wcześniej wysłane ({history.length})
              </h3>
              <ul className="space-y-1.5">
                {history.map((h) => (
                  <li key={h.id} className="text-xs text-[#e8dfcc] bg-black rounded-lg px-3 py-2">
                    <span className="text-white">{h.subject}</span> ·{" "}
                    {new Date(h.created_at).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}
                    {h.sent_by ? ` · ${h.sent_by}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-[#5c4716] flex flex-wrap items-center gap-3">
          {error && <span className="w-full text-sm text-red-400">{error}</span>}
          {sent && (
            <span className="text-sm text-green-400 flex items-center gap-1.5 mr-auto">
              <CheckCircle2 size={16} /> Wysłano do {to}
            </span>
          )}
          <button onClick={onClose} className="ml-auto px-5 py-2.5 rounded-lg border border-[#5c4716] text-[#e8dfcc] hover:text-white">
            {sent ? "Zamknij" : "Anuluj"}
          </button>
          {!sent && (
            <button
              onClick={send}
              disabled={sending || !subject.trim() || !body.trim()}
              className="btn-primary px-6 py-2.5 rounded-lg font-semibold text-black flex items-center gap-2 disabled:opacity-60"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Wyślij
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
