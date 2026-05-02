"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CORAL = "#FF6B6B";
const YALE = "#0F4D92";
const INK = "#1B2845";
const PALETTE = [CORAL, YALE, INK, "#F5A623", "#52C5A8", "#9B6BFF", "#FF8E72"];

const tooltipStyle = {
  backgroundColor: "rgba(27, 40, 69, 0.95)",
  border: "none",
  borderRadius: 12,
  color: "#fff",
  fontSize: 12,
  padding: "8px 10px",
};

export function ForecastAreaChart({
  data,
}: {
  data: { date: string; dayOfWeek: string; predictedServings: number; low: number; high: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CORAL} stopOpacity={0.3} />
            <stop offset="100%" stopColor={CORAL} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,40,69,0.06)" />
        <XAxis dataKey="dayOfWeek" tick={{ fill: INK, fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: INK, fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(27,40,69,0.04)" }} />
        <Area type="monotone" dataKey="high" stroke="none" fill="url(#bandGradient)" />
        <Area type="monotone" dataKey="low" stroke="none" fill="#FAF7F2" />
        <Line type="monotone" dataKey="predictedServings" stroke={CORAL} strokeWidth={3} dot={{ r: 4, fill: CORAL }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryBarChart({
  data,
  height = 260,
}: {
  data: { category: string; count: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,40,69,0.06)" horizontal={false} />
        <XAxis type="number" tick={{ fill: INK, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis dataKey="category" type="category" tick={{ fill: INK, fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(27,40,69,0.04)" }} />
        <Bar dataKey="count" radius={[0, 8, 8, 0]} fill={CORAL} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function VotesBarChart({
  data,
  height = 260,
}: {
  data: { itemName: string; netVotes: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 32 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,40,69,0.06)" />
        <XAxis dataKey="itemName" tick={{ fill: INK, fontSize: 11 }} axisLine={false} tickLine={false} angle={-12} textAnchor="end" />
        <YAxis tick={{ fill: INK, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(27,40,69,0.04)" }} />
        <Bar dataKey="netVotes" radius={[8, 8, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.netVotes >= 0 ? CORAL : "#94a3b8"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DietaryDonut({
  data,
  height = 240,
}: {
  data: { tag: string; count: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="tag"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={90}
          paddingAngle={3}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          wrapperStyle={{ fontSize: 11 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ReactionLineChart({
  data,
}: {
  data: { date: string; up: number; mid: number; down: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,40,69,0.06)" />
        <XAxis dataKey="date" tick={{ fill: INK, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: INK, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="up" stroke="#52C5A8" strokeWidth={2} dot={{ r: 3 }} name="👍" />
        <Line type="monotone" dataKey="mid" stroke="#F5A623" strokeWidth={2} dot={{ r: 3 }} name="😐" />
        <Line type="monotone" dataKey="down" stroke={CORAL} strokeWidth={2} dot={{ r: 3 }} name="👎" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function WordCloud({ tags }: { tags: { tag: string; count: number }[] }) {
  if (tags.length === 0) {
    return <p className="text-sm text-muted">Not enough text input yet.</p>;
  }
  const max = tags[0]?.count ?? 1;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((t, i) => {
        const scale = 0.85 + (t.count / max) * 0.9;
        const color =
          i % 5 === 0
            ? "text-coral"
            : i % 5 === 1
              ? "text-yale"
              : i % 5 === 2
                ? "text-ink"
                : i % 5 === 3
                  ? "text-emerald-600"
                  : "text-amber-600";
        return (
          <span
            key={t.tag}
            className={`inline-block font-display font-semibold ${color}`}
            style={{ fontSize: `${scale}rem`, lineHeight: 1.1 }}
          >
            {t.tag}
          </span>
        );
      })}
    </div>
  );
}
