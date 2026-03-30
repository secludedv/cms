"use client";

import { useDashboardStats } from "@/lib/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ClipboardList,
  HardHat,
  Building2,
  Users,
  Wrench,
  Archive,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  const total = stats?.totalComplaints ?? 0;
  const open = stats?.openComplaints ?? 0;
  const assigned = stats?.assignedComplaints ?? 0;
  const inProgress = stats?.inProgressComplaints ?? 0;
  const resolved = stats?.resolvedComplaints ?? 0;
  const closed = stats?.closedComplaints ?? 0;

  const activeComplaints = open + assigned + inProgress;

  // Status distribution for the bar
  const statusSegments = [
    { label: "Open", value: open, color: "bg-blue-500" },
    { label: "Assigned", value: assigned, color: "bg-amber-500" },
    { label: "In Progress", value: inProgress, color: "bg-orange-500" },
    { label: "Resolved", value: resolved, color: "bg-green-500" },
    { label: "Closed", value: closed, color: "bg-slate-400" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of the complaint management system"
      />

      {/* Hero Section - Total & Open Complaints */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="bg-linear-to-br from-blue-600 to-blue-700 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-100">
                Total Complaints
              </CardTitle>
              <ClipboardList className="h-5 w-5 text-blue-200" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-24 bg-blue-400/40" />
            ) : (
              <>
                <p className="text-4xl font-bold">{total}</p>
                <p className="text-sm text-blue-200 mt-1">
                  {activeComplaints} active &middot; {closed} closed
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-amber-100">
                Open Complaints
              </CardTitle>
              <AlertCircle className="h-5 w-5 text-amber-200" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-24 bg-amber-400/40" />
            ) : (
              <>
                <p className="text-4xl font-bold">{open}</p>
                <p className="text-sm text-amber-100 mt-1">
                  {total > 0
                    ? `${Math.round((open / total) * 100)}% of total`
                    : "No complaints yet"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Complaint Status Distribution Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Complaint Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-6 w-full" />
          ) : total > 0 ? (
            <>
              <div className="flex h-4 rounded-full overflow-hidden bg-muted">
                {statusSegments.map(
                  (seg) =>
                    seg.value > 0 && (
                      <div
                        key={seg.label}
                        className={`${seg.color} transition-all`}
                        style={{
                          width: `${(seg.value / total) * 100}%`,
                        }}
                        title={`${seg.label}: ${seg.value}`}
                      />
                    ),
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                {statusSegments.map((seg) => (
                  <div
                    key={seg.label}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className={`h-3 w-3 rounded-full ${seg.color}`} />
                    <span className="text-muted-foreground">{seg.label}</span>
                    <span className="font-semibold">{seg.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No complaints to display.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Status Breakdown Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assigned
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold">{assigned}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
            <Wrench className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold">{inProgress}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolved
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold">{resolved}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Closed
            </CardTitle>
            <Archive className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold">{closed}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Personnel Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Managers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold">{stats?.totalManagers ?? 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Engineers
            </CardTitle>
            <HardHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold">{stats?.totalEngineers ?? 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Customers
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold">{stats?.totalCustomers ?? 0}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
