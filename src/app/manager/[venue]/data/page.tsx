import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Session from "@/models/Session";
import Vote from "@/models/Vote";
import Preference from "@/models/Preference";
import Reaction from "@/models/Reaction";
import DeepTalk from "@/models/DeepTalk";
import { VENUE_LABEL, type Venue } from "@/lib/manager/types";
import { Card, PageHeader } from "@/components/manager/Card";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PrefRow {
  _id?: { toString(): string };
  sessionId: string;
  createdAt: Date;
  flavors?: string[];
  proteins?: string[];
  cuisines?: string[];
  dietary?: string[];
  freeText?: string;
}
interface VoteRow {
  _id?: { toString(): string };
  sessionId: string;
  itemId: string;
  value: number;
  createdAt: Date;
}
interface ReactionRow {
  _id?: { toString(): string };
  sessionId: string;
  value: string;
  feedback?: string;
  createdAt: Date;
}
interface DeepTalkRow {
  _id?: { toString(): string };
  sessionId: string;
  createdAt: Date;
  extractedTags?: string[];
  transcript?: { role: string; text: string }[];
}
interface SessionRow {
  _id?: { toString(): string };
  sessionId: string;
  startedAt: Date;
  finishedAt?: Date;
  entrySource: string;
  completedStage: string;
}

type Tab = "preferences" | "votes" | "reactions" | "deeptalk" | "sessions";
const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: "preferences", label: "Preferences", emoji: "🎯" },
  { key: "votes", label: "Votes", emoji: "🗳️" },
  { key: "reactions", label: "Reactions", emoji: "💬" },
  { key: "deeptalk", label: "Deep talk", emoji: "🧠" },
  { key: "sessions", label: "Sessions", emoji: "👥" },
];

export default async function DataPage({
  params,
  searchParams,
}: {
  params: { venue: string };
  searchParams: { tab?: string };
}) {
  const venue = params.venue as Venue;
  const tab: Tab = (TABS.find((t) => t.key === searchParams.tab)?.key ??
    "preferences") as Tab;

  await connectDB();

  return (
    <>
      <PageHeader
        title="Raw Data"
        subtitle={`${VENUE_LABEL[venue]} · everything students submitted`}
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/manager/${venue}/data?tab=${t.key}`}
            className={`rounded-pill px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-ink text-white shadow-sm"
                : "bg-white text-ink-soft ring-1 ring-line hover:bg-cream-2"
            }`}
          >
            <span className="mr-1.5">{t.emoji}</span>
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "preferences" && <PreferencesTable venue={venue} />}
      {tab === "votes" && <VotesTable venue={venue} />}
      {tab === "reactions" && <ReactionsTable venue={venue} />}
      {tab === "deeptalk" && <DeepTalkTable venue={venue} />}
      {tab === "sessions" && <SessionsTable venue={venue} />}
    </>
  );
}

async function PreferencesTable({ venue }: { venue: Venue }) {
  const rows = (await Preference.find({ venue })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()) as unknown as PrefRow[];
  return (
    <Card title={`${rows.length} preference submissions`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted">
            <tr>
              <Th>When</Th>
              <Th>Session</Th>
              <Th>Flavors</Th>
              <Th>Proteins</Th>
              <Th>Cuisines</Th>
              <Th>Dietary</Th>
              <Th>Free text</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id?.toString()} className="border-t border-line align-top">
                <Td mono>{relativeTime(r.createdAt)}</Td>
                <Td mono>{r.sessionId.slice(-8)}</Td>
                <Td><Tags items={r.flavors ?? []} /></Td>
                <Td><Tags items={r.proteins ?? []} /></Td>
                <Td><Tags items={r.cuisines ?? []} /></Td>
                <Td><Tags items={r.dietary ?? []} /></Td>
                <Td>
                  {r.freeText ? (
                    <span className="italic text-ink">&ldquo;{r.freeText}&rdquo;</span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </Td>
              </tr>
            ))}
            {rows.length === 0 && <Empty />}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

async function VotesTable({ venue }: { venue: Venue }) {
  const rows = (await Vote.find({ venue }).sort({ createdAt: -1 }).limit(100).lean()) as unknown as VoteRow[];
  return (
    <Card title={`${rows.length} most-recent votes`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted">
            <tr>
              <Th>When</Th>
              <Th>Session</Th>
              <Th>Item</Th>
              <Th>Direction</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id?.toString()} className="border-t border-line">
                <Td mono>{relativeTime(r.createdAt)}</Td>
                <Td mono>{r.sessionId.slice(-8)}</Td>
                <Td>{r.itemId}</Td>
                <Td>
                  {r.value > 0 ? (
                    <span className="rounded-pill bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      ▲ +1
                    </span>
                  ) : (
                    <span className="rounded-pill bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                      ▼ -1
                    </span>
                  )}
                </Td>
              </tr>
            ))}
            {rows.length === 0 && <Empty />}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

async function ReactionsTable({ venue }: { venue: Venue }) {
  // Reactions don't store venue directly — fall back to itemId ~ venue.
  const rows = (await Reaction.find({
    $or: [{ itemId: venue }, { itemId: { $regex: venue } }],
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()) as unknown as ReactionRow[];
  return (
    <Card title={`${rows.length} reactions${rows.length === 100 ? "+" : ""}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted">
            <tr>
              <Th>When</Th>
              <Th>Session</Th>
              <Th>Reaction</Th>
              <Th>Feedback</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id?.toString()} className="border-t border-line">
                <Td mono>{relativeTime(r.createdAt)}</Td>
                <Td mono>{r.sessionId.slice(-8)}</Td>
                <Td>
                  <ReactionBadge value={r.value} />
                </Td>
                <Td>
                  {r.feedback ? (
                    <span className="italic text-ink">&ldquo;{r.feedback}&rdquo;</span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </Td>
              </tr>
            ))}
            {rows.length === 0 && <Empty />}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

