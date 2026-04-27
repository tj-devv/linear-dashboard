import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  assertConfigured,
} from "../env";

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    assertConfigured();
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
}

// Types matching the database schema
export interface DbIssue {
  id: string;
  linear_id: string;
  identifier: string;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  project_id: string | null;
  project_name: string | null;
  assignee_id: string | null;
  assignee_name: string | null;
  creator_id: string | null;
  creator_name: string | null;
  labels: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  completed_at: string | null;
  started_at: string | null;
  due_date: string | null;
  team_id: string | null;
  team_name: string | null;
  synced_at: string;
  created_by: string | null;
  created_by_email: string | null;
}

export interface DbProject {
  id: string;
  linear_id: string;
  name: string;
  description: string | null;
  lead_id: string | null;
  lead_name: string | null;
  member_count: number;
  issue_count: number;
  created_at: string | null;
  updated_at: string | null;
  synced_at: string;
}

export interface DbUser {
  id: string;
  linear_id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  synced_at: string;
}

export interface DbSyncLog {
  id: string;
  sync_type: string;
  status: string;
  issues_synced: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

// Helper to format Linear issue to DB format
export function formatIssueForDb(issue: {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  state: { name: string };
  priority: number;
  team: { id: string; key: string; name: string };
  assignee?: { id: string; name: string } | null;
  creator?: { id: string; name: string } | null;
  labels?: { nodes: Array<{ name: string }> } | null;
  project?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  startedAt?: string | null;
  dueDate?: string | null;
}): Omit<DbIssue, "id" | "synced_at"> {
  const priorityMap: Record<number, string> = {
    0: "No priority",
    1: "Urgent",
    2: "High",
    3: "Medium",
    4: "Low",
  };

  return {
    linear_id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    description: issue.description || null,
    status: issue.state.name,
    priority: priorityMap[issue.priority] || "No priority",
    project_id: issue.project?.id || null,
    project_name: issue.project?.name || null,
    assignee_id: issue.assignee?.id || null,
    assignee_name: issue.assignee?.name || null,
    creator_id: issue.creator?.id || null,
    creator_name: issue.creator?.name || null,
    labels: issue.labels?.nodes.map((l) => l.name) || null,
    created_at: issue.createdAt,
    updated_at: issue.updatedAt,
    completed_at: issue.completedAt || null,
    started_at: issue.startedAt || null,
    due_date: issue.dueDate || null,
    team_id: issue.team.id,
    team_name: issue.team.name,
    created_by: null,
    created_by_email: null,
  };
}

// UPSERT issue by linear_id
export async function upsertIssue(issue: Omit<DbIssue, "id" | "synced_at">): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase.from("issues").upsert(
    {
      ...issue,
      synced_at: new Date().toISOString(),
    },
    {
      onConflict: "linear_id",
    }
  );

  if (error) {
    throw new Error(`Failed to upsert issue: ${error.message}`);
  }
}

// Batch UPSERT issues
export async function upsertIssues(
  issues: Array<Omit<DbIssue, "id" | "synced_at">>
): Promise<number> {
  const supabase = getSupabase();

  const records = issues.map((issue) => ({
    ...issue,
    synced_at: new Date().toISOString(),
  }));

  const { error, count } = await supabase.from("issues").upsert(records, {
    onConflict: "linear_id",
  });

  if (error) {
    throw new Error(`Failed to upsert issues: ${error.message}`);
  }

  return count || records.length;
}

// Fetch all issues from DB
export async function fetchIssuesFromDb(): Promise<DbIssue[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("issues")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch issues: ${error.message}`);
  }

  return data || [];
}

// Fetch issue by Linear ID
export async function fetchIssueByLinearId(linearId: string): Promise<DbIssue | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("issues")
    .select("*")
    .eq("linear_id", linearId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch issue: ${error.message}`);
  }

  return data;
}

// Fetch sync logs
export async function fetchSyncLogs(limit: number = 10): Promise<DbSyncLog[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("sync_logs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch sync logs: ${error.message}`);
  }

  return data || [];
}

// Get last successful sync
export async function getLastSuccessfulSync(): Promise<DbSyncLog | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("sync_logs")
    .select("*")
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch sync log: ${error.message}`);
  }

  return data;
}

// Create sync log entry
export async function createSyncLog(
  syncType: string
): Promise<string> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("sync_logs")
    .insert({
      sync_type: syncType,
      status: "running",
      issues_synced: 0,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create sync log: ${error.message}`);
  }

  return data.id;
}

// Update sync log entry
export async function updateSyncLog(
  logId: string,
  updates: {
    status?: string;
    issues_synced?: number;
    error_message?: string;
  }
): Promise<void> {
  const supabase = getSupabase();

  const updateData: Record<string, unknown> = { ...updates };

  if (updates.status === "completed") {
    updateData.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("sync_logs")
    .update(updateData)
    .eq("id", logId);

  if (error) {
    throw new Error(`Failed to update sync log: ${error.message}`);
  }
}