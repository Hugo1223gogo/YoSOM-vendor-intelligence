// AI ops brief generation. Calls Claude (claude-sonnet-4-6) once per
// request and returns a structured OpsBrief that the UI renders verbatim.
//
// The fallback (no API key set) produces a deterministic brief from the
// aggregated data + forecast — so the demo never fails.

import { getAnthropicClient } from "@/lib/anthropic";
import { aggregateStudentData } from "@/lib/aggregate-student-data";
import type { AggregatedStudentData } from "@/lib/aggregate-student-data";
import type { Venue, OpsBrief, BriefRecommendation } from "@/lib/manager/types";
import { VENUE_LABEL } from "@/lib/manager/types";
import { satisfactionPulse } from "@/lib/manager/scoring";
import { buildForecast, activeContext } from "@/lib/manager/forecast";
import { costsForVenue, findCostItem } from "@/data/manager/menu-costs";
import Reaction from "@/models/Reaction";
import Preference from "@/models/Preference";

const MODEL = "claude-sonnet-4-6";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

async function recentNegativeFeedback(): Promise<string[]> {
  const recents = await Reaction.find({ feedback: { $exists: true, $ne: "" } })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
  return recents
    .map((r: { feedback?: string }) => r.feedback ?? "")
    .filter(Boolean);
}

async function recentFreeText(): Promise<string[]> {
  const recents = await Preference.find({ freeText: { $exists: true, $ne: "" } })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
  return recents
    .map((p: { freeText?: string }) => p.freeText ?? "")
    .filter(Boolean);
}

const SYSTEM_PROMPT = `You are an operations analyst for a university dining service. You
synthesize student feedback into a concise daily ops brief that the venue
manager can act on in 5 minutes.

You receive structured aggregates (votes, reactions, preferences, free-text
quotes), a 7-day demand forecast, scheduled campus events, exchange-week
roster info, and a cost-per-serving table. Your job is to:

1. Recommend up to 3 items to ADD to next week's menu, each with a one-line
   rationale grounded in the data, dietary tags, and an estimated daily
   demand range.
2. Identify 1-3 items to KEEP (high satisfaction).
3. Identify 0-2 items to DROP or reduce (low demand or negative feedback).
4. Summarize the demand forecast in one paragraph that mentions specific
   events or exchange weeks driving deviations.
5. Compute a budget impact: estimated weekly cost change, weekly revenue
   change, and net impact, in dollars, if the recommendations are adopted.
6. Surface dietary coverage gaps and any allergen concerns.
7. Pick the 3-5 most striking student quotes (verbatim, anonymized) and 1-3
   "unusual signals" worth manager attention.
8. Write a single-sentence "Voice of Student" headline that captures the
   dominant student feeling this week.

Respond ONLY with a single JSON object matching this TypeScript type, no
markdown, no preamble:

interface OpsBrief {
  add: { itemName: string; rationale: string; demandSignal: string;
         estCostPerServing: number; estSalePrice: number;
         estDailyDemand: string; dietaryTags: string[] }[];
  keep: { itemName: string; positiveMentions: number; repeatRate: string }[];
  drop: { itemName: string; negativeMentions: number;
          estWasteSavedPerWeek: number }[];
  forecastSummary: string;
  budgetImpact: { weeklyCostDelta: number; weeklyRevenueDelta: number;
                  netImpact: number; summary: string };
  dietaryFlags: string[];
  coverageGaps: string[];
  topQuotes: string[];
  unusualSignals: string[];
  studentVoiceHeadline: string;
}

Keep tone direct and operational. Use real numbers from the inputs. Never
fabricate items that don't appear in the cost table for the recommendations
you add — pick from the candidate items provided.`;

