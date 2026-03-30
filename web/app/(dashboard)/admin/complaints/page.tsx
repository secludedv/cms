"use client";

import { useState } from "react";
import Link from "next/link";
import { useComplaints } from "@/lib/hooks/use-complaints";
import { formatDateOnlyIST } from "@/lib/format-date";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
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

export default function AdminComplaintsPage() {
  const { data: complaints, isLoading } = useComplaints("/admin");
  const [search, setSearch] = useState("");

  const filtered = complaints?.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (c.complaintNumber ?? "").toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.customerCompanyName?.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q) ||
      (c.priority ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Complaints"
        description="All complaints across the system"
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by complaint number, issue, company, status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
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
              filtered.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell>
                    <Link
                      href={`/admin/complaints/${c.id}`}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {c.complaintNumber ?? `#${c.id}`}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/complaints/${c.id}`}
                      className="hover:underline"
                    >
                      {c.title}
                    </Link>
                  </TableCell>
                  <TableCell>{c.customerCompanyName}</TableCell>
                  <TableCell>
                    <PriorityBadge priority={c.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                  <TableCell>{formatDateOnlyIST(c.createdAt)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No complaints found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
