import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartCard } from "@/components/ChartCard";
import { useIssuesStore } from "@/store/useIssuesStore";
import { getProjectDistribution } from "@/lib/analytics";
import { useMemo } from "react";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <p className="font-medium text-gray-900 dark:text-gray-100">{data.project}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{data.count} issues</p>
      </div>
    );
  }
  return null;
};

export function ProjectBarChart() {
  const { issues } = useIssuesStore();

  const data = useMemo(() => {
    return getProjectDistribution(issues);
  }, [issues]);

  if (issues.length === 0 || data.length === 0) {
    return (
      <ChartCard title="Project Distribution" subtitle="Issues per project">
        <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          No project data available
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Project Distribution" subtitle={`Top ${Math.min(data.length, 20)} projects by issue count`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" dark stroke="#374151" />
          <XAxis
            dataKey="project"
            stroke="#6b7280"
            fontSize={11}
            angle={-45}
            textAnchor="end"
            height={80}
            tickFormatter={(value) => {
              if (String(value).length > 15) {
                return String(value).substring(0, 15) + "...";
              }
              return value;
            }}
          />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="count"
            fill="#8b5cf6"
            name="Issues"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}