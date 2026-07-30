"use client";

import { use } from "react";
import { JatanlinVerifyModule } from "@/src/modules/jatanlin/verify";
import { V3DefaultPage } from "@/src/modules/v3/shared/DefaultPage";

export default function V3JatanlinVerifyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <V3DefaultPage
      title="Verifikasi Jatanlin"
      breadcrumbs={[
        { label: "Transaksi" },
        { label: "Jatanlin", href: "/transaction/jatanlin" },
        { label: "Verifikasi" },
      ]}
      description="Verifikasi data sumber, data aktual kendaraan, bukti, dan hasil pelanggaran."
    >
      <div className="v3-legacy-page v3-jatanlin-workflow h-full">
        <JatanlinVerifyModule id={id} hideHeader />
      </div>
    </V3DefaultPage>
  );
}
