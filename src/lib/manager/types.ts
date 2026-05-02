// Types shared across the manager (vendor-side) app.

export type Venue = "charleys" | "mcnay";

export const VENUE_LABEL: Record<Venue, string> = {
  charleys: "Charley's Place",
  mcnay: "McNay Cafe",
};

export interface CampusEvent {
  date: string; // ISO date (YYYY-MM-DD)
  name: string;
  type:
    | "free-lunch"
    | "speaker"
    | "networking"
    | "club"
    | "career"
    | "ceremony"
    | "info-session";
  attendance: number; // est. headcount
  impactsVenues: Venue[];
  // Demand multiplier for affected venue(s) at lunch (1.0 = neutral, 0.6 = -40%, 1.15 = +15%)
  demandMultiplier: number;
  note?: string;
}

export interface ExchangeWeek {
  weekOf: string; // ISO Monday
  programName: string;
  studentsAway: number;
  totalSomBody: number; // baseline so we can compute %
}

export interface CostItem {
  itemId: string;
  name: string;
  emoji: string;
  category: "main" | "side" | "drink" | "pastry" | "snack";
  costPerServing: number; // $ to make/source
  salePrice: number; // $ student pays
  baselineDailyServings: number; // typical day
  dietary: string[]; // e.g. ["vegan", "gluten-free"]
  venues: Venue[];
}

export interface ForecastDay {
  date: string;
  dayOfWeek: string;
  predictedServings: number;
  low: number;
  high: number;
  confidence: "high" | "medium" | "low";
  drivers: {
    surveySignal: number; // -1 .. +1
    eventModifier: number; // multiplier (e.g. 0.8 for -20%)
    exchangeModifier: number; // multiplier
  };
  topRequestedCategories: { category: string; weight: number }[];
}

export interface ForecastResult {
  venue: Venue;
  generatedAt: string;
  days: ForecastDay[];
  weeklyTotals: {
    predictedServings: number;
    baselineServings: number;
    delta: number;
    deltaPct: number;
  };
}

export interface BriefRecommendation {
  itemName: string;
  rationale: string;
  demandSignal: string;
  estCostPerServing: number;
  estSalePrice: number;
  estDailyDemand: string; // "40-55"
  dietaryTags: string[];
}

export interface OpsBrief {
  venue: Venue;
  generatedAt: string;
  date: string;
  // Header
  totalInputsToday: number;
  totalInputs7Day: number;
  satisfactionPulse: number; // 0..100
  pulseTrend: "up" | "flat" | "down";
  // Section 1
  add: BriefRecommendation[];
  keep: { itemName: string; positiveMentions: number; repeatRate: string }[];
  drop: { itemName: string; negativeMentions: number; estWasteSavedPerWeek: number }[];
  // Section 2 (forecast summary, full forecast lives on its own page)
  forecastSummary: string;
  // Section 3
  budgetImpact: {
    weeklyCostDelta: number;
    weeklyRevenueDelta: number;
    netImpact: number;
    summary: string;
  };
  // Section 4
  dietaryFlags: string[];
  coverageGaps: string[];
  // Section 5
  topQuotes: string[];
  unusualSignals: string[];
  // Voice-of-student headline
  studentVoiceHeadline: string;
}
