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
} from '@fluentui/react-components';
import { useConfigEdit } from '../hooks';
import type { ConfigData } from '../types';

interface ConfigEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editConfig?: ConfigData | null;
}

const labelClass = 'block text-xs font-semibold text-slate-500 mb-1.5';
const textareaClass = 'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 disabled:bg-slate-50 disabled:text-slate-400';

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
                <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Kode</p>
                    <p className="text-sm font-semibold text-slate-800">{editConfig.code}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Tipe</p>
                    <p className="text-sm font-semibold text-slate-800">{editConfig.config_type}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Key</p>
                    <p className="text-sm font-semibold text-slate-800">{editConfig.config_key}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Deskripsi</p>
                    <p className="text-sm text-slate-600">{editConfig.description}</p>
                  </div>
                </div>
              )}

              <label className="block">
                <span className={labelClass}>Nilai Konfigurasi <span className="text-red-500">*</span></span>
                <textarea
                  className={textareaClass}
                  value={formData?.config_value || ''}
                  onChange={(e) => handleChange(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Masukkan nilai konfigurasi"
                  rows={4}
                />
              </label>

              {formError && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{formError}</div>
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
