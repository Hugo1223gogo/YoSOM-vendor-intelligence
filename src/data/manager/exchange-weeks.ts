// Students away on exchange or international study trips.
// Each entry covers one Monday-anchored week.
// SOM total enrollment used here as a placeholder: ~700 MBA + EMBA.

import type { ExchangeWeek } from "@/lib/manager/types";

export const SOM_TOTAL_BODY = 700;

export const EXCHANGE_WEEKS: ExchangeWeek[] = [
  {
    weekOf: "2026-04-27",
    programName: "SOM × Tsinghua exchange",
    studentsAway: 28,
    totalSomBody: SOM_TOTAL_BODY,
  },
  {
    weekOf: "2026-05-04",
    programName: "HEC Paris exchange + London study trek",
    studentsAway: 46,
    totalSomBody: SOM_TOTAL_BODY,
  },
  {
    weekOf: "2026-05-11",
    programName: "LBS exchange + Tokyo IXP",
    studentsAway: 62,
    totalSomBody: SOM_TOTAL_BODY,
  },
  {
    weekOf: "2026-05-18",
    programName: "End of term — partial dispersion",
    studentsAway: 95,
    totalSomBody: SOM_TOTAL_BODY,
  },
];

export function exchangeWeekOf(isoDate: string): ExchangeWeek | null {
  const d = new Date(isoDate);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  const key = monday.toISOString().slice(0, 10);
  return EXCHANGE_WEEKS.find((w) => w.weekOf === key) ?? null;
}

export function exchangeMultiplier(isoDate: string): number {
  const w = exchangeWeekOf(isoDate);
  if (!w) return 1;
  return 1 - w.studentsAway / w.totalSomBody;
}
