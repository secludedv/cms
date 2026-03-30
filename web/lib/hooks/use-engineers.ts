import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type { EngineerRequest, EngineerResponse } from "@/lib/types";

export function useEngineers(prefix = "/admin") {
  return useQuery({
    queryKey: ["engineers", prefix],
    queryFn: () => apiGet<EngineerResponse[]>(`${prefix}/engineers`),
  });
}

export function useEngineer(id: number, prefix = "/admin") {
  return useQuery({
    queryKey: ["engineer", id, prefix],
    queryFn: () => apiGet<EngineerResponse>(`${prefix}/engineers/${id}`),
    enabled: !!id,
  });
}

export function useCreateEngineer(prefix = "/admin") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EngineerRequest) =>
      apiPost<EngineerResponse>(`${prefix}/engineers`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["engineers"] }),
  });
}

export function useUpdateEngineer(prefix = "/admin") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EngineerRequest }) =>
      apiPut<EngineerResponse>(`${prefix}/engineers/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["engineers"] }),
  });
}

export function useDeleteEngineer(prefix = "/admin") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiDelete<null>(`${prefix}/engineers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["engineers"] }),
  });
}
