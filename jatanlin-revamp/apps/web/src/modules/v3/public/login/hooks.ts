import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import {
  clearError,
  setError,
  setLoading,
  setToken,
  setUser,
} from "@/src/modules/login/slice";
import { setAuthCookie, setAuthTokenCookie } from "@/src/utils/auth";
import type { LoginFormData } from "@/src/modules/login/types";
import type { BackendLoginResponse, UseV3LoginResult } from "./types";

export function useV3Login(): UseV3LoginResult {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.login,
  );
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const handleChange =
    (field: keyof LoginFormData) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormData((current) => ({
        ...current,
        [field]: event.target.value,
      }));

      if (error) {
        dispatch(clearError());
      }
    };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    dispatch(clearError());
    dispatch(setLoading(true));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.email,
          password: formData.password,
        }),
      });
      const payload = (await response.json()) as BackendLoginResponse;

      if (!response.ok || !payload.success || !payload.data) {
        dispatch(
          setError(payload.message || "Email/username or password is incorrect"),
        );
        return;
      }

      dispatch(setUser(payload.data.user));
      dispatch(setToken(payload.data.token));
      setAuthCookie(true);
      setAuthTokenCookie(payload.data.token);
      router.push("/dashboard");
    } catch {
      dispatch(setError("Unable to connect to the server"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return {
    formData,
    isLoading,
    error,
    handleChange,
    handleSubmit,
  };
}
