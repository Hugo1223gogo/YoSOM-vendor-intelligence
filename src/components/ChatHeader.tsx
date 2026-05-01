"use client";

import { RotateCcw } from "lucide-react";
import type { Venue } from "@/lib/types";

const venueMeta: Record<string, { emoji: string; name: string }> = {
  charleys: { emoji: "🥪", name: "Charley's" },
  mcnay: { emoji: "☕", name: "McNay" },
  none: { emoji: "🍽️", name: "YoSOM" },
};

interface ChatHeaderProps {
  venue: Venue | null;
  chatters: number;
  onReset: () => void;
}

export default function ChatHeader({ venue, chatters, onReset }: ChatHeaderProps) {
  const meta = venueMeta[venue || "none"];

  return (
    <div
      className="sticky top-0 z-10 flex items-center gap-3 border-b border-line px-4 pb-3 pt-4"
      style={{
        background: "rgba(250,247,242,0.88)",
        backdropFilter: "blur(14px) saturate(180%)",
        WebkitBackdropFilter: "blur(14px) saturate(180%)",
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center text-xl"
          style={{
            borderRadius: 12,
            background: "linear-gradient(135deg, #1B2845 0%, #0F4D92 100%)",
            boxShadow: "0 2px 8px rgba(27,40,69,0.22)",
          }}
        >
          <span>{meta.emoji}</span>
        </div>
        <div className="min-w-0">
          <div className="font-display text-[19px] font-bold leading-none tracking-tight text-ink">
            YoSOM
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] font-medium text-muted">
            <span className="inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-green-500" />
            <span>
              {chatters} chatting now · {meta.name}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        aria-label="Restart"
        className="tap-active flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full"
        style={{ background: "rgba(27,40,69,0.06)" }}
      >
        <RotateCcw size={16} className="text-ink-soft" strokeWidth={2.2} />
      </button>
    </div>
  );
}
