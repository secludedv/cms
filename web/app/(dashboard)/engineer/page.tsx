"use client";

import Link from "next/link";
import { useAssignments } from "@/lib/hooks/use-assignments";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Building2, Calendar } from "lucide-react";
import type { ComplaintStatus } from "@/lib/types";

export default function EngineerAssignmentsPage() {
  const { data: assignments, isLoading } = useAssignments(true);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Assignments"
        description="Active assignments requiring your attention"
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : assignments?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((a) => (
            <Link key={a.id} href={`/engineer/assignments/${a.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      {a.status}
                    </Badge>
                    {a.complaintStatus && (
                      <StatusBadge
                        status={a.complaintStatus as ComplaintStatus}
                      />
                    )}
                  </div>
                  <CardTitle className="text-base mt-2">
                    {a.complaintNumber ? `${a.complaintNumber} - ` : ""}
                    {a.complaintTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {a.customerCompanyName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{a.customerCompanyName}</span>
                    </div>
                  )}
                  {a.siteAddress && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{a.siteAddress}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Visit: {a.assignedDate}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No active assignments. You&apos;re all caught up!
          </CardContent>
        </Card>
      )}
    </div>
  );
}
