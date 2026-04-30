"use client";

import { ArrowRight } from "lucide-react";
import VoteCard from "./VoteCard";
import type { VoteItem } from "@/lib/types";

interface VoteStackProps {
  items: VoteItem[];
  voted: Set<string>;
  onVote: (id: string) => void;
  onDone: () => void;
  onDeepTalk: () => void;
  doneShown: boolean;
}

export default function VoteStack({
  items,
  voted,
  onVote,
  onDone,
  onDeepTalk,
  doneShown,
}: VoteStackProps) {
  return (
    <div className="flex flex-col gap-2.5 self-stretch">
      {items.map((it, i) => (
        <div
          key={it.id}
          className="animate-fade-up"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          <VoteCard item={it} voted={voted.has(it.id)} onVote={() => onVote(it.id)} />
        </div>
      ))}
      <button
        onClick={onDeepTalk}
        className="py-2 text-center text-[13.5px] font-semibold text-ink-soft underline underline-offset-[3px] opacity-85"
        style={{ textDecorationColor: "rgba(27,40,69,0.3)" }}
      >
        Nothing&apos;s hitting? Tell me what you really want →
      </button>
      {doneShown && (
        <button
          onClick={onDone}
          className="animate-fade-up tap-active mt-1 flex items-center justify-center gap-2 rounded-pill bg-ink px-[22px] py-3.5 text-[15.5px] font-bold text-white"
          style={{ boxShadow: "0 6px 18px rgba(27,40,69,0.25)" }}
        >
          Done voting <ArrowRight size={17} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
