"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Send, Upload, CheckCircle2, Loader2, X } from "lucide-react";
import { uploadPublicPhoto } from "@/lib/image-utils";
import PrivacyConsent from "@/components/public/PrivacyConsent";

const MAX_PHOTOS = 8;

type ServiceType = "skup_zlomu" | "transport" | "koparki" | "rozbiorki" | "materialy";

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
  const [materialCode, setMaterialCode] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const addPhotos = async (files: FileList | File[] | null) => {
    const images = Array.from(files ?? []).filter((f) => f.type.startsWith("image/"));
    const room = MAX_PHOTOS - photos.length;
    if (images.length === 0 || room <= 0) return;
    setUploading(true);
    setError(null);
    try {
      const urls = await Promise.all(images.slice(0, room).map(uploadPublicPhoto));
      setPhotos((prev) => [...prev, ...urls].slice(0, MAX_PHOTOS));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wgrać zdjęcia");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const materialId = searchParams.get("material");
    const materialName = searchParams.get("nazwa");
    if (materialId) {
      setMaterialCode(materialId);
      setSelectedService("materialy");
      setFormData((prev) => ({
        ...prev,
        opis: `Zapytanie dotyczące materiału ${materialId}${materialName ? ` - ${materialName}` : ""}.`,
      }));
      return;
    }
    // Links from other pages (e.g. the scrap calculator) can preselect a
    // service and prefill the description.
    const usluga = searchParams.get("usluga");
    const opis = searchParams.get("opis");
    if (usluga && ["skup_zlomu", "transport", "koparki", "rozbiorki", "materialy"].includes(usluga)) {
      setSelectedService(usluga as ServiceType);
    }
    if (opis) setFormData((prev) => ({ ...prev, opis: opis.slice(0, 2000) }));
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
          material: materialCode,
          zdjecia: photos,
          zgoda: consent,
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

      <section className="py-20 bg-[#000000]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-4">
              CENTRUM SZYBKIEJ <span className="text-[#f5b52c]">WYCENY</span>
            </h1>
            <p className="text-[#e8dfcc] text-lg">
              Wybierz usługę i wypełnij formularz. Przygotujemy wycenę w ciągu 24 godzin.
            </p>
          </div>

          {submitted ? (
            <div className="bg-[#0a0a0a] p-12 rounded-2xl border border-[#5c4716] text-center">
              <CheckCircle2 className="text-[#f5b52c] size-16 mx-auto mb-6" />
              <h2 className="text-2xl font-montserrat font-bold mb-4">
                Zapytanie wysłane!
              </h2>
              <p className="text-[#e8dfcc] mb-6">
                Dziękujemy za zapytanie. Nasz konsultant skontaktuje się z Tobą w ciągu 24 godzin.
              </p>
              <p className="text-[#f5b52c] font-semibold">
                Numer zapytania: {leadNumer}
              </p>
            </div>
          ) : (
            <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-[#5c4716]">
              {/* Service Selection */}
              <div className="mb-8">
                <label className="block text-sm font-semibold mb-4 text-[#e8dfcc]">
                  WYBIERZ USŁUGĘ *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(["skup_zlomu", "transport", "koparki", "rozbiorki", "materialy"] as ServiceType[]).map((service) => (
                    <button
                      key={service}
                      onClick={() => selectService(service)}
                      className={`p-4 rounded-lg border-2 transition-all text-sm font-semibold ${
                        selectedService === service
                          ? "border-[#f5b52c] bg-[#f5b52c]/10 text-[#f5b52c]"
                          : "border-[#5c4716] text-[#e8dfcc] hover:border-[#f5b52c]/50"
                      }`}
                    >
                      {service === "skup_zlomu" && "SKUP ZŁOMU"}
                      {service === "transport" && "TRANSPORT"}
                      {service === "koparki" && "KOPARKA"}
                      {service === "rozbiorki" && "ROZBIÓRKA"}
                      {service === "materialy" && "MATERIAŁY"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Fields */}
              {selectedService && (
                <div className="mb-8 p-6 bg-[#000000] rounded-xl">
                  <h3 className="text-lg font-montserrat font-semibold mb-4 text-[#f5b52c]">
                    SZCZEGÓŁY USŁUGI
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {serviceFields[selectedService].map((field) => (
                      <div key={field.label}>
                        <label className="block text-sm text-[#e8dfcc] mb-2">
                          {field.label}
                        </label>
                        {field.fields.length > 0 ? (
                          <select
                            value={dynamicFields[field.label] ?? ""}
                            onChange={(e) => setDynamicFields((prev) => ({ ...prev, [field.label]: e.target.value }))}
                            className="w-full bg-[#0a0a0a] border border-[#5c4716] rounded-lg p-3 text-white"
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
                            className="w-full bg-[#0a0a0a] border border-[#5c4716] rounded-lg p-3 text-white"
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
                    <label className="block text-sm text-[#e8dfcc] mb-2">IMIĘ *</label>
                    <input
                      type="text"
                      required
                      value={formData.imie}
                      onChange={(e) => setFormData({ ...formData, imie: e.target.value })}
                      className="w-full bg-[#000000] border border-[#5c4716] rounded-lg p-3 text-white"
                      placeholder="Jan Kowalski"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#e8dfcc] mb-2">TELEFON *</label>
                    <input
                      type="tel"
                      required
                      value={formData.telefon}
                      onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                      className="w-full bg-[#000000] border border-[#5c4716] rounded-lg p-3 text-white"
                      placeholder="np. 600 123 456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#e8dfcc] mb-2">EMAIL</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#000000] border border-[#5c4716] rounded-lg p-3 text-white"
                      placeholder="jan@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#e8dfcc] mb-2">LOKALIZACJA *</label>
                    <input
                      type="text"
                      required
                      value={formData.lokalizacja}
                      onChange={(e) => setFormData({ ...formData, lokalizacja: e.target.value })}
                      className="w-full bg-[#000000] border border-[#5c4716] rounded-lg p-3 text-white"
                      placeholder="Raszówka"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm text-[#e8dfcc] mb-2">OPIS ZLECENIA *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.opis}
                    onChange={(e) => setFormData({ ...formData, opis: e.target.value })}
                    className="w-full bg-[#000000] border border-[#5c4716] rounded-lg p-3 text-white"
                    placeholder="Opisz swoje zlecenie..."
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm text-[#e8dfcc] mb-2">PREFEROWANY TERMIN</label>
                  <input
                    type="date"
                    value={formData.termin}
                    onChange={(e) => setFormData({ ...formData, termin: e.target.value })}
                    className="w-full bg-[#000000] border border-[#5c4716] rounded-lg p-3 text-white"
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-sm text-[#e8dfcc] mb-2">
                    ZDJĘCIA (opcjonalnie, do {MAX_PHOTOS}) — wycenimy szybciej i bez dojazdu
                  </label>
                  {photos.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-3">
                      {photos.map((src) => (
                        <div key={src} className="relative w-24 h-24 rounded-lg overflow-hidden border border-[#5c4716]">
                          <img src={src} alt="Dołączone zdjęcie" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPhotos((prev) => prev.filter((p) => p !== src))}
                            className="absolute top-1 right-1 bg-black/75 rounded-full p-1"
                            aria-label="Usuń zdjęcie"
                          >
                            <X size={12} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {photos.length < MAX_PHOTOS && (
                    <label
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        addPhotos(e.dataTransfer.files);
                      }}
                      className={`block border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                        dragging ? "border-[#f5b52c] bg-[#f5b52c]/5" : "border-[#5c4716] hover:border-[#f5b52c]/50"
                      }`}
                    >
                      {uploading ? (
                        <Loader2 className="text-[#f5b52c] size-8 mx-auto mb-2 animate-spin" />
                      ) : (
                        <Upload className="text-[#e8dfcc] size-8 mx-auto mb-2" />
                      )}
                      <p className="text-[#e8dfcc] text-sm">
                        {uploading ? "Wgrywanie zdjęć..." : "Przeciągnij zdjęcia lub kliknij, aby dodać (także z aparatu w telefonie)"}
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => {
                          addPhotos(e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  )}
                </div>

                {error && (
                  <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <PrivacyConsent checked={consent} onChange={setConsent} />

                <button
                  type="submit"
                  disabled={submitting || uploading || !consent}
                  className="w-full btn-primary py-4 rounded-lg font-semibold text-[#000000] text-lg flex items-center justify-center gap-2 disabled:opacity-60"
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
