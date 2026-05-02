"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VENUE_LABEL, type Venue } from "@/lib/manager/types";

interface NavItem {
  href: string;
  label: string;
  emoji: string;
}

export default function SidebarNav({ venue }: { venue: Venue }) {
  const pathname = usePathname();
  const items: NavItem[] = [
    { href: `/manager/${venue}`, label: "Overview", emoji: "📊" },
    { href: `/manager/${venue}/forecast`, label: "Demand Forecast", emoji: "📈" },
    { href: `/manager/${venue}/brief`, label: "AI Ops Brief", emoji: "🤖" },
    { href: `/manager/${venue}/data`, label: "Raw Data", emoji: "📋" },
    { href: `/manager/${venue}/posters`, label: "Posters", emoji: "🎨" },
  ];

  const otherVenue: Venue = venue === "charleys" ? "mcnay" : "charleys";
  const subPath = pathname.replace(`/manager/${venue}`, "") || "";

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-cream-2/50 px-4 py-6 lg:flex">
      <div className="mb-8 px-2">
        <Link href="/manager" className="block">
          <div className="font-display text-xl font-bold tracking-tight text-ink">
            YoSOM Manager
          </div>
          <div className="mt-0.5 text-xs text-muted">
            Vendor Intelligence Console
          </div>
        </Link>
      </div>

      <div className="mb-6 rounded-card bg-white p-3 shadow-sm ring-1 ring-line">
        <div className="text-[11px] uppercase tracking-wider text-muted">
          Currently viewing
        </div>
        <div className="mt-1 font-display text-base font-semibold text-ink">
          {VENUE_LABEL[venue]}
        </div>
        <Link
          href={`/manager/${otherVenue}${subPath}`}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-yale hover:underline"
        >
          Switch to {VENUE_LABEL[otherVenue]} →
        </Link>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-ink text-white shadow-sm"
                  : "text-ink-soft hover:bg-white"
              }`}
            >
              <span className="text-base">{it.emoji}</span>
              <span className="font-medium">{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-card bg-white/60 p-3 text-[11px] leading-relaxed text-muted ring-1 ring-line">
        <div className="font-semibold text-ink-soft">Live data</div>
        Mongo: <code className="font-mono text-[10px]">{"yosom"}</code>
        <br />
        Refreshes every 10s on the dashboard.
      </div>
    </aside>
  );
}
