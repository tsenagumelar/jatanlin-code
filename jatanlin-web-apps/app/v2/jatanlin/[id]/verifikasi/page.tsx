"use client";

import { use } from "react";
import { V2VerifikasiModule } from "@/src/modules/v2/jatanlin/verifikasi";

export default function V2VerifikasiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <V2VerifikasiModule id={id} />;
}
