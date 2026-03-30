import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import type {
  ComplaintResponse,
  ComplaintStatus,
  ManagerComplaintRequest,
  ManagerRemarkRequest,
  Priority,
} from "@/lib/types";

export function useComplaints(prefix = "/admin") {
  return useQuery({
    queryKey: ["complaints", prefix],
    queryFn: () => apiGet<ComplaintResponse[]>(`${prefix}/complaints`),
  });
}

export function useComplaint(id: number, prefix = "/admin") {
  return useQuery({
    queryKey: ["complaint", id, prefix],
    queryFn: () => apiGet<ComplaintResponse>(`${prefix}/complaints/${id}`),
    enabled: !!id,
  });
}

export function useUpdateComplaintStatus(prefix = "/admin") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: ComplaintStatus }) =>
      apiPut<ComplaintResponse>(`${prefix}/complaints/${id}/status`, {
        status,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complaints"] });
      qc.invalidateQueries({ queryKey: ["complaint"] });
      qc.invalidateQueries({ queryKey: ["assignments"] });
      qc.invalidateQueries({ queryKey: ["assignment"] });
    },
  });
}

export function useCreateManagerComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ManagerComplaintRequest) =>
      apiPost<ComplaintResponse>("/manager/complaints", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
}

export function useUpdateComplaintPriority() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, priority }: { id: number; priority: Priority }) =>
      apiPut<ComplaintResponse>(
        `/manager/complaints/${id}/priority?priority=${priority}`,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complaints"] });
      qc.invalidateQueries({ queryKey: ["complaint"] });
    },
  });
}

export function useAddManagerRemark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ManagerRemarkRequest }) =>
      apiPost<ComplaintResponse>(`/manager/complaints/${id}/remarks`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complaints"] });
      qc.invalidateQueries({ queryKey: ["complaint"] });
    },
  });
}
