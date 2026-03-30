"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useComplaint,
  useUpdateComplaintStatus,
} from "@/lib/hooks/use-complaints";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { ActivityTimeline } from "@/components/activity-timeline";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateComplaintPdf } from "@/lib/generate-complaint-pdf";
import { formatDateOnlyIST } from "@/lib/format-date";
import type { ComplaintStatus } from "@/lib/types";

const STATUSES: ComplaintStatus[] = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

export default function AdminComplaintDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: complaint, isLoading } = useComplaint(id, "/admin");
  const statusMutation = useUpdateComplaintStatus("/admin");
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);

  function handleStatusChange(status: string) {
    if (status === "CLOSED") {
      setCloseConfirmOpen(true);
      return;
    }
    statusMutation.mutate(
      { id, status: status as ComplaintStatus },
      {
        onSuccess: () => toast.success("Status updated"),
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleConfirmClose() {
    statusMutation.mutate(
      { id, status: "CLOSED" as ComplaintStatus },
      {
        onSuccess: () => {
          toast.success("Complaint closed");
          setCloseConfirmOpen(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!complaint) {
    return <p className="text-muted-foreground">Complaint not found.</p>;
  }

  const isClosed = complaint.status === "CLOSED";

  return (
    <div className="space-y-6">
      <PageHeader
        title={complaint.complaintNumber ?? `Complaint #${complaint.id}`}
        description={`Issue: ${complaint.title}`}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateComplaintPdf(complaint)}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
        {/* Main info - left/center columns */}
        <div className="lg:col-span-2 space-y-6 lg:row-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Detail of Issue
                </p>
                <p className="mt-1 text-sm">{complaint.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Customer
                  </p>
                  <p className="mt-1 text-sm">
                    {complaint.customerCompanyName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Contact
                  </p>
                  <p className="mt-1 text-sm">
                    {complaint.customerContactPerson}
                  </p>
                </div>
                {complaint.category && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      System
                    </p>
                    <p className="mt-1 text-sm">{complaint.category}</p>
                  </div>
                )}
                {complaint.siteAddress && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Site Address
                    </p>
                    <p className="mt-1 text-sm">{complaint.siteAddress}</p>
                  </div>
                )}
              </div>

              {(complaint.equipmentName ||
                complaint.equipmentModel ||
                complaint.equipmentSerialNumber) && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Equipment
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      {complaint.equipmentName && (
                        <div>
                          <p className="text-xs text-muted-foreground">Name</p>
                          <p className="text-sm">{complaint.equipmentName}</p>
                        </div>
                      )}
                      {complaint.equipmentModel && (
                        <div>
                          <p className="text-xs text-muted-foreground">Model</p>
                          <p className="text-sm">{complaint.equipmentModel}</p>
                        </div>
                      )}
                      {complaint.equipmentSerialNumber && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Serial No.
                          </p>
                          <p className="text-sm">
                            {complaint.equipmentSerialNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assigned Engineers</CardTitle>
            </CardHeader>
            <CardContent>
              {complaint.assignments?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Engineer</TableHead>
                      <TableHead>Assigned Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Work Done</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complaint.assignments.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">
                          {a.engineerName}
                        </TableCell>
                        <TableCell>{a.assignedDate}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              a.status === "ACTIVE"
                                ? "bg-blue-100 text-blue-800"
                                : a.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-slate-100 text-slate-600"
                            }
                          >
                            {a.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-48 truncate">
                          {a.workDone || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No engineers assigned.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Status card - below assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
              </div>

              <Separator />

              {isClosed ? (
                <p className="text-sm text-muted-foreground">
                  This complaint is closed. Status can no longer be changed.
                </p>
              ) : (
                <div>
                  <p className="text-sm font-medium mb-2">Override Status</p>
                  <Select
                    value={complaint.status}
                    onValueChange={handleStatusChange}
                    disabled={statusMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDateOnlyIST(complaint.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span>{formatDateOnlyIST(complaint.updatedAt)}</span>
                </div>
                {complaint.closedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Closed</span>
                    <span>{formatDateOnlyIST(complaint.closedAt)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity - right column */}
        <div className="lg:row-span-1 self-stretch">
          <Card className="h-full flex flex-col">
            <CardHeader className="shrink-0">
              <CardTitle className="text-lg">Activity</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto pr-1">
                <ActivityTimeline logs={complaint.logs ?? []} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Close Confirmation */}
      <ConfirmDialog
        open={closeConfirmOpen}
        onOpenChange={setCloseConfirmOpen}
        title="Close Complaint"
        description="Are you sure you want to close this complaint? This action is permanent and the status cannot be changed again."
        onConfirm={handleConfirmClose}
        loading={statusMutation.isPending}
        variant="destructive"
        confirmText="Yes, Close Complaint"
      />
    </div>
  );
}