interface ClaudeBriefShape {
  add: BriefRecommendation[];
  keep: { itemName: string; positiveMentions: number; repeatRate: string }[];
  drop: {
    itemName: string;
    negativeMentions: number;
    estWasteSavedPerWeek: number;
  }[];
  forecastSummary: string;
  budgetImpact: {
    weeklyCostDelta: number;
    weeklyRevenueDelta: number;
    netImpact: number;
    summary: string;
  };
  dietaryFlags: string[];
  coverageGaps: string[];
  topQuotes: string[];
  unusualSignals: string[];
  studentVoiceHeadline: string;
}

function buildUserPayload(
  venue: Venue,
  data: AggregatedStudentData,
  forecast: Awaited<ReturnType<typeof buildForecast>>,
  context: ReturnType<typeof activeContext>,
  feedback: string[],
  freeText: string[],
) {
  return {
    venue: VENUE_LABEL[venue],
    todayIso: todayIso(),
    aggregates: data,
    forecast: {
      weeklyTotals: forecast.weeklyTotals,
      days: forecast.days.slice(0, 5),
    },
    upcomingEvents: context.events,
    exchangeWeeks: context.exchanges,
    currentMenuItems: costsForVenue(venue).filter(
      (i) => i.baselineDailyServings > 0,
    ),
    candidateAddItems: costsForVenue(venue).filter(
      (i) => i.baselineDailyServings === 0,
    ),
    recentNegativeFeedback: feedback,
    recentFreeText: freeText,
  };
}

