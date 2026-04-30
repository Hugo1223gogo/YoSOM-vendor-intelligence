"use client";

import { useState, useEffect } from "react";
import { Share2 } from "lucide-react";
import { useParams } from "next/navigation";

interface FeedItem {
  id: string;
  name: string;
  emoji: string;
  tone: string;
  votes: number;
}

const WORDS = [
  "spicy", "ramen", "vegan", "boba", "sandwich", "tonkotsu", "late night",
  "gluten free", "crunchy", "matcha", "comfort", "tofu", "kimchi",
  "breakfast", "tacos", "cold brew", "curry", "chickpea",
];

export default function LiveFeedPage() {
  const params = useParams();
  const venue = params.venue as string;
  const [items, setItems] = useState<FeedItem[]>([]);
  const [chatters, setChatters] = useState(47);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await fetch(`/api/feed/live?venue=${venue}`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) setItems(data);
        }
      } catch {
        // use local simulation if API unavailable
      }
    };

    fetchFeed();
    const interval = setInterval(fetchFeed, 2000);
    return () => clearInterval(interval);
  }, [venue]);

  // Simulated ticking for chatters + word cloud
  useEffect(() => {
    const t = setInterval(() => {
      setChatters((c) => c + (Math.random() > 0.5 ? 1 : 0));
      setTick((t) => t + 1);
    }, 2200);
    return () => clearInterval(t);
  }, []);

  const max = items.length > 0 ? Math.max(...items.map((i) => i.votes)) : 1;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-cream">
      {/* Header */}
      <div
        className="border-b border-line px-5 pb-4 pt-6"
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
          Refreshing every 2s · {chatters} students contributing
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

        {items.length === 0 && (
          <div className="py-8 text-center text-muted">
            Loading vote data...
          </div>
        )}

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
      </div>
    </div>
  );
}
