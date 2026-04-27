import {
  Users,
  Clock,
  AlertTriangle,
  TrendingDown,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { useIssuesStore } from "@/store/useIssuesStore";
import { getInsights } from "@/lib/analytics";
import { useMemo } from "react";
import { cn, formatDate, formatDays } from "@/lib/utils";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { useNavigate } from "@tanstack/react-router";

export function InsightsPanel() {
  const navigate = useNavigate();
  const { issues, file, clearIssues } = useIssuesStore();

  const insights = useMemo(() => {
    return getInsights(issues);
  }, [issues]);

  if (issues.length === 0) {
    return null;
  }

  const handleNewUpload = async () => {
    await clearIssues();
    navigate({ to: "/upload" });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Insights</h3>
        <button
          onClick={handleNewUpload}
          className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Upload new CSV
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {insights.mostOverloadedAssignee && (
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
              <Users className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Most Overloaded
              </p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {insights.mostOverloadedAssignee}
              </p>
            </div>
          </div>
        )}

        {insights.oldestUnresolvedTicket && (
          <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Oldest Unresolved
              </p>
              <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                {insights.oldestUnresolvedTicket.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDays(insights.oldestUnresolvedTicket.daysOpen)} old
              </p>
            </div>
          </div>
        )}

        {insights.bottleneckStatus && (
          <div className="flex items-start gap-3 rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40">
              <TrendingDown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Bottleneck Status
              </p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {insights.bottleneckStatus}
              </p>
            </div>
          </div>
        )}

        {insights.staleTicketCount > 0 && (
          <div className="flex items-start gap-3 rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Stale Tickets</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {insights.staleTicketCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                7+ days untouched
              </p>
            </div>
          </div>
        )}
      </div>

      {file && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>File: {file.name}</p>
            <p>{file.recordCount.toLocaleString()} records</p>
          </div>
          <DarkModeToggle />
        </div>
      )}
    </div>
  );
}