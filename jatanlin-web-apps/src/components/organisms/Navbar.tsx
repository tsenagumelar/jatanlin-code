"use client";

import React from "react";
import Image from "next/image";
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
  Person24Regular,
  SignOut24Regular,
  Settings24Regular,
  Alert24Regular,
  QuestionCircle24Regular,
  Navigation20Regular,
} from "@fluentui/react-icons";
import { useSidebar } from "@/src/contexts/SidebarContext";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.login);
  const { isCollapsed, toggleSidebar } = useSidebar();

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

  return (
    <nav className="h-12 bg-blue-800 flex items-center justify-between shadow-md">
      {/* Left Section - Logo & Title & Menu Toggle */}
      <div className="flex items-center">
        <div
          className={`flex items-center gap-2 px-3 bg-white transition-all duration-300 h-12 ${
            isCollapsed ? "w-12" : "w-56"
          }`}
        >
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <Image
              src="/polantas.png"
              alt="Logo Polantas"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          {!isCollapsed && (
            <span className="text-black font-extrabold text-lg whitespace-nowrap">
              JATANLIN
            </span>
          )}
        </div>

        {/* Sidebar Toggle Button */}
        <div className="px-4 border-l border-[#005A9E]">
          <Tooltip content="Buka/Tutup Menu" relationship="label">
            <button
              onClick={toggleSidebar}
              className="w-8 h-8 flex items-center justify-center text-white hover:bg-[#005A9E] rounded-sm transition-colors"
            >
              <Navigation20Regular />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Right Section - Actions & Profile */}
      <div className="flex items-center gap-2">
        {/* Profile Menu */}
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
            </button>
          </MenuTrigger>

          <MenuPopover>
            <MenuList>
              {/* User Profile Info */}
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

              {/* Logout Menu Item */}
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
