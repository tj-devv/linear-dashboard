import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ChartCard } from "@/components/ChartCard";
import { useIssuesStore } from "@/store/useIssuesStore";
import { getPriorityDistribution } from "@/lib/analytics";
import { useMemo } from "react";

const PRIORITY_COLORS: Record<string, string> = {
  Urgent: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#22c55e",
  "No priority": "#6b7280",
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <p className="font-medium text-gray-900 dark:text-gray-100">{data.priority}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {data.count} issues
        </p>
      </div>
    );
  }
  return null;
};

export function PriorityBarChart() {
  const { issues } = useIssuesStore();

  const data = useMemo(() => {
    return getPriorityDistribution(issues);
  }, [issues]);

  if (issues.length === 0) {
    return null;
  }

  return (
    <ChartCard title="Issues by Priority" subtitle="Count by priority level">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#e5e7eb"
            dark stroke="#374151"
          />
          <XAxis type="number" stroke="#6b7280" fontSize={12} />
          <YAxis
            type="category"
            dataKey="priority"
            stroke="#6b7280"
            fontSize={12}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.priority}
                fill={PRIORITY_COLORS[entry.priority] || "#6b7280"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}