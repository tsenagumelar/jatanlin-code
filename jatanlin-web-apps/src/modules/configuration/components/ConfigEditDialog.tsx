'use client';

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Field,
  Textarea,
} from '@fluentui/react-components';
import { useConfigEdit } from '../hooks';
import type { ConfigData } from '../types';

interface ConfigEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editConfig?: ConfigData | null;
}

export const ConfigEditDialog: React.FC<ConfigEditDialogProps> = ({
  open,
  onClose,
  onSuccess,
  editConfig,
}) => {
  const configId = editConfig?.id as string | undefined;
  const {
    formData,
    isSubmitting,
    formError,
    handleChange,
    handleSubmit,
    resetForm,
    setFormData,
  } = useConfigEdit(configId, () => {
    onSuccess();
    onClose();
    resetForm();
  });

  useEffect(() => {
    if (open && editConfig) {
      setFormData({
        config_value: editConfig.config_value || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editConfig]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  if (!formData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
      <DialogSurface>
        <form onSubmit={handleFormSubmit}>
          <DialogBody>
            <DialogTitle>Edit Konfigurasi</DialogTitle>
            <DialogContent className="space-y-4">
              {editConfig && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Kode</p>
                    <p className="font-medium">{editConfig.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tipe</p>
                    <p className="font-medium">{editConfig.config_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Key</p>
                    <p className="font-medium">{editConfig.config_key}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Deskripsi</p>
                    <p className="text-sm">{editConfig.description}</p>
                  </div>
                </div>
              )}

              <Field label="Nilai Konfigurasi" required>
                <Textarea
                  value={formData?.config_value || ''}
                  onChange={(e) => handleChange(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Masukkan nilai konfigurasi"
                  rows={4}
                />
              </Field>

              {formError && (
                <div className="text-red-600 text-sm">{formError}</div>
              )}
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={onClose} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" appearance="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
};
