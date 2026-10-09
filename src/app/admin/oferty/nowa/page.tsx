"use client";

import { useEffect, useState } from "react";
import OfferEditor from "@/components/admin/OfferEditor";

export default function NewOfferPage() {
  // ?lead=<id> when started from the CRM; read on the client so the page
  // needs no Suspense boundary.
  const [leadId, setLeadId] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    setLeadId(new URLSearchParams(window.location.search).get("lead"));
  }, []);
  if (leadId === undefined) return null;
  return <OfferEditor leadId={leadId} />;
}
