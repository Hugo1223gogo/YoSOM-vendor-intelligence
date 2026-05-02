// Lightweight, deterministic scoring helpers used by the dashboard,
// forecast, and brief. Pure TypeScript — no external calls.

import type { AggregatedStudentData } from "@/lib/aggregate-student-data";

/**
 * Student Satisfaction Pulse: 0..100. Higher = more positive.
 * Blends three signals:
 *  - Reaction sentiment (up/mid/down ratio)
 *  - Net vote ratio (positive votes vs all votes)
 *  - Free-text density / coverage (proxy for "felt heard")
 */
export function satisfactionPulse(data: AggregatedStudentData): {
  score: number;
  trend: "up" | "flat" | "down";
  components: { reactions: number; votes: number; engagement: number };
} {
  const reactionTotals = data.reactionSummary.reduce(
    (acc, r) => {
      acc.up += r.up;
      acc.mid += r.mid;
      acc.down += r.down;
      return acc;
    },
    { up: 0, mid: 0, down: 0 },
  );
  const reactionCount = reactionTotals.up + reactionTotals.mid + reactionTotals.down;
  const reactionScore =
    reactionCount === 0
      ? 60
      : Math.round(
          ((reactionTotals.up * 100 + reactionTotals.mid * 50) / reactionCount) *
            10,
        ) / 10;

  const totalVotes = data.voteRankings.reduce(
    (s, v) => s + Math.abs(v.netVotes),
    0,
  );
  const positiveVotes = data.voteRankings.reduce(
    (s, v) => s + Math.max(0, v.netVotes),
    0,
  );
  const voteScore =
    totalVotes === 0 ? 60 : Math.round((positiveVotes / totalVotes) * 1000) / 10;

  // Engagement: more sessions + more free-text = more "heard"
  const engagementScore = Math.min(
    100,
    Math.round(
      data.totalSessions * 1.5 +
        data.freeTextSamples.length * 2 +
        data.topTags.length * 1.2,
    ),
  );

  const score = Math.round(
    reactionScore * 0.5 + voteScore * 0.3 + engagementScore * 0.2,
  );

  // Trend is mocked vs. an assumed baseline of 70 — replace with rolling
  // history once we have multiple weeks of data.
  const baseline = 70;
  const trend: "up" | "flat" | "down" =
    score - baseline > 4 ? "up" : score - baseline < -4 ? "down" : "flat";

  return {
    score: Math.max(0, Math.min(100, score)),
    trend,
    components: {
      reactions: Math.round(reactionScore),
      votes: Math.round(voteScore),
      engagement: engagementScore,
    },
  };
}

/**
 * Cluster preference counts into broad demand categories that the forecast
 * and brief both use. Each category gets a weight 0..1.
 */
export function demandByCategory(
  data: AggregatedStudentData,
): { category: string; weight: number; rawCount: number }[] {
  const allCategories = {
    ...data.flavorCounts,
    ...data.proteinCounts,
    ...data.cuisineCounts,
  };
  const total = Object.values(allCategories).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(allCategories)
    .map(([category, count]) => ({
      category,
      rawCount: count,
      weight: Math.round((count / total) * 1000) / 1000,
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 12);
}

/** Net positive % for the venue's top voted items. */
export function topVotedItems(
  data: AggregatedStudentData,
  limit = 5,
): { itemName: string; netVotes: number; share: number }[] {
  const totalAbs = data.voteRankings.reduce(
    (s, v) => s + Math.abs(v.netVotes),
    0,
  );
  return data.voteRankings.slice(0, limit).map((v) => ({
    itemName: v.itemName,
    netVotes: v.netVotes,
    share: totalAbs === 0 ? 0 : Math.round((v.netVotes / totalAbs) * 100),
  }));
}

/**
 * Compute survey-driven demand multiplier from net vote sentiment.
 * Returns a number around 1 (e.g. 1.08 = +8%, 0.94 = -6%).
 */
export function surveyDemandMultiplier(data: AggregatedStudentData): number {
  if (data.voteRankings.length === 0) return 1;
  const totalAbs = data.voteRankings.reduce(
    (s, v) => s + Math.abs(v.netVotes),
    0,
  );
  if (totalAbs === 0) return 1;
  const net = data.voteRankings.reduce((s, v) => s + v.netVotes, 0);
  // Map net/total in [-1, 1] to multiplier in [0.85, 1.15]
  const ratio = net / totalAbs;
  return 1 + ratio * 0.15;
}

/** Crude word-frequency map from free-text and tags, for the word cloud. */
export function tagFrequency(
  data: AggregatedStudentData,
): { tag: string; count: number }[] {
  const merged = new Map<string, number>();
  for (const t of data.topTags) {
    merged.set(t.tag, (merged.get(t.tag) ?? 0) + t.count);
  }
  for (const text of data.freeTextSamples) {
    const words = text
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w));
    for (const w of words) merged.set(w, (merged.get(w) ?? 0) + 1);
  }
  return Array.from(merged.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);
}

const STOPWORDS = new Set([
  "with",
  "from",
  "want",
  "need",
  "more",
  "less",
  "this",
  "that",
  "have",
  "would",
  "could",
  "some",
  "like",
  "good",
  "great",
  "really",
  "very",
  "just",
  "the",
  "and",
  "for",
  "is",
  "to",
  "of",
  "a",
  "an",
]);
