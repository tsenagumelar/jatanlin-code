"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home24Regular, Home24Filled,
  DataTrending24Regular, DataTrending24Filled,
  CardUi24Regular, CardUi24Filled,
  Database24Regular, Database24Filled,
  People24Regular, People24Filled,
  VehicleCar24Regular, VehicleCar24Filled,
  Settings24Regular, Settings24Filled,
  BookQuestionMark24Regular, BookQuestionMark24Filled,
  ArrowSync24Regular, ArrowSync24Filled,
  ShieldSettings24Regular, ShieldSettings24Filled,
  Video24Regular, Video24Filled,
  Tv24Regular, Tv24Filled,
  Camera24Regular,
  Scales24Regular,
  Wifi4Regular,
  VideoClip24Regular,
  Circle12Filled,
  // VEAM icons
  ShieldKeyhole24Regular, ShieldKeyhole24Filled,
  PlugConnected24Regular, PlugConnected24Filled,
  NetworkCheck24Regular, NetworkCheck24Filled,
  History24Regular, History24Filled,
} from "@fluentui/react-icons";
import { Tooltip } from "@fluentui/react-components";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactElement;
  activeIcon: React.ReactElement;
  badge?: string;
  badgeColor?: "green" | "red";
}

interface MenuSection {
  section: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    section: "Monitoring",
    items: [
      {
        label: "Processing",
        href: "/v2/processing",
        icon: <ArrowSync24Regular />,
        activeIcon: <ArrowSync24Filled />,
        badge: "Live",
        badgeColor: "green",
      },
      {
        label: "Capture Monitor",
        href: "/v2/capture-monitor",
        icon: <DataTrending24Regular />,
        activeIcon: <DataTrending24Filled />,
        badge: "Live",
        badgeColor: "green",
      },
      {
        label: "Live View",
        href: "/v2/live-view",
        icon: <Video24Regular />,
        activeIcon: <Video24Filled />,
      },
      {
        label: "LED Display",
        href: "/v2/led",
        icon: <Tv24Regular />,
        activeIcon: <Tv24Filled />,
        badge: "Live",
        badgeColor: "green",
      },
    ],
  },
  {
    section: "Data",
    items: [
      { label: "Data Jatanlin", href: "/v2/jatanlin",    icon: <CardUi24Regular />,   activeIcon: <CardUi24Filled /> },
      { label: "Data Center",   href: "/v2/data-center", icon: <Database24Regular />, activeIcon: <Database24Filled /> },
    ],
  },
  {
    section: "Master Data",
    items: [
      { label: "Pengguna",        href: "/v2/master-data/pengguna",        icon: <People24Regular />,     activeIcon: <People24Filled /> },
      { label: "Kelas Kendaraan", href: "/v2/master-data/kelas-kendaraan", icon: <VehicleCar24Regular />, activeIcon: <VehicleCar24Filled /> },
    ],
  },
  {
    section: "VEAM",
    items: [
      { label: "License",            href: "/v2/veam/license",             icon: <ShieldKeyhole24Regular />,   activeIcon: <ShieldKeyhole24Filled /> },
      { label: "Device Registration", href: "/v2/veam/device-registration", icon: <PlugConnected24Regular />,   activeIcon: <PlugConnected24Filled /> },
      { label: "Connection Status",  href: "/v2/veam/connection-status",   icon: <NetworkCheck24Regular />,    activeIcon: <NetworkCheck24Filled /> },
      { label: "Activation Log",     href: "/v2/veam/activation-log",      icon: <History24Regular />,         activeIcon: <History24Filled /> },
    ],
  },
  {
    section: "Sistem",
    items: [
      { label: "Admin Setting", href: "/v2/admin-setting", icon: <ShieldSettings24Regular />,  activeIcon: <ShieldSettings24Filled /> },
      { label: "Konfigurasi",   href: "/v2/konfigurasi",   icon: <Settings24Regular />,        activeIcon: <Settings24Filled /> },
      { label: "Panduan",       href: "/v2/panduan",       icon: <BookQuestionMark24Regular />, activeIcon: <BookQuestionMark24Filled /> },
    ],
  },
];

const SENSOR_ITEMS = [
  { key: "ANPR", icon: <Camera24Regular />,    label: "ANPR Camera" },
  { key: "WIM",  icon: <Scales24Regular />,    label: "WIM / Timbangan" },
  { key: "AXLE", icon: <Wifi4Regular />,       label: "AXLE Sensor" },
  { key: "CCTV", icon: <VideoClip24Regular />, label: "CCTV" },
];

interface V2SidebarProps {
  isCollapsed: boolean;
}

