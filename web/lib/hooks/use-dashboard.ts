import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiGet<DashboardStats>("/admin/dashboard/stats"),
  });
}
