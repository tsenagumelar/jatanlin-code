/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { Card, Spinner, Badge } from '@fluentui/react-components';
import { History24Regular, ImageOff24Regular } from '@fluentui/react-icons';
import { useGetVehicleHistoryByPlateQuery } from '@/src/graphql/hooks/transact-vehicle-actual';
import { getMinioImageUrl } from '@/src/utils/image';

interface HistoriTabProps {
  plateNo: string;
}

const formatDateTime = (dateString: any) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const HistoriTab: React.FC<HistoriTabProps> = ({ plateNo }) => {
  const { data, loading } = useGetVehicleHistoryByPlateQuery({
    variables: {
      plate_no: `%${plateNo}%`,
    },
    skip: !plateNo || plateNo === '-',
  });

  const history = data?.transact_vehicle_actual || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="large" label="Memuat riwayat..." />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <div className="p-12 text-center">
          <History24Regular className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Tidak Ada Riwayat
          </h3>
          <p className="text-gray-500">
            Tidak ditemukan riwayat transaksi untuk plat nomor {plateNo}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <History24Regular className="w-6 h-6" />
        <h2 className="text-lg font-semibold">
          Riwayat Transaksi - {plateNo}
        </h2>
        <Badge appearance="filled" color="informative">
          {history.length} Transaksi
        </Badge>
      </div>

      {history.map((vehicle: any) => {
        const imageUrl = vehicle.transact_anpr_capture
          ? getMinioImageUrl(
              vehicle.transact_anpr_capture.minio_bucket,
              vehicle.transact_anpr_capture.minio_full_image_object
            )
          : '';

        const latestStatus = vehicle.transact_vehicle_statuses?.[0];
        const violationType = latestStatus?.result || '-';

        return (
          <Card key={vehicle.id} className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
              {/* Image */}
              <div className="md:col-span-3">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Kendaraan"
                    className="w-full h-40 object-cover rounded border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded border border-gray-200">
                    <ImageOff24Regular className="text-gray-400 w-12 h-12" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="md:col-span-9">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Plat Nomor */}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase">Plat Nomor</p>
                    <p className="text-lg font-bold text-gray-900">
                      {vehicle.actual_plat_no || vehicle.transact_anpr_capture?.plate_no || '-'}
                    </p>
                  </div>

                  {/* Berat */}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase">Berat</p>
                    <p className="text-base font-semibold text-gray-900">
                      {vehicle.actual_weight
                        ? (vehicle.actual_weight / 1000).toFixed(2)
                        : '-'}
                      {vehicle.actual_weight && <span className="text-sm text-gray-500 ml-1">TON</span>}
                    </p>
                  </div>

                  {/* Dimensi */}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase">Dimensi (P×L×T)</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {vehicle.actual_length || '-'} × {vehicle.actual_width || '-'} × {vehicle.actual_height || '-'}
                      {(vehicle.actual_length || vehicle.actual_width || vehicle.actual_height) && (
                        <span className="text-xs text-gray-500 ml-1">m</span>
                      )}
                    </p>
                  </div>

                  {/* Tanggal */}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase">Tanggal Kejadian</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDateTime(vehicle.transact_anpr_capture?.captured_at || vehicle.created_date)}
                    </p>
                  </div>
                </div>

                {/* Jenis Pelanggaran */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">
                        Jenis Pelanggaran
                      </p>
                      <p className={`text-base font-semibold ${
                        violationType.toLowerCase() === 'normal'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {violationType}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {latestStatus ? (
                        <Badge
                          appearance="filled"
                          color={
                            latestStatus.status === 'verified'
                              ? 'success'
                              : latestStatus.status === 'rejected'
                              ? 'danger'
                              : 'warning'
                          }
                          size="extra-large"
                        >
                          {latestStatus.status === 'verified'
                            ? 'Terverifikasi'
                            : latestStatus.status === 'rejected'
                            ? 'Disangkal'
                            : 'Perlu Ditinjau'}
                        </Badge>
                      ) : (
                        <Badge appearance="filled" color="brand" size="extra-large">
                          Perlu Ditinjau
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
