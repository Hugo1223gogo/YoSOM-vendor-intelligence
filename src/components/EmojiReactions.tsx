"use client";

import type { ReactionValue } from "@/lib/types";

const opts: { id: ReactionValue; e: string }[] = [
  { id: "up", e: "👍" },
  { id: "mid", e: "😐" },
  { id: "down", e: "👎" },
];

interface EmojiReactionsProps {
  picked: ReactionValue | null;
  onPick: (id: ReactionValue) => void;
}

export default function EmojiReactions({ picked, onPick }: EmojiReactionsProps) {
  return (
    <div className="animate-fade-up mt-0.5 flex gap-2.5 self-start">
      {opts.map((o, i) => {
        const isPicked = picked === o.id;
        const dim = picked && !isPicked;
        return (
          <button
            key={o.id}
            className="tap-active flex h-[60px] w-[60px] items-center justify-center rounded-cta bg-white text-[30px]"
            onClick={() => !picked && onPick(o.id)}
            disabled={!!picked}
            style={{
              border: isPicked
                ? "2px solid var(--coral)"
                : "0.5px solid var(--line)",
              opacity: dim ? 0.4 : 1,
              cursor: picked ? "default" : "pointer",
              boxShadow: isPicked
                ? "0 4px 14px rgba(255,107,107,0.25)"
                : "0 1px 3px rgba(27,40,69,0.05)",
              animationDelay: `${i * 80}ms`,
            }}
          >
            {o.e}
          </button>
        );
      })}
    </div>
  );
}
