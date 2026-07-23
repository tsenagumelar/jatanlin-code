import type { ChangeEvent, FormEvent } from "react";
import type { LoginFormData, User } from "@/src/modules/login/types";

interface BackendLicenseCheck {
  status: string;
  valid: boolean;
  message: string;
  source?: string;
  checked_at: string;
}

export interface BackendLoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    expires_at: string;
    user: User;
    license_checked?: BackendLicenseCheck;
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
