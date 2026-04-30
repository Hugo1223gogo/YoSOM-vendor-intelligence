import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionId } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import Reaction from "@/models/Reaction";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { itemId, value } = await req.json();
  if (!itemId || !["up", "mid", "down"].includes(value)) {
    return NextResponse.json({ error: "Invalid reaction" }, { status: 400 });
  }

  await connectDB();
  const sessionId = getSessionId();

  await Reaction.create({ sessionId, itemId, value });
  return NextResponse.json({ ok: true });
}
