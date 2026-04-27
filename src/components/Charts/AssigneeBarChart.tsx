import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartCard } from "@/components/ChartCard";
import { useIssuesStore } from "@/store/useIssuesStore";
import { getAssigneeWorkload } from "@/lib/analytics";
import { useMemo } from "react";

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#14b8a6",
  "#6366f1",
  "#ef4444",
  "#22c55e",
  "#a855f7",
  "#06b6d4",
];

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; open: number; closed: number; total: number } }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <p className="font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Open: {data.open}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Closed: {data.closed}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Total: {data.total}</p>
      </div>
    );
  }
  return null;
};

export function AssigneeBarChart() {
  const { issues } = useIssuesStore();

  const data = useMemo(() => {
    return getAssigneeWorkload(issues).slice(0, 10);
  }, [issues]);

  if (issues.length === 0 || data.length === 0) {
    return (
      <ChartCard title="Workload by Assignee" subtitle="Open vs closed issues">
        <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          No assignee data available
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Workload by Assignee" subtitle="Top 10 assignees by total issues">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          <XAxis type="number" stroke="#6b7280" fontSize={12} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#6b7280"
            fontSize={11}
            width={90}
            tickFormatter={(value) => {
              if (value.length > 12) return value.substring(0, 12) + "...";
              return value;
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "12px" }}
          />
          <Bar dataKey="open" stackId="a" fill="#f59e0b" name="Open" radius={[0, 0, 0, 0]} />
          <Bar dataKey="closed" stackId="a" fill="#22c55e" name="Closed" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}