"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useComplaint,
  useUpdateComplaintStatus,
  useUpdateComplaintPriority,
  useAddManagerRemark,
} from "@/lib/hooks/use-complaints";
import { useEngineers } from "@/lib/hooks/use-engineers";
import {
  useAssignEngineer,
  useRemoveAssignment,
} from "@/lib/hooks/use-assignments";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { ActivityTimeline } from "@/components/activity-timeline";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Plus, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { generateComplaintPdf } from "@/lib/generate-complaint-pdf";
import { formatDateOnlyIST } from "@/lib/format-date";
import type { ComplaintStatus, Priority } from "@/lib/types";

const STATUSES: ComplaintStatus[] = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function ManagerComplaintDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: complaint, isLoading } = useComplaint(id, "/manager");
  const { data: engineers } = useEngineers("/manager");
  const statusMutation = useUpdateComplaintStatus("/manager");
  const assignMutation = useAssignEngineer();
  const removeMutation = useRemoveAssignment();
  const priorityMutation = useUpdateComplaintPriority();
  const remarkMutation = useAddManagerRemark();

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    engineerId: "",
    assignedDate: "",
  });
  const [conflictConfirmOpen, setConflictConfirmOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{
    complaintId: number;
    assignmentId: number;
    engineerName: string;
  } | null>(null);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [remarkText, setRemarkText] = useState("");

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

  function checkAssignmentConflict(): boolean {
    if (
      !complaint?.assignments ||
      !assignForm.engineerId ||
      !assignForm.assignedDate
    )
      return false;
    return complaint.assignments.some(
      (a) =>
        a.engineerId === Number(assignForm.engineerId) &&
        a.assignedDate === assignForm.assignedDate &&
        a.status === "ACTIVE",
    );
  }

  function submitAssignment() {
    assignMutation.mutate(
      {
        complaintId: id,
        data: {
          engineerId: Number(assignForm.engineerId),
          assignedDate: assignForm.assignedDate,
        },
      },
      {
        onSuccess: () => {
          toast.success("Engineer assigned");
          setAssignOpen(false);
          setConflictConfirmOpen(false);
          setAssignForm({ engineerId: "", assignedDate: "" });
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (checkAssignmentConflict()) {
      setConflictConfirmOpen(true);
      return;
    }
    submitAssignment();
  }

  function handleRemove() {
    if (!removeTarget) return;
    removeMutation.mutate(
      {
        complaintId: removeTarget.complaintId,
        assignmentId: removeTarget.assignmentId,
      },
      {
        onSuccess: () => {
          toast.success("Engineer removed from complaint");
          setRemoveTarget(null);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handlePriorityChange(priority: string) {
    priorityMutation.mutate(
      { id, priority: priority as Priority },
      {
        onSuccess: () => toast.success("Priority updated"),
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleAddRemark(e: React.FormEvent) {
    e.preventDefault();
    if (!remarkText.trim()) return;
    remarkMutation.mutate(
      { id, data: { remarks: remarkText.trim() } },
      {
        onSuccess: () => {
          toast.success("Remark added");
          setRemarkText("");
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
                  <div className="grid grid-cols-3 gap-4">
                    {complaint.equipmentName && (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Equipment
                        </p>
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
                </>
              )}
            </CardContent>
          </Card>

          {/* Assignments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Assigned Engineers</CardTitle>
              {!isClosed && (
                <Button size="sm" onClick={() => setAssignOpen(true)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Assign
                </Button>
              )}
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
                      {!isClosed && <TableHead className="w-16"></TableHead>}
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
                        {!isClosed && (
                          <TableCell>
                            {a.status === "ACTIVE" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setRemoveTarget({
                                    complaintId: complaint.id,
                                    assignmentId: a.id,
                                    engineerName: a.engineerName,
                                  })
                                }
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </TableCell>
                        )}
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
                  <p className="text-sm font-medium mb-2">Change Status</p>
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
              {!isClosed && (
                <>
                  <div>
                    <p className="text-sm font-medium mb-2">Change Priority</p>
                    <Select
                      value={complaint.priority ?? "LOW"}
                      onValueChange={handlePriorityChange}
                      disabled={priorityMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p.charAt(0) + p.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                </>
              )}
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

          {/* Manager Remarks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Manager Remarks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {complaint.managerRemarks && (
                <div className="rounded-md bg-muted/60 px-3 py-2 text-sm">
                  {complaint.managerRemarks}
                </div>
              )}
              {!isClosed && (
                <form onSubmit={handleAddRemark} className="space-y-3">
                  <Textarea
                    placeholder="Add a remark..."
                    value={remarkText}
                    onChange={(e) => setRemarkText(e.target.value)}
                    rows={3}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={remarkMutation.isPending || !remarkText.trim()}
                  >
                    {remarkMutation.isPending ? "Adding..." : "Add Remark"}
                  </Button>
                </form>
              )}
              {!complaint.managerRemarks && isClosed && (
                <p className="text-sm text-muted-foreground">
                  No remarks added.
                </p>
              )}
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

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Engineer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssign} className="space-y-4">
            <div className="space-y-2">
              <Label>Engineer</Label>
              <Select
                value={assignForm.engineerId}
                onValueChange={(v) =>
                  setAssignForm({ ...assignForm, engineerId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an engineer" />
                </SelectTrigger>
                <SelectContent>
                  {engineers?.map((eng) => (
                    <SelectItem key={eng.id} value={String(eng.id)}>
                      {eng.name} — {eng.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assigned Visit Date</Label>
              <Input
                type="date"
                value={assignForm.assignedDate}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, assignedDate: e.target.value })
                }
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAssignOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={assignMutation.isPending || !assignForm.engineerId}
              >
                {assignMutation.isPending ? "Assigning..." : "Assign"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation */}
      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove Engineer"
        description={`Remove "${removeTarget?.engineerName}" from this complaint?`}
        onConfirm={handleRemove}
        loading={removeMutation.isPending}
      />

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

      {/* Assignment Conflict Confirmation */}
      <ConfirmDialog
        open={conflictConfirmOpen}
        onOpenChange={setConflictConfirmOpen}
        title="Assignment Conflict"
        description={`This engineer already has an active assignment on ${assignForm.assignedDate} for this complaint. Do you still want to proceed with the assignment?`}
        onConfirm={submitAssignment}
        loading={assignMutation.isPending}
        variant="default"
        confirmText="Yes, Assign Anyway"
      />
    </div>
  );
}
