import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartCard } from "@/components/ChartCard";
import { useIssuesStore } from "@/store/useIssuesStore";
import { getTimelineData } from "@/lib/analytics";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <p className="font-medium text-gray-900 dark:text-gray-100">
          {label}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Created: {payload.find((p: any) => p.dataKey === "created")?.value || 0}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Completed: {payload.find((p: any) => p.dataKey === "completed")?.value || 0}
        </p>
      </div>
    );
  }
  return null;
};

export function TimelineChart() {
  const { issues } = useIssuesStore();

  const data = useMemo(() => {
    return getTimelineData(issues);
  }, [issues]);

  if (issues.length === 0 || data.length === 0) {
    return (
      <ChartCard title="Issues Over Time" subtitle="Created vs completed">
        <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          No timeline data available
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Issues Over Time" subtitle="Cumulative created vs completed">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" dark stroke="#374151" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            fontSize={11}
            tickFormatter={(value) => format(parseISO(value), "MMM d")}
          />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "12px" }}
          />
          <Line
            type="monotone"
            dataKey="created"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Created"
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            name="Completed"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}