export const V2Sidebar: React.FC<V2SidebarProps> = ({ isCollapsed }) => {
  const pathname = usePathname();

  const renderItem = (item: MenuItem) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
    const badgeCls = item.badgeColor === "green"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

    const content = (
      <Link
        key={item.href}
        href={item.href}
        className={`
          flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium
          transition-all duration-150 group
          ${isActive
            ? "bg-blue-600 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
          }
          ${isCollapsed ? "justify-center px-0 mx-1.5" : ""}
        `}
      >
        <div className={`w-5 h-5 flex items-center justify-center shrink-0
          ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`}>
          {isActive ? item.activeIcon : item.icon}
        </div>
        {!isCollapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none ${badgeCls}`}>
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.href} content={item.label} relationship="label" positioning="after">
          {content}
        </Tooltip>
      );
    }
    return content;
  };

  return (
    <aside
      className={`
        bg-white border-r border-slate-200 h-full flex flex-col
        transition-all duration-300 shrink-0 overflow-hidden
        ${isCollapsed ? "w-14" : "w-60"}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 shrink-0 ${isCollapsed ? "justify-center px-2" : ""}`}>
        <div className="w-9 h-9 shrink-0 flex items-center justify-center">
          <Image src="/polantas.png" alt="Logo Korlantas" width={36} height={36} className="object-contain" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-blue-700 text-base tracking-wide">JATANLIN</span>
              <span className="text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded leading-none">v2.0</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 font-medium tracking-wide">KORLANTAS POLRI</span>
          </div>
        )}
      </div>

      <div className="mx-3 border-t border-slate-100 shrink-0" />

      {/* Dashboard shortcut (BERANDA) */}
      <div className="px-2 pt-3 pb-1 shrink-0">
        {!isCollapsed && (
          <div className="px-3 pb-1 text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">
            Beranda
          </div>
        )}
        {(() => {
          const isActive = pathname === "/v2/dashboard" || pathname.startsWith("/v2/dashboard/");
          const content = (
            <Link
              href="/v2/dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"}
                ${isCollapsed ? "justify-center px-0" : ""}
              `}
            >
              <div className={`w-5 h-5 flex items-center justify-center shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}>
                {isActive ? <Home24Filled /> : <Home24Regular />}
              </div>
              {!isCollapsed && <span>Dashboard</span>}
            </Link>
          );
          if (isCollapsed) {
            return (
              <Tooltip content="Dashboard" relationship="label" positioning="after">
                {content}
              </Tooltip>
            );
          }
          return content;
        })()}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-1
        [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200">
        {menuSections.map((section) => (
          <div key={section.section} className="mb-1">
            {!isCollapsed && (
              <div className="px-5 pt-3 pb-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                {section.section}
              </div>
            )}
            {isCollapsed && <div className="my-2 mx-3 border-t border-slate-100" />}
            <div className="space-y-0.5">
              {section.items.map((item) => renderItem(item))}
            </div>
          </div>
        ))}
      </nav>

      {/* Unit Aktif + Paket Sensor footer */}
      {!isCollapsed && (
        <div className="mx-3 mb-3 shrink-0 border-t border-slate-100 pt-3">
          {/* Unit Aktif */}
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">Unit Aktif</p>
          <div className="flex items-center gap-2 mb-3">
            <Circle12Filled className="w-2.5 h-2.5 text-green-500 animate-pulse shrink-0" />
            <span className="text-xs font-semibold text-slate-700">JTL001 - Jakarta</span>
          </div>

          {/* Paket Sensor */}
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">Paket Sensor</p>
          <div className="grid grid-cols-4 gap-1 mb-3">
            {SENSOR_ITEMS.map(({ key, icon, label }) => (
              <Tooltip key={key} content={label} relationship="label">
                <div className="flex flex-col items-center gap-1 py-2 rounded-lg bg-slate-50 border border-slate-100
                  hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-default">
                  <div className="w-4 h-4 flex items-center justify-center text-slate-500">
                    {icon}
                  </div>
                  <span className="text-[8px] font-bold text-slate-500">{key}</span>
                </div>
              </Tooltip>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-[9px] text-slate-400 leading-relaxed">
            JATANLIN &copy; 2026<br />Korlantas Polri
          </p>
        </div>
      )}

      {/* Collapsed: green dot for unit status */}
      {isCollapsed && (
        <div className="flex justify-center pb-4 shrink-0">
          <Tooltip content="JTL001 - Jakarta (Aktif)" relationship="label" positioning="after">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          </Tooltip>
        </div>
      )}
    </aside>
  );
};

export default V2Sidebar;
