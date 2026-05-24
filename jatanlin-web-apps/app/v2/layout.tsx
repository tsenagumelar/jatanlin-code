"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/src/redux/hooks";
import { V2Navbar } from "@/src/modules/v2/layout/V2Navbar";
import { V2Sidebar } from "@/src/modules/v2/layout/V2Sidebar";

export default function V2Layout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isAuthenticated } = useAppSelector((state) => state.login);
  const router = useRouter();

  React.useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      <V2Sidebar isCollapsed={isCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        <V2Navbar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((v) => !v)} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
