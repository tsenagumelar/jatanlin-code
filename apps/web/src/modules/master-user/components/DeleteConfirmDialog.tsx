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
  Spinner,
} from '@fluentui/react-components';
import { Warning24Filled } from '@fluentui/react-icons';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  userName: string;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  isDeleting,
  userName,
}) => {
  return (
    <Dialog open={open} onOpenChange={(e, data) => !data.open && !isDeleting && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Konfirmasi Hapus</DialogTitle>
          <DialogContent>
            <div className="flex items-start gap-3">
              <Warning24Filled className="text-orange-500 mt-1" />
              <div>
                <p className="font-medium mb-2">
                  Apakah Anda yakin ingin menghapus pengguna ini?
                </p>
                <p className="text-sm text-gray-600">
                  <strong>{userName}</strong>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Data akan dihapus secara soft delete dan dapat dipulihkan kembali.
                </p>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose} disabled={isDeleting}>
              Batal
            </Button>
            <Button
              appearance="primary"
              onClick={onConfirm}
              disabled={isDeleting}
              icon={isDeleting ? <Spinner size="tiny" /> : undefined}
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
