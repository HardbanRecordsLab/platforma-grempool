"use client";

import { useEffect, useState } from "react";
import { Mail, MailOpen, Trash2, Loader2, Phone } from "lucide-react";
import type { ContactMessage } from "@/types";
import {
  deleteContactMessage,
  getContactMessages,
  updateContactMessageStatus,
} from "@/lib/contact-messages-store";

export default function WiadomosciPage() {
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
          <p className="text-sm text-[#b8c5d6] mt-1">
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
        <div className="bg-[#1a2332] p-12 rounded-xl border border-[#2a3a4a] text-center text-[#b8c5d6] flex items-center justify-center gap-3">
          <Loader2 className="animate-spin" size={18} /> Wczytywanie...
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-[#1a2332] p-12 rounded-xl border border-[#2a3a4a] text-center text-[#b8c5d6]">
          Brak wiadomości.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => markRead(msg)}
              className={`bg-[#1a2332] p-6 rounded-xl border cursor-pointer transition-colors ${
                msg.status === "nowa" ? "border-[#f0a500]/50" : "border-[#2a3a4a]"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  {msg.status === "nowa" ? (
                    <Mail className="text-[#f0a500] size-5 shrink-0" />
                  ) : (
                    <MailOpen className="text-[#b8c5d6] size-5 shrink-0" />
                  )}
                  <div>
                    <h3 className="font-semibold">
                      {msg.imie} {msg.nazwisko}
                    </h3>
                    <p className="text-xs text-[#b8c5d6]">
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
                  <span className="text-xs text-[#b8c5d6]">
                    {new Date(msg.created_at).toLocaleString("pl-PL")}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(msg.id);
                    }}
                    className="p-2 rounded-lg hover:bg-[#2a3a4a] transition-colors"
                    title="Usuń"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
              <div className="text-sm font-semibold text-[#f0a500] mb-1">{msg.temat}</div>
              <p className="text-sm text-[#b8c5d6] whitespace-pre-wrap">{msg.wiadomosc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
