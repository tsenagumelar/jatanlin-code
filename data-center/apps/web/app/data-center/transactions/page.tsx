"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:28001";

type TransactionItem = {
  id: string;
  time: string;
  transaction_no: string;
  plate_no: string;
  location: string;
  violation_status: string;
  violation_notes: string;
  verification_status: string;
  officer: string;
  site_id: string;
  site_code: string;
  site_name: string;
  etlenas_status: string;
  etlenas_error: string;
  etlenas_synced_at: string | null;
  anpr_image_url: string;
};

type TransactionResponse = {
  items: TransactionItem[];
  sites: Array<{ id: string; site_code: string; site_name: string }>;
  pagination: { page: number; page_size: number; total: number };
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status: string) {
  if (status === "verified") return "Terverifikasi";
  if (status === "rejected") return "Ditolak";
  if (status === "draft") return "Draf";
  return "Menunggu";
}

function statusTone(status: string) {
  if (status === "verified") return "bg-emerald-50 text-emerald-700";
  if (status === "rejected") return "bg-red-50 text-red-700";
  if (status === "draft") return "bg-sky-50 text-sky-700";
  return "bg-amber-50 text-amber-700";
}

function violationLabel(row: TransactionItem) {
  if (row.violation_status === "normal") return "Normal";
  if (row.violation_status !== "violation") return "Menunggu";
  return row.violation_notes.toLowerCase().includes("loading")
    ? "Over Loading"
    : "Over Dimension";
}

function etlenasLabel(status: string) {
  if (status === "SUCCESS") return "Berhasil";
  if (status === "FAILED") return "Gagal";
  if (status === "PROCESSING") return "Sedang Sync";
  return "Belum Sync";
}

function etlenasTone(status: string) {
  if (status === "SUCCESS") return "bg-emerald-50 text-emerald-700";
  if (status === "FAILED") return "bg-red-50 text-red-700";
  if (status === "PROCESSING") return "bg-blue-50 text-blue-700";
  return "bg-slate-100 text-slate-600";
}

