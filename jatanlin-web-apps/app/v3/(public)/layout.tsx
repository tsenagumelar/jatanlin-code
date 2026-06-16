"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/src/redux/hooks";

export default function V3PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.login);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/v3/dashboard");
    }
  }, [isAuthenticated, router]);

  return children;
}

