"use client";

import { useState } from "react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Phone, Mail, MapPin, Clock, Send, Loader2, CheckCircle2, Navigation } from "lucide-react";
import PrivacyConsent from "@/components/public/PrivacyConsent";
import { createContactMessage } from "@/lib/contact-messages-store";
import { hoursLines, telHref } from "@/lib/site-settings";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

const TEMAT_LABELS: Record<string, string> = {
  skup: "Skup złomu",
  transport: "Transport",
  koparki: "Usługi koparką",
  materialy: "Materiały budowlane",
  inne: "Inne",
};

export default function KontaktClient() {
  const site = useSiteSettings();
  const siteAddress = `${site.streetAddress}, ${site.postalCode} ${site.addressLocality}`;
  const [form, setForm] = useState({
    imie: "",
    nazwisko: "",
    email: "",
    telefon: "",
    temat: "",
    wiadomosc: "",
  });
  const [consent, setConsent] = useState(false);
  const [mapShown, setMapShown] = useState(false);
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
        zgoda: consent,
      });
      setSent(true);
      setConsent(false);
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
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(11, 11, 10,0.85) 0%, rgba(11, 11, 10,0.92) 100%)" }} />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-4">
            <span className="text-[#f5b52c]">KONTAKT</span>
          </h1>
          <p className="text-[#e8dfcc] text-lg max-w-2xl mx-auto">
            Masz pytanie? Zadzwoń lub napisz do nas. Jesteśmy do Twojej dyspozycji.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Details */}
            <div>
              <h2 className="text-3xl font-montserrat font-bold mb-8">
                DANE <span className="text-[#f5b52c]">KONTAKTOWE</span>
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#f5b52c]/10 flex items-center justify-center shrink-0">
                    <MapPin className="text-[#f5b52c] size-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Adres</h3>
                    <p className="text-[#e8dfcc]">{site.streetAddress}<br />{site.postalCode} {site.addressLocality}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#f5b52c]/10 flex items-center justify-center shrink-0">
                    <Phone className="text-[#f5b52c] size-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Telefon</h3>
                    <a href={telHref(site.phone)} className="text-[#e8dfcc] hover:text-[#f5b52c] transition-colors">
                      {site.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#f5b52c]/10 flex items-center justify-center shrink-0">
                    <Mail className="text-[#f5b52c] size-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a href={`mailto:${site.email}`} className="text-[#e8dfcc] hover:text-[#f5b52c] transition-colors">
                      {site.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#f5b52c]/10 flex items-center justify-center shrink-0">
                    <Clock className="text-[#f5b52c] size-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Godziny otwarcia</h3>
                    <dl className="text-[#e8dfcc] space-y-0.5">
                      {hoursLines(site).map((line) => (
                        <div key={line.label}>
                          <dt className="inline">{line.label}: </dt>
                          <dd className="inline">{line.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-[#000000] p-8 rounded-2xl border border-[#5c4716]">
              <h2 className="text-2xl font-montserrat font-bold mb-6">
                NAPISZ DO <span className="text-[#f5b52c]">NAS</span>
              </h2>
              {sent ? (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-6 rounded-xl text-center flex flex-col items-center gap-3">
                  <CheckCircle2 size={32} />
                  <p className="font-semibold">Wiadomość wysłana!</p>
                  <p className="text-sm text-[#e8dfcc]">Odezwiemy się do Ciebie najszybciej jak to możliwe.</p>
                  <button onClick={() => setSent(false)} className="text-sm text-[#f5b52c] hover:underline">
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
                      <label className="block text-sm text-[#e8dfcc] mb-2">Imię *</label>
                      <input
                        type="text"
                        required
                        value={form.imie}
                        onChange={(e) => setForm({ ...form, imie: e.target.value })}
                        className="w-full bg-[#0a0a0a] border border-[#5c4716] rounded-lg p-3 text-white"
                        placeholder="Jan"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#e8dfcc] mb-2">Nazwisko *</label>
                      <input
                        type="text"
                        required
                        value={form.nazwisko}
                        onChange={(e) => setForm({ ...form, nazwisko: e.target.value })}
                        className="w-full bg-[#0a0a0a] border border-[#5c4716] rounded-lg p-3 text-white"
                        placeholder="Kowalski"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-[#e8dfcc] mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#5c4716] rounded-lg p-3 text-white"
                      placeholder="jan@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#e8dfcc] mb-2">Telefon</label>
                    <input
                      type="tel"
                      value={form.telefon}
                      onChange={(e) => setForm({ ...form, telefon: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#5c4716] rounded-lg p-3 text-white"
                      placeholder="np. 600 123 456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#e8dfcc] mb-2">Temat *</label>
                    <select
                      required
                      value={form.temat}
                      onChange={(e) => setForm({ ...form, temat: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#5c4716] rounded-lg p-3 text-white"
                    >
                      <option value="">Wybierz temat...</option>
                      <option value="skup">Skup złomu</option>
                      <option value="transport">Transport</option>
                      <option value="koparki">Usługi koparką</option>
                      <option value="materialy">Materiały budowlane</option>
                      <option value="inne">Inne</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#e8dfcc] mb-2">Wiadomość *</label>
                    <textarea
                      required
                      rows={4}
                      value={form.wiadomosc}
                      onChange={(e) => setForm({ ...form, wiadomosc: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#5c4716] rounded-lg p-3 text-white"
                      placeholder="Treść wiadomości..."
                    />
                  </div>
                  <PrivacyConsent checked={consent} onChange={setConsent} />
                  <button
                    type="submit"
                    disabled={sending || !consent}
                    className="w-full btn-primary py-4 rounded-lg font-semibold text-[#000000] flex items-center justify-center gap-2 disabled:opacity-60"
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

      {/* Map — Google Maps embed needs no API key; the address comes from Ustawienia. */}
      <section className="relative h-[28rem] bg-[#0a0a0a] border-y border-[#5c4716]">
        {mapShown ? (
          <iframe
            title={`Mapa dojazdu — ${siteAddress}`}
            src={`https://www.google.com/maps?q=${encodeURIComponent(`GREMPOOL, ${siteAddress}`)}&z=15&output=embed`}
            className="w-full h-full border-0 grayscale-[30%] contrast-[1.05]"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          // Google receives the visitor's data as soon as its map loads, so it
          // only loads after a click.
          <div className="w-full h-full flex flex-col items-center justify-center text-center px-6 bg-[radial-gradient(ellipse_at_center,#1a1405,#0a0a0a)]">
            <MapPin className="text-[#f5b52c] size-12 mb-4" />
            <p className="font-montserrat font-bold text-xl text-white mb-1">Mapa dojazdu</p>
            <p className="text-[#e8dfcc] mb-5">{siteAddress}</p>
            <button
              type="button"
              onClick={() => setMapShown(true)}
              className="btn-primary px-6 py-3 rounded-lg font-semibold text-black"
            >
              Pokaż mapę
            </button>
            <p className="text-xs text-[#e8dfcc]/60 mt-4 max-w-sm">
              Po kliknięciu załadujemy mapę Google, która może zapisać pliki cookies.{" "}
              <a href="/polityka-prywatnosci#cookies" className="underline underline-offset-2 hover:text-white">
                Szczegóły
              </a>
            </p>
          </div>
        )}
        <div className="absolute left-4 bottom-4 sm:left-8 sm:bottom-8 max-w-xs rounded-2xl border border-[#f5b52c]/50 bg-black/90 backdrop-blur p-5 shadow-2xl">
          <div className="flex items-start gap-3 mb-4">
            <MapPin className="text-[#f5b52c] size-6 shrink-0" />
            <div>
              <div className="font-montserrat font-bold text-white">GREMPOOL — plac</div>
              <div className="text-sm text-[#e8dfcc]">{siteAddress}</div>
            </div>
          </div>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(siteAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-black"
          >
            <Navigation size={16} /> Wyznacz trasę
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
