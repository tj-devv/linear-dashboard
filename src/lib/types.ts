export type Priority = "No priority" | "Urgent" | "High" | "Medium" | "Low";
export type LinearStatus =
  | "Backlog"
  | "Todo"
  | "In Progress"
  | "In Review"
  | "Done"
  | "Canceled"
  | "Duplicate"
  | "Unstarted"
  | "QA"
  | "Pending QA Deploy"
  | "Triage";

export interface LinearIssue {
  id: string;
  title: string;
  description: string;
  status: LinearStatus;
  priority: Priority;
  project: string;
  creator: string;
  assignee: string;
  labels: string;
  created: string;
  updated: string;
  started: string;
  completed: string;
  dueDate: string;
  timeInStatus: string;
  blockedBy: string;
  duplicateOf: string;
}

export interface NormalizedIssue extends LinearIssue {
  createdDate: Date | null;
  updatedDate: Date | null;
  startedDate: Date | null;
  completedDate: Date | null;
  dueDateObj: Date | null;
  daysOpen: number | null;
  daysSinceUpdate: number | null;
}

export interface KPIValues {
  total: number;
  open: number;
  closed: number;
  urgent: number;
  blocked: number;
  activeAssignees: number;
  avgResolutionTime: number | null;
}

export interface StatusCount {
  name: LinearStatus | string;
  value: number;
  color: string;
}

export interface PriorityCount {
  priority: Priority | string;
  count: number;
}

export interface TimelinePoint {
  date: string;
  created: number;
  completed: number;
}

export interface AssigneeWorkload {
  name: string;
  open: number;
  closed: number;
  total: number;
}

export interface ProjectDistribution {
  project: string;
  count: number;
}

export interface Insights {
  mostOverloadedAssignee: string | null;
  oldestUnresolvedTicket: NormalizedIssue | null;
  bottleneckStatus: LinearStatus | null;
  staleTicketCount: number;
}

export interface Filters {
  status: LinearStatus[];
  priority: Priority[];
  assignee: string[];
  project: string[];
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

export interface UploadedFile {
  name: string;
  uploadedAt: Date;
  recordCount: number;
}

export type Theme = "light" | "dark";