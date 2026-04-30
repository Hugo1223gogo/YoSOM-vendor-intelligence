"use client";

import { Heart } from "lucide-react";
import type { VoteItem } from "@/lib/types";

interface VoteCardProps {
  item: VoteItem;
  voted: boolean;
  onVote: () => void;
}

export default function VoteCard({ item, voted, onVote }: VoteCardProps) {
  return (
    <div
      className="flex items-center gap-3.5 rounded-bubble bg-white p-3.5 transition-all duration-200"
      style={{
        border: voted
          ? "1.5px solid rgba(255,107,107,0.5)"
          : "0.5px solid var(--line)",
        boxShadow: voted
          ? "0 4px 16px rgba(255,107,107,0.12)"
          : "0 1px 2px rgba(27,40,69,0.05), 0 4px 12px rgba(27,40,69,0.03)",
      }}
    >
      <div
        className="flex h-16 w-16 flex-shrink-0 items-center justify-center text-4xl"
        style={{ borderRadius: 18, background: item.tone }}
      >
        {item.emoji}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[15.5px] font-bold leading-tight text-ink">
          {item.name}
        </div>
        <div className="mt-[5px] flex flex-wrap gap-[5px]">
          {item.tags.map((t) => (
            <span
              key={t}
              className="rounded-pill px-2 py-[3px] text-[10.5px] font-semibold tracking-wide text-yale"
              style={{ background: "rgba(15,77,146,0.08)" }}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="mt-1.5 text-[13px] font-semibold text-muted">
          ${item.price.toFixed(2)} ·{" "}
          <span className={voted ? "text-coral-deep" : "text-muted"}>
            +{item.votes} student{item.votes === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <button
        onClick={onVote}
        className="tap-active flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full"
        aria-label={voted ? "Unvote" : "Vote"}
        style={{
          border: voted ? "none" : "1.5px solid rgba(255,107,107,0.4)",
          background: voted ? "var(--coral)" : "#fff",
          boxShadow: voted ? "0 4px 12px rgba(255,107,107,0.35)" : "none",
        }}
      >
        <span className={voted ? "animate-heart-burst flex" : "flex"}>
          <Heart
            size={20}
            fill={voted ? "#fff" : "none"}
            color={voted ? "#fff" : "var(--coral)"}
          />
        </span>
      </button>
    </div>
  );
}
