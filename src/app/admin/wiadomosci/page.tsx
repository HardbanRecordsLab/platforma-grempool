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
          <p className="text-sm text-[#c3b9a7] mt-1">
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
        <div className="bg-[#141210] p-12 rounded-xl border border-[#352c1d] text-center text-[#c3b9a7] flex items-center justify-center gap-3">
          <Loader2 className="animate-spin" size={18} /> Wczytywanie...
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-[#141210] p-12 rounded-xl border border-[#352c1d] text-center text-[#c3b9a7]">
          Brak wiadomości.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => markRead(msg)}
              className={`bg-[#141210] p-6 rounded-xl border cursor-pointer transition-colors ${
                msg.status === "nowa" ? "border-[#d4a24a]/50" : "border-[#352c1d]"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  {msg.status === "nowa" ? (
                    <Mail className="text-[#d4a24a] size-5 shrink-0" />
                  ) : (
                    <MailOpen className="text-[#c3b9a7] size-5 shrink-0" />
                  )}
                  <div>
                    <h3 className="font-semibold">
                      {msg.imie} {msg.nazwisko}
                    </h3>
                    <p className="text-xs text-[#c3b9a7]">
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
                  <span className="text-xs text-[#c3b9a7]">
                    {new Date(msg.created_at).toLocaleString("pl-PL")}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(msg.id);
                    }}
                    className="p-2 rounded-lg hover:bg-[#352c1d] transition-colors"
                    title="Usuń"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
              <div className="text-sm font-semibold text-[#d4a24a] mb-1">{msg.temat}</div>
              <p className="text-sm text-[#c3b9a7] whitespace-pre-wrap">{msg.wiadomosc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
