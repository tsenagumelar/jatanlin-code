"use client";

import React from "react";
import Link from "next/link";
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
  BookQuestionMark24Regular,
  BookQuestionMark24Filled,
  Navigation24Regular,
} from "@fluentui/react-icons";
import { Tooltip, Button } from "@fluentui/react-components";
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

  const groupedItems = menuItems.reduce((acc, item) => {
    const section = item.section || "Lainnya";
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const renderMenuItem = (item: MenuItem) => {
    const isActive = pathname === item.href;
    const content = (
      <Link
        key={item.href}
        href={item.href}
        className={`
          flex items-center gap-3 px-3 py-2 text-sm transition-all relative
          ${
            isActive
              ? "bg-[#E7F3FF] text-[#0078D4] border-l-2 border-[#0078D4]"
              : "text-[#323130] hover:bg-[#F3F2F1]"
          }
          ${isCollapsed ? "justify-center" : ""}
        `}
      >
        <div className="w-6 h-6 flex items-center justify-center shrink-0">
          {isActive ? item.activeIcon : item.icon}
        </div>
        {!isCollapsed && <span className="flex-1">{item.label}</span>}
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
      className={`bg-[#FAFAFA] border-r border-[#E1DFDD] h-full overflow-y-auto transition-all duration-300 flex flex-col ${
        isCollapsed ? "w-12" : "w-56"
      }`}
    >
      {/* Menu Items */}
      <nav className="flex-1 py-2">
        {Object.entries(groupedItems).map(([section, items]) => (
          <div key={section} className="mb-4">
            {!isCollapsed && (
              <div className="px-3 py-2 text-xs font-semibold text-[#605E5C] uppercase tracking-wide">
                {section}
              </div>
            )}
            <div className="space-y-1">
              {items.map((item) => renderMenuItem(item))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer - All services button */}
      {!isCollapsed && (
        <div className="border-t border-[#E1DFDD] p-2">
          <Button
            appearance="subtle"
            icon={<Navigation24Regular />}
            className="w-full justify-start"
          >
            JATANLIN © {new Date().getFullYear()}
          </Button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
