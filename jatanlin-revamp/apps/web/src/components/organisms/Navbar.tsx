"use client";

import React from "react";
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
  Calendar20Regular,
} from "@fluentui/react-icons";
import { useSidebar } from "@/src/contexts/SidebarContext";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.login);
  const { toggleSidebar } = useSidebar();

  const MINIO_URL = process.env.NEXT_PUBLIC_MINIO_URL || "";

  const getProfilePictureUrl = (profilePicture: string | null | undefined) => {
    if (!profilePicture) {
      return "/polantas.png";
    }
    return `${MINIO_URL}/${profilePicture}`;
  };

  const handleLogout = () => {
    dispatch(logout());
    removeAuthCookie();
    router.push("/login");
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <nav className="h-12 bg-blue-800 flex items-center justify-between shadow-md px-3">
      <div className="flex items-center">
        <Tooltip content="Buka/Tutup Menu" relationship="label">
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 flex items-center justify-center text-white hover:bg-[#005A9E] rounded-sm transition-colors"
          >
            <Navigation20Regular />
          </button>
        </Tooltip>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-sm bg-[#005A9E]">
          <Calendar20Regular className="w-3.5 h-3.5 text-blue-100 shrink-0" />
          <span className="text-[11px] text-blue-50 font-medium whitespace-nowrap">
            {dateStr}
          </span>
          <span className="text-[11px] text-blue-200 whitespace-nowrap">
            {timeStr} WIB
          </span>
        </div>

        <Menu>
          <MenuTrigger>
            <button className="flex items-center gap-2 hover:bg-[#005A9E] px-2 h-8 rounded-sm transition-colors">
              <Avatar
                image={
                  user?.profile_picture
                    ? { src: getProfilePictureUrl(user.profile_picture) }
                    : undefined
                }
                name={user?.full_name || "Pengguna"}
                color="colorful"
                size={24}
              />
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-[12px] font-semibold text-white max-w-[140px] truncate">
                  {user?.full_name || "Pengguna"}
                </span>
                <span className="text-[10px] text-blue-200">
                  {user?.master_role?.role_name || "-"}
                </span>
              </div>
            </button>
          </MenuTrigger>

          <MenuPopover>
            <MenuList>
              <div className="px-3 py-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Avatar
                    image={
                      user?.profile_picture
                        ? { src: getProfilePictureUrl(user.profile_picture) }
                        : undefined
                    }
                    name={user?.full_name || "Pengguna"}
                    color="colorful"
                    size={48}
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-gray-900">
                      {user?.full_name || "Pengguna"}
                    </span>
                    <span className="text-xs text-gray-600">
                      {user?.master_role?.role_name || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <MenuItem icon={<SignOut24Regular />} onClick={handleLogout}>
                Keluar
              </MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
    </nav>
  );
};

export default Navbar;
