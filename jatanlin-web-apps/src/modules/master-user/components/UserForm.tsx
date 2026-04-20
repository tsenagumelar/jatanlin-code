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
  Select,
  Switch,
  Spinner,
} from '@fluentui/react-components';
import { ImageUpload } from '@/src/components/molecules';
import { useUserForm, useRoleOptions } from '../hooks';
import type { UserData } from '../types';

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editUser?: UserData | null;
}

export const UserForm: React.FC<UserFormProps> = ({
  open,
  onClose,
  onSuccess,
  editUser,
}) => {
  const userId = editUser?.id as string | undefined;
  const { roles, loading: rolesLoading } = useRoleOptions();
  const {
    formData,
    isSubmitting,
    formError,
    handleChange,
    handleSubmit,
    resetForm,
    setFormData,
  } = useUserForm(userId, () => {
    onSuccess();
    onClose();
    resetForm();
  });

  // Populate form when editing
  useEffect(() => {
    if (open) {
      if (editUser) {
        setFormData({
          username: editUser.username,
          full_name: editUser.full_name,
          badge_no: editUser.badge_no || '',
          phone_number: editUser.phone_number || '',
          email: editUser.email || '',
          role_id: editUser.role_id as string,
          password_hash: '', // Don't populate password
          is_active: editUser.is_active ?? true,
          profile_picture: editUser.profile_picture || '',
        });
      } else {
        resetForm();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editUser]);

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(e, data) => !data.open && handleClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            {editUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
          </DialogTitle>
          <DialogContent>
            <div className="space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {formError}
                </div>
              )}

              <Field label="Nama Pengguna" required>
                <Input
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  disabled={isSubmitting || !!editUser}
                  placeholder="Masukkan nama pengguna"
                />
              </Field>

              <Field label="Nama Lengkap" required>
                <Input
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Masukkan nama lengkap"
                />
              </Field>

              <ImageUpload
                value={formData.profile_picture || null}
                onChange={(filePath) => handleChange('profile_picture', filePath || '')}
                label="Foto Profil"
                userName={formData.full_name || 'Pengguna'}
                disabled={isSubmitting}
              />

              <Field label="No. Lencana">
                <Input
                  value={formData.badge_no}
                  onChange={(e) => handleChange('badge_no', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Masukkan nomor lencana"
                />
              </Field>

              <Field label="Email">
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="nama@example.com"
                />
              </Field>

              <Field label="No. Telepon">
                <Input
                  value={formData.phone_number}
                  onChange={(e) => handleChange('phone_number', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="+62xxx"
                />
              </Field>

              <Field label="Peran" required>
                <Select
                  value={formData.role_id}
                  onChange={(e) => handleChange('role_id', e.target.value)}
                  disabled={isSubmitting || rolesLoading}
                >
                  <option value="">Pilih Peran</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label={
                  editUser
                    ? 'Kata Sandi Baru (kosongkan jika tidak diubah)'
                    : 'Kata Sandi'
                }
                required={!editUser}
              >
                <Input
                  type="password"
                  value={formData.password_hash}
                  onChange={(e) => handleChange('password_hash', e.target.value)}
                  disabled={isSubmitting}
                  placeholder={
                    editUser
                      ? 'Kosongkan jika tidak diubah'
                      : 'Masukkan kata sandi'
                  }
                />
              </Field>

              <Field label="Status Aktif">
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => handleChange('is_active', e.currentTarget.checked)}
                  disabled={isSubmitting}
                  label={formData.is_active ? 'Aktif' : 'Tidak Aktif'}
                />
              </Field>
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={handleClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              appearance="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              icon={isSubmitting ? <Spinner size="tiny" /> : undefined}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
