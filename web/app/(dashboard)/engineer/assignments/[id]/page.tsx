"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useAssignment,
  useAddRemark,
  useCompleteAssignment,
} from "@/lib/hooks/use-assignments";
import { PageHeader } from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Building2, Calendar, CheckCircle2 } from "lucide-react";
import { formatDateOnlyIST } from "@/lib/format-date";
import { toast } from "sonner";

export default function AssignmentDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: assignment, isLoading } = useAssignment(id);
  const remarkMutation = useAddRemark();
  const completeMutation = useCompleteAssignment();

  const [remarkForm, setRemarkForm] = useState({
    workDone: "",
    remarks: "",
    visitDate: new Date().toISOString().split("T")[0],
  });
  const [completeOpen, setCompleteOpen] = useState(false);

  function handleRemark(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      workDone: remarkForm.workDone,
      remarks: remarkForm.remarks || undefined,
      visitDate: remarkForm.visitDate || undefined,
    };
    remarkMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          toast.success("Remark added successfully");
          setRemarkForm({
            workDone: "",
            remarks: "",
            visitDate: new Date().toISOString().split("T")[0],
          });
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleComplete() {
    completeMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Assignment marked as completed");
        setCompleteOpen(false);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!assignment) {
    return <p className="text-muted-foreground">Assignment not found.</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          assignment.complaintNumber
            ? `${assignment.complaintNumber} - ${assignment.complaintTitle}`
            : assignment.complaintTitle
        }
        description={`Assignment #${assignment.id}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaint details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Complaint Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignment.complaintDescription && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Detail of Issue
                  </p>
                  <p className="mt-1 text-sm">
                    {assignment.complaintDescription}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {assignment.customerCompanyName && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{assignment.customerCompanyName}</span>
                  </div>
                )}
                {assignment.siteAddress && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{assignment.siteAddress}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Visit date: {assignment.assignedDate}</span>
                </div>
              </div>

              {/* Previous work done */}
              {assignment.workDone && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Previous Work Done
                    </p>
                    <p className="text-sm">{assignment.workDone}</p>
                  </div>
                </>
              )}
              {assignment.remarks && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Previous Remarks
                  </p>
                  <p className="text-sm">{assignment.remarks}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add remark form — only if active */}
          {assignment.status === "ACTIVE" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Remark</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRemark} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workDone">Work Done *</Label>
                    <Textarea
                      id="workDone"
                      value={remarkForm.workDone}
                      onChange={(e) =>
                        setRemarkForm({
                          ...remarkForm,
                          workDone: e.target.value,
                        })
                      }
                      placeholder="Describe the work performed..."
                      required
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="remarks">Additional Remarks</Label>
                    <Textarea
                      id="remarks"
                      value={remarkForm.remarks}
                      onChange={(e) =>
                        setRemarkForm({
                          ...remarkForm,
                          remarks: e.target.value,
                        })
                      }
                      placeholder="Optional notes..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visitDate">Visit Date</Label>
                    <Input
                      id="visitDate"
                      type="date"
                      value={remarkForm.visitDate}
                      onChange={(e) =>
                        setRemarkForm({
                          ...remarkForm,
                          visitDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button type="submit" disabled={remarkMutation.isPending}>
                    {remarkMutation.isPending
                      ? "Submitting..."
                      : "Submit Remark"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={
                    assignment.status === "ACTIVE"
                      ? "bg-blue-100 text-blue-800"
                      : assignment.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 text-slate-600"
                  }
                >
                  {assignment.status}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned by</span>
                  <span>{assignment.assignedByManagerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned at</span>
                  <span>{formatDateOnlyIST(assignment.assignedAt)}</span>
                </div>
                {assignment.visitDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visited</span>
                    <span>{assignment.visitDate}</span>
                  </div>
                )}
                {assignment.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span>{formatDateOnlyIST(assignment.completedAt)}</span>
                  </div>
                )}
              </div>

              {assignment.status === "ACTIVE" && (
                <>
                  <Separator />
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() => setCompleteOpen(true)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark Complete
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        title="Complete Assignment"
        description="Mark this assignment as completed? This action cannot be undone."
        onConfirm={handleComplete}
        loading={completeMutation.isPending}
        variant="default"
        confirmText="Complete"
      />
    </div>
  );
}
