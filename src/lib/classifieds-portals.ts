export interface ClassifiedsPortal {
  name: string;
  url: string;
  scope: "ogólnopolski" | "branżowy" | "Dolny Śląsk";
}

export const CLASSIFIEDS_PORTALS: ClassifiedsPortal[] = [
  { name: "OLX", url: "https://www.olx.pl", scope: "ogólnopolski" },
  { name: "Sprzedajemy.pl", url: "https://sprzedajemy.pl", scope: "ogólnopolski" },
  { name: "Allegro Lokalnie", url: "https://allegrolokalnie.pl", scope: "ogólnopolski" },
  { name: "Gratka.pl", url: "https://gratka.pl/dodaj-ogloszenie", scope: "ogólnopolski" },
  { name: "Dealuj.pl", url: "https://dealuj.pl", scope: "ogólnopolski" },
  { name: "Facebook Marketplace", url: "https://www.facebook.com/marketplace/", scope: "ogólnopolski" },
  { name: "Złom Info PL", url: "https://www.zlom.info.pl", scope: "branżowy" },
  { name: "Elbordo (sprzęt budowlany)", url: "https://elbordo.pl", scope: "branżowy" },
  { name: "AnonseGazeta Dolnośląskie", url: "https://dolnoslaskie.anonsegazeta.pl", scope: "Dolny Śląsk" },
  { name: "tuWroclaw.com ogłoszenia", url: "https://tuwroclaw.com/ogloszenia", scope: "Dolny Śląsk" },
  { name: "Lento.pl Wrocław", url: "https://wroclaw.lento.pl", scope: "Dolny Śląsk" },
  { name: "NaDolnymSlasku.com", url: "https://nadolnymslasku.com", scope: "Dolny Śląsk" },
];

export function buildListingText(params: {
  nazwa: string;
  opis?: string;
  cena?: number | null;
  wymiary?: string;
  ilosc?: number;
}): string {
  const lines = [
    params.nazwa,
    "",
    params.opis?.trim() || "Materiał z odzysku, stan i szczegóły do uzgodnienia.",
    "",
    params.wymiary ? `Wymiary: ${params.wymiary}` : null,
    params.ilosc ? `Ilość: ${params.ilosc} szt.` : null,
    params.cena ? `Cena: ${params.cena.toFixed(2)} zł` : "Cena: do uzgodnienia",
    "Lokalizacja: Raszówka, woj. dolnośląskie",
    "",
    "Kontakt: +48 663 288 533 / grempool@proton.me",
    "GREMPOOL Maria Muczyńska - www.grempool.pl",
  ].filter((l) => l !== null);
  return lines.join("\n");
}
