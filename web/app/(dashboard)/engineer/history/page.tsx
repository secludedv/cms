"use client";

import { useState } from "react";
import { useAssignments } from "@/lib/hooks/use-assignments";
import { formatDateOnlyIST } from "@/lib/format-date";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import Link from "next/link";

export default function EngineerHistoryPage() {
  const { data: assignments, isLoading } = useAssignments(false);
  const [search, setSearch] = useState("");

  const filtered = assignments?.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (a.complaintNumber ?? "").toLowerCase().includes(q) ||
      (a.complaintTitle ?? "").toLowerCase().includes(q) ||
      (a.customerCompanyName ?? "").toLowerCase().includes(q) ||
      a.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignment History"
        description="All assignments including completed and removed"
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by complaint number, issue, company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Complaint</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Assigned Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Work Done</TableHead>
              <TableHead>Completed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered?.length ? (
              filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <Link
                      href={`/engineer/assignments/${a.id}`}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {a.complaintNumber ? `${a.complaintNumber} - ` : ""}
                      {a.complaintTitle}
                    </Link>
                  </TableCell>
                  <TableCell>{a.customerCompanyName || "—"}</TableCell>
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
                  <TableCell>
                    {a.completedAt ? formatDateOnlyIST(a.completedAt) : "-"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No assignment history found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
