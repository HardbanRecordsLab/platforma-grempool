// Periods for the scrap purchase register: day, week (Monday–Sunday), month,
// year or a custom range. All dates are local (the browser is in Poland);
// "to" is always exclusive.

export type PeriodMode = "day" | "week" | "month" | "year" | "custom";
export type Bucket = "day" | "week" | "month";

export interface CustomRange {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD, inclusive
}

export interface Period {
  mode: PeriodMode;
  from: Date;
  to: Date;
  days: number;
  label: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseYmd = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
export const startOfWeek = (d: Date) => addDays(startOfDay(d), -((d.getDay() + 6) % 7));

const monthShort = (d: Date) => d.toLocaleDateString("pl-PL", { month: "short" }).replace(".", "");

const upperFirst = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function labelFor(mode: PeriodMode, from: Date, to: Date): string {
  const last = addDays(to, -1);
  if (mode === "year") return String(from.getFullYear());
  if (mode === "day") {
    return upperFirst(from.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
  }
  if (mode === "month") return upperFirst(from.toLocaleDateString("pl-PL", { month: "long", year: "numeric" }));
  if (mode === "week" && from.getMonth() === last.getMonth()) {
    return `${from.getDate()}–${last.getDate()} ${monthShort(from)} ${from.getFullYear()}`;
  }
  if (mode === "week" && from.getFullYear() === last.getFullYear()) {
    return `${from.getDate()} ${monthShort(from)} – ${last.getDate()} ${monthShort(last)} ${last.getFullYear()}`;
  }
  return `${from.toLocaleDateString("pl-PL")} – ${last.toLocaleDateString("pl-PL")}`;
}

export function periodFor(mode: PeriodMode, anchor: Date, custom?: CustomRange): Period {
  let from: Date;
  let to: Date;
  if (mode === "day") {
    from = startOfDay(anchor);
    to = addDays(from, 1);
  } else if (mode === "week") {
    from = startOfWeek(anchor);
    to = addDays(from, 7);
  } else if (mode === "month") {
    from = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    to = addMonths(from, 1);
  } else if (mode === "year") {
    from = new Date(anchor.getFullYear(), 0, 1);
    to = new Date(anchor.getFullYear() + 1, 0, 1);
  } else {
    from = parseYmd(custom?.from ?? ymd(anchor));
    to = addDays(parseYmd(custom?.to ?? ymd(anchor)), 1);
    if (to <= from) to = addDays(from, 1);
  }
  const days = Math.round((to.getTime() - from.getTime()) / 86_400_000);
  return { mode, from, to, days, label: labelFor(mode, from, to) };
}

// The period right before this one, for the comparison.
export function previousPeriod(p: Period): Period {
  if (p.mode === "custom") {
    const from = addDays(p.from, -p.days);
    return periodFor("custom", from, { from: ymd(from), to: ymd(addDays(p.from, -1)) });
  }
  const anchor =
    p.mode === "day"
      ? addDays(p.from, -1)
      : p.mode === "week"
        ? addDays(p.from, -7)
        : p.mode === "month"
          ? addMonths(p.from, -1)
          : new Date(p.from.getFullYear() - 1, 0, 1);
  return periodFor(p.mode, anchor);
}

export const PREVIOUS_LABEL: Record<PeriodMode, string> = {
  day: "wczoraj",
  week: "poprzedni tydzień",
  month: "poprzedni miesiąc",
  year: "poprzedni rok",
  custom: "poprzedni okres",
};

// Moves the anchor (or the custom range) one period back or forward.
export function shift(mode: PeriodMode, anchor: Date, custom: CustomRange, dir: -1 | 1) {
  if (mode === "day") return { anchor: addDays(anchor, dir), custom };
  if (mode === "week") return { anchor: addDays(anchor, 7 * dir), custom };
  if (mode === "month") return { anchor: addMonths(anchor, dir), custom };
  if (mode === "year") return { anchor: new Date(anchor.getFullYear() + dir, 0, 1), custom };
  const p = periodFor("custom", anchor, custom);
  const from = addDays(p.from, p.days * dir);
  return { anchor, custom: { from: ymd(from), to: ymd(addDays(from, p.days - 1)) } };
}

export const isCurrentOrFuture = (p: Period) => p.to.getTime() > Date.now();

export function bucketFor(p: Period): Bucket {
  if (p.mode === "year") return "month";
  if (p.mode === "day" || p.mode === "week" || p.mode === "month") return "day";
  return p.days <= 62 ? "day" : p.days <= 183 ? "week" : "month";
}

// Keys (YYYY-MM-DD of each bucket start) covering the period, so the chart
// shows empty days too. They match the keys the database produces.
export function bucketKeys(p: Period, bucket: Bucket): string[] {
  const keys: string[] = [];
  if (bucket === "day") {
    for (let d = p.from; d < p.to; d = addDays(d, 1)) keys.push(ymd(d));
  } else if (bucket === "week") {
    for (let d = startOfWeek(p.from); d < p.to; d = addDays(d, 7)) keys.push(ymd(d));
  } else {
    for (let d = new Date(p.from.getFullYear(), p.from.getMonth(), 1); d < p.to; d = addMonths(d, 1)) keys.push(ymd(d));
  }
  return keys;
}

export function bucketLabel(key: string, bucket: Bucket): string {
  const d = parseYmd(key);
  if (bucket === "month") return monthShort(d);
  return `${d.getDate()}.${pad(d.getMonth() + 1)}`;
}

export function bucketTitle(key: string, bucket: Bucket): string {
  const d = parseYmd(key);
  if (bucket === "month") return d.toLocaleDateString("pl-PL", { month: "long", year: "numeric" });
  if (bucket === "week") return `tydzień od ${d.toLocaleDateString("pl-PL")}`;
  return d.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" });
}
