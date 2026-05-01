"use client";

import { Check } from "lucide-react";
import type { Venue } from "@/lib/types";

const venues = [
  {
    id: "charleys" as Venue,
    emoji: "🥪",
    name: "Charley's",
    sub: "Hot meals & bowls",
    tone: "#FFE9D6",
  },
  {
    id: "mcnay" as Venue,
    emoji: "☕",
    name: "McNay Cafe",
    sub: "Coffee & quick bites",
    tone: "#E6EEF8",
  },
];

interface VenueCardsProps {
  picked: Venue | null;
  onPick: (venue: Venue) => void;
}

export default function VenueCards({ picked, onPick }: VenueCardsProps) {
  return (
    <div className="animate-fade-up mt-1 grid grid-cols-2 gap-2.5 self-stretch">
      {venues.map((v) => {
        const isPicked = picked === v.id;
        const dim = picked && !isPicked;
        return (
          <button
            key={v.id}
            className="tap-active relative flex flex-col items-start gap-1.5 rounded-bubble bg-white p-[18px_14px] text-left"
            onClick={() => !picked && onPick(v.id)}
            disabled={!!picked}
            style={{
              border: isPicked
                ? "2px solid var(--coral)"
                : "1px solid var(--line)",
              opacity: dim ? 0.45 : 1,
              cursor: picked ? "default" : "pointer",
              boxShadow: isPicked
                ? "0 6px 20px rgba(255,107,107,0.18)"
                : "0 1px 2px rgba(27,40,69,0.05), 0 4px 14px rgba(27,40,69,0.04)",
            }}
          >
            <div
              className="mb-1 flex h-14 w-14 items-center justify-center text-[32px]"
              style={{ borderRadius: 16, background: v.tone }}
            >
              {v.emoji}
            </div>
            <div className="text-[16px] font-bold text-ink">{v.name}</div>
            <div className="text-[13px] font-medium text-muted">{v.sub}</div>
            {isPicked && (
              <div
                className="animate-pop-in absolute right-3 top-3 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-coral text-white"
              >
                <Check size={16} strokeWidth={3} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
