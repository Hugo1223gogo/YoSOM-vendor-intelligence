import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// DALL-E 3 generation can run 25-50s on standard quality; default Vercel
// Hobby timeout would kill the function. 60s is the Hobby max.
export const maxDuration = 60;

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "sk-...") {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY not set. Add it to .env.local to generate posters.",
      },
      { status: 400 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const {
    itemName = "next week's special",
    venue = "charleys",
    vibe = "playful",
    aspect = "portrait",
    customPrompt,
    model = "dall-e-3",
  } = body as {
    itemName?: string;
    venue?: "charleys" | "mcnay";
    vibe?: string;
    aspect?: "portrait" | "square" | "landscape";
    customPrompt?: string;
    model?: "dall-e-3" | "gpt-image-1";
  };

  // Each model has its own valid size set.
  // DALL-E 3:    1024x1024, 1024x1792 (portrait), 1792x1024 (landscape)
  // gpt-image-1: 1024x1024, 1024x1536 (portrait), 1536x1024 (landscape)
  const SIZES: Record<
    "dall-e-3" | "gpt-image-1",
    Record<"portrait" | "square" | "landscape", string>
  > = {
    "dall-e-3": {
      portrait: "1024x1792",
      square: "1024x1024",
      landscape: "1792x1024",
    },
    "gpt-image-1": {
      portrait: "1024x1536",
      square: "1024x1024",
      landscape: "1536x1024",
    },
  };
  const size = SIZES[model][aspect] as
    | "1024x1024"
    | "1024x1792"
    | "1792x1024"
    | "1024x1536"
    | "1536x1024";

  const venueDesc =
    venue === "charleys"
      ? "Charley's Place — a cozy, hot-meal hub at Yale School of Management with bright wooden interiors"
      : "McNay Cafe — a sun-lit study cafe at Yale School of Management with warm cream tones";

  const prompt =
    customPrompt?.trim() ||
    `A vibrant, eye-catching student-friendly food poster promoting "${itemName}" at ${venueDesc}.
Style: ${vibe}, modern editorial, warm cream and coral palette with deep navy ink type.
The poster features the food as the hero, large and appetizing, with playful hand-drawn elements,
soft shadows, and gentle motion lines. Include a bold tagline area at the top and a small
"YoSOM × Yale SOM" badge at the bottom. No text inside the food. Print-ready, portrait composition,
high contrast, magazine-cover energy.`;

  try {
    const openai = getClient();
    const response = await openai.images.generate({
      model,
      prompt,
      // OpenAI's TS types narrow size to model-specific unions; the
      // SIZES table above already enforces the right value, so we widen.
      size: size as never,
      n: 1,
      // Standard quality (vs HD) cuts DALL-E 3 latency ~50% and fits inside
      // the 60s Hobby budget for portrait. Quality drop is barely visible.
      ...(model === "dall-e-3" ? { quality: "standard", style: "vivid" } : {}),
      ...(model === "gpt-image-1" ? { quality: "high" } : {}),
    });

    const first = response.data?.[0];
    if (!first) throw new Error("No image returned");

    const imageDataUrl = first.b64_json
      ? `data:image/png;base64,${first.b64_json}`
      : first.url;

    return NextResponse.json({
      image: imageDataUrl,
      prompt,
      model,
      revised_prompt: first.revised_prompt,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Poster gen failed:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
