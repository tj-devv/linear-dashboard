import { createFileRoute } from "@tanstack/react-router";
import { useIssuesStore } from "@/store/useIssuesStore";
import { KPIGrid } from "@/components/KPIGrid";
import { StatusPieChart } from "@/components/Charts/StatusPieChart";
import { PriorityBarChart } from "@/components/Charts/PriorityBarChart";
import { TimelineChart } from "@/components/Charts/TimelineChart";
import { AssigneeBarChart } from "@/components/Charts/AssigneeBarChart";
import { ProjectBarChart } from "@/components/Charts/ProjectBarChart";
import { IssuesDataTable } from "@/components/IssuesDataTable";
import { FiltersBar } from "@/components/FiltersBar";
import { InsightsPanel } from "@/components/InsightsPanel";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { FileSpreadsheet, ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { calculateKPIs } from "@/lib/analytics";
import { useMemo, useEffect } from "react";
import { format } from "date-fns";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  beforeLoad: async () => {
    const store = useIssuesStore.getState();
    await store.initFromStorage();
    if (store.issues.length === 0) {
      throw useRouter().history.replace("/upload");
    }
  },
});

function useRouter() {
  return { history: { replace: (path: string) => window.history.replaceState(null, "", path) } };
}

function Dashboard() {
  const navigate = useNavigate();
  const { issues, file, initFromStorage, isLoading, error } = useIssuesStore();

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  useEffect(() => {
    if (!isLoading && issues.length === 0) {
      navigate({ to: "/upload" });
    }
  }, [issues, isLoading, navigate]);

  const kpis = useMemo(() => {
    return calculateKPIs(issues);
  }, [issues]);

  if (isLoading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (issues.length === 0) {
    return (
      <EmptyState
        title="No data loaded"
        description="Upload a Linear CSV to see your analytics"
        action={
          <button
            onClick={() => navigate({ to: "/upload" })}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Upload CSV
          </button>
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
            </div>
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

          <ProjectBarChart />

          <InsightsPanel />

          <FiltersBar />

          <IssuesDataTable />
        </div>
      </main>
    </div>
  );
}