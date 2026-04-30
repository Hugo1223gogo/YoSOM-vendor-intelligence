"use client";

import type { ReactNode } from "react";

export default function AIBubble({ children }: { children: ReactNode }) {
  return (
    <div
      className="animate-pop-in max-w-[82%] self-start rounded-[22px_22px_22px_6px] border bg-white px-4 py-3 text-[16px] leading-[1.42] text-ink"
      style={{
        borderColor: "rgba(27,40,69,0.06)",
        fontWeight: 450,
        boxShadow:
          "0 1px 2px rgba(27,40,69,0.05), 0 4px 16px rgba(27,40,69,0.04)",
      }}
    >
      {children}
    </div>
  );
}
