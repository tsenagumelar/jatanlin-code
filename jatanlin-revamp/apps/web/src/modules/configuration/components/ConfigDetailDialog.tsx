'use client';

import React from 'react';
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Badge,
} from '@fluentui/react-components';
import type { ConfigData } from '../types';

interface ConfigDetailDialogProps {
  open: boolean;
  onClose: () => void;
  config: ConfigData | null;
}

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ConfigDetailDialog: React.FC<ConfigDetailDialogProps> = ({
  open,
  onClose,
  config,
}) => {
  if (!config) return null;

  return (
    <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Detail Konfigurasi</DialogTitle>
          <DialogContent>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{config.config_key}</h3>
                  <p className="text-gray-600">{config.code}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Tipe Konfigurasi</p>
                  <p>{config.config_type}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <div className="mt-1">
                    {config.is_active ? (
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
                  <p className="text-gray-600">Config Key</p>
                  <p>{config.config_key}</p>
                </div>
                <div>
                  <p className="text-gray-600">Config Value</p>
                  <p className="font-medium">{config.config_value}</p>
                </div>

                <div className="col-span-2">
                  <p className="text-gray-600">Deskripsi</p>
                  <p>{config.description}</p>
                </div>

                <div>
                  <p className="text-gray-600">Sort Order</p>
                  <p>{config.sort_order}</p>
                </div>
                <div>
                  <p className="text-gray-600">Parent Code</p>
                  <p>{config.parent_code || '-'}</p>
                </div>

                <div>
                  <p className="text-gray-600">Dibuat Pada</p>
                  <p>{formatDateTime(config.created_date)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Diperbarui Pada</p>
                  <p>{formatDateTime(config.updated_date)}</p>
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
