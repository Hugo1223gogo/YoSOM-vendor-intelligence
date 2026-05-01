import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionId } from "@/lib/session";
import { getAnthropicClient } from "@/lib/anthropic";
import Session from "@/models/Session";
import DeepTalk from "@/models/DeepTalk";
import Preference from "@/models/Preference";

export async function POST() {
  await connectDB();
  const sessionId = getSessionId();

  await Session.findOneAndUpdate(
    { sessionId },
    { completedStage: "final", finishedAt: new Date() }
  );

  const [deepTalk, preference] = await Promise.all([
    DeepTalk.findOne({ sessionId }),
    Preference.findOne({ sessionId }).lean(),
  ]);

  if (deepTalk && deepTalk.transcript.length > 0) {
    extractTags(deepTalk, preference).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}

async function extractTags(
  deepTalk: InstanceType<typeof DeepTalk>,
  preference: Record<string, unknown> | null
) {
  const anthropic = getAnthropicClient();
  let input = deepTalk.transcript
    .map((t: { role: string; text: string }) => `${t.role}: ${t.text}`)
    .join("\n");

  if (preference) {
    const pref = preference as {
      flavors?: string[];
      proteins?: string[];
      dietary?: string[];
      cuisines?: string[];
      freeText?: string;
    };
    const parts = [
      pref.flavors?.length && `Flavors: ${pref.flavors.join(", ")}`,
      pref.proteins?.length && `Proteins: ${pref.proteins.join(", ")}`,
      pref.dietary?.length && `Dietary: ${pref.dietary.join(", ")}`,
      pref.cuisines?.length && `Cuisines: ${pref.cuisines.join(", ")}`,
      pref.freeText && `Comment: ${pref.freeText}`,
    ].filter(Boolean);
    if (parts.length > 0) {
      input += `\n\nStructured preferences:\n${parts.join("\n")}`;
    }
  }

  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    system:
      'Extract food preference tags from this conversation and structured preferences. Return JSON array of lowercase strings, max 8 items. Examples: ["spicy", "vegan", "late-night", "asian"].',
    messages: [{ role: "user", content: input }],
  });

  const text = res.content[0].type === "text" ? res.content[0].text : "[]";
  try {
    deepTalk.extractedTags = JSON.parse(text);
    await deepTalk.save();
  } catch {
    // ignore parse failures
  }
}
