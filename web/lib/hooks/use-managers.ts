import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type { ManagerRequest, ManagerResponse } from "@/lib/types";

export function useManagers(prefix = "/admin") {
  return useQuery({
    queryKey: ["managers", prefix],
    queryFn: () => apiGet<ManagerResponse[]>(`${prefix}/managers`),
  });
}

export function useManager(id: number, prefix = "/admin") {
  return useQuery({
    queryKey: ["manager", id, prefix],
    queryFn: () => apiGet<ManagerResponse>(`${prefix}/managers/${id}`),
    enabled: !!id,
  });
}

export function useCreateManager(prefix = "/admin") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ManagerRequest) =>
      apiPost<ManagerResponse>(`${prefix}/managers`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["managers"] }),
  });
}

export function useUpdateManager(prefix = "/admin") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ManagerRequest }) =>
      apiPut<ManagerResponse>(`${prefix}/managers/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["managers"] }),
  });
}

export function useDeleteManager(prefix = "/admin") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiDelete<null>(`${prefix}/managers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["managers"] }),
  });
}
