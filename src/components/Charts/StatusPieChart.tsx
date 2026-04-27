import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartCard } from "@/components/ChartCard";
import { useIssuesStore } from "@/store/useIssuesStore";
import { getStatusDistribution } from "@/lib/analytics";
import { useMemo } from "react";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <p className="font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {data.value} issues ({((data.value / payload[0].payload.total) * 100).toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

export function StatusPieChart() {
  const { issues } = useIssuesStore();

  const data = useMemo(() => {
    const distribution = getStatusDistribution(issues);
    const total = issues.length;
    return distribution.map((d) => ({ ...d, total }));
  }, [issues]);

  if (issues.length === 0) {
    return null;
  }

  return (
    <ChartCard title="Issues by Status" subtitle="Distribution of issue statuses">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}