import { useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ArrowUpDown,
} from "lucide-react";
import { useIssuesStore } from "@/store/useIssuesStore";
import { applyFilters } from "@/lib/analytics";
import { cn, formatDate, formatRelativeDate } from "@/lib/utils";
import type { NormalizedIssue } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  Backlog: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  Todo: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  "In Progress": "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  "In Review": "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  Done: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Canceled: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  Duplicate: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
  Unstarted: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
};

const PRIORITY_COLORS: Record<string, string> = {
  Urgent: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  High: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  Low: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  "No priority": "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
};

export function IssuesDataTable() {
  const { issues, filters } = useIssuesStore();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    id: true,
    title: true,
    status: true,
    priority: true,
    project: true,
    assignee: true,
    created: true,
    updated: true,
  });

  const filteredData = useMemo(() => {
    return applyFilters(issues, filters);
  }, [issues, filters]);

  const columns = useMemo<ColumnDef<NormalizedIssue>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: (info) => (
          <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: (info) => (
          <span className="line-clamp-2" title={info.getValue() as string}>
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const value = info.getValue() as string;
          return (
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                STATUS_COLORS[value] || STATUS_COLORS.Backlog
              )}
            >
              {value}
            </span>
          );
        },
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: (info) => {
          const value = info.getValue() as string;
          return (
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                PRIORITY_COLORS[value] || PRIORITY_COLORS["No priority"]
              )}
            >
              {value}
            </span>
          );
        },
      },
      {
        accessorKey: "project",
        header: "Project",
        cell: (info) => (
          <span className="text-sm">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "assignee",
        header: "Assignee",
        cell: (info) => (
          <span className="text-sm">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "createdDate",
        header: "Created",
        cell: (info) => {
          const date = info.row.original.createdDate;
          return (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(date)}
            </span>
          );
        },
      },
      {
        accessorKey: "updatedDate",
        header: "Updated",
        cell: (info) => {
          const date = info.row.original.updatedDate;
          return (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatRelativeDate(date)}
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter,
      sorting,
      columnVisibility,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = filteredData.length;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="flex flex-col rounded-xl border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-4 border-b border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search issues..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {table.get.getAllLeafColumns().filter((col) => col.getCanHide()).length} columns
          </span>
          <div className="relative group">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              <Eye className="h-4 w-4" />
            </button>
            <div className="absolute right-0 top-full z-10 hidden min-w-[150px] rounded-lg border border-gray-200 bg-white p-2 shadow-lg group-hover:block dark:border-gray-700 dark:bg-gray-800">
              {table.getAllLeafColumns().map((col) => (
                <label
                  key={col.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={col.getIsVisible()}
                    onChange={(e) => col.toggleVisibility(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                    {col.id}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          "flex items-center gap-1",
                          header.column.getCanSort() && "cursor-pointer select-none"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="text-gray-400">
                            {{
                              asc: <ChevronUp className="h-4 w-4" />,
                              desc: <ChevronDown className="h-4 w-4" />,
                            }[header.column.getIsSorted() as string] ?? (
                              <ArrowUpDown className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No issues found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 px-4 py-3 dark:border-gray-800 sm:flex-row">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Showing {startRow} to {endRow} of {totalRows} issues
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {pageIndex + 1} of {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}