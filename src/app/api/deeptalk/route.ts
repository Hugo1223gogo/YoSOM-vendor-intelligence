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
    model: "claude-haiku-4-5-20251001",
    max_tokens: 50,
    system:
      'You classify a single user message in a campus dining chatbot. Reply ONLY with JSON: {"intent":"food_input"} or {"intent":"done"} or {"intent":"off_topic"}.\n\n"food_input": ANY mention of food, drink, ingredient, cuisine, flavor, dietary need, meal, craving, hunger, restaurant, or cooking. Examples: "ramen", "something spicy", "I want chicken", "vegan options", "what\'s good". DEFAULT to this.\n"done": user says they\'re finished ("that\'s all", "done", "nothing else").\n"off_topic": ONLY if completely unrelated to food/dining (e.g. "what\'s the weather").\n\nWhen in doubt, ALWAYS choose "food_input".',
    messages: [{ role: "user", content: message }],
  });

  const classifyText =
    classifyRes.content[0].type === "text" ? classifyRes.content[0].text : "";
  let intent = "food_input";
  try {
    const parsed = JSON.parse(classifyText).intent;
    if (["food_input", "done", "off_topic"].includes(parsed)) {
      intent = parsed;
    }
  } catch {
    // default to food_input on parse failure
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

  const turnCount = deepTalk.transcript.filter(
    (t: { role: string }) => t.role === "user"
  ).length + 1; // +1 for the message we just appended

  const isDone = intent === "done" || turnCount >= 3;

  // Step 3: Generate conversational reply
  const recentTurns = deepTalk.transcript.slice(-6).map((t: { role: string; text: string }) => ({
    role: t.role as "user" | "assistant",
    content: t.text,
  }));

  const systemPrompt = isDone
    ? "You are YoSOM, a friendly food-feedback chatbot for Yale SOM dining. The student has shared their cravings. Summarize what you heard in one warm sentence and say you've noted it down for next week's menu. Be casual, ≤30 words. Use 1 emoji max. Do NOT ask a question."
    : "You are YoSOM, a friendly food-feedback chatbot for Yale SOM dining. Ask ONE short follow-up question about food preferences. Be warm, casual, ≤25 words. Use 1 emoji max. Never go off-topic.";

  const replyRes = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    system: systemPrompt,
    messages: recentTurns,
  });

  const reply =
    replyRes.content[0].type === "text" ? replyRes.content[0].text : "";

  deepTalk.transcript.push({ role: "assistant", text: reply, ts: new Date() });
  await deepTalk.save();

  return NextResponse.json({
    reply,
    intent: "food_input",
    turnCount,
    done: isDone,
  });
}
