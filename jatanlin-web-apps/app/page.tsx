"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/src/redux/hooks";
import { Spinner } from "@/src/components/atoms";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.login);

  useEffect(() => {
    // Redirect based on authentication status
    if (isAuthenticated) {
      router.push("/beranda");
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="text-center">
        <Spinner size="large" />
        <p className="mt-4 text-lg text-[#605e5c]">Mengalihkan...</p>
      </div>
    </div>
  );
}
