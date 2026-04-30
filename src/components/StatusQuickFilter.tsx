import { useMemo } from "react";
import { useIssuesStore } from "@/store/useIssuesStore";
import { getStatusDistribution } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { LinearStatus } from "@/lib/types";

const STATUS_ORDER: LinearStatus[] = [
  "Backlog",
  "Todo",
  "In Progress",
  "In Review",
  "QA",
  "Pending QA Deploy",
  "Done",
  "Canceled",
  "Duplicate",
  "Unstarted",
  "Triage",
];

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Backlog: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300", dot: "bg-gray-500" },
  Todo: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
  "In Progress": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
  "In Review": { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", dot: "bg-purple-500" },
  QA: { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300", dot: "bg-cyan-500" },
  "Pending QA Deploy": { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300", dot: "bg-orange-500" },
  Done: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", dot: "bg-green-500" },
  Canceled: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", dot: "bg-red-500" },
  Duplicate: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400", dot: "bg-gray-400" },
  Unstarted: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", dot: "bg-gray-500" },
  Triage: { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-700 dark:text-pink-300", dot: "bg-pink-500" },
};

export function StatusQuickFilter() {
  const { issues, filters, setFilters } = useIssuesStore();

  const distribution = useMemo(() => {
    return getStatusDistribution(issues);
  }, [issues]);

  const handleStatusClick = (status: LinearStatus) => {
    const isActive = filters.status.includes(status);
    if (isActive) {
      setFilters({ status: filters.status.filter((s) => s !== status) });
    } else {
      setFilters({ status: [...filters.status, status] });
    }
  };

  const activeStatuses = filters.status;

  const sortedDistribution = useMemo(() => {
    const map = new Map(distribution.map((d) => [d.name, d]));
    return STATUS_ORDER
      .filter((status) => map.has(status))
      .map((status) => map.get(status)!)
      .filter(Boolean);
  }, [distribution]);

  if (issues.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Status Filter
        </h3>
        {activeStatuses.length > 0 && (
          <button
            onClick={() => setFilters({ status: [] })}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {sortedDistribution.map((item) => {
          const isActive = activeStatuses.includes(item.name as LinearStatus);
          const colors = STATUS_COLORS[item.name] || STATUS_COLORS.Backlog;

          return (
            <button
              key={item.name}
              onClick={() => handleStatusClick(item.name as LinearStatus)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all hover:shadow-sm",
                isActive
                  ? cn(colors.bg, colors.text, "ring-2 ring-offset-1 ring-current")
                  : cn("bg-gray-50 dark:bg-gray-800", "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700")
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", colors.dot)} />
              <span>{item.name}</span>
              <span
                className={cn(
                  "ml-1 rounded-full px-1.5 py-0.5 text-xs",
                  isActive ? "bg-white/30 dark:bg-black/20" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                )}
              >
                {item.value}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
