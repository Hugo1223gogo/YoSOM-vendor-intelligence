import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionId } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import Vote from "@/models/Vote";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { itemId, venue, value = 1 } = await req.json();
  if (!itemId || !venue) {
    return NextResponse.json({ error: "Missing itemId or venue" }, { status: 400 });
  }

  await connectDB();
  const sessionId = getSessionId();

  try {
    await Vote.findOneAndUpdate(
      { sessionId, itemId },
      { sessionId, venue, itemId, value, createdAt: new Date() },
      { upsert: true, new: true }
    );
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
      return NextResponse.json({ error: "Already voted" }, { status: 409 });
    }
    throw err;
  }
}
