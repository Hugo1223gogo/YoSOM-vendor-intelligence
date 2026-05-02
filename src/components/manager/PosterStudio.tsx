"use client";

import { useState } from "react";
import type { CostItem, Venue } from "@/lib/manager/types";
import { Card } from "@/components/manager/Card";

const VIBES = [
  "playful",
  "bold editorial",
  "minimalist Scandi",
  "retro diner",
  "tropical sunset",
  "moody noir",
  "confetti party",
  "zine collage",
];

interface PosterResult {
  image: string;
  prompt: string;
  model: string;
  revised_prompt?: string;
}

export default function PosterStudio({
  venue,
  items,
}: {
  venue: Venue;
  items: CostItem[];
}) {
  const candidateItems = items.filter((i) => i.baselineDailyServings === 0);
  const allItems = items;

  const [itemName, setItemName] = useState(
    candidateItems[0]?.name ?? allItems[0]?.name ?? "",
  );
  const [vibe, setVibe] = useState(VIBES[0]);
  const [model, setModel] = useState<"dall-e-3" | "gpt-image-1">("dall-e-3");
  const [customPrompt, setCustomPrompt] = useState("");
  const [aspect, setAspect] = useState<"portrait" | "square" | "landscape">(
    "portrait",
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PosterResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/manager/poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venue,
          itemName,
          vibe,
          aspect,
          customPrompt,
          model,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Poster gen failed");
      setResult(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
      <Card title="Compose poster" className="lg:col-span-2">
        <div className="space-y-4">
          <Field label="Featured item">
            <select
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coral"
            >
              <optgroup label="Candidates (recommended)">
                {candidateItems.map((i) => (
                  <option key={i.itemId} value={i.name}>
                    {i.emoji} {i.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Current menu">
                {items
                  .filter((i) => i.baselineDailyServings > 0)
                  .map((i) => (
                    <option key={i.itemId} value={i.name}>
                      {i.emoji} {i.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          </Field>

          <Field label="Vibe">
            <div className="flex flex-wrap gap-2">
              {VIBES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVibe(v)}
                  className={`rounded-pill px-3 py-1.5 text-xs font-medium ring-1 ${
                    vibe === v
                      ? "bg-ink text-white ring-ink"
                      : "bg-white text-ink-soft ring-line hover:bg-cream-2"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Aspect">
              <select
                value={aspect}
                onChange={(e) => setAspect(e.target.value as typeof aspect)}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              >
                <option value="portrait">Portrait (Insta story)</option>
                <option value="square">Square (Insta post)</option>
                <option value="landscape">Landscape (banner)</option>
              </select>
            </Field>
            <Field label="Model">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as typeof model)}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              >
                <option value="dall-e-3">DALL-E 3</option>
                <option value="gpt-image-1">gpt-image-1 (verified org)</option>
              </select>
            </Field>
          </div>

          <Field
            label="Custom prompt (optional)"
            hint="Leave blank to auto-compose from the fields above"
          >
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={4}
              placeholder="e.g. Spicy ramen as the hero, neon Tokyo signs, kanji menu, hand-painted brushstrokes…"
              className="w-full resize-none rounded-xl border border-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coral"
            />
          </Field>

          <button
            onClick={generate}
            disabled={loading}
            className="w-full rounded-pill bg-coral px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-coral-deep disabled:opacity-60"
          >
            {loading ? "Generating poster…" : "🎨 Generate poster"}
          </button>

          {error && (
            <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100">
              {error}
            </div>
          )}
        </div>
      </Card>

      <Card
        title="Result"
        subtitle={
          result?.model
            ? `Generated with ${result.model}`
            : "Click generate to create a poster"
        }
        className="lg:col-span-3"
      >
        <div className="flex min-h-[400px] items-center justify-center rounded-xl bg-cream-2/50 p-6">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-muted">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-coral border-t-transparent" />
              <span className="text-sm">Painting your poster…</span>
            </div>
          ) : result ? (
            <div className="flex w-full max-w-md flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.image}
                alt="Generated poster"
                className="w-full rounded-card shadow-lg"
              />
              <div className="flex w-full gap-2">
                <a
                  href={result.image}
                  download={`yosom-${itemName.toLowerCase().replace(/\s/g, "-")}.png`}
                  className="flex-1 rounded-pill bg-ink py-2 text-center text-xs font-semibold text-white"
                >
                  ⬇ Download
                </a>
                <button
                  onClick={generate}
                  className="flex-1 rounded-pill bg-white py-2 text-xs font-semibold text-ink ring-1 ring-line hover:bg-cream-2"
                >
                  ↻ Try again
                </button>
              </div>
              {result.revised_prompt && (
                <details className="w-full text-xs text-muted">
                  <summary className="cursor-pointer">View final prompt</summary>
                  <p className="mt-2 italic">{result.revised_prompt}</p>
                </details>
              )}
            </div>
          ) : (
            <div className="text-center text-sm text-muted">
              Pick an item and a vibe, then hit generate.
              <br />
              Posters can be posted to the student app to promote next-week features.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          {label}
        </span>
        {hint && <span className="text-[11px] text-muted">{hint}</span>}
      </div>
      {children}
    </label>
  );
}
