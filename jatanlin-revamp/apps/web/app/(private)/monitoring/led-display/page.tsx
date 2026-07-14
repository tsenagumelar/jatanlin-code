"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckmarkCircle24Filled,
  Circle12Filled,
  FullScreenMaximize24Regular,
  FullScreenMinimize24Regular,
  Warning24Filled,
} from "@fluentui/react-icons";
import { V3DefaultPage } from "@/src/modules/v3/shared/DefaultPage";
import { useV3Processing } from "@/src/modules/v3/monitoring/processing/hooks";

type LedStepKey = "anpr" | "wim" | "axle" | "dimension" | "cctv" | "analysis";

type LedStep = {
  key: LedStepKey;
  title: string;
  waitingTitle: string;
  doneTitle: string;
  subtitle: string;
  timeoutSeconds: number;
  hasData: boolean;
  value: string;
};

const STEP_MIN_SECONDS = 5;
const STEP_MAX_SECONDS = 10;
const ANALYSIS_DISPLAY_SECONDS = 30;

function hasItemValue(items: Array<{ value: string }>) {
  return items.some((item) => item.value && item.value !== "-");
}

function joinItems(items: Array<{ label: string; value: string }>) {
  const values = items
    .filter((item) => item.value && item.value !== "-")
    .map((item) => `${item.label}: ${item.value}`);

  return values.length > 0 ? values.join("  |  ") : "-";
}

function statusTone(violation: string) {
  const value = violation.toLowerCase();
  if (!violation || value === "pending") return "waiting";
  if (value === "normal") return "normal";
  return "violation";
}

