"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldKeyhole24Regular } from "@fluentui/react-icons";

interface LicenseStatusResponse {
  status: string;
  valid: boolean;
  message: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const licensePath = "/system/license";

export function V3LicenseGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(pathname === licensePath);
  const [message, setMessage] = useState("Memeriksa lisensi sistem...");

  useEffect(() => {
    let cancelled = false;

    async function checkLicense() {
      if (pathname === licensePath) {
        setAllowed(true);
        setChecking(false);
        return;
      }

      setChecking(true);
      try {
        const res = await fetch(`${apiUrl}/veam/status`, { cache: "no-store" });
        const data = (await res.json()) as LicenseStatusResponse;
        if (cancelled) return;

        if (data.valid) {
          setAllowed(true);
          setChecking(false);
          return;
        }

        setAllowed(false);
        setMessage(data.message || "Lisensi belum aktif");
        router.replace(licensePath);
      } catch {
        if (cancelled) return;
        setAllowed(false);
        setMessage("Backend API lisensi tidak tersedia");
        router.replace(licensePath);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    checkLicense();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (checking && !allowed) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
          <ShieldKeyhole24Regular className="h-5 w-5 text-blue-700" />
          {message}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
