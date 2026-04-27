import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useIssuesStore } from "@/store/useIssuesStore";
import { getStatusDistribution } from "@/lib/analytics";
import { useMemo } from "react";

const STATUS_COLORS: Record<string, string> = {
  Backlog: "#6b7280",
  Todo: "#3b82f6",
  "In Progress": "#f59e0b",
  "In Review": "#8b5cf6",
  Done: "#22c55e",
  Canceled: "#ef4444",
  Duplicate: "#9ca3af",
  Unstarted: "#94a3b8",
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; color: string } }> }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <p className="font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {data.value} issues
        </p>
      </div>
    );
  }
  return null;
};

export function StatusChart() {
  const { issues } = useIssuesStore();

  const data = useMemo(() => {
    return getStatusDistribution(issues);
  }, [issues]);

  if (issues.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col rounded-xl border bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Issues by Status
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Count by status
        </p>
      </div>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#e5e7eb"
              //dark stroke="#374151"
            />
            <XAxis type="number" stroke="#6b7280" fontSize={12} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#6b7280"
              fontSize={12}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}