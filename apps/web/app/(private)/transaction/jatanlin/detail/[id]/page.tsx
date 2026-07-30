"use client";

import { use } from "react";
import { V3JatanlinDetailPage } from "@/src/modules/v3/transaction/jatanlin/detail";

export default function V3JatanlinDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <V3JatanlinDetailPage id={id} />;
}
