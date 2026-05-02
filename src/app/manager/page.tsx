import Link from "next/link";

export const metadata = {
  title: "YoSOM Manager — Choose Venue",
};

export default function ManagerLanding() {
  return (
    <main className="min-h-screen bg-cream px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-coral">
            Vendor Console
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            YoSOM Manager
          </h1>
          <p className="mt-3 text-base text-muted">
            Open the dashboard for the venue you operate.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <VenueChoice
            href="/manager/charleys"
            emoji="🍜"
            name="Charley's Place"
            blurb="Hot mains, ramen, bowls, burritos. Lunch & dinner traffic."
            tone="from-[#FFE2D6] to-[#FFC7B0]"
          />
          <VenueChoice
            href="/manager/mcnay"
            emoji="🥐"
            name="McNay Cafe"
            blurb="Coffee, pastries, light bites. All-day grab-and-go."
            tone="from-[#E8DFFF] to-[#C8B8F2]"
          />
        </div>

        <div className="mt-10 rounded-card bg-white p-5 text-center text-sm text-muted shadow-sm ring-1 ring-line">
          <span className="font-semibold text-ink-soft">Heads up</span> — this
          is the vendor-facing app. The student-facing app lives at{" "}
          <Link href="/" className="font-medium text-yale hover:underline">
            /
          </Link>
          .
        </div>
      </div>
    </main>
  );
}

function VenueChoice({
  href,
  emoji,
  name,
  blurb,
  tone,
}: {
  href: string;
  emoji: string;
  name: string;
  blurb: string;
  tone: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-card bg-gradient-to-br p-6 shadow-sm ring-1 ring-line transition-transform hover:-translate-y-0.5 ${tone}`}
    >
      <div className="text-4xl">{emoji}</div>
      <div className="mt-4 font-display text-2xl font-bold text-ink">{name}</div>
      <p className="mt-1 text-sm text-ink-soft">{blurb}</p>
      <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink">
        Open dashboard
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </div>
    </Link>
  );
}
