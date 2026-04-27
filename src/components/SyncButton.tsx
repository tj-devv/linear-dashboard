import { RefreshCw } from "lucide-react";
import { useSyncIssues } from "@/hooks/useLinearIssues";
import { cn } from "@/lib/utils";

interface SyncButtonProps {
  className?: string;
  onSuccess?: () => void;
}

export function SyncButton({ className, onSuccess }: SyncButtonProps) {
  const { mutate: sync, isPending, isSuccess, isError, error, reset } = useSyncIssues();

  const handleSync = () => {
    reset();
    sync(undefined, {
      onSuccess: (result) => {
        if (result.success && onSuccess) {
          onSuccess();
        }
      },
    });
  };

  return (
    <button
      onClick={handleSync}
      disabled={isPending}
      className={cn(
        "flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white",
        "transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
      {isPending ? "Syncing..." : "Sync from Linear"}
    </button>
  );
}