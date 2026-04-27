import { useMemo } from "react";
import { X, Filter } from "lucide-react";
import { useIssuesStore } from "@/store/useIssuesStore";
import { applyFilters, getUniqueValues } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { LinearStatus, Priority } from "@/lib/types";

export function FiltersBar() {
  const { issues, filters, setFilters, resetFilters } = useIssuesStore();

  const uniqueValues = useMemo(() => {
    return {
      status: getUniqueValues.status(issues),
      priority: getUniqueValues.priority(issues),
      assignee: getUniqueValues.assignee(issues),
      project: getUniqueValues.project(issues),
    };
  }, [issues]);

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.priority.length > 0 ||
    filters.assignee.length > 0 ||
    filters.project.length > 0 ||
    filters.dateRange.from !== null ||
    filters.dateRange.to !== null;

  const filteredCount = useMemo(() => {
    return applyFilters(issues, filters).length;
  }, [issues, filters]);

  const handleStatusChange = (value: LinearStatus) => {
    const newStatus = filters.status.includes(value)
      ? filters.status.filter((s) => s !== value)
      : [...filters.status, value];
    setFilters({ status: newStatus });
  };

  const handlePriorityChange = (value: Priority) => {
    const newPriority = filters.priority.includes(value)
      ? filters.priority.filter((p) => p !== value)
      : [...filters.priority, value];
    setFilters({ priority: newPriority });
  };

  const handleAssigneeChange = (value: string) => {
    const newAssignee = filters.assignee.includes(value)
      ? filters.assignee.filter((a) => a !== value)
      : [...filters.assignee, value];
    setFilters({ assignee: newAssignee });
  };

  const handleProjectChange = (value: string) => {
    const newProject = filters.project.includes(value)
      ? filters.project.filter((p) => p !== value)
      : [...filters.project, value];
    setFilters({ project: newProject });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-gray-100">Filters</span>
          {hasActiveFilters && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {filteredCount} results
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" />
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-wrap gap-2">
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) handleStatusChange(e.target.value as LinearStatus);
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="">Status: All</option>
            {uniqueValues.status.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value=""
            onChange={(e) => {
              if (e.target.value) handlePriorityChange(e.target.value as Priority);
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="">Priority: All</option>
            {uniqueValues.priority.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>

          <select
            value=""
            onChange={(e) => {
              if (e.target.value) handleAssigneeChange(e.target.value);
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="">Assignee: All</option>
            {uniqueValues.assignee.map((assignee) => (
              <option key={assignee} value={assignee}>
                {assignee}
              </option>
            ))}
          </select>

          <select
            value=""
            onChange={(e) => {
              if (e.target.value) handleProjectChange(e.target.value);
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="">Project: All</option>
            {uniqueValues.project.slice(0, 20).map((project) => (
              <option key={project} value={project}>
                {project.length > 20 ? project.substring(0, 20) + "..." : project}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={
              filters.dateRange.from
                ? filters.dateRange.from.toISOString().split("T")[0]
                : ""
            }
            onChange={(e) => {
              setFilters({
                dateRange: {
                  ...filters.dateRange,
                  from: e.target.value ? new Date(e.target.value) : null,
                },
              });
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={
              filters.dateRange.to
                ? filters.dateRange.to.toISOString().split("T")[0]
                : ""
            }
            onChange={(e) => {
              setFilters({
                dateRange: {
                  ...filters.dateRange,
                  to: e.target.value ? new Date(e.target.value) : null,
                },
              });
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.status.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
            >
              {status}
              <X className="h-3 w-3" />
            </button>
          ))}
          {filters.priority.map((priority) => (
            <button
              key={priority}
              onClick={() => handlePriorityChange(priority)}
              className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:hover:bg-amber-800"
            >
              {priority}
              <X className="h-3 w-3" />
            </button>
          ))}
          {filters.assignee.map((assignee) => (
            <button
              key={assignee}
              onClick={() => handleAssigneeChange(assignee)}
              className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800"
            >
              {assignee.length > 15
                ? assignee.substring(0, 15) + "..."
                : assignee}
              <X className="h-3 w-3" />
            </button>
          ))}
          {filters.project.map((project) => (
            <button
              key={project}
              onClick={() => handleProjectChange(project)}
              className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
            >
              {project.length > 15
                ? project.substring(0, 15) + "..."
                : project}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}