"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

interface FeedbackInputProps {
  onSubmit: (text: string) => void;
}

export default function FeedbackInput({ onSubmit }: FeedbackInputProps) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    onSubmit(text);
  };

  if (submitted) return null;

  return (
    <div className="animate-fade-up ml-1 max-w-[88%] rounded-bubble bg-white p-4 shadow-sm ring-1 ring-line">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. portion was small, food was cold..."
        className="mb-3 w-full resize-none rounded-[14px] border border-line bg-cream px-4 py-2.5 text-[14px] text-ink placeholder:text-muted focus:border-coral focus:outline-none"
        rows={2}
        maxLength={300}
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={() => { setSubmitted(true); onSubmit(""); }}
          className="flex-1 rounded-pill border border-line py-2.5 text-[14px] font-semibold text-muted transition-transform duration-[120ms] active:scale-[0.97]"
        >
          Skip
        </button>
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-pill py-2.5 text-[14px] font-semibold text-white transition-transform duration-[120ms] active:scale-[0.97]"
          style={{
            background: text.trim() ? "var(--coral)" : "var(--line)",
            color: text.trim() ? "white" : "var(--muted)",
          }}
        >
          Send <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
