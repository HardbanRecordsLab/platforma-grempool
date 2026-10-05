import { Info } from "lucide-react";
import { DEMO_LISTINGS } from "@/lib/site";

export default function DemoListingsNotice() {
  if (!DEMO_LISTINGS) return null;
  return (
    <div className="flex items-start gap-3 mb-8 px-5 py-4 rounded-lg border border-[#f5b52c]/60 bg-[#f5b52c]/10 text-sm text-[#e8dfcc]">
      <Info size={18} className="text-[#f5b52c] shrink-0 mt-0.5" />
      <p>
        <strong className="text-[#f5b52c]">Ogłoszenia przykładowe.</strong> Strona jest w budowie, a poniższe
        materiały służą wyłącznie do prezentacji. Aktualną dostępność i ceny potwierdzimy telefonicznie.
      </p>
    </div>
  );
}
