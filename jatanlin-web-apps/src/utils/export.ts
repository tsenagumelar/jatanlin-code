/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExportOptions {
  filename: string;
  sheetName?: string;
  title?: string;
}

/**
 * Export data to Excel file
 */
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Delay revoke so the browser has time to persist the file.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const exportToExcel = async (
  data: any[],
  columns: ExportColumn[],
  options: ExportOptions
) => {
  if (typeof window === 'undefined') return;
  const XLSX = await import('xlsx');
  // Transform data based on columns
  const exportData = data.map((item) => {
    const row: any = {};
    columns.forEach((col) => {
      const keys = col.key.split('.');
      let value = item;
      for (const key of keys) {
        value = value?.[key];
      }
      row[col.header] = value ?? '-';
    });
    return row;
  });

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  const wscols = columns.map((col) => ({
    wch: col.width || 15,
  }));
  ws['!cols'] = wscols;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, options.sheetName || 'Data');

  // Generate file
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  downloadBlob(blob, `${options.filename}.xlsx`);
};

/**
 * Export data to PDF file
 */
export const exportToPDF = async (
  data: any[],
  columns: ExportColumn[],
  options: ExportOptions
) => {
  if (typeof window === 'undefined') return;
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const doc = new jsPDF('landscape');

  // Add title if provided
  if (options.title) {
    doc.setFontSize(16);
    doc.text(options.title, 14, 15);
  }

  // Transform data for PDF table
  const tableData = data.map((item) => {
    return columns.map((col) => {
      const keys = col.key.split('.');
      let value = item;
      for (const key of keys) {
        value = value?.[key];
      }
      return value ?? '-';
    });
  });

  // Generate table
  autoTable(doc, {
    head: [columns.map((col) => col.header)],
    body: tableData,
    startY: options.title ? 20 : 10,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [0, 120, 212], // Primary blue color
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: columns.reduce((acc, col, index) => {
      if (col.width) {
        acc[index] = { cellWidth: col.width };
      }
      return acc;
    }, {} as any),
  });

  // Save PDF
  doc.save(`${options.filename}.pdf`);
};

/**
 * Format date for export
 */
export const formatDateForExport = (date: string | null | undefined): string => {
  if (!date) return '-';
  return new Date(date).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format boolean for export
 */
export const formatBooleanForExport = (
  value: boolean,
  trueLabel = 'Ya',
  falseLabel = 'Tidak'
): string => {
  return value ? trueLabel : falseLabel;
};
