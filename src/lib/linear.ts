import {
  LINEAR_API_KEY,
  LINEAR_TEAM_ID,
  assertConfigured,
} from "../env";

const LINEAR_GRAPHQL_URL = "https://api.linear.app/graphql";

interface LinearGraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function linearFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  assertConfigured();

  const response = await fetch(LINEAR_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: LINEAR_API_KEY,
      "User-Agent": "linear-dashboard/1.0",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Linear API error: ${response.status} ${response.statusText}`);
  }

  const result: LinearGraphQLResponse<T> = await response.json();

  if (result.errors && result.errors.length > 0) {
    throw new Error(`Linear GraphQL error: ${result.errors[0].message}`);
  }

  if (!result.data) {
    throw new Error("Linear GraphQL: No data returned");
  }

  return result.data;
}

// Types
export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  priority: number;
  state: {
    id: string;
    name: string;
    type: string;
  };
  team: {
    id: string;
    key: string;
    name: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  labels?: {
    nodes: Array<{ id: string; name: string }>;
  };
  project?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  startedAt?: string;
  dueDate?: string;
}

export interface LinearTeam {
  id: string;
  key: string;
  name: string;
}

export interface LinearUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface LinearProject {
  id: string;
  name: string;
  description?: string;
  lead?: {
    id: string;
    name: string;
  };
  startDate?: string;
  targetDate?: string;
}

interface IssuesResponse {
  issues: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    nodes: LinearIssue[];
  };
}

interface TeamsResponse {
  teams: {
    nodes: LinearTeam[];
  };
}

interface UsersResponse {
  users: {
    nodes: LinearUser[];
  };
}

interface ProjectsResponse {
  projects: {
    nodes: LinearProject[];
  };
}

// Fetch functions with pagination
export async function fetchIssues(teamId?: string, cursor?: string): Promise<{
  issues: LinearIssue[];
  nextCursor: string | null;
}> {
  const variables: Record<string, unknown> = {
    first: 50,
    ...(cursor && { after: cursor }),
  };

  if (teamId) {
    variables.filter = { team: { id: { eq: teamId } } };
  }

  const query = `
    query Issues($first: Int, $after: String, $filter: IssueFilter) {
      issues(first: $first, after: $after, filter: $filter) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          identifier
          title
          description
          priority
          state {
            id
            name
            type
          }
          team {
            id
            key
            name
          }
          assignee {
            id
            name
            email
          }
          creator {
            id
            name
            email
          }
          labels(first: 10) {
            nodes {
              id
              name
            }
          }
          project {
            id
            name
          }
          createdAt
          updatedAt
          completedAt
          startedAt
          dueDate
        }
      }
    }
  `;

  const data = await linearFetch<IssuesResponse>(query, variables);

  return {
    issues: data.issues.nodes,
    nextCursor: data.issues.pageInfo.hasNextPage
      ? data.issues.pageInfo.endCursor
      : null,
  };
}

export async function fetchAllIssues(teamId?: string): Promise<LinearIssue[]> {
  const allIssues: LinearIssue[] = [];
  let cursor: string | null = null;

  do {
    const { issues, nextCursor } = await fetchIssues(teamId, cursor || undefined);
    allIssues.push(...issues);
    cursor = nextCursor;
  } while (cursor);

  return allIssues;
}

export async function fetchTeams(): Promise<LinearTeam[]> {
  const query = `
    query Teams {
      teams {
        nodes {
          id
          key
          name
        }
      }
    }
  `;

  const data = await linearFetch<TeamsResponse>(query);
  return data.teams.nodes;
}

export async function fetchUsers(): Promise<LinearUser[]> {
  const query = `
    query Users {
      users {
        nodes {
          id
          name
          email
          avatarUrl
        }
      }
    }
  `;

  const data = await linearFetch<UsersResponse>(query);
  return data.users.nodes;
}

export async function fetchProjects(teamId?: string): Promise<LinearProject[]> {
  const variables: Record<string, unknown> = {};

  if (teamId) {
    variables.filter = { team: { id: { eq: teamId } } };
  }

  const query = `
    query Projects($filter: ProjectFilter) {
      projects(first: 100, filter: $filter) {
        nodes {
          id
          name
          description
          lead {
            id
            name
          }
          startDate
          targetDate
        }
      }
    }
  `;

  const data = await linearFetch<ProjectsResponse>(query, variables);
  return data.projects.nodes;
}

export async function fetchTeamId(): Promise<string | null> {
  if (!LINEAR_TEAM_ID) return null;

  // Try to fetch the team to validate
  try {
    const teams = await fetchTeams();
    const team = teams.find(
      (t) => t.key === LINEAR_TEAM_ID || t.id === LINEAR_TEAM_ID
    );
    return team?.id || null;
  } catch {
    return null;
  }
}