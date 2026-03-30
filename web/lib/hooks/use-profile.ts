import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { CustomerResponse } from "@/lib/types";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => apiGet<CustomerResponse>("/customer/profile"),
  });
}
