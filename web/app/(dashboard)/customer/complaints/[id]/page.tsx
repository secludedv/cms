"use client";

import { useParams } from "next/navigation";
import { useComplaint } from "@/lib/hooks/use-complaints";
import { formatDateOnlyIST } from "@/lib/format-date";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CustomerComplaintDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: complaint, isLoading } = useComplaint(id, "/customer");

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

  return (
    <div className="space-y-6">
      <PageHeader
        title={complaint.complaintNumber ?? `Complaint #${complaint.id}`}
        description={`Issue: ${complaint.title}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
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

              {complaint.managerRemarks && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Manager Remarks
                    </p>
                    <p className="mt-1 text-sm">{complaint.managerRemarks}</p>
                  </div>
                </>
              )}

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
            <CardHeader>
              <CardTitle className="text-lg">Assigned Engineers</CardTitle>
            </CardHeader>
            <CardContent>
              {complaint.assignments?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Engineer</TableHead>
                      <TableHead>Visit Date</TableHead>
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
                  No engineers assigned yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={complaint.status} />
              </div>
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
      </div>
    </div>
  );
}
