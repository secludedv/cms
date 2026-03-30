import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type {
  AssignEngineerRequest,
  AssignmentResponse,
  RemarkRequest,
} from "@/lib/types";

// Manager: assign/remove engineers
export function useAssignEngineer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      complaintId,
      data,
    }: {
      complaintId: number;
      data: AssignEngineerRequest;
    }) =>
      apiPost<AssignmentResponse>(
        `/manager/complaints/${complaintId}/assign`,
        data,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complaints"] });
      qc.invalidateQueries({ queryKey: ["complaint"] });
    },
  });
}

export function useRemoveAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      complaintId,
      assignmentId,
    }: {
      complaintId: number;
      assignmentId: number;
    }) =>
      apiDelete<null>(
        `/manager/complaints/${complaintId}/assign/${assignmentId}`,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complaints"] });
      qc.invalidateQueries({ queryKey: ["complaint"] });
    },
  });
}

// Engineer: view / remark / complete assignments
export function useAssignments(active = true) {
  return useQuery({
    queryKey: ["assignments", active ? "active" : "all"],
    queryFn: () =>
      apiGet<AssignmentResponse[]>(
        `/engineer/assignments${active ? "" : "/all"}`,
      ),
  });
}

export function useAssignment(id: number) {
  return useQuery({
    queryKey: ["assignment", id],
    queryFn: () => apiGet<AssignmentResponse>(`/engineer/assignments/${id}`),
    enabled: !!id,
  });
}

export function useAddRemark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RemarkRequest }) =>
      apiPut<AssignmentResponse>(`/engineer/assignments/${id}/remark`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
      qc.invalidateQueries({ queryKey: ["assignment"] });
    },
  });
}

export function useCompleteAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiPut<AssignmentResponse>(`/engineer/assignments/${id}/complete`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
      qc.invalidateQueries({ queryKey: ["assignment"] });
    },
  });
}
