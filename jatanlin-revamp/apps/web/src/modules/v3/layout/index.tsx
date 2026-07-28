"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookQuestionMark24Filled,
  BookQuestionMark24Regular,
  Calendar20Regular,
  CardUi24Filled,
  CardUi24Regular,
  ChevronDown16Regular,
  Dismiss24Regular,
  Home24Filled,
  Home24Regular,
  Navigation20Regular,
  People24Filled,
  People24Regular,
  Person24Regular,
  ShieldKeyhole24Filled,
  ShieldKeyhole24Regular,
  SignOut24Regular,
  Tv24Filled,
  Tv24Regular,
  VehicleCar24Filled,
  VehicleCar24Regular,
  Video24Filled,
  Video24Regular,
  ArrowSync24Filled,
  ArrowSync24Regular,
  PlugConnected24Filled,
  PlugConnected24Regular,
} from "@fluentui/react-icons";
import { useAppSelector } from "@/src/redux/hooks";
import { useV3AppShell } from "./hooks";
import type { V3LayoutProps, V3MenuItem, V3MenuSection } from "./types";

const menuSections: V3MenuSection[] = [
  {
    label: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: <Home24Regular />,
        activeIcon: <Home24Filled />,
      },
    ],
  },
  {
    label: "Monitoring",
    items: [
      {
        label: "Processing",
        href: "/monitoring/processing",
        icon: <ArrowSync24Regular />,
        activeIcon: <ArrowSync24Filled />,
      },
      {
        label: "Live View",
        href: "/monitoring/live-view",
        icon: <Video24Regular />,
        activeIcon: <Video24Filled />,
      },
      {
        label: "LED Display",
        href: "/monitoring/led-display",
        icon: <Tv24Regular />,
        activeIcon: <Tv24Filled />,
      },
    ],
  },
  {
    label: "Transaction",
    items: [
      {
        label: "Jatanlin",
        href: "/transaction/jatanlin",
        icon: <CardUi24Regular />,
        activeIcon: <CardUi24Filled />,
      },
    ],
  },
  {
    label: "Master Data",
    items: [
      {
        label: "User",
        href: "/master-data/user",
        icon: <People24Regular />,
        activeIcon: <People24Filled />,
      },
      {
        label: "Vehicle Classes",
        href: "/master-data/vehicle-classes",
        icon: <VehicleCar24Regular />,
        activeIcon: <VehicleCar24Filled />,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Configuration & Device",
        href: "/system/configuration-device-registration",
        icon: <PlugConnected24Regular />,
        activeIcon: <PlugConnected24Filled />,
      },
      {
        label: "License",
        href: "/system/license",
        icon: <ShieldKeyhole24Regular />,
        activeIcon: <ShieldKeyhole24Filled />,
      },
      {
        label: "Guideline",
        href: "/system/guideline",
        icon: <BookQuestionMark24Regular />,
        activeIcon: <BookQuestionMark24Filled />,
      },
    ],
  },
];

function getProfilePictureUrl(profilePicture?: string | null) {
  const minioUrl = process.env.NEXT_PUBLIC_MINIO_URL || "";

  if (!profilePicture) return "/polantas.png";
  if (
    profilePicture.startsWith("http://") ||
    profilePicture.startsWith("https://")
  ) {
    return profilePicture;
  }

  const cleanPath = profilePicture.startsWith("/")
    ? profilePicture.slice(1)
    : profilePicture;

  return minioUrl ? `${minioUrl}/${cleanPath}` : `/${cleanPath}`;
}

function isAdminRole(code?: string | null, name?: string | null) {
  return [code, name].some((role) => role?.toLowerCase().includes("admin"));
}

