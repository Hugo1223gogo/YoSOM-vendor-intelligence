"use client";

import { useEffect, useState } from "react";
import type { OpsBrief, Venue } from "@/lib/manager/types";
import { Card } from "@/components/manager/Card";

export default function BriefView({ venue }: { venue: Venue }) {
  const [brief, setBrief] = useState<OpsBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [cached, setCached] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(force: boolean) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/manager/brief?venue=${venue}${force ? "&force=1" : ""}`,
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setBrief(json.brief);
      setCached(json.cached);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venue]);

  if (loading && !brief) return <Skeleton />;
  if (error)
    return (
      <Card title="Couldn't generate brief">
        <p className="text-sm text-rose-600">{error}</p>
        <button
          onClick={() => load(true)}
          className="mt-3 rounded-pill bg-ink px-4 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </Card>
    );
  if (!brief) return null;

  const fmt = (n: number) =>
    n >= 0 ? `+$${n.toLocaleString()}` : `-$${Math.abs(n).toLocaleString()}`;

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-widest text-coral">
              AI Daily Ops Brief
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink">
              {brief.studentVoiceHeadline}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
              <span>
                Pulse:{" "}
                <b className="text-ink">{brief.satisfactionPulse}/100</b>
              </span>
              <span>
                Inputs:{" "}
                <b className="text-ink">{brief.totalInputs7Day}</b> last 7d
              </span>
              <span>
                Generated:{" "}
                {new Date(brief.generatedAt).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
              {cached && (
                <span className="rounded-pill bg-cream-2 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                  cached
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => load(true)}
            disabled={loading}
            className="rounded-pill bg-ink px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Regenerating…" : "↻ Regenerate"}
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card title="✅ What to add" subtitle="Highest-signal candidate items">
          {brief.add.length === 0 ? (
            <p className="text-sm text-muted">No additions recommended.</p>
          ) : (
            <ul className="space-y-3">
              {brief.add.map((a) => (
                <li
                  key={a.itemName}
                  className="rounded-xl bg-cream-2/60 p-3"
                >
                  <div className="font-semibold text-ink">{a.itemName}</div>
                  <p className="mt-1 text-xs text-ink-soft">{a.rationale}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                    <Badge>{a.demandSignal}</Badge>
                    <Badge>est. demand: {a.estDailyDemand}</Badge>
                    <Badge>
                      ${a.estCostPerServing.toFixed(2)} → $
                      {a.estSalePrice.toFixed(2)}
                    </Badge>
                    {a.dietaryTags.map((t) => (
                      <Badge key={t} subtle>
                        {t}
                      </Badge>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="🔥 Keep" subtitle="High-satisfaction current items">
          {brief.keep.length === 0 ? (
            <p className="text-sm text-muted">Insufficient signal.</p>
          ) : (
            <ul className="space-y-3">
              {brief.keep.map((k) => (
                <li
                  key={k.itemName}
                  className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100"
                >
                  <div className="font-semibold text-ink">{k.itemName}</div>
                  <div className="mt-1 flex justify-between text-xs text-emerald-700">
                    <span>{k.positiveMentions} positive mentions</span>
                    <span className="font-bold">{k.repeatRate} repeat</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="⚠ Consider dropping" subtitle="Low demand or negative">
          {brief.drop.length === 0 ? (
            <p className="text-sm text-muted">Nothing flagged for cutting.</p>
          ) : (
            <ul className="space-y-3">
              {brief.drop.map((d) => (
                <li
                  key={d.itemName}
                  className="rounded-xl bg-rose-50 p-3 ring-1 ring-rose-100"
                >
                  <div className="font-semibold text-ink">{d.itemName}</div>
                  <div className="mt-1 flex justify-between text-xs text-rose-700">
                    <span>{d.negativeMentions} negative</span>
                    <span className="font-bold">
                      ~${d.estWasteSavedPerWeek}/wk waste avoided
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="📈 Demand forecast summary">
        <p className="text-sm leading-relaxed text-ink-soft">
          {brief.forecastSummary}
        </p>
      </Card>

      <Card title="💰 Net budget impact">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <BudgetTile
            label="Weekly cost change"
            value={fmt(brief.budgetImpact.weeklyCostDelta)}
            tone={brief.budgetImpact.weeklyCostDelta < 0 ? "good" : "bad"}
          />
          <BudgetTile
            label="Weekly revenue change"
            value={fmt(brief.budgetImpact.weeklyRevenueDelta)}
            tone={brief.budgetImpact.weeklyRevenueDelta > 0 ? "good" : "bad"}
          />
          <BudgetTile
            label="Net impact"
            value={fmt(brief.budgetImpact.netImpact)}
            tone={brief.budgetImpact.netImpact >= 0 ? "good" : "bad"}
            big
          />
        </div>
        <p className="mt-3 text-sm text-ink-soft">
          {brief.budgetImpact.summary}
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card
          title="🥗 Dietary & safety flags"
          subtitle="Coverage gaps and allergen alerts"
        >
          <div className="space-y-3">
            {brief.dietaryFlags.length === 0 && brief.coverageGaps.length === 0 ? (
              <p className="text-sm text-muted">
                No dietary issues flagged.
              </p>
            ) : (
              <>
                {brief.dietaryFlags.map((f, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-100"
                  >
                    {f}
                  </div>
                ))}
                {brief.coverageGaps.map((g, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-dashed border-amber-300 p-3 text-sm text-amber-700"
                  >
                    Coverage gap: {g}
                  </div>
                ))}
              </>
            )}
          </div>
        </Card>

        <Card title="💬 Top student quotes" subtitle="Verbatim, anonymized">
          <ul className="space-y-2">
            {brief.topQuotes.length === 0 ? (
              <li className="text-sm text-muted">No quotes yet.</li>
            ) : (
              brief.topQuotes.map((q, i) => (
                <li
                  key={i}
                  className="rounded-xl bg-cream-2/60 p-3 text-sm italic text-ink"
                >
                  &ldquo;{q}&rdquo;
                </li>
              ))
            )}
          </ul>
          {brief.unusualSignals.length > 0 && (
            <>
              <div className="mt-4 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                ⚡ Unusual signals
              </div>
              <ul className="space-y-2">
                {brief.unusualSignals.map((s, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-coral/30 bg-coral/5 p-3 text-sm text-ink"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function Badge({
  children,
  subtle,
}: {
  children: React.ReactNode;
  subtle?: boolean;
}) {
  return (
    <span
      className={`rounded-pill px-2 py-0.5 ${
        subtle
          ? "bg-white text-muted ring-1 ring-line"
          : "bg-ink text-white"
      }`}
    >
      {children}
    </span>
  );
}

function BudgetTile({
  label,
  value,
  tone,
  big,
}: {
  label: string;
  value: string;
  tone: "good" | "bad";
  big?: boolean;
}) {
  const cls = tone === "good" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700";
  return (
    <div className={`rounded-card p-4 ${cls} ${big ? "ring-2 ring-current" : ""}`}>
      <div className="text-[11px] uppercase tracking-wider opacity-70">
        {label}
      </div>
      <div className={`mt-1 font-display font-bold ${big ? "text-3xl" : "text-2xl"}`}>
        {value}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-5">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-card bg-white shadow-sm ring-1 ring-line"
        />
      ))}
    </div>
  );
}
