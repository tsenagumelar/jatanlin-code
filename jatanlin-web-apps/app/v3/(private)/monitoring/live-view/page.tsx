"use client";

import Image from "next/image";
import {
  Camera24Regular,
  Circle12Filled,
  Scales24Regular,
  VehicleTruckProfile24Regular,
  Video24Regular,
} from "@fluentui/react-icons";
import { V3DefaultPage } from "@/src/modules/v3/shared/DefaultPage";
import { useV3Processing } from "@/src/modules/v3/monitoring/processing/hooks";

function LiveFrame({
  title,
  subtitle,
  icon,
  status,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  status: "online" | "warning" | "offline";
  children: React.ReactNode;
}) {
  const isOnline = status === "online";

  return (
    <section className="min-h-[300px] overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-sm">
      <div className="flex items-center justify-between bg-black/35 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2 text-white">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/80">
            {icon}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-extrabold">{title}</h2>
            <p className="truncate text-xs font-semibold text-white/50">{subtitle}</p>
          </div>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase text-white/80">
          <Circle12Filled className={`h-2 w-2 ${isOnline ? "animate-pulse text-emerald-400" : "text-red-400"}`} />
          {status}
        </span>
      </div>
      {children}
    </section>
  );
}

export default function LiveViewPage() {
  const processing = useV3Processing();
  const statusByKey = Object.fromEntries(
    processing.devices.map((device) => [device.key, device.status]),
  ) as Record<"anpr" | "axle" | "cctv" | "wim", "online" | "warning" | "offline">;

  return (
    <V3DefaultPage
      title="Live View"
      breadcrumbs={[
        { label: "Monitoring" },
        { label: "Live View" },
      ]}
      description="Live connection view for ANPR, Axle, CCTV, and WIM data."
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <LiveFrame
          title="ANPR"
          subtitle="Live license plate capture"
          icon={<Camera24Regular />}
          status={statusByKey.anpr ?? "offline"}
        >
          <div className="relative flex aspect-video min-h-[260px] items-center justify-center bg-slate-900">
            {processing.anprImage ? (
              <Image src={processing.anprImage} alt="ANPR live view" fill sizes="50vw" className="object-cover" unoptimized />
            ) : (
              <p className="text-sm font-bold text-slate-500">Waiting ANPR connection...</p>
            )}
          </div>
        </LiveFrame>

        <LiveFrame
          title="Axle"
          subtitle="Live axle and dimension capture"
          icon={<VehicleTruckProfile24Regular />}
          status={statusByKey.axle ?? "offline"}
        >
          <div className="relative flex aspect-video min-h-[260px] items-center justify-center bg-slate-900">
            {processing.axleImage ? (
              <Image src={processing.axleImage} alt="Axle live view" fill sizes="50vw" className="object-cover" unoptimized />
            ) : (
              <p className="text-sm font-bold text-slate-500">Waiting axle connection...</p>
            )}
          </div>
        </LiveFrame>

        <LiveFrame
          title="CCTV"
          subtitle="Live evidence recorder"
          icon={<Video24Regular />}
          status={statusByKey.cctv ?? "offline"}
        >
          <div className="flex aspect-video min-h-[260px] items-center justify-center bg-slate-900">
            {processing.cctvUrl ? (
              <video src={processing.cctvUrl} controls preload="metadata" className="h-full w-full object-cover" />
            ) : (
              <p className="text-sm font-bold text-slate-500">Waiting CCTV connection...</p>
            )}
          </div>
        </LiveFrame>

        <LiveFrame
          title="WIM"
          subtitle="Total weight, axle count, and weight per axle"
          icon={<Scales24Regular />}
          status={statusByKey.wim ?? "offline"}
        >
          <div className="grid min-h-[260px] content-start gap-3 bg-slate-900 p-4">
            {processing.wimLiveItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-sm font-bold uppercase tracking-[0.08em] text-slate-400">{item.label}</span>
                <span className="text-lg font-black text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </LiveFrame>
      </div>
    </V3DefaultPage>
  );
}
