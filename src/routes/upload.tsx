import { createFileRoute } from "@tanstack/react-router";
import { UploadDropzone } from "@/components/UploadDropzone";
import { FileSpreadsheet, ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useIssuesStore } from "@/store/useIssuesStore";
import { useEffect } from "react";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";

export const Route = createFileRoute("/upload")({
  component: Upload,
});

function Upload() {
  const navigate = useNavigate();
  const { issues, initFromStorage, isLoading } = useIssuesStore();

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  useEffect(() => {
    if (issues.length > 0) {
      navigate({ to: "/dashboard" });
    }
  }, [issues, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
            <FileSpreadsheet className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Linear Analytics
          </h1>
        </div>
        <DarkModeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Upload your Linear CSV
          </h2>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
            Import your Linear issues export to visualize project analytics
          </p>
        </div>

        <div className="mt-8 w-full max-w-xl">
          <UploadDropzone />
        </div>

        <div className="mt-8 text-center text-sm text-gray-400 dark:text-gray-500">
          <p>Export your issues from Linear: Settings → Export → CSV</p>
        </div>
      </main>
    </div>
  );
}