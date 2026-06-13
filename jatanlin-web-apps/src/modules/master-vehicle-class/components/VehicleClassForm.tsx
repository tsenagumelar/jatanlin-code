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
  Switch,
} from '@fluentui/react-components';
import { ImageUpload } from '@/src/components/molecules';
import { useVehicleClassForm } from '../hooks';
import type { VehicleClassData } from '../types';

interface VehicleClassFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editVehicleClass?: VehicleClassData | null;
}

const labelClass = 'block text-xs font-semibold text-slate-500 mb-1.5';
const inputClass = 'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 disabled:bg-slate-50 disabled:text-slate-400';

export const VehicleClassForm: React.FC<VehicleClassFormProps> = ({
  open,
  onClose,
  onSuccess,
  editVehicleClass,
}) => {
  const vehicleClassId = editVehicleClass?.id as string | undefined;
  const {
    formData,
    isSubmitting,
    formError,
    handleChange,
    handleSubmit,
    resetForm,
    setFormData,
  } = useVehicleClassForm(vehicleClassId, () => {
    onSuccess();
    onClose();
    resetForm();
  });

  useEffect(() => {
    if (open) {
      if (editVehicleClass) {
        setFormData({
          type: editVehicleClass.type,
          description: editVehicleClass.description,
          total_axle: editVehicleClass.total_axle,
          class_2_weight: editVehicleClass.class_2_weight,
          class_3_weight: editVehicleClass.class_3_weight,
          length: editVehicleClass.length,
          width: editVehicleClass.width,
          height: editVehicleClass.height,
          image: editVehicleClass.image || '',
          is_active: editVehicleClass.is_active ?? true,
        });
      } else {
        resetForm();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editVehicleClass]);

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
            <DialogTitle>
              {editVehicleClass ? 'Edit Kelas Kendaraan' : 'Tambah Kelas Kendaraan'}
            </DialogTitle>
            <DialogContent className="space-y-4">
              <label className="block">
                <span className={labelClass}>Tipe Kendaraan <span className="text-red-500">*</span></span>
                <input
                  className={inputClass}
                  value={formData?.type || ''}
                  onChange={(e) => handleChange('type', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Contoh: Mobil Penumpang"
                />
              </label>

              <label className="block">
                <span className={labelClass}>Deskripsi <span className="text-red-500">*</span></span>
                <textarea
                  className={inputClass}
                  value={formData?.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Masukkan deskripsi kelas kendaraan"
                  rows={3}
                />
              </label>

              <ImageUpload
                value={formData?.image || null}
                onChange={(filePath) => handleChange('image', filePath || '')}
                label="Foto Kendaraan"
                userName={formData?.type || 'Kendaraan'}
                disabled={isSubmitting}
              />

              <label className="block">
                <span className={labelClass}>Jumlah Sumbu <span className="text-red-500">*</span></span>
                <input
                  className={inputClass}
                  type="number"
                  value={formData?.total_axle?.toString() || '0'}
                  onChange={(e) =>
                    handleChange('total_axle', parseInt(e.target.value) || 0)
                  }
                  disabled={isSubmitting}
                  placeholder="Contoh: 2"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className={labelClass}>Berat Minimum (kg) <span className="text-red-500">*</span></span>
                  <input
                    className={inputClass}
                    type="number"
                    value={formData?.class_2_weight?.toString() || '0'}
                    onChange={(e) =>
                      handleChange('class_2_weight', parseFloat(e.target.value) || 0)
                    }
                    disabled={isSubmitting}
                    placeholder="Contoh: 10000"
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Berat Maksimum (kg) <span className="text-red-500">*</span></span>
                  <input
                    className={inputClass}
                    type="number"
                    value={formData?.class_3_weight?.toString() || '0'}
                    onChange={(e) =>
                      handleChange('class_3_weight', parseFloat(e.target.value) || 0)
                    }
                    disabled={isSubmitting}
                    placeholder="Contoh: 20000"
                  />
                </label>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <label className="block">
                  <span className={labelClass}>Panjang (m) <span className="text-red-500">*</span></span>
                  <input
                    className={inputClass}
                    type="number"
                    value={formData?.length?.toString() || '0'}
                    onChange={(e) =>
                      handleChange('length', parseFloat(e.target.value) || 0)
                    }
                    disabled={isSubmitting}
                    placeholder="Contoh: 4.5"
                  />
                </label>

                <label className="block">
                  <span className={labelClass}>Lebar (m) <span className="text-red-500">*</span></span>
                  <input
                    className={inputClass}
                    type="number"
                    value={formData?.width?.toString() || '0'}
                    onChange={(e) =>
                      handleChange('width', parseFloat(e.target.value) || 0)
                    }
                    disabled={isSubmitting}
                    placeholder="Contoh: 1.8"
                  />
                </label>

                <label className="block">
                  <span className={labelClass}>Tinggi (m) <span className="text-red-500">*</span></span>
                  <input
                    className={inputClass}
                    type="number"
                    value={formData?.height?.toString() || '0'}
                    onChange={(e) =>
                      handleChange('height', parseFloat(e.target.value) || 0)
                    }
                    disabled={isSubmitting}
                    placeholder="Contoh: 1.5"
                  />
                </label>
              </div>

              <div>
                <span className={labelClass}>Status</span>
                <Switch
                  checked={formData?.is_active ?? true}
                  onChange={(e) => handleChange('is_active', e.currentTarget.checked)}
                  label={formData?.is_active ? 'Aktif' : 'Tidak Aktif'}
                  disabled={isSubmitting}
                />
              </div>

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
