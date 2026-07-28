"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { logout } from "@/src/modules/login/slice";
import { removeAuthCookie } from "@/src/utils/auth";
import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Avatar,
  Tooltip,
} from "@fluentui/react-components";
import {
  SignOut24Regular,
  Navigation20Regular,
  Search20Regular,
  Calendar20Regular,
  ChevronDown16Regular,
  Circle12Filled,
  Play16Filled,
} from "@fluentui/react-icons";
import { useSystemMode } from "@/src/hooks/useSystemMode";

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

interface V2NavbarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const V2Navbar: React.FC<V2NavbarProps> = ({ isCollapsed, onToggle }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.login);
  const MINIO_URL = process.env.NEXT_PUBLIC_MINIO_URL || "";
  const { mode } = useSystemMode();
  const now = useNow();

  const getProfilePictureUrl = (pp: string | null | undefined) =>
    pp ? `${MINIO_URL}/${pp}` : "/polantas.png";

  const handleLogout = () => {
    dispatch(logout());
    removeAuthCookie();
    router.push("/login");
  };

  const dateStr = now.toLocaleDateString("id-ID", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";

  return (
    <nav className="h-10 bg-white border-b border-slate-200 flex items-center gap-2 px-4 shrink-0 shadow-sm">

      {/* Hamburger */}
      <button
        onClick={onToggle}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
      >
        <Navigation20Regular />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search20Regular className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Cari kendaraan, plat, atau sensor..."
            className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs
              text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2
              focus:ring-blue-400/30 focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Mode badge */}
      <Tooltip
        content={mode === "DEMO" ? "Mode Demo — data simulasi" : "Mode Live — data nyata dari alat"}
        relationship="label"
      >
        <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full cursor-default select-none border ${
          mode === "DEMO"
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-emerald-50 text-emerald-700 border-emerald-200"
        }`}>
          {mode === "DEMO"
            ? <Circle12Filled className="w-2 h-2 text-amber-500" />
            : <Play16Filled className="w-2 h-2 text-emerald-500" />
          }
          {mode}
        </span>
      </Tooltip>

      {/* Date + time */}
      <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-100 bg-slate-50">
        <Calendar20Regular className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-[11px] text-slate-700 font-medium whitespace-nowrap">{dateStr}</span>
        <span className="text-[11px] text-slate-400 whitespace-nowrap">{timeStr}</span>
      </div>

      {/* Profile */}
      <Menu>
        <MenuTrigger>
          <button className="flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
            <Avatar
              image={user?.profile_picture ? { src: getProfilePictureUrl(user.profile_picture) } : undefined}
              name={user?.full_name || "Pengguna"}
              color="colorful"
              size={20}
            />
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-[12px] font-semibold text-slate-700 max-w-[100px] truncate">
                {user?.full_name || "Pengguna"}
              </span>
              <span className="text-[10px] text-slate-400">
                {user?.master_role?.role_name || "—"}
              </span>
            </div>
            <ChevronDown16Regular className="text-slate-400" />
          </button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <div className="px-3 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Avatar
                  image={user?.profile_picture ? { src: getProfilePictureUrl(user.profile_picture) } : undefined}
                  name={user?.full_name || "Pengguna"}
                  color="colorful"
                  size={40}
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-gray-900">{user?.full_name || "Pengguna"}</span>
                  <span className="text-xs text-gray-500">{user?.master_role?.role_name || "—"}</span>
                  <span className="text-[10px] text-gray-400">{user?.email || ""}</span>
                </div>
              </div>
            </div>
            <MenuItem icon={<SignOut24Regular />} onClick={handleLogout}>Keluar</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </nav>
  );
};

export default V2Navbar;
