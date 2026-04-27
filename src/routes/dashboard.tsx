import { createFileRoute } from "@tanstack/react-router";
import { useIssuesStore } from "@/store/useIssuesStore";
import { KPIGrid } from "@/components/KPIGrid";
import { StatusPieChart } from "@/components/Charts/StatusPieChart";
import { PriorityBarChart } from "@/components/Charts/PriorityBarChart";
import { TimelineChart } from "@/components/Charts/TimelineChart";
import { AssigneeBarChart } from "@/components/Charts/AssigneeBarChart";
import { IssuesDataTable } from "@/components/IssuesDataTable";
import { FiltersBar } from "@/components/FiltersBar";
import { InsightsPanel } from "@/components/InsightsPanel";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { SyncButton } from "@/components/SyncButton";
import { SyncStatus } from "@/components/SyncStatus";
import { FileSpreadsheet, ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { calculateKPIs } from "@/lib/analytics";
import { isConfigured } from "@/env";
import { useLinearIssues, useSyncIssues, useFormattedLastSync } from "@/hooks/useLinearIssues";
import { useMemo, useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  beforeLoad: async () => {
    const store = useIssuesStore.getState();
    await store.initFromStorage();

    // If not configured for live mode, require CSV data
    if (!isConfigured && store.issues.length === 0) {
      throw useRouter().history.replace("/upload");
    }
  },
});

function useRouter() {
  return { history: { replace: (path: string) => window.history.replaceState(null, "", path) } };
}

function Dashboard() {
  const navigate = useNavigate();
  const { issues: csvIssues, file, initFromStorage, isLoading: csvLoading } = useIssuesStore();
  const syncMutation = useSyncIssues();

  // Use live data if configured, otherwise fallback to CSV
  const isLiveMode = isConfigured;

  // Get issues from either source
  const {
    data: liveIssues = [],
    isLoading: liveLoading,
    error: liveError,
    refetch,
  } = useLinearIssues();

  const issues = isLiveMode ? liveIssues : csvIssues;

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  const kpis = useMemo(() => {
    return calculateKPIs(issues);
  }, [issues]);

  const lastSync = useFormattedLastSync();

  const isLoading = isLiveMode ? liveLoading : csvLoading;
  const hasData = issues.length > 0;

  const handleSyncComplete = () => {
    refetch();
  };

  if (isLoading && !hasData) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (!hasData) {
    return (
      <EmptyState
        title="No data loaded"
        description={
          isLiveMode
            ? "Sync from Linear to see your analytics"
            : "Upload a Linear CSV to see your analytics"
        }
        action={
          isLiveMode ? (
            <SyncButton onSuccess={handleSyncComplete} />
          ) : (
            <button
              onClick={() => navigate({ to: "/upload" })}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Upload CSV
            </button>
          )
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: "/upload" })}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Dashboard
              </h1>
              {file && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {file.name} • {file.recordCount.toLocaleString()} records
                </p>
              )}
              {isLiveMode && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {issues.length.toLocaleString()} issues • Last sync: {lastSync}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isLiveMode && (
              <>
                <SyncStatus />
                <SyncButton />
              </>
            )}
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <KPIGrid kpis={kpis} />

          <div className="grid gap-6 lg:grid-cols-2">
            <StatusPieChart />
            <PriorityBarChart />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <TimelineChart />
            <AssigneeBarChart />
          </div>

          <InsightsPanel />

          <FiltersBar />

          <IssuesDataTable />
        </div>
      </main>
    </div>
  );
}