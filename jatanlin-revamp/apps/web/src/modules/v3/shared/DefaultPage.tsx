"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowClockwise20Regular } from "@fluentui/react-icons";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface V3DefaultPageProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  description?: string;
  children?: ReactNode;
}

export function V3DefaultPage({
  title,
  breadcrumbs,
  description,
  children,
}: V3DefaultPageProps) {
  const lastUpdated = new Date().toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <section className="min-h-full w-full">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <nav className="mb-2 flex flex-wrap items-center gap-1 text-sm font-semibold text-slate-500">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <span
                  key={`${item.label}-${index}`}
                  className="flex items-center gap-1"
                >
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="text-blue-700 hover:text-blue-800"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "text-slate-700" : ""}>
                      {item.label}
                    </span>
                  )}
                  {!isLast && <span className="text-slate-300">/</span>}
                </span>
              );
            })}
          </nav>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
              {description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-500 shadow-sm">
          <ArrowClockwise20Regular className="h-4 w-4 text-blue-700" />
          <span>Terakhir diperbarui</span>
          <span className="text-slate-800">{lastUpdated}</span>
        </div>
      </header>

      {children || (
        <div className="min-h-[520px] w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Halaman {title} tersedia di routing v3. Implementasi fitur akan
            dilanjutkan sesuai spesifikasi.
          </p>
        </div>
      )}
    </section>
  );
}
