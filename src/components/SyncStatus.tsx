import { Wifi, WifiOff, Clock, AlertCircle } from "lucide-react";
import { useSyncStatus, useFormattedLastSync, useIsConfigured } from "@/hooks/useLinearIssues";
import { cn } from "@/lib/utils";

interface SyncStatusProps {
  className?: string;
}

export function SyncStatus({ className }: SyncStatusProps) {
  const isConfigured = useIsConfigured();
  const { data: status, isLoading, isError } = useSyncStatus();
  const lastSyncTime = useFormattedLastSync();

  if (!isConfigured) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
          className
        )}
      >
        <WifiOff className="h-4 w-4" />
        <span>Linear not connected</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400",
          className
        )}
      >
        <div className="h-4 w-4 animate-pulse rounded-full bg-gray-400" />
        <span>Loading...</span>
      </div>
    );
  }

  if (isError || !status) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400",
          className
        )}
      >
        <AlertCircle className="h-4 w-4" />
        <span>Connection error</span>
      </div>
    );
  }

  const isSyncing = status.isSyncing;
  const lastSync = status.lastSync;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg bg-green-50 px-3 py-1.5 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400",
        className
      )}
    >
      <Wifi className="h-4 w-4" />
      <span>Connected to Linear</span>
      {lastSync && (
        <div className="flex items-center gap-1 text-green-600 dark:text-green-500">
          <Clock className="h-3 w-3" />
          <span>Last sync: {lastSyncTime}</span>
        </div>
      )}
      {isSyncing && (
        <span className="text-green-600 dark:text-green-500">(syncing...)</span>
      )}
    </div>
  );
}