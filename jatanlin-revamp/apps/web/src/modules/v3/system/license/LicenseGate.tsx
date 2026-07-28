"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
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
  const [isRescanning, setIsRescanning] = useState(false);
  const [rescanMessage, setRescanMessage] = useState<string | null>(null);
  const isAdmin = isAdminRole(
    user?.master_role?.code,
    user?.master_role?.role_name,
  );
  const apiUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
    [],
  );

  const handleLogout = useCallback(() => {
    removeAuthCookie();
    dispatch(logout());
    router.replace("/login");
  }, [dispatch, router]);

  const checkLicenseStatus = useCallback(async () => {
    const response = await fetch(`${apiUrl}/veam/status`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = await response.json();
    dispatch(setLicenseChecked(data));
    return data as { valid?: boolean; message?: string };
  }, [apiUrl, dispatch]);

  const handleRescan = useCallback(async () => {
    setIsRescanning(true);
    setRescanMessage(null);
    try {
      const data = await checkLicenseStatus();
      if (!data) {
        setRescanMessage("Backend API tidak merespons. Coba lagi.");
        return;
      }
      setRescanMessage(
        data.valid
          ? "Lisensi USB aktif. Akses dibuka kembali."
          : data.message || "Lisensi USB belum ditemukan.",
      );
    } catch {
      setRescanMessage("Backend API tidak tersedia. Coba lagi.");
    } finally {
      setIsRescanning(false);
    }
  }, [checkLicenseStatus]);

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
        await checkLicenseStatus();
      } catch {
        // Keep the current session decision when the license API is unreachable.
      }
    };

    void checkSession();
    const interval = window.setInterval(checkSession, 15_000);
    return () => window.clearInterval(interval);
  }, [checkLicenseStatus, dispatch, router]);

  useEffect(() => {
    if (!licenseChecked || licenseChecked.valid) return;

    if (isAdmin) {
      if (pathname !== "/system/license") {
        router.replace("/system/license");
      }
      return;
    }
  }, [isAdmin, licenseChecked, pathname, router]);

  const shouldLockPage = Boolean(
    licenseChecked &&
      !licenseChecked.valid &&
      !isAdmin &&
      pathname !== "/login",
  );

  return (
    <>
      {children}
      {shouldLockPage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <span className="text-lg font-black">!</span>
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-950">
                  Lisensi USB Tidak Terdeteksi
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Akses dikunci karena lisensi aktif berasal dari USB dan file
                  lisensi tidak lagi terdeteksi. Pasang kembali USB lalu rescan,
                  atau logout dari sesi ini.
                </p>
                <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                  {rescanMessage || licenseChecked.message}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Logout
              </button>
              <button
                type="button"
                onClick={handleRescan}
                disabled={isRescanning}
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isRescanning ? "Scanning..." : "Rescan USB"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
