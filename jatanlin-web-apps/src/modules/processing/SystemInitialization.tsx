"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Spinner,
} from "@fluentui/react-components";
import {
  CheckmarkCircle24Filled,
  DismissCircle24Filled,
} from "@fluentui/react-icons";

type DeviceStatus = "checking" | "connected" | "error";

type Device = {
  id: string;
  name: string;
  ip?: string;
  status: DeviceStatus;
};

const isDeviceCheckProdMode =
  process.env.NEXT_PUBLIC_DEVICE_CHECK_PROD_MODE === "true";

const deviceCheckTimeoutMs = Number(
  process.env.NEXT_PUBLIC_DEVICE_CHECK_TIMEOUT_MS || "3000"
);

const initialDevices: Omit<Device, "status">[] = [
  {
    id: "anpr",
    name: "Kamera ANPR",
    ip: process.env.NEXT_PUBLIC_ANPR_IP,
  },
  {
    id: "axle",
    name: "Kamera Sumbu",
    ip: process.env.NEXT_PUBLIC_AXLE_IP,
  },
  {
    id: "weight",
    name: "Jembatan Timbang",
    ip: process.env.NEXT_PUBLIC_WIM_IP,
  },
];

interface SystemInitializationProps {
  onComplete: () => void;
  variant?: "full" | "simple";
}