export default function DataCenterTransactionsPage() {
  const router = useRouter();
  const [data, setData] = useState<TransactionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [siteID, setSiteID] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [syncingIDs, setSyncingIDs] = useState<string[]>([]);
  const pageSize = 25;

  useEffect(() => {
    const nextSearch = search.trim();
    if (nextSearch === debouncedSearch) return;

    const timer = window.setTimeout(() => {
      setPage(1);
      setLoading(true);
      setError("");
      setDebouncedSearch(nextSearch);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [debouncedSearch, search]);

  useEffect(() => {
    const token = localStorage.getItem("dc_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (status) params.set("status", status);
    if (siteID) params.set("site_id", siteID);
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);

    fetch(`${API_BASE_URL}/api/data-center/transactions?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Gagal mengambil data");
        setData(payload);
      })
      .catch((fetchError) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
        setError(fetchError instanceof Error ? fetchError.message : "Gagal mengambil data");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedSearch, endDate, page, reloadVersion, router, siteID, startDate, status]);

  const totalPages = Math.max(
    1,
    Math.ceil((data?.pagination.total ?? 0) / pageSize),
  );
  const rowStart = useMemo(() => (page - 1) * pageSize, [page]);

  async function syncETLENAS(row: TransactionItem) {
    const token = localStorage.getItem("dc_token");
    if (!token || syncingIDs.includes(row.id)) return;

    setSyncingIDs((current) => [...current, row.id]);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/data-center/transactions/${row.id}/sync-etlenas`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const payload = await response.json();
      setData((current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) =>
                item.id === row.id
                  ? {
                      ...item,
                      etlenas_status: payload.status || "FAILED",
                      etlenas_error: payload.error || "",
                      etlenas_synced_at: new Date().toISOString(),
                    }
                  : item,
              ),
            }
          : current,
      );
      if (!response.ok) {
        throw new Error(payload.error || "Sinkronisasi ETLE NAS gagal");
      }
    } catch (syncError) {
      setError(
        syncError instanceof Error
          ? syncError.message
          : "Sinkronisasi ETLE NAS gagal",
      );
    } finally {
      setSyncingIDs((current) => current.filter((id) => id !== row.id));
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef2f7] text-slate-900">
      <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/data-center" className="text-sm font-black text-blue-700 hover:text-blue-800">
              ← Kembali ke Data Center
            </Link>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Daftar Pelanggaran</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Seluruh data transaksi yang diterima dari situs Jatanlin.
            </p>
          </div>
          <span className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
            {data?.pagination.total ?? 0} data
          </span>
        </div>
      </header>

      <section className="p-4 sm:p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_220px_220px_170px_170px_auto]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nomor polisi, transaksi, lokasi, petugas..."
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-blue-400 focus:bg-white"
            />
            <select
              value={status}
              onChange={(event) => {
                setPage(1); setLoading(true); setError(""); setStatus(event.target.value);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-blue-400"
            >
              <option value="">Semua Status</option>
              <option value="verified">Terverifikasi</option>
              <option value="pending">Menunggu</option>
              <option value="draft">Draf</option>
              <option value="rejected">Ditolak</option>
            </select>
            <select
              value={siteID}
              onChange={(event) => {
                setPage(1); setLoading(true); setError(""); setSiteID(event.target.value);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-blue-400"
            >
              <option value="">Semua Situs</option>
              {(data?.sites ?? []).map((site) => (
                <option key={site.id} value={site.id}>
                  {site.site_code} - {site.site_name}
                </option>
              ))}
            </select>
            <input
              type="date"
              aria-label="Tanggal mulai"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => {
                setPage(1); setLoading(true); setError(""); setStartDate(event.target.value);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-400"
            />
            <input
              type="date"
              aria-label="Tanggal akhir"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => {
                setPage(1); setLoading(true); setError(""); setEndDate(event.target.value);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-400"
            />
            <button
              type="button"
              onClick={() => {
                setPage(1);
                setLoading(true);
                setError("");
                setSearch("");
                setDebouncedSearch("");
                setStatus("");
                setSiteID("");
                setStartDate("");
                setEndDate("");
                setReloadVersion((current) => current + 1);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>
        ) : null}

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px] text-sm">
              <thead className="bg-slate-50 uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-4 text-left">No</th>
                  <th className="px-5 py-4 text-left">Gambar ANPR</th>
                  <th className="px-5 py-4 text-left">Waktu</th>
                  <th className="px-5 py-4 text-left">No. Polisi</th>
                  <th className="px-5 py-4 text-left">Situs / Lokasi</th>
                  <th className="px-5 py-4 text-left">Jenis Pelanggaran</th>
                  <th className="px-5 py-4 text-left">Pasal / Catatan</th>
                  <th className="px-5 py-4 text-left">Petugas</th>
                  <th className="px-5 py-4 text-left">Status</th>
                  <th className="px-5 py-4 text-left">Sync ETLE NAS</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={11} className="px-5 py-12 text-center font-bold text-slate-400">Memuat data...</td></tr>
                ) : (data?.items.length ?? 0) === 0 ? (
                  <tr><td colSpan={11} className="px-5 py-12 text-center font-bold text-slate-400">Tidak ada data sesuai filter.</td></tr>
                ) : (
                  data?.items.map((row, index) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-black text-slate-400">{rowStart + index + 1}</td>
                      <td className="px-5 py-4">
                        <div className="relative h-16 w-24 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          {row.anpr_image_url ? (
                            <Image
                              src={row.anpr_image_url}
                              alt={`ANPR ${row.plate_no || row.id}`}
                              fill
                              sizes="96px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <span className="flex h-full items-center justify-center text-xs font-bold text-slate-400">
                              Tidak ada
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-600">{formatDateTime(row.time)}</td>
                      <td className="px-5 py-4 font-black text-slate-900">{row.plate_no || "-"}</td>
                      <td className="px-5 py-4">
                        <p className="font-black text-slate-700">{row.site_code}</p>
                        <p className="mt-1 text-slate-500">{row.location || row.site_name}</p>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-700">{violationLabel(row)}</td>
                      <td className="max-w-xs px-5 py-4 font-semibold text-slate-600">{row.violation_notes || "Pasal 277"}</td>
                      <td className="px-5 py-4 font-bold text-slate-600">{row.officer || "-"}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 font-black ${statusTone(row.verification_status)}`}>
                          {statusLabel(row.verification_status)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          title={row.etlenas_error || undefined}
                          className={`whitespace-nowrap rounded-full px-3 py-1 font-black ${etlenasTone(row.etlenas_status)}`}
                        >
                          {etlenasLabel(row.etlenas_status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={
                              syncingIDs.includes(row.id) ||
                              row.verification_status !== "verified" ||
                              row.violation_status !== "violation" ||
                              row.etlenas_status === "SUCCESS"
                            }
                            onClick={() => void syncETLENAS(row)}
                            title={
                              row.verification_status !== "verified"
                                ? "Transaksi harus terverifikasi"
                                : row.violation_status !== "violation"
                                  ? "Hanya data pelanggaran yang dikirim"
                                  : undefined
                            }
                            className="whitespace-nowrap rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 font-black text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {syncingIDs.includes(row.id) ? "Mengirim..." : "Sync ETLE"}
                          </button>
                          <Link href={`/data-center/transactions/${row.id}`} className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 font-black text-blue-700 hover:bg-blue-100">
                            Lihat
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4">
            <p className="text-sm font-semibold text-slate-500">
              Halaman {page} dari {totalPages} · {data?.pagination.total ?? 0} data
            </p>
            <div className="flex items-center gap-2">
              <button type="button" disabled={page <= 1 || loading} onClick={() => { setLoading(true); setPage((current) => Math.max(1, current - 1)); }} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 disabled:opacity-40">Sebelumnya</button>
              <button type="button" disabled={page >= totalPages || loading} onClick={() => { setLoading(true); setPage((current) => Math.min(totalPages, current + 1)); }} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 disabled:opacity-40">Berikutnya</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