function SidebarItem({
  item,
  isCollapsed,
  onNavigate,
}: {
  item: V3MenuItem;
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      title={isCollapsed ? item.label : undefined}
      onClick={onNavigate}
      className={`group mx-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
        isActive
          ? "bg-blue-700 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
      } ${isCollapsed ? "justify-center px-0" : ""}`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center ${
          isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"
        }`}
      >
        {isActive ? item.activeIcon : item.icon}
      </span>
      {!isCollapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

export function V3AppShell({ children }: V3LayoutProps) {
  const shell = useV3AppShell();
  const { user, licenseChecked } = useAppSelector((state) => state.login);
  const profilePictureUrl = getProfilePictureUrl(user?.profile_picture);
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Jatanlin Site";
  const siteCode = process.env.NEXT_PUBLIC_SITE_CODE || "-";
  const siteLocation = process.env.NEXT_PUBLIC_SITE_LOCATION || "-";
  const isAdmin = isAdminRole(
    user?.master_role?.code,
    user?.master_role?.role_name,
  );
  const isLicenseOnlyMode =
    Boolean(licenseChecked) &&
    !licenseChecked?.valid &&
    isAdmin;
  const visibleMenuSections = isLicenseOnlyMode
    ? menuSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => item.href === "/system/license"),
        }))
        .filter((section) => section.items.length > 0)
    : menuSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => {
            if (isAdmin) return true;
            return ![
              "/master-data/user",
              "/master-data/vehicle-classes",
              "/system/configuration-device-registration",
              "/system/license",
            ].includes(item.href);
          }),
        }))
        .filter((section) => section.items.length > 0);

  return (
    <div className="v3-ui flex h-screen overflow-hidden bg-slate-50 text-slate-950">
      <aside
        className={`hidden h-full shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white transition-all duration-300 lg:flex ${
          shell.isCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div
          className={`flex h-16 shrink-0 items-center gap-3 px-4 ${
            shell.isCollapsed ? "justify-center px-2" : ""
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
            <Image
              src="/polantas.png"
              alt="Korlantas Polri Logo"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          {!shell.isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold tracking-wide text-blue-700">
                JATANLIN
              </p>
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Korlantas Polri
              </p>
            </div>
          )}
        </div>

        <div className="mx-3 border-t border-slate-100" />

        <nav className="flex-1 overflow-y-auto py-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200">
          {visibleMenuSections.map((section) => (
            <div key={section.label} className="mb-2">
              {!shell.isCollapsed && (
                <div className="px-5 pb-1.5 pt-3 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  {section.label}
                </div>
              )}
              {shell.isCollapsed && section.label !== "Main" && (
                <div className="mx-4 my-2 border-t border-slate-100" />
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <SidebarItem
                    key={item.href}
                    item={item}
                    isCollapsed={shell.isCollapsed}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-slate-100 p-3">
          {!shell.isCollapsed ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Site
              </p>
              <p className="mt-1 truncate text-sm font-bold text-slate-800">
                {siteName}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {siteCode} · {siteLocation}
              </p>
              <p className="mt-3 text-[10px] font-semibold text-slate-400">
                © 2026 Jatanlin
              </p>
            </div>
          ) : (
            <div
              title={`${siteName} · © 2026 Jatanlin`}
              className="mx-auto h-2 w-2 rounded-full bg-blue-700"
            />
          )}
        </div>
      </aside>

      {shell.isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-slate-950/45"
            onClick={shell.closeMobileSidebar}
          />
          <aside className="relative flex h-full w-[min(19rem,86vw)] flex-col overflow-hidden border-r border-slate-200 bg-white shadow-2xl">
            <div className="flex h-16 shrink-0 items-center justify-between gap-3 px-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                  <Image
                    src="/polantas.png"
                    alt="Korlantas Polri Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-extrabold tracking-wide text-blue-700">
                    JATANLIN
                  </p>
                  <p className="truncate text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Korlantas Polri
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={shell.closeMobileSidebar}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Close sidebar"
              >
                <Dismiss24Regular />
              </button>
            </div>

            <div className="mx-3 border-t border-slate-100" />

            <nav className="flex-1 overflow-y-auto py-3">
              {visibleMenuSections.map((section) => (
                <div key={section.label} className="mb-2">
                  <div className="px-5 pb-1.5 pt-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    {section.label}
                  </div>
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <SidebarItem
                        key={item.href}
                        item={item}
                        isCollapsed={false}
                        onNavigate={shell.closeMobileSidebar}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="shrink-0 border-t border-slate-100 p-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Site
                </p>
                <p className="mt-1 truncate text-sm font-bold text-slate-800">
                  {siteName}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {siteCode} · {siteLocation}
                </p>
                <p className="mt-3 text-xs font-semibold text-slate-400">
                  © 2026 Jatanlin
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <nav className="flex h-12 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 shadow-sm">
          <button
            type="button"
            onClick={shell.toggleSidebar}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Toggle sidebar"
          >
            <Navigation20Regular />
          </button>

          <div className="hidden items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 md:flex">
            <Calendar20Regular className="h-4 w-4 text-slate-400" />
            <span className="whitespace-nowrap">{shell.dateTimeLabel}</span>
          </div>

          <div className="flex-1" />

          <div className="relative">
            <button
              type="button"
              onClick={shell.toggleUserMenu}
              className="flex items-center gap-2 rounded-lg border border-transparent py-1 pl-1.5 pr-1 transition hover:border-slate-200 hover:bg-slate-50"
            >
              <Image
                src={profilePictureUrl}
                alt={user?.full_name || "User"}
                width={28}
                height={28}
                unoptimized
                className="h-7 w-7 rounded-full object-cover"
              />
              <div className="hidden min-w-0 text-left sm:block">
                <p className="max-w-32 truncate text-xs font-bold text-slate-800">
                  {user?.full_name || "User"}
                </p>
                <p className="max-w-32 truncate text-[10px] font-semibold text-slate-400">
                  {user?.master_role?.role_name || "-"}
                </p>
              </div>
              <ChevronDown16Regular className="text-slate-400" />
            </button>

            {shell.isUserMenuOpen && (
              <div className="absolute right-0 top-11 z-30 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                <button
                  type="button"
                  onClick={shell.openProfile}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Person24Regular className="h-5 w-5 text-slate-400" />
                  Profile
                </button>
                <button
                  type="button"
                  onClick={shell.handleLogout}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <SignOut24Regular className="h-5 w-5" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-4 sm:p-5 lg:p-6">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>

      {shell.isProfileOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                  Profile
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-950">
                  User Detail
                </h2>
              </div>
              <button
                type="button"
                onClick={shell.closeProfile}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Close profile"
              >
                <Dismiss24Regular />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4">
                <Image
                  src={profilePictureUrl}
                  alt={user?.full_name || "User"}
                  width={64}
                  height={64}
                  unoptimized
                  className="h-16 w-16 rounded-full border border-slate-200 object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-slate-950">
                    {user?.full_name || "User"}
                  </p>
                  <p className="truncate text-sm font-semibold text-slate-500">
                    {user?.master_role?.role_name || "-"}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {user?.email || "-"}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-sm">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Username
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {user?.username || "-"}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Badge No
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {user?.badge_no || "-"}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Role Code
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {user?.master_role?.code || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
