"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Receipt, Truck, FileSignature, MessageSquare, Plus, Trash2 } from "lucide-react";
import ClientForm from "@/components/admin/ClientForm";
import { clientToForm, type Client, type ClientForm as ClientFormData } from "@/lib/clients";
import { formatKg, formatPln, totalWeight, type ScrapPurchaseItem } from "@/lib/scrap-purchases";
import { SERVICE_LABELS } from "@/lib/supabase";

interface History {
  client: Client;
  purchases: { id: string; numer: string; data: string; suma: number | string; platnosc: string; pozycje: ScrapPurchaseItem[] }[];
  deliveries: { id: string; numer: string; data: string; suma: number | string; pozycje: ScrapPurchaseItem[] }[];
  offers: { id: string; numer: string; created_at: string; temat: string | null; suma_brutto: number | string }[];
  leads: { id: string; numer: string; usluga: string; status: string; data_kontaktu: string }[];
}

const date = (value: string) => new Date(value).toLocaleDateString("pl-PL");

function Section({ title, icon: Icon, count, children }: { title: string; icon: typeof Receipt; count: number; children: React.ReactNode }) {
  return (
    <section className="bg-[#0a0a0a] rounded-xl border border-[#5c4716] p-5">
      <h2 className="font-montserrat font-bold flex items-center gap-2 mb-3">
        <Icon size={17} className="text-[#f5b52c]" /> {title} <span className="text-sm font-normal text-[#e8dfcc]/60">({count})</span>
      </h2>
      {count === 0 ? <p className="text-sm text-[#e8dfcc]/70">Brak.</p> : <ul className="divide-y divide-[#5c4716]/50 text-sm">{children}</ul>}
    </section>
  );
}

export default function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [history, setHistory] = useState<History | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let stale = false;
    fetch(`/api/clients/${id}`, { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Nie udało się wczytać klienta");
        if (!stale) setHistory(body);
      })
      .catch((err) => !stale && setError(err instanceof Error ? err.message : "Nie udało się wczytać klienta"));
    return () => {
      stale = true;
    };
  }, [id, version]);

  const save = async (form: ClientFormData): Promise<string | null> => {
    const res = await fetch(`/api/clients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return body.error ?? "Nie udało się zapisać";
    setVersion((v) => v + 1);
    return null;
  };

  const remove = async () => {
    if (
      !confirm(
        "Usunąć kartę klienta? Kwity skupu pozostaną w ewidencji (przepisy wymagają ich przechowywania przez 5 lat), ale przestaną być powiązane z kartą."
      )
    )
      return;
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Nie udało się usunąć klienta");
      return;
    }
    window.location.assign("/admin/klienci");
  };

  if (error) return <div className="text-red-400 text-sm">{error}</div>;
  if (!history)
    return (
      <div className="flex items-center gap-2 text-[#e8dfcc]">
        <Loader2 size={16} className="animate-spin" /> Wczytywanie...
      </div>
    );

  const { client, purchases, deliveries, offers, leads } = history;
  const totalKg = purchases.reduce((sum, p) => sum + totalWeight(p.pozycje), 0);
  const totalValue = purchases.reduce((sum, p) => sum + Number(p.suma), 0);

  return (
    <div>
      <Link href="/admin/klienci" className="inline-flex items-center gap-2 text-sm text-[#e8dfcc] hover:text-white mb-4">
        <ArrowLeft size={16} /> Wszyscy klienci
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#f5b52c]">{client.typ === "firma" ? "Firma" : "Osoba prywatna"}</span>
          <h1 className="text-2xl font-montserrat font-bold">{client.nazwa}</h1>
          <p className="text-xs text-[#e8dfcc]/60 mt-1">W kartotece od {date(client.created_at)}</p>
        </div>
        <Link
          href={`/admin/skup?klient=${client.id}`}
          className="btn-primary px-4 py-2.5 rounded-lg text-sm font-semibold text-black flex items-center gap-2"
        >
          <Plus size={16} /> Nowy kwit dla tego klienta
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-6 items-start">
        <div className="space-y-4">
          <section className="bg-[#0a0a0a] rounded-xl border border-[#5c4716] p-5">
            <h2 className="font-montserrat font-bold mb-4">Dane klienta</h2>
            <ClientForm key={client.updated_at} initial={clientToForm(client)} submitLabel="Zapisz zmiany" onSubmit={save} />
          </section>
          <button onClick={remove} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300">
            <Trash2 size={15} /> Usuń kartę klienta
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Kwitów skupu", value: String(purchases.length) },
              { label: "Skupiono", value: formatKg(Math.round(totalKg * 1000) / 1000) },
              { label: "Wypłacono", value: formatPln(totalValue) },
              { label: "Dostaw", value: String(deliveries.length) },
            ].map((s) => (
              <div key={s.label} className="bg-[#0a0a0a] rounded-xl border border-[#5c4716] p-3">
                <div className="text-lg font-bold text-white">{s.value}</div>
                <div className="text-xs text-[#e8dfcc]">{s.label}</div>
              </div>
            ))}
          </div>

          <Section title="Kwity skupu" icon={Receipt} count={purchases.length}>
            {purchases.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/skup/${p.id}`} className="flex items-center justify-between gap-3 py-2 hover:text-[#f5b52c]">
                  <span>
                    <span className="font-mono text-[#f5b52c]">{p.numer}</span> · {date(p.data)}
                  </span>
                  <span className="text-[#e8dfcc]">
                    {formatKg(totalWeight(p.pozycje))} · <strong className="text-white">{formatPln(Number(p.suma))}</strong>
                  </span>
                </Link>
              </li>
            ))}
          </Section>

          <Section title="Dostawy (sprzedaż złomu)" icon={Truck} count={deliveries.length}>
            {deliveries.map((d) => (
              <li key={d.id}>
                <Link href={`/admin/skup/dostawa/${d.id}`} className="flex items-center justify-between gap-3 py-2 hover:text-[#f5b52c]">
                  <span>
                    <span className="font-mono text-[#f5b52c]">{d.numer}</span> · {date(d.data)}
                  </span>
                  <span className="text-[#e8dfcc]">{formatKg(totalWeight(d.pozycje))}</span>
                </Link>
              </li>
            ))}
          </Section>

          <Section title="Oferty" icon={FileSignature} count={offers.length}>
            {offers.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/oferty/${o.id}`} className="flex items-center justify-between gap-3 py-2 hover:text-[#f5b52c]">
                  <span>
                    <span className="font-mono text-[#f5b52c]">{o.numer}</span> · {date(o.created_at)} {o.temat ? `· ${o.temat}` : ""}
                  </span>
                  <strong className="text-white">{formatPln(Number(o.suma_brutto))}</strong>
                </Link>
              </li>
            ))}
          </Section>

          <Section title="Zapytania ze strony" icon={MessageSquare} count={leads.length}>
            {leads.map((l) => (
              <li key={l.id}>
                <Link href="/admin/crm" className="flex items-center justify-between gap-3 py-2 hover:text-[#f5b52c]">
                  <span>
                    <span className="font-mono text-[#f5b52c]">{l.numer}</span> · {date(l.data_kontaktu)} · {SERVICE_LABELS[l.usluga] ?? l.usluga}
                  </span>
                  <span className="text-[#e8dfcc]">{l.status}</span>
                </Link>
              </li>
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
}
