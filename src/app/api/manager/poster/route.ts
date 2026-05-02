import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    size = "1024x1536",
    customPrompt,
    model = "dall-e-3",
  } = body as {
    itemName?: string;
    venue?: "charleys" | "mcnay";
    vibe?: string;
    size?: "1024x1024" | "1024x1536" | "1536x1024";
    customPrompt?: string;
    model?: "dall-e-3" | "gpt-image-1";
  };

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
      size: size as "1024x1024" | "1024x1536" | "1536x1024",
      n: 1,
      ...(model === "dall-e-3" ? { quality: "hd", style: "vivid" } : {}),
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
