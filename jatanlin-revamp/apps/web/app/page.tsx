"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/src/redux/hooks";

export default function V3IndexPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.login);

  useEffect(() => {
    router.replace(isAuthenticated ? "/dashboard" : "/login");
  }, [isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">
      Redirecting...
    </div>
  );
}
