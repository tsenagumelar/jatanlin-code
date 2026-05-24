"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home24Regular,
  Home24Filled,
  CardUi24Regular,
  CardUi24Filled,
  People24Regular,
  People24Filled,
  VehicleCar24Regular,
  VehicleCar24Filled,
  Settings24Regular,
  Settings24Filled,
  ShieldKeyhole24Regular,
  ShieldKeyhole24Filled,
  BookQuestionMark24Regular,
  BookQuestionMark24Filled,
} from "@fluentui/react-icons";
import { Tooltip } from "@fluentui/react-components";
import { useSidebar } from "@/src/contexts/SidebarContext";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactElement;
  activeIcon: React.ReactElement;
  section?: string;
}

const menuItems: MenuItem[] = [
  {
    label: "Beranda",
    href: "/beranda",
    icon: <Home24Regular />,
    activeIcon: <Home24Filled />,
    section: "Beranda",
  },
  {
    label: "Jatanlin",
    href: "/jatanlin",
    icon: <CardUi24Regular />,
    activeIcon: <CardUi24Filled />,
    section: "Transaksi",
  },
  {
    label: "Data Center",
    href: "/data-center",
    icon: <CardUi24Regular />,
    activeIcon: <CardUi24Filled />,
    section: "Transaksi",
  },
  {
    label: "Pengguna",
    href: "/master-data/pengguna",
    icon: <People24Regular />,
    activeIcon: <People24Filled />,
    section: "Master Data",
  },
  {
    label: "Kelas Kendaraan",
    href: "/master-data/kelas-kendaraan",
    icon: <VehicleCar24Regular />,
    activeIcon: <VehicleCar24Filled />,
    section: "Master Data",
  },
  {
    label: "License",
    href: "/license",
    icon: <ShieldKeyhole24Regular />,
    activeIcon: <ShieldKeyhole24Filled />,
    section: "Konfigurasi",
  },
  {
    label: "Konfigurasi",
    href: "/konfigurasi",
    icon: <Settings24Regular />,
    activeIcon: <Settings24Filled />,
    section: "Konfigurasi",
  },
  {
    label: "Panduan",
    href: "/panduan",
    icon: <BookQuestionMark24Regular />,
    activeIcon: <BookQuestionMark24Filled />,
    section: "Konfigurasi",
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();

  const groupedItems = menuItems.reduce(
    (acc, item) => {
      const section = item.section || "Lainnya";
      if (!acc[section]) acc[section] = [];
      acc[section].push(item);
      return acc;
    },
    {} as Record<string, MenuItem[]>,
  );

  const renderMenuItem = (item: MenuItem) => {
    const isActive =
      pathname === item.href || pathname.startsWith(item.href + "/");

    const content = (
      <Link
        key={item.href}
        href={item.href}
        className={`
          flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium
          transition-all duration-150 group
          ${isActive ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"}
          ${isCollapsed ? "justify-center px-0 mx-1.5" : ""}
        `}
      >
        <div
          className={`w-5 h-5 flex items-center justify-center shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`}
        >
          {isActive ? item.activeIcon : item.icon}
        </div>
        {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip
          key={item.href}
          content={item.label}
          relationship="label"
          positioning="after"
        >
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
      <div
        className={`flex items-center gap-3 px-4 py-5 shrink-0 ${isCollapsed ? "justify-center px-2" : ""}`}
      >
        <div className="w-9 h-9 shrink-0 flex items-center justify-center">
          <Image
            src="/polantas.png"
            alt="Logo Korlantas"
            width={36}
            height={36}
            className="object-contain"
          />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-blue-700 text-base tracking-wide">
                JATANLIN
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 font-medium tracking-wide">
              KORLANTAS POLRI
            </span>
          </div>
        )}
      </div>

      <div className="mx-3 border-t border-slate-100 shrink-0" />

      <nav className="flex-1 overflow-y-auto py-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200">
        {Object.entries(groupedItems).map(([section, items]) => (
          <div key={section} className="mb-1">
            {!isCollapsed && (
              <div className="px-5 pt-3 pb-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                {section}
              </div>
            )}
            {isCollapsed && (
              <div className="my-2 mx-3 border-t border-slate-100" />
            )}
            <div className="space-y-0.5">
              {items.map((item) => renderMenuItem(item))}
            </div>
          </div>
        ))}
      </nav>
      {/* Footer - All services button */}
      {!isCollapsed && (
        <div className="border-t border-[#E1DFDD] p-2 text-center">
          JATANLIN © {new Date().getFullYear()}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
