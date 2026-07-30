import type { ReactElement, ReactNode } from "react";

export interface V3LayoutProps {
  children: ReactNode;
}

export interface V3MenuItem {
  label: string;
  href: string;
  icon: ReactElement;
  activeIcon: ReactElement;
}

export interface V3MenuSection {
  label: string;
  items: V3MenuItem[];
}

export interface V3AppShellState {
  isCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  isUserMenuOpen: boolean;
  isProfileOpen: boolean;
  dateTimeLabel: string;
  toggleSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleUserMenu: () => void;
  openProfile: () => void;
  closeProfile: () => void;
  handleLogout: () => void;
}
