"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:28001";

type RawRecord = Record<string, unknown> | null;

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
    anpr: RawRecord;
    axle: RawRecord;
    cctv: RawRecord;
    dimension: RawRecord;
    weighing: RawRecord;
    vehicle_actual: RawRecord;
    vehicle_status: RawRecord;
  };
  attachments: Array<{
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
  }>;
};

function formatDateTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNumber(value: number | null, suffix = "") {
  if (value === null || Number.isNaN(value)) return "-";
  return `${new Intl.NumberFormat("id-ID").format(value)}${suffix}`;
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

function InfoCard({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: string | number }>;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3"
          >
            <span className="text-sm font-black uppercase tracking-wide text-slate-400">
              {item.label}
            </span>
            <span className="max-w-[60%] text-right text-base font-black text-slate-800">
              {item.value || "-"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RawSection({ title, record }: { title: string; record: RawRecord }) {
  if (!record) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-900">{title}</h2>
        <p className="mt-3 text-sm font-semibold text-slate-400">
          Data belum tersinkron untuk modul ini.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-slate-900">{title}</h2>
      <pre className="mt-3 max-h-72 overflow-auto rounded-xl bg-slate-950 p-4 text-xs font-semibold leading-5 text-slate-100">
        {JSON.stringify(record, null, 2)}
      </pre>
    </section>
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
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Gagal mengambil detail transaksi");
        }
        setDetail(payload);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Gagal mengambil detail transaksi",
        );
      })
      .finally(() => setLoading(false));
  }, [router, transactionID]);

  const violationLabel = useMemo(() => {
    const status = detail?.transaction.violation_status ?? "pending";
    if (status === "normal") return "Normal";
    if (status === "pending") return "Pending";
    return "Violation";
  }, [detail]);

  return (
    <main className="min-h-screen bg-[#eef2f7] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => router.push("/data-center")}
              className="mb-2 text-sm font-black text-blue-700 hover:text-blue-800"
            >
              ← Kembali ke Data Center
            </button>
            <h1 className="text-3xl font-black tracking-tight">
              Detail Transaksi
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Data hasil sync dari site, termasuk source raw dan attachment.
            </p>
          </div>

          {detail ? (
            <span
              className={`rounded-full px-4 py-2 text-sm font-black ${
                detail.transaction.violation_status === "normal"
                  ? "bg-emerald-50 text-emerald-700"
                  : detail.transaction.violation_status === "pending"
                    ? "bg-slate-100 text-slate-600"
                    : "bg-red-50 text-red-700"
              }`}
            >
              {violationLabel}
            </span>
          ) : null}
        </div>
      </header>

      <section className="p-6">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-base font-bold text-slate-500 shadow-sm">
            Memuat detail transaksi...
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-base font-bold text-red-700">
            {error}
          </div>
        ) : null}

        {detail ? (
          <div className="space-y-5">
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-black uppercase tracking-wide text-slate-400">
                  Plate No
                </p>
                <p className="mt-2 text-4xl font-black text-slate-950">
                  {detail.transaction.plate_no || "-"}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  {detail.transaction.source_id}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-black uppercase tracking-wide text-slate-400">
                  Site
                </p>
                <p className="mt-2 text-3xl font-black text-slate-950">
                  {detail.site.site_code}
                </p>
                <p className="mt-2 text-base font-bold text-slate-500">
                  {detail.site.site_name}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-black uppercase tracking-wide text-slate-400">
                  Total Weight
                </p>
                <p className="mt-2 text-4xl font-black text-slate-950">
                  {formatNumber(detail.transaction.total_weight, " kg")}
                </p>
                <p className="mt-2 text-base font-bold text-slate-500">
                  {detail.transaction.axle_count ?? "-"} axle
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-black uppercase tracking-wide text-slate-400">
                  Synced At
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {formatDateTime(detail.transaction.synced_at)}
                </p>
                <p className="mt-2 text-base font-bold text-slate-500">
                  {detail.attachments.length} attachment
                </p>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <InfoCard
                title="Transaksi"
                items={[
                  {
                    label: "Waktu Penindakan",
                    value: formatDateTime(
                      detail.transaction.enforcement_started_at,
                    ),
                  },
                  {
                    label: "Operator",
                    value: detail.transaction.operator_name || "-",
                  },
                  {
                    label: "Status",
                    value: detail.transaction.violation_status,
                  },
                  {
                    label: "Catatan",
                    value: detail.transaction.violation_notes || "-",
                  },
                ]}
              />
              <InfoCard
                title="Pengukuran"
                items={[
                  {
                    label: "Panjang",
                    value: formatNumber(detail.transaction.length_mm, " mm"),
                  },
                  {
                    label: "Lebar",
                    value: formatNumber(detail.transaction.width_mm, " mm"),
                  },
                  {
                    label: "Tinggi",
                    value: formatNumber(detail.transaction.height_mm, " mm"),
                  },
                  {
                    label: "Kelas",
                    value: detail.transaction.vehicle_class || "-",
                  },
                ]}
              />
              <InfoCard
                title="Lokasi & Site"
                items={[
                  {
                    label: "Lokasi",
                    value:
                      detail.transaction.location_address ||
                      `${detail.site.city}, ${detail.site.province}`,
                  },
                  {
                    label: "Koordinat",
                    value:
                      detail.transaction.location_lat &&
                      detail.transaction.location_lng
                        ? `${detail.transaction.location_lat}, ${detail.transaction.location_lng}`
                        : "-",
                  },
                  {
                    label: "Status Site",
                    value: detail.site.operational_status,
                  },
                  {
                    label: "Last Sync",
                    value: formatDateTime(detail.site.last_sync_at),
                  },
                ]}
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-xl font-black text-slate-950">
                  Attachment
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  File evidence yang sudah dikirim dari MinIO site ke MinIO data
                  center.
                </p>
              </div>
              <div className="overflow-auto">
                <table className="w-full min-w-[960px] text-sm">
                  <thead className="bg-slate-50 uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-5 py-3 text-left">Type</th>
                      <th className="px-5 py-3 text-left">File</th>
                      <th className="px-5 py-3 text-left">Size</th>
                      <th className="px-5 py-3 text-left">Status</th>
                      <th className="px-5 py-3 text-left">Synced</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detail.attachments.length > 0 ? (
                      detail.attachments.map((attachment) => (
                        <tr key={attachment.id}>
                          <td className="px-5 py-4 font-black text-slate-700">
                            {attachment.attachment_type}
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-700">
                              {attachment.file_name || "-"}
                            </p>
                            <p className="mt-1 max-w-[520px] truncate text-xs font-semibold text-slate-400">
                              {attachment.bucket}/{attachment.object_key}
                            </p>
                          </td>
                          <td className="px-5 py-4 font-bold text-slate-600">
                            {formatBytes(attachment.file_size)}
                          </td>
                          <td className="px-5 py-4">
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                              {attachment.upload_status}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-slate-600">
                            {formatDateTime(attachment.synced_at)}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <a
                              href={attachment.public_url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700"
                            >
                              Open
                            </a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-8 text-center font-bold text-slate-400"
                        >
                          Belum ada attachment untuk transaksi ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <InfoCard
                title="ANPR"
                items={[
                  { label: "Plate", value: valueFrom(detail.raw.anpr, "plate_no") },
                  {
                    label: "Confidence",
                    value: valueFrom(detail.raw.anpr, "confidence"),
                  },
                  {
                    label: "Captured",
                    value: formatDateTime(
                      (detail.raw.anpr?.captured_at as string | undefined) ??
                        null,
                    ),
                  },
                  {
                    label: "Camera",
                    value: valueFrom(detail.raw.anpr, "camera_id"),
                  },
                ]}
              />
              <InfoCard
                title="AXLE / WIM"
                items={[
                  {
                    label: "Axle",
                    value: valueFrom(detail.raw.axle, "total_axles"),
                  },
                  {
                    label: "Wheels",
                    value: valueFrom(detail.raw.axle, "total_wheels"),
                  },
                  {
                    label: "Category",
                    value: valueFrom(detail.raw.axle, "vehicle_category"),
                  },
                  {
                    label: "Weight",
                    value: valueFrom(detail.raw.weighing, "total_weight"),
                  },
                ]}
              />
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <RawSection title="Raw Vehicle Actual" record={detail.raw.vehicle_actual} />
              <RawSection title="Raw Vehicle Status" record={detail.raw.vehicle_status} />
              <RawSection title="Raw ANPR Capture" record={detail.raw.anpr} />
              <RawSection title="Raw AXLE Capture" record={detail.raw.axle} />
              <RawSection title="Raw Dimension" record={detail.raw.dimension} />
              <RawSection title="Raw Weighing" record={detail.raw.weighing} />
              <RawSection title="Raw CCTV" record={detail.raw.cctv} />
              <RawSection title="Raw WIM Session" record={detail.raw.session} />
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
