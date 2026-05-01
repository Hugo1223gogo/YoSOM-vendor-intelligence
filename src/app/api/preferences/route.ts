import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionId } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import Preference from "@/models/Preference";

const VALID_IDS: Record<string, string[]> = {
  flavors: ["spicy", "sweet", "savory", "umami", "sour", "smoky"],
  proteins: ["chicken", "tofu", "beef", "shrimp", "veggies", "fish"],
  dietary: ["gluten-free", "dairy-free", "vegan", "nut-free", "halal", "none"],
  cuisines: ["asian", "mexican", "italian", "mediterranean", "american", "indian"],
};

function validateArray(arr: unknown, key: string): string[] {
  if (!Array.isArray(arr)) return [];
  const valid = VALID_IDS[key] || [];
  return arr.filter((v): v is string => typeof v === "string" && valid.includes(v));
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();

  await connectDB();
  const sessionId = getSessionId();

  await Preference.findOneAndUpdate(
    { sessionId },
    {
      sessionId,
      flavors: validateArray(body.flavors, "flavors"),
      proteins: validateArray(body.proteins, "proteins"),
      dietary: validateArray(body.dietary, "dietary"),
      cuisines: validateArray(body.cuisines, "cuisines"),
      freeText:
        typeof body.freeText === "string"
          ? body.freeText.slice(0, 200)
          : undefined,
    },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
