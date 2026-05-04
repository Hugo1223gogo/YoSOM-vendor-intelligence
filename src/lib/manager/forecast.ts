// 3-way demand forecast: survey signal × event modifier × exchange modifier.
//
// We project servings per day for the next 7 days. The baseline comes
// from the menu cost table (sum of baselineDailyServings for the venue).
// In production this baseline would come from POS data.

import { aggregateStudentData } from "@/lib/aggregate-student-data";
import type { Venue, ForecastDay, ForecastResult } from "@/lib/manager/types";
import { CAMPUS_EVENTS, eventsOnDate } from "@/data/manager/events";
import { exchangeMultiplier, exchangeWeekOf } from "@/data/manager/exchange-weeks";
import { costsForVenue } from "@/data/manager/menu-costs";
import { surveyDemandMultiplier, demandByCategory } from "@/lib/manager/scoring";

const DAY_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function buildForecast(
  venue: Venue,
  daysAhead = 7,
): Promise<ForecastResult> {
  const data = await aggregateStudentData(venue, 1);
  const baselineServings = costsForVenue(venue).reduce(
    (s, i) => s + i.baselineDailyServings,
    0,
  );
  const surveyMul = surveyDemandMultiplier(data);
  const cats = demandByCategory(data).slice(0, 5);
  const surveySignal = Math.max(-1, Math.min(1, (surveyMul - 1) / 0.15));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: ForecastDay[] = [];
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    // Charley's and McNay are closed on weekends — no demand to forecast.
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    const date = isoDate(d);
    const events = eventsOnDate(date, venue);
    const eventMul =
      events.length === 0
        ? 1
        : events.reduce((m, e) => m * e.demandMultiplier, 1);
    const exMul = exchangeMultiplier(date);

    const predicted = Math.round(baselineServings * surveyMul * eventMul * exMul);
    // Confidence band ±12% for high, ±20% medium, ±30% low based on input volume
    const inputVolume = data.totalSessions;
    const conf: "high" | "medium" | "low" =
      inputVolume >= 20 ? "high" : inputVolume >= 10 ? "medium" : "low";
    const band = conf === "high" ? 0.12 : conf === "medium" ? 0.2 : 0.3;

    days.push({
      date,
      dayOfWeek: DAY_OF_WEEK[d.getDay()],
      predictedServings: predicted,
      low: Math.round(predicted * (1 - band)),
      high: Math.round(predicted * (1 + band)),
      confidence: conf,
      drivers: {
        surveySignal: Math.round(surveySignal * 100) / 100,
        eventModifier: Math.round(eventMul * 100) / 100,
        exchangeModifier: Math.round(exMul * 100) / 100,
      },
      topRequestedCategories: cats.map((c) => ({
        category: c.category,
        weight: c.weight,
      })),
    });
  }

  const predictedTotal = days.reduce((s, d) => s + d.predictedServings, 0);
  const baselineTotal = baselineServings * days.length;
  const delta = predictedTotal - baselineTotal;

  return {
    venue,
    generatedAt: new Date().toISOString(),
    days,
    weeklyTotals: {
      predictedServings: predictedTotal,
      baselineServings: baselineTotal,
      delta,
      deltaPct:
        baselineTotal === 0
          ? 0
          : Math.round((delta / baselineTotal) * 1000) / 10,
    },
  };
}

/** Surface the events + exchange weeks relevant to the forecast horizon. */
export function activeContext(daysAhead = 7) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today);
  horizon.setDate(today.getDate() + daysAhead);

  const events = CAMPUS_EVENTS.filter((e) => {
    const d = new Date(e.date);
    return d >= today && d <= horizon;
  });
  const seenWeeks = new Set<string>();
  const exchanges = [];
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const w = exchangeWeekOf(isoDate(d));
    if (w && !seenWeeks.has(w.weekOf)) {
      seenWeeks.add(w.weekOf);
      exchanges.push(w);
    }
  }
  return { events, exchanges };
}
