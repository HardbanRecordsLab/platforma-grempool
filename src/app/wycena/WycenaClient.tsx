"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Send, Upload, CheckCircle2 } from "lucide-react";

type ServiceType = "skup_zlomu" | "transport" | "koparki" | "rozbiorki" | "materialy" | "klimatyzacja";

const serviceFields: Record<ServiceType, { label: string; fields: string[]; placeholder?: string }[]> = {
  skup_zlomu: [
    { label: "Rodzaj złomu", fields: ["stal", "metale kolorowe", "inne"] },
    { label: "Orientacyjna ilość", fields: ["do 1 tony", "1-5 ton", "powyżej 5 ton"] },
    { label: "Potrzeba odbioru", fields: ["tak", "nie"] },
  ],
  transport: [
    { label: "Skąd", fields: [], placeholder: "miejscowość" },
    { label: "Dokąd", fields: [], placeholder: "miejscowość" },
    { label: "Rodzaj ładunku", fields: ["złom", "materiały budowlane", "inne"] },
    { label: "Masz/gabaryt", fields: ["mały", "średni", "duży"] },
  ],
  koparki: [
    { label: "Zakres prac", fields: ["wykop", "niwelacja", "rozbiórka", "inne"] },
    { label: "Warunki dojazdu", fields: ["dobre", "średnie", "trudne"] },
  ],
  rozbiorki: [
    { label: "Typ obiektu", fields: ["budynek", "garaż", "altana", "inne"] },
    { label: "Zakres", fields: ["całkowita", "częściowa", "wyburzenie"] },
  ],
  materialy: [
    { label: "Rodzaj materiału", fields: ["stal", "cegła", "okna", "drzwi", "inne"] },
    { label: "Potrzeba transportu", fields: ["tak", "nie"] },
  ],
  klimatyzacja: [
    { label: "Typ pojazdu", fields: ["osobowy", "dostawczy", "ciężarowy"] },
    { label: "Usługa", fields: ["napełnianie", "czyszczenie", "diagnostyka"] },
  ],
};

