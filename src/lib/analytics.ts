import type {
  NormalizedIssue,
  KPIValues,
  StatusCount,
  PriorityCount,
  TimelinePoint,
  AssigneeWorkload,
  ProjectDistribution,
  Insights,
  Filters,
  LinearStatus,
  Priority,
} from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  Backlog: "#6b7280",
  Todo: "#3b82f6",
  "In Progress": "#f59e0b",
  "In Review": "#8b5cf6",
  Done: "#22c55e",
  Canceled: "#ef4444",
  Duplicate: "#9ca3af",
  Unstarted: "#94a3b8",
};

export const calculateKPIs = (issues: NormalizedIssue[]): KPIValues => {
  if (issues.length === 0) {
    return {
      total: 0,
      open: 0,
      closed: 0,
      urgent: 0,
      blocked: 0,
      activeAssignees: 0,
      avgResolutionTime: null,
    };
  }

  const closedStatuses: LinearStatus[] = ["Done", "Canceled", "Duplicate"];
  const urgentPriorities: Priority[] = ["Urgent"];

  const closed = issues.filter((i) => closedStatuses.includes(i.status));
  const open = issues.filter((i) => !closedStatuses.includes(i.status));
  const urgent = issues.filter((i) => urgentPriorities.includes(i.priority));
  const blocked = issues.filter(
    (i) => i.blockedBy && i.blockedBy !== "" && i.status !== "Done"
  );

  const assigneesWithOpen = new Set(
    open
      .filter((i) => i.assignee && i.assignee !== "")
      .map((i) => i.assignee)
  );

  const completedWithTime = closed.filter(
    (i) => i.completedDate && i.createdDate
  );

  let avgResolutionTime: number | null = null;
  if (completedWithTime.length > 0) {
    const totalDays = completedWithTime.reduce((sum, i) => {
      if (i.completedDate && i.createdDate) {
        const days = (i.completedDate.getTime() - i.createdDate.getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }
      return sum;
    }, 0);
    avgResolutionTime = Math.round(totalDays / completedWithTime.length);
  }

  return {
    total: issues.length,
    open: open.length,
    closed: closed.length,
    urgent: urgent.length,
    blocked: blocked.length,
    activeAssignees: assigneesWithOpen.size,
    avgResolutionTime,
  };
};

export const getStatusDistribution = (
  issues: NormalizedIssue[]
): StatusCount[] => {
  const counts = new Map<string, number>();

  for (const issue of issues) {
    const status = issue.status;
    counts.set(status, (counts.get(status) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] || "#6b7280",
    }))
    .sort((a, b) => b.value - a.value);
};

export const getPriorityDistribution = (
  issues: NormalizedIssue[]
): PriorityCount[] => {
  const counts = new Map<string, number>();
  const priorityOrder: Priority[] = ["Urgent", "High", "Medium", "Low", "No priority"];

  for (const issue of issues) {
    const priority = issue.priority;
    counts.set(priority, (counts.get(priority) || 0) + 1);
  }

  const result: PriorityCount[] = priorityOrder.map((priority) => ({
    priority,
    count: counts.get(priority) || 0,
  }));

  for (const [p, count] of counts) {
    if (!priorityOrder.includes(p as Priority)) {
      result.push({ priority: p, count });
    }
  }

  return result;
};

export const getTimelineData = (
  issues: NormalizedIssue[]
): TimelinePoint[] => {
  const dateMap = new Map<string, { created: number; completed: number }>();

  for (const issue of issues) {
    if (issue.createdDate) {
      const dateKey = issue.createdDate.toISOString().split("T")[0];
      const current = dateMap.get(dateKey) || { created: 0, completed: 0 };
      dateMap.set(dateKey, { ...current, created: current.created + 1 });
    }

    if (issue.completedDate) {
      const dateKey = issue.completedDate.toISOString().split("T")[0];
      const current = dateMap.get(dateKey) || { created: 0, completed: 0 };
      dateMap.set(dateKey, { ...current, completed: current.completed + 1 });
    }
  }

  const sortedDates = Array.from(dateMap.keys()).sort();
  let runningCreated = 0;
  let runningCompleted = 0;

  return sortedDates.map((date) => {
    const data = dateMap.get(date)!;
    runningCreated += data.created;
    runningCompleted += data.completed;
    return {
      date,
      created: runningCreated,
      completed: runningCompleted,
    };
  });
};

