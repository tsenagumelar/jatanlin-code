"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/src/redux/hooks";
import { logout } from "@/src/modules/login/slice";
import {
  getAuthTokenCookie,
  isAuthTokenExpired,
  removeAuthCookie,
} from "@/src/utils/auth";

export function V3LicenseGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkSession = () => {
      const token = getAuthTokenCookie();
      if (isAuthTokenExpired(token)) {
        removeAuthCookie();
        dispatch(logout());
        router.replace("/login");
      }
    };

    checkSession();
    const interval = window.setInterval(checkSession, 60_000);
    return () => window.clearInterval(interval);
  }, [dispatch, router]);

  return <>{children}</>;
}
