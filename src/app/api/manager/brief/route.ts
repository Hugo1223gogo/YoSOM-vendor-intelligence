import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { generateOpsBrief } from "@/lib/manager/brief";
import type { OpsBrief, Venue } from "@/lib/manager/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Tiny in-memory cache so demo clicks don't burn API quota.
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<Venue, { at: number; brief: OpsBrief }>();

export async function GET(req: NextRequest) {
  const venueParam = req.nextUrl.searchParams.get("venue");
  const force = req.nextUrl.searchParams.get("force") === "1";
  if (venueParam !== "charleys" && venueParam !== "mcnay") {
    return NextResponse.json({ error: "Invalid venue" }, { status: 400 });
  }
  const venue = venueParam as Venue;

  if (!force) {
    const hit = cache.get(venue);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
      return NextResponse.json({ brief: hit.brief, cached: true });
    }
  }

  await connectDB();
  try {
    const brief = await generateOpsBrief(venue);
    cache.set(venue, { at: Date.now(), brief });
    return NextResponse.json({ brief, cached: false });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Brief generation failed" },
      { status: 500 },
    );
  }
}
