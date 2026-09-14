export interface Holiday {
  date: string;
  name: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

// Anonymous Gregorian algorithm (Meeus/Jones/Butcher) for the date of Easter Sunday.
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/** Polish statutory public holidays (dni ustawowo wolne od pracy) for a given year. */
export function getPolishHolidays(year: number): Holiday[] {
  const easter = easterSunday(year);

  const fixed: Holiday[] = [
    { date: `${year}-01-01`, name: "Nowy Rok" },
    { date: `${year}-01-06`, name: "Święto Trzech Króli" },
    { date: `${year}-05-01`, name: "Święto Pracy" },
    { date: `${year}-05-03`, name: "Święto Konstytucji 3 Maja" },
    { date: `${year}-08-15`, name: "Wniebowzięcie NMP / Święto Wojska Polskiego" },
    { date: `${year}-11-01`, name: "Wszystkich Świętych" },
    { date: `${year}-11-11`, name: "Święto Niepodległości" },
    { date: `${year}-12-25`, name: "Boże Narodzenie (I dzień)" },
    { date: `${year}-12-26`, name: "Boże Narodzenie (II dzień)" },
  ];

  const movable: Holiday[] = [
    { date: toISO(easter), name: "Wielkanoc" },
    { date: toISO(addDays(easter, 1)), name: "Poniedziałek Wielkanocny" },
    { date: toISO(addDays(easter, 49)), name: "Zielone Świątki" },
    { date: toISO(addDays(easter, 60)), name: "Boże Ciało" },
  ];

  return [...fixed, ...movable].sort((a, b) => a.date.localeCompare(b.date));
}

export function getPolishHolidaysMap(years: number[]): Record<string, string> {
  const map: Record<string, string> = {};
  years.forEach((y) => getPolishHolidays(y).forEach((h) => { map[h.date] = h.name; }));
  return map;
}
