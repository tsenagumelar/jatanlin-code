"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:28001";

type RawRecord = Record<string, unknown> | null;
type RawCollection = Array<Record<string, unknown>> | null;

type Attachment = {
  id: string;
  attachment_type: string;
  bucket: string;
  object_key: string;
  file_name: string;
  mime_type: string;
  file_size: number | null;
  checksum: string;
  upload_status: string;
  source_updated_at: string | null;
  synced_at: string | null;
  public_url: string;
};

type TransactionDetail = {
  transaction: {
    id: string;
    source_id: string;
    transaction_no: string;
    plate_no: string;
    vehicle_class: string;
    operator_name: string;
    location_lat: number | null;
    location_lng: number | null;
    location_address: string;
    total_weight: number | null;
    length_mm: number | null;
    width_mm: number | null;
    height_mm: number | null;
    axle_count: number | null;
    violation_status: string;
    violation_notes: string;
    enforcement_started_at: string | null;
    enforcement_finished_at: string | null;
    source_updated_at: string | null;
    synced_at: string | null;
    completeness_status: string;
    missing_sources: string[];
    verification_status: string;
    actual_data_origin: string;
  };
  site: {
    site_code: string;
    site_name: string;
    city: string;
    province: string;
    operational_status: string;
    active_operator_name: string;
    last_seen_at: string | null;
    last_sync_at: string | null;
  };
  raw: {
    session: RawRecord;
    session_sources: RawCollection;
    anpr: RawRecord;
    axle: RawRecord;
    cctv: RawRecord;
    dimension: RawRecord;
    weighing: RawRecord;
    vehicle_actual: RawRecord;
    vehicle_status: RawRecord;
    revisions: RawCollection;
  };
  attachments: Attachment[];
};

type DetailField = {
  label: string;
  value: ReactNode;
};

type MediaItem = {
  title: string;
  subtitle: string;
  url: string;
  type: "image" | "video" | "file";
};

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNumber(value?: string | number | null, fractionDigits = 2) {
  if (value === null || value === undefined || value === "") return "-";
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return "-";
  return numberValue.toLocaleString("id-ID", {
    maximumFractionDigits: fractionDigits,
  });
}

function formatWeight(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `${formatNumber(value / 1000)} ton`;
}

function googleMapsEmbedUrl(latitude: number, longitude: number) {
  const coordinates = `${latitude},${longitude}`;
  return `https://www.google.com/maps?q=${encodeURIComponent(coordinates)}&z=17&output=embed`;
}

function formatDimensions(detail?: TransactionDetail | null) {
  const length = detail?.transaction.length_mm;
  const width = detail?.transaction.width_mm;
  const height = detail?.transaction.height_mm;
  if (length === null || length === undefined || width === null || width === undefined || height === null || height === undefined) {
    return "-";
  }
  return `${formatNumber(length, 1)} x ${formatNumber(width, 1)} x ${formatNumber(height, 1)} m`;
}