export default function LedDisplayPage() {
  const ledRef = useRef<HTMLElement | null>(null);
  const processing = useV3Processing();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [clock, setClock] = useState("");
  const ledStepsRef = useRef<LedStep[]>([]);
  const previousStartedRef = useRef(false);

  const weightMetric = processing.metrics.find((metric) => metric.label === "Weight");
  const lengthMetric = processing.metrics.find((metric) => metric.label === "Length");
  const widthMetric = processing.metrics.find((metric) => metric.label === "Width");
  const heightMetric = processing.metrics.find((metric) => metric.label === "Height");
  const hasAnpr = processing.plateNo !== "-";
  const hasWim = hasItemValue(processing.wimLiveItems);
  const hasAxle = hasItemValue(processing.axleItems);
  const hasDimension =
    (lengthMetric?.actual && lengthMetric.actual !== "-") ||
    (widthMetric?.actual && widthMetric.actual !== "-") ||
    (heightMetric?.actual && heightMetric.actual !== "-");
  const hasCctv =
    !!processing.cctvUrl ||
    processing.cctvItems.some((item) =>
      item.value.toLowerCase().includes("available"),
    );
  const hasAnalysis = processing.violation !== "Pending" || processing.isFinalized;
  const isLedActive = processing.isStarted || processing.isFinalized;

  const ledSteps: LedStep[] = useMemo(
    () => [
      {
        key: "anpr",
        title: "DETEKSI PLAT NOMOR",
        waitingTitle: "MENDETEKSI PLAT NOMOR",
        doneTitle: processing.plateNo,
        subtitle: "Kamera ANPR membaca nomor kendaraan",
        timeoutSeconds: STEP_MAX_SECONDS,
        hasData: hasAnpr,
        value: `PLAT NOMOR: ${processing.plateNo}`,
      },
      {
        key: "wim",
        title: "PENIMBANGAN KENDARAAN",
        waitingTitle: "SEDANG MENIMBANG",
        doneTitle: weightMetric?.actual || "DATA BERAT DITERIMA",
        subtitle: "Kendaraan tetap di area timbang",
        timeoutSeconds: STEP_MAX_SECONDS,
        hasData: hasWim,
        value: joinItems(processing.wimLiveItems),
      },
      {
        key: "axle",
        title: "DETEKSI SUMBU",
        waitingTitle: "MENDETEKSI SUMBU",
        doneTitle: "DATA SUMBU DITERIMA",
        subtitle: "Sistem membaca jumlah sumbu dan tipe kendaraan",
        timeoutSeconds: STEP_MAX_SECONDS,
        hasData: hasAxle,
        value: joinItems(processing.axleItems),
      },
      {
        key: "dimension",
        title: "PENGUKURAN DIMENSI",
        waitingTitle: "MENGUKUR DIMENSI",
        doneTitle: "DATA DIMENSI DITERIMA",
        subtitle: "Sistem membaca panjang, lebar, dan tinggi",
        timeoutSeconds: STEP_MAX_SECONDS,
        hasData: Boolean(hasDimension),
        value: [
          `Panjang: ${lengthMetric?.actual || "-"}`,
          `Lebar: ${widthMetric?.actual || "-"}`,
          `Tinggi: ${heightMetric?.actual || "-"}`,
        ].join("  |  "),
      },
      {
        key: "cctv",
        title: "REKAM BUKTI CCTV",
        waitingTitle: "MEREKAM BUKTI",
        doneTitle: "BUKTI CCTV DITERIMA",
        subtitle: "Sistem menyimpan bukti kendaraan",
        timeoutSeconds: STEP_MAX_SECONDS,
        hasData: hasCctv,
        value: joinItems(processing.cctvItems),
      },
      {
        key: "analysis",
        title: "ANALISA HASIL",
        waitingTitle: "MENGANALISA HASIL",
        doneTitle:
          processing.violation === "Pending"
            ? "MENUNGGU DATA AKHIR"
            : processing.violation.toUpperCase(),
        subtitle: "Jika data belum lengkap, sistem menunggu sampai time window habis",
        timeoutSeconds: ANALYSIS_DISPLAY_SECONDS,
        hasData: hasAnalysis,
        value: `TIME WINDOW: ${processing.timeoutRemaining}s`,
      },
    ],
    [
      hasAnpr,
      hasAxle,
      hasCctv,
      hasDimension,
      hasWim,
      hasAnalysis,
      heightMetric?.actual,
      lengthMetric?.actual,
      processing.axleItems,
      processing.cctvItems,
      processing.plateNo,
      processing.timeoutRemaining,
      processing.violation,
      processing.wimLiveItems,
      weightMetric?.actual,
      widthMetric?.actual,
    ],
  );

  const activeStep = ledSteps[activeStepIndex] || ledSteps[0];
  const activeStepKey = activeStep?.key;
  const finalTone = statusTone(processing.violation);
  const isAnalysisStep = activeStep.key === "analysis";
  const isViolation = finalTone === "violation";
  const isNormal = finalTone === "normal";

  useEffect(() => {
    ledStepsRef.current = ledSteps;
  }, [ledSteps]);

  const toggleFullscreen = useCallback(async () => {
    if (!ledRef.current) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await ledRef.current.requestFullscreen();
  }, []);

  useEffect(() => {
    const tick = () => {
      setClock(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === ledRef.current);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "f") {
        void toggleFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleFullscreen]);

  useEffect(() => {
    const wasStarted = previousStartedRef.current;
    previousStartedRef.current = processing.isStarted;

    if (processing.isStarted && !wasStarted) {
      setActiveStepIndex(0);
      setRemainingSeconds(STEP_MAX_SECONDS);
      return;
    }

    if (!isLedActive) {
      setActiveStepIndex(0);
      setRemainingSeconds(STEP_MAX_SECONDS);
    }
  }, [isLedActive, processing.isStarted]);

  useEffect(() => {
    if (!isLedActive || !activeStepKey) return;

    const startedAt = Date.now();
    const duration =
      activeStepKey === "analysis"
        ? ANALYSIS_DISPLAY_SECONDS
        : STEP_MAX_SECONDS;
    setRemainingSeconds(duration);

    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      const latestStep = ledStepsRef.current[activeStepIndex];
      const stepHasData = Boolean(latestStep?.hasData);
      setRemainingSeconds(remaining);

      if (activeStepKey === "analysis") {
        return;
      }

      if ((stepHasData && elapsed >= STEP_MIN_SECONDS) || remaining <= 0) {
        window.clearInterval(timer);
        setActiveStepIndex((current) =>
          Math.min(current + 1, ledStepsRef.current.length - 1),
        );
      }
    }, 250);

    return () => window.clearInterval(timer);
  }, [
    activeStepKey,
    activeStepIndex,
    isLedActive,
  ]);

  const mainTitle = !isLedActive
    ? "SISTEM SIAP"
    : activeStep.hasData
      ? activeStep.doneTitle
      : activeStep.waitingTitle;
  const mainSubtitle = !isLedActive
    ? "Silakan masuk ke area pemeriksaan"
    : activeStep.subtitle;
  const titleColor = isAnalysisStep
    ? isViolation
      ? "text-red-300 [text-shadow:0_0_44px_rgba(248,113,113,0.7)]"
      : isNormal
        ? "text-emerald-300 [text-shadow:0_0_44px_rgba(52,211,153,0.7)]"
        : "text-amber-300 [text-shadow:0_0_44px_rgba(251,191,36,0.55)]"
    : activeStep.hasData
      ? "text-emerald-300 [text-shadow:0_0_44px_rgba(52,211,153,0.7)]"
      : "text-blue-300 [text-shadow:0_0_44px_rgba(96,165,250,0.65)]";

  const content = (
    <section
      ref={ledRef}
      className={`relative overflow-hidden bg-black text-white ${
        isFullscreen ? "h-screen" : "min-h-[calc(100vh-150px)] rounded-lg border border-slate-800"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle,rgba(148,163,184,0.55)_1.5px,transparent_1.5px)] [background-size:8px_8px]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-blue-950/45 to-transparent" />

      <div className={`relative z-10 flex min-h-full flex-col ${isFullscreen ? "h-screen p-8" : "p-7"}`}>
        <header className="flex shrink-0 items-center justify-between gap-6 border-b border-slate-800 pb-5">
          <div>
            <p className="text-xl font-black uppercase tracking-[0.3em] text-blue-300">
              JATANLIN LED DISPLAY
            </p>
            <p className="mt-2 text-4xl font-black tracking-[0.08em] text-slate-200">
              MONITORING PROSES PENINDAKAN
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-mono text-5xl font-black leading-none text-white">
                {clock}
              </p>
              <p className="mt-1 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                WIB
              </p>
            </div>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-slate-600 bg-slate-900/80 text-white transition hover:bg-slate-800"
              title={isFullscreen ? "Keluar fullscreen" : "Mode fullscreen"}
              aria-label={isFullscreen ? "Keluar fullscreen" : "Mode fullscreen"}
            >
              {isFullscreen ? (
                <FullScreenMinimize24Regular className="h-8 w-8" />
              ) : (
                <FullScreenMaximize24Regular className="h-8 w-8" />
              )}
            </button>
          </div>
        </header>

        <main className="grid flex-1 gap-7 py-7 xl:grid-cols-[1fr_390px]">
          <div className="flex min-h-[560px] flex-col justify-center rounded-[2rem] border border-slate-800 bg-slate-950/80 p-10 text-center">
            <div className="mx-auto mb-10 flex h-32 w-32 items-center justify-center rounded-full border-2 border-slate-700 bg-black">
              {!isLedActive ? (
                <Circle12Filled className="h-12 w-12 animate-pulse text-emerald-400" />
              ) : isAnalysisStep && isViolation ? (
                <Warning24Filled className="h-24 w-24 text-red-300" />
              ) : activeStep.hasData || isNormal ? (
                <CheckmarkCircle24Filled className="h-24 w-24 text-emerald-300" />
              ) : (
                <Circle12Filled className="h-12 w-12 animate-pulse text-blue-300" />
              )}
            </div>

            <p className="text-3xl font-black uppercase tracking-[0.24em] text-slate-500">
              Step {activeStepIndex + 1} / {ledSteps.length} · {activeStep.title}
            </p>
            <h1 className={`mx-auto mt-8 max-w-[1350px] text-[clamp(4.5rem,9vw,10.5rem)] font-black leading-[0.95] tracking-[0.04em] ${titleColor}`}>
              {mainTitle}
            </h1>
            <p className="mx-auto mt-8 max-w-[1180px] text-[clamp(2rem,4vw,4.75rem)] font-black leading-tight text-slate-200">
              {mainSubtitle}
            </p>

            <div className="mt-12 rounded-[1.5rem] border border-slate-800 bg-black/70 px-8 py-6">
              <p className="font-mono text-[clamp(1.35rem,2vw,2.4rem)] font-black uppercase tracking-[0.08em] text-slate-300">
                {activeStep.value}
              </p>
            </div>
          </div>

          <aside className="flex flex-col rounded-[2rem] border border-slate-800 bg-slate-950/80 p-6">
            <p className="text-lg font-black uppercase tracking-[0.24em] text-slate-500">
              Batas Waktu
            </p>
            <div className="mt-5 rounded-[1.5rem] border border-blue-500/30 bg-blue-500/10 p-6 text-center">
              <p className="font-mono text-[clamp(4rem,7vw,7.5rem)] font-black leading-none text-blue-200">
                {isLedActive ? remainingSeconds : activeStep.timeoutSeconds}
              </p>
              <p className="mt-3 text-2xl font-black uppercase tracking-[0.2em] text-blue-300">
                Detik
              </p>
            </div>

            <div className="mt-7 space-y-3">
              {ledSteps.map((step, index) => {
                const isActive = index === activeStepIndex && isLedActive;
                const isComplete =
                  index < activeStepIndex ||
                  (index === activeStepIndex && step.hasData && !isAnalysisStep);
                return (
                  <div
                    key={step.key}
                    className={`rounded-2xl border px-4 py-4 ${
                      isActive
                        ? "border-blue-400 bg-blue-500/12"
                        : isComplete
                          ? "border-emerald-500/40 bg-emerald-500/10"
                          : "border-slate-800 bg-black/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                          isActive
                            ? "bg-blue-300 text-blue-950"
                            : isComplete
                              ? "bg-emerald-300 text-emerald-950"
                              : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xl font-black uppercase tracking-[0.08em] text-white">
                          {step.title}
                        </p>
                        <p className="mt-1 text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
                          {isComplete ? "Selesai" : isActive ? "Berjalan" : "Menunggu"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </main>

        <footer className="grid shrink-0 gap-5 border-t border-slate-800 pt-5 lg:grid-cols-4">
          {processing.metrics.map((metric) => (
            <div
              key={metric.label}
              className={`rounded-2xl border px-6 py-5 ${
                metric.status === "over"
                  ? "border-red-500/50 bg-red-500/10"
                  : "border-slate-800 bg-black/60"
              }`}
            >
              <p className="text-lg font-black uppercase tracking-[0.16em] text-slate-500">
                {metric.label}
              </p>
              <p
                className={`mt-3 truncate font-mono text-4xl font-black ${
                  metric.status === "over" ? "text-red-300" : "text-white"
                }`}
              >
                {metric.actual}
              </p>
              <p className="mt-2 text-xl font-black text-slate-500">
                Limit {metric.limit}
              </p>
            </div>
          ))}
        </footer>
      </div>
    </section>
  );

  return (
    <V3DefaultPage
      title="LED Display"
      breadcrumbs={[{ label: "Monitoring" }, { label: "LED Display" }]}
      description="Step-by-step external LED display for active processing."
    >
      {content}
    </V3DefaultPage>
  );
}
