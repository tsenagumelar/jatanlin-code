"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { logout, setLicenseChecked } from "@/src/modules/login/slice";
import {
  getAuthTokenCookie,
  isAuthTokenExpired,
  removeAuthCookie,
} from "@/src/utils/auth";

function isAdminRole(code?: string | null, name?: string | null) {
  return [code, name].some((role) => role?.toLowerCase().includes("admin"));
}

export function V3LicenseGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, licenseChecked } = useAppSelector((state) => state.login);
  const isAdmin = isAdminRole(
    user?.master_role?.code,
    user?.master_role?.role_name,
  );

  useEffect(() => {
    const checkSession = async () => {
      const token = getAuthTokenCookie();
      if (isAuthTokenExpired(token)) {
        removeAuthCookie();
        dispatch(logout());
        router.replace("/login");
        return;
      }

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
        const response = await fetch(`${apiUrl}/veam/status`, {
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = await response.json();
        dispatch(setLicenseChecked(data));
      } catch {
        // Keep the current session decision when the license API is unreachable.
      }
    };

    void checkSession();
    const interval = window.setInterval(checkSession, 60_000);
    return () => window.clearInterval(interval);
  }, [dispatch, router]);

  useEffect(() => {
    if (!licenseChecked || licenseChecked.valid) return;

    if (isAdmin) {
      if (pathname !== "/system/license") {
        router.replace("/system/license");
      }
      return;
    }

    removeAuthCookie();
    dispatch(logout());
    router.replace("/login");
  }, [dispatch, isAdmin, licenseChecked, pathname, router]);

  return <>{children}</>;
}
