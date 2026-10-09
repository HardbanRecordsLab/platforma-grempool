"use client";

import { useState } from "react";
import { X, Download, Upload, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { MATERIAL_CATEGORIES, MATERIAL_CONDITIONS } from "@/lib/materials-store";
import {
  IMPORT_LIMIT,
  csvToRecords,
  normalizeImportRow,
  templateCsv,
  type ParsedRow,
} from "@/lib/materials-import";

const categoryLabel = (value: string) => MATERIAL_CATEGORIES.find((c) => c.value === value)?.label ?? value;
const conditionLabel = (value: string) => MATERIAL_CONDITIONS.find((c) => c.value === value)?.label ?? value;

export default function ImportMaterialsModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [records, setRecords] = useState<Record<string, string>[]>([]);
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const invalid = parsed.filter((p) => p.errors.length > 0);

  const downloadTemplate = () => {
    const blob = new Blob([templateCsv()], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "szablon-ogloszen-grempool.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const readFile = async (file: File) => {
    setResult(null);
    setFileError(null);
    if (/\.xlsx?$/i.test(file.name)) {
      setFileError("To plik Excela (.xlsx). Otwórz go w Excelu i wybierz Plik → Zapisz jako → „CSV UTF-8 (rozdzielany przecinkami)”.");
      return;
    }
    const { records: rows, missing } = csvToRecords(await file.text());
    if (missing.length > 0) {
      setFileError(`W pierwszym wierszu brakuje kolumny: ${missing.join(", ")}. Użyj szablonu.`);
      return;
    }
    if (rows.length === 0) {
      setFileError("Plik nie zawiera żadnych ogłoszeń.");
      return;
    }
    if (rows.length > IMPORT_LIMIT) {
      setFileError(`Za dużo wierszy (${rows.length}). Maksymalnie ${IMPORT_LIMIT} naraz — podziel plik.`);
      return;
    }
    setRecords(rows);
    setParsed(rows.map((r, i) => normalizeImportRow(r, i + 2)));
  };

  const runImport = async () => {
    setImporting(true);
    try {
      const res = await fetch("/api/materials/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: records }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFileError(body.error ?? "Import się nie udał");
        return;
      }
      setResult(`Zaimportowano ${body.imported} ogłoszeń (${body.codes[0]} – ${body.codes[body.codes.length - 1]}).`);
      setRecords([]);
      setParsed([]);
    } catch {
      setFileError("Brak połączenia z serwerem");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-[#0a0a0a] border border-[#5c4716] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[#5c4716]">
          <h2 className="text-xl font-montserrat font-bold">Import ogłoszeń z Excela</h2>
          <button onClick={onClose} className="text-[#e8dfcc] hover:text-white" aria-label="Zamknij">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          <ol className="text-sm text-[#e8dfcc] space-y-1.5 list-decimal list-inside">
            <li>Pobierz szablon i uzupełnij go w Excelu — jeden wiersz to jedno ogłoszenie.</li>
            <li>
              Zapisz jako <strong className="text-white">CSV UTF-8</strong> (Plik → Zapisz jako).
            </li>
            <li>Wybierz plik poniżej, sprawdź podgląd i kliknij „Importuj”. Zdjęcia dodasz potem przez „Edytuj”.</li>
          </ol>
          <p className="text-xs text-[#e8dfcc]/60">
            Kolumny: kategoria (np. stal, cegła, kruszywa, drewno, maszyny), nazwa (wymagana), wymiary, ilosc, stan (nowy,
            dobry, używany, uszkodzony), cena (puste = do uzgodnienia), lokalizacja, opis, dlugosc, zdjecia (linki https
            oddzielone „|”).
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={downloadTemplate}
              className="px-4 py-2.5 rounded-lg border border-[#5c4716] text-sm text-white hover:border-[#f5b52c] flex items-center gap-2"
            >
              <Download size={16} /> Pobierz szablon
            </button>
            <label className="px-4 py-2.5 rounded-lg btn-primary text-sm font-semibold text-black flex items-center gap-2 cursor-pointer">
              <Upload size={16} /> Wybierz plik CSV
              <input
                type="file"
                accept=".csv,text/csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) readFile(file);
                  e.target.value = "";
                }}
              />
            </label>
          </div>

          {fileError && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {fileError}
            </div>
          )}
          {result && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg text-sm">
              <CheckCircle2 size={16} /> {result}
            </div>
          )}

          {parsed.length > 0 && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-sm">
                <span className="text-white">
                  Podgląd: {parsed.length} wierszy
                  {invalid.length > 0 && <span className="text-red-400"> · {invalid.length} z błędami</span>}
                </span>
              </div>
              <div className="overflow-x-auto rounded-lg border border-[#5c4716]">
                <table className="w-full text-xs">
                  <thead className="bg-[#000000] text-[#e8dfcc]">
                    <tr>
                      {["Wiersz", "Kategoria", "Nazwa", "Wymiary", "Ilość", "Stan", "Cena", "Uwagi"].map((h) => (
                        <th key={h} className="text-left font-semibold px-3 py-2 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#5c4716]/50">
                    {parsed.map(({ line, row, errors }) => (
                      <tr key={line} className={errors.length ? "bg-red-500/10" : ""}>
                        <td className="px-3 py-2 text-[#e8dfcc]">{line}</td>
                        <td className="px-3 py-2">{categoryLabel(row.kategoria)}</td>
                        <td className="px-3 py-2 text-white">{row.nazwa || "—"}</td>
                        <td className="px-3 py-2">{row.wymiary}</td>
                        <td className="px-3 py-2">{row.ilosc}</td>
                        <td className="px-3 py-2">{conditionLabel(row.stan)}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{row.cena === null ? "do uzgodn." : `${row.cena} zł`}</td>
                        <td className="px-3 py-2 text-red-400">{errors.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[#5c4716] flex flex-wrap items-center gap-3">
          <button
            onClick={runImport}
            disabled={parsed.length === 0 || invalid.length > 0 || importing}
            className="btn-primary px-6 py-3 rounded-lg font-semibold text-black flex items-center gap-2 disabled:opacity-50"
          >
            {importing && <Loader2 size={16} className="animate-spin" />}
            Importuj {parsed.length > 0 ? `${parsed.length} ogłoszeń` : ""}
          </button>
          {invalid.length > 0 && (
            <span className="text-sm text-red-400">Popraw wiersze z błędami w Excelu i wczytaj plik ponownie.</span>
          )}
          <button
            onClick={result ? onImported : onClose}
            className="ml-auto px-6 py-3 rounded-lg font-semibold border border-[#5c4716] text-[#e8dfcc] hover:text-white"
          >
            {result ? "Gotowe" : "Anuluj"}
          </button>
        </div>
      </div>
    </div>
  );
}
