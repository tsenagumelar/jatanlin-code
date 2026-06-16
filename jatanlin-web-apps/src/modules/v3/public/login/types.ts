import type { ChangeEvent, FormEvent } from "react";
import type { LoginFormData, User } from "@/src/modules/login/types";

export interface BackendLoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    expires_at: string;
    user: User;
  };
}

export interface UseV3LoginResult {
  formData: LoginFormData;
  isLoading: boolean;
  error: string | null;
  handleChange: (
    field: keyof LoginFormData,
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (event: FormEvent) => Promise<void>;
}
