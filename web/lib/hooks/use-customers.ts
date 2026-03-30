import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type { CustomerRequest, CustomerResponse } from "@/lib/types";

export function useCustomers(prefix = "/admin") {
  return useQuery({
    queryKey: ["customers", prefix],
    queryFn: () => apiGet<CustomerResponse[]>(`${prefix}/customers`),
  });
}

export function useCustomer(id: number, prefix = "/admin") {
  return useQuery({
    queryKey: ["customer", id, prefix],
    queryFn: () => apiGet<CustomerResponse>(`${prefix}/customers/${id}`),
    enabled: !!id,
  });
}

export function useCreateCustomer(prefix = "/manager") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CustomerRequest) =>
      apiPost<CustomerResponse>(`${prefix}/customers`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useUpdateCustomer(prefix = "/manager") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CustomerRequest }) =>
      apiPut<CustomerResponse>(`${prefix}/customers/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useDeleteCustomer(prefix = "/manager") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiDelete<null>(`${prefix}/customers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}
