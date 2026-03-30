import { Badge } from "@/components/ui/badge";
import type { Priority } from "@/lib/types";

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  LOW: {
    label: "Low",
    className: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  },
  MEDIUM: {
    label: "Medium",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  HIGH: {
    label: "High",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  },
  CRITICAL: {
    label: "Critical",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
};

export function PriorityBadge({
  priority,
}: {
  priority: Priority | null;
}) {
  if (!priority) {
    return null;
  }

  const config = priorityConfig[priority] ?? {
    label: priority,
    className: "bg-gray-100 text-gray-800",
  };

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}
