"use client";

import { useState, useEffect } from "react";
import { Share2 } from "lucide-react";

const TOP_ITEMS_SEED = [
  { id: "ramen", name: "Spicy Miso Ramen", emoji: "🍜", votes: 124, tone: "#FFE2D6" },
  { id: "bowl", name: "Korean Rice Bowl", emoji: "🥘", votes: 98, tone: "#FFE9D6" },
  { id: "burrito", name: "Breakfast Burrito", emoji: "🌯", votes: 81, tone: "#FFF1D6" },
  { id: "salad", name: "Crunchy Thai Salad", emoji: "🥗", votes: 64, tone: "#E6F1E0" },
  { id: "boba", name: "Brown Sugar Boba", emoji: "🧋", votes: 52, tone: "#EFE0F0" },
];

const WORDS = [
  "spicy", "ramen", "vegan", "boba", "sandwich", "tonkotsu", "late night",
  "gluten free", "crunchy", "matcha", "comfort", "tofu", "kimchi",
  "breakfast", "tacos", "cold brew", "curry", "chickpea",
];

interface LiveFeedProps {
  onBack: () => void;
}

export default function LiveFeed({ onBack }: LiveFeedProps) {
  const [items, setItems] = useState(TOP_ITEMS_SEED);
  const [chatters, setChatters] = useState(47);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setItems((prev) => {
        const n = prev.map((p) => ({ ...p }));
        const bumps = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < bumps; i++) {
          const idx = Math.floor(Math.random() * n.length);
          n[idx].votes += 1 + Math.floor(Math.random() * 3);
        }
        return n.sort((a, b) => b.votes - a.votes);
      });
      setChatters((c) => c + (Math.random() > 0.5 ? 1 : 0));
      setTick((t) => t + 1);
    }, 2200);
    return () => clearInterval(t);
  }, []);

  const max = Math.max(...items.map((i) => i.votes));

  return (
    <div className="animate-fade-up flex flex-1 flex-col overflow-hidden bg-cream">
      {/* Sub-header */}
      <div
        className="border-b border-line px-5 pb-4 pt-4"
        style={{
          background: "rgba(250,247,242,0.92)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <div className="mb-1 flex items-center gap-2">
          <span className="inline-block h-2 w-2 animate-pulse-dot rounded-full bg-coral" />
          <span className="text-[11.5px] font-bold uppercase tracking-[1.2px] text-coral-deep">
            Live
          </span>
        </div>
        <div className="font-display text-[26px] font-bold leading-none tracking-tight text-ink">
          What SOM Wants
        </div>
        <div className="mt-1 text-[13px] font-medium text-muted">
          Refreshing every few seconds · {chatters} students contributing
        </div>
      </div>

      {/* Body */}
      <div className="scrollbar-hide flex flex-1 flex-col gap-3.5 overflow-y-auto px-5 pb-6 pt-[18px]">
        <div className="text-[11px] font-bold uppercase tracking-[1.4px] text-muted">
          Top picks · this week
        </div>

        {items.map((it, i) => {
          const pct = (it.votes / max) * 100;
          return (
            <div key={it.id} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center text-xl"
                  style={{ borderRadius: 11, background: it.tone }}
                >
                  {it.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14.5px] font-semibold text-ink">{it.name}</div>
                </div>
                <div className="text-[14px] font-bold tabular-nums text-coral-deep">
                  {it.votes}
                </div>
              </div>
              <div
                className="relative ml-[46px] h-2.5 overflow-hidden rounded-pill"
                style={{ background: "rgba(27,40,69,0.06)" }}
              >
                <div
                  className="absolute inset-0 rounded-pill transition-[width] duration-[800ms]"
                  style={{
                    width: `${pct}%`,
                    background:
                      i === 0
                        ? "linear-gradient(90deg, #FF6B6B, #FF8C66)"
                        : `rgba(27,40,69,${0.55 - i * 0.08})`,
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Word cloud */}
        <div className="mt-3.5">
          <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[1.4px] text-muted">
            Recent inputs
          </div>
          <div className="flex flex-wrap gap-[7px] rounded-card border border-line bg-white p-3.5">
            {WORDS.map((w, i) => {
              const seed = (i * 31 + tick * 7) % 100;
              const size = 12 + (seed % 8);
              const weight = 500 + ((seed * 5) % 3) * 100;
              const isAccent = i % 5 === tick % 5;
              return (
                <span
                  key={w}
                  className="animate-float rounded-pill px-2.5 py-1 transition-colors duration-[400ms]"
                  style={{
                    fontSize: size,
                    fontWeight: weight,
                    color: isAccent ? "var(--coral-deep)" : "var(--ink-soft)",
                    background: isAccent
                      ? "rgba(255,107,107,0.10)"
                      : "rgba(27,40,69,0.04)",
                    animationDelay: `${(i % 7) * 0.3}s`,
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
        </div>

        <button
          className="tap-active mt-2.5 flex items-center justify-center gap-2.5 rounded-icon border border-line bg-white px-4 py-3.5 text-[15px] font-semibold text-ink"
          style={{ boxShadow: "0 1px 3px rgba(27,40,69,0.05)" }}
        >
          <Share2 size={18} />
          Share with friends
        </button>

        <button
          onClick={onBack}
          className="p-1 text-[13.5px] font-semibold text-muted"
        >
          ← Back to chat
        </button>
      </div>
    </div>
  );
}
