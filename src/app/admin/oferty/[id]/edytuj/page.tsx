"use client";

import { use, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import OfferEditor from "@/components/admin/OfferEditor";
import type { Offer } from "@/lib/offers";

export default function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/offers/${id}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Nie udało się wczytać oferty");
        setOffer(body);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Nie udało się wczytać oferty"));
  }, [id]);

  if (error) return <div className="text-red-400 text-sm">{error}</div>;
  if (!offer)
    return (
      <div className="flex items-center gap-2 text-[#e8dfcc]">
        <Loader2 size={16} className="animate-spin" /> Wczytywanie...
      </div>
    );
  return <OfferEditor offer={offer} />;
}