export const getAssigneeWorkload = (
  issues: NormalizedIssue[]
): AssigneeWorkload[] => {
  const assigneeMap = new Map<
    string,
    { open: number; closed: number; total: number }
  >();

  const closedStatuses: LinearStatus[] = ["Done", "Canceled", "Duplicate"];

  for (const issue of issues) {
    if (!issue.assignee || issue.assignee === "") continue;

    const current = assigneeMap.get(issue.assignee) || { open: 0, closed: 0, total: 0 };
    current.total++;

    if (closedStatuses.includes(issue.status)) {
      current.closed++;
    } else {
      current.open++;
    }

    assigneeMap.set(issue.assignee, current);
  }

  return Array.from(assigneeMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total);
};

export const getProjectDistribution = (
  issues: NormalizedIssue[]
): ProjectDistribution[] => {
  const counts = new Map<string, number>();

  for (const issue of issues) {
    const project = issue.project || "Unassigned";
    counts.set(project, (counts.get(project) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([project, count]) => ({ project, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
};

export const getInsights = (
  issues: NormalizedIssue[]
): Insights => {
  if (issues.length === 0) {
    return {
      mostOverloadedAssignee: null,
      oldestUnresolvedTicket: null,
      bottleneckStatus: null,
      staleTicketCount: 0,
    };
  }

  const workload = getAssigneeWorkload(issues);
  const mostOverloaded =
    workload.length > 0
      ? workload.reduce((max, curr) => (curr.open > max.open ? curr : max))
      : null;

  const openStatuses: LinearStatus[] = [
    "Backlog",
    "Todo",
    "In Progress",
    "In Review",
    "Unstarted",
  ];
  const openIssues = issues.filter(
    (i) => openStatuses.includes(i.status) && i.updatedDate
  );

  let oldestUnresolved: NormalizedIssue | null = null;
  if (openIssues.length > 0) {
    oldestUnresolved = openIssues.reduce((oldest, curr) => {
      if (!curr.updatedDate) return oldest;
      if (!oldest?.updatedDate) return curr;
      return curr.updatedDate < oldest.updatedDate ? curr : oldest;
    }, null as NormalizedIssue | null);
  }

  const statusCounts = new Map<LinearStatus, number>();
  for (const issue of openIssues) {
    const current = issue.status;
    statusCounts.set(current, (statusCounts.get(current) || 0) + 1);
  }

  let bottleneckStatus: LinearStatus | null = null;
  if (statusCounts.size > 0) {
    bottleneckStatus = Array.from(statusCounts.entries()).reduce((max, curr) =>
      curr[1] > max[1] ? curr : max
    )[0] as LinearStatus;
  }

  const staleTicketCount = openIssues.filter(
    (i) => i.daysSinceUpdate !== null && i.daysSinceUpdate >= 7
  ).length;

  return {
    mostOverloadedAssignee: mostOverloaded?.name || null,
    oldestUnresolvedTicket: oldestUnresolved,
    bottleneckStatus,
    staleTicketCount,
  };
};

export const applyFilters = (
  issues: NormalizedIssue[],
  filters: Filters
): NormalizedIssue[] => {
  let filtered = issues;

  if (filters.status.length > 0) {
    filtered = filtered.filter((i) => filters.status.includes(i.status));
  }

  if (filters.priority.length > 0) {
    filtered = filtered.filter((i) =>
      filters.priority.includes(i.priority)
    );
  }

  if (filters.assignee.length > 0) {
    filtered = filtered.filter(
      (i) => i.assignee && filters.assignee.includes(i.assignee)
    );
  }

  if (filters.project.length > 0) {
    filtered = filtered.filter(
      (i) => i.project && filters.project.includes(i.project)
    );
  }

  if (filters.dateRange.from || filters.dateRange.to) {
    filtered = filtered.filter((i) => {
      if (!i.createdDate) return false;
      if (filters.dateRange.from && i.createdDate < filters.dateRange.from) return false;
      if (filters.dateRange.to && i.createdDate > filters.dateRange.to) return false;
      return true;
    });
  }

  return filtered;
};

export const getUniqueValues = {
  status: (issues: NormalizedIssue[]): LinearStatus[] => {
    const statuses = new Set(issues.map((i) => i.status));
    return Array.from(statuses).sort();
  },
  priority: (issues: NormalizedIssue[]): Priority[] => {
    const priorities = new Set(issues.map((i) => i.priority));
    return Array.from(priorities).sort();
  },
  assignee: (issues: NormalizedIssue[]): string[] => {
    const assignees = new Set(
      issues.map((i) => i.assignee).filter((a) => a && a !== "")
    );
    return Array.from(assignees).sort();
  },
  project: (issues: NormalizedIssue[]): string[] => {
    const projects = new Set(
      issues.map((i) => i.project).filter((p) => p && p !== "")
    );
    return Array.from(projects).sort();
  },
};