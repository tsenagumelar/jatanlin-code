"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft20Regular,
  CheckmarkCircle20Regular,
  Image20Regular,
  Print20Regular,
  VehicleTruckProfile24Regular,
} from "@fluentui/react-icons";
import {
  isPrintableViolation,
  printViolationSticker,
} from "@/src/utils/violationPrint";
import { V3DefaultPage } from "../../../shared/DefaultPage";
import { useV3JatanlinDetail } from "./hooks";
import type { V3DetailField, V3JatanlinDetailProps, V3MediaItem } from "./types";

function FieldGrid({ fields }: { fields: V3DetailField[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {fields.map((field) => (
        <div key={field.label}>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            {field.label}
          </p>
          <div className="min-h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold leading-5 text-slate-800">
            {field.value}
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
        {subtitle && (
          <p className="mt-0.5 text-sm font-medium text-slate-500">
            {subtitle}
          </p>
        )}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function MediaPreview({ item }: { item: V3MediaItem }) {
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
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <Image20Regular />
        </div>
      </div>
      <div className="relative h-56 w-full bg-slate-100">
        {item.type === "video" ? (
          <video
            src={item.url}
            controls
            className="h-full w-full object-cover"
          />
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

function SourceBlock({
  title,
  fields,
}: {
  title: string;
  fields: V3DetailField[];
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="mb-3 text-sm font-extrabold text-slate-950">{title}</p>
      <FieldGrid fields={fields} />
    </div>
  );
}

export function V3JatanlinDetailPage({ id }: V3JatanlinDetailProps) {
  const detail = useV3JatanlinDetail({ id });
  const canPrintViolation =
    detail.latestStatus?.status === "verified" &&
    isPrintableViolation(detail.latestStatus?.result || detail.violation);

  return (
    <V3DefaultPage
      title="Jatanlin Detail"
      breadcrumbs={[
        { label: "Transaction" },
        { label: "Jatanlin", href: "/transaction/jatanlin" },
        { label: "Detail" },
      ]}
      description="Review vehicle transaction data, evidence, and verification status."
    >
      {detail.error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {detail.error}
        </div>
      )}

      {detail.isLoading && !detail.record ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
          Loading Jatanlin detail...
        </div>
      ) : !detail.record ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <VehicleTruckProfile24Regular className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="text-base font-bold text-slate-900">
            Transaction not found
          </p>
          <p className="mt-1 text-sm font-medium text-slate-500">
            The selected Jatanlin transaction could not be loaded.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <VehicleTruckProfile24Regular className="h-7 w-7" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-mono text-2xl font-black tracking-tight text-slate-950">
                      {detail.getPlate(detail.record)}
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${detail.getViolationTone(detail.violation)}`}
                    >
                      {detail.violation}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${detail.getStatusTone(detail.latestStatus?.status)}`}
                    >
                      {detail.getStatusLabel(detail.latestStatus?.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Created {detail.formatDateTime(detail.record.created_date)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/transaction/jatanlin"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <ArrowLeft20Regular />
                  Back
                </Link>
                {canPrintViolation && (
                  <button
                    type="button"
                    onClick={() =>
                      printViolationSticker({
                        plateNo: detail.getPlate(detail.record),
                        violationType:
                          detail.latestStatus?.result || detail.violation,
                      })
                    }
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 text-sm font-bold text-white transition hover:bg-red-800"
                  >
                    <Print20Regular />
                    Print Violation
                  </button>
                )}
                {(detail.latestStatus?.status === "pending" ||
                  detail.latestStatus?.status === "draft" ||
                  !detail.latestStatus?.status) && (
                  <Link
                    href={`/transaction/jatanlin/verify/${detail.record.id}`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800"
                  >
                    <CheckmarkCircle20Regular />
                    Verify
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {detail.metrics.map((metric) => (
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

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <SectionCard
              title="Evidence Preview"
              subtitle="Captured media from ANPR, axle, and CCTV devices."
            >
              {detail.mediaItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {detail.mediaItems.map((item) => (
                    <MediaPreview key={`${item.title}-${item.url}`} item={item} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm font-semibold text-slate-500">
                  No evidence media available.
                </div>
              )}
            </SectionCard>

            <div className="space-y-4">
              <SectionCard title="Transaction Summary">
                <FieldGrid fields={detail.summaryFields} />
              </SectionCard>

              <SectionCard title="Latest Verification">
                <div className="space-y-3">
                  <div>
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Status
                    </p>
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-sm font-bold ${detail.getStatusTone(detail.latestStatus?.status)}`}
                    >
                      {detail.getStatusLabel(detail.latestStatus?.status)}
                    </span>
                  </div>
                  <FieldGrid
                    fields={[
                      {
                        label: "Result",
                        value: detail.latestStatus?.result || detail.violation,
                      },
                      {
                        label: "Notes",
                        value: detail.latestStatus?.notes || "-",
                      },
                    ]}
                  />
                </div>
              </SectionCard>
            </div>
          </div>

          <SectionCard
            title="Source Data"
            subtitle="Read-only data from each connected device."
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SourceBlock title="ANPR" fields={detail.sourceFields.anpr} />
              <SourceBlock title="Axle" fields={detail.sourceFields.axle} />
              <SourceBlock title="WIM" fields={detail.sourceFields.wim} />
              <SourceBlock
                title="Dimension"
                fields={detail.sourceFields.dimension}
              />
            </div>
          </SectionCard>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-base font-extrabold text-slate-950">
                Status History
              </p>
              <p className="mt-0.5 text-sm font-medium text-slate-500">
                Verification trail for this transaction.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Result</th>
                    <th className="px-4 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detail.record.transact_vehicle_statuses.length > 0 ? (
                    detail.record.transact_vehicle_statuses.map((status, index) => (
                      <tr key={status.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {detail.formatDateTime(status.created_date)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${detail.getStatusTone(status.status)}`}
                          >
                            {detail.getStatusLabel(status.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {status.result || "-"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {status.notes || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm font-semibold text-slate-500">
                        No status history available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </V3DefaultPage>
  );
}
