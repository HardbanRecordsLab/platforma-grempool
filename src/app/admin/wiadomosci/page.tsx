"use client";

import { useEffect, useState } from "react";
import { Mail, MailOpen, Trash2, Loader2, Phone, Reply } from "lucide-react";
import ReplyModal from "@/components/admin/ReplyModal";
import type { ContactMessage } from "@/types";
import {
  deleteContactMessage,
  getContactMessages,
  updateContactMessageStatus,
} from "@/lib/contact-messages-store";

export default function WiadomosciPage() {
  const [replyTo, setReplyTo] = useState<ContactMessage | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setMessages(await getContactMessages());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wczytać wiadomości");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const markRead = async (msg: ContactMessage) => {
    if (msg.status === "przeczytana") return;
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, status: "przeczytana" } : m)));
    await updateContactMessageStatus(msg.id, "przeczytana");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usunąć tę wiadomość?")) return;
    await deleteContactMessage(id);
    refresh();
  };

  const newCount = messages.filter((m) => m.status === "nowa").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-montserrat font-bold">Wiadomości z formularza kontaktowego</h1>
          <p className="text-sm text-[#e8dfcc] mt-1">
            {newCount > 0 ? `${newCount} nowa(ych) wiadomość(ci)` : "Brak nowych wiadomości"}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-[#0a0a0a] p-12 rounded-xl border border-[#5c4716] text-center text-[#e8dfcc] flex items-center justify-center gap-3">
          <Loader2 className="animate-spin" size={18} /> Wczytywanie...
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-[#0a0a0a] p-12 rounded-xl border border-[#5c4716] text-center text-[#e8dfcc]">
          Brak wiadomości.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => markRead(msg)}
              className={`bg-[#0a0a0a] p-6 rounded-xl border cursor-pointer transition-colors ${
                msg.status === "nowa" ? "border-[#f5b52c]/50" : "border-[#5c4716]"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  {msg.status === "nowa" ? (
                    <Mail className="text-[#f5b52c] size-5 shrink-0" />
                  ) : (
                    <MailOpen className="text-[#e8dfcc] size-5 shrink-0" />
                  )}
                  <div>
                    <h3 className="font-semibold">
                      {msg.imie} {msg.nazwisko}
                    </h3>
                    <p className="text-xs text-[#e8dfcc]">
                      {msg.email}
                      {msg.telefon && (
                        <span className="inline-flex items-center gap-1 ml-3">
                          <Phone size={12} /> {msg.telefon}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-[#e8dfcc]">
                    {new Date(msg.created_at).toLocaleString("pl-PL")}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setReplyTo(msg);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[#5c4716] text-xs font-semibold text-white hover:border-[#f5b52c] flex items-center gap-1.5"
                    title="Odpowiedz e-mailem"
                  >
                    <Reply size={14} /> Odpowiedz
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(msg.id);
                    }}
                    className="p-2 rounded-lg hover:bg-[#5c4716] transition-colors"
                    title="Usuń"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
              <div className="text-sm font-semibold text-[#f5b52c] mb-1">{msg.temat}</div>
              <p className="text-sm text-[#e8dfcc] whitespace-pre-wrap">{msg.wiadomosc}</p>
              <p className="text-xs text-[#e8dfcc]/60 mt-3">
                Polityka prywatności:{" "}
                {msg.zgoda_rodo_at
                  ? `potwierdzona ${new Date(msg.zgoda_rodo_at).toLocaleDateString("pl-PL")}`
                  : "brak zapisu (wiadomość sprzed wprowadzenia polityki)"}
              </p>
            </div>
          ))}
        </div>
      )}

      {replyTo && (
        <ReplyModal
          kind="message"
          refId={replyTo.id}
          to={replyTo.email}
          name={`${replyTo.imie} ${replyTo.nazwisko}`}
          defaultSubject={`Re: ${replyTo.temat}`}
          onClose={() => setReplyTo(null)}
          onSent={refresh}
        />
      )}
    </div>
  );
}
