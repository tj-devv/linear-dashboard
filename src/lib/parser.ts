import Papa from "papaparse";
import type {
  NormalizedIssue,
  Priority,
  LinearStatus,
} from "@/lib/types";

const PRIORITY_MAP: Record<string, Priority> = {
  none: "No priority",
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const STATUS_MAP: Record<string, LinearStatus> = {
  backlog: "Backlog",
  todo: "Todo",
  "in progress": "In Progress",
  "in review": "In Review",
  done: "Done",
  canceled: "Canceled",
  duplicate: "Duplicate",
  unstarted: "Unstarted",
};

const COLUMNS = {
  id: "ID",
  title: "Title",
  description: "Description",
  status: "Status",
  priority: "Priority",
  project: "Project",
  creator: "Creator",
  assignee: "Assignee",
  labels: "Labels",
  created: "Created",
  updated: "Updated",
  started: "Started",
  completed: "Completed",
  dueDate: "Due Date",
  timeInStatus: "Time in status",
  blockedBy: "Blocked by",
  duplicateOf: "Duplicate of",
} as const;

const findColumn = (headers: string[], key: string): string | null => {
  const standard = COLUMNS[key as keyof typeof COLUMNS];
  if (standard) {
    const found = headers.find(
      (h) => h.toLowerCase() === standard.toLowerCase()
    );
    if (found) return found;
  }

  return (
    headers.find((h) => h.toLowerCase().replace(/[_\s]/g, "") === key) || null
  );
};

const parseDate = (value: string | undefined): Date | null => {
  if (!value || value === "") return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

const normalizeText = (value: string | undefined): string => {
  if (!value || value === "") return "";
  return value.trim();
};

const parsePriority = (value: string | undefined): Priority => {
  if (!value) return "No priority";
  const normalized = value.toLowerCase().replace(/[_\s]/g, "");
  return PRIORITY_MAP[normalized] || "No priority";
};

const parseStatus = (value: string | undefined): LinearStatus => {
  if (!value) return "Backlog";
  const normalized = value.toLowerCase().replace(/[_\s]/g, "");
  return STATUS_MAP[normalized] || "Backlog";
};

export const parseCSV = async (file: File): Promise<NormalizedIssue[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        try {
          const headers = results.meta.fields || [];
          if (headers.length === 0) {
            reject(new Error("No columns found in CSV"));
            return;
          }

          const col = {
            id: findColumn(headers, "id"),
            title: findColumn(headers, "title"),
            description: findColumn(headers, "description"),
            status: findColumn(headers, "status"),
            priority: findColumn(headers, "priority"),
            project: findColumn(headers, "project"),
            creator: findColumn(headers, "creator"),
            assignee: findColumn(headers, "assignee"),
            labels: findColumn(headers, "labels"),
            created: findColumn(headers, "created"),
            updated: findColumn(headers, "updated"),
            started: findColumn(headers, "started"),
            completed: findColumn(headers, "completed"),
            dueDate: findColumn(headers, "dueDate"),
            timeInStatus: findColumn(headers, "timeInStatus"),
            blockedBy: findColumn(headers, "blockedBy"),
            duplicateOf: findColumn(headers, "duplicateOf"),
          };

          const rawData = results.data as Record<string, string>[];
          const now = new Date();

          const issues: NormalizedIssue[] = rawData.map((row) => {
            const createdDate = parseDate(col.created ? row[col.created] : undefined);
            const updatedDate = parseDate(col.updated ? row[col.updated] : undefined);
            const startedDate = parseDate(col.started ? row[col.started] : undefined);
            const completedDate = parseDate(col.completed ? row[col.completed] : undefined);
            const dueDateObj = parseDate(col.dueDate ? row[col.dueDate] : undefined);

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

            const issue: NormalizedIssue = {
              id: normalizeText(col.id ? row[col.id] : undefined),
              title: normalizeText(col.title ? row[col.title] : undefined),
              description: normalizeText(col.description ? row[col.description] : undefined),
              status: parseStatus(col.status ? row[col.status] : undefined),
              priority: parsePriority(col.priority ? row[col.priority] : undefined),
              project: normalizeText(col.project ? row[col.project] : undefined),
              creator: normalizeText(col.creator ? row[col.creator] : undefined),
              assignee: normalizeText(col.assignee ? row[col.assignee] : undefined),
              labels: normalizeText(col.labels ? row[col.labels] : undefined),
              created: normalizeText(col.created ? row[col.created] : undefined),
              updated: normalizeText(col.updated ? row[col.updated] : undefined),
              started: normalizeText(col.started ? row[col.started] : undefined),
              completed: normalizeText(col.completed ? row[col.completed] : undefined),
              dueDate: normalizeText(col.dueDate ? row[col.dueDate] : undefined),
              timeInStatus: normalizeText(col.timeInStatus ? row[col.timeInStatus] : undefined),
              blockedBy: normalizeText(col.blockedBy ? row[col.blockedBy] : undefined),
              duplicateOf: normalizeText(col.duplicateOf ? row[col.duplicateOf] : undefined),
              createdDate,
              updatedDate,
              startedDate,
              completedDate,
              dueDateObj,
              daysOpen,
              daysSinceUpdate,
            };

            return issue;
          });

          resolve(issues);
        } catch (e) {
          reject(e);
        }
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
};

export const validateCSV = (file: File): string | null => {
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return "Please upload a CSV file";
  }

  if (file.size === 0) {
    return "The file is empty";
  }

  return null;
};