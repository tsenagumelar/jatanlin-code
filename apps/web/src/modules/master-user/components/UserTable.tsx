"use client";

import React from "react";
import moment from "moment";
import { Avatar, Tooltip } from "@fluentui/react-components";
import {
  Edit24Regular,
  Delete24Regular,
  Eye24Regular,
  CheckmarkCircle24Filled,
  DismissCircle24Filled,
} from "@fluentui/react-icons";
import { DataTable, Column } from "@/src/components/organisms/DataTable";
import type { UserData } from "../types";

const MINIO_URL = process.env.NEXT_PUBLIC_MINIO_URL || "";

interface UserTableProps {
  users: UserData[];
  loading: boolean;
  onView: (user: UserData) => void;
  onEdit: (user: UserData) => void;
  onDelete: (userId: string) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  onView,
  onEdit,
  onDelete,
}) => {
  const getProfilePictureUrl = (profilePicture: string | null | undefined) => {
    if (!profilePicture) {
      return "/polantas.png";
    }
    return `${MINIO_URL}/${profilePicture}`;
  };

  const columns: Column<UserData>[] = [
    {
      key: "profile_picture",
      header: "",
      width: "60px",
      render: (user) => (
        <Avatar
          image={{ src: getProfilePictureUrl(user.profile_picture) }}
          name={user.full_name}
          size={56}
        />
      ),
    },
    {
      key: "username",
      header: "Nama Pengguna",
      width: "150px",
      render: (user) => <span>{user.username}</span>,
    },
    {
      key: "full_name",
      header: "Nama Lengkap",
      width: "200px",
      render: (user) => <span>{user.full_name}</span>,
    },
    {
      key: "badge_no",
      header: "No. Lencana",
      width: "120px",
      render: (user) => <span>{user.badge_no || "-"}</span>,
    },
    {
      key: "email",
      header: "Email",
      width: "200px",
      render: (user) => <span>{user.email || "-"}</span>,
    },
    {
      key: "phone_number",
      header: "No. Telepon",
      width: "150px",
      render: (user) => <span>{user.phone_number || "-"}</span>,
    },
    {
      key: "role",
      header: "Peran",
      width: "180px",
      render: (user) => (
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
          {user.master_role.role_name}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      width: "130px",
      render: (user) =>
        user.is_active ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 whitespace-nowrap">
            <CheckmarkCircle24Filled className="w-3.5 h-3.5" />
            Aktif
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
            <DismissCircle24Filled className="w-3.5 h-3.5" />
            Tidak Aktif
          </span>
        ),
    },
    {
      key: "updated_date",
      header: "Diperbarui",
      width: "160px",
      render: (user) => (
        <span>
          {user.updated_date
            ? moment(user.updated_date).format("DD-MM-YYYY HH:mm")
            : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      width: "160px",
      render: (user) => (
        <div className="flex gap-2">
          <Tooltip content="Lihat Detail" relationship="label">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onView(user);
              }}
              className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors"
            >
              <Eye24Regular className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip content="Ubah" relationship="label">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(user);
              }}
              className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors"
            >
              <Edit24Regular className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip content="Hapus" relationship="label">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(user.id as string);
              }}
              className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Delete24Regular className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <DataTable<UserData>
      columns={columns}
      data={users}
      loading={loading}
      emptyMessage="Tidak ada data pengguna"
      stickyHeader={true}
      maxHeight="none"
      keyExtractor={(user) => user.id as string}
    />
  );
};