export const SystemInitialization: React.FC<SystemInitializationProps> = ({
  onComplete,
  variant = "full",
}) => {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>(
    initialDevices.map((d) => ({ ...d, status: "checking" as DeviceStatus }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isChecking, setIsChecking] = useState(true);

  const buildDeviceUrl = useCallback((ipOrUrl?: string) => {
    if (!ipOrUrl) return null;
    if (/^https?:\/\//i.test(ipOrUrl)) {
      return ipOrUrl;
    }
    return `http://${ipOrUrl}`;
  }, []);

  const pingDevice = useCallback(async (ipOrUrl?: string) => {
    const targetUrl = buildDeviceUrl(ipOrUrl);
    if (!targetUrl) return false;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), deviceCheckTimeoutMs);

    try {
      await fetch(targetUrl, {
        method: "GET",
        mode: "no-cors",
        cache: "no-store",
        signal: controller.signal,
      });
      return true;
    } catch {
      return false;
    } finally {
      window.clearTimeout(timeout);
    }
  }, [buildDeviceUrl]);

  useEffect(() => {
    if (!isChecking) return;

    let cancelled = false;

    async function checkDevices() {
      for (let i = 0; i < initialDevices.length; i++) {
        if (cancelled) return;

        setCurrentIndex(i);

        let isSuccess = true;

        if (isDeviceCheckProdMode) {
          isSuccess = await pingDevice(initialDevices[i].ip);
        } else {
          await new Promise((res) => setTimeout(res, 300));
        }

        if (cancelled) return;

        setDevices((prev) =>
          prev.map((device, idx) =>
            idx === i
              ? { ...device, status: isSuccess ? "connected" : "error" }
              : device
          )
        );
      }

      if (!cancelled) {
        setIsChecking(false);
      }
    }

    checkDevices();

    return () => {
      cancelled = true;
    };
  }, [isChecking, pingDevice]);

  const allConnected = devices.every((d) => d.status === "connected");
  const hasError = devices.some((d) => d.status === "error");

  const handleRetry = () => {
    setDevices(
      initialDevices.map((d) => ({ ...d, status: "checking" as DeviceStatus }))
    );
    setCurrentIndex(0);
    setIsChecking(true);
  };

  const handleClickerMode = async () => {
    if (variant === "simple") {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch (error) {
          console.error("Failed to exit fullscreen:", error);
        }
      }
      router.push("/processing");
      return;
    }

    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error("Failed to enter fullscreen:", error);
    }

    router.push("/processing/clicker/fullscreen");
  };

  const handleDoubleClick = useCallback(() => {
    if (isChecking) return;

    if (hasError) {
      handleRetry();
      return;
    }

    if (allConnected) {
      onComplete();
    }
  }, [allConnected, hasError, isChecking, onComplete]);

  useEffect(() => {
    if (variant !== "simple") return;

    window.addEventListener("dblclick", handleDoubleClick);
    return () => {
      window.removeEventListener("dblclick", handleDoubleClick);
    };
  }, [handleDoubleClick, variant]);

  const isClicker = variant === "simple";

  return (
    <div
      className={`h-full flex items-center justify-center p-6 ${
        isClicker ? "bg-black text-white select-none" : "bg-gray-50"
      }`}
    >
      <div className={`w-[80%] ${isClicker ? "min-w-6xl!" : "max-w-3xl"}`}>
        <Card className={isClicker ? "p-10! bg-black! border border-slate-700" : "p-8"}>
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1
                className={`font-semibold ${
                  isClicker ? "text-6xl text-white" : "text-2xl text-gray-900"
                }`}
              >
                Pengecekan Perangkat
              </h1>
              <p
                className={`mt-2 ${
                  isClicker ? "text-2xl text-white" : "text-sm text-gray-600"
                }`}
              >
                {isChecking
                  ? "Sistem sedang memeriksa koneksi perangkat..."
                  : allConnected
                  ? "Semua perangkat terhubung dengan baik"
                  : "Beberapa perangkat mengalami masalah"}
              </p>
            </div>
            {variant !== "simple" && (
              <div className="flex items-center gap-2">
                <Button appearance="secondary" onClick={handleClickerMode}>
                  Mode Klik
                </Button>
              </div>
            )}
          </div>

          {/* Status Summary */}
          <div
            className={`mb-6 rounded-lg border ${
              isChecking
                ? isClicker
                  ? "bg-slate-900 border-blue-500"
                  : "bg-blue-50 border-blue-200"
                : allConnected
                ? isClicker
                  ? "bg-emerald-900 border-emerald-500"
                  : "bg-green-50 border-green-200"
                : isClicker
                ? "bg-red-900 border-red-500"
                : "bg-red-50 border-red-200"
            } ${isClicker ? "px-10 py-10" : "px-4 py-4"}`}
          >
            <div className="flex items-center gap-3">
              {isChecking ? (
                <Spinner size="medium" />
              ) : allConnected ? (
                <CheckmarkCircle24Filled
                  className={isClicker ? "text-emerald-300" : "text-green-600"}
                />
              ) : (
                <DismissCircle24Filled
                  className={isClicker ? "text-red-300" : "text-red-600"}
                />
              )}
              <div>
                <p
                  className={`font-semibold ${
                    isChecking
                      ? isClicker
                        ? "text-blue-100 text-3xl"
                        : "text-blue-900 text-sm"
                      : allConnected
                      ? isClicker
                        ? "text-emerald-100 text-3xl"
                        : "text-green-900 text-sm"
                      : isClicker
                      ? "text-red-100 text-3xl"
                      : "text-red-900 text-sm"
                  }`}
                >
                  {isChecking
                    ? "Memeriksa perangkat..."
                    : allConnected
                    ? "Sistem siap digunakan"
                    : "Perbaiki koneksi perangkat"}
                </p>
                <p
                  className={`${
                    isChecking
                      ? isClicker
                        ? "text-blue-200 text-xl"
                        : "text-blue-700 text-xs"
                      : allConnected
                      ? isClicker
                        ? "text-emerald-200 text-xl"
                        : "text-green-700 text-xs"
                      : isClicker
                      ? "text-red-200 text-xl"
                      : "text-red-700 text-xs"
                  }`}
                >
                  {devices.filter((d) => d.status === "connected").length} dari{" "}
                  {devices.length} perangkat terhubung
                </p>
              </div>
            </div>
          </div>

          {/* Device List */}
          <div className={`space-y-4 mb-8 ${isClicker ? "text-2xl" : ""}`}>
            {devices.map((device, idx) => {
              const isCurrent = idx === currentIndex && isChecking;
              const isConnected = device.status === "connected";
              const isError = device.status === "error";

              return (
                <div
                  key={device.id}
                  className={`rounded-xl border ${
                    isConnected
                      ? isClicker
                        ? "bg-emerald-900 border-emerald-500"
                        : "bg-green-50 border-green-200"
                      : isError
                      ? isClicker
                        ? "bg-red-900 border-red-500"
                        : "bg-red-50 border-red-200"
                      : isClicker
                      ? "bg-slate-900 border-slate-700"
                      : "bg-gray-50 border-gray-200"
                  } ${isClicker ? "px-8 py-7" : "px-4 py-3"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {device.status === "checking" ? (
                        <Spinner size="small" />
                      ) : isConnected ? (
                        <CheckmarkCircle24Filled
                          className={`w-5 h-5 ${
                            isClicker ? "text-emerald-300" : "text-green-600"
                          }`}
                        />
                      ) : (
                        <DismissCircle24Filled
                          className={`w-5 h-5 ${
                            isClicker ? "text-red-300" : "text-red-600"
                          }`}
                        />
                      )}
                      <div>
                        <p
                          className={`font-medium ${
                            isConnected
                              ? isClicker
                                ? "text-emerald-50 text-3xl"
                                : "text-green-900 text-sm"
                              : isError
                              ? isClicker
                                ? "text-red-50 text-3xl"
                                : "text-red-900 text-sm"
                              : isClicker
                              ? "text-slate-100 text-3xl"
                              : "text-gray-900 text-sm"
                          }`}
                        >
                          {device.name}
                        </p>
                        <p
                          className={`${
                            isConnected
                              ? isClicker
                                ? "text-emerald-200 text-xl"
                                : "text-green-700 text-xs"
                              : isError
                              ? isClicker
                                ? "text-red-200 text-xl"
                                : "text-red-700 text-xs"
                              : isClicker
                              ? "text-slate-300 text-xl"
                              : "text-gray-600 text-xs"
                          }`}
                        >
                          {device.status === "checking"
                            ? isCurrent
                              ? "Sedang memeriksa..."
                              : "Menunggu..."
                            : isConnected
                            ? "Terhubung"
                            : "Tidak terhubung"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              appearance="secondary"
              onClick={handleRetry}
              disabled={isChecking}
              size={isClicker ? "large" : "medium"}
              className={isClicker ? "text-2xl px-8 py-6" : undefined}
            >
              Cek Ulang
            </Button>

            <Button
              appearance="primary"
              onClick={onComplete}
              disabled={isChecking || hasError}
              size={isClicker ? "large" : "medium"}
              className={isClicker ? "text-2xl px-8 py-6" : undefined}
              style={{
                backgroundColor: allConnected && !isChecking ? "#107c10" : undefined,
              }}
            >
              {isChecking ? "Memeriksa..." : "Mulai Sistem"}
            </Button>
          </div>

          {hasError && !isChecking && (
            <p className="mt-4 text-xs text-red-600 text-center">
              Pastikan semua perangkat terhubung sebelum memulai sistem
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};
