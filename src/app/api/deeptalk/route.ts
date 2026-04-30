import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionId } from "@/lib/session";
import { getAnthropicClient } from "@/lib/anthropic";
import { rateLimit } from "@/lib/rate-limit";
import DeepTalk from "@/models/DeepTalk";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { message } = await req.json();
  if (!message || typeof message !== "string" || message.length > 500) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  await connectDB();
  const sessionId = getSessionId();
  const anthropic = getAnthropicClient();

  // Step 1: Classify intent
  const classifyRes = await anthropic.messages.create({
    model: "claude-haiku-4-5-20241022",
    max_tokens: 50,
    system:
      'You classify a single user message as "food_input", "off_topic", or "done". Reply with JSON: {"intent": "..."}. No prose.',
    messages: [{ role: "user", content: message }],
  });

  const classifyText =
    classifyRes.content[0].type === "text" ? classifyRes.content[0].text : "";
  let intent = "off_topic";
  try {
    intent = JSON.parse(classifyText).intent;
  } catch {
    // default to off_topic on parse failure
  }

  if (intent === "off_topic") {
    return NextResponse.json({
      reply:
        "Ha — I hear you, but I can only help with food at SOM 🍽️ What would actually hit the spot for lunch this week?",
      intent: "off_topic",
    });
  }

  // Step 2: Get or create DeepTalk document
  let deepTalk = await DeepTalk.findOne({ sessionId });
  if (!deepTalk) {
    deepTalk = await DeepTalk.create({
      sessionId,
      transcript: [],
      extractedTags: [],
    });
  }

  // Append user message
  deepTalk.transcript.push({ role: "user", text: message, ts: new Date() });

  // Step 3: Generate conversational reply
  const recentTurns = deepTalk.transcript.slice(-6).map((t: { role: string; text: string }) => ({
    role: t.role as "user" | "assistant",
    content: t.text,
  }));

  const replyRes = await anthropic.messages.create({
    model: "claude-haiku-4-5-20241022",
    max_tokens: 200,
    system:
      "You are YoSOM, a friendly food-feedback chatbot for Yale SOM dining. Ask ONE short follow-up question about food preferences. Be warm, casual, ≤25 words. Use 1 emoji max. Never go off-topic.",
    messages: recentTurns,
  });

  const reply =
    replyRes.content[0].type === "text" ? replyRes.content[0].text : "";

  deepTalk.transcript.push({ role: "assistant", text: reply, ts: new Date() });
  await deepTalk.save();

  const turnCount = deepTalk.transcript.filter(
    (t: { role: string }) => t.role === "user"
  ).length;

  return NextResponse.json({
    reply,
    intent: "food_input",
    turnCount,
    done: intent === "done" || turnCount >= 3,
  });
}
