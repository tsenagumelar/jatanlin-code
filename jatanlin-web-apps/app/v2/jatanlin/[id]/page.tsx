"use client";

import { use } from "react";
import { V2JatanlinDetailModule } from "@/src/modules/v2/jatanlin/detail";

export default function V2JatanlinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <V2JatanlinDetailModule id={id} />;
}
