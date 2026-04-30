"use client";

import { useRef, useEffect } from "react";
import { Mic, Send } from "lucide-react";

interface InputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  autoFocus?: boolean;
}

export default function InputBar({ value, onChange, onSend, autoFocus }: InputBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const hasText = value.trim().length > 0;

  return (
    <div
      className="flex items-center gap-2 border-t border-line px-3 pb-9 pt-2"
      style={{
        background: "rgba(250,247,242,0.92)",
        backdropFilter: "blur(14px) saturate(180%)",
        WebkitBackdropFilter: "blur(14px) saturate(180%)",
      }}
    >
      <div
        className="flex flex-1 items-center rounded-pill border border-line bg-white pl-3.5 pr-1"
        style={{ boxShadow: "0 1px 2px rgba(27,40,69,0.04)" }}
      >
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && hasText) onSend();
          }}
          placeholder="Type if you want to say more..."
          className="flex-1 border-none bg-transparent py-2 text-[15.5px] text-ink outline-none placeholder:text-muted"
        />
        <button
          onClick={() => hasText && onSend()}
          aria-label={hasText ? "Send" : "Voice"}
          className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-coral transition-transform duration-100 active:scale-95"
          style={{ boxShadow: "0 2px 6px rgba(255,107,107,0.3)" }}
        >
          {hasText ? (
            <Send size={16} color="#fff" strokeWidth={2.4} />
          ) : (
            <Mic size={16} color="#fff" strokeWidth={2.4} />
          )}
        </button>
      </div>
    </div>
  );
}
