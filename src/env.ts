export const LINEAR_API_KEY = process.env.LINEAR_API_KEY || "";
export const LINEAR_TEAM_ID = process.env.LINEAR_TEAM_ID || "";
export const SUPABASE_URL = process.env.SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

export const isConfigured = Boolean(
  LINEAR_API_KEY && LINEAR_TEAM_ID && SUPABASE_URL && SUPABASE_ANON_KEY
);

export function assertConfigured(): void {
  if (!isConfigured) {
    throw new Error(
      "Environment not configured. Please set LINEAR_API_KEY, LINEAR_TEAM_ID, SUPABASE_URL, and SUPABASE_ANON_KEY"
    );
  }
}