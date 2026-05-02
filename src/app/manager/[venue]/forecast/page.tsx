import { buildForecast, activeContext } from "@/lib/manager/forecast";
import { aggregateStudentData } from "@/lib/aggregate-student-data";
import { connectDB } from "@/lib/mongodb";
import { surveyDemandMultiplier } from "@/lib/manager/scoring";
import { VENUE_LABEL, type Venue } from "@/lib/manager/types";
import { Card, PageHeader } from "@/components/manager/Card";
import { ForecastAreaChart } from "@/components/manager/Charts";
import KpiCard from "@/components/manager/KpiCard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ForecastPage({
  params,
}: {
  params: { venue: string };
}) {
  const venue = params.venue as Venue;
  await connectDB();
  const [forecast, data] = await Promise.all([
    buildForecast(venue, 7),
    aggregateStudentData(venue, 1),
  ]);
  const ctx = activeContext(7);
  const surveyMul = surveyDemandMultiplier(data);

  return (
    <>
      <PageHeader
        title="Demand Forecast"
        subtitle={`${VENUE_LABEL[venue]} · 7-day projection · 3-input model`}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="① Survey signal"
          value={`${surveyMul >= 1 ? "+" : ""}${Math.round((surveyMul - 1) * 100)}%`}
          hint={`${data.totalSessions} student sessions analyzed`}
          accent="coral"
          icon="🗳️"
        />
        <KpiCard
          label="② Campus events"
          value={`${ctx.events.length}`}
          hint={`${ctx.events.filter((e) => e.demandMultiplier < 1).length} dampen, ${
            ctx.events.filter((e) => e.demandMultiplier > 1).length
          } boost`}
          accent="yale"
          icon="📅"
        />
        <KpiCard
          label="③ Exchange / away"
          value={`${ctx.exchanges.reduce((s, w) => s + w.studentsAway, 0)}`}
          hint={`students off-campus during forecast`}
          accent="ink"
          icon="✈️"
        />
      </div>

      <Card
        title="Predicted servings · next 7 days"
        subtitle="Survey × events × exchange-weeks → daily projection with confidence band"
        className="mb-6"
      >
        <ForecastAreaChart data={forecast.days} />
      </Card>

      <Card
        title="Day-by-day breakdown"
        subtitle="See how each input contributes to the final number"
        className="mb-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="pb-2 pr-3">Day</th>
                <th className="pb-2 pr-3">Survey</th>
                <th className="pb-2 pr-3">Events</th>
                <th className="pb-2 pr-3">Exchange</th>
                <th className="pb-2 pr-3">Prediction</th>
                <th className="pb-2 pr-3">Range</th>
                <th className="pb-2">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {forecast.days.map((d) => (
                <tr key={d.date} className="border-t border-line">
                  <td className="py-3 pr-3">
                    <div className="font-semibold text-ink">{d.dayOfWeek}</div>
                    <div className="text-xs text-muted">
                      {new Date(d.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="py-3 pr-3">
                    <Pill v={1 + d.drivers.surveySignal * 0.15} />
                  </td>
                  <td className="py-3 pr-3">
                    <Pill v={d.drivers.eventModifier} />
                  </td>
                  <td className="py-3 pr-3">
                    <Pill v={d.drivers.exchangeModifier} />
                  </td>
                  <td className="py-3 pr-3 font-display text-lg font-bold text-ink">
                    {d.predictedServings}
                  </td>
                  <td className="py-3 pr-3 text-xs text-muted">
                    {d.low} – {d.high}
                  </td>
                  <td className="py-3">
                    <ConfidenceBadge level={d.confidence} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card
          title="Campus events"
          subtitle="Pulled from SOM events calendar (mocked)"
        >
          {ctx.events.length === 0 ? (
            <p className="text-sm text-muted">No events on the horizon.</p>
          ) : (
            <ul className="space-y-3">
              {ctx.events.map((e) => (
                <li
                  key={e.date + e.name}
                  className="rounded-xl border border-line px-3 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                      {new Date(e.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span
                      className={`rounded-pill px-2 py-0.5 text-[11px] font-bold ${
                        e.demandMultiplier < 1
                          ? "bg-rose-100 text-rose-600"
                          : "bg-emerald-100 text-emerald-600"
                      }`}
                    >
                      {e.demandMultiplier < 1 ? "" : "+"}
                      {Math.round((e.demandMultiplier - 1) * 100)}%
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-medium text-ink">
                    {e.name}
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    {e.attendance} expected · type: {e.type}
                  </div>
                  {e.note && (
                    <div className="mt-1 text-xs italic text-muted">
                      {e.note}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Students away on exchange"
          subtitle="Lower body count = lower baseline demand"
        >
          {ctx.exchanges.length === 0 ? (
            <p className="text-sm text-muted">
              No exchange weeks during this horizon.
            </p>
          ) : (
            <ul className="space-y-3">
              {ctx.exchanges.map((w) => (
                <li
                  key={w.weekOf}
                  className="rounded-xl border border-line px-3 py-3"
                >
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Week of{" "}
                    {new Date(w.weekOf).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="mt-1 text-sm font-medium text-ink">
                    {w.programName}
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="font-display text-2xl font-bold text-ink">
                      {w.studentsAway}
                    </div>
                    <div className="text-xs text-muted">
                      students away ·{" "}
                      <b>
                        {Math.round((w.studentsAway / w.totalSomBody) * 100)}%
                      </b>{" "}
                      of body
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-2">
                    <div
                      className="h-full bg-yale"
                      style={{
                        width: `${Math.min(100, (w.studentsAway / w.totalSomBody) * 100)}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function Pill({ v }: { v: number }) {
  const pct = Math.round((v - 1) * 100);
  const cls =
    pct === 0
      ? "bg-cream-2 text-ink-soft"
      : pct < 0
        ? "bg-rose-100 text-rose-600"
        : "bg-emerald-100 text-emerald-600";
  return (
    <span
      className={`inline-block rounded-pill px-2 py-0.5 text-xs font-semibold ${cls}`}
    >
      {pct === 0 ? "—" : pct > 0 ? `+${pct}%` : `${pct}%`}
    </span>
  );
}

function ConfidenceBadge({
  level,
}: {
  level: "high" | "medium" | "low";
}) {
  const cls =
    level === "high"
      ? "bg-emerald-100 text-emerald-700"
      : level === "medium"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-100 text-slate-600";
  return (
    <span
      className={`rounded-pill px-2 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      {level}
    </span>
  );
}
