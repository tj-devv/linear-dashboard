import type {
  LinearIssue,
  LinearTeam,
  LinearUser,
  LinearProject,
} from "./linear";
import type {
  DbSyncLog,
} from "./db";
import {
  fetchIssuesFromDb,
  upsertIssues,
  createSyncLog,
  updateSyncLog,
  formatIssueForDb,
} from "./db";
import {
  fetchAllIssues,
  fetchTeams,
  fetchUsers,
  fetchProjects,
  fetchTeamId,
} from "./linear";
import { isConfigured } from "../env";

export interface SyncResult {
  success: boolean;
  issuesSynced: number;
  error?: string;
  duration: number;
}

export interface SyncStatus {
  lastSync: DbSyncLog | null;
  isConfigured: boolean;
  isSyncing: boolean;
}

// Perform full sync from Linear to Supabase
export async function performFullSync(): Promise<SyncResult> {
  const startTime = Date.now();

  // Check if configured
  if (!isConfigured) {
    return {
      success: false,
      issuesSynced: 0,
      error: "Linear or Supabase not configured",
      duration: Date.now() - startTime,
    };
  }

  // Create sync log entry
  let logId: string;
  try {
    logId = await createSyncLog("full");
  } catch (error) {
    return {
      success: false,
      issuesSynced: 0,
      error: `Failed to create sync log: ${error}`,
      duration: Date.now() - startTime,
    };
  }

  try {
    // Fetch team ID
    const teamId = await fetchTeamId();

    // Fetch all data in parallel
    console.log("Fetching issues from Linear...");
    const issues = await fetchAllIssues(teamId || undefined);

    console.log(`Fetched ${issues.length} issues`);

    // Format issues for DB
    const formattedIssues = issues.map(formatIssueForDb);

    // Batch upsert to Supabase
    console.log("Upserting issues to Supabase...");
    const syncedCount = await upsertIssues(formattedIssues);

    // Update sync log as completed
    await updateSyncLog(logId, {
      status: "completed",
      issues_synced: syncedCount,
    });

    console.log(`Sync completed: ${syncedCount} issues synced`);

    return {
      success: true,
      issuesSynced: syncedCount,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Update sync log as failed
    try {
      await updateSyncLog(logId, {
        status: "failed",
        error_message: errorMessage,
      });
    } catch {
      // Ignore errors when updating log
    }

    return {
      success: false,
      issuesSynced: 0,
      error: errorMessage,
      duration: Date.now() - startTime,
    };
  }
}

// Get sync status
export async function getSyncStatus(): Promise<SyncStatus> {
  let lastSync: DbSyncLog | null = null;

  if (isConfigured) {
    try {
      const {
        fetchSyncLogs,
      } = await import("./db");
      const logs = await fetchSyncLogs(1);
      lastSync = logs[0] || null;
    } catch {
      lastSync = null;
    }
  }

  return {
    lastSync,
    isConfigured,
    isSyncing: lastSync?.status === "running",
  };
}

// Check if data source is from DB (live mode) or local CSV
export async function getIssuesData(): Promise<{
  issues: Array<Record<string, unknown>>;
  source: "db" | "store";
}> {
  if (isConfigured) {
    try {
      const issues = await fetchIssuesFromDb();
      return { issues: issues as unknown as Array<Record<string, unknown>>, source: "db" };
    } catch {
      // Fall back to store if DB fails
      return { issues: [], source: "store" };
    }
  }

  return { issues: [], source: "store" };
}

// Validate configuration
export async function validateConfiguration(): Promise<{
  linear: boolean;
  supabase: boolean;
  team: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  let linear = false;
  let supabase = false;
  let team = false;

  if (!isConfigured) {
    if (!process.env.LINEAR_API_KEY) {
      errors.push("LINEAR_API_KEY not set");
    }
    if (!process.env.LINEAR_TEAM_ID) {
      errors.push("LINEAR_TEAM_ID not set");
    }
    if (!process.env.SUPABASE_URL) {
      errors.push("SUPABASE_URL not set");
    }
    if (!process.env.SUPABASE_ANON_KEY) {
      errors.push("SUPABASE_ANON_KEY not set");
    }
  } {
    // Verify Linear connection
    try {
      await fetchTeams();
      linear = true;
    } catch (error) {
      errors.push(`Linear API error: ${error}`);
    }

    // Verify Supabase connection
    try {
      const { getSupabase } = await import("./db");
      await getSupabase().from("issues").select("id").limit(0);
      supabase = true;
    } catch (error) {
      errors.push(`Supabase connection error: ${error}`);
    }

    // Verify team exists
    try {
      const teamId = await fetchTeamId();
      if (teamId) {
        team = true;
      } else {
        errors.push(`Team "${process.env.LINEAR_TEAM_ID}" not found`);
      }
    } catch (error) {
      errors.push(`Team fetch error: ${error}`);
    }
  }

  return { linear, supabase, team, errors };
}