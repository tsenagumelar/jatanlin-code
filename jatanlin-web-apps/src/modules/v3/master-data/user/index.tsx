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
import { getV3UserAvatarUrl, useV3MasterUser } from "./hooks";
import type { V3UserRow } from "./types";

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

export function V3MasterUserPage() {
  const user = useV3MasterUser();

  return (
    <V3DefaultPage
      title="User"
      breadcrumbs={[{ label: "Master Data" }, { label: "User" }]}
      description="Manage user accounts, roles, contact information, and account status."
    >
      {user.error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {user.error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(260px,1fr)_220px_180px_auto_auto]">
          <label className="relative block">
            <span className="sr-only">Search user</span>
            <Search20Regular className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={user.filters.search}
              onChange={(event) =>
                user.updateFilter("search", event.target.value)
              }
              placeholder="Search username, full name, badge, or email"
              className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <select
            value={user.filters.roleId}
            onChange={(event) =>
              user.updateFilter("roleId", event.target.value)
            }
            className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">All Roles</option>
            {user.roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.role_name}
              </option>
            ))}
          </select>

          <select
            value={user.filters.status}
            onChange={(event) =>
              user.updateFilter("status", event.target.value)
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
                  onClick={() => user.handleExport("csv")}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <TableSimple20Regular />
                  Export as CSV
                </button>
                <button
                  type="button"
                  onClick={() => user.handleExport("pdf")}
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
            onClick={user.openCreateModal}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <Add20Regular />
            Add New User
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1240px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Photo</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Badge No</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Updated</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {user.users.length > 0 ? (
                user.users.map((row: V3UserRow, index: number) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-500">
                      {user.page * user.rowsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <Avatar
                        image={{ src: getV3UserAvatarUrl(row.profile_picture) }}
                        name={row.full_name}
                        size={36}
                        className="border border-slate-200"
                      />
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-950">
                      {row.username}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {row.full_name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.badge_no || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.email || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.phone_number || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        {row.master_role.role_name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill isActive={row.is_active} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {user.formatDateTime(
                        row.updated_date || row.created_date,
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => user.openEditModal(row)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                        >
                          <Edit20Regular />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => user.handleDelete(row)}
                          disabled={user.isDeleting}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Delete20Regular />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center">
                    <p className="text-sm font-semibold text-slate-500">
                      {user.isLoading
                        ? "Loading user data..."
                        : "No user data available."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-semibold">
            Showing {user.startRow.toLocaleString("en-US")}-
            {user.endRow.toLocaleString("en-US")} of{" "}
            {user.totalCount.toLocaleString("en-US")}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 font-semibold">
              <span>Rows per page</span>
              <select
                value={user.rowsPerPage}
                onChange={(event) => user.changeRowsPerPage(event.target.value)}
                className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </label>
            <span className="font-semibold">
              Page {(user.page + 1).toLocaleString("en-US")} of{" "}
              {user.totalPages.toLocaleString("en-US")}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={user.goToPreviousPage}
                disabled={user.page === 0 || user.isLoading}
                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={user.goToNextPage}
                disabled={
                  user.page >= user.totalPages - 1 ||
                  user.totalCount === 0 ||
                  user.isLoading
                }
                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {user.modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form
            onSubmit={user.handleSubmit}
            className="max-h-[calc(100vh-32px)] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                  Master Data User
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-950">
                  {user.modal.mode === "create" ? "Add New User" : "Edit User"}
                </h2>
              </div>
              <button
                type="button"
                onClick={user.closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Close user form"
              >
                <Dismiss24Regular />
              </button>
            </div>

            <div className="max-h-[calc(100vh-180px)] overflow-y-auto p-5">
              {user.formError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                  {user.formError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Username
                  </span>
                  <input
                    value={user.formData.username}
                    onChange={user.inputChange("username")}
                    disabled={user.modal.mode === "edit"}
                    required
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Full Name
                  </span>
                  <input
                    value={user.formData.fullName}
                    onChange={user.inputChange("fullName")}
                    required
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Badge No
                  </span>
                  <input
                    value={user.formData.badgeNo}
                    onChange={user.inputChange("badgeNo")}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Email
                  </span>
                  <input
                    type="email"
                    value={user.formData.email}
                    onChange={user.inputChange("email")}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Phone
                  </span>
                  <input
                    value={user.formData.phone}
                    onChange={user.inputChange("phone")}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    Role
                  </span>
                  <select
                    value={user.formData.roleId}
                    onChange={user.inputChange("roleId")}
                    required
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Select role</option>
                    {user.roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.role_name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Profile Photo
                  </span>
                  <div className="mt-2 flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                    <Avatar
                      image={{
                        src: getV3UserAvatarUrl(user.formData.profilePicture),
                      }}
                      name={user.formData.fullName || user.formData.username}
                      size={72}
                      className="border border-slate-200 bg-white"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-700">
                        Upload a JPG or PNG profile photo.
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Maximum file size is 5MB. The uploaded file path will be
                        saved to the user profile.
                      </p>
                      {user.uploadError && (
                        <p className="mt-2 text-xs font-semibold text-red-600">
                          {user.uploadError}
                        </p>
                      )}
                      {user.formData.profilePicture && !user.uploadError && (
                        <p className="mt-2 truncate text-xs font-semibold text-emerald-700">
                          {user.formData.profilePicture}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800">
                        <ArrowUpload20Regular />
                        {user.isUploadingPhoto ? "Uploading..." : "Upload Image"}
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                          onChange={user.handlePhotoUpload}
                          disabled={user.isUploadingPhoto || user.isSubmitting}
                          className="hidden"
                        />
                      </label>
                      {user.formData.profilePicture && (
                        <button
                          type="button"
                          onClick={() => user.updateForm("profilePicture", "")}
                          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <label className="block md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">
                    {user.modal.mode === "create"
                      ? "Password"
                      : "Password (optional)"}
                  </span>
                  <input
                    type="password"
                    value={user.formData.password}
                    onChange={user.inputChange("password")}
                    required={user.modal.mode === "create"}
                    placeholder={
                      user.modal.mode === "create"
                        ? "Enter password"
                        : "Leave blank to keep current password"
                    }
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={user.formData.isActive}
                    onChange={user.inputChange("isActive")}
                    className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                  />
                  <span className="text-sm font-semibold text-slate-700">
                    Active user
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={user.closeModal}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={user.isSubmitting}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {user.isSubmitting ? "Saving..." : "Save User"}
              </button>
            </div>
          </form>
        </div>
      )}
    </V3DefaultPage>
  );
}