function formatBytes(value: number | null) {
  if (!value) return "-";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function valueFrom(record: RawRecord, key: string) {
  const value = record?.[key];
  if (value === null || value === undefined || value === "") return "-";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function statusLabel(status?: string | null) {
  if (status === "verified") return "Terverifikasi";
  if (status === "rejected") return "Ditolak";
  if (status === "normal") return "Normal";
  if (status === "violation") return "Pelanggaran";
  if (status === "draft") return "Draf";
  return "Menunggu";
}

function statusTone(status?: string | null) {
  if (status === "verified") return "bg-emerald-50 text-emerald-700";
  if (status === "rejected") return "bg-red-50 text-red-700";
  if (status === "draft") return "bg-sky-50 text-sky-700";
  return "bg-amber-50 text-amber-700";
}

function sourceStatusTone(status: string) {
  const value = status.toUpperCase();
  if (value === "RECEIVED" || value === "MANUAL") return "bg-emerald-50 text-emerald-700";
  if (value === "FAILED" || value === "TIMEOUT") return "bg-red-50 text-red-700";
  if (value === "SKIPPED") return "bg-slate-100 text-slate-600";
  return "bg-amber-50 text-amber-700";
}

function violationLabel(detail?: TransactionDetail | null) {
  const status = detail?.transaction.violation_status ?? "pending";
  if (status === "normal") return "Normal";
  if (status === "pending" || status === "draft") return "Menunggu";
  return detail?.transaction.violation_notes || "Pelanggaran";
}

function violationTone(value: string) {
  if (value === "Normal") return "bg-emerald-50 text-emerald-700";
  if (value === "Menunggu") return "bg-amber-50 text-amber-700";
  if (value.includes("&")) return "bg-purple-50 text-purple-700";
  if (value.toLowerCase().includes("loading")) return "bg-red-50 text-red-700";
  return "bg-orange-50 text-orange-700";
}

function isVideoAttachment(attachment: Attachment) {
  return (
    attachment.mime_type.startsWith("video/") ||
    /\.(mp4|webm|ogg|mov|m4v)$/i.test(attachment.object_key)
  );
}

function isImageAttachment(attachment: Attachment) {
  return (
    attachment.mime_type.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(attachment.object_key)
  );
}

function attachmentTypeLabel(value: string) {
  const words: Record<string, string> = {
    anpr: "ANPR",
    axle: "Gandar",
    cctv: "CCTV",
    dimension: "Dimensi",
    weighing: "Penimbangan",
    wim: "WIM",
    vehicle: "Kendaraan",
    actual: "Aktual",
    status: "Status",
    capture: "Tangkapan",
    image: "Gambar",
    photo: "Foto",
    video: "Video",
    file: "File",
    front: "Depan",
    rear: "Belakang",
    side: "Samping",
  };

  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => words[word.toLowerCase()] ?? word)
    .join(" ");
}

function uploadStatusLabel(value: string) {
  const status = value.toLowerCase();
  if (["completed", "complete", "uploaded", "synced", "success"].includes(status)) {
    return "Selesai";
  }
  if (["failed", "error"].includes(status)) return "Gagal";
  if (["uploading", "syncing", "processing"].includes(status)) {
    return "Diproses";
  }
  if (status === "pending") return "Menunggu";
  return attachmentTypeLabel(value);
}

function mediaItems(attachments: Attachment[]): MediaItem[] {
  return attachments
    .filter((attachment) => isImageAttachment(attachment) || isVideoAttachment(attachment))
    .map((attachment) => ({
      title: attachmentTypeLabel(attachment.attachment_type),
      subtitle: attachment.file_name || `${attachment.bucket}/${attachment.object_key}`,
      url: attachment.public_url,
      type: isVideoAttachment(attachment) ? "video" : "image",
    }));
}

function FieldGrid({ fields }: { fields: DetailField[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {fields.map((field) => (
        <div key={field.label}>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            {field.label}
          </p>
          <div className="min-h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold leading-5 text-slate-800">
            {field.value || "-"}
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-base font-extrabold text-slate-950">{title}</p>
        {subtitle ? (
          <p className="mt-0.5 text-sm font-medium text-slate-500">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function MediaPreview({ item }: { item: MediaItem }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-slate-900">
            {item.title}
          </p>
          <p className="truncate text-xs font-semibold text-slate-500">
            {item.subtitle}
          </p>
        </div>
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700"
        >
          Buka
        </a>
      </div>
      <div className="relative h-56 w-full bg-slate-100">
        {item.type === "video" ? (
          <video src={item.url} controls className="h-full w-full object-cover" />
        ) : (
          <Image
            src={item.url}
            alt={item.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            unoptimized
          />
        )}
      </div>
    </div>
  );
}

function SourceBlock({ title, fields }: { title: string; fields: DetailField[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="mb-3 text-sm font-extrabold text-slate-950">{title}</p>
      <FieldGrid fields={fields} />
    </div>
  );
}

function RawSection({ title, record }: { title: string; record: RawRecord }) {
  return (
    <details className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <summary className="cursor-pointer px-4 py-3 text-sm font-extrabold text-slate-900">
        {title}
      </summary>
      {record ? (
        <pre className="max-h-72 overflow-auto border-t border-slate-100 bg-slate-950 p-4 text-xs font-semibold leading-5 text-slate-100">
          {JSON.stringify(record, null, 2)}
        </pre>
      ) : (
        <p className="border-t border-slate-100 px-4 py-5 text-sm font-semibold text-slate-500">
          Data belum tersinkron untuk modul ini.
        </p>
      )}
    </details>
  );
}

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const transactionID = params.id;
  const [detail, setDetail] = useState<TransactionDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("dc_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(`${API_BASE_URL}/api/data-center/transactions/${transactionID}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const body = await response.text();
        let payload: TransactionDetail | { error?: string };
        try {
          payload = body ? JSON.parse(body) : {};
        } catch {
          throw new Error(body || "Respons detail transaksi tidak valid");
        }
        if (!response.ok) {
          const errorMessage = "error" in payload ? payload.error : undefined;
          throw new Error(errorMessage || "Gagal mengambil detail transaksi");
        }
        setDetail(payload as TransactionDetail);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Gagal mengambil detail transaksi",
        );
      })
      .finally(() => setLoading(false));
  }, [router, transactionID]);

  const violation = violationLabel(detail);
  const latestStatus = detail?.transaction.verification_status.toLowerCase() ?? "pending";
  const evidence = useMemo(
    () => mediaItems(detail?.attachments ?? []),
    [detail?.attachments],
  );

  const metrics = detail
    ? [
        {
          label: "Nomor Polisi",
          value: detail.transaction.plate_no || "-",
          helper: "Terdeteksi oleh ANPR",
          tone: "bg-blue-50 text-blue-700",
        },
        {
          label: "Berat Aktual",
          value: formatWeight(detail.transaction.total_weight),
          helper: "Berat aktual kendaraan",
          tone: "bg-red-50 text-red-700",
        },
        {
          label: "Gandar Aktual",
          value: String(detail.transaction.axle_count ?? "-"),
          helper: "Hasil sensor gandar",
          tone: "bg-emerald-50 text-emerald-700",
        },
        {
          label: "Dimensi",
          value: formatDimensions(detail),
          helper: "Panjang x lebar x tinggi",
          tone: "bg-violet-50 text-violet-700",
        },
      ]
    : [];

  return (
    <main className="min-h-screen bg-[#eef2f7] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/data-center"
              className="mb-2 inline-flex text-sm font-black text-blue-700 hover:text-blue-800"
            >
              Kembali ke Data Center
            </Link>
            <h1 className="text-3xl font-black tracking-tight">
              Detail Transaksi Data Center
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Data transaksi, catatan sumber, dan lampiran tersinkron hanya-baca.
            </p>
          </div>
        </div>
      </header>

      <section className="p-6">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
            Memuat detail transaksi...
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        {detail ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl font-black text-blue-700">
                    T
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-mono text-2xl font-black tracking-tight text-slate-950">
                        {detail.transaction.plate_no || "-"}
                      </h2>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${violationTone(violation)}`}
                      >
                        {violation}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone(latestStatus)}`}
                      >
                        {statusLabel(latestStatus)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Tersinkron {formatDateTime(detail.transaction.synced_at)} dari{" "}
                      {detail.site.site_code} - {detail.site.site_name}
                    </p>
                  </div>
                </div>

                <Link
                  href="/data-center"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Kembali
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className={`mb-3 inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${metric.tone}`}>
                    {metric.label}
                  </div>
                  <p className="text-xl font-black text-slate-950">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {metric.helper}
                  </p>
                </div>
              ))}
            </div>

            <SectionCard
              title="Kelengkapan & Asal Data"
              subtitle="Status final transaksi dan hasil independen dari setiap sumber."
            >
              <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <FieldGrid
                  fields={[
                    { label: "Kelengkapan", value: detail.transaction.completeness_status },
                    { label: "Asal Nilai Aktual", value: detail.transaction.actual_data_origin },
                  ]}
                />
                <div className="md:col-span-2">
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Sumber Tidak Tersedia</p>
                  <div className="min-h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800">
                    {detail.transaction.missing_sources.length > 0
                      ? detail.transaction.missing_sources.join(", ")
                      : "Tidak ada"}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {(detail.raw.session_sources ?? []).map((source) => {
                  const sourceType = String(source.source_type ?? "UNKNOWN");
                  const sourceStatus = String(source.source_status ?? "WAITING");
                  return (
                    <div key={sourceType} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-sm font-extrabold text-slate-900">{sourceType}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">Mode {String(source.source_mode ?? "-")}</p>
                      <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${sourceStatusTone(sourceStatus)}`}>
                        {sourceStatus}
                      </span>
                      {source.error_message ? <p className="mt-2 text-xs font-semibold text-red-600">{String(source.error_message)}</p> : null}
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <SectionCard
                title="Pratinjau Bukti"
                subtitle="Media tersinkron dari ANPR, gandar, dan lampiran situs."
              >
                {evidence.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {evidence.map((item) => (
                      <MediaPreview key={`${item.title}-${item.url}`} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm font-semibold text-slate-500">
                    Tidak ada media bukti yang tersedia.
                  </div>
                )}
              </SectionCard>

              <div className="space-y-4">
                <SectionCard title="Ringkasan Transaksi">
                  <div className="space-y-3">
                    <FieldGrid
                      fields={[
                        { label: "Site", value: `${detail.site.site_code} - ${detail.site.site_name}` },
                        { label: "Waktu Kejadian", value: formatDateTime(detail.transaction.enforcement_started_at) },
                      ]}
                    />

                    {detail.transaction.location_lat !== null &&
                    detail.transaction.location_lng !== null ? (
                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <iframe
                          title={`Lokasi transaksi ${detail.transaction.plate_no || detail.transaction.source_id}`}
                          src={googleMapsEmbedUrl(
                            detail.transaction.location_lat,
                            detail.transaction.location_lng,
                          )}
                          className="h-72 w-full"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm font-semibold text-slate-500">
                        Koordinat lokasi transaksi belum tersedia.
                      </div>
                    )}
                  </div>
                </SectionCard>

                <SectionCard title="Verifikasi Terbaru">
                  <div className="space-y-3">
                    <div>
                      <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                        Status
                      </p>
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-sm font-bold ${statusTone(latestStatus)}`}
                      >
                        {statusLabel(latestStatus)}
                      </span>
                    </div>
                    <FieldGrid
                      fields={[
                        { label: "Hasil", value: detail.transaction.violation_notes || violation },
                        { label: "Catatan", value: valueFrom(detail.raw.vehicle_status, "notes") },
                      ]}
                    />
                  </div>
                </SectionCard>
              </div>
            </div>

            <SectionCard
              title="Lampiran"
              subtitle="File disalin dari MinIO situs ke MinIO data-center."
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] text-sm">
                  <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    <tr>
                      <th className="px-4 py-3 text-left">Tipe</th>
                      <th className="px-4 py-3 text-left">File</th>
                      <th className="px-4 py-3 text-left">Ukuran</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Tersinkron</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detail.attachments.length > 0 ? (
                      detail.attachments.map((attachment) => (
                        <tr key={attachment.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-700">
                            {attachmentTypeLabel(attachment.attachment_type)}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800">
                              {attachment.file_name || "-"}
                            </p>
                            <p className="mt-1 max-w-[560px] truncate text-xs font-semibold text-slate-400">
                              {attachment.bucket}/{attachment.object_key}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {formatBytes(attachment.file_size)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                              {uploadStatusLabel(attachment.upload_status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {formatDateTime(attachment.synced_at)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <a
                              href={attachment.public_url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                            >
                              Buka
                            </a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm font-semibold text-slate-500">
                          Belum ada lampiran untuk transaksi ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard
              title="Data Sumber"
              subtitle="Data hanya-baca yang tersinkron dari tiap perangkat terhubung."
            >
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SourceBlock
                  title="ANPR"
                  fields={[
                    { label: "Nomor Polisi", value: valueFrom(detail.raw.anpr, "plate_no") },
                    { label: "Tingkat Keyakinan", value: valueFrom(detail.raw.anpr, "confidence") },
                    { label: "ID Kamera", value: valueFrom(detail.raw.anpr, "camera_id") },
                    { label: "Waktu Tertangkap", value: formatDateTime(valueFrom(detail.raw.anpr, "captured_at")) },
                  ]}
                />
                <SourceBlock
                  title="Gandar"
                  fields={[
                    { label: "Nomor Polisi", value: valueFrom(detail.raw.axle, "plate_no") },
                    { label: "Total Gandar", value: valueFrom(detail.raw.axle, "total_axles") },
                    { label: "Total Roda", value: valueFrom(detail.raw.axle, "total_wheels") },
                    { label: "Tipe Kendaraan", value: valueFrom(detail.raw.axle, "vehicle_body_type") },
                  ]}
                />
                <SourceBlock
                  title="WIM"
                  fields={[
                    { label: "Total Berat", value: valueFrom(detail.raw.weighing, "total_weight") },
                    { label: "Total Gandar", value: valueFrom(detail.raw.weighing, "total_axle") },
                    { label: "Waktu Dibuat", value: formatDateTime(valueFrom(detail.raw.weighing, "created_date")) },
                    { label: "Sesi", value: valueFrom(detail.raw.session, "code") },
                  ]}
                />
                <SourceBlock
                  title="Dimensi"
                  fields={[
                    { label: "Panjang", value: valueFrom(detail.raw.dimension, "length") },
                    { label: "Lebar", value: valueFrom(detail.raw.dimension, "width") },
                    { label: "Tinggi", value: valueFrom(detail.raw.dimension, "height") },
                    { label: "Waktu Dibuat", value: formatDateTime(valueFrom(detail.raw.dimension, "created_date")) },
                  ]}
                />
              </div>
            </SectionCard>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <details className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <summary className="cursor-pointer px-4 py-3 text-sm font-extrabold text-slate-900">
                  Riwayat Koreksi ({detail.raw.revisions?.length ?? 0})
                </summary>
                <pre className="max-h-72 overflow-auto border-t border-slate-100 bg-slate-950 p-4 text-xs font-semibold leading-5 text-slate-100">
                  {JSON.stringify(detail.raw.revisions ?? [], null, 2)}
                </pre>
              </details>
              <RawSection title="Data Mentah Kendaraan Aktual" record={detail.raw.vehicle_actual} />
              <RawSection title="Data Mentah Status Kendaraan" record={detail.raw.vehicle_status} />
              <RawSection title="Data Mentah Tangkapan ANPR" record={detail.raw.anpr} />
              <RawSection title="Data Mentah Tangkapan AXLE" record={detail.raw.axle} />
              <RawSection title="Data Mentah Dimensi" record={detail.raw.dimension} />
              <RawSection title="Data Mentah Penimbangan" record={detail.raw.weighing} />
              <RawSection title="Data Mentah CCTV" record={detail.raw.cctv} />
              <RawSection title="Data Mentah Sesi WIM" record={detail.raw.session} />
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
