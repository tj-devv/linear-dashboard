import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return format(date, "MMM d, yyyy");
}

export function formatDateTime(date: Date | null | undefined): string {
  if (!date) return "—";
  return format(date, "MMM d, yyyy HH:mm");
}

export function formatRelativeDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatDays(days: number | null | undefined): string {
  if (days === null || days === undefined) return "—";
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? "1 week" : `${weeks} weeks`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? "1 month" : `${months} months`;
  }
  const years = Math.floor(days / 365);
  return years === 1 ? "1 year" : `${years} years`;
}

export function formatResolutionTime(days: number | null): string {
  if (days === null) return "—";
  if (days === 0) return "< 1 day";
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    if (remainingDays === 0) {
      return weeks === 1 ? "1 week" : `${weeks} weeks`;
    }
    return `${weeks}w ${remainingDays}d`;
  }
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month" : `${months} months`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const PRIORITY_LABELS: Record<string, string> = {
  Urgent: "Urgent",
  High: "High",
  Medium: "Medium",
  Low: "Low",
  "No priority": "No priority",
};

export const STATUS_LABELS: Record<string, string> = {
  Backlog: "Backlog",
  Todo: "To Do",
  "In Progress": "In Progress",
  "In Review": "In Review",
  Done: "Done",
  Canceled: "Canceled",
  Duplicate: "Duplicate",
  Unstarted: "Unstarted",
};

export const STATUS_ICONS: Record<string, string> = {
  Backlog: "circle",
  Todo: "circle",
  "In Progress": "arrow-right-circle",
  "In Review": "eye",
  Done: "check-circle",
  Canceled: "x-circle",
  Duplicate: "copy",
  Unstarted: "circle",
};