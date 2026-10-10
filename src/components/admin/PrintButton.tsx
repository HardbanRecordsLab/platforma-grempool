"use client";

import { Printer } from "lucide-react";

export default function PrintButton({ label = "Drukuj / zapisz PDF" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold text-black flex items-center gap-2 print:hidden"
    >
      <Printer size={16} /> {label}
    </button>
  );
}
