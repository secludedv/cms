import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost } from "@/lib/api";
import type { ComplaintRequest, ComplaintResponse } from "@/lib/types";

export function useCreateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ComplaintRequest) =>
      apiPost<ComplaintResponse>("/customer/complaints", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["complaints"] }),
  });
}
