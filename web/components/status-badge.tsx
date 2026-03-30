import { Badge } from "@/components/ui/badge";
import type { ComplaintStatus } from "@/lib/types";

const statusConfig: Record<
  ComplaintStatus,
  { label: string; className: string }
> = {
  OPEN: {
    label: "Open",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  ASSIGNED: {
    label: "Assigned",
    className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  },
  RESOLVED: {
    label: "Resolved",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  CLOSED: {
    label: "Closed",
    className: "bg-slate-100 text-slate-800 hover:bg-slate-100",
  },
};

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-800",
  };

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}
