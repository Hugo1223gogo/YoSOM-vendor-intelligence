"use client";

import type { ReactNode } from "react";

export default function UserBubble({ children }: { children: ReactNode }) {
  return (
    <div
      className="animate-pop-in max-w-[82%] self-end rounded-[22px_22px_6px_22px] bg-coral px-4 py-[11px] text-[16px] font-medium leading-[1.4] text-white"
      style={{ boxShadow: "0 2px 8px rgba(255,107,107,0.25)" }}
    >
      {children}
    </div>
  );
}
