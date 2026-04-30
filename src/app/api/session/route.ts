import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionId } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import Session from "@/models/Session";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  await connectDB();
  const sessionId = getSessionId();
  const { venue } = await req.json().catch(() => ({}));

  const session = await Session.findOneAndUpdate(
    { sessionId },
    {
      $setOnInsert: {
        sessionId,
        entrySource: venue ? "qr" : "instagram",
        venueQR: venue || undefined,
        startedAt: new Date(),
        completedStage: "boot",
      },
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ sessionId: session.sessionId, venue: session.venueQR });
}