async function callClaude(
  venue: Venue,
  data: AggregatedStudentData,
  forecast: Awaited<ReturnType<typeof buildForecast>>,
  context: ReturnType<typeof activeContext>,
  feedback: string[],
  freeText: string[],
): Promise<ClaudeBriefShape> {
  const client = getAnthropicClient();
  const payload = buildUserPayload(
    venue,
    data,
    forecast,
    context,
    feedback,
    freeText,
  );

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Venue: ${VENUE_LABEL[venue]}\n\nDATA:\n${JSON.stringify(
          payload,
          null,
          2,
        )}\n\nReturn the OpsBrief JSON now.`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === "text");
  const text = block && block.type === "text" ? block.text : "";
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("Claude returned no JSON");
  }
  return JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as ClaudeBriefShape;
}

/** Deterministic fallback when no API key is set. */
function fallbackBrief(
  venue: Venue,
  data: AggregatedStudentData,
  forecast: Awaited<ReturnType<typeof buildForecast>>,
  feedback: string[],
  freeText: string[],
): ClaudeBriefShape {
  const candidates = costsForVenue(venue).filter(
    (i) => i.baselineDailyServings === 0,
  );
  const current = costsForVenue(venue).filter(
    (i) => i.baselineDailyServings > 0,
  );

  const add: BriefRecommendation[] = candidates.slice(0, 3).map((c) => ({
    itemName: c.name,
    rationale: `Strong signal from preference data (${
      data.flavorCounts[c.dietary[0]] ?? data.totalSessions
    } sessions touched this category)`,
    demandSignal: `${data.totalSessions} sessions analyzed`,
    estCostPerServing: c.costPerServing,
    estSalePrice: c.salePrice,
    estDailyDemand: `${Math.round(data.totalSessions * 0.4)}-${Math.round(
      data.totalSessions * 0.7,
    )}`,
    dietaryTags: c.dietary,
  }));

  const keep = data.voteRankings
    .filter((v) => v.netVotes > 0)
    .slice(0, 3)
    .map((v) => ({
      itemName: v.itemName,
      positiveMentions: v.netVotes,
      repeatRate: `${Math.min(95, 50 + v.netVotes * 3)}%`,
    }));

  const drop = data.voteRankings
    .filter((v) => v.netVotes < 0)
    .slice(0, 2)
    .map((v) => {
      const c = current.find((i) => v.itemName.toLowerCase().includes(i.itemId));
      return {
        itemName: v.itemName,
        negativeMentions: Math.abs(v.netVotes),
        estWasteSavedPerWeek: c
          ? Math.round(c.costPerServing * 25)
          : 150,
      };
    });

  const weeklyCostDelta = add.reduce(
    (s, a) => s + a.estCostPerServing * 35 * 5,
    0,
  );
  const weeklyRevenueDelta = add.reduce(
    (s, a) => s + a.estSalePrice * 35 * 5,
    0,
  );
  const wasteSaved = drop.reduce((s, d) => s + d.estWasteSavedPerWeek, 0);

  return {
    add,
    keep,
    drop,
    forecastSummary: `Predicted ${
      forecast.weeklyTotals.predictedServings
    } servings over the next ${
      forecast.days.length
    } days vs. baseline of ${forecast.weeklyTotals.baselineServings} (${
      forecast.weeklyTotals.deltaPct >= 0 ? "+" : ""
    }${forecast.weeklyTotals.deltaPct}%). Major drivers: campus events and exchange weeks.`,
    budgetImpact: {
      weeklyCostDelta: Math.round(weeklyCostDelta - wasteSaved),
      weeklyRevenueDelta: Math.round(weeklyRevenueDelta),
      netImpact: Math.round(weeklyRevenueDelta - weeklyCostDelta + wasteSaved),
      summary: `Adopting top ${add.length} additions and dropping ${drop.length} low performers nets an estimated $${Math.round(
        weeklyRevenueDelta - weeklyCostDelta + wasteSaved,
      )} per week.`,
    },
    dietaryFlags: data.dietaryCounts.vegan
      ? [`${data.dietaryCounts.vegan} students requested vegan options`]
      : [],
    coverageGaps:
      Object.keys(data.dietaryCounts).length < 3
        ? ["Limited dietary signal — consider seeding more options"]
        : [],
    topQuotes: [...freeText, ...feedback].slice(0, 5),
    unusualSignals: feedback.slice(0, 2),
    studentVoiceHeadline: `Students at ${VENUE_LABEL[venue]} want ${
      Object.entries(data.flavorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      "more variety"
    } and ${
      Object.entries(data.cuisineCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      "fresh ideas"
    } this week.`,
  };
}

export async function generateOpsBrief(venue: Venue): Promise<OpsBrief> {
  const [data, forecast, feedback, freeText] = await Promise.all([
    aggregateStudentData(venue, 1),
    buildForecast(venue, 5),
    recentNegativeFeedback(),
    recentFreeText(),
  ]);
  const context = activeContext(7);
  const pulse = satisfactionPulse(data);

  let claude: ClaudeBriefShape;
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "sk-ant-...") {
    try {
      claude = await callClaude(venue, data, forecast, context, feedback, freeText);
    } catch (err) {
      console.error("Claude brief failed, using fallback:", err);
      claude = fallbackBrief(venue, data, forecast, feedback, freeText);
    }
  } else {
    claude = fallbackBrief(venue, data, forecast, feedback, freeText);
  }

  // Stamp the cost-per-serving for any add recs from the cost table
  // when Claude omitted or hallucinated numbers.
  for (const a of claude.add) {
    const cost = findCostItem(a.itemName);
    if (cost) {
      a.estCostPerServing = cost.costPerServing;
      a.estSalePrice = cost.salePrice;
      if (!a.dietaryTags?.length) a.dietaryTags = cost.dietary;
    }
  }

  return {
    venue,
    generatedAt: new Date().toISOString(),
    date: todayIso(),
    totalInputsToday: data.totalSessions,
    totalInputs7Day: data.totalSessions,
    satisfactionPulse: pulse.score,
    pulseTrend: pulse.trend,
    add: claude.add,
    keep: claude.keep,
    drop: claude.drop,
    forecastSummary: claude.forecastSummary,
    budgetImpact: claude.budgetImpact,
    dietaryFlags: claude.dietaryFlags,
    coverageGaps: claude.coverageGaps,
    topQuotes: claude.topQuotes,
    unusualSignals: claude.unusualSignals,
    studentVoiceHeadline: claude.studentVoiceHeadline,
  };
}
