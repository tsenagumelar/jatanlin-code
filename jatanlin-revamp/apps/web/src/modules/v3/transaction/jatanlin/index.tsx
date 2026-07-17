"use client";
import Link from "next/link";
import {
  ArrowRight20Regular,
  CheckmarkCircle20Regular,
  Delete20Regular,
  Dismiss24Regular,
  DocumentPdf20Regular,
  Filter20Regular,
  Play20Regular,
  Search20Regular,
  TableSimple20Regular,
  VehicleTruckProfile24Regular,
} from "@fluentui/react-icons";
import { V3DefaultPage } from "../../shared/DefaultPage";
import { useV3Jatanlin } from "./hooks";

export function V3JatanlinPage() {
  const jatanlin = useV3Jatanlin();

  return (
    <V3DefaultPage
      title="Jatanlin"
      breadcrumbs={[{ label: "Transaction" }, { label: "Jatanlin" }]}
      description="Monitor vehicle transaction records and continue verification workflow."
    >
      {jatanlin.error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {jatanlin.error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-3 py-2.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Filter20Regular />
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-950">
                Transaction List
              </p>
              <p className="text-sm font-semibold text-slate-500">
                {jatanlin.totalCount.toLocaleString("en-US")} records found
              </p>
            </div>
          </div>

          <Link
            href="/monitoring/processing"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-700 px-3 text-sm font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <Play20Regular />
            Start System / Processing
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-2 p-3 xl:grid-cols-[minmax(240px,1fr)_190px_155px_155px_auto]">
          <label className="relative block">
            <span className="sr-only">Search Jatanlin</span>
            <Search20Regular className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={jatanlin.filters.search}
              onChange={(event) =>
                jatanlin.updateFilter("search", event.target.value)
              }
              placeholder="Search plate number"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <select
            value={jatanlin.filters.violation}
            onChange={(event) =>
              jatanlin.updateFilter("violation", event.target.value)
            }
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          >
            {jatanlin.violationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={jatanlin.filters.startDate}
            onChange={(event) =>
              jatanlin.updateFilter("startDate", event.target.value)
            }
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />

          <input
            type="date"
            value={jatanlin.filters.endDate}
            onChange={(event) =>
              jatanlin.updateFilter("endDate", event.target.value)
            }
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />

          <div className="flex justify-end">
            <div className="group relative">
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <TableSimple20Regular />
                Export Data
              </button>
              <div className="invisible absolute right-0 top-12 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => jatanlin.handleExport("csv")}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <TableSimple20Regular />
                  Export as CSV
                </button>
                <button
                  type="button"
                  onClick={() => jatanlin.handleExport("pdf")}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <DocumentPdf20Regular />
                  Export as PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {(jatanlin.filters.startDate || jatanlin.filters.endDate) && (
          <button
            type="button"
            onClick={jatanlin.resetDates}
            className="mx-3 mb-3 text-xs font-bold text-red-600 hover:text-red-700"
          >
            Reset date filter
          </button>
        )}
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[calc(100vh-320px)] overflow-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-bold uppercase tracking-[0.1em] text-slate-400 shadow-[inset_0_-1px_0_#e2e8f0]">
              <tr>
                <th className="px-3 py-2">No</th>
                <th className="px-3 py-2">Photo</th>
                <th className="px-3 py-2">Plate No</th>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">Axle</th>
                <th className="px-3 py-2">Weight</th>
                <th className="px-3 py-2">Dimensions</th>
                <th className="px-3 py-2">Violation</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jatanlin.rows.length > 0 ? (
                jatanlin.rows.map((row, index) => {
                  const photoUrl = jatanlin.getPhotoUrl(row);
                  return (
                    <tr key={row.id} className="hover:bg-blue-50/40">
                      <td className="px-3 py-2 font-semibold text-slate-500">
                        {jatanlin.page * jatanlin.pageSize + index + 1}
                      </td>
                      <td className="px-3 py-2">
                        <div className="relative flex h-8 w-12 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                          {photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={photoUrl}
                              alt={jatanlin.getPlate(row)}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <VehicleTruckProfile24Regular className="text-slate-300" />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 font-mono font-bold text-slate-950">
                        {jatanlin.getPlate(row)}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {jatanlin.formatDateTime(row.created_date)}
                      </td>
                      <td className="max-w-52 px-3 py-2 text-slate-600">
                        <span className="line-clamp-2">
                          {row.location_address ||
                            row.transact_anpr_capture?.location_code ||
                            "-"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {jatanlin.getAxle(row)}
                      </td>
                      <td className="px-3 py-2 font-semibold text-slate-700">
                        {jatanlin.getWeight(row)}
                      </td>
                      <td className="px-3 py-2 font-mono text-slate-600">
                        {jatanlin.getDimensions(row)}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${jatanlin.getViolationTone(row.violationType)}`}
                        >
                          {row.violationType}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${jatanlin.getStatusTone(row.latestStatus)}`}
                        >
                          {jatanlin.getLatestStatusLabel(row.latestStatus)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/transaction/jatanlin/detail/${row.id}`}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                          >
                            <ArrowRight20Regular />
                            View
                          </Link>
                          {(row.latestStatus === "pending" ||
                            row.latestStatus === "draft") && (
                            <Link
                              href={`/transaction/jatanlin/verify/${row.id}`}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                            >
                              <CheckmarkCircle20Regular />
                              Verify
                            </Link>
                          )}
                          {jatanlin.isAdmin && (
                            <button
                              type="button"
                              onClick={() => jatanlin.openDeleteModal(row)}
                              disabled={jatanlin.isDeleting}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Delete20Regular />
                              {jatanlin.isDeleting ? "Deleting..." : "Delete"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center">
                    <p className="text-sm font-semibold text-slate-500">
                      {jatanlin.isLoading
                        ? "Loading Jatanlin data..."
                        : "No Jatanlin data available."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-semibold">
            Showing {jatanlin.startRow.toLocaleString("en-US")}-
            {jatanlin.endRow.toLocaleString("en-US")} of{" "}
            {jatanlin.totalCount.toLocaleString("en-US")}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold">
              Page {(jatanlin.page + 1).toLocaleString("en-US")} of{" "}
              {jatanlin.totalPages.toLocaleString("en-US")}
            </span>
            <button
              type="button"
              onClick={() => jatanlin.setPage(Math.max(jatanlin.page - 1, 0))}
              disabled={jatanlin.page === 0 || jatanlin.isLoading}
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() =>
                jatanlin.setPage(
                  Math.min(jatanlin.page + 1, jatanlin.totalPages - 1),
                )
              }
              disabled={
                jatanlin.page >= jatanlin.totalPages - 1 ||
                jatanlin.totalCount === 0 ||
                jatanlin.isLoading
              }
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {jatanlin.deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <button
            type="button"
            aria-label="Close delete confirmation"
            onClick={jatanlin.closeDeleteModal}
            disabled={jatanlin.isDeleting}
            className="absolute inset-0 cursor-default"
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-transaction-title"
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
                  <Delete20Regular />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">
                    Delete Transaction
                  </p>
                  <h2 id="delete-transaction-title" className="mt-1 text-lg font-bold text-slate-950">
                    Delete {jatanlin.getPlate(jatanlin.deleteTarget)}?
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={jatanlin.closeDeleteModal}
                disabled={jatanlin.isDeleting}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close delete confirmation"
              >
                <Dismiss24Regular />
              </button>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm font-semibold leading-6 text-slate-600">
                This transaction will be removed from the active list and can no longer be processed from this page.
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={jatanlin.closeDeleteModal}
                disabled={jatanlin.isDeleting}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={jatanlin.confirmDelete}
                disabled={jatanlin.isDeleting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 text-sm font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                <Delete20Regular />
                {jatanlin.isDeleting ? "Deleting..." : "Delete Transaction"}
              </button>
            </div>
          </section>
        </div>
      )}
    </V3DefaultPage>
  );
}
