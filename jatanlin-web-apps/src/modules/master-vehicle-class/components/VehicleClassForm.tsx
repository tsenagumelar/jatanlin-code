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
  Input,
  Textarea,
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
              <Field label="Tipe Kendaraan" required>
                <Input
                  value={formData?.type || ''}
                  onChange={(e) => handleChange('type', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Contoh: Mobil Penumpang"
                />
              </Field>

              <Field label="Deskripsi" required>
                <Textarea
                  value={formData?.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Masukkan deskripsi kelas kendaraan"
                  rows={3}
                />
              </Field>

              <ImageUpload
                value={formData?.image || null}
                onChange={(filePath) => handleChange('image', filePath || '')}
                label="Foto Kendaraan"
                userName={formData?.type || 'Kendaraan'}
                disabled={isSubmitting}
              />

              <Field label="Jumlah Sumbu" required>
                <Input
                  type="number"
                  value={formData?.total_axle?.toString() || '0'}
                  onChange={(e) =>
                    handleChange('total_axle', parseInt(e.target.value) || 0)
                  }
                  disabled={isSubmitting}
                  placeholder="Contoh: 2"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Berat Minimum (kg)" required>
                  <Input
                    type="number"
                    value={formData?.class_2_weight?.toString() || '0'}
                    onChange={(e) =>
                      handleChange('class_2_weight', parseFloat(e.target.value) || 0)
                    }
                    disabled={isSubmitting}
                    placeholder="Contoh: 10000"
                  />
                </Field>
                <Field label="Berat Maksimum (kg)" required>
                  <Input
                    type="number"
                    value={formData?.class_3_weight?.toString() || '0'}
                    onChange={(e) =>
                      handleChange('class_3_weight', parseFloat(e.target.value) || 0)
                    }
                    disabled={isSubmitting}
                    placeholder="Contoh: 20000"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Panjang (m)" required>
                  <Input
                    type="number"
                    value={formData?.length?.toString() || '0'}
                    onChange={(e) =>
                      handleChange('length', parseFloat(e.target.value) || 0)
                    }
                    disabled={isSubmitting}
                    placeholder="Contoh: 4.5"
                  />
                </Field>

                <Field label="Lebar (m)" required>
                  <Input
                    type="number"
                    value={formData?.width?.toString() || '0'}
                    onChange={(e) =>
                      handleChange('width', parseFloat(e.target.value) || 0)
                    }
                    disabled={isSubmitting}
                    placeholder="Contoh: 1.8"
                  />
                </Field>

                <Field label="Tinggi (m)" required>
                  <Input
                    type="number"
                    value={formData?.height?.toString() || '0'}
                    onChange={(e) =>
                      handleChange('height', parseFloat(e.target.value) || 0)
                    }
                    disabled={isSubmitting}
                    placeholder="Contoh: 1.5"
                  />
                </Field>
              </div>

              <Field label="Status">
                <Switch
                  checked={formData?.is_active ?? true}
                  onChange={(e) => handleChange('is_active', e.currentTarget.checked)}
                  label={formData?.is_active ? 'Aktif' : 'Tidak Aktif'}
                  disabled={isSubmitting}
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
