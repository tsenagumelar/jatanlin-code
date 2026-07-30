"use client";

import React from "react";
import Link from "next/link";
import { Wrench24Regular, ArrowLeft20Regular } from "@fluentui/react-icons";

interface ComingSoonProps {
  title: string;
  description?: string;
  existingHref?: string;
  existingLabel?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description = "Halaman ini sedang dalam pengembangan untuk tampilan v2.",
  existingHref,
  existingLabel = "Buka di tampilan lama",
}) => (
  <div className="p-6">
    <h1 className="text-xl font-bold text-slate-800 mb-6">{title}</h1>
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm max-w-md">
      <div className="p-8 text-center">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Wrench24Regular className="w-7 h-7 text-blue-500" />
        </div>
        <h2 className="font-semibold text-slate-700 mb-2">Segera Hadir</h2>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">{description}</p>
        {existingHref && (
          <Link
            href={existingHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600
                       hover:text-blue-800 border border-blue-200 hover:border-blue-400
                       px-4 py-2 rounded-lg transition-all"
          >
            <ArrowLeft20Regular className="w-4 h-4" />
            {existingLabel}
          </Link>
        )}
      </div>
    </div>
  </div>
);

export default ComingSoon;
