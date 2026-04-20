/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Spinner } from "@fluentui/react-components";

export interface Column<T = any> {
  key: string;
  header: string;
  width?: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  stickyHeader?: boolean;
  maxHeight?: string;
  keyExtractor?: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
}

export const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = "Tidak ada data",
  stickyHeader = true,
  maxHeight = "calc(100vh - 420px)",
  keyExtractor,
  onRowClick,
}: DataTableProps<T>) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner label="Memuat data..." />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      <div
        className={`overflow-auto ${maxHeight === "none" ? "flex-1" : ""}`}
        style={maxHeight !== "none" ? { maxHeight } : undefined}
      >
        <table className="w-full">
          <thead className={stickyHeader ? "sticky top-0 z-10 bg-gray-50" : ""}>
            <tr className="border-b border-gray-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left font-semibold text-sm bg-gray-50 border-b border-gray-200 ${column.className || ""}`}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => {
              const key = keyExtractor
                ? keyExtractor(row, rowIndex)
                : rowIndex.toString();

              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-gray-200 ${
                    onRowClick ? "cursor-pointer hover:bg-gray-50" : ""
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 text-sm ${column.className || ""}`}
                    >
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
