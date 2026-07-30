"use client";

import Link from "next/link";
import { Button, Text } from "@/src/components/atoms";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg border border-[#e0e0e0]">
        <div className="text-6xl mb-4">404</div>
        <h2 className="text-2xl font-bold text-[#323130] mb-4">
          Halaman Tidak Ditemukan
        </h2>
        <Text size={400} className="mb-6 text-[#605e5c]">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </Text>
        <Link href="/">
          <Button variant="primary">Kembali ke Beranda</Button>
        </Link>
      </div>
    </div>
  );
}
