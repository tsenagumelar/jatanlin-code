"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/src/redux/hooks";
import { logout } from "@/src/modules/login/slice";
import { removeAuthCookie } from "@/src/utils/auth";
import type { V3AppShellState } from "./types";

function formatDateTime(value: Date) {
  const date = value.toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const time = value.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return `${date}, ${time} WIB`;
}

export function useV3AppShell(): V3AppShellState {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [dateTimeLabel, setDateTimeLabel] = useState(() =>
    formatDateTime(new Date()),
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDateTimeLabel(formatDateTime(new Date()));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const toggleSidebar = () => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setIsMobileSidebarOpen((current) => !current);
      return;
    }

    setIsCollapsed((current) => !current);
  };

  const handleLogout = () => {
    dispatch(logout());
    removeAuthCookie();
    setIsUserMenuOpen(false);
    setIsMobileSidebarOpen(false);
    router.replace("/login");
  };

  return {
    isCollapsed,
    isMobileSidebarOpen,
    isUserMenuOpen,
    isProfileOpen,
    dateTimeLabel,
    toggleSidebar,
    closeMobileSidebar: () => setIsMobileSidebarOpen(false),
    toggleUserMenu: () => setIsUserMenuOpen((current) => !current),
    openProfile: () => {
      setIsUserMenuOpen(false);
      setIsProfileOpen(true);
    },
    closeProfile: () => setIsProfileOpen(false),
    handleLogout,
  };
}
