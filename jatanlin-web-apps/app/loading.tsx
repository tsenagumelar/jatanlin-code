'use client';

import { Spinner } from '@/src/components/atoms';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="text-center">
        <Spinner size="large" />
        <p className="mt-4 text-lg text-[#605e5c]">Memuat...</p>
      </div>
    </div>
  );
}
