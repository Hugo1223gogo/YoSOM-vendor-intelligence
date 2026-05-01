import Vote from "@/models/Vote";
import Reaction from "@/models/Reaction";
import Preference from "@/models/Preference";
import DeepTalk from "@/models/DeepTalk";
import MenuItem from "@/models/MenuItem";
import Session from "@/models/Session";

export interface AggregatedStudentData {
  venue: string;
  dateRange: { from: Date; to: Date };
  totalSessions: number;
  voteRankings: { itemId: string; itemName: string; netVotes: number }[];
  reactionSummary: { itemId: string; up: number; mid: number; down: number }[];
  flavorCounts: Record<string, number>;
  proteinCounts: Record<string, number>;
  dietaryCounts: Record<string, number>;
  cuisineCounts: Record<string, number>;
  topTags: { tag: string; count: number }[];
  freeTextSamples: string[];
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setHours(0, 0, 0, 0);
  date.setDate(diff);
  return date;
}

export async function aggregateStudentData(
  venue: "charleys" | "mcnay",
  weeksBack = 1
): Promise<AggregatedStudentData> {
  const now = new Date();
  const currentMonday = getMonday(now);
  const from = new Date(currentMonday);
  from.setDate(from.getDate() - (weeksBack - 1) * 7);
  const to = new Date(currentMonday);
  to.setDate(to.getDate() + 7);

  const dateFilter = { $gte: from, $lt: to };

  const [
    voteAgg,
    reactionAgg,
    flavorAgg,
    proteinAgg,
    dietaryAgg,
    cuisineAgg,
    tagAgg,
    freeTexts,
    menuItems,
    sessionCount,
  ] = await Promise.all([
    Vote.aggregate([
      { $match: { venue, createdAt: dateFilter } },
      { $group: { _id: "$itemId", netVotes: { $sum: "$value" } } },
      { $sort: { netVotes: -1 } },
    ]),
    Reaction.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: "$itemId",
          up: { $sum: { $cond: [{ $eq: ["$value", "up"] }, 1, 0] } },
          mid: { $sum: { $cond: [{ $eq: ["$value", "mid"] }, 1, 0] } },
          down: { $sum: { $cond: [{ $eq: ["$value", "down"] }, 1, 0] } },
        },
      },
    ]),
    Preference.aggregate([
      { $match: { createdAt: dateFilter } },
      { $unwind: "$flavors" },
      { $group: { _id: "$flavors", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Preference.aggregate([
      { $match: { createdAt: dateFilter } },
      { $unwind: "$proteins" },
      { $group: { _id: "$proteins", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Preference.aggregate([
      { $match: { createdAt: dateFilter } },
      { $unwind: "$dietary" },
      { $group: { _id: "$dietary", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Preference.aggregate([
      { $match: { createdAt: dateFilter } },
      { $unwind: "$cuisines" },
      { $group: { _id: "$cuisines", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    DeepTalk.aggregate([
      { $match: { createdAt: dateFilter, extractedTags: { $exists: true, $ne: [] } } },
      { $unwind: "$extractedTags" },
      { $group: { _id: "$extractedTags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),
    Preference.find({ createdAt: dateFilter, freeText: { $exists: true, $ne: "" } })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("freeText")
      .lean(),
    MenuItem.find({ venue, weekOf: { $gte: from } }).lean(),
    Session.countDocuments({ finishedAt: dateFilter }),
  ]);

  const itemNameMap = Object.fromEntries(
    menuItems.map((i) => [i.itemId, i.name])
  );

  const toRecord = (agg: { _id: string; count: number }[]) =>
    Object.fromEntries(agg.map((a) => [a._id, a.count]));

  return {
    venue,
    dateRange: { from, to },
    totalSessions: sessionCount,
    voteRankings: voteAgg.map((v) => ({
      itemId: v._id,
      itemName: itemNameMap[v._id] || v._id,
      netVotes: v.netVotes,
    })),
    reactionSummary: reactionAgg.map((r) => ({
      itemId: r._id,
      up: r.up,
      mid: r.mid,
      down: r.down,
    })),
    flavorCounts: toRecord(flavorAgg),
    proteinCounts: toRecord(proteinAgg),
    dietaryCounts: toRecord(dietaryAgg),
    cuisineCounts: toRecord(cuisineAgg),
    topTags: tagAgg.map((t) => ({ tag: t._id, count: t.count })),
    freeTextSamples: freeTexts
      .map((f) => (f as { freeText: string }).freeText)
      .filter(Boolean)
      .map((t) => t.slice(0, 100)),
  };
}
