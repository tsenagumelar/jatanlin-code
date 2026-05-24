"use client";

import { ComingSoon } from "@/src/modules/v2/shared/ComingSoon";

export default function V2PanduanPage() {
  return (
    <ComingSoon
      title="Panduan"
      description="Panduan penggunaan sistem v2 sedang disusun."
      existingHref="/panduan"
      existingLabel="Buka Panduan (v1)"
    />
  );
}
