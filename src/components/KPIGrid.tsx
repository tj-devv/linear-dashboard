import {
  ListChecks,
  CircleDot,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Users,
  Clock,
} from "lucide-react";
import { cn, formatNumber, formatResolutionTime } from "@/lib/utils";
import type { KPIValues } from "@/lib/types";

interface KPIGridProps {
  kpis: KPIValues;
  className?: string;
}

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  variant?: "default" | "success" | "warning" | "danger";
}

function KPICard({
  label,
  value,
  icon: Icon,
  variant = "default",
}: KPICardProps) {
  const variantStyles = {
    default: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800",
    success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    warning: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    danger: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  };

  const iconVariants = {
    default: "text-gray-600 dark:text-gray-400",
    success: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400",
  };

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md",
        variantStyles[variant]
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </span>
        <Icon className={cn("h-5 w-5", iconVariants[variant])} />
      </div>

      <div className="mt-3">
        <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </span>
      </div>
    </div>
  );
}

export function KPIGrid({ kpis, className }: KPIGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7",
        className
      )}
    >
      <KPICard
        label="Total Issues"
        value={formatNumber(kpis.total)}
        icon={ListChecks}
        variant="default"
      />
      <KPICard
        label="Open Issues"
        value={formatNumber(kpis.open)}
        icon={CircleDot}
        variant="warning"
      />
      <KPICard
        label="Closed Issues"
        value={formatNumber(kpis.closed)}
        icon={CheckCircle2}
        variant="success"
      />
      <KPICard
        label="Urgent Issues"
        value={formatNumber(kpis.urgent)}
        icon={AlertTriangle}
        variant={kpis.urgent > 0 ? "danger" : "default"}
      />
      <KPICard
        label="Blocked Issues"
        value={formatNumber(kpis.blocked)}
        icon={Ban}
        variant={kpis.blocked > 0 ? "danger" : "default"}
      />
      <KPICard
        label="Active Assignees"
        value={formatNumber(kpis.activeAssignees)}
        icon={Users}
        variant="default"
      />
      <KPICard
        label="Avg. Resolution Time"
        value={formatResolutionTime(kpis.avgResolutionTime)}
        icon={Clock}
        variant="default"
      />
    </div>
  );
}