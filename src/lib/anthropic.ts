import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  // Use YOSOM_ANTHROPIC_KEY to avoid conflicts with Claude Code's own ANTHROPIC_API_KEY
  const key = process.env.YOSOM_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("YOSOM_ANTHROPIC_KEY (or ANTHROPIC_API_KEY) env var is not set");
  }
  if (!client) {
    client = new Anthropic({ apiKey: key });
  }
  return client;
}
