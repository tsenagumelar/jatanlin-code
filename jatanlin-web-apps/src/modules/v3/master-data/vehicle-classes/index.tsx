"use client";

import { Avatar } from "@fluentui/react-components";
import {
  Add20Regular,
  ArrowUpload20Regular,
  Delete20Regular,
  Dismiss24Regular,
  DocumentPdf20Regular,
  Edit20Regular,
  Search20Regular,
  TableSimple20Regular,
} from "@fluentui/react-icons";
import { V3DefaultPage } from "../../shared/DefaultPage";
import {
  getV3VehicleClassImageUrl,
  useV3VehicleClasses,
} from "./hooks";
import type { V3VehicleClassRow } from "./types";

function StatusPill({ isActive }: { isActive?: boolean | null }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
        isActive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

export function V3VehicleClassesPage() {
  const vehicleClass = useV3VehicleClasses();

  return (
    <V3DefaultPage
      title="Vehicle Classes"
      breadcrumbs={[{ label: "Master Data" }, { label: "Vehicle Classes" }]}
      description="Manage vehicle class references, weights, dimensions, and active status."
    >
      {vehicleClass.error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {vehicleClass.error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(260px,1fr)_180px_auto_auto]">
          <label className="relative block">
            <span className="sr-only">Search vehicle classes</span>
            <Search20Regular className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={vehicleClass.filters.search}
              onChange={(event) =>
                vehicleClass.updateFilter("search", event.target.value)
              }
              placeholder="Search code, type, or description"
              className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <select
            value={vehicleClass.filters.status}
            onChange={(event) =>
              vehicleClass.updateFilter("status", event.target.value)
            }
            className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="flex justify-end">
            <div className="group relative">
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <TableSimple20Regular />
                Export Data
              </button>
              <div className="invisible absolute right-0 top-12 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => vehicleClass.handleExport("csv")}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <TableSimple20Regular />
                  Export as CSV
                </button>
                <button
                  type="button"
                  onClick={() => vehicleClass.handleExport("pdf")}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <DocumentPdf20Regular />
                  Export as PDF
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={vehicleClass.openCreateModal}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <Add20Regular />
            Add Vehicle Class
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Total Axle</th>
                <th className="px-4 py-3">Weight</th>
                <th className="px-4 py-3">Dimensions</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Updated</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicleClass.vehicleClasses.length > 0 ? (
                vehicleClass.vehicleClasses.map(
                  (row: V3VehicleClassRow, index: number) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-500">
                        {vehicleClass.page * vehicleClass.rowsPerPage +
                          index +
                          1}
                      </td>
                      <td className="px-4 py-3">
                        <Avatar
                          image={{ src: getV3VehicleClassImageUrl(row.image) }}
                          name={row.type}
                          size={36}
                          className="border border-slate-200"
                        />
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-950">
                        {row.code}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {row.type}
                      </td>
                      <td className="max-w-72 px-4 py-3 text-slate-600">
                        <span className="line-clamp-2">{row.description}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {row.total_axle >= 6 ? ">= 6" : row.total_axle}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {vehicleClass.formatWeight(row)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {vehicleClass.formatDimensions(row)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill isActive={row.is_active} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {vehicleClass.formatDateTime(
                          row.updated_date || row.created_date,
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => vehicleClass.openEditModal(row)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                          >
                            <Edit20Regular />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => vehicleClass.handleDelete(row)}
                            disabled={vehicleClass.isDeleting}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Delete20Regular />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center">
                    <p className="text-sm font-semibold text-slate-500">
                      {vehicleClass.isLoading
                        ? "Loading vehicle class data..."
                        : "No vehicle class data available."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-semibold">
            Showing {vehicleClass.startRow.toLocaleString("en-US")}-
            {vehicleClass.endRow.toLocaleString("en-US")} of{" "}
            {vehicleClass.totalCount.toLocaleString("en-US")}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 font-semibold">
              <span>Rows per page</span>
              <select
                value={vehicleClass.rowsPerPage}
                onChange={(event) =>
                  vehicleClass.changeRowsPerPage(event.target.value)
                }
                className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </label>
            <span className="font-semibold">
              Page {(vehicleClass.page + 1).toLocaleString("en-US")} of{" "}
              {vehicleClass.totalPages.toLocaleString("en-US")}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={vehicleClass.goToPreviousPage}
                disabled={vehicleClass.page === 0 || vehicleClass.isLoading}
                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={vehicleClass.goToNextPage}
                disabled={
                  vehicleClass.page >= vehicleClass.totalPages - 1 ||
                  vehicleClass.totalCount === 0 ||
                  vehicleClass.isLoading
                }
                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {vehicleClass.modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form
            onSubmit={vehicleClass.handleSubmit}
            className="max-h-[calc(100vh-32px)] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                  Master Data Vehicle Classes
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-950">
                  {vehicleClass.modal.mode === "create"
                    ? "Add Vehicle Class"
                    : "Edit Vehicle Class"}
                </h2>
              </div>
              <button
                type="button"
                onClick={vehicleClass.closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Close vehicle class form"
              >
                <Dismiss24Regular />
              </button>
            </div>

            <div className="max-h-[calc(100vh-180px)] overflow-y-auto p-5">
              {vehicleClass.formError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                  {vehicleClass.formError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Vehicle Type
                  </span>
                  <input
                    value={vehicleClass.formData.type}
                    onChange={vehicleClass.inputChange("type")}
                    required
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Total Axle
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={vehicleClass.formData.totalAxle}
                    onChange={vehicleClass.inputChange("totalAxle")}
                    required
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Description
                  </span>
                  <textarea
                    value={vehicleClass.formData.description}
                    onChange={vehicleClass.inputChange("description")}
                    required
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Minimum Weight (kg)
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={vehicleClass.formData.class2Weight}
                    onChange={vehicleClass.inputChange("class2Weight")}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Maximum Weight (kg)
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={vehicleClass.formData.class3Weight}
                    onChange={vehicleClass.inputChange("class3Weight")}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Length (m)
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={vehicleClass.formData.length}
                    onChange={vehicleClass.inputChange("length")}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Width (m)
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={vehicleClass.formData.width}
                    onChange={vehicleClass.inputChange("width")}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Height (m)
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={vehicleClass.formData.height}
                    onChange={vehicleClass.inputChange("height")}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <div className="md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Vehicle Image
                  </span>
                  <div className="mt-2 flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                    <Avatar
                      image={{
                        src: getV3VehicleClassImageUrl(
                          vehicleClass.formData.image,
                        ),
                      }}
                      name={vehicleClass.formData.type}
                      size={72}
                      className="border border-slate-200 bg-white"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-700">
                        Upload a JPG or PNG vehicle image.
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Maximum file size is 5MB. The uploaded file path will be
                        saved to the vehicle class.
                      </p>
                      {vehicleClass.uploadError && (
                        <p className="mt-2 text-xs font-semibold text-red-600">
                          {vehicleClass.uploadError}
                        </p>
                      )}
                      {vehicleClass.formData.image &&
                        !vehicleClass.uploadError && (
                          <p className="mt-2 truncate text-xs font-semibold text-emerald-700">
                            {vehicleClass.formData.image}
                          </p>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800">
                        <ArrowUpload20Regular />
                        {vehicleClass.isUploadingImage
                          ? "Uploading..."
                          : "Upload Image"}
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                          onChange={vehicleClass.handleImageUpload}
                          disabled={
                            vehicleClass.isUploadingImage ||
                            vehicleClass.isSubmitting
                          }
                          className="hidden"
                        />
                      </label>
                      {vehicleClass.formData.image && (
                        <button
                          type="button"
                          onClick={() => vehicleClass.updateForm("image", "")}
                          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={vehicleClass.formData.isActive}
                    onChange={vehicleClass.inputChange("isActive")}
                    className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                  />
                  <span className="text-sm font-semibold text-slate-700">
                    Active vehicle class
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={vehicleClass.closeModal}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={vehicleClass.isSubmitting}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {vehicleClass.isSubmitting ? "Saving..." : "Save Vehicle Class"}
              </button>
            </div>
          </form>
        </div>
      )}
    </V3DefaultPage>
  );
}
