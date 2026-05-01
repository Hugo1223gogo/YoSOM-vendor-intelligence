import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAnthropicClient } from "@/lib/anthropic";
import {
  aggregateStudentData,
  type AggregatedStudentData,
} from "@/lib/aggregate-student-data";

function formatCounts(counts: Record<string, number>): string {
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
}

function buildPrompt(data: AggregatedStudentData, count: number): string {
  const venueName = data.venue === "charleys" ? "Charley's" : "McNay Cafe";

  let prompt = `You are a menu planning assistant for ${venueName} at Yale School of Management.\n\n`;
  prompt += `## Student Input Summary (${data.totalSessions} students)\n\n`;

  if (data.voteRankings.length > 0) {
    prompt += `### Vote Rankings (current menu items):\n`;
    data.voteRankings.forEach((v) => {
      prompt += `- ${v.itemName}: ${v.netVotes} net votes\n`;
    });
    prompt += "\n";
  }

  if (data.reactionSummary.length > 0) {
    prompt += `### Satisfaction with Current Items:\n`;
    data.reactionSummary.forEach((r) => {
      prompt += `- ${r.itemId}: 👍${r.up} 😐${r.mid} 👎${r.down}\n`;
    });
    prompt += "\n";
  }

  if (Object.keys(data.flavorCounts).length > 0) {
    prompt += `### Flavor Preferences:\n${formatCounts(data.flavorCounts)}\n\n`;
  }
  if (Object.keys(data.proteinCounts).length > 0) {
    prompt += `### Protein Preferences:\n${formatCounts(data.proteinCounts)}\n\n`;
  }
  if (Object.keys(data.dietaryCounts).length > 0) {
    prompt += `### Dietary Requirements:\n${formatCounts(data.dietaryCounts)}\n\n`;
  }
  if (Object.keys(data.cuisineCounts).length > 0) {
    prompt += `### Cuisine Preferences:\n${formatCounts(data.cuisineCounts)}\n\n`;
  }

  if (data.topTags.length > 0) {
    prompt += `### Extracted Tags from Conversations:\n`;
    prompt += data.topTags.map((t) => `${t.tag} (${t.count})`).join(", ");
    prompt += "\n\n";
  }

  if (data.freeTextSamples.length > 0) {
    prompt += `### Student Comments:\n`;
    data.freeTextSamples.forEach((t) => {
      prompt += `- "${t}"\n`;
    });
    prompt += "\n";
  }

  prompt += `## Task\nRecommend ${count} specific dishes for next week's menu at ${venueName}.\n`;
  prompt += `For each dish, provide:\n`;
  prompt += `1. Dish name and brief description\n`;
  prompt += `2. Estimated price point ($7-12 range)\n`;
  prompt += `3. Tags (dietary info)\n`;
  prompt += `4. Confidence score (high/medium/low)\n`;
  prompt += `5. Reasoning: which specific student data points support this\n\n`;
  prompt += `Also provide:\n`;
  prompt += `- 1-2 dishes to consider REMOVING or REPLACING (based on low votes or negative reactions)\n`;
  prompt += `- Any emerging trends you notice\n\n`;
  prompt += `Respond ONLY with valid JSON matching this structure:\n`;
  prompt += `{"recommendations":[{"rank":1,"name":"...","description":"...","estimatedPrice":9.50,"tags":["..."],"confidence":"high","reasoning":"..."}],"removals":[{"name":"...","reason":"..."}],"trends":["..."]}\n`;

  return prompt;
}

export async function GET(req: NextRequest) {
  const staffKey = req.headers.get("x-staff-key");
  if (!process.env.STAFF_API_KEY || staffKey !== process.env.STAFF_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const venue = req.nextUrl.searchParams.get("venue") as
    | "charleys"
    | "mcnay"
    | null;
  if (!venue || !["charleys", "mcnay"].includes(venue)) {
    return NextResponse.json({ error: "Invalid venue" }, { status: 400 });
  }

  const weeks = Math.min(
    4,
    Math.max(1, parseInt(req.nextUrl.searchParams.get("weeks") || "1"))
  );
  const count = Math.min(
    10,
    Math.max(1, parseInt(req.nextUrl.searchParams.get("count") || "5"))
  );

  await connectDB();

  const data = await aggregateStudentData(venue, weeks);

  if (data.totalSessions < 3) {
    return NextResponse.json({
      venue,
      totalStudentInputs: data.totalSessions,
      message: `Not enough data — only ${data.totalSessions} students provided input. Need at least 3.`,
      recommendations: [],
      removals: [],
      trends: [],
    });
  }

  const anthropic = getAnthropicClient();
  const prompt = buildPrompt(data, count);

  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1500,
    system:
      "You are a data-driven menu planning assistant. Respond ONLY with valid JSON. No markdown, no prose outside JSON.",
    messages: [{ role: "user", content: prompt }],
  });

  let text = res.content[0].type === "text" ? res.content[0].text : "{}";
  text = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");

  try {
    const parsed = JSON.parse(text);
    return NextResponse.json({
      venue,
      weekRange: {
        from: data.dateRange.from.toISOString().slice(0, 10),
        to: data.dateRange.to.toISOString().slice(0, 10),
      },
      totalStudentInputs: data.totalSessions,
      ...parsed,
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response", raw: text },
      { status: 500 }
    );
  }
}
