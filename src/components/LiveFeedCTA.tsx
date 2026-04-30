"use client";

import { Sparkles, ArrowRight } from "lucide-react";

export default function LiveFeedCTA({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="animate-fade-up tap-active flex w-full items-center justify-between rounded-cta px-[18px] py-4 text-[16px] font-bold text-white"
      style={{
        background: "linear-gradient(135deg, #FF6B6B 0%, #FF8C66 100%)",
        boxShadow: "0 8px 24px rgba(255,107,107,0.32)",
      }}
    >
      <span className="flex items-center gap-2">
        <Sparkles size={18} />
        Show me the live feed
      </span>
      <ArrowRight size={18} strokeWidth={2.6} />
    </button>
  );
}
