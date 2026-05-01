"use client";

import { useState } from "react";
import type { OptionItem } from "@/lib/preference-options";
import {
  FLAVOR_OPTIONS,
  PROTEIN_OPTIONS,
  DIETARY_OPTIONS,
  CUISINE_OPTIONS,
  MCNAY_FLAVOR_OPTIONS,
  MCNAY_ITEM_OPTIONS,
  MCNAY_DIETARY_OPTIONS,
  MCNAY_VIBE_OPTIONS,
} from "@/lib/preference-options";
import type { Venue } from "@/lib/types";

export interface PrefsPayload {
  flavors: string[];
  proteins: string[];
  dietary: string[];
  cuisines: string[];
  freeText: string;
}

type StepDef = { key: string; label: string; options: OptionItem[] };

const CHARLEYS_STEPS: StepDef[] = [
  { key: "flavors", label: "What flavors do you like?", options: FLAVOR_OPTIONS },
  { key: "proteins", label: "Pick your proteins", options: PROTEIN_OPTIONS },
  { key: "dietary", label: "Any dietary needs?", options: DIETARY_OPTIONS },
  { key: "cuisines", label: "What cuisines hit the spot?", options: CUISINE_OPTIONS },
];

const MCNAY_STEPS: StepDef[] = [
  { key: "flavors", label: "What flavors do you go for?", options: MCNAY_FLAVOR_OPTIONS },
  { key: "proteins", label: "What do you usually grab?", options: MCNAY_ITEM_OPTIONS },
  { key: "dietary", label: "Any dietary needs?", options: MCNAY_DIETARY_OPTIONS },
  { key: "cuisines", label: "What's your vibe today?", options: MCNAY_VIBE_OPTIONS },
];

interface PreferenceCardProps {
  venue?: Venue | null;
  onComplete: (prefs: PrefsPayload) => void;
}

export default function PreferenceCard({ venue, onComplete }: PreferenceCardProps) {
  const STEPS = venue === "mcnay" ? MCNAY_STEPS : CHARLEYS_STEPS;
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, Set<string>>>({
    flavors: new Set(),
    proteins: new Set(),
    dietary: new Set(),
    cuisines: new Set(),
  });
  const [freeText, setFreeText] = useState("");
  const [done, setDone] = useState(false);

  const current = STEPS[step];

  const toggle = (key: string, id: string) => {
    setSelections((prev) => {
      const next = new Set(prev[key]);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, [key]: next };
    });
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  };

  const handleSubmit = () => {
    onComplete({
      flavors: Array.from(selections.flavors),
      proteins: Array.from(selections.proteins),
      dietary: Array.from(selections.dietary),
      cuisines: Array.from(selections.cuisines),
      freeText: freeText.trim(),
    });
  };

  if (done) {
    return (
      <div className="animate-fade-up ml-1 max-w-[88%] rounded-bubble bg-white p-4 shadow-sm ring-1 ring-line">
        <p className="mb-3 text-[14px] font-medium text-ink-soft">
          Anything else on your mind? (optional)
        </p>
        <input
          type="text"
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="e.g. late-night options, bigger portions..."
          className="mb-3 w-full rounded-pill border border-line bg-cream px-4 py-2.5 text-[14px] text-ink placeholder:text-muted focus:border-coral focus:outline-none"
          maxLength={200}
          autoFocus
        />
        <button
          onClick={handleSubmit}
          className="w-full rounded-pill bg-coral py-2.5 text-[15px] font-semibold text-white transition-transform duration-[120ms] active:scale-[0.97]"
        >
          Done!
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-up ml-1 max-w-[88%] rounded-bubble bg-white p-4 shadow-sm ring-1 ring-line">
      {/* Progress dots */}
      <div className="mb-3 flex items-center justify-center gap-1.5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="h-[6px] w-[6px] rounded-full transition-colors duration-200"
            style={{
              background:
                i < step
                  ? "var(--coral)"
                  : i === step
                    ? "var(--coral-deep)"
                    : "var(--line)",
            }}
          />
        ))}
      </div>

      {/* Completed steps summary */}
      {step > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1">
          {STEPS.slice(0, step).map((s) => {
            const picked = selections[s.key];
            if (picked.size === 0) return null;
            return (
              <span
                key={s.key}
                className="inline-block rounded-pill bg-cream-2 px-2.5 py-0.5 text-[12px] font-medium text-ink-soft"
              >
                {Array.from(picked).join(", ")}
              </span>
            );
          })}
        </div>
      )}

      {/* Current step label */}
      <p className="mb-2.5 text-[14.5px] font-semibold text-ink">
        {current.label}
      </p>

      {/* Chip grid */}
      <div className="mb-3 flex flex-wrap gap-2">
        {current.options.map((opt, i) => {
          const selected = selections[current.key].has(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggle(current.key, opt.id)}
              className="animate-fade-up rounded-pill px-[14px] py-[9px] text-[14px] font-medium transition-all duration-[120ms] active:scale-95"
              style={{
                animationDelay: `${i * 50}ms`,
                border: selected
                  ? "1.5px solid var(--coral)"
                  : "1.5px solid var(--line)",
                background: selected ? "rgba(255,107,107,0.08)" : "white",
                color: selected ? "var(--coral-deep)" : "var(--ink-soft)",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Next button */}
      <button
        onClick={handleNext}
        className="w-full rounded-pill py-2.5 text-[14.5px] font-semibold transition-transform duration-[120ms] active:scale-[0.97]"
        style={{
          background:
            selections[current.key].size > 0
              ? "var(--coral)"
              : "var(--line)",
          color:
            selections[current.key].size > 0
              ? "white"
              : "var(--muted)",
        }}
      >
        {step < STEPS.length - 1
          ? selections[current.key].size > 0
            ? "Next →"
            : "Skip →"
          : "Almost done!"}
      </button>
    </div>
  );
}
