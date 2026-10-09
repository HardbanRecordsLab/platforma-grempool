// Ready-made replies to customers. {imie}, {numer} and {telefon} are filled
// in when a template is picked; the admin edits the text before sending.

export interface ReplyTemplate {
  id: string;
  label: string;
  subject: string;
  body: string;
}

export const REPLY_TEMPLATES: ReplyTemplate[] = [
  {
    id: "oddzwonimy",
    label: "Dziękujemy — oddzwonimy dziś",
    subject: "Twoje zapytanie {numer} — GREMPOOL",
    body: "Dzień dobry {imie},\n\ndziękujemy za zapytanie. Oddzwonimy jeszcze dziś, żeby ustalić szczegóły.\n\nW pilnej sprawie prosimy o telefon: {telefon}.",
  },
  {
    id: "wycena",
    label: "Wycena",
    subject: "Wycena — GREMPOOL",
    body: "Dzień dobry {imie},\n\nw odpowiedzi na zapytanie przygotowaliśmy wycenę:\n\nKwota: … zł\nZakres: …\nTermin realizacji: …\n\nCena jest ważna 14 dni. Jeśli odpowiada, prosimy o potwierdzenie mailem lub telefonicznie: {telefon}.",
  },
  {
    id: "zdjecia",
    label: "Prośba o zdjęcia i szczegóły",
    subject: "Prośba o szczegóły — GREMPOOL",
    body: "Dzień dobry {imie},\n\nżeby dokładnie wycenić zlecenie, prosimy o przesłanie w odpowiedzi na tę wiadomość:\n- kilku zdjęć,\n- przybliżonej ilości lub wagi,\n- dokładnej lokalizacji.\n\nOdpowiemy najszybciej, jak to możliwe.",
  },
  {
    id: "termin",
    label: "Propozycja terminu",
    subject: "Termin realizacji — GREMPOOL",
    body: "Dzień dobry {imie},\n\nproponujemy termin: … (dzień), godz. … .\n\nProsimy o potwierdzenie albo wskazanie innego dogodnego terminu.",
  },
  {
    id: "sprzedane",
    label: "Towar już sprzedany",
    subject: "Twoje zapytanie — GREMPOOL",
    body: "Dzień dobry {imie},\n\ndziękujemy za zainteresowanie. Niestety ten towar został już sprzedany. Na placu często pojawiają się podobne materiały — zadzwoń ({telefon}) albo zajrzyj na grempool.pl/ogloszenia.",
  },
  {
    id: "pusty",
    label: "Pusta wiadomość",
    subject: "GREMPOOL",
    body: "Dzień dobry {imie},\n\n",
  },
];

export function fillTemplate(text: string, values: { imie?: string; numer?: string; telefon: string }) {
  return text
    .replace(/\{imie\}/g, values.imie?.trim() || "")
    .replace(/\{numer\}/g, values.numer ?? "")
    .replace(/\{telefon\}/g, values.telefon)
    .replace(/Dzień dobry ,/g, "Dzień dobry,") // no name given
    .replace(/ {2,}/g, " "); // empty {numer}
}
