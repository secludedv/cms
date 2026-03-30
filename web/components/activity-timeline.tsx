import type { LogEntry } from "@/lib/types";
import { formatDateIST } from "@/lib/format-date";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  MessageSquare,
  UserMinus,
  UserPlus,
  FileEdit,
} from "lucide-react";

const actionIcons: Record<string, React.ReactNode> = {
  COMPLAINT_CREATED: <AlertCircle className="h-4 w-4 text-blue-600" />,
  COMPLAINT_UPDATED: <FileEdit className="h-4 w-4 text-slate-600" />,
  STATUS_CHANGE: <ArrowRight className="h-4 w-4 text-amber-600" />,
  ENGINEER_ASSIGNED: <UserPlus className="h-4 w-4 text-green-600" />,
  ENGINEER_REMOVED: <UserMinus className="h-4 w-4 text-red-600" />,
  REMARK_ADDED: <MessageSquare className="h-4 w-4 text-purple-600" />,
  ASSIGNMENT_COMPLETED: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
};

const actionColors: Record<string, string> = {
  COMPLAINT_CREATED: "border-blue-300 bg-blue-50",
  COMPLAINT_UPDATED: "border-slate-300 bg-slate-50",
  STATUS_CHANGE: "border-amber-300 bg-amber-50",
  ENGINEER_ASSIGNED: "border-green-300 bg-green-50",
  ENGINEER_REMOVED: "border-red-300 bg-red-50",
  REMARK_ADDED: "border-purple-300 bg-purple-50",
  ASSIGNMENT_COMPLETED: "border-emerald-300 bg-emerald-50",
};

const roleBadgeClass: Record<string, string> = {
  ADMIN: "bg-slate-800 text-white hover:bg-slate-800",
  MANAGER: "bg-blue-700 text-white hover:bg-blue-700",
  ENGINEER: "bg-amber-600 text-white hover:bg-amber-600",
  CUSTOMER: "bg-green-700 text-white hover:bg-green-700",
};

const statusLabel: Record<string, string> = {
  OPEN: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

function formatDate(dateStr: string) {
  return formatDateIST(dateStr);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function getActionTitle(log: LogEntry) {
  switch (log.action) {
    case "COMPLAINT_CREATED":
      return "Complaint Created";
    case "COMPLAINT_UPDATED":
      return "Complaint Updated";
    case "STATUS_CHANGE":
      return "Status Changed";
    case "ENGINEER_ASSIGNED":
      return "Engineer Assigned";
    case "ENGINEER_REMOVED":
      return "Engineer Removed";
    case "REMARK_ADDED":
      return "Work Remark Added";
    case "ASSIGNMENT_COMPLETED":
      return "Assignment Completed";
    default:
      return String(log.action).replace(/_/g, " ");
  }
}

function getActionDescription(log: LogEntry) {
  switch (log.action) {
    case "COMPLAINT_CREATED":
      return `${log.performedByName} created this complaint`;
    case "COMPLAINT_UPDATED":
      return `${log.performedByName} updated the complaint details`;
    case "STATUS_CHANGE":
      return null; // Handled separately with badges
    case "ENGINEER_ASSIGNED":
      return `${log.performedByName} assigned an engineer to this complaint`;
    case "ENGINEER_REMOVED":
      return `${log.performedByName} removed an engineer from this complaint`;
    case "REMARK_ADDED":
      return `${log.performedByName} added a work remark`;
    case "ASSIGNMENT_COMPLETED":
      return `${log.performedByName} marked their assignment as completed`;
    default:
      return `Action performed by ${log.performedByName}`;
  }
}

export function ActivityTimeline({ logs }: { logs: LogEntry[] }) {
  if (!logs?.length) {
    return (
      <p className="text-sm text-muted-foreground">No activity recorded.</p>
    );
  }

  return (
    <div className="relative">
      {/* Vertical connector line */}
      <div className="absolute left-4 top-6 bottom-6 w-px bg-border" />

      <div className="space-y-1">
        {logs.map((log) => (
          <div key={log.id} className="relative flex gap-3 pb-1">
            {/* Icon dot */}
            <div
              className={`relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                actionColors[log.action] ?? "border-slate-300 bg-slate-50"
              }`}
            >
              {actionIcons[log.action] ?? (
                <Clock className="h-4 w-4 text-slate-500" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 rounded-lg border bg-card p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">
                    {getActionTitle(log)}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 h-5 ${
                      roleBadgeClass[log.performedByRole] ??
                      "bg-slate-200 text-slate-800"
                    }`}
                  >
                    {log.performedByRole}
                  </Badge>
                </div>
                <span
                  className="shrink-0 text-xs text-muted-foreground"
                  title={formatDate(log.createdAt)}
                >
                  {timeAgo(log.createdAt)}
                </span>
              </div>

              {/* Status change: show from → to badges */}
              {log.action === "STATUS_CHANGE" &&
                log.oldValue &&
                log.newValue && (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-normal">
                      {statusLabel[log.oldValue] ?? log.oldValue}
                    </Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Badge className="text-xs bg-primary text-primary-foreground">
                      {statusLabel[log.newValue] ?? log.newValue}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-1">
                      by {log.performedByName}
                    </span>
                  </div>
                )}

              {/* Action description */}
              {log.action !== "STATUS_CHANGE" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {getActionDescription(log)}
                </p>
              )}

              {/* Remarks */}
              {log.remarks && (
                <div className="mt-2 rounded-md bg-muted/60 px-3 py-2 text-xs text-foreground">
                  {log.remarks}
                </div>
              )}

              {/* Full timestamp on a separate line */}
              <p className="mt-1.5 text-[11px] text-muted-foreground/70">
                {formatDate(log.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
