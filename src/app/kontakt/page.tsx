"use client";

import { useState } from "react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Phone, Mail, MapPin, Clock, Send, Loader2, CheckCircle2 } from "lucide-react";
import { createContactMessage } from "@/lib/contact-messages-store";

const TEMAT_LABELS: Record<string, string> = {
  skup: "Skup złomu",
  transport: "Transport",
  koparki: "Usługi koparką",
  materialy: "Materiały budowlane",
  klimatyzacja: "Klimatyzacja",
  inne: "Inne",
};

export default function KontaktPage() {
  const [form, setForm] = useState({
    imie: "",
    nazwisko: "",
    email: "",
    telefon: "",
    temat: "",
    wiadomosc: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await createContactMessage({
        imie: form.imie,
        nazwisko: form.nazwisko,
        email: form.email,
        telefon: form.telefon || undefined,
        temat: TEMAT_LABELS[form.temat] ?? form.temat,
        wiadomosc: form.wiadomosc,
      });
      setSent(true);
      setForm({ imie: "", nazwisko: "", email: "", telefon: "", temat: "", wiadomosc: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wysłać wiadomości. Spróbuj ponownie lub zadzwoń.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section className="relative py-28 overflow-hidden">
        <div
          className="absolute inset-0 hero-bg"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1722695694560-f452b0919d3a?auto=format&fit=crop&w=1600&q=80')" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(15,20,25,0.85) 0%, rgba(15,20,25,0.92) 100%)" }} />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-4">
            <span className="text-[#f0a500]">KONTAKT</span>
          </h1>
          <p className="text-[#b8c5d6] text-lg max-w-2xl mx-auto">
            Masz pytanie? Zadzwoń lub napisz do nas. Jesteśmy do Twojej dyspozycji.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-[#1a2332]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Details */}
            <div>
              <h2 className="text-3xl font-montserrat font-bold mb-8">
                DANE <span className="text-[#f0a500]">KONTAKTOWE</span>
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#f0a500]/10 flex items-center justify-center shrink-0">
                    <MapPin className="text-[#f0a500] size-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Adres</h3>
                    <p className="text-[#b8c5d6]">ul. Kolejowa 5a<br />59-307 Raszówka</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#f0a500]/10 flex items-center justify-center shrink-0">
                    <Phone className="text-[#f0a500] size-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Telefon</h3>
                    <a href="tel:+48123456789" className="text-[#b8c5d6] hover:text-[#f0a500] transition-colors">
                      +48 123 456 789
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#f0a500]/10 flex items-center justify-center shrink-0">
                    <Mail className="text-[#f0a500] size-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a href="mailto:biuro@grempool.pl" className="text-[#b8c5d6] hover:text-[#f0a500] transition-colors">
                      biuro@grempool.pl
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#f0a500]/10 flex items-center justify-center shrink-0">
                    <Clock className="text-[#f0a500] size-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Godziny otwarcia</h3>
                    <p className="text-[#b8c5d6]">
                      Poniedziałek - Piątek: 7:00 - 17:00<br />
                      Sobota: 8:00 - 14:00<br />
                      Niedziela: zamknięte
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-[#0f1419] p-8 rounded-2xl border border-[#2a3a4a]">
              <h2 className="text-2xl font-montserrat font-bold mb-6">
                NAPISZ DO <span className="text-[#f0a500]">NAS</span>
              </h2>
              {sent ? (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-6 rounded-xl text-center flex flex-col items-center gap-3">
                  <CheckCircle2 size={32} />
                  <p className="font-semibold">Wiadomość wysłana!</p>
                  <p className="text-sm text-[#b8c5d6]">Odezwiemy się do Ciebie najszybciej jak to możliwe.</p>
                  <button onClick={() => setSent(false)} className="text-sm text-[#f0a500] hover:underline">
                    Wyślij kolejną wiadomość
                  </button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">{error}</div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#b8c5d6] mb-2">Imię *</label>
                      <input
                        type="text"
                        required
                        value={form.imie}
                        onChange={(e) => setForm({ ...form, imie: e.target.value })}
                        className="w-full bg-[#1a2332] border border-[#2a3a4a] rounded-lg p-3 text-white"
                        placeholder="Jan"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#b8c5d6] mb-2">Nazwisko *</label>
                      <input
                        type="text"
                        required
                        value={form.nazwisko}
                        onChange={(e) => setForm({ ...form, nazwisko: e.target.value })}
                        className="w-full bg-[#1a2332] border border-[#2a3a4a] rounded-lg p-3 text-white"
                        placeholder="Kowalski"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-[#b8c5d6] mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-[#1a2332] border border-[#2a3a4a] rounded-lg p-3 text-white"
                      placeholder="jan@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#b8c5d6] mb-2">Telefon</label>
                    <input
                      type="tel"
                      value={form.telefon}
                      onChange={(e) => setForm({ ...form, telefon: e.target.value })}
                      className="w-full bg-[#1a2332] border border-[#2a3a4a] rounded-lg p-3 text-white"
                      placeholder="+48 123 456 789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#b8c5d6] mb-2">Temat *</label>
                    <select
                      required
                      value={form.temat}
                      onChange={(e) => setForm({ ...form, temat: e.target.value })}
                      className="w-full bg-[#1a2332] border border-[#2a3a4a] rounded-lg p-3 text-white"
                    >
                      <option value="">Wybierz temat...</option>
                      <option value="skup">Skup złomu</option>
                      <option value="transport">Transport</option>
                      <option value="koparki">Usługi koparką</option>
                      <option value="materialy">Materiały budowlane</option>
                      <option value="klimatyzacja">Klimatyzacja</option>
                      <option value="inne">Inne</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#b8c5d6] mb-2">Wiadomość *</label>
                    <textarea
                      required
                      rows={4}
                      value={form.wiadomosc}
                      onChange={(e) => setForm({ ...form, wiadomosc: e.target.value })}
                      className="w-full bg-[#1a2332] border border-[#2a3a4a] rounded-lg p-3 text-white"
                      placeholder="Treść wiadomości..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full btn-primary py-4 rounded-lg font-semibold text-[#0f1419] flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    WYŚLIJ WIADOMOŚĆ
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="h-96 bg-[#2a3a4a]">
        <div className="w-full h-full flex items-center justify-center text-[#b8c5d6]">
          <div className="text-center">
            <MapPin className="text-[#f0a500] size-12 mx-auto mb-4" />
            <p className="text-lg font-semibold">Mapa dojazdu</p>
            <p className="text-sm">ul. Kolejowa 5a, 59-307 Raszówka</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
