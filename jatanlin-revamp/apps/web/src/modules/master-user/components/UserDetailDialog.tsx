"use client";

import React from "react";
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Badge,
  Avatar,
} from "@fluentui/react-components";
import {
  CheckmarkCircle24Filled,
  DismissCircle24Filled,
  Dismiss24Regular,
} from "@fluentui/react-icons";
import type { UserData } from "../types";

const MINIO_URL = process.env.NEXT_PUBLIC_MINIO_URL || "";

interface UserDetailDialogProps {
  open: boolean;
  onClose: () => void;
  user: UserData | null;
}

export const UserDetailDialog: React.FC<UserDetailDialogProps> = ({
  open,
  onClose,
  user,
}) => {
  if (!user) return null;

  const getProfilePictureUrl = (profilePicture: string | null | undefined) => {
    if (!profilePicture) {
      return "/polantas.png";
    }
    return `${MINIO_URL}/${profilePicture}`;
  };

  return (
    <Dialog open={open} onOpenChange={(e, data) => !data.open && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                aria-label="tutup"
                icon={<Dismiss24Regular />}
                onClick={onClose}
              />
            }
          >
            Detail Pengguna
          </DialogTitle>
          <DialogContent>
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <Avatar
                  name={user.full_name}
                  image={{ src: getProfilePictureUrl(user.profile_picture) }}
                  size={72}
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {user.full_name}
                  </h3>
                  <p className="text-sm text-gray-600">@{user.username}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Kode
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{user.code}</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    No. Lencana
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.badge_no || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.email || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    No. Telepon
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.phone_number || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Peran
                  </label>
                  <div className="mt-1">
                    <Badge appearance="tint" color="informative" size="large">
                      {user.master_role.role_name}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </label>
                  <div className="mt-1">
                    {user.is_active ? (
                      <Badge
                        appearance="tint"
                        color="success"
                        icon={<CheckmarkCircle24Filled />}
                        size="large"
                      >
                        Aktif
                      </Badge>
                    ) : (
                      <Badge
                        appearance="tint"
                        color="danger"
                        icon={<DismissCircle24Filled />}
                        size="large"
                      >
                        Tidak Aktif
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              {(user.created_date || user.updated_date) && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                    {user.created_date && (
                      <div>
                        <span className="font-semibold">Dibuat: </span>
                        {new Date(user.created_date).toLocaleString("id-ID")}
                      </div>
                    )}
                    {user.updated_date && (
                      <div>
                        <span className="font-semibold">Diperbarui: </span>
                        {new Date(user.updated_date).toLocaleString("id-ID")}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={onClose}>
              Tutup
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
