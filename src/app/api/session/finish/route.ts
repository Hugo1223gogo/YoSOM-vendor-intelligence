import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionId } from "@/lib/session";
import { getAnthropicClient } from "@/lib/anthropic";
import Session from "@/models/Session";
import DeepTalk from "@/models/DeepTalk";

export async function POST() {
  await connectDB();
  const sessionId = getSessionId();

  await Session.findOneAndUpdate(
    { sessionId },
    { completedStage: "final", finishedAt: new Date() }
  );

  // Background tag extraction for deep talk sessions
  const deepTalk = await DeepTalk.findOne({ sessionId });
  if (deepTalk && deepTalk.transcript.length > 0) {
    extractTags(deepTalk).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}

async function extractTags(deepTalk: InstanceType<typeof DeepTalk>) {
  const anthropic = getAnthropicClient();
  const transcript = deepTalk.transcript
    .map((t: { role: string; text: string }) => `${t.role}: ${t.text}`)
    .join("\n");

  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5-20241022",
    max_tokens: 200,
    system:
      'Extract food preference tags from this conversation. Return JSON array of lowercase strings, max 8 items. Examples: ["spicy", "vegan", "late-night", "asian"].',
    messages: [{ role: "user", content: transcript }],
  });

  const text = res.content[0].type === "text" ? res.content[0].text : "[]";
  try {
    deepTalk.extractedTags = JSON.parse(text);
    await deepTalk.save();
  } catch {
    // ignore parse failures
  }
}
