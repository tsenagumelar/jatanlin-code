'use client';

import React from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
} from '@fluentui/react-components';
import {
  ArrowDownload24Regular,
  DocumentTable24Regular,
  DocumentPdf24Regular,
} from '@fluentui/react-icons';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  loading?: boolean;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onOpenChange,
  onExportExcel,
  onExportPDF,
  loading = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Ekspor Data</DialogTitle>
          <DialogContent>
            <p className="text-sm text-gray-600 mb-4">
              Pilih format file yang ingin Anda ekspor:
            </p>
            <div className="flex flex-col gap-3">
              <Button
                appearance="outline"
                icon={<DocumentTable24Regular />}
                onClick={() => {
                  onExportExcel();
                  onOpenChange(false);
                }}
                disabled={loading}
                size="large"
                className="justify-start"
              >
                Ekspor ke Excel (.xlsx)
              </Button>
              <Button
                appearance="outline"
                icon={<DocumentPdf24Regular />}
                onClick={() => {
                  onExportPDF();
                  onOpenChange(false);
                }}
                disabled={loading}
                size="large"
                className="justify-start"
              >
                Ekspor ke PDF (.pdf)
              </Button>
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              appearance="secondary"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default ExportDialog;