function WycenaForm() {
  const searchParams = useSearchParams();
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [dynamicFields, setDynamicFields] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    imie: "",
    telefon: "",
    email: "",
    lokalizacja: "",
    opis: "",
    termin: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const selectService = (service: ServiceType) => {
    setSelectedService(service);
    setDynamicFields({});
  };
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadNumer, setLeadNumer] = useState<string | null>(null);

  useEffect(() => {
    const materialId = searchParams.get("material");
    const materialName = searchParams.get("nazwa");
    if (materialId) {
      setSelectedService("materialy");
      setFormData((prev) => ({
        ...prev,
        opis: `Zapytanie dotyczące materiału ${materialId}${materialName ? ` - ${materialName}` : ""}.`,
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) {
      setError("Wybierz usługę, której dotyczy zapytanie.");
      return;
    }

    const [klient_imie, ...rest] = formData.imie.trim().split(/\s+/);
    const klient_nazwisko = rest.join(" ") || "-";

    const detailsSummary = serviceFields[selectedService]
      .map((field) => (dynamicFields[field.label] ? `${field.label}: ${dynamicFields[field.label]}` : null))
      .filter(Boolean)
      .join("; ");

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          klient_imie: klient_imie || formData.imie,
          klient_nazwisko,
          klient_telefon: formData.telefon,
          klient_email: formData.email || null,
          usluga: selectedService,
          lokalizacja: formData.lokalizacja,
          opis: formData.opis,
          notatki: detailsSummary || null,
          preferowany_termin: formData.termin || null,
          status: "nowy",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nie udało się wysłać zapytania");
      setLeadNumer(data.numer);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wysłać zapytania");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="py-20 bg-[#0f1419]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-4">
              CENTRUM SZYBKIEJ <span className="text-[#f0a500]">WYCENY</span>
            </h1>
            <p className="text-[#b8c5d6] text-lg">
              Wybierz usługę i wypełnij formularz. Przygotujemy wycenę w ciągu 24 godzin.
            </p>
          </div>

          {submitted ? (
            <div className="bg-[#1a2332] p-12 rounded-2xl border border-[#2a3a4a] text-center">
              <CheckCircle2 className="text-[#f0a500] size-16 mx-auto mb-6" />
              <h2 className="text-2xl font-montserrat font-bold mb-4">
                Zapytanie wysłane!
              </h2>
              <p className="text-[#b8c5d6] mb-6">
                Dziękujemy za zapytanie. Nasz konsultant skontaktuje się z Tobą w ciągu 24 godzin.
              </p>
              <p className="text-[#f0a500] font-semibold">
                Numer zapytania: {leadNumer}
              </p>
            </div>
          ) : (
            <div className="bg-[#1a2332] p-8 rounded-2xl border border-[#2a3a4a]">
              {/* Service Selection */}
              <div className="mb-8">
                <label className="block text-sm font-semibold mb-4 text-[#b8c5d6]">
                  WYBIERZ USŁUGĘ *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(["skup_zlomu", "transport", "koparki", "rozbiorki", "materialy", "klimatyzacja"] as ServiceType[]).map((service) => (
                    <button
                      key={service}
                      onClick={() => selectService(service)}
                      className={`p-4 rounded-lg border-2 transition-all text-sm font-semibold ${
                        selectedService === service
                          ? "border-[#f0a500] bg-[#f0a500]/10 text-[#f0a500]"
                          : "border-[#2a3a4a] text-[#b8c5d6] hover:border-[#f0a500]/50"
                      }`}
                    >
                      {service === "skup_zlomu" && "SKUP ZŁOMU"}
                      {service === "transport" && "TRANSPORT"}
                      {service === "koparki" && "KOPARKA"}
                      {service === "rozbiorki" && "ROZBIÓRKA"}
                      {service === "materialy" && "MATERIAŁY"}
                      {service === "klimatyzacja" && "KLIMATYZACJA"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Fields */}
              {selectedService && (
                <div className="mb-8 p-6 bg-[#0f1419] rounded-xl">
                  <h3 className="text-lg font-montserrat font-semibold mb-4 text-[#f0a500]">
                    SZCZEGÓŁY USŁUGI
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {serviceFields[selectedService].map((field) => (
                      <div key={field.label}>
                        <label className="block text-sm text-[#b8c5d6] mb-2">
                          {field.label}
                        </label>
                        {field.fields.length > 0 ? (
                          <select
                            value={dynamicFields[field.label] ?? ""}
                            onChange={(e) => setDynamicFields((prev) => ({ ...prev, [field.label]: e.target.value }))}
                            className="w-full bg-[#1a2332] border border-[#2a3a4a] rounded-lg p-3 text-white"
                          >
                            <option value="">Wybierz...</option>
                            {field.fields.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={dynamicFields[field.label] ?? ""}
                            onChange={(e) => setDynamicFields((prev) => ({ ...prev, [field.label]: e.target.value }))}
                            placeholder={field.placeholder}
                            className="w-full bg-[#1a2332] border border-[#2a3a4a] rounded-lg p-3 text-white"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Form */}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-[#b8c5d6] mb-2">IMIĘ *</label>
                    <input
                      type="text"
                      required
                      value={formData.imie}
                      onChange={(e) => setFormData({ ...formData, imie: e.target.value })}
                      className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg p-3 text-white"
                      placeholder="Jan Kowalski"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#b8c5d6] mb-2">TELEFON *</label>
                    <input
                      type="tel"
                      required
                      value={formData.telefon}
                      onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                      className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg p-3 text-white"
                      placeholder="+48 663 288 533"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#b8c5d6] mb-2">EMAIL</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg p-3 text-white"
                      placeholder="jan@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#b8c5d6] mb-2">LOKALIZACJA *</label>
                    <input
                      type="text"
                      required
                      value={formData.lokalizacja}
                      onChange={(e) => setFormData({ ...formData, lokalizacja: e.target.value })}
                      className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg p-3 text-white"
                      placeholder="Raszówka"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm text-[#b8c5d6] mb-2">OPIS ZLECENIA *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.opis}
                    onChange={(e) => setFormData({ ...formData, opis: e.target.value })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg p-3 text-white"
                    placeholder="Opisz swoje zlecenie..."
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm text-[#b8c5d6] mb-2">PREFEROWANY TERMIN</label>
                  <input
                    type="date"
                    value={formData.termin}
                    onChange={(e) => setFormData({ ...formData, termin: e.target.value })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg p-3 text-white"
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-sm text-[#b8c5d6] mb-2">ZDJĘCIA (opcjonalnie)</label>
                  <div className="border-2 border-dashed border-[#2a3a4a] rounded-lg p-8 text-center hover:border-[#f0a500]/50 transition-colors cursor-pointer">
                    <Upload className="text-[#b8c5d6] size-8 mx-auto mb-2" />
                    <p className="text-[#b8c5d6] text-sm">
                      Przeciągnij zdjęcia lub kliknij, aby dodać
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary py-4 rounded-lg font-semibold text-[#0f1419] text-lg flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Send size={20} />
                  {submitting ? "WYSYŁANIE..." : "WYŚLIJ ZAPYTANIE"}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function WycenaClient() {
  return (
    <Suspense fallback={null}>
      <WycenaForm />
    </Suspense>
  );
}
