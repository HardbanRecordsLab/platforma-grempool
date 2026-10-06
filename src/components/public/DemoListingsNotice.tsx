import { Info } from "lucide-react";
import { DEMO_LISTINGS } from "@/lib/site";

export default function DemoListingsNotice() {
  if (!DEMO_LISTINGS) return null;
  return (
    <div className="flex items-start md:items-center gap-3 mb-8 pl-4 pr-5 py-3 rounded-xl border border-white/10 border-l-2 border-l-[#f5b52c] bg-white/[0.02] text-sm text-[#e8dfcc]">
      <Info size={16} className="text-[#f5b52c] shrink-0 mt-0.5 md:mt-0" />
      <p>
        <strong className="text-white">Ogłoszenia przykładowe (DEMO).</strong> Strona jest w budowie — poniższe
        oferty służą do prezentacji. Aktualną dostępność i ceny potwierdzimy telefonicznie.
      </p>
    </div>
  );
}
