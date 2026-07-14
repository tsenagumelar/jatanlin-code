"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/src/redux/hooks";
import { V3AppShell } from "@/src/modules/v3/layout";
import { V3LicenseGate } from "@/src/modules/v3/system/license/LicenseGate";

export default function V3PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.login);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">
        Redirecting to login...
      </div>
    );
  }

  return (
    <V3AppShell>
      <V3LicenseGate>{children}</V3LicenseGate>
    </V3AppShell>
  );
}
