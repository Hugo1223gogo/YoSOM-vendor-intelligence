import { aggregateStudentData } from "@/lib/aggregate-student-data";
import { connectDB } from "@/lib/mongodb";
import {
  satisfactionPulse,
  topVotedItems,
  tagFrequency,
} from "@/lib/manager/scoring";
import { buildForecast, activeContext } from "@/lib/manager/forecast";
import { VENUE_LABEL, type Venue } from "@/lib/manager/types";
import KpiCard from "@/components/manager/KpiCard";
import { Card, PageHeader } from "@/components/manager/Card";
import {
  CategoryBarChart,
  DietaryDonut,
  ForecastAreaChart,
  VotesBarChart,
  WordCloud,
} from "@/components/manager/Charts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OverviewPage({
  params,
}: {
  params: { venue: string };
}) {
  const venue = params.venue as Venue;
  await connectDB();
  const [data, forecast] = await Promise.all([
    aggregateStudentData(venue, 1),
    buildForecast(venue, 7),
  ]);
  const pulse = satisfactionPulse(data);
  const top = topVotedItems(data, 5);
  const cloud = tagFrequency(data);
  const ctx = activeContext(7);

  const flavorRows = Object.entries(data.flavorCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const proteinRows = Object.entries(data.proteinCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const cuisineRows = Object.entries(data.cuisineCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const dietaryRows = Object.entries(data.dietaryCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .filter((d) => d.tag !== "none")
    .slice(0, 6);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <PageHeader
        title={VENUE_LABEL[venue]}
        subtitle={`Operations overview · ${today}`}
        right={
          <div className="flex items-center gap-2 rounded-pill bg-white px-3 py-1.5 text-xs font-medium text-ink shadow-sm ring-1 ring-line">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Live · refreshing every 10s
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Sessions (rolling 7d)"
          value={data.totalSessions}
          hint="student inputs collected"
          accent="cream"
          icon="👥"
        />
        <KpiCard
          label="Satisfaction Pulse"
          value={`${pulse.score}/100`}
          delta={`${pulse.trend === "up" ? "+" : pulse.trend === "down" ? "-" : ""}${
            Math.abs(pulse.score - 70)
          } vs baseline`}
          trend={pulse.trend}
          accent="ink"
          icon="❤"
        />
        <KpiCard
          label="Predicted Servings (7d)"
          value={forecast.weeklyTotals.predictedServings}
          delta={`${forecast.weeklyTotals.deltaPct >= 0 ? "+" : ""}${
            forecast.weeklyTotals.deltaPct
          }% vs baseline`}
          trend={
            forecast.weeklyTotals.deltaPct > 0
              ? "up"
              : forecast.weeklyTotals.deltaPct < 0
                ? "down"
                : "flat"
          }
          accent="coral"
          icon="📈"
        />
        <KpiCard
          label="Free-text Quotes"
          value={data.freeTextSamples.length}
          hint="open-ended student voice"
          accent="yale"
          icon="💬"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card
          title="Demand forecast"
          subtitle="Next 7 days · servings, with confidence band"
          className="lg:col-span-2"
        >
          <ForecastAreaChart data={forecast.days} />
          <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted">
            <span>
              <span className="mr-1 inline-block h-2 w-3 rounded-sm bg-coral/30" />
              high/low band
            </span>
            <span>
              <span className="mr-1 inline-block h-2 w-3 rounded-sm bg-coral" />
              predicted
            </span>
            <span>
              Confidence: <b className="text-ink-soft">{forecast.days[0]?.confidence}</b>
            </span>
          </div>
        </Card>
        <Card title="Active drivers" subtitle="What's moving the forecast">
          <ul className="space-y-3 text-sm">
            {ctx.events.length === 0 && ctx.exchanges.length === 0 && (
              <li className="text-muted">No major events scheduled.</li>
            )}
            {ctx.events.slice(0, 4).map((e) => (
              <li
                key={e.date + e.name}
                className="rounded-xl bg-cream-2/60 px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-soft">
                    {new Date(e.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      e.demandMultiplier < 1 ? "text-rose-500" : "text-emerald-500"
                    }`}
                  >
                    {e.demandMultiplier < 1 ? "" : "+"}
                    {Math.round((e.demandMultiplier - 1) * 100)}%
                  </span>
                </div>
                <div className="mt-1 text-sm text-ink">{e.name}</div>
              </li>
            ))}
            {ctx.exchanges.map((w) => (
              <li
                key={w.weekOf}
                className="rounded-xl border border-dashed border-line px-3 py-2"
              >
                <div className="text-xs font-semibold text-ink-soft">
                  Week of{" "}
                  {new Date(w.weekOf).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="mt-1 text-sm text-ink">{w.programName}</div>
                <div className="mt-1 text-xs text-muted">
                  {w.studentsAway} students away (
                  {Math.round((w.studentsAway / w.totalSomBody) * 100)}% of body)
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card
          title="Top voted items"
          subtitle="Net votes from student input"
          className="lg:col-span-2"
        >
          {top.length === 0 ? (
            <p className="text-sm text-muted">No votes yet.</p>
          ) : (
            <VotesBarChart data={top.map((t) => ({ itemName: t.itemName, netVotes: t.netVotes }))} />
          )}
        </Card>
        <Card title="Dietary signal" subtitle="Self-declared by students">
          {dietaryRows.length === 0 ? (
            <p className="text-sm text-muted">No dietary input yet.</p>
          ) : (
            <DietaryDonut data={dietaryRows} />
          )}
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card title="Flavors" subtitle="Most-requested">
          <CategoryBarChart data={flavorRows} height={220} />
        </Card>
        <Card title="Proteins" subtitle="Most-requested">
          <CategoryBarChart data={proteinRows} height={220} />
        </Card>
        <Card title="Cuisines" subtitle="Most-requested">
          <CategoryBarChart data={cuisineRows} height={220} />
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card
          title="Voice of student"
          subtitle="Word frequency from tags + free text"
          className="lg:col-span-2"
        >
          <WordCloud tags={cloud} />
        </Card>
        <Card title="Recent quotes" subtitle="Verbatim, anonymized">
          {data.freeTextSamples.length === 0 ? (
            <p className="text-sm text-muted">Nothing here yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.freeTextSamples.slice(0, 5).map((q, i) => (
                <li
                  key={i}
                  className="rounded-xl bg-cream-2/60 px-3 py-2 text-sm italic text-ink"
                >
                  &ldquo;{q}&rdquo;
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <RefreshTicker />
    </>
  );
}

function RefreshTicker() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `setTimeout(function(){location.reload();}, 10000);`,
      }}
    />
  );
}
