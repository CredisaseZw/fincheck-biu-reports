import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import useGetClientMonthlyStats from "@/hooks/api/useGetClientMonthlyStats";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey: string; name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-white dark:bg-background px-3 py-2 shadow-md">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-xs" style={{ color: entry.color }}>
          {entry.name} : {entry.value}
        </p>
      ))}
    </div>
  );
}

export function ClientMonthlyStatsChart() {
  const { data, isLoading, isError } = useGetClientMonthlyStats();
  if (isLoading) {
    return <Skeleton className="h-87.5 w-full rounded-lg" />;
  }

  if (isError || !data) {
    return (
      <div className="flex h-87.5 items-center justify-center text-sm text-muted-foreground">
        Failed to load report stats.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    month: MONTH_LABELS[d.month - 1],
    Finalized: d.finalized,
    Active: d.active,
  }));

  return (
    <div className="h-87.5 w-full rounded-lg border p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            className="fill-muted-foreground"
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            className="fill-muted-foreground"
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Finalized" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Active" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}