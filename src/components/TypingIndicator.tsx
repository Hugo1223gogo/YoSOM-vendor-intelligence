"use client";

export default function TypingIndicator() {
  return (
    <div
      className="animate-fade-up mt-1 flex items-center gap-[5px] self-start rounded-[20px_20px_20px_6px] px-4 py-3"
      style={{ background: "#EDE7DC" }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-[7px] w-[7px] rounded-full animate-typing"
          style={{
            background: "rgba(27,40,69,0.45)",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}
