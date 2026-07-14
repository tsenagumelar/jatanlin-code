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
import type { VehicleClassData } from "../types";

interface VehicleClassDetailDialogProps {
  open: boolean;
  onClose: () => void;
  vehicleClass: VehicleClassData | null;
}

const MINIO_URL = process.env.NEXT_PUBLIC_MINIO_URL || "";

const getVehicleImageUrl = (image: string | null) => {
  if (!image) {
    return "/polantas.png";
  }
  return `${MINIO_URL}/${image}`;
};

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const VehicleClassDetailDialog: React.FC<
  VehicleClassDetailDialogProps
> = ({ open, onClose, vehicleClass }) => {
  if (!vehicleClass) return null;
  const class2Weight =
    vehicleClass.class_2_weight != null
      ? Number(vehicleClass.class_2_weight).toLocaleString("id-ID")
      : "-";
  const class3Weight =
    vehicleClass.class_3_weight != null
      ? Number(vehicleClass.class_3_weight).toLocaleString("id-ID")
      : "-";

  return (
    <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Detail Kelas Kendaraan</DialogTitle>
          <DialogContent>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar
                  name={vehicleClass.type}
                  image={{
                    src: getVehicleImageUrl(vehicleClass.image ?? null),
                  }}
                  size={72}
                />
                <div>
                  <h3 className="text-xl font-semibold">{vehicleClass.type}</h3>
                  <p className="text-gray-600">{vehicleClass.code}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Deskripsi</p>
                  <p>{vehicleClass.description}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <div className="mt-1">
                    {vehicleClass.is_active ? (
                      <Badge appearance="filled" color="success" size="large">
                        Aktif
                      </Badge>
                    ) : (
                      <Badge appearance="filled" color="danger" size="large">
                        Tidak Aktif
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-gray-600">Jumlah Sumbu</p>
                  <p>{vehicleClass.total_axle}</p>
                </div>
                <div>
                  <p className="text-gray-600">Berat</p>
                  {vehicleClass.total_axle >= 6 ? (
                    <p>{class2Weight} kg / sumbu</p>
                  ) : vehicleClass.class_2_weight ===
                    vehicleClass.class_3_weight ? (
                    <p>± {class2Weight} kg</p>
                  ) : (
                    <p>
                      {class2Weight} kg - {class3Weight} kg
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-gray-600">Dimensi (P×L×T)</p>
                  <p>
                    {vehicleClass.length} × {vehicleClass.width} ×{" "}
                    {vehicleClass.height} m
                  </p>
                </div>

                <div>
                  <p className="text-gray-600">Dibuat Pada</p>
                  <p>{formatDateTime(vehicleClass.created_date)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Diperbarui Pada</p>
                  <p>{formatDateTime(vehicleClass.updated_date)}</p>
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>
              Tutup
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