async function DeepTalkTable({ venue }: { venue: Venue }) {
  // DeepTalks don't have venue, but seed sessions encode venue in sessionId.
  const rows = (await DeepTalk.find({
    sessionId: { $regex: venue },
  })
    .sort({ createdAt: -1 })
    .limit(40)
    .lean()) as unknown as DeepTalkRow[];
  return (
    <Card title={`${rows.length} deep-talk transcripts`}>
      <div className="space-y-4">
        {rows.length === 0 && <p className="text-sm text-muted">None yet.</p>}
        {rows.map((r) => (
          <div
            key={r._id?.toString()}
            className="rounded-xl border border-line p-4"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
              <span className="font-mono">
                {r.sessionId.slice(-8)} · {relativeTime(r.createdAt)}
              </span>
              <Tags items={r.extractedTags ?? []} />
            </div>
            <div className="space-y-1.5 text-sm">
              {(r.transcript ?? []).map(
                (
                  t: { role: string; text: string },
                  i: number,
                ) => (
                  <div
                    key={i}
                    className={`rounded-xl px-3 py-2 ${
                      t.role === "user"
                        ? "ml-8 bg-coral/10 text-ink"
                        : "mr-8 bg-cream-2/60 text-ink-soft"
                    }`}
                  >
                    <span className="mr-1 text-[10px] font-bold uppercase tracking-wider opacity-50">
                      {t.role}
                    </span>
                    {t.text}
                  </div>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

async function SessionsTable({ venue }: { venue: Venue }) {
  const rows = (await Session.find({ venueQR: venue })
    .sort({ startedAt: -1 })
    .limit(100)
    .lean()) as unknown as SessionRow[];
  return (
    <Card title={`${rows.length} sessions`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted">
            <tr>
              <Th>Session ID</Th>
              <Th>Started</Th>
              <Th>Source</Th>
              <Th>Stage</Th>
              <Th>Duration</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id?.toString()} className="border-t border-line">
                <Td mono>{r.sessionId}</Td>
                <Td mono>{relativeTime(r.startedAt)}</Td>
                <Td>{r.entrySource}</Td>
                <Td>
                  <span className="rounded-pill bg-cream-2 px-2 py-0.5 text-xs">
                    {r.completedStage}
                  </span>
                </Td>
                <Td mono>
                  {r.finishedAt
                    ? `${Math.round(
                        (new Date(r.finishedAt).getTime() -
                          new Date(r.startedAt).getTime()) /
                          1000,
                      )}s`
                    : "—"}
                </Td>
              </tr>
            ))}
            {rows.length === 0 && <Empty />}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 pb-2">{children}</th>;
}
function Td({
  children,
  mono,
}: {
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <td className={`px-3 py-3 ${mono ? "font-mono text-xs text-muted" : "text-ink"}`}>
      {children}
    </td>
  );
}
function Empty() {
  return (
    <tr>
      <td colSpan={10} className="px-3 py-12 text-center text-sm text-muted">
        No records yet — run <code>tsx scripts/seed-dummy-data.ts</code> to seed
        demo data.
      </td>
    </tr>
  );
}
function Tags({ items }: { items: string[] }) {
  if (!items?.length) return <span className="text-muted">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((i) => (
        <span
          key={i}
          className="rounded-pill bg-cream-2 px-2 py-0.5 text-[11px] text-ink-soft"
        >
          {i}
        </span>
      ))}
    </div>
  );
}
function ReactionBadge({ value }: { value: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    up: { label: "👍 Liked", cls: "bg-emerald-100 text-emerald-700" },
    mid: { label: "😐 Mid", cls: "bg-amber-100 text-amber-700" },
    down: { label: "👎 Negative", cls: "bg-rose-100 text-rose-700" },
  };
  const m = map[value] ?? { label: value, cls: "bg-cream-2 text-ink-soft" };
  return (
    <span
      className={`rounded-pill px-2 py-0.5 text-xs font-semibold ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

function relativeTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const ms = Date.now() - date.getTime();
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  return `${days}d ago`;
}
