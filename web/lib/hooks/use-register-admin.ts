import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api";
import type { RegisterAdminRequest } from "@/lib/types";

export function useRegisterAdmin() {
  return useMutation({
    mutationFn: (data: RegisterAdminRequest) =>
      apiPost<null>("/auth/register/admin", data),
  });
}
