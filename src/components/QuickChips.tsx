"use client";

interface Chip {
  id: string;
  label: string;
}

interface QuickChipsProps {
  chips: Chip[];
  onPick: (chip: Chip) => void;
}

export default function QuickChips({ chips, onPick }: QuickChipsProps) {
  return (
    <div className="flex max-w-[90%] flex-col items-end gap-2 self-end">
      {chips.map((c, i) => (
        <button
          key={c.id}
          onClick={() => onPick(c)}
          className="animate-fade-up rounded-pill border bg-white px-[18px] py-[11px] text-[15.5px] font-semibold text-coral-deep transition-transform duration-[120ms] active:scale-95"
          style={{
            borderColor: "rgba(255,107,107,0.35)",
            borderWidth: 1.5,
            animationDelay: `${i * 80}ms`,
            boxShadow: "0 1px 3px rgba(27,40,69,0.06)",
          }}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
