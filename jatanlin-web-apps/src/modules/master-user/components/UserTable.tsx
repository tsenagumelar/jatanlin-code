"use client";

import React from "react";
import moment from "moment";
import { Button, Badge, Tooltip, Avatar } from "@fluentui/react-components";
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
        <Badge appearance="tint" color="informative" size="large">
          {user.master_role.role_name}
        </Badge>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      width: "130px",
      render: (user) =>
        user.is_active ? (
          <Badge
            appearance="tint"
            color="success"
            icon={<CheckmarkCircle24Filled />}
            size="extra-large"
          >
            Aktif
          </Badge>
        ) : (
          <Badge
            appearance="tint"
            color="danger"
            icon={<DismissCircle24Filled />}
            size="extra-large"
          >
            Tidak Aktif
          </Badge>
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
            <Button
              appearance="subtle"
              icon={<Eye24Regular />}
              onClick={(e) => {
                e.stopPropagation();
                onView(user);
              }}
              size="small"
            />
          </Tooltip>
          <Tooltip content="Ubah" relationship="label">
            <Button
              appearance="subtle"
              icon={<Edit24Regular />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(user);
              }}
              size="small"
            />
          </Tooltip>
          <Tooltip content="Hapus" relationship="label">
            <Button
              appearance="subtle"
              icon={<Delete24Regular />}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(user.id as string);
              }}
              size="small"
            />
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
