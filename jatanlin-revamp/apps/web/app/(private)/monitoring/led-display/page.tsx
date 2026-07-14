"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckmarkCircle24Filled,
  Circle12Filled,
  FullScreenMaximize24Regular,
  FullScreenMinimize24Regular,
  Warning24Filled,
} from "@fluentui/react-icons";
import { V3DefaultPage } from "@/src/modules/v3/shared/DefaultPage";
import { useV3Processing } from "@/src/modules/v3/monitoring/processing/hooks";

function hasValue(items: Array<{ value: string }>) {
  return items.some((item) => item.value && item.value !== "-");
}

function stepStatus({
  isRunning,
  isWaiting,
  isDone,
}: {
  isRunning: boolean;
  isWaiting: boolean;
  isDone: boolean;
}) {
  if (isDone) return "Data Received";
  if (isRunning || isWaiting) return "Waiting for Data";
  return "Idle";
}

export default function LedDisplayPage() {
  const ledRef = useRef<HTMLElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const processing = useV3Processing();
  const hasAnpr = processing.plateNo !== "-";
  const hasWim = hasValue(processing.wimItems);
  const hasAxle = hasValue(processing.axleItems);
  const hasCctv = processing.cctvUrl !== "";
  const weightMetric = processing.metrics.find((metric) => metric.label === "Weight");
  const lengthMetric = processing.metrics.find((metric) => metric.label === "Length");
  const widthMetric = processing.metrics.find((metric) => metric.label === "Width");
  const heightMetric = processing.metrics.find((metric) => metric.label === "Height");
  const anprValue = [
    `Plate: ${processing.plateNo}`,
    `L: ${lengthMetric?.actual ?? "-"}`,
    `W: ${widthMetric?.actual ?? "-"}`,
    `H: ${heightMetric?.actual ?? "-"}`,
  ].join(" | ");
  const resultMetrics = [
    weightMetric,
    lengthMetric,
    widthMetric,
    heightMetric,
  ].filter(Boolean) as typeof processing.metrics;
  const steps = [
    {
      label: "ANPR",
      value: anprValue,
      done: hasAnpr,
      status: stepStatus({
        isRunning: processing.isStarted,
        isWaiting: processing.isAnprWaiting,
        isDone: hasAnpr,
      }),
    },
    {
      label: "WIM",
      value: processing.wimLiveItems.map((item) => `${item.label}: ${item.value}`).join(" | "),
      done: hasWim,
      status: stepStatus({
        isRunning: processing.isStarted,
        isWaiting: processing.isWimWaiting,
        isDone: hasWim,
      }),
    },
    {
      label: "AXLE",
      value: processing.axleItems.map((item) => `${item.label}: ${item.value}`).join(" | "),
      done: hasAxle,
      status: stepStatus({
        isRunning: processing.isStarted,
        isWaiting: processing.isAxleWaiting,
        isDone: hasAxle,
      }),
    },
    {
      label: "CCTV",
      value: processing.cctvItems.map((item) => `${item.label}: ${item.value}`).join(" | "),
      done: hasCctv,
      status: stepStatus({
        isRunning: processing.isStarted,
        isWaiting: processing.isCctvWaiting,
        isDone: hasCctv,
      }),
    },
  ];
  const isViolation = processing.violation !== "Normal" && processing.violation !== "Pending";
  const toggleFullscreen = async () => {
    if (!ledRef.current) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await ledRef.current.requestFullscreen();
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === ledRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <V3DefaultPage
      title="LED Display"
      breadcrumbs={[
        { label: "Monitoring" },
        { label: "LED Display" },
      ]}
      description="LED style display for the active processing result."
    >
      <section
        ref={ledRef}
        className={`overflow-hidden border-4 border-slate-800 bg-black shadow-2xl ${
          isFullscreen ? "h-screen rounded-none" : "rounded-xl"
        }`}
      >
        <div className={`relative p-6 text-white ${isFullscreen ? "min-h-screen" : "min-h-[860px]"}`}>
          <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle,rgba(148,163,184,0.6)_1.5px,transparent_1.5px)] [background-size:8px_8px]" />
          <div className={`relative z-10 flex h-full flex-col ${isFullscreen ? "min-h-[calc(100vh-48px)]" : "min-h-[810px]"}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <p className="text-base font-black uppercase tracking-[0.28em] text-emerald-400">
                  JATANLIN LED DISPLAY
                </p>
                <h2 className="mt-2 text-6xl font-black tracking-wide text-white">
                  PROCESSING DATA
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-emerald-500/50 bg-emerald-500/10 px-6 py-3 text-2xl font-black text-emerald-300">
                  {processing.status.toUpperCase()}
                </div>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-slate-600 bg-slate-900/80 text-white transition hover:bg-slate-800"
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? (
                    <FullScreenMinimize24Regular className="h-7 w-7" />
                  ) : (
                    <FullScreenMaximize24Regular className="h-7 w-7" />
                  )}
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-700 bg-slate-950/70 p-5">
              <p className="mb-4 text-2xl font-black uppercase tracking-[0.2em] text-blue-300">
                Incoming Data
              </p>
              <div className="grid gap-5 md:grid-cols-2">
                {steps.map((step, index) => (
                  <div
                    key={step.label}
                    className={`min-h-[170px] rounded-2xl border p-6 ${
                      step.done
                        ? "border-emerald-500/70 bg-emerald-500/10"
                        : "border-slate-700 bg-slate-900/70"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-black uppercase tracking-[0.2em] text-slate-400">
                          Step {index + 1}
                        </p>
                        <p className="mt-2 text-5xl font-black text-white">{step.label}</p>
                      </div>
                      {step.done ? (
                        <CheckmarkCircle24Filled className="h-14 w-14 text-emerald-400" />
                      ) : (
                        <Circle12Filled className="h-8 w-8 animate-pulse text-slate-600" />
                      )}
                    </div>
                    <p
                      className={`mt-5 font-mono text-4xl font-black ${
                        step.done
                          ? "text-emerald-300"
                          : processing.isStarted
                            ? "text-amber-300"
                            : "text-slate-500"
                      }`}
                    >
                      {step.status}
                    </p>
                    <p className="mt-3 line-clamp-2 font-mono text-2xl font-bold leading-tight text-slate-300">
                      {step.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-1 flex-col rounded-[2rem] border-2 border-slate-700 bg-slate-950/80 p-10">
              <p className="text-4xl font-black uppercase tracking-[0.24em] text-blue-300">
                Reading Result
              </p>
              <div className="mt-8 grid flex-1 gap-10 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="flex min-h-[390px] flex-col items-center justify-center text-center">
                  <p className="font-mono text-[9rem] font-black leading-none tracking-[0.08em] text-emerald-300 [text-shadow:0_0_36px_rgba(52,211,153,0.75)]">
                    {processing.plateNo}
                  </p>
                  <div
                    className={`mt-12 inline-flex items-center gap-6 rounded-[2rem] border-2 px-14 py-9 text-7xl font-black ${
                      isViolation
                        ? "border-red-500/70 bg-red-500/10 text-red-300 [text-shadow:0_0_32px_rgba(248,113,113,0.75)]"
                        : processing.violation === "Pending"
                          ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                          : "border-emerald-500/70 bg-emerald-500/10 text-emerald-300"
                    }`}
                  >
                    {isViolation ? <Warning24Filled className="h-20 w-20" /> : <CheckmarkCircle24Filled className="h-20 w-20" />}
                    {processing.violation.toUpperCase()}
                  </div>
                </div>

                <div className="grid content-stretch gap-6 md:grid-cols-2">
                  {resultMetrics.map((item) => (
                    <div
                      key={item.label}
                      className={`flex flex-col items-center justify-center rounded-[1.75rem] border-2 p-8 text-center ${
                        item.status === "over"
                          ? "border-red-500/70 bg-red-500/10"
                          : "border-slate-800 bg-black/60"
                      }`}
                    >
                      <p className="text-2xl font-black uppercase tracking-[0.16em] text-slate-500">
                        {item.label === "Weight" ? "Total Weight" : item.label}
                      </p>
                      <p
                        className={`mt-6 truncate font-mono text-5xl font-black ${
                          item.status === "over" ? "text-red-300" : "text-white"
                        }`}
                      >
                        {item.actual} / {item.limit}
                      </p>
                      <p className={`mt-4 text-2xl font-black uppercase ${
                        item.status === "over" ? "text-red-300" : "text-slate-500"
                      }`}>
                        Actual / Limit
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </V3DefaultPage>
  );
}
