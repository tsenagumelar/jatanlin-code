"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/src/redux/hooks";

function isAdminRole(code?: string | null, name?: string | null) {
  return [code, name].some((role) => role?.toLowerCase().includes("admin"));
}

export default function V3PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, licenseChecked, user } = useAppSelector(
    (state) => state.login,
  );

  useEffect(() => {
    if (isAuthenticated) {
      if (
        licenseChecked &&
        !licenseChecked.valid &&
        isAdminRole(user?.master_role?.code, user?.master_role?.role_name)
      ) {
        router.replace("/system/license");
        return;
      }
      router.replace("/dashboard");
    }
  }, [isAuthenticated, licenseChecked, router, user]);

  return children;
}
