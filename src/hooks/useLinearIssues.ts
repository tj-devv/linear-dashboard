import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchIssuesFromDb, getLastSuccessfulSync } from "@/lib/db";
import { performFullSync, getSyncStatus } from "@/lib/sync";
import { isConfigured } from "@/env";
import type { DbIssue } from "@/lib/db";
import type { DbSyncLog } from "@/lib/db";

const STALE_TIME = 60 * 1000; // 60 seconds

// Query keys
export const queryKeys = {
  issues: ["issues"] as const,
  syncStatus: ["syncStatus"] as const,
  lastSync: ["lastSync"] as const,
};

// Transform DB issue to format expected by dashboard
export interface DashboardIssue {
  id: string;
  identifier: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  project: string;
  assignee: string;
  labels: string;
  created: string;
  updated: string;
  completed: string;
  started: string;
  dueDate: string;
  createdDate: Date | null;
  updatedDate: Date | null;
  completedDate: Date | null;
  startedDate: Date | null;
  dueDateObj: Date | null;
  daysOpen: number | null;
  daysSinceUpdate: number | null;
}

function transformDbIssue(issue: DbIssue): DashboardIssue {
  const now = new Date();
  const createdDate = issue.created_at ? new Date(issue.created_at) : null;
  const updatedDate = issue.updated_at ? new Date(issue.updated_at) : null;
  const completedDate = issue.completed_at ? new Date(issue.completed_at) : null;

  let daysOpen: number | null = null;
  let daysSinceUpdate: number | null = null;

  if (createdDate) {
    const endDate = completedDate || now;
    daysOpen = Math.floor(
      (endDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  if (updatedDate) {
    daysSinceUpdate = Math.floor(
      (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  return {
    id: issue.identifier,
    title: issue.title,
    description: issue.description || "",
    status: issue.status,
    priority: issue.priority || "No priority",
    project: issue.project_name || "",
    assignee: issue.assignee_name || "",
    labels: issue.labels?.join(", ") || "",
    created: issue.created_at || "",
    updated: issue.updated_at || "",
    completed: issue.completed_at || "",
    started: issue.started_at || "",
    dueDate: issue.due_date || "",
    createdDate,
    updatedDate,
    completedDate,
    startedDate: issue.started_at ? new Date(issue.started_at) : null,
    dueDateObj: issue.due_date ? new Date(issue.due_date) : null,
    daysOpen,
    daysSinceUpdate,
  };
}

// Fetch issues hook - uses TanStack Query for caching & auto-refresh
export function useLinearIssues() {
  return useQuery({
    queryKey: queryKeys.issues,
    queryFn: async (): Promise<DashboardIssue[]> => {
      if (!isConfigured) {
        throw new Error("Linear not configured");
      }

      const dbIssues = await fetchIssuesFromDb();
      return dbIssues.map(transformDbIssue);
    },
    staleTime: STALE_TIME,
    refetchInterval: STALE_TIME,
    enabled: isConfigured,
    retry: 2,
  });
}

// Mutation hook for syncing
export function useSyncIssues() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return performFullSync();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issues });
      queryClient.invalidateQueries({ queryKey: queryKeys.syncStatus });
      queryClient.invalidateQueries({ queryKey: queryKeys.lastSync });
    },
  });
}

// Get sync status hook
export function useSyncStatus() {
  return useQuery({
    queryKey: queryKeys.syncStatus,
    queryFn: async () => {
      return getSyncStatus();
    },
    staleTime: 10000,
    refetchInterval: 10000,
  });
}

// Get last sync time
export function useLastSync() {
  return useQuery({
    queryKey: queryKeys.lastSync,
    queryFn: async () => {
      return getLastSuccessfulSync();
    },
    staleTime: 60000,
    enabled: isConfigured,
  });
}

// Check if configured
export function useIsConfigured() {
  return isConfigured;
}

// Formatted last sync time for display
export function useFormattedLastSync() {
  const { data: lastSync } = useLastSync();

  if (!lastSync?.completed_at) {
    return "Never";
  }

  const date = new Date(lastSync.completed_at);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}